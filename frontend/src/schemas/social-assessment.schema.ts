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
  relationship: z.string().default(''),
  age: optionalNumber,
  occupation: z.string().default(''),
});

const utilitiesAccessSchema = z
  .record(z.string(), z.boolean())
  .optional()
  .default({});

export const createSocialAssessmentSchema = z.object({
  assessmentType: z.enum(['Admission', 'FollowUp', 'Reassessment']),

  householdSize: optionalPositiveInt,
  householdMembers: z
    .array(householdMemberRowSchema)
    .optional()
    .default([]),

  livingArrangement: optionalEnum([
    'LivesAlone',
    'LivesWithSpouse',
    'LivesWithChildren',
    'ExtendedFamily',
    'CareInstitution',
    'Other',
  ] as const),
  livingArrangementOther: z.string().trim().optional(),

  caregiverAvailability: optionalEnum([
    'FullTime',
    'PartTime',
    'Occasional',
    'NotAvailable',
  ] as const),
  caregiverHealth: optionalEnum([
    'Good',
    'Fair',
    'Poor',
  ] as const),
  caregiverUnderstanding: optionalEnum([
    'Good',
    'Moderate',
    'Limited',
    'None',
  ] as const),
  caregiverStress: optionalEnum([
    'Low',
    'Moderate',
    'High',
    'Severe',
  ] as const),

  familySupport: optionalEnum([
    'Strong',
    'Moderate',
    'Limited',
    'None',
  ] as const),
  communitySupport: z
    .array(
      z.enum([
        'ReligiousOrganization',
        'Neighbors',
        'CommunityVolunteers',
        'LocalNgos',
        'NoSupportAvailable',
      ]),
    )
    .optional()
    .default([]),
  contactFrequency: optionalEnum([
    'Daily',
    'Weekly',
    'Monthly',
    'Rarely',
  ] as const),
  isolationRisk: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),

  incomeSources: z
    .array(
      z.enum([
        'Employment',
        'Pension',
        'FamilySupport',
        'SocialAssistance',
        'Savings',
        'None',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  incomeSourceOther: z.string().trim().optional(),
  monthlyHouseholdIncome: optionalEnum([
    'Below2000ETB',
    'Between2000And5000ETB',
    'Between5001And10000ETB',
    'Above10000ETB',
  ] as const),
  financialChallenges: z
    .array(
      z.enum([
        'MedicationCosts',
        'TransportationCosts',
        'FoodExpenses',
        'HousingCosts',
        'CaregiverIncomeLoss',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  financialChallengeOther: z.string().trim().optional(),
  financialRiskLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),

  residenceType: optionalEnum([
    'OwnedHouse',
    'RentalHouse',
    'GovernmentHousing',
    'TemporaryShelter',
    'Other',
  ] as const),
  residenceTypeOther: z.string().trim().optional(),
  homeEnvironment: optionalEnum([
    'Safe',
    'RequiresModification',
    'Unsafe',
  ] as const),
  utilitiesAccess: utilitiesAccessSchema,
  homeBasedCareSuitability: optionalEnum([
    'Suitable',
    'PartiallySuitable',
    'NotSuitable',
  ] as const),

  transportAccess: z
    .array(
      z.enum([
        'PrivateVehicle',
        'PublicTransport',
        'AmbulanceAccess',
        'NoReliableTransport',
      ]),
    )
    .optional()
    .default([]),
  distanceToHealthFacilityKm: optionalNumber,
  transportChallenges: z
    .array(
      z.enum([
        'None',
        'Financial',
        'PhysicalAccess',
        'Availability',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  transportChallengeOther: z.string().trim().optional(),

  employmentStatus: optionalEnum([
    'Employed',
    'Unemployed',
    'Retired',
    'UnableToWork',
  ] as const),
  educationLevel: optionalEnum([
    'NoFormalEducation',
    'PrimarySchool',
    'SecondarySchool',
    'Diploma',
    'Degree',
    'Postgraduate',
  ] as const),

  religiousAffiliation: optionalEnum([
    'Orthodox',
    'Muslim',
    'Protestant',
    'Catholic',
    'Other',
  ] as const),
  religiousAffiliationOther: z.string().trim().optional(),
  spiritualSupportAvailable: z.boolean().optional(),
  culturalFactorsAffectingCare: z.string().trim().optional(),

  hasLegalRepresentative: z.boolean().optional(),
  advanceDirectivesAvailable: z.boolean().optional(),
  legalConcerns: z
    .array(
      z.enum([
        'PropertyIssues',
        'GuardianshipIssues',
        'InheritanceIssues',
        'None',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  legalConcernOther: z.string().trim().optional(),

  familyPreparedForPrognosis: optionalEnum([
    'Yes',
    'No',
    'Partially',
  ] as const),
  anticipatoryGrief: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  bereavementRisk: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),
  familyRequiresSupport: z.boolean().optional(),

  majorSocialIssues: z
    .array(
      z.enum([
        'FinancialHardship',
        'CaregiverBurden',
        'SocialIsolation',
        'HousingProblems',
        'TransportationBarriers',
        'FoodInsecurity',
        'FamilyConflict',
        'LackOfSocialSupport',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  majorSocialIssueOther: z.string().trim().optional(),
  strengthsAndResources: z.string().trim().optional(),
  areasRequiringIntervention: z.string().trim().optional(),

  plannedInterventions: z
    .array(
      z.enum([
        'FamilyCounseling',
        'FinancialAssistanceReferral',
        'CommunityResourceMobilization',
        'CaregiverSupport',
        'HomeCareAssessment',
        'SpiritualCareReferral',
        'BereavementSupport',
        'LegalSupportReferral',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  plannedInterventionOther: z.string().trim().optional(),
  followUpPlan: z.string().trim().optional(),

  assessmentOutcome: z
    .array(
      z.enum([
        'SuitableForInpatientHospiceCare',
        'SuitableForHomeBasedHospiceCare',
        'RequiresAdditionalSocialSupport',
        'RequiresCommunityResourceMobilization',
        'HighRiskSocialSituation',
        'FollowUpAssessmentRequired',
      ]),
    )
    .optional()
    .default([]),
});

export type CreateSocialAssessmentFormData = z.infer<
  typeof createSocialAssessmentSchema
>;