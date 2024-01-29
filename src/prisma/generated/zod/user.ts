import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import * as imports from '../../../utils/utils';
import {
  CompleteDispute,
  CompleteNotification,
  CompleteNotificationChange,
  CompleteRefreshToken,
  CompleteRole,
  CompleteTransaction,
  CompleteWallet,
  RelatedDisputeSchema,
  RelatedNotificationChangeSchema,
  RelatedNotificationSchema,
  RelatedRefreshTokenSchema,
  RelatedRoleSchema,
  RelatedTransactionSchema,
  RelatedWalletSchema,
} from './index';

export const UserSchema = z.object({
  id: z.string().startsWith('usr_'),
  phoneNumber: z.from(imports.phoneNumberSchema),
  username: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isVerified: z.boolean(),
  roleId: z.string(),
  /**
   * z.string().email().optional()
   */
  email: z.string().nullish(),
  customerCode: z.string().nullish(),
});

export class UserDto extends createZodDto(UserSchema) {}

export interface CompleteUser extends z.infer<typeof UserSchema> {
  refreshToken: CompleteRefreshToken[];
  buyerTransactions: CompleteTransaction[];
  sellerTransactions: CompleteTransaction[];
  role: CompleteRole;
  dispute: CompleteDispute[];
  notifications: CompleteNotification[];
  notificationChange: CompleteNotificationChange[];
  wallet?: CompleteWallet | null;
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() =>
  UserSchema.extend({
    refreshToken: RelatedRefreshTokenSchema.array(),
    buyerTransactions: RelatedTransactionSchema.array(),
    sellerTransactions: RelatedTransactionSchema.array(),
    role: RelatedRoleSchema,
    dispute: RelatedDisputeSchema.array(),
    notifications: RelatedNotificationSchema.array(),
    notificationChange: RelatedNotificationChangeSchema.array(),
    wallet: RelatedWalletSchema.nullish(),
  }),
);
