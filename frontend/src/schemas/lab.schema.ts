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
const abnormalFlagEnum = z.enum(['Low', 'High', 'Critical', 'Normal']);

/**
 * Optional enum that tolerates the Select placeholder value ('').
 * Mirrors the backend's `optionalEnum` helper.
 */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

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

  // ── Header overrides (rare) ──
  hospitalClinic: z.string().trim().optional(),
  departmentLaboratory: z.string().trim().optional(),

  // ── Encounter link (optional) ──
  hospitalAdmissionId: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// Update Lab Result — matches backend `updateLabResultSchema.body`
//
// NOTE: Every numeric analyte is optional. CBC panels send
// only the fields the technician filled in.
// ─────────────────────────────────────────────────────────────
export const updateLabResultSchema = z.object({
  // ── Report info ──
  reportNumber: z.string().trim().optional(),
  collectedAt: dateString.optional(),
  reportedAt: dateString.optional(),
  verifiedAt: dateString.optional(),

  // ── Stool ──
  stoolMacroscopic: z.string().trim().optional(),
  stoolChemical: z.string().trim().optional(),
  stoolMicroscopic: z.string().trim().optional(),
  stoolAdditional: z.string().trim().optional(),

  // ── Urine ──
  urineChemical: z.string().trim().optional(),
  urineMicroscopic: z.string().trim().optional(),
  urineAdditional: z.string().trim().optional(),

  // ── CBC ──
  hemoglobin: z.coerce.number().optional(),
  hematocrit: z.coerce.number().optional(),
  rbcCount: z.coerce.number().optional(),
  wbcCount: z.coerce.number().optional(),
  plateletCount: z.coerce.number().optional(),
  mcv: z.coerce.number().optional(),
  mch: z.coerce.number().optional(),
  mchc: z.coerce.number().optional(),
  rdw: z.coerce.number().optional(),

  // ── Differential leukocyte count ──
  neutrophils: z.coerce.number().optional(),
  neutrophilsAbs: z.coerce.number().optional(),
  lymphocytes: z.coerce.number().optional(),
  lymphocytesAbs: z.coerce.number().optional(),
  monocytes: z.coerce.number().optional(),
  monocytesAbs: z.coerce.number().optional(),
  eosinophils: z.coerce.number().optional(),
  eosinophilsAbs: z.coerce.number().optional(),
  basophils: z.coerce.number().optional(),
  basophilsAbs: z.coerce.number().optional(),

  bloodFilm: z.string().trim().optional(),
  additionalBloodTests: z.string().trim().optional(),

  // ── Chemistry ──
  glucose: z.coerce.number().optional(),
  urea: z.coerce.number().optional(),
  creatinine: z.coerce.number().optional(),
  uricAcid: z.coerce.number().optional(),
  totalProtein: z.coerce.number().optional(),
  albumin: z.coerce.number().optional(),
  totalBilirubin: z.coerce.number().optional(),
  directBilirubin: z.coerce.number().optional(),
  alt: z.coerce.number().optional(),
  ast: z.coerce.number().optional(),
  alp: z.coerce.number().optional(),
  totalCholesterol: z.coerce.number().optional(),
  triglycerides: z.coerce.number().optional(),
  hdlC: z.coerce.number().optional(),
  ldlC: z.coerce.number().optional(),
  sodium: z.coerce.number().optional(),
  potassium: z.coerce.number().optional(),
  chloride: z.coerce.number().optional(),
  calcium: z.coerce.number().optional(),
  phosphate: z.coerce.number().optional(),

  // ── Hormones ──
  tsh: z.coerce.number().optional(),
  freeT4: z.coerce.number().optional(),
  freeT3: z.coerce.number().optional(),
  fsh: z.coerce.number().optional(),
  lh: z.coerce.number().optional(),
  prolactin: z.coerce.number().optional(),
  estradiol: z.coerce.number().optional(),
  progesterone: z.coerce.number().optional(),
  testosterone: z.coerce.number().optional(),
  cortisol: z.coerce.number().optional(),
  insulin: z.coerce.number().optional(),
  hcg: z.coerce.number().optional(),
  betaHcg: z.coerce.number().optional(),
  growthHormone: z.coerce.number().optional(),
  acth: z.coerce.number().optional(),
  pth: z.coerce.number().optional(),

  // ── General ──
  interpretation: z.string().trim().optional(),
  comments: z.string().trim().optional(),

  // ── Header-level fields ──
  datePerformed: dateString.optional(),
  performedBy: z.string().trim().optional(),
  abnormalFlag: abnormalFlagEnum.optional(),
  resultNotes: z.string().trim().optional(),
  receivedDate: dateString.optional(),
  receivedTime: timeString.optional(),

  // ── Legacy freeform result (frontend-only, still submitted) ──
  // The backend `updateLabResultSchema` does NOT define `result`,
  // but `lab.service.updateLabResult` reads it from the header.
  // Keep it here so the generic form can submit it.
  result: z.string().trim().optional(),
  referenceRange: z.string().trim().optional(),
});

// ─────────────────────────────────────────────────────────────
// Cancel
// ─────────────────────────────────────────────────────────────
export const cancelLabSchema = z
  .object({
    reason: z.string().trim().optional(),
  })
  .optional()
  .default({});

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getLabsQuerySchema = z.object({
  status: z.enum(['Ordered', 'Completed', 'Cancelled']).optional(),
  category: labCategoryEnum.optional(),
  priority: labPriorityEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateLabFormData = z.infer<typeof createLabSchema>;
export type UpdateLabResultFormData = z.infer<typeof updateLabResultSchema>;
export type CancelLabFormData = z.infer<typeof cancelLabSchema>;
export type GetLabsQueryFormData = z.infer<typeof getLabsQuerySchema>;