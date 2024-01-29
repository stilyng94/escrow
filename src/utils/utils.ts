import { VerificationTypes } from '@/auth/auth.dto';
import { z } from 'nestjs-zod/z';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

export const asyncScrypt = promisify(scrypt);
export const asyncRandomBytes = promisify(randomBytes);

export const OTP_WINDOW: Record<VerificationTypes, { window: number }> = {
  login: { window: 0 },
  approval: { window: 0 },
};

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

export const phoneNumberSchema = z
  .string()
  .regex(phoneRegex, { message: 'phone number invalid' });

export const coerceDateSchema = z.coerce.date();
export const nullCoerceDateSchema = coerceDateSchema.nullable();
