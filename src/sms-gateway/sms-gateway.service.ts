import { SendSmsNotificationDto } from '@/notification/notification.dto';

export abstract class SmsGatewayService {
  abstract send(dto: SendSmsNotificationDto): Promise<void>;
}

export const SMS_GATEWAY_SERVICE_TOKEN = 'SMS-GATEWAY-SERVICE-TOKEN';
