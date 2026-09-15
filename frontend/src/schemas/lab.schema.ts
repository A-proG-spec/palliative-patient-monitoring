import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Fragments — mirror backend `lab.schema.ts`
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

// ─────────────────────────────────────────────────────────────
// Create Lab Order — matches backend `createLabSchema.body`
// ─────────────────────────────────────────────────────────────
export const createLabSchema = z.object({
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
});

// ─────────────────────────────────────────────────────────────
// Update Lab Result — matches backend `updateLabResultSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateLabResultSchema = z.object({
  datePerformed: dateString,
  result: z.string().trim().min(1, 'Result is required'),
  referenceRange: z.string().trim().optional(),
  abnormalFlag: z.enum(['Low', 'High', 'Critical', 'Normal']).optional(),
  resultNotes: z.string().trim().optional(),
  performedBy: z.string().trim().optional(),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateLabFormData = z.infer<typeof createLabSchema>;
export type UpdateLabResultFormData = z.infer<typeof updateLabResultSchema>;