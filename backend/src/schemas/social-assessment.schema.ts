import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES
// ═════════════════════════════════════════════════════════════

export const SOCIAL_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'Reassessment',
] as const;

export const SOCIAL_LIVING_ARRANGEMENT_VALUES = [
  'LivesAlone',
  'LivesWithSpouse',
  'LivesWithChildren',
  'ExtendedFamily',
  'CareInstitution',
  'Other',
] as const;

export const SOCIAL_CAREGIVER_AVAILABILITY_VALUES = [
  'FullTime',
  'PartTime',
  'Occasional',
  'NotAvailable',
] as const;

export const SOCIAL_CAREGIVER_HEALTH_VALUES = [
  'Good',
  'Fair',
  'Poor',
] as const;

export const SOCIAL_CAREGIVER_UNDERSTANDING_VALUES = [
  'Good',
  'Moderate',
  'Limited',
  'None',
] as const;

export const SOCIAL_CAREGIVER_STRESS_VALUES = [
  'Low',
  'Moderate',
  'High',
  'Severe',
] as const;

export const SOCIAL_FAMILY_SUPPORT_VALUES = [
  'Strong',
  'Moderate',
  'Limited',
  'None',
] as const;

export const SOCIAL_COMMUNITY_SUPPORT_VALUES = [
  'ReligiousOrganization',
  'Neighbors',
  'CommunityVolunteers',
  'LocalNgos',
  'NoSupportAvailable',
] as const;

export const SOCIAL_CONTACT_FREQUENCY_VALUES = [
  'Daily',
  'Weekly',
  'Monthly',
  'Rarely',
] as const;

export const SOCIAL_ISOLATION_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const SOCIAL_INCOME_SOURCE_VALUES = [
  'Employment',
  'Pension',
  'FamilySupport',
  'SocialAssistance',
  'Savings',
  'None',
  'Other',
] as const;

export const SOCIAL_MONTHLY_INCOME_VALUES = [
  'Below2000ETB',
  'Between2000And5000ETB',
  'Between5001And10000ETB',
  'Above10000ETB',
] as const;

export const SOCIAL_FINANCIAL_CHALLENGE_VALUES = [
  'MedicationCosts',
  'TransportationCosts',
  'FoodExpenses',
  'HousingCosts',
  'CaregiverIncomeLoss',
  'Other',
] as const;

export const SOCIAL_FINANCIAL_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const SOCIAL_RESIDENCE_TYPE_VALUES = [
  'OwnedHouse',
  'RentalHouse',
  'GovernmentHousing',
  'TemporaryShelter',
  'Other',
] as const;

export const SOCIAL_HOME_ENVIRONMENT_VALUES = [
  'Safe',
  'RequiresModification',
  'Unsafe',
] as const;

export const SOCIAL_UTILITY_SERVICE_VALUES = [
  'Electricity',
  'WaterSupply',
  'ToiletFacility',
  'TelephoneAccess',
] as const;

export const SOCIAL_HOME_BASED_CARE_SUITABILITY_VALUES = [
  'Suitable',
  'PartiallySuitable',
  'NotSuitable',
] as const;

export const SOCIAL_TRANSPORT_ACCESS_VALUES = [
  'PrivateVehicle',
  'PublicTransport',
  'AmbulanceAccess',
  'NoReliableTransport',
] as const;

export const SOCIAL_TRANSPORT_CHALLENGE_VALUES = [
  'None',
  'Financial',
  'PhysicalAccess',
  'Availability',
  'Other',
] as const;

export const SOCIAL_EMPLOYMENT_STATUS_VALUES = [
  'Employed',
  'Unemployed',
  'Retired',
  'UnableToWork',
] as const;

export const SOCIAL_EDUCATION_LEVEL_VALUES = [
  'NoFormalEducation',
  'PrimarySchool',
  'SecondarySchool',
  'Diploma',
  'Degree',
  'Postgraduate',
] as const;

export const SOCIAL_RELIGIOUS_AFFILIATION_VALUES = [
  'Orthodox',
  'Muslim',
  'Protestant',
  'Catholic',
  'Other',
] as const;

