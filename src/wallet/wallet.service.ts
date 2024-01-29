import { WalletDto } from '@/prisma/generated/zod';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { LoadWalletDto } from './wallet.dto';
import { UserWithRoleDto } from '@/user/user.dto';
import { PaymentMetadata } from '@/payment-gateway/payment-gateway.dto';
import { asyncRandomBytes } from '@/utils/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  PAYMENT_GATEWAY_SERVICE_TOKEN,
  PaymentGatewayService,
} from '@/payment-gateway/payment-gateway.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE_TOKEN)
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  async toggleWallet({
    userId,
    state,
  }: {
    userId: string;
    state: boolean;
  }): Promise<WalletDto> {
    return await this.prismaService.wallet.update({
      data: {
        isActive: state,
      },
      where: {
        userId,
      },
    });
  }

  async fundWallet({
    user,
    dto,
  }: {
    user: UserWithRoleDto;
    dto: LoadWalletDto;
  }) {
    const wallet = await this.prismaService.wallet.findFirst({
      where: { userId: user.id },
    });
    if (!wallet) {
      throw new NotFoundException('wallet not found');
    }

    if (!wallet.isActive) {
      throw new BadRequestException(
        'wallet is inactive.\nVerify account to get it activated',
      );
    }
    const metadata: PaymentMetadata = {
      walletId: wallet.id,
      paymentType: 'funding',
    };

    const { authorizationUrl, reference } =
      await this.paymentGatewayService.initializePayment({
        ...dto,
        metadata,
        email: user.email!,
      });
    await this.prismaService.payment.create({
      data: {
        paymentType: 'funding',
        amount: dto.amount,
        metadata: metadata,
        walletId: wallet.id,
        reference,
      },
    });
    return authorizationUrl;
  }

  async handleWebhook(request: Request) {
    try {
      return await this.paymentGatewayService.handleWebhook(request);
    } catch (error) {
      this.logger.error(error);
      return;
    }
  }

  async withdrawFunds({
    userId,
    amount,
    channelType,
    accountNumber,
    bankCode,
    currency,
    name,
  }: {
    userId: string;
    amount: number;
    channelType: 'bank' | 'mobile_money';
    accountNumber: string;
    bankCode: string;
    currency: string;
    name: string;
  }) {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || !wallet.isActive) {
      throw new BadRequestException('Wallet error');
    }
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    const recipientCode =
      await this.paymentGatewayService.createTransferRecipient({
        type: channelType,
        accountNumber,
        bankCode,
        currency,
        name,
      });

    const reference = (await asyncRandomBytes(16)).toString('hex');
    const metadata: PaymentMetadata = {
      walletId: wallet.id,
      paymentType: 'withdrawal',
    };
    const transferStatus = await this.paymentGatewayService.initiateWithdrawal({
      amount,
      recipientCode,
      reference,
      metadata,
    });
    if (transferStatus === 'failed') {
      throw new BadRequestException('Transfer could not be initiated');
    }

    await this.prismaService.payment.create({
      data: {
        paymentType: 'withdrawal',
        amount: amount,
        metadata: metadata,
        walletId: wallet.id,
        reference,
      },
    });
    return transferStatus;
  }

  async getBanks(currency: string) {
    const key = `banks-${currency}`;

    let banks:
      | {
          name: string;
          code: string;
          active: boolean;
        }[]
      | undefined;

    banks = await this.cacheService.get(key);
    if (banks) {
      return banks;
    }

    banks = await this.paymentGatewayService.getBanks(currency);
    await this.cacheService.set(key, banks, 86400000);
    return banks;
  }
  async getMomoBanks(currency: string) {
    const key = `momoBanks-${currency}`;
    let momoBanks:
      | {
          name: string;
          code: string;
          active: boolean;
        }[]
      | undefined;

    momoBanks = await this.cacheService.get(key);
    if (momoBanks) {
      return momoBanks;
    }

    momoBanks = await this.paymentGatewayService.getMomoBanks(currency);
    await this.cacheService.set(key, momoBanks, 86400000); //1day
    return momoBanks;
  }
}
