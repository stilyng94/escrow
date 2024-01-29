import { EnvServiceDto } from '@/config/env.service';
import { Injectable, NotImplementedException, Provider } from '@nestjs/common';
import { PAYMENT_GATEWAY_SERVICE_TOKEN } from './payment-gateway.service';
import { PaystackPaymentGatewayService } from './implementations/paystack-payment-gateway/paystack-payment-gateway.service';

@Injectable()
class PaymentGatewayServiceDependenciesProvider {
  constructor(public readonly envServiceDto: EnvServiceDto) {}
}

function providePaymentGatewayServiceFactory(
  dependenciesProvider: PaymentGatewayServiceDependenciesProvider,
) {
  switch (dependenciesProvider.envServiceDto.PAYMENT_GATEWAY) {
    case 'paystack':
      return new PaystackPaymentGatewayService(
        dependenciesProvider.envServiceDto,
      );
    default:
      return new NotImplementedException();
  }
}

export function providePaymentGatewayService(): Provider[] {
  return [
    {
      provide: PAYMENT_GATEWAY_SERVICE_TOKEN,
      useFactory: async (
        dependenciesProvider: PaymentGatewayServiceDependenciesProvider,
      ) => providePaymentGatewayServiceFactory(dependenciesProvider),
      inject: [PaymentGatewayServiceDependenciesProvider],
    },
    PaymentGatewayServiceDependenciesProvider,
  ];
}
