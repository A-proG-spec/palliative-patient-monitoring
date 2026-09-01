import { z } from 'zod';

export const createMedicationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    route: z.string().min(1, 'Route is required'),
    administeredAt: z.enum(['Home', 'Hospital']),
  }),
});

export const updateMedicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Ordered', 'Given']),
  }),
});

export const getMedicationsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Ordered', 'Given']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getMedicationParamsSchema = z.object({
  params: z.object({
    medicationId: z.string().min(1, 'Medication ID is required'),
  }),
});

export type CreateMedicationSchema = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationStatusSchema = z.infer<typeof updateMedicationStatusSchema>;
export type GetMedicationsQuerySchema = z.infer<typeof getMedicationsQuerySchema>;