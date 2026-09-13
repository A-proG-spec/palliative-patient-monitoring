import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Update profile
// ─────────────────────────────────────────────────────────────
// Staff may update: name, phone
// Admin may update: name only
// Email is intentionally NOT editable (would need re-verification)
// Role / status / isEmailVerified are admin-managed — never client-editable
// ─────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters')
      .optional(),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone number must be at least 10 characters')
      .max(20, 'Phone number is too long')
      .optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────
// confirmPassword is accepted (frontend already sends it) but ignored
// server-side — password matching is a client concern. Kept in the
// schema as optional so it doesn't fail validation.
// ─────────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) =>
        !data.confirmPassword || data.confirmPassword === data.newPassword,
      {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      },
    )
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from the current password',
      path: ['newPassword'],
    }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;