import { z } from 'zod';


const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

/** Tolerates the Select placeholder value ('') */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.enum(values).optional());

/** Optional number that tolerates empty strings from number inputs */
const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);

/** Optional integer score, 0–10 */
const optionalPainScore = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().min(0).max(10).optional(),
);

export const createHospiceNursingAssessmentSchema = z.object({
  hospitalAdmissionId: z.string().optional(),
  assessmentDate: dateString.optional(),
  assessedByStaffId: z.string().optional(),

  // ── General Observation ──
  levelOfConsciousness: optionalEnum([
    'Alert', 'Drowsy', 'Confused', 'Unresponsive', 'Comatose',
  ] as const),
  orientation: z.array(z.string()).optional().default([]),
  generalAppearance: z.array(z.string()).optional().default([]),

  // ── Vital Signs ──
  bloodPressure: z.string().optional(),
  pulseRate: optionalNumber,
  respiratoryRate: optionalNumber,
  temperature: optionalNumber,
  oxygenSaturation: optionalNumber,
  weightKg: optionalNumber,
  heightCm: optionalNumber,

  // ── Pain ──
  painPresent: z.boolean().optional(),
  painScore: optionalPainScore,
  painLocation: z.array(z.string()).optional().default([]),
  painLocationOther: z.string().optional(),
  painCharacteristics: z.array(z.string()).optional().default([]),
  painReliefMeasures: z.array(z.string()).optional().default([]),
  painReliefOther: z.string().optional(),

  // ── Respiratory ──
  breathingPattern: optionalEnum([
    'Normal', 'Labored', 'Shallow', 'Rapid', 'Slow',
  ] as const),
  dyspneaSeverity: optionalEnum([
    'None', 'Mild', 'Moderate', 'Severe',
  ] as const),
  oxygenTherapy: z.boolean().optional(),
  oxygenFlowRate: z.string().optional(),
  cough: optionalEnum(['None', 'Dry', 'Productive'] as const),
  sputumColor: optionalEnum([
    'None', 'Clear', 'Yellow', 'Green', 'Bloody',
  ] as const),
  respiratoryNotes: z.string().optional(),

  // ── Cardiovascular ──
  pulseRhythm: optionalEnum(['Regular', 'Irregular'] as const),
  peripheralEdema: optionalEnum([
    'None', 'Mild', 'Moderate', 'Severe',
  ] as const),
  edemaLocation: z.string().optional(),
  skinColor: optionalEnum([
    'Normal', 'Pale', 'Cyanotic', 'Jaundiced',
  ] as const),

  // ── Gastrointestinal ──
  appetite: optionalEnum([
    'Good', 'Fair', 'Poor', 'UnableToEat',
  ] as const),
  nausea: optionalEnum(['None', 'Mild', 'Moderate', 'Severe'] as const),
  vomiting: z.boolean().optional(),
  vomitingFrequency: z.string().optional(),
  bowelFunction: optionalEnum([
    'Normal', 'Constipation', 'Diarrhea', 'Incontinence',
  ] as const),
  lastBowelMovement: dateString.optional(),

  // ── Genitourinary ──
  urinaryFunction: optionalEnum([
    'Normal', 'Frequency', 'Retention', 'Incontinence', 'Catheterized',
  ] as const),
  urineAppearance: optionalEnum([
    'Clear', 'Cloudy', 'Bloody', 'Dark',
  ] as const),

  // ── Skin ──
  skinIntegrity: optionalEnum([
    'Intact', 'Dry', 'Fragile', 'WoundPresent', 'PressureUlcer',
  ] as const),
  pressureInjuryRisk: optionalEnum(['Low', 'Moderate', 'High'] as const),
  pressureUlcerPresent: z.boolean().optional(),
  pressureUlcerLocation: z.string().optional(),
  pressureUlcerStage: optionalEnum(['I', 'II', 'III', 'IV'] as const),

  // ── Mobility ──
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

  // ── Psychological ──
  emotionalStatus: optionalEnum([
    'Stable', 'Anxious', 'Depressed', 'Fearful', 'Agitated', 'Grieving',
  ] as const),
  communicationAbility: optionalEnum([
    'Normal', 'Impaired', 'NonVerbal',
  ] as const),
  cognitiveStatus: optionalEnum([
    'Intact', 'MildImpairment', 'SevereImpairment',
  ] as const),

  // ── Family / Caregiver ──
  primaryCaregiverName: z.string().optional(),
  primaryCaregiverRelationship: z.string().optional(),
  primaryCaregiverPhone: z.string().optional(),
  familySupport: optionalEnum([
    'Strong', 'Moderate', 'Limited', 'None',
  ] as const),
  caregiverStressLevel: optionalEnum(['Low', 'Moderate', 'High'] as const),

  // ── Spiritual / Cultural ──
  spiritualSupportRequested: z.boolean().optional(),
  religiousAffiliation: optionalEnum([
    'Orthodox', 'Muslim', 'Protestant', 'Catholic', 'Other',
  ] as const),
  religiousAffiliationOther: z.string().optional(),
  culturalConsiderations: z.string().optional(),

  // ── Nursing Diagnoses ──
  nursingDiagnoses: z.array(z.string()).optional().default([]),
  nursingDiagnosesOther: z.string().optional(),

  // ── Nurse's Summary ──
  nurseSummary: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateHospiceNursingFormData = z.infer<
  typeof createHospiceNursingAssessmentSchema
>;