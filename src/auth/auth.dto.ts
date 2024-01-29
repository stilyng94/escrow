import { UserSchema, VerificationTokenSchema } from '@/prisma/generated/zod';
import { UserWithRoleSchema } from '@/user/user.dto';
import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'nestjs-zod/z';

const tokenPayloadSchema = z.object({
  id: z.string().cuid2(),
  isVerified: z.boolean().default(false).optional(),
});

export class TokenPayloadDto extends createZodDto(tokenPayloadSchema) {}

const LoginSchema = z.lazy(() => UserSchema.pick({ phoneNumber: true }));

export class LoginDto extends createZodDto(LoginSchema) {}

const LoginResponseSchema = z.object({
  message: z.string(),
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

const VerificationTypesSchema = VerificationTokenSchema.pick({
  type: true,
});

export type VerificationTypes = z.infer<typeof VerificationTypesSchema>['type'];

export class LoginCallbackResponseDto extends createZodDto(
  z.object({ accessToken: z.string(), refreshToken: z.string() }),
) {}

const LoginCompleteRequestSchema = VerificationTokenSchema.pick({
  type: true,
  target: true,
}).merge(z.object({ code: z.string().length(6) }));

export class LoginCompleteRequestDTO extends createZodDto(
  LoginCompleteRequestSchema,
) {}

const CreateUserSchema = z.lazy(() => UserSchema.pick({ phoneNumber: true }));

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export const AUTH_EVENTS = {
  login: { event: 'auth.login', topic: 'authLogin' },
  verified: { event: 'auth.verified', topic: 'authVerified' },
} as const;

const loginEventSchema = z.lazy(() =>
  UserWithRoleSchema.pick({
    id: true,
    phoneNumber: true,
  }).merge(z.object({ otp: z.string().length(6) })),
);

export type LoginEventDto = z.infer<typeof loginEventSchema>;

const verifyAccountSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
});

export class verifyAccountDto extends createZodDto(verifyAccountSchema) {}
