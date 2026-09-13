import { z } from 'zod';

export const createReferralSchema = z.object({
  body: z.object({
    referralType: z.enum(['Incoming', 'Outgoing']),
    referralDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
    diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
    ppsScore: z.number().min(0).max(100),
    kpsScore: z.number().min(0).max(100),
    currentSymptoms: z.object({
      pain: z.number().min(0).max(10),
      dyspnea: z.number().min(0).max(10),
      fatigue: z.number().min(0).max(10),
      anxiety: z.number().min(0).max(10),
      depression: z.number().min(0).max(10),
    }),
    reasons: z
      .array(
        z.enum([
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
        ])
      )
      .min(1, 'At least one reason is required'),
    otherReason: z.string().optional(),
    referringFacility: z.string().min(1, 'Referring facility is required'),
    receivingFacility: z.string().min(1, 'Receiving facility is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    // NOTE: preparedBy, preparedByDesignation, signature removed.
    // The staff who submits the referral is captured server-side via
    // req.user.id and stored as `requestedBy`.
  }),
});

export const getReferralsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getReferralParamsSchema = z.object({
  params: z.object({
    referralId: z.string().min(1, 'Referral ID is required'),
  }),
});

export type CreateReferralSchema = z.infer<typeof createReferralSchema>;
export type GetReferralsQuerySchema = z.infer<typeof getReferralsQuerySchema>;
export type GetReferralParamsSchema = z.infer<typeof getReferralParamsSchema>;