import { Logger } from '@nestjs/common';
import { SmsGatewayService } from '../../sms-gateway.service';
import { SendSmsNotificationDto } from '@/notification/notification.dto';

export class HubtelSmsGatewayService implements SmsGatewayService {
  private readonly logger = new Logger(HubtelSmsGatewayService.name);

  async send(dto: SendSmsNotificationDto): Promise<void> {
    this.logger.log(
      `Sms notification: to ${dto.to} with message \n${dto.message}`,
    );
    return Promise.resolve();
  }
}
