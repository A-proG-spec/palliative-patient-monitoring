import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

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

// ─────────────────────────────────────────────────────────────
// Create — matches backend `createReferralSchema.body`
// ─────────────────────────────────────────────────────────────
export const createReferralSchema = z.object({
  referralType: z.enum(['Incoming', 'Outgoing']),
  referralDate: dateString,
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
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
  reasons: z
    .array(z.enum(REFERRAL_REASON_VALUES))
    .min(1, 'At least one reason is required'),
  otherReason: z.string().optional(),
  referringFacility: z.string().min(1, 'Referring facility is required'),
  receivingFacility: z.string().min(1, 'Receiving facility is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
});

// ─────────────────────────────────────────────────────────────
// Update — matches backend `updateReferralSchema.body`
// Every field optional.
// ─────────────────────────────────────────────────────────────
export const updateReferralSchema = createReferralSchema.partial();

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getReferralsQuerySchema = z.object({
  status: z
    .enum(['Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested'])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateReferralFormData = z.infer<typeof createReferralSchema>;
export type UpdateReferralFormData = z.infer<typeof updateReferralSchema>;
export type GetReferralsQueryFormData = z.infer<typeof getReferralsQuerySchema>;
export type ReferralReason = (typeof REFERRAL_REASON_VALUES)[number];