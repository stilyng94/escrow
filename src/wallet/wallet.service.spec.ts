import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from 'nestjs-prisma';
import { EnvServiceDto } from '@/config/env.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PAYMENT_GATEWAY_SERVICE_TOKEN } from '@/payment-gateway/payment-gateway.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        PrismaService,
        EnvServiceDto,
        { provide: CACHE_MANAGER, useValue: {} },
        {
          provide: PAYMENT_GATEWAY_SERVICE_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
