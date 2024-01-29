import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const createWalletSchema = z.object({
  transactionId: z.string().startsWith('txn_'),
  callback_url: z.string().url(),
});

export class CreateWalletDto extends createZodDto(createWalletSchema) {}

export const loadWalletSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  callback_url: z.string().url(),
});

export class LoadWalletDto extends createZodDto(loadWalletSchema) {}

export const withdrawFundsSchema = loadWalletSchema
  .pick({ amount: true, currency: true })
  .merge(
    z.object({
      channelType: z.union([z.literal('mobile_money'), z.literal('bank')]),
      accountNumber: z.string(),
      bankCode: z.string(),
      currency: z.string(),
      name: z.string(),
    }),
  );

export class WithdrawFundsDto extends createZodDto(withdrawFundsSchema) {}

export const getFinancialOptionsSchema = z.object({
  banks: z.object({
    name: z.string(),
    code: z.string(),
    active: z.boolean(),
  }),
  momo: z.object({
    name: z.string(),
    code: z.string(),
    active: z.boolean(),
  }),
});

export class GetFinancialOptionsDto extends createZodDto(
  getFinancialOptionsSchema,
) {}

export const getFinancialOptionsRequestSchema = z.object({
  currency: z.union([z.literal('GHS'), z.literal('NGN')]),
});

export class GetFinancialOptionsRequestDto extends createZodDto(
  getFinancialOptionsRequestSchema,
) {}
