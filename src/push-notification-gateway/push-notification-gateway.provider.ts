import { EnvServiceDto } from '@/config/env.service';
import { Injectable, NotImplementedException, Provider } from '@nestjs/common';
import { PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN } from './push-notification-gateway.service';
import { NtfyPushNotificationGatewayService } from './implementations/nfty/ntfy-push-notification-gateway.service';

@Injectable()
class PushNotificationGatewayServiceDependenciesProvider {
  constructor(public readonly envServiceDto: EnvServiceDto) {}
}

function providePushNotificationGatewayServiceFactory(
  dependenciesProvider: PushNotificationGatewayServiceDependenciesProvider,
) {
  switch (dependenciesProvider.envServiceDto.PUSH_NOTIFICATION_GATEWAY) {
    case 'nfty':
      return new NtfyPushNotificationGatewayService(
        dependenciesProvider.envServiceDto,
      );
    default:
      return new NotImplementedException();
  }
}

export function providePushNotificationGatewayService(): Provider[] {
  return [
    {
      provide: PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN,
      useFactory: async (
        dependenciesProvider: PushNotificationGatewayServiceDependenciesProvider,
      ) => providePushNotificationGatewayServiceFactory(dependenciesProvider),
      inject: [PushNotificationGatewayServiceDependenciesProvider],
    },
    PushNotificationGatewayServiceDependenciesProvider,
  ];
}
