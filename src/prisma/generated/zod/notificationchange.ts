import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteNotificationObject,
  CompleteUser,
  RelatedNotificationObjectSchema,
  RelatedUserSchema,
} from './index';

export const NotificationChangeSchema = z.object({
  id: z.string().startsWith('ntc_'),
  createdAt: z.date(),
  updatedAt: z.date(),
  notificationObjectId: z.string(),
  actorId: z.string(),
});

export class NotificationChangeDto extends createZodDto(
  NotificationChangeSchema,
) {}

export interface CompleteNotificationChange
  extends z.infer<typeof NotificationChangeSchema> {
  notificationObject: CompleteNotificationObject;
  actor: CompleteUser;
}

/**
 * RelatedNotificationChangeSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedNotificationChangeSchema: z.ZodSchema<CompleteNotificationChange> =
  z.lazy(() =>
    NotificationChangeSchema.extend({
      notificationObject: RelatedNotificationObjectSchema,
      actor: RelatedUserSchema,
    }),
  );
