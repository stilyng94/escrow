import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from './currentuser.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ZodSerializerDto, ZodValidationException } from 'nestjs-zod';
import { UseRoles } from 'nest-access-control';
import {
  GetUserViaContactResponseDto,
  PaginatedUserResponseDto,
  UserWithRoleDto,
  UserWithWalletDto,
} from './user.dto';
import { UserService } from './user.service';
import {
  PaginationParamsDto,
  PaginationParamsOpenApi,
} from '@/shared/shared.dto';
import { JwtGuard } from '@/guards/jwt.guard';
import { RoleGuard } from '@/guards/role.guard';
import { phoneNumberSchema } from '@/utils/utils';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOkResponse({ type: UserWithWalletDto })
  @ZodSerializerDto(UserWithWalletDto)
  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({ resource: 'users', action: 'read', possession: 'own' })
  @ApiBearerAuth()
  getSelf(@CurrentUser() user: UserWithRoleDto) {
    return this.userService.getProfile({ userId: user.id });
  }

  @Get()
  @ZodSerializerDto(PaginatedUserResponseDto)
  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({ resource: 'users', action: 'read', possession: 'any' })
  @ApiBearerAuth()
  @ApiQuery({ type: PaginationParamsOpenApi })
  @ApiOkResponse({ type: PaginatedUserResponseDto })
  async getUsers(@Query() query: PaginationParamsDto) {
    return this.userService.getUsers(query);
  }

  @Get('verify/:phoneNumber')
  @ZodSerializerDto(GetUserViaContactResponseDto)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'phoneNumber', type: String })
  @ApiOkResponse({ type: GetUserViaContactResponseDto })
  async getUserViaContact(@Param('phoneNumber') phoneNumber: string) {
    const parsed = await phoneNumberSchema.safeParseAsync(phoneNumber);
    if (!parsed.success) {
      throw new ZodValidationException(parsed.error);
    }
    return await this.userService.getUserByPhoneNumber(parsed.data);
  }
}
