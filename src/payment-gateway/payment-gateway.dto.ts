import { phoneNumberSchema } from '@/utils/utils';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const createCustomerSchema = z.object({
  email: z.string().email(),
  phone: phoneNumberSchema,
  first_name: z.string(),
  userId: z.string(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;

const paymentMetadataSchema = z.object({
  walletId: z.string().startsWith('wal_'),
  paymentType: z.union([z.literal('funding'), z.literal('withdrawal')]),
});

export const WALLET_EVENTS = {
  walletFundingEvent: { event: 'wallet.funding', topic: 'walletFunding' },
  walletWithdrawalEvent: {
    event: 'wallet.withdrawal',
    topic: 'walletWithdrawal',
  },
  releaseTransactionFundsEvent: {
    event: 'wallet.releaseTransactionFunds',
    topic: 'walletReleaseTransactionFunds',
  },
} as const;

export const webhookResponseSchema = z.object({
  metadata: paymentMetadataSchema,
  status: z.union([z.literal('success'), z.literal('failed')]),
  reference: z.string(),
});

export type WebhookResponseDto = z.infer<typeof webhookResponseSchema>;

export const initializePaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  metadata: paymentMetadataSchema,
  callback_url: z.string().url(),
  email: z.string().email(),
});

export type PaymentMetadata = z.infer<typeof paymentMetadataSchema>;

export class InitializePaymentDto extends createZodDto(
  initializePaymentSchema,
) {}

export const initiateWithdrawalSchema = z.object({
  amount: z.number().positive(),
  metadata: paymentMetadataSchema,
  reference: z.string().length(16),
  recipientCode: z.string(),
});

export type initiateWithdrawalSchema = z.infer<typeof initiateWithdrawalSchema>;

export class InitiateWithdrawalDto extends createZodDto(
  initiateWithdrawalSchema,
) {}

export const releaseTransactionFundsEventSchema = z.object({
  amount: z.number().positive(),
  userId: z.string().startsWith('usr_'),
  actorId: z.string().startsWith('usr_'),
});
export type ReleaseTransactionFundsEventDto = z.infer<
  typeof releaseTransactionFundsEventSchema
>;
