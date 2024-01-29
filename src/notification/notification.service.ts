import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateNotificationDto,
  SendPushNotificationDto,
  SendSmsNotificationDto,
} from './notification.dto';
import {
  PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN,
  PushNotificationGatewayService,
} from '@/push-notification-gateway/push-notification-gateway.service';
import {
  SMS_GATEWAY_SERVICE_TOKEN,
  SmsGatewayService,
} from '@/sms-gateway/sms-gateway.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN)
    private pushNotificationService: PushNotificationGatewayService,
    @Inject(SMS_GATEWAY_SERVICE_TOKEN)
    private smsService: SmsGatewayService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    return this.prismaService.notificationObject.create({
      data: {
        entityId: dto.entityId,
        entityType: dto.entityType,
        NotificationChange: {
          create: {
            actorId: dto.actorId,
          },
        },
        notifications: {
          createMany: {
            data: dto.notifiers.map((n) => ({ notifierId: n })),
          },
        },
      },
    });
  }

  async sendPushNotification(dto: SendPushNotificationDto) {
    return this.pushNotificationService.send(dto);
  }

  async sendSmsNotification(dto: SendSmsNotificationDto) {
    return this.smsService.send(dto);
  }
}
