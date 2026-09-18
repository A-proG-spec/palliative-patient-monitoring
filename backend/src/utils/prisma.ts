import { ApiError } from './ApiError.js';

/**
 * Convert a URL param string to a positive integer id.
 * Throws 400 if the value is not a valid id.
 */
export function toId(value: string | number | undefined | null, label = 'id'): number {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Invalid ${label}`);
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return n;
}

/**
 * Prisma `select` blocks that are reused across services.
 * (Keeps password/OTP fields out of user-facing responses.)
 */
export const staffSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const adminSafeSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;