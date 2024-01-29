import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  PaginatedUserResponseDto,
  UserUpdateDto,
  UserWithRoleDto,
} from './user.dto';
import { PaginationParamsDto } from '@/shared/shared.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByPhoneNumber(phoneNumber: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        phoneNumber,
      },
      include: { role: { select: { name: true } } },
    });
    if (!user) {
      throw new NotFoundException(
        `user with phoneNumber ${phoneNumber} not found`,
      );
    }
    return user;
  }

  async getUserById(id: string): Promise<UserWithRoleDto | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } },
    });
  }

  async getUsers(dto: PaginationParamsDto): Promise<PaginatedUserResponseDto> {
    const [count, items] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        take: dto.limit,
        skip: dto.offset,
        cursor: dto.cursor ? { id: dto.cursor } : undefined,
        include: { role: { select: { name: true } } },
      }),
    ]);

    return {
      count,
      items: items satisfies Array<UserWithRoleDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    };
  }

  async updateUser({
    dto,
    userId,
  }: {
    dto: UserUpdateDto;
    userId: string;
  }): Promise<UserWithRoleDto> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      include: { role: { select: { name: true } } },
    });
  }

  async getProfile({ userId }: { userId: string }) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { role: { select: { name: true } }, wallet: true },
    });

    return user;
  }
}
