import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from 'nestjs-prisma';
import { EnvServiceDto } from '@/config/env.service';
import { PUSH_NOTIFICATION_GATEWAY_SERVICE_TOKEN } from '@/push-notification-gateway/push-notification-gateway.service';
import { SMS_GATEWAY_SERVICE_TOKEN } from '@/sms-gateway/sms-gateway.service';

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
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

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