export const SOCIAL_LEGAL_CONCERN_VALUES = [
  'PropertyIssues',
  'GuardianshipIssues',
  'InheritanceIssues',
  'None',
  'Other',
] as const;

export const SOCIAL_FAMILY_PREPAREDNESS_VALUES = [
  'Yes',
  'No',
  'Partially',
] as const;

export const SOCIAL_ANTICIPATORY_GRIEF_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const SOCIAL_BEREAVEMENT_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const SOCIAL_MAJOR_ISSUE_VALUES = [
  'FinancialHardship',
  'CaregiverBurden',
  'SocialIsolation',
  'HousingProblems',
  'TransportationBarriers',
  'FoodInsecurity',
  'FamilyConflict',
  'LackOfSocialSupport',
  'Other',
] as const;

export const SOCIAL_CARE_PLAN_INTERVENTION_VALUES = [
  'FamilyCounseling',
  'FinancialAssistanceReferral',
  'CommunityResourceMobilization',
  'CaregiverSupport',
  'HomeCareAssessment',
  'SpiritualCareReferral',
  'BereavementSupport',
  'LegalSupportReferral',
  'Other',
] as const;

export const SOCIAL_ASSESSMENT_OUTCOME_VALUES = [
  'SuitableForInpatientHospiceCare',
  'SuitableForHomeBasedHospiceCare',
  'RequiresAdditionalSocialSupport',
  'RequiresCommunityResourceMobilization',
  'HighRiskSocialSituation',
  'FollowUpAssessmentRequired',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const socialHouseholdMemberRowSchema = z.object({
  name: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
  age: z.number().int().min(0).max(150).optional(),
  occupation: z.string().trim().optional(),
});

/**
 * utilitiesAccess JSON shape:
 *   { electricity: true, waterSupply: false, toiletFacility: true, telephoneAccess: true }
 */
const utilitiesAccessSchema = z
  .record(z.string(), z.boolean())
  .optional()
  .default({});

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════

export const createSocialAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(SOCIAL_ASSESSMENT_TYPE_VALUES),

    // ── Family composition ──
    householdSize: z.number().int().positive().optional(),
    householdMembers: z
      .array(socialHouseholdMemberRowSchema)
      .optional()
      .default([]),

    livingArrangement: z
      .enum(SOCIAL_LIVING_ARRANGEMENT_VALUES)
      .optional(),
    livingArrangementOther: z.string().trim().optional(),

    // ── Caregiver ──
    caregiverAvailability: z
      .enum(SOCIAL_CAREGIVER_AVAILABILITY_VALUES)
      .optional(),
    caregiverHealth: z.enum(SOCIAL_CAREGIVER_HEALTH_VALUES).optional(),
    caregiverUnderstanding: z
      .enum(SOCIAL_CAREGIVER_UNDERSTANDING_VALUES)
      .optional(),
    caregiverStress: z.enum(SOCIAL_CAREGIVER_STRESS_VALUES).optional(),

    // ── Social support ──
    familySupport: z.enum(SOCIAL_FAMILY_SUPPORT_VALUES).optional(),
    communitySupport: z
      .array(z.enum(SOCIAL_COMMUNITY_SUPPORT_VALUES))
      .optional()
      .default([]),
    contactFrequency: z
      .enum(SOCIAL_CONTACT_FREQUENCY_VALUES)
      .optional(),
    isolationRisk: z.enum(SOCIAL_ISOLATION_RISK_VALUES).optional(),

    // ── Financial ──
    incomeSources: z
      .array(z.enum(SOCIAL_INCOME_SOURCE_VALUES))
      .optional()
      .default([]),
    incomeSourceOther: z.string().trim().optional(),
    monthlyHouseholdIncome: z
      .enum(SOCIAL_MONTHLY_INCOME_VALUES)
      .optional(),
    financialChallenges: z
      .array(z.enum(SOCIAL_FINANCIAL_CHALLENGE_VALUES))
      .optional()
      .default([]),
    financialChallengeOther: z.string().trim().optional(),
    financialRiskLevel: z.enum(SOCIAL_FINANCIAL_RISK_VALUES).optional(),

    // ── Housing ──
    residenceType: z.enum(SOCIAL_RESIDENCE_TYPE_VALUES).optional(),
    residenceTypeOther: z.string().trim().optional(),
    homeEnvironment: z.enum(SOCIAL_HOME_ENVIRONMENT_VALUES).optional(),
    utilitiesAccess: utilitiesAccessSchema,
    homeBasedCareSuitability: z
      .enum(SOCIAL_HOME_BASED_CARE_SUITABILITY_VALUES)
      .optional(),

    // ── Transportation ──
    transportAccess: z
      .array(z.enum(SOCIAL_TRANSPORT_ACCESS_VALUES))
      .optional()
      .default([]),
    distanceToHealthFacilityKm: z.number().nonnegative().optional(),
    transportChallenges: z
      .array(z.enum(SOCIAL_TRANSPORT_CHALLENGE_VALUES))
      .optional()
      .default([]),
    transportChallengeOther: z.string().trim().optional(),

    // ── Employment & education ──
    employmentStatus: z
      .enum(SOCIAL_EMPLOYMENT_STATUS_VALUES)
      .optional(),
    educationLevel: z.enum(SOCIAL_EDUCATION_LEVEL_VALUES).optional(),

    // ── Cultural & spiritual ──
    religiousAffiliation: z
      .enum(SOCIAL_RELIGIOUS_AFFILIATION_VALUES)
      .optional(),
    religiousAffiliationOther: z.string().trim().optional(),
    spiritualSupportAvailable: z.boolean().optional(),
    culturalFactorsAffectingCare: z.string().trim().optional(),

    // ── Legal & advocacy ──
    hasLegalRepresentative: z.boolean().optional(),
    advanceDirectivesAvailable: z.boolean().optional(),
    legalConcerns: z
      .array(z.enum(SOCIAL_LEGAL_CONCERN_VALUES))
      .optional()
      .default([]),
    legalConcernOther: z.string().trim().optional(),

    // ── Bereavement risk ──
    familyPreparedForPrognosis: z
      .enum(SOCIAL_FAMILY_PREPAREDNESS_VALUES)
      .optional(),
    anticipatoryGrief: z
      .enum(SOCIAL_ANTICIPATORY_GRIEF_VALUES)
      .optional(),
    bereavementRisk: z.enum(SOCIAL_BEREAVEMENT_RISK_VALUES).optional(),
    familyRequiresSupport: z.boolean().optional(),

    // ── Social work assessment ──
    majorSocialIssues: z
      .array(z.enum(SOCIAL_MAJOR_ISSUE_VALUES))
      .optional()
      .default([]),
    majorSocialIssueOther: z.string().trim().optional(),
    strengthsAndResources: z.string().trim().optional(),
    areasRequiringIntervention: z.string().trim().optional(),

    // ── Care plan ──
    plannedInterventions: z
      .array(z.enum(SOCIAL_CARE_PLAN_INTERVENTION_VALUES))
      .optional()
      .default([]),
    plannedInterventionOther: z.string().trim().optional(),
    followUpPlan: z.string().trim().optional(),

    // ── Summary ──
    assessmentOutcome: z
      .array(z.enum(SOCIAL_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════

export const updateSocialAssessmentSchema = z.object({
  body: createSocialAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getSocialAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getSocialAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getSocialAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(SOCIAL_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllSocialAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(SOCIAL_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deleteSocialAssessmentSchema = z.object({
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

export type CreateSocialAssessmentSchema = z.infer<
  typeof createSocialAssessmentSchema
>;
export type UpdateSocialAssessmentSchema = z.infer<
  typeof updateSocialAssessmentSchema
>;
export type GetSocialAssessmentParamsSchema = z.infer<
  typeof getSocialAssessmentParamsSchema
>;
export type GetSocialAssessmentQuerySchema = z.infer<
  typeof getSocialAssessmentQuerySchema
>;