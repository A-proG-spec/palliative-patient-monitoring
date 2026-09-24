import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES — must mirror the Prisma enums exactly
// ═════════════════════════════════════════════════════════════

export const SPIRITUAL_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'Reassessment',
] as const;

export const SPIRITUAL_RELIGIOUS_AFFILIATION_VALUES = [
  'EthiopianOrthodoxChristian',
  'Muslim',
  'Protestant',
  'Catholic',
  'TraditionalBelief',
  'Other',
  'NoReligiousAffiliation',
] as const;

export const SPIRITUAL_FAITH_IMPORTANCE_VALUES = [
  'VeryImportant',
  'Important',
  'SomewhatImportant',
  'NotImportant',
] as const;

export const SPIRITUAL_ACTIVITY_PARTICIPATION_VALUES = [
  'Regularly',
  'Occasionally',
  'Rarely',
  'Never',
] as const;

export const SPIRITUAL_SUPPORT_SOURCE_VALUES = [
  'FamilyMembers',
  'ReligiousLeaderClergy',
  'Friends',
  'FaithCommunity',
  'HospiceChaplain',
  'CommunityMembers',
  'NoSpiritualSupport',
] as const;

export const SPIRITUAL_DISTRESS_CONCERN_TYPE_VALUES = [
  'MeaningOfIllness',
  'FearOfDeath',
  'FearOfSuffering',
  'UnfinishedBusiness',
  'Forgiveness',
  'RelationshipConflicts',
  'LossOfHope',
  'AngerTowardGodHigherPower',
  'SpiritualIsolation',
] as const;

export const SPIRITUAL_DISTRESS_LEVEL_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const SPIRITUAL_COPING_METHOD_VALUES = [
  'Prayer',
  'ReligiousReadings',
  'FamilySupport',
  'Counseling',
  'Meditation',
  'Music',
  'Other',
] as const;

export const SPIRITUAL_PEACE_STATUS_VALUES = [
  'Yes',
  'Partially',
  'No',
] as const;

export const SPIRITUAL_FAMILY_SHARES_BELIEFS_VALUES = [
  'Yes',
  'No',
  'Partially',
] as const;

export const SPIRITUAL_END_OF_LIFE_CARE_VALUES = [
  'Prayer',
  'ReligiousReadings',
  'SacramentsHolyCommunion',
  'ClergyVisit',
  'FamilyPresence',
  'ReligiousMusic',
  'Other',
] as const;

export const SPIRITUAL_PREFERRED_PLACE_OF_CARE_VALUES = [
  'Home',
  'HospiceFacility',
  'Hospital',
  'Other',
] as const;

export const SPIRITUAL_PREFERRED_PLACE_OF_DEATH_VALUES = [
  'Home',
  'HospiceFacility',
  'Hospital',
  'NoPreference',
] as const;

export const SPIRITUAL_PATIENT_STRENGTH_VALUES = [
  'StrongFaith',
  'PositiveOutlook',
  'FamilySupport',
  'CommunitySupport',
  'ReligiousInvolvement',
  'AcceptanceOfIllness',
  'Other',
] as const;

export const SPIRITUAL_IDENTIFIED_NEED_VALUES = [
  'PrayerSupport',
  'ReligiousCounseling',
  'ClergyVisits',
  'FamilySpiritualSupport',
  'EndOfLifePlanning',
  'GriefCounseling',
  'ReconciliationSupport',
  'Other',
] as const;

export const SPIRITUAL_FOLLOW_UP_SCHEDULE_VALUES = [
  'Daily',
  'Weekly',
  'Monthly',
  'AsNeeded',
] as const;

export const SPIRITUAL_RECOMMENDED_SERVICE_VALUES = [
  'ChaplainServices',
  'ReligiousLeaderReferral',
  'FamilyCounseling',
  'BereavementSupport',
  'AdvanceCarePlanning',
  'OngoingSpiritualCare',
] as const;

