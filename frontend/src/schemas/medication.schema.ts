import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Create Medication — matches backend `createMedicationSchema.body`
// ─────────────────────────────────────────────────────────────
export const createMedicationSchema = z.object({
  name: z.string().trim().min(1, 'Medication name is required'),
  dosage: z.string().trim().min(1, 'Dosage is required'),
  frequency: z.string().trim().min(1, 'Frequency is required'),
  route: z.string().trim().min(1, 'Route is required'),
  administeredAt: z.enum(['Home', 'Hospital']),
});

// ─────────────────────────────────────────────────────────────
// Update Status — matches backend `updateMedicationStatusSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateMedicationStatusSchema = z.object({
  status: z.enum(['Ordered', 'Given']),
});

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getMedicationsQuerySchema = z.object({
  status: z.enum(['Ordered', 'Given']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateMedicationFormData = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationStatusFormData = z.infer<
  typeof updateMedicationStatusSchema
>;
export type GetMedicationsQueryFormData = z.infer<typeof getMedicationsQuerySchema>;