import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AUTH_EVENTS,
  LoginCallbackResponseDto,
  LoginCompleteRequestDTO,
  LoginDto,
  LoginEventDto,
  LoginResponseDto,
  verifyAccountDto,
} from './auth.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtGuard } from '@/guards/jwt.guard';
import { RoleGuard } from '@/guards/role.guard';
import { UseRoles } from 'nest-access-control';
import { UserWithRoleDto } from '@/user/user.dto';
import { CurrentUser } from '@/user/currentuser.decorator';
import { CreateCustomerDto } from '@/payment-gateway/payment-gateway.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.authenticateUser(dto.phoneNumber);

    const { otp } = await this.authService.createVerificationToken({
      period: 60 * 2, //2minutes
      type: 'login',
      target: dto.phoneNumber,
    });

    const loginEventDto: LoginEventDto = {
      id: user.id,
      otp,
      phoneNumber: user.phoneNumber,
    };
    this.eventEmitter.emit(AUTH_EVENTS.login.event, loginEventDto);

    return {
      message: 'Check your message to finish logging in',
    } satisfies LoginResponseDto;
  }

  @ApiOkResponse({ type: LoginCallbackResponseDto })
  @ApiBody({ type: LoginCompleteRequestDTO })
  @HttpCode(HttpStatus.OK)
  @Post('login/callback')
  async loginCallback(@Body() dto: LoginCompleteRequestDTO) {
    return this.authService.completeAuth(
      dto,
    ) satisfies Promise<LoginCallbackResponseDto>;
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: verifyAccountDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({ resource: 'auth', action: 'update', possession: 'own' })
  @Put('verify')
  async verify(
    @Body() dto: verifyAccountDto,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    await this.authService.verifyAccount({ userId: user.id, dto });

    const createCustomerEventDto: CreateCustomerDto = {
      email: dto.email,
      first_name: dto.first_name,
      phone: user.phoneNumber,
      userId: user.id,
    };
    this.eventEmitter.emit(AUTH_EVENTS.verified.event, createCustomerEventDto);

    return {
      message:
        'Account verification done.\nYou can fund your wallet to start trading',
    } satisfies LoginResponseDto;
  }
}
