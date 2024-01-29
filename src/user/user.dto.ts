import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { RoleSchema, UserSchema, WalletSchema } from '@/prisma/generated/zod';
import { createPaginatedResponseSchema } from '@/shared/shared.dto';
import { phoneNumberSchema } from '@/utils/utils';

export const UserWithRoleSchema = UserSchema.omit({ roleId: true }).merge(
  z.object({ role: z.lazy(() => RoleSchema.pick({ name: true })) }),
);

export class UserWithRoleDto extends createZodDto(UserWithRoleSchema) {}

export class PaginatedUserResponseDto extends createZodDto(
  createPaginatedResponseSchema(UserWithRoleSchema),
) {}

export const userUpdateSchema = z.object({
  roleId: z.string().startsWith('rol_').optional(),
  isVerified: z.boolean().optional(),
  customerCode: z.string().optional(),
});

export class UserUpdateDto extends createZodDto(userUpdateSchema) {}

export const UserWithWalletSchema = UserSchema.omit({ roleId: true }).merge(
  z.object({
    role: z.lazy(() => RoleSchema.pick({ name: true })),
    wallet: z.lazy(() => WalletSchema),
  }),
);

export class UserWithWalletDto extends createZodDto(UserWithWalletSchema) {}

export const GetUserViaContactResponseSchema = UserSchema.pick({
  id: true,
  email: true,
  phoneNumber: true,
  username: true,
});

export class GetUserViaContactResponseDto extends createZodDto(
  GetUserViaContactResponseSchema,
) {}

export const GetUserViaContactSchema = z.from(phoneNumberSchema);
export type GetUserViaContactDto = z.infer<typeof GetUserViaContactSchema>;
