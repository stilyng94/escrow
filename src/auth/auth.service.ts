import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User, VerificationToken } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserDto,
  TokenPayloadDto,
  VerificationTypes,
  verifyAccountDto,
} from './auth.dto';
import { EnvServiceDto } from '@/config/env.service';
import { UserWithRoleDto } from '@/user/user.dto';
import { OTP_WINDOW } from '@/utils/utils';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly envServiceDto: EnvServiceDto,
    private readonly userService: UserService,
  ) {}

  async authenticateUser(phoneNumber: string) {
    const user = await this.userService.getUserByPhoneNumber(phoneNumber);
    if (!user) {
      return this.createUser({ phoneNumber });
    }
    return user;
  }

  async generateAuthTokens({ user }: { user: UserWithRoleDto }) {
    const payload: TokenPayloadDto = {
      id: user.id,
      isVerified: user.isVerified,
    };
    const accessToken = this.setAccessToken(payload);
    const refreshToken = await this.setRefreshToken(payload);
    return { accessToken, refreshToken } as const;
  }

  private setAccessToken(payload: TokenPayloadDto) {
    return this.jwtService.sign(payload, {
      secret: this.envServiceDto.JWT_SECRET,
    });
  }

  private async setRefreshToken(payload: TokenPayloadDto) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.envServiceDto.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
    await this.prismaService.refreshToken.create({
      data: { userId: payload.id, token: refreshToken },
    });
    return refreshToken;
  }

  async getUserByRefreshToken(refreshToken: string, userId: string) {
    const tokenUser = await this.prismaService.refreshToken.findFirst({
      where: { userId, token: refreshToken },
      select: { user: true },
    });
    if (!tokenUser) {
      throw new ForbiddenException('Expired token');
    }
    return tokenUser;
  }

  async logout(user: User) {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  }

  async createVerificationToken({
    period,
    type,
    target,
  }: {
    period: number;
    type: VerificationTypes;
    target: string;
  }) {
    const { generateTOTP } = await import('@epic-web/totp');

    const { otp, ...otpConfig } = generateTOTP({ algorithm: 'SHA256', period });
    // delete old verifications. Users should not have more than one verification
    // of a specific type for a specific target at a time.
    await this.prismaService.verificationToken.deleteMany({
      where: { type, target },
    });
    await this.prismaService.verificationToken.create({
      data: {
        type,
        target,
        algorithm: otpConfig.algorithm,
        digits: otpConfig.digits,
        period: otpConfig.period,
        secret: otpConfig.secret,
        expiresAt: new Date(Date.now() + otpConfig.period * 1000),
      },
    });

    return { otp };
  }

  async getVerificationDetails({
    type,
    target,
  }: {
    type: VerificationTypes;
    target: string;
  }) {
    const verification = await this.prismaService.verificationToken.findFirst({
      where: {
        OR: [
          { type, target, expiresAt: { gt: new Date() } },
          { type, target, expiresAt: null },
        ],
      },
    });
    if (!verification) throw new BadRequestException('invalid code');

    return verification;
  }

  async isCodeValid(verification: VerificationToken, code: string) {
    const { verifyTOTP } = await import('@epic-web/totp');

    const result = verifyTOTP({
      otp: code,
      secret: verification.secret,
      algorithm: verification.algorithm,
      period: verification.period,
      ...OTP_WINDOW[verification.type],
    });

    if (!result) throw new BadRequestException('bomb code');
  }

  private async deleteVerificationCode({
    type,
    target,
  }: {
    type: VerificationTypes;
    target: string;
  }) {
    return this.prismaService.verificationToken.delete({
      where: {
        target_type: {
          type,
          target,
        },
      },
    });
  }

  async completeAuth({
    code,
    type,
    target,
  }: {
    code: string;
    type: VerificationTypes;
    target: string;
  }) {
    const verification = await this.getVerificationDetails({
      target,
      type,
    });
    await this.isCodeValid(verification, code);
    await this.deleteVerificationCode({ target, type });
    const user = await this.userService.getUserByPhoneNumber(target);
    if (!user) {
      throw new BadRequestException('invalid code');
    }

    return this.generateAuthTokens({ user });
  }

  private async createUser(dto: CreateUserDto) {
    const newUser = await this.prismaService.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        role: { connect: { name: 'USER' } },
        wallet: {
          create: {},
        },
      },
    });
    return newUser;
  }

  async verifyAccount({
    userId,
    dto,
  }: {
    userId: string;
    dto: verifyAccountDto;
  }) {
    return await this.prismaService.user.update({
      data: {
        isVerified: true,
        email: dto.email,
        username: dto.first_name,
        wallet: {
          update: {
            where: {
              userId,
            },
            data: {
              isActive: true,
            },
          },
        },
      },
      where: {
        id: userId,
      },
    });
  }
}
