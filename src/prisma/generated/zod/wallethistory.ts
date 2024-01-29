import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { WalletHistoryType } from './enums';
import { CompleteWallet, RelatedWalletSchema } from './index';

export const WalletHistorySchema = z.object({
  id: z.string().startsWith('pay_'),
  historyType: z.nativeEnum(WalletHistoryType),
  amount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  walletId: z.string(),
});

export class WalletHistoryDto extends createZodDto(WalletHistorySchema) {}

export interface CompleteWalletHistory
  extends z.infer<typeof WalletHistorySchema> {
  wallet: CompleteWallet;
}

/**
 * RelatedWalletHistorySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedWalletHistorySchema: z.ZodSchema<CompleteWalletHistory> =
  z.lazy(() =>
    WalletHistorySchema.extend({
      wallet: RelatedWalletSchema,
    }),
  );
