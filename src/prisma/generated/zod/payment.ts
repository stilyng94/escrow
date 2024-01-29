import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteWallet, RelatedWalletSchema } from './index';

export const PaymentSchema = z.object({
  id: z.string().startsWith('pay_'),
  status: z.union([
    z.literal('failed'),
    z.literal('success'),
    z.literal('pending'),
  ]),
  reference: z.string(),
  walletId: z.string(),
  metadata: z.json(),
  amount: z.number().int(),
  paymentType: z.union([z.literal('funding'), z.literal('withdrawal')]),
});

export class PaymentDto extends createZodDto(PaymentSchema) {}

export interface CompletePayment extends z.infer<typeof PaymentSchema> {
  wallet: CompleteWallet;
}

/**
 * RelatedPaymentSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPaymentSchema: z.ZodSchema<CompletePayment> = z.lazy(() =>
  PaymentSchema.extend({
    wallet: RelatedWalletSchema,
  }),
);
