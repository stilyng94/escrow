import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteTransaction,
  CompleteUser,
  RelatedTransactionSchema,
  RelatedUserSchema,
} from './index';

export const DisputeSchema = z.object({
  id: z.string().startsWith('dis_'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  disputeDetail: z.string(),
  status: z.union([z.literal('pending'), z.literal('resolved')]),
  transactionId: z.string().startsWith('txn_'),
  userId: z.string(),
  resolutionDetail: z.string(),
});

export class DisputeDto extends createZodDto(DisputeSchema) {}

export interface CompleteDispute extends z.infer<typeof DisputeSchema> {
  user: CompleteUser;
  transaction: CompleteTransaction;
}

/**
 * RelatedDisputeSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDisputeSchema: z.ZodSchema<CompleteDispute> = z.lazy(() =>
  DisputeSchema.extend({
    user: RelatedUserSchema,
    transaction: RelatedTransactionSchema,
  }),
);
