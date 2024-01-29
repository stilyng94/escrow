import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const EnvServiceSchema = z.object({
  PORT: z.coerce.number().int().positive().describe('Port number'),
  REFRESH_TOKEN_SECRET: z.string(),
  JWT_SECRET: z.string(),
  ENV: z.union([z.literal('development'), z.literal('production')]),
  SENTRY_DSN: z.string(),
  DEFAULT_FROM_ADDRESS: z.string().toLowerCase().email(),
  DEFAULT_FROM_NAME: z.string(),
  MAIL_AUTH_USER: z.string().default(''),
  MAIL_AUTH_PASSWORD: z.string().default(''),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_SECURE: z.coerce.number().transform<boolean>((arg) => Boolean(arg)),
  JWT_EXP: z.string(),
  NOTIFICATION_GATEWAY_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  PAYMENT_GATEWAY_SECRET: z.string(),
  PAYMENT_GATEWAY_WEBHOOK_SECRET: z.string(),
  API_DOC_USERNAME: z.string(),
  API_DOC_PASSWORD: z.string(),
  PAYMENT_GATEWAY: z
    .union([z.literal('paystack'), z.literal('hubtel')])
    .default('paystack'),
  PUSH_NOTIFICATION_GATEWAY: z
    .union([z.literal('nfty'), z.literal('firebase')])
    .default('nfty'),
  SMS_GATEWAY: z
    .union([z.literal('hubtel'), z.literal('firebase')])
    .default('hubtel'),
});

export class EnvServiceDto extends createZodDto(EnvServiceSchema) {}
