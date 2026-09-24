import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Staff approvals
// ─────────────────────────────────────────────────────────────

export const approveStaffSchema = z.object({
  body: z.object({
    role: z.enum(
      [ 'Physician',  'Nurse',  'Pharmacist',  'Radiologist',  'LaboratoryTechnician',  'Physiologist',  'Psychiatrist',  'Psychologist',  'SocialWorker', 'SpiritualPerson'],
      {
        message:
          'Invalid role. Must be Physician, Nurse, Pharmacist, Radiologist, or LaboratoryTechnician',
      },
    ),
  }),
});

// ─────────────────────────────────────────────────────────────
// Close case
// ─────────────────────────────────────────────────────────────

export const closeCaseSchema = z.object({
  body: z.object({
    reason: z.enum(['Improved', 'Deceased'], {
      message: 'Invalid reason. Must be Improved or Deceased',
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().optional().default(20),
    read: z.enum(['true', 'false']).optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Admin patients list
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
// Staff management
// ─────────────────────────────────────────────────────────────

export const getStaffListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Pending', 'Rejected', 'Deleted', 'All']).optional(),
    role: z
      .enum(['Physician', 'Nurse', 'Pharmacist', 'Radiologist', 'LaboratoryTechnician'])
      .optional(),
    search: z.string().trim().optional(),
  }),
});

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
      role: z
        .enum(['Physician', 'Nurse', 'Pharmacist', 'Radiologist', 'LaboratoryTechnician'])
        .optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.phone !== undefined ||
        data.role !== undefined,
      { message: 'At least one field must be provided' },
    ),
});

export const deleteStaffSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().max(500).optional(),
    })
    .optional()
    .default({}),
});

// ─────────────────────────────────────────────────────────────
// Staff performance
// ─────────────────────────────────────────────────────────────

export const getStaffPerformanceListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().trim().optional(),
    role: z
      .enum(['TeamLeader', 'Physician', 'Nurse', 'Pharmacist', 'Radiologist', 'LaboratoryTechnician'])
      .optional(),
  }),
});

export const getStaffPerformanceParamsSchema = z.object({
  params: z.object({
    staffId: z.string().min(1, 'Staff ID is required'),
  }),
});

export const getStaffActivityQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
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
export type GetStaffListQuerySchema = z.infer<typeof getStaffListQuerySchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;
export type DeleteStaffSchema = z.infer<typeof deleteStaffSchema>;
export type GetStaffPerformanceListQuerySchema = z.infer<
  typeof getStaffPerformanceListQuerySchema
>;
export type GetStaffPerformanceParamsSchema = z.infer<
  typeof getStaffPerformanceParamsSchema
>;
export type GetStaffActivityQuerySchema = z.infer<typeof getStaffActivityQuerySchema>;