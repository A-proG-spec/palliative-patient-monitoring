import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

export const ADMISSION_REFERRED_FROM_VALUES = [
  'InternalWard', 'OutpatientDepartment', 'ICU',
  'ExternalHospital', 'Community', 'Home', 'Other',
] as const;

export const ADMISSION_REFERRAL_REASON_VALUES = [
  'PainManagement', 'EndOfLifeCare', 'SymptomControl',
  'HomeBasedCare', 'PsychosocialSupport', 'Other',
] as const;

export const ADMISSION_SYMPTOM_VALUES = [
  'Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other',
] as const;

export const ADMISSION_SPIRITUAL_SUPPORT_VALUES = [
  'ReligiousLeader', 'Counselor', 'Other',
] as const;

export const createAdmissionSchema = z.object({
  body: z.object({
    patientName: z.string().optional(),
    hospitalPatientId: z.string().optional(),
    age: z.number().min(0).max(150).optional(),
    sex: z.enum(['Male', 'Female']).optional(),
    dateOfBirth: dateString.optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
    emergencyContactPhone: z.string().optional(),

    referralId: z.string().min(1, 'A referral is required before admission'),
    referredFrom: optionalEnum(ADMISSION_REFERRED_FROM_VALUES),
    referredFromOther: z.string().optional(),
    referringClinician: z.string().optional(),
    diagnosisAtReferral: z.string().optional(),
    referralReason: optionalEnum(ADMISSION_REFERRAL_REASON_VALUES),
    referralReasonOther: z.string().optional(),

    admissionDate: dateString,
    bedNumber: z.string().min(1, 'Bed number is required'),
    ward: z.string().min(1, 'Ward is required'),
    admittingPhysician: z.string().min(1, 'Admitting physician is required'),
    careTeam: z.string().min(1, 'Care team is required'),

    primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
    secondaryDiagnoses: z.array(z.string()).optional().default([]),
    diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']),
    comorbidities: z.array(z.string()).optional().default([]),

    estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
    ppsScore: z.number().min(0).max(100),
    kpsScore: z.number().min(0).max(100).optional(),
    functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']),

    painScore: z.number().min(0).max(10),
    painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']),
    symptomsPresent: z.array(z.enum(ADMISSION_SYMPTOM_VALUES)).optional().default([]),
    symptomsPresentOther: z.string().optional(),

    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']),
    familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']),
    socialChallenges: z.string().optional(),

    spiritualConcerns: z.boolean(),
    spiritualNeedsDescription: z.string().optional(),
    spiritualSupportPreferred: optionalEnum(ADMISSION_SPIRITUAL_SUPPORT_VALUES),
    spiritualSupportPreferredOther: z.string().optional(),

    painManagementPlan: z.string().min(1, 'Pain management plan is required'),
    medicationPlan: z.string().min(1, 'Medication plan is required'),
    nursingCarePlan: z.string().min(1, 'Nursing care plan is required'),
    homeBasedCareRequired: z.boolean(),
    psychosocialSupportPlan: z.string().optional(),
    physiotherapyRequired: z.boolean(),

    admittedToHospiceUnit: z.boolean().optional(),
  }),
});

export const updateAdmissionSchema = z.object({
  body: z.object({
    dischargeDate: dateString.optional(),
    dischargeReason: optionalEnum(['Improved', 'Deceased'] as const),
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
export const getAllAdmissionsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Active', 'Discharged']).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
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
export type GetAdmissionParamsSchema = z.infer<typeof getAdmissionParamsSchema>;

export type AdmissionReferredFrom = z.infer<typeof ADMISSION_REFERRED_FROM_VALUES>;
export type AdmissionReferralReason = z.infer<typeof ADMISSION_REFERRAL_REASON_VALUES>;
export type AdmissionSymptom = z.infer<typeof ADMISSION_SYMPTOM_VALUES>;
export type AdmissionSpiritualSupport = z.infer<typeof ADMISSION_SPIRITUAL_SUPPORT_VALUES>;