import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES
// ═════════════════════════════════════════════════════════════

export const FAMILY_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'CrisisReview',
] as const;

export const FAMILY_DECISION_MAKER_VALUES = [
  'Patient',
  'Spouse',
  'Child',
  'Parent',
  'Other',
] as const;

export const FAMILY_CAREGIVER_AVAILABILITY_VALUES = [
  'FullTime',
  'PartTime',
  'Occasional',
  'NotAvailable',
] as const;

export const FAMILY_PHYSICAL_ABILITY_VALUES = [
  'Strong',
  'Moderate',
  'Limited',
  'Unable',
] as const;

export const FAMILY_EMOTIONAL_READINESS_VALUES = [
  'Ready',
  'SomewhatReady',
  'Overwhelmed',
  'NotReady',
] as const;

export const FAMILY_KNOWLEDGE_LEVEL_VALUES = [
  'Good',
  'Moderate',
  'Poor',
  'None',
] as const;

export const FAMILY_INTERNAL_SUPPORT_VALUES = [
  'StrongFamilyUnity',
  'ModerateSupport',
  'ConflictPresent',
  'NoSupport',
] as const;

export const FAMILY_EXTERNAL_SUPPORT_VALUES = [
  'Community',
  'ReligiousInstitution',
  'NgoSupport',
  'None',
] as const;

export const FAMILY_SOCIAL_ISOLATION_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const FAMILY_INCOME_SOURCE_VALUES = [
  'Employment',
  'Farming',
  'Pension',
  'FamilySupport',
  'NoStableIncome',
] as const;

export const FAMILY_INCOME_LEVEL_VALUES = [
  'Low',
  'Moderate',
  'High',
  'Unknown',
] as const;

export const FAMILY_FINANCIAL_BURDEN_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const FAMILY_FINANCIAL_CHALLENGE_VALUES = [
  'MedicationCosts',
  'Transportation',
  'FoodInsecurity',
  'LossOfIncome',
  'CaregiverBurden',
] as const;

export const FAMILY_HOUSING_TYPE_VALUES = [
  'Owned',
  'Rented',
  'TemporaryShelter',
  'Other',
] as const;

export const FAMILY_HOME_ENVIRONMENT_VALUES = [
  'Safe',
  'PartiallySafe',
  'Unsafe',
] as const;

export const FAMILY_UTILITY_SERVICE_VALUES = [
  'Water',
  'Electricity',
  'Sanitation',
] as const;

export const FAMILY_COPING_ABILITY_VALUES = [
  'Strong',
  'Moderate',
  'Poor',
] as const;

export const FAMILY_EMOTIONAL_STATUS_VALUES = [
  'Calm',
  'Anxious',
  'Distressed',
  'Overwhelmed',
] as const;

export const FAMILY_ANTICIPATORY_GRIEF_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const FAMILY_RELIGIOUS_AFFILIATION_VALUES = [
  'Orthodox',
  'Muslim',
  'Protestant',
  'Catholic',
  'Other',
] as const;

export const FAMILY_PALLIATIVE_ACCEPTANCE_VALUES = [
  'FullyAccepting',
  'PartiallyAccepting',
  'Resistant',
  'NotInformed',
] as const;

export const FAMILY_BURDEN_LEVEL_VALUES = [
  'Low',
  'Moderate',
  'High',
  'Severe',
] as const;

export const FAMILY_BURDEN_FACTOR_VALUES = [
  'PhysicalExhaustion',
  'EmotionalStress',
  'FinancialStrain',
  'LackOfSupport',
  'LackOfKnowledge',
] as const;

export const FAMILY_NEED_VALUES = [
  'EducationOnDiseaseProcess',
  'CaregiverTraining',
  'FinancialAssistance',
  'PsychologicalCounseling',
  'SpiritualSupport',
  'RespiteCare',
  'BereavementPreparation',
] as const;

export const FAMILY_STRENGTH_VALUES = [
  'StrongBonding',
  'WillingCaregiver',
  'ReligiousSupport',
  'StableHousing',
  'CommunitySupport',
  'GoodCommunication',
] as const;

export const FAMILY_SUPPORT_SERVICE_VALUES = [
  'SocialWork',
  'PsychologyPsychiatry',
  'SpiritualCare',
  'FinancialAssistancePrograms',
  'CommunityVolunteers',
] as const;

export const FAMILY_FOLLOW_UP_PLAN_VALUES = [
  'Daily',
  'Weekly',
  'Monthly',
  'AsNeeded',
] as const;

export const FAMILY_ASSESSMENT_OUTCOME_VALUES = [
  'StrongFamilySupport',
  'AdequateSupportWithInterventionNeeded',
  'HighCaregiverBurden',
  'AtRiskFamilySystem',
  'RequiresIntensivePsychosocialSupport',
] as const;

