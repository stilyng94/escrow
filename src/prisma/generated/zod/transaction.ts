import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import * as imports from '../../../utils/utils';
import {
  CompleteDispute,
  CompleteDoc,
  CompleteUser,
  RelatedDisputeSchema,
  RelatedDocSchema,
  RelatedUserSchema,
} from './index';

export const TransactionSchema = z.object({
  id: z.string().startsWith('txn_'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  transactionStatus: z.union([
    z.literal('initiated'),
    z.literal('inProgress'),
    z.literal('completed'),
    z.literal('disputed'),
    z.literal('declined'),
    z.literal('cancelled'),
  ]),
  transactionType: z.union([
    z.literal('electronic'),
    z.literal('realEstate'),
    z.literal('others'),
  ]),
  description: z.string(),
  amount: z.number().int(),
  /**
   * z.string().max(3)
   */
  currency: z.string(),
  buyerId: z.string().startsWith('usr_'),
  sellerId: z.string().startsWith('usr_'),
  deliveredOn: z.from(imports.nullCoerceDateSchema).nullish(),
  receivedOn: z.from(imports.nullCoerceDateSchema).nullish(),
});

export class TransactionDto extends createZodDto(TransactionSchema) {}

export interface CompleteTransaction extends z.infer<typeof TransactionSchema> {
  buyer: CompleteUser;
  seller: CompleteUser;
  docs: CompleteDoc[];
  dispute: CompleteDispute[];
}

/**
 * RelatedTransactionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTransactionSchema: z.ZodSchema<CompleteTransaction> =
  z.lazy(() =>
    TransactionSchema.extend({
      buyer: RelatedUserSchema,
      seller: RelatedUserSchema,
      docs: RelatedDocSchema.array(),
      dispute: RelatedDisputeSchema.array(),
    }),
  );
