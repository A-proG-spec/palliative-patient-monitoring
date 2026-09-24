import { z } from 'zod';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);

const optionalPositiveInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().int().positive().optional(),
);

const householdMemberRowSchema = z.object({
  name: z.string().default(''),
  age: optionalNumber,
  relationship: z.string().default(''),
  occupation: z.string().default(''),
  contact: z.string().default(''),
});

const utilitiesAccessSchema = z
  .record(z.string(), z.boolean())
  .optional()
  .default({});

export const createFamilyAssessmentSchema = z.object({
  assessmentType: z.enum(['Admission', 'FollowUp', 'CrisisReview']),

  householdSize: optionalPositiveInt,
  householdMembers: z
    .array(householdMemberRowSchema)
    .optional()
    .default([]),

  primaryDecisionMaker: optionalEnum([
    'Patient',
    'Spouse',
    'Child',
    'Parent',
    'Other',
  ] as const),
  primaryDecisionMakerName: z.string().trim().optional(),

  primaryCaregiverName: z.string().trim().optional(),
  primaryCaregiverRelationship: z.string().trim().optional(),
  primaryCaregiverAge: optionalNumber,
  primaryCaregiverPhone: z.string().trim().optional(),

  secondaryCaregiverName: z.string().trim().optional(),
  secondaryCaregiverRelationship: z.string().trim().optional(),
  secondaryCaregiverPhone: z.string().trim().optional(),

  caregiverAvailability: optionalEnum([
    'FullTime',
    'PartTime',
    'Occasional',
    'NotAvailable',
  ] as const),
  physicalAbility: optionalEnum([
    'Strong',
    'Moderate',
    'Limited',
    'Unable',
  ] as const),
  emotionalReadiness: optionalEnum([
    'Ready',
    'SomewhatReady',
    'Overwhelmed',
    'NotReady',
  ] as const),
  knowledgeOfIllness: optionalEnum([
    'Good',
    'Moderate',
    'Poor',
    'None',
  ] as const),

  internalSupport: optionalEnum([
    'StrongFamilyUnity',
    'ModerateSupport',
    'ConflictPresent',
    'NoSupport',
  ] as const),
  externalSupport: z
    .array(
      z.enum([
        'Community',
        'ReligiousInstitution',
        'NgoSupport',
        'None',
      ]),
    )
    .optional()
    .default([]),
  socialIsolationRisk: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),

  incomeSources: z
    .array(
      z.enum([
        'Employment',
        'Farming',
        'Pension',
        'FamilySupport',
        'NoStableIncome',
      ]),
    )
    .optional()
    .default([]),
  monthlyIncomeLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
    'Unknown',
  ] as const),
  financialBurden: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  financialChallenges: z
    .array(
      z.enum([
        'MedicationCosts',
        'Transportation',
        'FoodInsecurity',
        'LossOfIncome',
        'CaregiverBurden',
      ]),
    )
    .optional()
    .default([]),

  housingType: optionalEnum([
    'Owned',
    'Rented',
    'TemporaryShelter',
    'Other',
  ] as const),
  housingTypeOther: z.string().trim().optional(),
  homeEnvironment: optionalEnum([
    'Safe',
    'PartiallySafe',
    'Unsafe',
  ] as const),
  utilitiesAccess: utilitiesAccessSchema,

  copingAbility: optionalEnum([
    'Strong',
    'Moderate',
    'Poor',
  ] as const),
  familyEmotionalStatus: optionalEnum([
    'Calm',
    'Anxious',
    'Distressed',
    'Overwhelmed',
  ] as const),
  anticipatoryGrief: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),

  religiousAffiliation: optionalEnum([
    'Orthodox',
    'Muslim',
    'Protestant',
    'Catholic',
    'Other',
  ] as const),
  religiousAffiliationOther: z.string().trim().optional(),
  culturalBeliefsAffectingCare: z.string().trim().optional(),
  palliativeCareAcceptance: optionalEnum([
    'FullyAccepting',
    'PartiallyAccepting',
    'Resistant',
    'NotInformed',
  ] as const),

  burdenLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
    'Severe',
  ] as const),
  burdenFactors: z
    .array(
      z.enum([
        'PhysicalExhaustion',
        'EmotionalStress',
        'FinancialStrain',
        'LackOfSupport',
        'LackOfKnowledge',
      ]),
    )
    .optional()
    .default([]),

  needs: z
    .array(
      z.enum([
        'EducationOnDiseaseProcess',
        'CaregiverTraining',
        'FinancialAssistance',
        'PsychologicalCounseling',
        'SpiritualSupport',
        'RespiteCare',
        'BereavementPreparation',
      ]),
    )
    .optional()
    .default([]),

  strengths: z
    .array(
      z.enum([
        'StrongBonding',
        'WillingCaregiver',
        'ReligiousSupport',
        'StableHousing',
        'CommunitySupport',
        'GoodCommunication',
      ]),
    )
    .optional()
    .default([]),

  plannedInterventions: z.string().trim().optional(),
  supportServices: z
    .array(
      z.enum([
        'SocialWork',
        'PsychologyPsychiatry',
        'SpiritualCare',
        'FinancialAssistancePrograms',
        'CommunityVolunteers',
      ]),
    )
    .optional()
    .default([]),
  followUpPlan: optionalEnum([
    'Daily',
    'Weekly',
    'Monthly',
    'AsNeeded',
  ] as const),

  assessmentOutcome: z
    .array(
      z.enum([
        'StrongFamilySupport',
        'AdequateSupportWithInterventionNeeded',
        'HighCaregiverBurden',
        'AtRiskFamilySystem',
        'RequiresIntensivePsychosocialSupport',
      ]),
    )
    .optional()
    .default([]),
  finalRecommendations: z
    .array(
      z.enum([
        'ContinueFamilyInvolvement',
        'ProvideCaregiverTraining',
        'InitiateFinancialSocialSupport',
        'PsychologicalCounselingRequired',
        'BereavementPreparationNeeded',
        'MultidisciplinaryFamilyIntervention',
      ]),
    )
    .optional()
    .default([]),

  assessorName: z.string().trim().optional(),
});

export type CreateFamilyAssessmentFormData = z.infer<
  typeof createFamilyAssessmentSchema
>;