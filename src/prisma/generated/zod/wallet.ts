import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompletePayment,
  CompleteUser,
  CompleteWalletHistory,
  RelatedPaymentSchema,
  RelatedUserSchema,
  RelatedWalletHistorySchema,
} from './index';

export const WalletSchema = z.object({
  id: z.string().startsWith('wal_'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  balance: z.number().int(),
  lockedFunds: z.number().int(),
  userId: z.string(),
  customerId: z.string().nullish(),
  isActive: z.boolean(),
});

export class WalletDto extends createZodDto(WalletSchema) {}

export interface CompleteWallet extends z.infer<typeof WalletSchema> {
  user: CompleteUser;
  payment: CompletePayment[];
  walletHistory: CompleteWalletHistory[];
}

/**
 * RelatedWalletSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedWalletSchema: z.ZodSchema<CompleteWallet> = z.lazy(() =>
  WalletSchema.extend({
    user: RelatedUserSchema,
    payment: RelatedPaymentSchema.array(),
    walletHistory: RelatedWalletHistorySchema.array(),
  }),
);
