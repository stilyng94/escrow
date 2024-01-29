import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteNotificationObject,
  RelatedNotificationObjectSchema,
} from './index';

export const EntityTypeSchema = z.object({
  id: z.string().startsWith('ett_'),
  name: z.string(),
});

export class EntityTypeDto extends createZodDto(EntityTypeSchema) {}

export interface CompleteEntityType extends z.infer<typeof EntityTypeSchema> {
  NotificationObject: CompleteNotificationObject[];
}

/**
 * RelatedEntityTypeSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEntityTypeSchema: z.ZodSchema<CompleteEntityType> = z.lazy(
  () =>
    EntityTypeSchema.extend({
      NotificationObject: RelatedNotificationObjectSchema.array(),
    }),
);
