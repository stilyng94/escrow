import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from '@/auth/app.roles';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [AccessControlModule.forRoles(RBAC_POLICY)],
      providers: [
        {
          provide: UserService,
          useValue: {
            getProfile: jest.fn(),
            getProfiler: jest.fn(),
            getUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
