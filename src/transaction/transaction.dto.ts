import { TransactionSchema } from '@/prisma/generated/zod';
import { createPaginatedResponseSchema } from '@/shared/shared.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const createTransactionSchema = z.lazy(() =>
  TransactionSchema.pick({
    amount: true,
    buyerId: true,
    sellerId: true,
    currency: true,
    description: true,
    transactionType: true,
  }),
);

export class CreateTransactionDto extends createZodDto(
  createTransactionSchema,
) {}

export class PaginatedTransactionsResponseDto extends createZodDto(
  createPaginatedResponseSchema(TransactionSchema),
) {}

export const TRANSACTION_EVENTS = {
  txnCreated: { event: 'txn.created', topic: 'txnCreated' },
  txnToggled: { event: 'txn.toggled', topic: 'txnToggled' },
  txnSellerConfirmDelivery: {
    event: 'txn.sellerConfirmDelivery',
    topic: 'txnSellerConfirmDelivery',
  },
  txnBuyerConfirmDelivery: {
    event: 'txn.buyerConfirmDelivery',
    topic: 'txnBuyerConfirmDelivery',
  },
} as const;

const toggleTransactionSchema = z.object({
  toggleValue: z.union([z.literal('approved'), z.literal('declined')]),
});

export class ToggleTransactionDto extends createZodDto(
  toggleTransactionSchema,
) {}

const handleTransactionCreatedEventSchema = z.lazy(() =>
  TransactionSchema.pick({
    buyerId: true,
    id: true,
    sellerId: true,
  }),
);
export type HandleTransactionCreatedEventDto = z.infer<
  typeof handleTransactionCreatedEventSchema
>;

const handleTransactionToggledEventSchema =
  handleTransactionCreatedEventSchema.and(toggleTransactionSchema);
export type HandleTransactionToggledEventDto = z.infer<
  typeof handleTransactionToggledEventSchema
>;

export const handleTransactionDeliveryEventSchema =
  handleTransactionCreatedEventSchema;
export type HandleTransactionDeliveryEventDto = z.infer<
  typeof handleTransactionDeliveryEventSchema
>;
