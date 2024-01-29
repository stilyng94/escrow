import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { SeedModule } from './seed.module';
import { PrismaService } from 'nestjs-prisma';

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    bufferLogs: true,
  });
  const seedLogger = new Logger('Seed');

  app.useLogger(app.get(PinoLogger));
  const prismaService = app.get(PrismaService);

  const roles = await prismaService.$transaction([
    prismaService.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    }),
    prismaService.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER' },
    }),
  ]);

  const users = await prismaService.$transaction([
    prismaService.user.upsert({
      create: {
        phoneNumber: '0555555555',
        customerCode: 'CUS_xz2uubzqxihnfou',
        email: 'pablo@mail.com',
        roleId: roles[0].id,
        username: 'pablo',
        isVerified: true,
        wallet: {
          create: {
            isActive: true,
          },
        },
      },
      where: {
        phoneNumber: '0555555555',
      },
      update: {
        customerCode: 'CUS_xz2uubzqxihnfou',
        isVerified: true,
      },
    }),
    prismaService.user.upsert({
      create: {
        phoneNumber: '0202020201',
        roleId: roles[1].id,
        username: 'pab',
        customerCode: 'CUS_wgb46kcr7jqqrqj',
        email: 'pab@mail.com',
        isVerified: true,
        wallet: {
          create: {
            isActive: true,
          },
        },
      },
      where: {
        phoneNumber: '0202020201',
      },
      update: {
        customerCode: 'CUS_wgb46kcr7jqqrqj',
        isVerified: true,
      },
    }),
  ]);

  seedLogger.log(`roles ==> ${roles}`);
  seedLogger.log(`users ==> ${users}`);

  await prismaService.$disconnect();

  await app.close();
}

seed();
