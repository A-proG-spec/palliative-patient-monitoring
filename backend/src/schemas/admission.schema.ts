import { z } from 'zod';

export const createAdmissionSchema = z.object({
  body: z.object({
    referralId: z.string().min(1, 'Referral ID is required'),
    admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    bedNumber: z.string().min(1, 'Bed number is required'),
    ward: z.string().min(1, 'Ward is required'),
    admittingPhysician: z.string().min(1, 'Admitting physician is required'),
    careTeam: z.string().min(1, 'Care team is required'),
    primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
    secondaryDiagnoses: z.array(z.string()).optional(),
    diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']),
    comorbidities: z.array(z.string()).optional(),
    estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
    ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
    functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']),
    painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10'),
    painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']),
    symptomsPresent: z.array(z.string()).optional(),
    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']),
    familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']),
    socialChallenges: z.string().optional(),
    spiritualConcerns: z.boolean(),
    spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(),
    painManagementPlan: z.string().min(1, 'Pain management plan is required'),
    medicationPlan: z.string().min(1, 'Medication plan is required'),
    nursingCarePlan: z.string().min(1, 'Nursing care plan is required'),
    homeBasedCareRequired: z.boolean(),
    psychosocialSupportPlan: z.string().optional(),
    physiotherapyRequired: z.boolean(),
  }),
});

export const updateAdmissionSchema = z.object({
  body: z.object({
    dischargeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
    status: z.enum(['Active', 'Discharged']),
  }),
});

export const getAdmissionsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Active', 'Discharged']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAdmissionParamsSchema = z.object({
  params: z.object({
    admissionId: z.string().min(1, 'Admission ID is required'),
  }),
});

export type CreateAdmissionSchema = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionSchema = z.infer<typeof updateAdmissionSchema>;
export type GetAdmissionsQuerySchema = z.infer<typeof getAdmissionsQuerySchema>;