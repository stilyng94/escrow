import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import * as imports from '../../../utils/utils';

export const VerificationTokenSchema = z.object({
  id: z.string().startsWith('vft_'),
  /**
   * The target property of verification, e.g. "email" or "phone number"
   */
  target: z.string(),
  type: z.union([z.literal('login'), z.literal('approval')]),
  /**
   * When it's safe to delete this token
   */
  expiresAt: z.from(imports.nullCoerceDateSchema).nullish(),
  createdAt: z.coerce.date(),
  /**
   * The secret key used to generate the otp
   */
  secret: z.string(),
  /**
   * The algorithm used to generate the otp
   */
  algorithm: z.string(),
  /**
   * The number of digits in the otp
   */
  digits: z.number().int(),
  /**
   * The number of seconds the otp is valid for
   */
  period: z.number().int(),
});

export class VerificationTokenDto extends createZodDto(
  VerificationTokenSchema,
) {}
