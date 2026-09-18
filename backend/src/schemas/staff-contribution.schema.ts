import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────
export const getStaffContributionParamsSchema = z.object({
  params: z.object({
    staffId: z.string().min(1, 'Staff ID is required'),
  }),
});

export const getStaffContributionDetailParamsSchema = z.object({
  params: z.object({
    staffId: z.string().min(1, 'Staff ID is required'),
    category: z.enum([
      'visits',
      'progress-notes',
      'hospice-nursing',
      'labs',
      'imaging',
      'medications',
      'referrals',
      'admissions',
      'discharges',
      'patients',
    ]),
  }),
});

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────
export const getStaffContributionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type GetStaffContributionParamsSchema = z.infer<
  typeof getStaffContributionParamsSchema
>;
export type GetStaffContributionDetailParamsSchema = z.infer<
  typeof getStaffContributionDetailParamsSchema
>;
export type GetStaffContributionQuerySchema = z.infer<
  typeof getStaffContributionQuerySchema
>;