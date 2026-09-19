import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.enum(values).optional());

// ─────────────────────────────────────────────────────────────
// Create
//
// NOTE: `patientId` is NOT in the body — it comes from
// `req.params.patientId` (validated by getHospiceNursingPatientParamsSchema
// or getHospiceNursingParamsSchema depending on the route).
// ─────────────────────────────────────────────────────────────
export const createHospiceNursingAssessmentSchema = z.object({
  body: z.object({
    hospitalAdmissionId: z.string().optional(),
    assessmentDate: dateString.optional(),
    assessedByStaffId: z.string().optional(),

    // ── General Observation ──
    levelOfConsciousness: optionalEnum([
      'Alert', 'Drowsy', 'Confused', 'Unresponsive', 'Comatose',
    ] as const),
    orientation: z.array(z.string()).optional().default([]),
    generalAppearance: z.array(z.string()).optional().default([]),

    // ── Section C: Vital Signs ──
    bloodPressure: z.string().optional(),
    pulseRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    temperature: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weightKg: z.number().optional(),
    heightCm: z.number().optional(),

    // ── Section D: Pain ──
    painPresent: z.boolean().optional(),
    painScore: z.number().min(0).max(10).optional(),
    painLocation: z.array(z.string()).optional().default([]),
    painLocationOther: z.string().optional(),
    painCharacteristics: z.array(z.string()).optional().default([]),
    painReliefMeasures: z.array(z.string()).optional().default([]),
    painReliefOther: z.string().optional(),

    // ── Section E: Respiratory ──
    breathingPattern: optionalEnum(['Normal', 'Labored', 'Shallow', 'Rapid', 'Slow'] as const),
    dyspneaSeverity: optionalEnum(['None', 'Mild', 'Moderate', 'Severe'] as const),
    oxygenTherapy: z.boolean().optional(),
    oxygenFlowRate: z.string().optional(),
    cough: optionalEnum(['None', 'Dry', 'Productive'] as const),
    sputumColor: optionalEnum(['None', 'Clear', 'Yellow', 'Green', 'Bloody'] as const),
    respiratoryNotes: z.string().optional(),

    // ── Section F: Cardiovascular ──
    pulseRhythm: optionalEnum(['Regular', 'Irregular'] as const),
    peripheralEdema: optionalEnum(['None', 'Mild', 'Moderate', 'Severe'] as const),
    edemaLocation: z.string().optional(),
    skinColor: optionalEnum(['Normal', 'Pale', 'Cyanotic', 'Jaundiced'] as const),

    // ── Section G: Gastrointestinal ──
    appetite: optionalEnum(['Good', 'Fair', 'Poor', 'UnableToEat'] as const),
    nausea: optionalEnum(['None', 'Mild', 'Moderate', 'Severe'] as const),
    vomiting: z.boolean().optional(),
    vomitingFrequency: z.string().optional(),
    bowelFunction: optionalEnum(['Normal', 'Constipation', 'Diarrhea', 'Incontinence'] as const),
    lastBowelMovement: dateString.optional(),

    // ── Section H: Genitourinary ──
    urinaryFunction: optionalEnum([
      'Normal', 'Frequency', 'Retention', 'Incontinence', 'Catheterized',
    ] as const),
    urineAppearance: optionalEnum(['Clear', 'Cloudy', 'Bloody', 'Dark'] as const),

    // ── Section I: Skin ──
    skinIntegrity: optionalEnum([
      'Intact', 'Dry', 'Fragile', 'WoundPresent', 'PressureUlcer',
    ] as const),
    pressureInjuryRisk: optionalEnum(['Low', 'Moderate', 'High'] as const),
    pressureUlcerPresent: z.boolean().optional(),
    pressureUlcerLocation: z.string().optional(),
    pressureUlcerStage: optionalEnum(['I', 'II', 'III', 'IV'] as const),

    // ── Section J: Mobility ──
    mobilityStatus: optionalEnum([
      'Independent', 'RequiresAssistance', 'WheelchairDependent', 'Bedridden',
    ] as const),
    fallRisk: optionalEnum(['Low', 'Moderate', 'High'] as const),
    assistiveDevices: z.array(z.string()).optional().default([]),
    assistiveDevicesOther: z.string().optional(),

    // ── ADL ──
    feeding: optionalEnum(['Independent', 'NeedAssistance', 'Dependent'] as const),
    bathing: optionalEnum(['Independent', 'NeedAssistance', 'Dependent'] as const),
    dressing: optionalEnum(['Independent', 'NeedAssistance', 'Dependent'] as const),
    toileting: optionalEnum(['Independent', 'NeedAssistance', 'Dependent'] as const),
    mobility: optionalEnum(['Independent', 'NeedAssistance', 'Dependent'] as const),

    // ── Section L: Psychological ──
    emotionalStatus: optionalEnum([
      'Stable', 'Anxious', 'Depressed', 'Fearful', 'Agitated', 'Grieving',
    ] as const),
    communicationAbility: optionalEnum(['Normal', 'Impaired', 'NonVerbal'] as const),
    cognitiveStatus: optionalEnum(['Intact', 'MildImpairment', 'SevereImpairment'] as const),

    // ── Section M: Family / Caregiver ──
    primaryCaregiverName: z.string().optional(),
    primaryCaregiverRelationship: z.string().optional(),
    primaryCaregiverPhone: z.string().optional(),
    familySupport: optionalEnum(['Strong', 'Moderate', 'Limited', 'None'] as const),
    caregiverStressLevel: optionalEnum(['Low', 'Moderate', 'High'] as const),

    // ── Section N: Spiritual / Cultural ──
    spiritualSupportRequested: z.boolean().optional(),
    religiousAffiliation: optionalEnum([
      'Orthodox', 'Muslim', 'Protestant', 'Catholic', 'Other',
    ] as const),
    religiousAffiliationOther: z.string().optional(),
    culturalConsiderations: z.string().optional(),

    // ── Section O: Nursing Diagnoses ──
    nursingDiagnoses: z.array(z.string()).optional().default([]),
    nursingDiagnosesOther: z.string().optional(),

    // ── Section Q: Nurse's Summary ──
    nurseSummary: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────
export const updateHospiceNursingAssessmentSchema = z.object({
  body: createHospiceNursingAssessmentSchema.shape.body.partial(),
});

// ─────────────────────────────────────────────────────────────
// Queries — used for both the per-patient list and the admin
// "list all deleted" endpoint.
// ─────────────────────────────────────────────────────────────
export const getHospiceNursingQuerySchema = z.object({
  query: z.object({
    patientId: z.string().optional(),
    hospitalAdmissionId: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

// ─────────────────────────────────────────────────────────────
// Params
//
// `getHospiceNursingPatientParamsSchema` — for routes that only
// carry :patientId (list + create). Used on its own or merged
// with the query schema.
//
// `getHospiceNursingParamsSchema` — for routes that carry BOTH
// :patientId and :assessmentId (read, update, delete, restore).
// ─────────────────────────────────────────────────────────────
export const getHospiceNursingPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getHospiceNursingParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateHospiceNursingAssessmentSchema = z.infer<
  typeof createHospiceNursingAssessmentSchema
>;
export type UpdateHospiceNursingAssessmentSchema = z.infer<
  typeof updateHospiceNursingAssessmentSchema
>;
export type GetHospiceNursingQuerySchema = z.infer<
  typeof getHospiceNursingQuerySchema
>;
export type GetHospiceNursingPatientParamsSchema = z.infer<
  typeof getHospiceNursingPatientParamsSchema
>;
export type GetHospiceNursingParamsSchema = z.infer<
  typeof getHospiceNursingParamsSchema
>;