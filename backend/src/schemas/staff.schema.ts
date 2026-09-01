import { z } from 'zod';

export const getAssignedPatientsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Discharged']).optional(),
    search: z.string().optional(),
  }),
});

export const getUpcomingVisitsQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().positive().optional().default(7),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getRecentVisitsQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().positive().optional().default(7),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAlertsQuerySchema = z.object({
  query: z.object({
    read: z.enum(['true', 'false']).optional(),
    type: z.enum(['RedFlag', 'ReferralPending', 'MedicationDue', 'VisitOverdue']).optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const markAlertReadParamsSchema = z.object({
  params: z.object({
    alertId: z.string().min(1, 'Alert ID is required'),
  }),
});

export type GetAssignedPatientsQuerySchema = z.infer<typeof getAssignedPatientsQuerySchema>;
export type GetUpcomingVisitsQuerySchema = z.infer<typeof getUpcomingVisitsQuerySchema>;
export type GetRecentVisitsQuerySchema = z.infer<typeof getRecentVisitsQuerySchema>;
export type GetAlertsQuerySchema = z.infer<typeof getAlertsQuerySchema>;
export type MarkAlertReadParamsSchema = z.infer<typeof markAlertReadParamsSchema>;