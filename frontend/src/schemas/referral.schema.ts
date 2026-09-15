import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Canonical reason enum — must match the backend `Referral` model
// and `REFERRAL_REASON_LABELS` in `constants/index.ts`.
// ─────────────────────────────────────────────────────────────
export const REFERRAL_REASON_VALUES = [
  'PainManagement',
  'SymptomControl',
  'EndOfLifeCare',
  'HomeHospiceCare',
  'InpatientAdmission',
  'PsychologicalSupport',
  'SpiritualCare',
  'CaregiverSupport',
  'BereavementServices',
  'EmergencyCare',
  'DiagnosticEvaluation',
  'Other',
] as const;

export const referralReasonEnum = z.enum(REFERRAL_REASON_VALUES);

// ─────────────────────────────────────────────────────────────
// Create Referral — matches backend `createReferralSchema.body`
// ─────────────────────────────────────────────────────────────
export const createReferralSchema = z.object({
  referralType: z.enum(['Incoming', 'Outgoing']),
  referralDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  primaryDiagnosis: z.string().trim().min(1, 'Primary diagnosis is required'),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),

  ppsScore: z.coerce.number().min(0).max(100),
  kpsScore: z.coerce.number().min(0).max(100),

  currentSymptoms: z.object({
    pain: z.coerce.number().min(0).max(10),
    dyspnea: z.coerce.number().min(0).max(10),
    fatigue: z.coerce.number().min(0).max(10),
    anxiety: z.coerce.number().min(0).max(10),
    depression: z.coerce.number().min(0).max(10),
  }),

  // ✅ Typed as the literal union — matches CreateReferralRequest.reasons
  reasons: z.array(referralReasonEnum).min(1, 'At least one reason is required'),
  otherReason: z.string().trim().optional(),

  referringFacility: z.string().trim().min(1, 'Referring facility is required'),
  receivingFacility: z.string().trim().min(1, 'Receiving facility is required'),
  contactPerson: z.string().trim().min(1, 'Contact person is required'),
  contactNumber: z.string().trim().min(1, 'Contact number is required'),
});

export type CreateReferralFormData = z.infer<typeof createReferralSchema>;
export type ReferralReasonValue = z.infer<typeof referralReasonEnum>;