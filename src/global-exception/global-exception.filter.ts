import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          response.status(HttpStatus.CONFLICT).json({
            message: `${exception.meta?.['target']?.toString()} already exists`,
          });
          break;
        }
        case 'P2022': {
          response
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .json({ message: 'wrong input arguments' });
          break;
        }
        case 'P2025': {
          response
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .json({ message: 'wrong input arguments' });
          break;
        }

        default:
          response
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: 'bad request' });
          break;
      }

      return;
    }

    if (exception instanceof PrismaClientValidationError) {
      const message = exception.message.replace(/\n/g, '');
      response.status(HttpStatus.BAD_REQUEST).json({ message });
      return;
    }

    if (exception instanceof ZodValidationException) {
      response.status(exception.getStatus()).json({
        message: exception.message,
        data: exception.getZodError().errors.map(({ path, message }) => {
          return { path, message };
        }),
      });
      return;
    }

    super.catch(exception, host);
  }
}
