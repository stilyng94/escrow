import { NotificationService } from '@/notification/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_EVENTS } from './auth.dto';
import type { CreateCustomerDto } from '@/payment-gateway/payment-gateway.dto';
import { UserService } from '@/user/user.service';
import type { LoginEventDto } from './auth.dto';
import {
  PAYMENT_GATEWAY_SERVICE_TOKEN,
  PaymentGatewayService,
} from '@/payment-gateway/payment-gateway.service';

@Injectable()
export class AuthListener {
  constructor(
    private readonly notificationService: NotificationService,
    @Inject(PAYMENT_GATEWAY_SERVICE_TOKEN)
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly userService: UserService,
  ) {}

  @OnEvent(AUTH_EVENTS.login.event, { async: true })
  async handleLoginEvent(payload: LoginEventDto) {
    await this.notificationService.createNotification({
      actorId: payload.id,
      entityId: payload.id,
      notifiers: [payload.id],
      entityType: 'users',
    });

    await this.notificationService.sendSmsNotification({
      to: payload.phoneNumber,
      message: `Your login code is \n${payload.otp}`,
      subject: 'Login',
    });
  }

  @OnEvent(AUTH_EVENTS.verified.event, { async: true })
  async handleCreateCustomer(payload: CreateCustomerDto) {
    try {
      const { customerCode } = await this.paymentGatewayService.createCustomer(
        payload,
      );
      await this.userService.updateUser({
        dto: { customerCode },
        userId: payload.userId,
      });

      const ntf = await this.notificationService.createNotification({
        actorId: payload.userId,
        entityId: payload.userId,
        notifiers: [payload.userId],
        entityType: 'users',
      });

      await this.notificationService.sendPushNotification({
        entityId: payload.userId,
        entityType: 'users',
        message: 'verified',
        title: 'Verification',
        notificationObjectId: ntf.id,
        topic: AUTH_EVENTS.verified.topic,
      });
    } catch (error) {
      console.log('ERROR: ', error);
    }
  }
}
