import { NotificationObjectSchema } from '@/prisma/generated/zod';
import { phoneRegex } from '@/utils/utils';
import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'nestjs-zod/z';

export const createNotificationSchema = z.lazy(() =>
  NotificationObjectSchema.pick({
    entityId: true,
    entityType: true,
  }).extend({
    actorId: z.string(),
    notifiers: z.array(z.string()),
  }),
);

export class CreateNotificationDto extends createZodDto(
  createNotificationSchema,
) {}

export const sendPushNotificationSchema = z.lazy(() =>
  NotificationObjectSchema.pick({
    entityId: true,
    entityType: true,
  }).extend({
    notificationObjectId: z.string(),
    message: z.string(),
    topic: z.string(),
    title: z.string(),
    link: z.optional(z.string().url()),
  }),
);

export class SendPushNotificationDto extends createZodDto(
  sendPushNotificationSchema,
) {}

export const sendSmsNotificationSchema = z.object({
  to: z.string().regex(phoneRegex, { message: 'phone number invalid' }),
  subject: z.string().max(25),
  message: z.string().max(50),
});

export class SendSmsNotificationDto extends createZodDto(
  sendSmsNotificationSchema,
) {}
