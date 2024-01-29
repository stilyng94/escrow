import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtGuard } from '@/guards/jwt.guard';
import { RoleGuard } from '@/guards/role.guard';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserWithRoleDto } from '@/user/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseRoles } from 'nest-access-control';
import type { Request } from 'express';
import {
  GetFinancialOptionsDto,
  GetFinancialOptionsRequestDto,
  LoadWalletDto,
  WithdrawFundsDto,
} from './wallet.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WALLET_EVENTS } from '@/payment-gateway/payment-gateway.dto';

@Controller('wallets')
@ApiTags('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOkResponse({ type: String })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoadWalletDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({ resource: 'wallets', action: 'update', possession: 'own' })
  @Post('load')
  async loadWallet(
    @Body() dto: LoadWalletDto,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    return this.walletService.fundWallet({
      user,
      dto,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(@Req() req: Request) {
    const resp = await this.walletService.handleWebhook(req);
    if (resp) {
      switch (resp.metadata.paymentType) {
        case 'withdrawal':
          this.eventEmitter.emit(
            WALLET_EVENTS.walletWithdrawalEvent.event,
            resp,
          );
          break;
        default:
          this.eventEmitter.emit(WALLET_EVENTS.walletFundingEvent.event, resp);
          break;
      }
    }
    return;
  }

  @ApiOkResponse({ type: GetFinancialOptionsDto })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: GetFinancialOptionsRequestDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('financial-options')
  async getFinancialOptions(@Body() dto: GetFinancialOptionsRequestDto) {
    const options = await Promise.allSettled([
      this.walletService.getBanks(dto.currency),
      this.walletService.getMomoBanks(dto.currency),
    ]);
    return {
      banks: options[0],
      momo: options[1],
    };
  }

  @ApiOkResponse({ type: String })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: WithdrawFundsDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({ resource: 'wallets', action: 'update', possession: 'own' })
  @Post('withdraw')
  async withdrawFunds(
    @Body() dto: WithdrawFundsDto,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    await this.walletService.withdrawFunds({
      userId: user.id,
      amount: dto.amount,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
      channelType: dto.channelType,
      currency: dto.currency,
      name: dto.name,
    });
    return 'success';
  }
}
