// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type SpiritualAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'Reassessment';

export type SpiritualReligiousAffiliation =
  | 'EthiopianOrthodoxChristian'
  | 'Muslim'
  | 'Protestant'
  | 'Catholic'
  | 'TraditionalBelief'
  | 'Other'
  | 'NoReligiousAffiliation';

export type SpiritualFaithImportance =
  | 'VeryImportant'
  | 'Important'
  | 'SomewhatImportant'
  | 'NotImportant';

export type SpiritualActivityParticipation =
  | 'Regularly'
  | 'Occasionally'
  | 'Rarely'
  | 'Never';

export type SpiritualSupportSource =
  | 'FamilyMembers'
  | 'ReligiousLeaderClergy'
  | 'Friends'
  | 'FaithCommunity'
  | 'HospiceChaplain'
  | 'CommunityMembers'
  | 'NoSpiritualSupport';

export type SpiritualDistressConcernType =
  | 'MeaningOfIllness'
  | 'FearOfDeath'
  | 'FearOfSuffering'
  | 'UnfinishedBusiness'
  | 'Forgiveness'
  | 'RelationshipConflicts'
  | 'LossOfHope'
  | 'AngerTowardGodHigherPower'
  | 'SpiritualIsolation';

export type SpiritualDistressLevel =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type SpiritualCopingMethod =
  | 'Prayer'
  | 'ReligiousReadings'
  | 'FamilySupport'
  | 'Counseling'
  | 'Meditation'
  | 'Music'
  | 'Other';

export type SpiritualPeaceStatus =
  | 'Yes'
  | 'Partially'
  | 'No';

export type SpiritualFamilySharesBeliefs =
  | 'Yes'
  | 'No'
  | 'Partially';

export type SpiritualEndOfLifeCare =
  | 'Prayer'
  | 'ReligiousReadings'
  | 'SacramentsHolyCommunion'
  | 'ClergyVisit'
  | 'FamilyPresence'
  | 'ReligiousMusic'
  | 'Other';

export type SpiritualPreferredPlaceOfCare =
  | 'Home'
  | 'HospiceFacility'
  | 'Hospital'
  | 'Other';

export type SpiritualPreferredPlaceOfDeath =
  | 'Home'
  | 'HospiceFacility'
  | 'Hospital'
  | 'NoPreference';

export type SpiritualPatientStrength =
  | 'StrongFaith'
  | 'PositiveOutlook'
  | 'FamilySupport'
  | 'CommunitySupport'
  | 'ReligiousInvolvement'
  | 'AcceptanceOfIllness'
  | 'Other';

export type SpiritualIdentifiedNeed =
  | 'PrayerSupport'
  | 'ReligiousCounseling'
  | 'ClergyVisits'
  | 'FamilySpiritualSupport'
  | 'EndOfLifePlanning'
  | 'GriefCounseling'
  | 'ReconciliationSupport'
  | 'Other';

export type SpiritualFollowUpSchedule =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'AsNeeded';

export type SpiritualRecommendedService =
  | 'ChaplainServices'
  | 'ReligiousLeaderReferral'
  | 'FamilyCounseling'
  | 'BereavementSupport'
  | 'AdvanceCarePlanning'
  | 'OngoingSpiritualCare';

