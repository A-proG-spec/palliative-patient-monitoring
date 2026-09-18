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
// Create Lab Order (metadata only — no results yet)
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

    // ── Encounter link (optional) ──
    hospitalAdmissionId: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Update Lab Result — matches the `LabResult` model
// ─────────────────────────────────────────────────────────────
export const updateLabResultSchema = z.object({
  body: z.object({
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
    hemoglobin: z.number().optional(),
    hematocrit: z.number().optional(),
    rbcCount: z.number().optional(),
    wbcCount: z.number().optional(),
    plateletCount: z.number().optional(),
    mcv: z.number().optional(),
    mch: z.number().optional(),
    mchc: z.number().optional(),
    rdw: z.number().optional(),

    // ── Differential leukocyte count ──
    neutrophils: z.number().optional(),
    neutrophilsAbs: z.number().optional(),
    lymphocytes: z.number().optional(),
    lymphocytesAbs: z.number().optional(),
    monocytes: z.number().optional(),
    monocytesAbs: z.number().optional(),
    eosinophils: z.number().optional(),
    eosinophilsAbs: z.number().optional(),
    basophils: z.number().optional(),
    basophilsAbs: z.number().optional(),

    bloodFilm: z.string().trim().optional(),
    additionalBloodTests: z.string().trim().optional(),

    // ── Chemistry ──
    glucose: z.number().optional(),
    urea: z.number().optional(),
    creatinine: z.number().optional(),
    uricAcid: z.number().optional(),
    totalProtein: z.number().optional(),
    albumin: z.number().optional(),
    totalBilirubin: z.number().optional(),
    directBilirubin: z.number().optional(),
    alt: z.number().optional(),
    ast: z.number().optional(),
    alp: z.number().optional(),
    totalCholesterol: z.number().optional(),
    triglycerides: z.number().optional(),
    hdlC: z.number().optional(),
    ldlC: z.number().optional(),
    sodium: z.number().optional(),
    potassium: z.number().optional(),
    chloride: z.number().optional(),
    calcium: z.number().optional(),
    phosphate: z.number().optional(),

    // ── Hormones ──
    tsh: z.number().optional(),
    freeT4: z.number().optional(),
    freeT3: z.number().optional(),
    fsh: z.number().optional(),
    lh: z.number().optional(),
    prolactin: z.number().optional(),
    estradiol: z.number().optional(),
    progesterone: z.number().optional(),
    testosterone: z.number().optional(),
    cortisol: z.number().optional(),
    insulin: z.number().optional(),
    hcg: z.number().optional(),
    betaHcg: z.number().optional(),
    growthHormone: z.number().optional(),
    acth: z.number().optional(),
    pth: z.number().optional(),

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
  }),
});

// ─────────────────────────────────────────────────────────────
// Status transitions
// ─────────────────────────────────────────────────────────────
export const cancelLabSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().optional(),
    })
    .optional()
    .default({}),
});

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

// Note: `getPatientParamsSchema` used to live here — it was moved to
// `patient.schema.ts` to keep patient-param validation in one place.
export const getLabParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    labId: z.string().min(1, 'Lab ID is required'),
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