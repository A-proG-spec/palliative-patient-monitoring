import { z } from 'zod';

export const createAdmissionSchema = z.object({
  referralId: z.string().min(1, 'Referral is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  bedNumber: z.string().min(1, 'Bed number is required'),
  ward: z.string().min(1, 'Ward is required'),
  admittingPhysician: z.string().min(1, 'Admitting physician is required'),
  careTeam: z.string().min(1, 'Care team is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional().default([]),
  diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']),
  comorbidities: z.array(z.string()).optional().default([]),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
  ppsScore: z.coerce.number().min(0).max(100),
  functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']),
  painScore: z.coerce.number().min(0).max(10),
  painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']),
  symptomsPresent: z.array(z.string()).optional().default([]),
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
});

export const updateAdmissionSchema = z.object({
  dischargeDate: z.string().optional(),
  dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
  status: z.enum(['Active', 'Discharged']),
});

export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
