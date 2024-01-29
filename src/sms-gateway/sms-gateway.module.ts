import { Module } from '@nestjs/common';
import { provideSmsGatewayService } from './sms-gateway.provider';
import { SMS_GATEWAY_SERVICE_TOKEN } from './sms-gateway.service';

@Module({
  providers: [...provideSmsGatewayService()],
  exports: [SMS_GATEWAY_SERVICE_TOKEN],
})
export class SmsGatewayModule {}
