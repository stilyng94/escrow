import { NotificationService } from '@/notification/notification.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EnvServiceDto } from '@/config/env.service';
import { WALLET_EVENTS } from '@/payment-gateway/payment-gateway.dto';
import { PrismaService } from 'nestjs-prisma';
import type {
  ReleaseTransactionFundsEventDto,
  WebhookResponseDto,
} from '@/payment-gateway/payment-gateway.dto';

@Injectable()
export class WalletListener {
  private readonly logger = new Logger(WalletListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly envService: EnvServiceDto,
    private readonly prismaService: PrismaService,
  ) {}

  @OnEvent(WALLET_EVENTS.walletFundingEvent.event, { async: true })
  async handleWalletFundingEvent(payload: WebhookResponseDto) {
    switch (payload.status) {
      case 'failed':
        return this.fundingFailed(payload);
      default:
        return this.fundingSuccess(payload);
    }
  }

  @OnEvent(WALLET_EVENTS.walletWithdrawalEvent.event, { async: true })
  async handleWalletWithdrawalEvent(payload: WebhookResponseDto) {
    switch (payload.status) {
      case 'failed':
        return this.withdrawalFailed(payload);
      default:
        return this.withdrawalSuccess(payload);
    }
  }

  private async withdrawalSuccess(payload: WebhookResponseDto) {
    const wallet = await this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { reference: payload.reference, paymentType: 'withdrawal' },
        data: {
          status: payload.status,
        },
      });

      return tx.wallet.update({
        where: { id: payload.metadata.walletId },
        data: {
          balance: { decrement: payment.amount },
          walletHistory: {
            create: {
              amount: payment.amount,
              historyType: payload.metadata.paymentType,
            },
          },
        },
      });
    });

    const notification = await this.notificationService.createNotification({
      actorId: wallet.userId,
      entityId: wallet.id,
      notifiers: [wallet.userId],
      entityType: 'wallets',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: `Wallet withdrawal success`,
      topic: WALLET_EVENTS.walletWithdrawalEvent.topic,
      title: 'Wallet',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }

  private async withdrawalFailed(payload: WebhookResponseDto) {
    const payment = await this.prismaService.payment.update({
      where: {
        reference: payload.reference,
        paymentType: payload.metadata.paymentType,
      },
      data: {
        status: payload.status,
      },
      select: { wallet: { select: { userId: true, id: true } } },
    });

    const notification = await this.notificationService.createNotification({
      actorId: payment.wallet.userId,
      entityId: payment.wallet.id,
      notifiers: [payment.wallet.userId],
      entityType: 'wallets',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: `Wallet withdrawal failed`,
      topic: WALLET_EVENTS.walletWithdrawalEvent.topic,
      title: 'Wallet',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }

  private async fundingSuccess(payload: WebhookResponseDto) {
    const wallet = await this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: {
          reference: payload.reference,
          paymentType: payload.metadata.paymentType,
        },
        data: {
          status: payload.status,
        },
      });

      return tx.wallet.update({
        where: { id: payload.metadata.walletId },
        data: {
          balance: { increment: payment.amount },
          walletHistory: {
            create: {
              amount: payment.amount,
              historyType: payload.metadata.paymentType,
            },
          },
        },
      });
    });

    const notification = await this.notificationService.createNotification({
      actorId: wallet.userId,
      entityId: wallet.id,
      notifiers: [wallet.userId],
      entityType: 'wallets',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: `Wallet funding success`,
      topic: WALLET_EVENTS.walletFundingEvent.topic,
      title: 'Wallet',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }

  private async fundingFailed(payload: WebhookResponseDto) {
    const payment = await this.prismaService.payment.update({
      where: {
        reference: payload.reference,
        paymentType: payload.metadata.paymentType,
      },
      data: {
        status: payload.status,
      },
      select: { wallet: { select: { userId: true, id: true } } },
    });

    const notification = await this.notificationService.createNotification({
      actorId: payment.wallet.userId,
      entityId: payment.wallet.id,
      notifiers: [payment.wallet.userId],
      entityType: 'wallets',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: 'Wallet funding failed',
      topic: WALLET_EVENTS.walletFundingEvent.topic,
      title: 'Wallet',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }

  @OnEvent(WALLET_EVENTS.releaseTransactionFundsEvent.event, { async: true })
  async handleReleaseTransactionFundsEvent(
    payload: ReleaseTransactionFundsEventDto,
  ) {
    const wallet = await this.prismaService.wallet.update({
      where: { userId: payload.userId },
      data: {
        balance: { increment: payload.amount },
        walletHistory: {
          create: {
            amount: payload.amount,
            historyType: 'released',
          },
        },
      },
    });

    const notification = await this.notificationService.createNotification({
      actorId: payload.actorId,
      entityId: wallet.id,
      notifiers: [payload.userId],
      entityType: 'wallets',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: `Funds of $${payload.amount} added from latest transaction`,
      topic: WALLET_EVENTS.releaseTransactionFundsEvent.topic,
      title: 'Wallet',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }
}
