import { Test, TestingModule } from '@nestjs/testing';
import { PaystackPaymentGatewayService } from './paystack-payment-gateway.service';
import { EnvServiceDto } from '@/config/env.service';

describe('PaystackPaymentGatewayService', () => {
  let service: PaystackPaymentGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvServiceDto],
    }).compile();

    service = new PaystackPaymentGatewayService(
      module.get<EnvServiceDto>(EnvServiceDto),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
