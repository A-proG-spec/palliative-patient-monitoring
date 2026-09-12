import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Create Lab Order
// ─────────────────────────────────────────────────────────────
export const createLabSchema = z.object({
  body: z.object({
    // ── Test identification ──
    testName: z.string().min(1, 'Test name is required'),
    category: z
      .enum([
        'Hematology',
        'Chemistry',
        'Hormone',
        'Urinalysis',
        'Stool',
        'Microbiology',
        'Histopathology',
        'Immunology',
        'Cardiac',
      ])
      .optional(),
    otherText: z.string().optional(),

    // ── Order details ──
    dateOrdered: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    location: z.enum(['Home', 'Hospital']),
    priority: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),

    // ── Clinical context ──
    clinicalHistory: z.string().optional(),

    // ── Specimen ──
    specimenType: z.string().optional(),
    specimenSite: z.string().optional(),

    // ── Collection timestamps ──
    collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    collectionTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),

    // ── Encounter links ──
    admissionId: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Update Lab Result
// ─────────────────────────────────────────────────────────────
export const updateLabResultSchema = z.object({
  body: z.object({
    datePerformed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    result: z.string().min(1, 'Result is required'),
    referenceRange: z.string().optional(),
    abnormalFlag: z.enum(['Low', 'High', 'Critical', 'Normal']).optional(),
    resultNotes: z.string().optional(),
    performedBy: z.string().optional(),
    receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    receivedTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Queries & Params
// ─────────────────────────────────────────────────────────────
export const getLabsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Ordered', 'Completed', 'Cancelled']).optional(),
    category: z
      .enum([
        'Hematology',
        'Chemistry',
        'Hormone',
        'Urinalysis',
        'Stool',
        'Microbiology',
        'Histopathology',
        'Immunology',
        'Cardiac',
      ])
      .optional(),
    priority: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getLabParamsSchema = z.object({
  params: z.object({
    labId: z.string().min(1, 'Lab ID is required'),
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateLabSchema = z.infer<typeof createLabSchema>;
export type UpdateLabResultSchema = z.infer<typeof updateLabResultSchema>;
export type GetLabsQuerySchema = z.infer<typeof getLabsQuerySchema>;
export type GetLabParamsSchema = z.infer<typeof getLabParamsSchema>;