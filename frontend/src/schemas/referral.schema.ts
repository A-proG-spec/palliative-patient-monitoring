import { z } from 'zod';

export const createReferralSchema = z.object({
  referralType: z.enum(['Incoming', 'Outgoing']),
  referralDate: z.string().min(1, 'Referral date is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
ppsScore: z.coerce.number().min(0).max(100).optional().default(0),
kpsScore: z.coerce.number().min(0).max(100).optional().default(0),
  currentSymptoms: z.object({
    pain: z.coerce.number().min(0).max(10),
    dyspnea: z.coerce.number().min(0).max(10),
    fatigue: z.coerce.number().min(0).max(10),
    anxiety: z.coerce.number().min(0).max(10),
    depression: z.coerce.number().min(0).max(10),
  }),
  reasons: z.array(z.string()).min(1, 'At least one reason is required'),
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
