import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

/**
 * Optional enum that tolerates the Select placeholder value ('').
 * Must match the backend's identical helper.
 */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

// ─────────────────────────────────────────────────────────────
// Canonical enums — must match backend + Prisma model
// ─────────────────────────────────────────────────────────────
export const ADMISSION_REFERRED_FROM_VALUES = [
  'InternalWard',
  'OutpatientDepartment',
  'ICU',
  'ExternalHospital',
  'Community',
  'Home',
  'Other',
] as const;

export const ADMISSION_REFERRAL_REASON_VALUES = [
  'PainManagement',
  'EndOfLifeCare',
  'SymptomControl',
  'HomeBasedCare',
  'PsychosocialSupport',
  'Other',
] as const;

export const ADMISSION_SYMPTOM_VALUES = [
  'Dyspnea',
  'Nausea',
  'Fatigue',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Other',
] as const;

export const ADMISSION_SPIRITUAL_SUPPORT_VALUES = [
  'ReligiousLeader',
  'Counselor',
  'Other',
] as const;

// ─────────────────────────────────────────────────────────────
// Create Admission — matches backend `createAdmissionSchema.body`
// ─────────────────────────────────────────────────────────────
export const createAdmissionSchema = z.object({
  // ── Section 1: Patient identification (snapshot — auto-filled) ──
  patientName: z.string().optional(),
  hospitalPatientId: z.string(),
  age: z.coerce.number().min(0).max(150).optional(),
  sex: z.enum(['Male', 'Female']).optional(),
  dateOfBirth: dateString.optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  // ── Section 2: Referral information ──
  referralId: z.string().min(1, 'A referral must be selected'),
  referredFrom: optionalEnum(ADMISSION_REFERRED_FROM_VALUES),
  referredFromOther: z.string().trim().optional(),
  referringClinician: z.string().trim().optional(),
  diagnosisAtReferral: z.string().trim().optional(),
  referralReason: optionalEnum(ADMISSION_REFERRAL_REASON_VALUES),
  referralReasonOther: z.string().trim().optional(),

  // ── Admission details (required) ──
  admissionDate: dateString,
  bedNumber: z.string().trim().min(1, 'Bed number is required'),
  ward: z.string().trim().min(1, 'Ward is required'),
  admittingPhysician: z
    .string()
    .trim()
    .min(1, 'Admitting physician is required'),
  careTeam: z.string().trim().min(1, 'Care team is required'),

  // ── Section 3: Medical Diagnosis ──
  primaryDiagnosis: z.string().trim().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional().default([]),
  diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']),
  comorbidities: z.array(z.string()).optional().default([]),

  // ── Section 4: Palliative Care Eligibility ──
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
  ppsScore: z.coerce.number().min(0).max(100),
  kpsScore: z.coerce.number().min(0).max(100).optional(),
  functionalStatus: z.enum([
    'FullyIndependent',
    'PartiallyDependent',
    'FullyDependent',
  ]),

  // ── Section 5: Pain & Symptom Assessment ──
  painScore: z.coerce.number().min(0).max(10),
  painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']),
  symptomsPresent: z
    .array(z.enum(ADMISSION_SYMPTOM_VALUES))
    .optional()
    .default([]),
  symptomsPresentOther: z.string().trim().optional(),

  // ── Section 6: Psychosocial ──
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']),
  familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']),
  socialChallenges: z.string().trim().optional(),

  // ── Section 7: Spiritual Care ──
  spiritualConcerns: z.boolean(),
  spiritualNeedsDescription: z.string().trim().optional(),
  spiritualSupportPreferred: optionalEnum(ADMISSION_SPIRITUAL_SUPPORT_VALUES),
  spiritualSupportPreferredOther: z.string().trim().optional(),

  // ── Section 8: Initial Care Plan ──
  painManagementPlan: z
    .string()
    .trim()
    .min(1, 'Pain management plan is required'),
  medicationPlan: z.string().trim().min(1, 'Medication plan is required'),
  nursingCarePlan: z.string().trim().min(1, 'Nursing care plan is required'),
  homeBasedCareRequired: z.boolean(),
  psychosocialSupportPlan: z.string().trim().optional(),
  physiotherapyRequired: z.boolean(),

  // ── Section 10: Admission Decision ──
  admittedToHospiceUnit: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────
// Update Admission — matches backend `updateAdmissionSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateAdmissionSchema = z.object({
  dischargeDate: dateString.optional(),
  dischargeReason: optionalEnum(['Improved', 'Deceased'] as const),
  status: z.enum(['Active', 'Discharged']),
});

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getAdmissionsQuerySchema = z.object({
  status: z.enum(['Active', 'Discharged']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
export type GetAdmissionsQueryFormData = z.infer<typeof getAdmissionsQuerySchema>;

export type AdmissionReferredFrom =
  (typeof ADMISSION_REFERRED_FROM_VALUES)[number];
export type AdmissionReferralReason =
  (typeof ADMISSION_REFERRAL_REASON_VALUES)[number];
export type AdmissionSymptom = (typeof ADMISSION_SYMPTOM_VALUES)[number];
export type AdmissionSpiritualSupport =
  (typeof ADMISSION_SPIRITUAL_SUPPORT_VALUES)[number];