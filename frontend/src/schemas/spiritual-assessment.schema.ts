import { z } from 'zod';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const distressConcernRowSchema = z.object({
  concern: z.enum([
    'MeaningOfIllness',
    'FearOfDeath',
    'FearOfSuffering',
    'UnfinishedBusiness',
    'Forgiveness',
    'RelationshipConflicts',
    'LossOfHope',
    'AngerTowardGodHigherPower',
    'SpiritualIsolation',
  ]),
  present: z.boolean().default(false),
});

export const createSpiritualAssessmentSchema = z.object({
  assessmentType: z.enum(['Admission', 'FollowUp', 'Reassessment']),

  // Religious background
  religiousAffiliation: optionalEnum([
    'EthiopianOrthodoxChristian',
    'Muslim',
    'Protestant',
    'Catholic',
    'TraditionalBelief',
    'Other',
    'NoReligiousAffiliation',
  ] as const),
  religiousAffiliationOther: z.string().trim().optional(),
  faithImportance: optionalEnum([
    'VeryImportant',
    'Important',
    'SomewhatImportant',
    'NotImportant',
  ] as const),
  activityParticipation: optionalEnum([
    'Regularly',
    'Occasionally',
    'Rarely',
    'Never',
  ] as const),
  placeOfWorship: z.string().trim().optional(),

  // Support
  supportSources: z
    .array(
      z.enum([
        'FamilyMembers',
        'ReligiousLeaderClergy',
        'Friends',
        'FaithCommunity',
        'HospiceChaplain',
        'CommunityMembers',
        'NoSpiritualSupport',
      ]),
    )
    .optional()
    .default([]),
  religiousLeaderName: z.string().trim().optional(),
  religiousLeaderOrganization: z.string().trim().optional(),
  religiousLeaderPhone: z.string().trim().optional(),

  // Beliefs & values
  lifeMeaningAndPurpose: z.string().trim().optional(),
  sourcesOfStrength: z.string().trim().optional(),

  practicesToContinue: z.boolean().optional(),
  practicesToContinueDetails: z.string().trim().optional(),

  ritualsToRespect: z.boolean().optional(),
  ritualsToRespectDetails: z.string().trim().optional(),

  // Distress
  distressConcerns: z
    .array(distressConcernRowSchema)
    .optional()
    .default([]),
  spiritualDistressLevel: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  spiritualConcernsDescription: z.string().trim().optional(),

  // Hope & coping
  currentHopes: z.string().trim().optional(),
  copingMethods: z
    .array(
      z.enum([
        'Prayer',
        'ReligiousReadings',
        'FamilySupport',
        'Counseling',
        'Meditation',
        'Music',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  copingMethodOther: z.string().trim().optional(),
  feelsAtPeace: optionalEnum([
    'Yes',
    'Partially',
    'No',
  ] as const),

  // Family
  familySharesBeliefs: optionalEnum([
    'Yes',
    'No',
    'Partially',
  ] as const),
  familyBenefitFromSupport: z.boolean().optional(),
  familySpiritualConcerns: z.string().trim().optional(),

  // End-of-life preferences
  preferredEndOfLifeCare: z
    .array(
      z.enum([
        'Prayer',
        'ReligiousReadings',
        'SacramentsHolyCommunion',
        'ClergyVisit',
        'FamilyPresence',
        'ReligiousMusic',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  preferredEndOfLifeCareOther: z.string().trim().optional(),
  preferredPlaceOfCare: optionalEnum([
    'Home',
    'HospiceFacility',
    'Hospital',
    'Other',
  ] as const),
  preferredPlaceOfCareOther: z.string().trim().optional(),
  preferredPlaceOfDeath: optionalEnum([
    'Home',
    'HospiceFacility',
    'Hospital',
    'NoPreference',
  ] as const),
  religiousPracticesAfterDeath: z.string().trim().optional(),

  // Strengths
  patientStrengths: z
    .array(
      z.enum([
        'StrongFaith',
        'PositiveOutlook',
        'FamilySupport',
        'CommunitySupport',
        'ReligiousInvolvement',
        'AcceptanceOfIllness',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  patientStrengthOther: z.string().trim().optional(),
  additionalStrengths: z.string().trim().optional(),

  // Care plan
  identifiedNeeds: z
    .array(
      z.enum([
        'PrayerSupport',
        'ReligiousCounseling',
        'ClergyVisits',
        'FamilySpiritualSupport',
        'EndOfLifePlanning',
        'GriefCounseling',
        'ReconciliationSupport',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  identifiedNeedOther: z.string().trim().optional(),
  plannedInterventions: z.string().trim().optional(),
  followUpSchedule: optionalEnum([
    'Daily',
    'Weekly',
    'Monthly',
    'AsNeeded',
  ] as const),

  // Provider summary
  summaryOfAssessment: z.string().trim().optional(),
  providerDistressLevel: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  recommendedServices: z
    .array(
      z.enum([
        'ChaplainServices',
        'ReligiousLeaderReferral',
        'FamilyCounseling',
        'BereavementSupport',
        'AdvanceCarePlanning',
        'OngoingSpiritualCare',
      ]),
    )
    .optional()
    .default([]),
  assessmentOutcome: z
    .array(
      z.enum([
        'NoSpiritualConcernsIdentified',
        'RoutineSpiritualFollowUp',
        'ModerateSpiritualSupportRequired',
        'IntensiveSpiritualCareRequired',
        'FamilySpiritualSupportRequired',
        'BereavementFollowUpRecommended',
      ]),
    )
    .optional()
    .default([]),
});

export type CreateSpiritualAssessmentFormData = z.infer<
  typeof createSpiritualAssessmentSchema
>;