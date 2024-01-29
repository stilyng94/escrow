import { Module } from '@nestjs/common';
import { PAYMENT_GATEWAY_SERVICE_TOKEN } from './payment-gateway.service';
import { providePaymentGatewayService } from './payment-gateway.service.provider';

@Module({
  providers: [...providePaymentGatewayService()],
  exports: [PAYMENT_GATEWAY_SERVICE_TOKEN],
})
export class PaymentGatewayModule {}
