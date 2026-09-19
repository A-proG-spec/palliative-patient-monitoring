import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Update Profile — matches backend `updateProfileSchema.body`
// Admin: name only. Staff: name + phone. Email never editable.
// ─────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
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
});

// ─────────────────────────────────────────────────────────────
// Change Password — matches backend `changePasswordSchema.body`
//
// Backend enforces:
//   - min 8 chars
//   - at least one uppercase letter
//   - at least one number
//   - new !== current
//   - confirmPassword is optional & ignored server-side
// ─────────────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;