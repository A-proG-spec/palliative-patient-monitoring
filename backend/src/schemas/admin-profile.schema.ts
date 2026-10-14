import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// Admin Profile Schemas
// ═════════════════════════════════════════════════════════════

export const updateAdminProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(80, 'Name must be at most 80 characters')
        .optional(),
    })
    .refine((d) => d.name !== undefined, {
      message: 'Provide at least one field to update',
    }),
});

export const changeAdminPasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (d) =>
        d.confirmPassword === undefined ||
        d.confirmPassword === d.newPassword,
      { message: "Passwords don't match", path: ['confirmPassword'] },
    ),
});

export type UpdateAdminProfileBody = z.infer<
  typeof updateAdminProfileSchema
>['body'];

export type ChangeAdminPasswordBody = z.infer<
  typeof changeAdminPasswordSchema
>['body'];