import { Injectable, Logger } from '@nestjs/common';
import {
  PrismaOptionsFactory,
  PrismaServiceOptions,
  loggingMiddleware,
} from 'nestjs-prisma';

import { EnvServiceDto } from '../config/env.service';

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  private readonly prismaServiceLogger = new Logger(PrismaConfigService.name);

  constructor(private readonly envServiceDto: EnvServiceDto) {}

  createPrismaOptions(): PrismaServiceOptions | Promise<PrismaServiceOptions> {
    return {
      middlewares: [
        loggingMiddleware({
          logger: this.prismaServiceLogger,
          logLevel: 'error',
        }),
      ],
      prismaOptions: {
        errorFormat:
          this.envServiceDto.ENV === 'production' ? 'colorless' : 'pretty',
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      },
    };
  }
}
