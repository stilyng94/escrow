import { SendPushNotificationDto } from '@/notification/notification.dto';

export abstract class PushNotificationGatewayService {
  abstract send(dto: SendPushNotificationDto): Promise<void>;
}

export const PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN =
  'PUSH-NOTIFICATION-GATEWAY-SERVICE-TOKEN';
