import { Module } from '@nestjs/common';
import { PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN } from './push-notification-gateway.service';
import { providePushNotificationGatewayService } from './push-notification-gateway.provider';

@Module({
  providers: [...providePushNotificationGatewayService()],
  exports: [PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN],
})
export class PushNotificationGatewayModule {}
