import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PushNotificationGatewayModule } from '@/push-notification-gateway/push-notification-gateway.module';
import { SmsGatewayModule } from '@/sms-gateway/sms-gateway.module';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [PushNotificationGatewayModule, SmsGatewayModule],
})
export class NotificationModule {}
