import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EnvServiceDto } from '@/config/env.service';
import { PrismaService } from 'nestjs-prisma';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, EnvServiceDto, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
