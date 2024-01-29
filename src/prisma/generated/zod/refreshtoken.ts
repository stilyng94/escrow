import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteUser, RelatedUserSchema } from './index';

export const RefreshTokenSchema = z.object({
  id: z.string().startsWith('rft_'),
  token: z.string(),
  userId: z.string().startsWith('usr_'),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

export interface CompleteRefreshToken
  extends z.infer<typeof RefreshTokenSchema> {
  user: CompleteUser;
}

/**
 * RelatedRefreshTokenSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRefreshTokenSchema: z.ZodSchema<CompleteRefreshToken> =
  z.lazy(() =>
    RefreshTokenSchema.extend({
      user: RelatedUserSchema,
    }),
  );
