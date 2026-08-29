// src/schemas/lab.schema.ts

import { z } from 'zod';

export const createLabSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  dateOrdered: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  location: z.enum(['Home', 'Hospital'], {
    required_error: 'Location is required',
  }),
});

export const updateLabResultSchema = z.object({
  datePerformed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  result: z.string().min(1, 'Result is required'),
});

export type CreateLabFormData = z.infer<typeof createLabSchema>;
export type UpdateLabResultFormData = z.infer<typeof updateLabResultSchema>;
