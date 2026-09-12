import { z } from 'zod';

export const approveStaffSchema = z.object({
  body: z.object({
    role: z.enum(['TeamLeader', 'Physician', 'Nurse'], {
      message: 'Invalid role. Must be TeamLeader, Physician, or Nurse',
    }),
  }),
});

export const closeCaseSchema = z.object({
  body: z.object({
    reason: z.enum(['Improved', 'Deceased'], {
      message: 'Invalid reason. Must be Improved or Deceased',
    }),
  }),
});

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().optional().default(20),
    read: z.enum(['true', 'false']).optional(),
  }),
});

export const getAdminPatientsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Discharged']).optional(),
    search: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Reports
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
// Types
// ─────────────────────────────────────────────────────────────
export type ApproveStaffSchema = z.infer<typeof approveStaffSchema>;
export type CloseCaseSchema = z.infer<typeof closeCaseSchema>;
export type GetNotificationsQuerySchema = z.infer<typeof getNotificationsQuerySchema>;
export type GetAdminPatientsQuerySchema = z.infer<typeof getAdminPatientsQuerySchema>;
export type GetReportsQuerySchema = z.infer<typeof getReportsQuerySchema>;
export type GetVisitEditHistoryParamsSchema = z.infer<typeof getVisitEditHistoryParamsSchema>;