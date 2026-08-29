// src/schemas/referral.schema.ts

import { z } from 'zod';

const symptomScore = z
  .number({ invalid_type_error: 'Score must be a number' })
  .min(0, 'Score must be 0–10')
  .max(10, 'Score must be 0–10');

export const createReferralSchema = z.object({
  referralType: z.enum(['Incoming', 'Outgoing'], {
    required_error: 'Referral type is required',
  }),
  referralDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage'], {
    required_error: 'Disease stage is required',
  }),
  ppsScore: z
    .number({ invalid_type_error: 'PPS score must be a number' })
    .min(0, 'PPS score must be 0–100')
    .max(100, 'PPS score must be 0–100'),
  kpsScore: z
    .number({ invalid_type_error: 'KPS score must be a number' })
    .min(0, 'KPS score must be 0–100')
    .max(100, 'KPS score must be 0–100'),
  currentSymptoms: z.object({
    pain: symptomScore,
    dyspnea: symptomScore,
    fatigue: symptomScore,
    anxiety: symptomScore,
    depression: symptomScore,
  }),
  reasons: z
    .array(z.string())
    .min(1, 'At least one reason for referral is required'),
  otherReason: z.string().optional(),
  referringFacility: z.string().min(1, 'Referring facility is required'),
  receivingFacility: z.string().min(1, 'Receiving facility is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  preparedByDesignation: z.string().min(1, 'Designation is required'),
  signature: z.string().min(1, 'Signature is required'),
});

export type CreateReferralFormData = z.infer<typeof createReferralSchema>;
