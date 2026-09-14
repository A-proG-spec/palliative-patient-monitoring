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
// Update Medication Status — matches backend
// `updateMedicationStatusSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateMedicationStatusSchema = z.object({
  status: z.enum(['Ordered', 'Given']),
});

export type CreateMedicationFormData = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationStatusFormData = z.infer<
  typeof updateMedicationStatusSchema
>;