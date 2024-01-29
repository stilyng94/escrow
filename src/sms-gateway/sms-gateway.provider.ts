import { EnvServiceDto } from '@/config/env.service';
import { Injectable, NotImplementedException, Provider } from '@nestjs/common';
import { HubtelSmsGatewayService } from './implementations/hubtel/hubtel-sms-gateway.service';
import { SMS_GATEWAY_SERVICE_TOKEN } from './sms-gateway.service';

@Injectable()
class SmsGatewayServiceDependenciesProvider {
  constructor(public readonly envServiceDto: EnvServiceDto) {}
}

function provideSmsGatewayServiceFactory(
  dependenciesProvider: SmsGatewayServiceDependenciesProvider,
) {
  switch (dependenciesProvider.envServiceDto.SMS_GATEWAY) {
    case 'hubtel':
      return new HubtelSmsGatewayService();
    default:
      return new NotImplementedException();
  }
}

export function provideSmsGatewayService(): Provider[] {
  return [
    {
      provide: SMS_GATEWAY_SERVICE_TOKEN,
      useFactory: async (
        dependenciesProvider: SmsGatewayServiceDependenciesProvider,
      ) => provideSmsGatewayServiceFactory(dependenciesProvider),
      inject: [SmsGatewayServiceDependenciesProvider],
    },
    SmsGatewayServiceDependenciesProvider,
  ];
}
