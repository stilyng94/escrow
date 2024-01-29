import { Test, TestingModule } from '@nestjs/testing';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from '@/auth/app.roles';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DocsController', () => {
  let controller: DocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocsController],
      imports: [AccessControlModule.forRoles(RBAC_POLICY)],
      providers: [
        {
          provide: DocsService,
          useValue: {
            addDoc: jest.fn(),
            getDocById: jest.fn(),
            getDocs: jest.fn(),
            getDocsFromSearch: jest.fn(),
            indexDocs: jest.fn(),
          },
        },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<DocsController>(DocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
