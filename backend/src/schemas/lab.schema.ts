import { z } from 'zod';

export const createLabSchema = z.object({
  body: z.object({
    testName: z.string().min(1, 'Test name is required'),
    dateOrdered: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    location: z.enum(['Home', 'Hospital']),
  }),
});

export const updateLabResultSchema = z.object({
  body: z.object({
    datePerformed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    result: z.string().min(1, 'Result is required'),
  }),
});

export const getLabsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Ordered', 'Completed']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getLabParamsSchema = z.object({
  params: z.object({
    labId: z.string().min(1, 'Lab ID is required'),
  }),
});

export type CreateLabSchema = z.infer<typeof createLabSchema>;
export type UpdateLabResultSchema = z.infer<typeof updateLabResultSchema>;
export type GetLabsQuerySchema = z.infer<typeof getLabsQuerySchema>;