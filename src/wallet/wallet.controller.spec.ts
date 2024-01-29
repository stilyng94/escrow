import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaService } from 'nestjs-prisma';
import { EnvServiceDto } from '@/config/env.service';
import { ROLES_BUILDER_TOKEN } from 'nest-access-control';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PAYMENT_GATEWAY_SERVICE_TOKEN } from '@/payment-gateway/payment-gateway.service';

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      imports: [EventEmitterModule.forRoot({})],
      providers: [
        WalletService,
        PrismaService,
        EnvServiceDto,
        {
          provide: ROLES_BUILDER_TOKEN,
          useValue: {},
        },
        {
          provide: PAYMENT_GATEWAY_SERVICE_TOKEN,
          useValue: {},
        },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
