import { Test, TestingModule } from '@nestjs/testing';
import { DocsService } from './docs.service';
import { PrismaService } from 'nestjs-prisma';
import { EnvServiceDto } from '@/config/env.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DocsService', () => {
  let service: DocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocsService,
        PrismaService,
        EnvServiceDto,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    service = module.get<DocsService>(DocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