export const SPIRITUAL_ASSESSMENT_OUTCOME_VALUES = [
  'NoSpiritualConcernsIdentified',
  'RoutineSpiritualFollowUp',
  'ModerateSpiritualSupportRequired',
  'IntensiveSpiritualCareRequired',
  'FamilySpiritualSupportRequired',
  'BereavementFollowUpRecommended',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const distressConcernRowSchema = z.object({
  concern: z.enum(SPIRITUAL_DISTRESS_CONCERN_TYPE_VALUES),
  present: z.boolean().optional().default(false),
});

// ═════════════════════════════════════════════════════════════
// CREATE
//
// NOTE: `patientId` comes from `req.params.patientId`, NOT the
// request body — the params schema validates it separately.
// ═════════════════════════════════════════════════════════════

export const createSpiritualAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(SPIRITUAL_ASSESSMENT_TYPE_VALUES),

    // ── Religious / spiritual background ──
    religiousAffiliation: z
      .enum(SPIRITUAL_RELIGIOUS_AFFILIATION_VALUES)
      .optional(),
    religiousAffiliationOther: z.string().trim().optional(),
    faithImportance: z
      .enum(SPIRITUAL_FAITH_IMPORTANCE_VALUES)
      .optional(),
    activityParticipation: z
      .enum(SPIRITUAL_ACTIVITY_PARTICIPATION_VALUES)
      .optional(),
    placeOfWorship: z.string().trim().optional(),

    // ── Spiritual support system ──
    supportSources: z
      .array(z.enum(SPIRITUAL_SUPPORT_SOURCE_VALUES))
      .optional()
      .default([]),

    religiousLeaderName: z.string().trim().optional(),
    religiousLeaderOrganization: z.string().trim().optional(),
    religiousLeaderPhone: z.string().trim().optional(),

    // ── Spiritual beliefs and values ──
    lifeMeaningAndPurpose: z.string().trim().optional(),
    sourcesOfStrength: z.string().trim().optional(),

    practicesToContinue: z.boolean().optional(),
    practicesToContinueDetails: z.string().trim().optional(),

    ritualsToRespect: z.boolean().optional(),
    ritualsToRespectDetails: z.string().trim().optional(),

    // ── Spiritual distress assessment ──
    // The list of concerns lives in `distressConcerns` (child rows).
    distressConcerns: z
      .array(distressConcernRowSchema)
      .optional()
      .default([]),
    spiritualDistressLevel: z
      .enum(SPIRITUAL_DISTRESS_LEVEL_VALUES)
      .optional(),
    spiritualConcernsDescription: z.string().trim().optional(),

    // ── Hope and coping assessment ──
    currentHopes: z.string().trim().optional(),
    copingMethods: z
      .array(z.enum(SPIRITUAL_COPING_METHOD_VALUES))
      .optional()
      .default([]),
    copingMethodOther: z.string().trim().optional(),
    feelsAtPeace: z.enum(SPIRITUAL_PEACE_STATUS_VALUES).optional(),

    // ── Family and spiritual needs ──
    familySharesBeliefs: z
      .enum(SPIRITUAL_FAMILY_SHARES_BELIEFS_VALUES)
      .optional(),
    familyBenefitFromSupport: z.boolean().optional(),
    familySpiritualConcerns: z.string().trim().optional(),

    // ── End-of-life spiritual preferences ──
    preferredEndOfLifeCare: z
      .array(z.enum(SPIRITUAL_END_OF_LIFE_CARE_VALUES))
      .optional()
      .default([]),
    preferredEndOfLifeCareOther: z.string().trim().optional(),
    preferredPlaceOfCare: z
      .enum(SPIRITUAL_PREFERRED_PLACE_OF_CARE_VALUES)
      .optional(),
    preferredPlaceOfCareOther: z.string().trim().optional(),
    preferredPlaceOfDeath: z
      .enum(SPIRITUAL_PREFERRED_PLACE_OF_DEATH_VALUES)
      .optional(),
    religiousPracticesAfterDeath: z.string().trim().optional(),

    // ── Spiritual strengths ──
    patientStrengths: z
      .array(z.enum(SPIRITUAL_PATIENT_STRENGTH_VALUES))
      .optional()
      .default([]),
    patientStrengthOther: z.string().trim().optional(),
    additionalStrengths: z.string().trim().optional(),

    // ── Spiritual care plan ──
    identifiedNeeds: z
      .array(z.enum(SPIRITUAL_IDENTIFIED_NEED_VALUES))
      .optional()
      .default([]),
    identifiedNeedOther: z.string().trim().optional(),
    plannedInterventions: z.string().trim().optional(),
    followUpSchedule: z
      .enum(SPIRITUAL_FOLLOW_UP_SCHEDULE_VALUES)
      .optional(),

    // ── Spiritual care provider assessment ──
    summaryOfAssessment: z.string().trim().optional(),
    providerDistressLevel: z
      .enum(SPIRITUAL_DISTRESS_LEVEL_VALUES)
      .optional(),
    recommendedServices: z
      .array(z.enum(SPIRITUAL_RECOMMENDED_SERVICE_VALUES))
      .optional()
      .default([]),
    assessmentOutcome: z
      .array(z.enum(SPIRITUAL_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE — all body fields optional
// ═════════════════════════════════════════════════════════════

export const updateSpiritualAssessmentSchema = z.object({
  body: createSpiritualAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES
// ═════════════════════════════════════════════════════════════

export const getSpiritualAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(SPIRITUAL_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllSpiritualAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(SPIRITUAL_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

// ═════════════════════════════════════════════════════════════
// PARAMS
//
// Two variants, matching the pattern used by hospice-nursing:
//
//   getSpiritualAssessmentPatientParamsSchema
//     → for routes that only carry :patientId (create + list)
//
//   getSpiritualAssessmentParamsSchema
//     → for routes that carry both :patientId and :assessmentId
//       (read, update, delete, restore)
// ═════════════════════════════════════════════════════════════

export const getSpiritualAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getSpiritualAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

// ═════════════════════════════════════════════════════════════
// DELETE
// ═════════════════════════════════════════════════════════════

export const deleteSpiritualAssessmentSchema = z.object({
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

export type CreateSpiritualAssessmentSchema = z.infer<
  typeof createSpiritualAssessmentSchema
>;
export type UpdateSpiritualAssessmentSchema = z.infer<
  typeof updateSpiritualAssessmentSchema
>;
export type GetSpiritualAssessmentParamsSchema = z.infer<
  typeof getSpiritualAssessmentParamsSchema
>;
export type GetSpiritualAssessmentPatientParamsSchema = z.infer<
  typeof getSpiritualAssessmentPatientParamsSchema
>;
export type GetSpiritualAssessmentQuerySchema = z.infer<
  typeof getSpiritualAssessmentQuerySchema
>;
export type DeleteSpiritualAssessmentSchema = z.infer<
  typeof deleteSpiritualAssessmentSchema
>;

// ── Enum value types (handy in services/controllers) ──
export type SpiritualAssessmentType =
  (typeof SPIRITUAL_ASSESSMENT_TYPE_VALUES)[number];
export type SpiritualReligiousAffiliation =
  (typeof SPIRITUAL_RELIGIOUS_AFFILIATION_VALUES)[number];
export type SpiritualFaithImportance =
  (typeof SPIRITUAL_FAITH_IMPORTANCE_VALUES)[number];
export type SpiritualSupportSource =
  (typeof SPIRITUAL_SUPPORT_SOURCE_VALUES)[number];
export type SpiritualDistressConcernType =
  (typeof SPIRITUAL_DISTRESS_CONCERN_TYPE_VALUES)[number];
export type SpiritualDistressLevel =
  (typeof SPIRITUAL_DISTRESS_LEVEL_VALUES)[number];
export type SpiritualCopingMethod =
  (typeof SPIRITUAL_COPING_METHOD_VALUES)[number];
export type SpiritualPeaceStatus =
  (typeof SPIRITUAL_PEACE_STATUS_VALUES)[number];
export type SpiritualEndOfLifeCare =
  (typeof SPIRITUAL_END_OF_LIFE_CARE_VALUES)[number];
export type SpiritualPatientStrength =
  (typeof SPIRITUAL_PATIENT_STRENGTH_VALUES)[number];
export type SpiritualIdentifiedNeed =
  (typeof SPIRITUAL_IDENTIFIED_NEED_VALUES)[number];
export type SpiritualFollowUpSchedule =
  (typeof SPIRITUAL_FOLLOW_UP_SCHEDULE_VALUES)[number];
export type SpiritualRecommendedService =
  (typeof SPIRITUAL_RECOMMENDED_SERVICE_VALUES)[number];
export type SpiritualAssessmentOutcome =
  (typeof SPIRITUAL_ASSESSMENT_OUTCOME_VALUES)[number];