export const FAMILY_FINAL_RECOMMENDATION_VALUES = [
  'ContinueFamilyInvolvement',
  'ProvideCaregiverTraining',
  'InitiateFinancialSocialSupport',
  'PsychologicalCounselingRequired',
  'BereavementPreparationNeeded',
  'MultidisciplinaryFamilyIntervention',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const householdMemberRowSchema = z.object({
  name: z.string().trim().optional(),
  age: z.number().int().min(0).max(150).optional(),
  relationship: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  contact: z.string().trim().optional(),
});

/**
 * utilitiesAccess is a JSON column with shape:
 *   { water: true, electricity: false, sanitation: true }
 * All keys are optional booleans.
 */
const utilitiesAccessSchema = z
  .record(z.string(), z.boolean())
  .optional()
  .default({});

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════

export const createFamilyAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(FAMILY_ASSESSMENT_TYPE_VALUES),

    // ── Family composition ──
    householdSize: z.number().int().positive().optional(),
    householdMembers: z
      .array(householdMemberRowSchema)
      .optional()
      .default([]),

    primaryDecisionMaker: z.enum(FAMILY_DECISION_MAKER_VALUES).optional(),
    primaryDecisionMakerName: z.string().trim().optional(),

    // ── Caregiver identification ──
    primaryCaregiverName: z.string().trim().optional(),
    primaryCaregiverRelationship: z.string().trim().optional(),
    primaryCaregiverAge: z.number().int().min(0).max(150).optional(),
    primaryCaregiverPhone: z.string().trim().optional(),

    secondaryCaregiverName: z.string().trim().optional(),
    secondaryCaregiverRelationship: z.string().trim().optional(),
    secondaryCaregiverPhone: z.string().trim().optional(),

    caregiverAvailability: z
      .enum(FAMILY_CAREGIVER_AVAILABILITY_VALUES)
      .optional(),

    // ── Caregiver capacity ──
    physicalAbility: z.enum(FAMILY_PHYSICAL_ABILITY_VALUES).optional(),
    emotionalReadiness: z
      .enum(FAMILY_EMOTIONAL_READINESS_VALUES)
      .optional(),
    knowledgeOfIllness: z.enum(FAMILY_KNOWLEDGE_LEVEL_VALUES).optional(),

    // ── Family support system ──
    internalSupport: z.enum(FAMILY_INTERNAL_SUPPORT_VALUES).optional(),
    externalSupport: z
      .array(z.enum(FAMILY_EXTERNAL_SUPPORT_VALUES))
      .optional()
      .default([]),
    socialIsolationRisk: z
      .enum(FAMILY_SOCIAL_ISOLATION_RISK_VALUES)
      .optional(),

    // ── Financial status ──
    incomeSources: z
      .array(z.enum(FAMILY_INCOME_SOURCE_VALUES))
      .optional()
      .default([]),
    monthlyIncomeLevel: z.enum(FAMILY_INCOME_LEVEL_VALUES).optional(),
    financialBurden: z.enum(FAMILY_FINANCIAL_BURDEN_VALUES).optional(),
    financialChallenges: z
      .array(z.enum(FAMILY_FINANCIAL_CHALLENGE_VALUES))
      .optional()
      .default([]),

    // ── Living conditions ──
    housingType: z.enum(FAMILY_HOUSING_TYPE_VALUES).optional(),
    housingTypeOther: z.string().trim().optional(),
    homeEnvironment: z.enum(FAMILY_HOME_ENVIRONMENT_VALUES).optional(),
    utilitiesAccess: utilitiesAccessSchema,

    // ── Family coping & psychosocial ──
    copingAbility: z.enum(FAMILY_COPING_ABILITY_VALUES).optional(),
    familyEmotionalStatus: z
      .enum(FAMILY_EMOTIONAL_STATUS_VALUES)
      .optional(),
    anticipatoryGrief: z
      .enum(FAMILY_ANTICIPATORY_GRIEF_VALUES)
      .optional(),

    // ── Cultural & religious ──
    religiousAffiliation: z
      .enum(FAMILY_RELIGIOUS_AFFILIATION_VALUES)
      .optional(),
    religiousAffiliationOther: z.string().trim().optional(),
    culturalBeliefsAffectingCare: z.string().trim().optional(),
    palliativeCareAcceptance: z
      .enum(FAMILY_PALLIATIVE_ACCEPTANCE_VALUES)
      .optional(),

    // ── Caregiver burden ──
    burdenLevel: z.enum(FAMILY_BURDEN_LEVEL_VALUES).optional(),
    burdenFactors: z
      .array(z.enum(FAMILY_BURDEN_FACTOR_VALUES))
      .optional()
      .default([]),

    // ── Family needs ──
    needs: z.array(z.enum(FAMILY_NEED_VALUES)).optional().default([]),

    // ── Family strengths ──
    strengths: z
      .array(z.enum(FAMILY_STRENGTH_VALUES))
      .optional()
      .default([]),

    // ── Care plan ──
    plannedInterventions: z.string().trim().optional(),
    supportServices: z
      .array(z.enum(FAMILY_SUPPORT_SERVICE_VALUES))
      .optional()
      .default([]),
    followUpPlan: z.enum(FAMILY_FOLLOW_UP_PLAN_VALUES).optional(),

    // ── Summary ──
    assessmentOutcome: z
      .array(z.enum(FAMILY_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(FAMILY_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),

    // ── Sign-off ──
    assessorName: z.string().trim().optional(),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════

export const updateFamilyAssessmentSchema = z.object({
  body: createFamilyAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getFamilyAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getFamilyAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getFamilyAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(FAMILY_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllFamilyAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(FAMILY_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deleteFamilyAssessmentSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().max(500).optional(),
    })
    .optional()
    .default({}),
});

// ═════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════

export type CreateFamilyAssessmentSchema = z.infer<
  typeof createFamilyAssessmentSchema
>;
export type UpdateFamilyAssessmentSchema = z.infer<
  typeof updateFamilyAssessmentSchema
>;
export type GetFamilyAssessmentParamsSchema = z.infer<
  typeof getFamilyAssessmentParamsSchema
>;
export type GetFamilyAssessmentQuerySchema = z.infer<
  typeof getFamilyAssessmentQuerySchema
>;