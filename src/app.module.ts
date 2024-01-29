import { Module, ValidationPipe } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvServiceDto, EnvServiceSchema } from './config/env.service';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'nestjs-prisma';
import { PrismaConfigService } from './prisma/prisma.config.service';
import { LoggerModule } from 'nestjs-pino';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from './auth/app.roles';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuardGuard } from './shared/throttler-behind-proxy-guard.guard';
import path from 'node:path';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DocsModule } from './docs/docs.module';
import { NotificationModule } from './notification/notification.module';
import { TransactionModule } from './transaction/transaction.module';
import { WalletModule } from './wallet/wallet.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SmsGatewayModule } from './sms-gateway/sms-gateway.module';
import { PushNotificationGatewayModule } from './push-notification-gateway/push-notification-gateway.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      isGlobal: true,
      load: dotenvLoader(),
      schema: EnvServiceDto,
      validate: (config) => EnvServiceSchema.parse(config),
    }),
    LoggerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvServiceDto],
      useFactory: (envServiceDto: EnvServiceDto) => ({
        pinoHttp: {
          customProps: () => ({
            context: 'HTTP',
          }),
          transport:
            envServiceDto.ENV === 'production'
              ? {
                  target: 'pino-sentry-transport',
                  sentry: {
                    dsn: envServiceDto.SENTRY_DSN,
                  },
                  options: { singleLine: true },
                }
              : undefined,
        },
      }),
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaConfigService,
      inject: [EnvServiceDto],
    }),
    ThrottlerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvServiceDto],
      useFactory: () => ({ ttl: 60, limit: 10 }),
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (envServiceDto: EnvServiceDto) => ({
        global: true,
        verifyOptions: { algorithms: ['HS256'] },
        signOptions: { expiresIn: envServiceDto.JWT_EXP },
      }),
      inject: [EnvServiceDto],
    }),
    MailerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvServiceDto],
      useFactory: (config: EnvServiceDto) => {
        return {
          transport: {
            pool: true,
            debug: config.ENV === 'development',
            host: config.MAIL_HOST,
            port: config.MAIL_PORT,
            secure: config.MAIL_SECURE,
            auth: {
              user: config.MAIL_AUTH_USER,
              pass: config.MAIL_AUTH_PASSWORD,
            },
          },
          defaults: {
            sender: {
              name: config.DEFAULT_FROM_NAME,
              address: config.DEFAULT_FROM_ADDRESS,
            },
          },
          preview: config.ENV === 'development',
          template: {
            dir: path.join(__dirname, '/templates/mail-templates/'),
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    CacheModule.register({ isGlobal: true, ttl: 30000 }),
    AccessControlModule.forRoles(RBAC_POLICY, {}),
    HealthModule,
    UserModule,
    AuthModule,
    DocsModule,
    NotificationModule,
    TransactionModule,
    WalletModule,
    EventEmitterModule.forRoot({}),
    SmsGatewayModule,
    PushNotificationGatewayModule,
    PaymentGatewayModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_PIPE, useClass: ValidationPipe },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuardGuard,
    },
    AppService,
  ],
})
export class AppModule {}
