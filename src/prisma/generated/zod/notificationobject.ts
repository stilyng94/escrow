import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteNotification,
  CompleteNotificationChange,
  RelatedNotificationChangeSchema,
  RelatedNotificationSchema,
} from './index';

export const NotificationObjectSchema = z.object({
  id: z.string().startsWith('nob_'),
  entityId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  entityType: z.union([
    z.literal('transactions'),
    z.literal('wallets'),
    z.literal('docs'),
    z.literal('disputes'),
    z.literal('users'),
  ]),
});

export class NotificationObjectDto extends createZodDto(
  NotificationObjectSchema,
) {}

export interface CompleteNotificationObject
  extends z.infer<typeof NotificationObjectSchema> {
  notifications: CompleteNotification[];
  NotificationChange: CompleteNotificationChange[];
}

/**
 * RelatedNotificationObjectSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedNotificationObjectSchema: z.ZodSchema<CompleteNotificationObject> =
  z.lazy(() =>
    NotificationObjectSchema.extend({
      notifications: RelatedNotificationSchema.array(),
      NotificationChange: RelatedNotificationChangeSchema.array(),
    }),
  );