export type SpiritualAssessmentOutcome =
  | 'NoSpiritualConcernsIdentified'
  | 'RoutineSpiritualFollowUp'
  | 'ModerateSpiritualSupportRequired'
  | 'IntensiveSpiritualCareRequired'
  | 'FamilySpiritualSupportRequired'
  | 'BereavementFollowUpRecommended';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface SpiritualAssessmentDistressConcernRow {
  id?: string;
  concern: SpiritualDistressConcernType;
  present: boolean;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface SpiritualAssessment {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    hospitalPatientId: string | null;
  } | null;

  assessmentType: SpiritualAssessmentType;

  // Religious background
  religiousAffiliation?: SpiritualReligiousAffiliation | null;
  religiousAffiliationOther?: string | null;
  faithImportance?: SpiritualFaithImportance | null;
  activityParticipation?: SpiritualActivityParticipation | null;
  placeOfWorship?: string | null;

  // Support
  supportSources: SpiritualSupportSource[];
  religiousLeaderName?: string | null;
  religiousLeaderOrganization?: string | null;
  religiousLeaderPhone?: string | null;

  // Beliefs & values
  lifeMeaningAndPurpose?: string | null;
  sourcesOfStrength?: string | null;

  practicesToContinue?: boolean | null;
  practicesToContinueDetails?: string | null;

  ritualsToRespect?: boolean | null;
  ritualsToRespectDetails?: string | null;

  // Distress
  spiritualDistressLevel?: SpiritualDistressLevel | null;
  spiritualConcernsDescription?: string | null;

  // Hope & coping
  currentHopes?: string | null;
  copingMethods: SpiritualCopingMethod[];
  copingMethodOther?: string | null;
  feelsAtPeace?: SpiritualPeaceStatus | null;

  // Family
  familySharesBeliefs?: SpiritualFamilySharesBeliefs | null;
  familyBenefitFromSupport?: boolean | null;
  familySpiritualConcerns?: string | null;

  // End-of-life preferences
  preferredEndOfLifeCare: SpiritualEndOfLifeCare[];
  preferredEndOfLifeCareOther?: string | null;
  preferredPlaceOfCare?: SpiritualPreferredPlaceOfCare | null;
  preferredPlaceOfCareOther?: string | null;
  preferredPlaceOfDeath?: SpiritualPreferredPlaceOfDeath | null;
  religiousPracticesAfterDeath?: string | null;

  // Strengths
  patientStrengths: SpiritualPatientStrength[];
  patientStrengthOther?: string | null;
  additionalStrengths?: string | null;

  // Care plan
  identifiedNeeds: SpiritualIdentifiedNeed[];
  identifiedNeedOther?: string | null;
  plannedInterventions?: string | null;
  followUpSchedule?: SpiritualFollowUpSchedule | null;

  // Provider summary
  summaryOfAssessment?: string | null;
  providerDistressLevel?: SpiritualDistressLevel | null;
  recommendedServices: SpiritualRecommendedService[];
  assessmentOutcome: SpiritualAssessmentOutcome[];

  // Children
  distressConcerns: SpiritualAssessmentDistressConcernRow[];

  // Audit
  createdBy: string;
  createdByStaff?: { id: string; name: string } | null;
  updatedBy?: string | null;
  updatedByAdmin?: { id: string; name: string } | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ═════════════════════════════════════════════════════════════
// LIST DTO
// ═════════════════════════════════════════════════════════════

export interface SpiritualAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: SpiritualAssessmentType;
  religiousAffiliation?: SpiritualReligiousAffiliation | null;
  spiritualDistressLevel?: SpiritualDistressLevel | null;
  feelsAtPeace?: SpiritualPeaceStatus | null;
  assessmentOutcome?: SpiritualAssessmentOutcome[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateSpiritualAssessmentRequest {
  assessmentType: SpiritualAssessmentType;

  religiousAffiliation?: SpiritualReligiousAffiliation;
  religiousAffiliationOther?: string;
  faithImportance?: SpiritualFaithImportance;
  activityParticipation?: SpiritualActivityParticipation;
  placeOfWorship?: string;

  supportSources?: SpiritualSupportSource[];

  religiousLeaderName?: string;
  religiousLeaderOrganization?: string;
  religiousLeaderPhone?: string;

  lifeMeaningAndPurpose?: string;
  sourcesOfStrength?: string;

  practicesToContinue?: boolean;
  practicesToContinueDetails?: string;

  ritualsToRespect?: boolean;
  ritualsToRespectDetails?: string;

  distressConcerns?: Omit<SpiritualAssessmentDistressConcernRow, 'id'>[];
  spiritualDistressLevel?: SpiritualDistressLevel;
  spiritualConcernsDescription?: string;

  currentHopes?: string;
  copingMethods?: SpiritualCopingMethod[];
  copingMethodOther?: string;
  feelsAtPeace?: SpiritualPeaceStatus;

  familySharesBeliefs?: SpiritualFamilySharesBeliefs;
  familyBenefitFromSupport?: boolean;
  familySpiritualConcerns?: string;

  preferredEndOfLifeCare?: SpiritualEndOfLifeCare[];
  preferredEndOfLifeCareOther?: string;
  preferredPlaceOfCare?: SpiritualPreferredPlaceOfCare;
  preferredPlaceOfCareOther?: string;
  preferredPlaceOfDeath?: SpiritualPreferredPlaceOfDeath;
  religiousPracticesAfterDeath?: string;

  patientStrengths?: SpiritualPatientStrength[];
  patientStrengthOther?: string;
  additionalStrengths?: string;

  identifiedNeeds?: SpiritualIdentifiedNeed[];
  identifiedNeedOther?: string;
  plannedInterventions?: string;
  followUpSchedule?: SpiritualFollowUpSchedule;

  summaryOfAssessment?: string;
  providerDistressLevel?: SpiritualDistressLevel;
  recommendedServices?: SpiritualRecommendedService[];
  assessmentOutcome?: SpiritualAssessmentOutcome[];
}

export type UpdateSpiritualAssessmentRequest =
  Partial<CreateSpiritualAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface SpiritualAssessmentListResponse {
  items: SpiritualAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}