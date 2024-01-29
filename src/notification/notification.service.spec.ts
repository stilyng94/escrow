import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from 'nestjs-prisma';
import { EnvServiceDto } from '@/config/env.service';
import { PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN } from '@/push-notification-gateway/push-notification-gateway.service';
import { SMS_GATEWAY_SERVICE_TOKEN } from '@/sms-gateway/sms-gateway.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        PrismaService,
        EnvServiceDto,
        {
          provide: PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN,
          useValue: {},
        },
        {
          provide: SMS_GATEWAY_SERVICE_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
