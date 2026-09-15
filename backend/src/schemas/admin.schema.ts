import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Staff approvals (existing)
// ─────────────────────────────────────────────────────────────

export const approveStaffSchema = z.object({
  body: z.object({
    role: z.enum(['TeamLeader', 'Physician', 'Nurse'], {
      message: 'Invalid role. Must be TeamLeader, Physician, or Nurse',
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// Close case (existing)
// ─────────────────────────────────────────────────────────────

export const closeCaseSchema = z.object({
  body: z.object({
    reason: z.enum(['Improved', 'Deceased'], {
      message: 'Invalid reason. Must be Improved or Deceased',
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// Notifications (existing)
// ─────────────────────────────────────────────────────────────

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().optional().default(20),
    read: z.enum(['true', 'false']).optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Admin patients list (existing)
// ─────────────────────────────────────────────────────────────

export const getAdminPatientsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Discharged']).optional(),
    search: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Reports (existing)
// ─────────────────────────────────────────────────────────────

export const getReportsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  }),
});

export const getVisitEditHistoryParamsSchema = z.object({
  params: z.object({
    visitId: z.string().min(1, 'Visit ID is required'),
  }),
});

// ─────────────────────────────────────────────────────────────
// ── NEW: Staff management ──
// ─────────────────────────────────────────────────────────────

/**
 * List all staff (with soft-deleted records opt-in via `status=Deleted`).
 * `status` filter values:
 *   Active | Pending | Rejected   → status X, deletedAt null
 *   Deleted                       → deletedAt not null (any status)
 *   All                           → everything
 *   (omitted)                     → deletedAt null
 */
export const getStaffListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Pending', 'Rejected', 'Deleted', 'All']).optional(),
    role: z.enum(['TeamLeader', 'Physician', 'Nurse']).optional(),
    search: z.string().trim().optional(),
  }),
});

/**
 * Update a staff member. Only whitelisted fields are accepted.
 * Email changes are intentionally disallowed — they would need
 * re-verification. Role changes go through `approveStaff` for
 * pending users, but for active users this is a legitimate edit.
 */
export const updateStaffSchema = z.object({
  body: z
    .object({
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
      role: z.enum(['TeamLeader', 'Physician', 'Nurse']).optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.phone !== undefined ||
        data.role !== undefined,
      { message: 'At least one field must be provided' },
    ),
});

/**
 * Soft-delete a staff member. Optional reason is stored for audit.
 */
export const deleteStaffSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().max(500).optional(),
    })
    .optional()
    .default({}),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ApproveStaffSchema = z.infer<typeof approveStaffSchema>;
export type CloseCaseSchema = z.infer<typeof closeCaseSchema>;
export type GetNotificationsQuerySchema = z.infer<typeof getNotificationsQuerySchema>;
export type GetAdminPatientsQuerySchema = z.infer<typeof getAdminPatientsQuerySchema>;
export type GetReportsQuerySchema = z.infer<typeof getReportsQuerySchema>;
export type GetVisitEditHistoryParamsSchema = z.infer<typeof getVisitEditHistoryParamsSchema>;
export type GetStaffListQuerySchema = z.infer<typeof getStaffListQuerySchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;
export type DeleteStaffSchema = z.infer<typeof deleteStaffSchema>;