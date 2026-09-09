import { z } from 'zod';

export const createLabSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  dateOrdered: z.string().min(1, 'Date ordered is required'),
  location: z.enum(['Home', 'Hospital']),
});

export const updateLabResultSchema = z.object({
  datePerformed: z.string().min(1, 'Date performed is required'),
  result: z.string().min(1, 'Result is required'),
});

export type CreateLabFormData = z.infer<typeof createLabSchema>;
export type UpdateLabResultFormData = z.infer<typeof updateLabResultSchema>;
