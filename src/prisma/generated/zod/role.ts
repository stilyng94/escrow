import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteUser, RelatedUserSchema } from './index';

export const RoleSchema = z.object({
  id: z.string().startsWith('rol_'),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export class RoleDto extends createZodDto(RoleSchema) {}

export interface CompleteRole extends z.infer<typeof RoleSchema> {
  users: CompleteUser[];
}

/**
 * RelatedRoleSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoleSchema: z.ZodSchema<CompleteRole> = z.lazy(() =>
  RoleSchema.extend({
    users: RelatedUserSchema.array(),
  }),
);
