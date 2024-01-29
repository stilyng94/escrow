import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'nestjs-prisma';
import { ROLES_BUILDER_TOKEN } from 'nest-access-control';
import { EnvServiceDto } from '@/config/env.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      imports: [EventEmitterModule.forRoot({})],
      providers: [
        TransactionService,
        PrismaService,
        EnvServiceDto,
        {
          provide: ROLES_BUILDER_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
