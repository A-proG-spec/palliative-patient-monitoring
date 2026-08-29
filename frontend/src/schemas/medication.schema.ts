// src/schemas/medication.schema.ts

import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  administeredAt: z.enum(['Home', 'Hospital'], {
    required_error: 'Administered at is required',
  }),
});

export const updateMedicationStatusSchema = z.object({
  status: z.enum(['Ordered', 'Given'], {
    required_error: 'Status is required',
  }),
});

export type CreateMedicationFormData = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationStatusFormData = z.infer<typeof updateMedicationStatusSchema>;
