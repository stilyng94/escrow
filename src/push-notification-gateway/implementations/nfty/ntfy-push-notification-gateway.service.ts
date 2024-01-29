import { Logger } from '@nestjs/common';
import { EnvServiceDto } from '@/config/env.service';
import { PushNotificationGatewayService } from '../../push-notification-gateway.service';
import { SendPushNotificationDto } from '@/notification/notification.dto';

export class NtfyPushNotificationGatewayService
  implements PushNotificationGatewayService
{
  private readonly logger = new Logger(NtfyPushNotificationGatewayService.name);

  constructor(private readonly envService: EnvServiceDto) {}

  async send(dto: SendPushNotificationDto): Promise<void> {
    this.logger.log(`Push notification: to ${dto.notificationObjectId}`);
    const headers = { title: dto.title };
    if (dto.link) {
      headers['click'] = dto.link;
    }
    await fetch(`${this.envService.NOTIFICATION_GATEWAY_URL}/${dto.topic}`, {
      method: 'POST',
      body: dto.message,
      headers,
    });
  }
}
