// src/schemas/admission.schema.ts

import { z } from 'zod';

export const createAdmissionSchema = z.object({
  referralId: z.string().min(1, 'Referral is required'),
  admissionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  bedNumber: z.string().min(1, 'Bed number is required'),
  ward: z.string().min(1, 'Ward is required'),
  admittingPhysician: z.string().min(1, 'Admitting physician is required'),
  careTeam: z.string().min(1, 'Care team is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional(),
  diseaseStage: z.enum(['Early', 'Advanced', 'Terminal'], {
    required_error: 'Disease stage is required',
  }),
  comorbidities: z.array(z.string()).optional(),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain'], {
    required_error: 'Estimated prognosis is required',
  }),
  ppsScore: z
    .number({ invalid_type_error: 'PPS score must be a number' })
    .min(0, 'PPS score must be 0–100')
    .max(100, 'PPS score must be 0–100'),
  functionalStatus: z.enum(
    ['FullyIndependent', 'PartiallyDependent', 'FullyDependent'],
    { required_error: 'Functional status is required' }
  ),
  painScore: z
    .number({ invalid_type_error: 'Pain score must be a number' })
    .min(0, 'Pain score must be 0–10')
    .max(10, 'Pain score must be 0–10'),
  painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed'], {
    required_error: 'Pain type is required',
  }),
  symptomsPresent: z.array(z.string()).optional(),
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed'], {
    required_error: 'Emotional status is required',
  }),
  familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None'], {
    required_error: 'Family support is required',
  }),
  socialChallenges: z.string().optional(),
  spiritualConcerns: z.boolean({
    required_error: 'Please indicate spiritual concerns',
  }),
  spiritualSupportPreferred: z
    .enum(['ReligiousLeader', 'Counselor', 'Other'])
    .optional(),
  painManagementPlan: z.string().min(1, 'Pain management plan is required'),
  medicationPlan: z.string().min(1, 'Medication plan is required'),
  nursingCarePlan: z.string().min(1, 'Nursing care plan is required'),
  homeBasedCareRequired: z.boolean({
    required_error: 'Please indicate if home-based care is required',
  }),
  psychosocialSupportPlan: z.string().optional(),
  physiotherapyRequired: z.boolean({
    required_error: 'Please indicate if physiotherapy is required',
  }),
});

export const updateAdmissionSchema = z
  .object({
    dischargeDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
    status: z.enum(['Active', 'Discharged'], {
      required_error: 'Status is required',
    }),
  })
  .refine(
    (data) => {
      if (data.status === 'Discharged') {
        return !!data.dischargeDate && !!data.dischargeReason;
      }
      return true;
    },
    {
      message: 'Discharge date and reason are required when discharging',
      path: ['dischargeDate'],
    }
  );

export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
