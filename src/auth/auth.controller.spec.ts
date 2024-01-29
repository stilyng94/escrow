import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EnvServiceDto } from '@/config/env.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from '@/user/user.service';
import { ROLES_BUILDER_TOKEN } from 'nest-access-control';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [EventEmitterModule.forRoot({})],
      providers: [
        AuthService,
        JwtService,
        EnvServiceDto,
        PrismaService,
        UserService,
        { provide: ROLES_BUILDER_TOKEN, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
