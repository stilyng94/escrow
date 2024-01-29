import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteNotificationObject,
  CompleteUser,
  RelatedNotificationObjectSchema,
  RelatedUserSchema,
} from './index';

export const NotificationSchema = z.object({
  id: z.string().startsWith('ntn_'),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.number().int(),
  notificationObjectId: z.string(),
  notifierId: z.string(),
});

export class NotificationDto extends createZodDto(NotificationSchema) {}

export interface CompleteNotification
  extends z.infer<typeof NotificationSchema> {
  notificationObject: CompleteNotificationObject;
  notifier: CompleteUser;
}

/**
 * RelatedNotificationSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedNotificationSchema: z.ZodSchema<CompleteNotification> =
  z.lazy(() =>
    NotificationSchema.extend({
      notificationObject: RelatedNotificationObjectSchema,
      notifier: RelatedUserSchema,
    }),
  );
