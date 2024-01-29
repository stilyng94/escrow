import { NotificationService } from '@/notification/notification.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TRANSACTION_EVENTS } from './transaction.dto';
import { EnvServiceDto } from '@/config/env.service';
import type {
  HandleTransactionCreatedEventDto,
  HandleTransactionToggledEventDto,
} from './transaction.dto';
@Injectable()
export class TransactionListener {
  private readonly logger = new Logger(TransactionListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly envService: EnvServiceDto,
  ) {}

  @OnEvent(TRANSACTION_EVENTS.txnCreated.event, { async: true })
  async handleTransactionCreatedEvent(
    payload: HandleTransactionCreatedEventDto,
  ) {
    const notification = await this.notificationService.createNotification({
      actorId: payload.buyerId,
      entityId: payload.id,
      notifiers: [payload.sellerId],
      entityType: 'transactions',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: 'handleTransactionCreatedEvent',
      topic: TRANSACTION_EVENTS.txnCreated.topic,
      title: 'New transaction',
      link: `${this.envService.BACKEND_URL}/${notification.entityType}/${notification.entityId}`,
    });
  }

  @OnEvent(TRANSACTION_EVENTS.txnToggled.event, { async: true })
  async handleTransactionToggledEvent(
    payload: HandleTransactionToggledEventDto,
  ) {
    const notification = await this.notificationService.createNotification({
      actorId: payload.sellerId,
      entityId: payload.id,
      notifiers: [payload.buyerId],
      entityType: 'transactions',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: payload.toggleValue,
      topic: TRANSACTION_EVENTS.txnToggled.topic,
      title: 'Transaction Toggle',
    });
  }

  @OnEvent(TRANSACTION_EVENTS.txnSellerConfirmDelivery.event, { async: true })
  async handleSellerConfirmDeliveryEvent(
    payload: HandleTransactionToggledEventDto,
  ) {
    const notification = await this.notificationService.createNotification({
      actorId: payload.sellerId,
      entityId: payload.id,
      notifiers: [payload.buyerId],
      entityType: 'transactions',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: 'Product delivered by seller',
      topic: TRANSACTION_EVENTS.txnSellerConfirmDelivery.topic,
      title: 'Transaction delivery',
    });
  }

  @OnEvent(TRANSACTION_EVENTS.txnBuyerConfirmDelivery.event, { async: true })
  async handleBuyerConfirmDeliveryEvent(
    payload: HandleTransactionToggledEventDto,
  ) {
    const notification = await this.notificationService.createNotification({
      actorId: payload.buyerId,
      entityId: payload.id,
      notifiers: [payload.sellerId],
      entityType: 'transactions',
    });

    await this.notificationService.sendPushNotification({
      entityId: notification.entityId,
      entityType: notification.entityType,
      notificationObjectId: notification.id,
      message: 'Product received by buyer.\nFunds will be allocated soon',
      topic: TRANSACTION_EVENTS.txnBuyerConfirmDelivery.topic,
      title: 'Transaction delivery',
    });
  }
}
