import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteTransaction, RelatedTransactionSchema } from './index';

export const DocSchema = z.object({
  id: z.string().startsWith('doc_'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  src: z.string(),
  name: z.string(),
  mimetype: z.string(),
  transactionId: z.string().nullish(),
});

export class DocDto extends createZodDto(DocSchema) {}

export interface CompleteDoc extends z.infer<typeof DocSchema> {
  Transaction?: CompleteTransaction | null;
}

/**
 * RelatedDocSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDocSchema: z.ZodSchema<CompleteDoc> = z.lazy(() =>
  DocSchema.extend({
    Transaction: RelatedTransactionSchema.nullish(),
  }),
);
