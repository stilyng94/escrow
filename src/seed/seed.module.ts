import { EnvServiceDto, EnvServiceSchema } from '@/config/env.service';
import { PrismaConfigService } from '@/prisma/prisma.config.service';
import { Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from 'nestjs-prisma';

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
  ],
})
export class SeedModule {}
