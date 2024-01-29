import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EnvServiceDto } from '@/config/env.service';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from '@/user/user.service';

jest.mock('@epic-web/totp');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        EnvServiceDto,
        PrismaService,
        AuthService,
        UserService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
