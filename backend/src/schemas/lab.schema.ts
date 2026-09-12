import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Reusable fragments
// ─────────────────────────────────────────────────────────────
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)');

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Invalid time format (expected HH:mm)');

const labCategoryEnum = z.enum([
  'Hematology',
  'Chemistry',
  'Hormone',
  'Urinalysis',
  'Stool',
  'Microbiology',
  'Histopathology',
  'Immunology',
  'Cardiac',
]);

const labPriorityEnum = z.enum(['Routine', 'Urgent', 'Emergency']);
const labStatusEnum = z.enum(['Ordered', 'Completed', 'Cancelled']);
const abnormalFlagEnum = z.enum(['Low', 'High', 'Critical', 'Normal']);

// ─────────────────────────────────────────────────────────────
// Create Lab Order
// ─────────────────────────────────────────────────────────────
export const createLabSchema = z.object({
  body: z.object({
    // ── Section 1: Ordering context ──
    wardClinic: z.string().trim().optional(),
    physicianRequester: z
      .string()
      .trim()
      .min(1, 'Physician/Requester is required'),
    contactExtension: z.string().trim().optional(),

    // ── Section 2: Test identification ──
    category: labCategoryEnum,
    testName: z.string().trim().min(1, 'Test name is required'),
    otherText: z.string().trim().optional(),
    specimenType: z.string().trim().optional(),
    specimenSite: z.string().trim().optional(),

    // ── Section 3: Clinical context ──
    clinicalHistory: z.string().trim().optional(),

    // ── Section 4: Priority ──
    priority: labPriorityEnum.optional(),

    // ── Section 5: Collection timestamps ──
    collectionDate: dateString.optional(),
    collectionTime: timeString.optional(),

    // ── Core ──
    dateOrdered: dateString,
    location: z.enum(['Home', 'Hospital']),

    // ── Header overrides (rare) ──
    hospitalClinic: z.string().trim().optional(),
    departmentLaboratory: z.string().trim().optional(),

    // ── Encounter links ──
    admissionId: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Update Lab Result
// ─────────────────────────────────────────────────────────────
export const updateLabResultSchema = z.object({
  body: z.object({
    datePerformed: dateString,
    result: z.string().trim().min(1, 'Result is required'),
    referenceRange: z.string().trim().optional(),
    abnormalFlag: abnormalFlagEnum.optional(),
    resultNotes: z.string().trim().optional(),
    performedBy: z.string().trim().optional(),
    receivedDate: dateString.optional(),
    receivedTime: timeString.optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Cancel (no body required — status flip only)
// ─────────────────────────────────────────────────────────────
export const cancelLabSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().optional(),
    })
    .optional()
    .default({}),
});

// ─────────────────────────────────────────────────────────────
// Delete (soft delete — optional reason)
// ─────────────────────────────────────────────────────────────
export const deleteLabSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().optional(),
    })
    .optional()
    .default({}),
});

// ─────────────────────────────────────────────────────────────
// Queries & Params
// ─────────────────────────────────────────────────────────────
export const getLabsQuerySchema = z.object({
  query: z.object({
    status: labStatusEnum.optional(),
    category: labCategoryEnum.optional(),
    priority: labPriorityEnum.optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getLabParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    labId: z.string().min(1, 'Lab ID is required'),
  }),
});

export const getPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateLabSchema = z.infer<typeof createLabSchema>;
export type UpdateLabResultSchema = z.infer<typeof updateLabResultSchema>;
export type CancelLabSchema = z.infer<typeof cancelLabSchema>;
export type DeleteLabSchema = z.infer<typeof deleteLabSchema>;
export type GetLabsQuerySchema = z.infer<typeof getLabsQuerySchema>;
export type GetLabParamsSchema = z.infer<typeof getLabParamsSchema>;
export type GetPatientParamsSchema = z.infer<typeof getPatientParamsSchema>;