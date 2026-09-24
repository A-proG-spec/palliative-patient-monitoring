// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type SocialAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'Reassessment';

export type SocialLivingArrangement =
  | 'LivesAlone'
  | 'LivesWithSpouse'
  | 'LivesWithChildren'
  | 'ExtendedFamily'
  | 'CareInstitution'
  | 'Other';

export type SocialCaregiverAvailability =
  | 'FullTime'
  | 'PartTime'
  | 'Occasional'
  | 'NotAvailable';

export type SocialCaregiverHealth =
  | 'Good'
  | 'Fair'
  | 'Poor';

export type SocialCaregiverUnderstanding =
  | 'Good'
  | 'Moderate'
  | 'Limited'
  | 'None';

export type SocialCaregiverStress =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Severe';

export type SocialFamilySupport =
  | 'Strong'
  | 'Moderate'
  | 'Limited'
  | 'None';

export type SocialCommunitySupport =
  | 'ReligiousOrganization'
  | 'Neighbors'
  | 'CommunityVolunteers'
  | 'LocalNgos'
  | 'NoSupportAvailable';

export type SocialContactFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Rarely';

export type SocialIsolationRisk =
  | 'Low'
  | 'Moderate'
  | 'High';

export type SocialIncomeSource =
  | 'Employment'
  | 'Pension'
  | 'FamilySupport'
  | 'SocialAssistance'
  | 'Savings'
  | 'None'
  | 'Other';

export type SocialMonthlyIncome =
  | 'Below2000ETB'
  | 'Between2000And5000ETB'
  | 'Between5001And10000ETB'
  | 'Above10000ETB';

export type SocialFinancialChallenge =
  | 'MedicationCosts'
  | 'TransportationCosts'
  | 'FoodExpenses'
  | 'HousingCosts'
  | 'CaregiverIncomeLoss'
  | 'Other';

export type SocialFinancialRisk =
  | 'Low'
  | 'Moderate'
  | 'High';

export type SocialResidenceType =
  | 'OwnedHouse'
  | 'RentalHouse'
  | 'GovernmentHousing'
  | 'TemporaryShelter'
  | 'Other';

export type SocialHomeEnvironment =
  | 'Safe'
  | 'RequiresModification'
  | 'Unsafe';

export type SocialUtilityService =
  | 'Electricity'
  | 'WaterSupply'
  | 'ToiletFacility'
  | 'TelephoneAccess';

export type SocialHomeBasedCareSuitability =
  | 'Suitable'
  | 'PartiallySuitable'
  | 'NotSuitable';

export type SocialTransportAccess =
  | 'PrivateVehicle'
  | 'PublicTransport'
  | 'AmbulanceAccess'
  | 'NoReliableTransport';

export type SocialTransportChallenge =
  | 'None'
  | 'Financial'
  | 'PhysicalAccess'
  | 'Availability'
  | 'Other';

export type SocialEmploymentStatus =
  | 'Employed'
  | 'Unemployed'
  | 'Retired'
  | 'UnableToWork';

export type SocialEducationLevel =
  | 'NoFormalEducation'
  | 'PrimarySchool'
  | 'SecondarySchool'
  | 'Diploma'
  | 'Degree'
  | 'Postgraduate';

export type SocialReligiousAffiliation =
  | 'Orthodox'
  | 'Muslim'
  | 'Protestant'
  | 'Catholic'
  | 'Other';

export type SocialLegalConcern =
  | 'PropertyIssues'
  | 'GuardianshipIssues'
  | 'InheritanceIssues'
  | 'None'
  | 'Other';

export type SocialFamilyPreparedness =
  | 'Yes'
  | 'No'
  | 'Partially';

export type SocialAnticipatoryGrief =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type SocialBereavementRisk =
  | 'Low'
  | 'Moderate'
  | 'High';

export type SocialMajorIssue =
  | 'FinancialHardship'
  | 'CaregiverBurden'
  | 'SocialIsolation'
  | 'HousingProblems'
  | 'TransportationBarriers'
  | 'FoodInsecurity'
  | 'FamilyConflict'
  | 'LackOfSocialSupport'
  | 'Other';

export type SocialCarePlanIntervention =
  | 'FamilyCounseling'
  | 'FinancialAssistanceReferral'
  | 'CommunityResourceMobilization'
  | 'CaregiverSupport'
  | 'HomeCareAssessment'
  | 'SpiritualCareReferral'
  | 'BereavementSupport'
  | 'LegalSupportReferral'
  | 'Other';

export type SocialAssessmentOutcome =
  | 'SuitableForInpatientHospiceCare'
  | 'SuitableForHomeBasedHospiceCare'
  | 'RequiresAdditionalSocialSupport'
  | 'RequiresCommunityResourceMobilization'
  | 'HighRiskSocialSituation'
  | 'FollowUpAssessmentRequired';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface SocialAssessmentHouseholdMemberRow {
  id?: string;
  name?: string;
  relationship?: string;
  age?: number | null;
  occupation?: string;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface SocialAssessment {
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

  assessmentType: SocialAssessmentType;

  householdSize?: number | null;
  livingArrangement?: SocialLivingArrangement | null;
  livingArrangementOther?: string | null;

  caregiverAvailability?: SocialCaregiverAvailability | null;
  caregiverHealth?: SocialCaregiverHealth | null;
  caregiverUnderstanding?: SocialCaregiverUnderstanding | null;
  caregiverStress?: SocialCaregiverStress | null;

  familySupport?: SocialFamilySupport | null;
  communitySupport: SocialCommunitySupport[];
  contactFrequency?: SocialContactFrequency | null;
  isolationRisk?: SocialIsolationRisk | null;

  incomeSources: SocialIncomeSource[];
  incomeSourceOther?: string | null;
  monthlyHouseholdIncome?: SocialMonthlyIncome | null;
  financialChallenges: SocialFinancialChallenge[];
  financialChallengeOther?: string | null;
  financialRiskLevel?: SocialFinancialRisk | null;

  residenceType?: SocialResidenceType | null;
  residenceTypeOther?: string | null;
  homeEnvironment?: SocialHomeEnvironment | null;
  utilitiesAccess: Record<string, boolean>;
  homeBasedCareSuitability?: SocialHomeBasedCareSuitability | null;

  transportAccess: SocialTransportAccess[];
  distanceToHealthFacilityKm?: number | null;
  transportChallenges: SocialTransportChallenge[];
  transportChallengeOther?: string | null;

  employmentStatus?: SocialEmploymentStatus | null;
  educationLevel?: SocialEducationLevel | null;

  religiousAffiliation?: SocialReligiousAffiliation | null;
  religiousAffiliationOther?: string | null;
  spiritualSupportAvailable?: boolean | null;
  culturalFactorsAffectingCare?: string | null;

  hasLegalRepresentative?: boolean | null;
  advanceDirectivesAvailable?: boolean | null;
  legalConcerns: SocialLegalConcern[];
  legalConcernOther?: string | null;

  familyPreparedForPrognosis?: SocialFamilyPreparedness | null;
  anticipatoryGrief?: SocialAnticipatoryGrief | null;
  bereavementRisk?: SocialBereavementRisk | null;
  familyRequiresSupport?: boolean | null;

  majorSocialIssues: SocialMajorIssue[];
  majorSocialIssueOther?: string | null;
  strengthsAndResources?: string | null;
  areasRequiringIntervention?: string | null;

  plannedInterventions: SocialCarePlanIntervention[];
  plannedInterventionOther?: string | null;
  followUpPlan?: string | null;

  assessmentOutcome: SocialAssessmentOutcome[];

  householdMembers: SocialAssessmentHouseholdMemberRow[];

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

export interface SocialAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: SocialAssessmentType;
  livingArrangement?: SocialLivingArrangement | null;
  isolationRisk?: SocialIsolationRisk | null;
  financialRiskLevel?: SocialFinancialRisk | null;
  bereavementRisk?: SocialBereavementRisk | null;
  assessmentOutcome?: SocialAssessmentOutcome[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateSocialAssessmentRequest {
  assessmentType: SocialAssessmentType;

  householdSize?: number;
  householdMembers?: Omit<SocialAssessmentHouseholdMemberRow, 'id'>[];

  livingArrangement?: SocialLivingArrangement;
  livingArrangementOther?: string;

  caregiverAvailability?: SocialCaregiverAvailability;
  caregiverHealth?: SocialCaregiverHealth;
  caregiverUnderstanding?: SocialCaregiverUnderstanding;
  caregiverStress?: SocialCaregiverStress;

  familySupport?: SocialFamilySupport;
  communitySupport?: SocialCommunitySupport[];
  contactFrequency?: SocialContactFrequency;
  isolationRisk?: SocialIsolationRisk;

  incomeSources?: SocialIncomeSource[];
  incomeSourceOther?: string;
  monthlyHouseholdIncome?: SocialMonthlyIncome;
  financialChallenges?: SocialFinancialChallenge[];
  financialChallengeOther?: string;
  financialRiskLevel?: SocialFinancialRisk;

  residenceType?: SocialResidenceType;
  residenceTypeOther?: string;
  homeEnvironment?: SocialHomeEnvironment;
  utilitiesAccess?: Record<string, boolean>;
  homeBasedCareSuitability?: SocialHomeBasedCareSuitability;

  transportAccess?: SocialTransportAccess[];
  distanceToHealthFacilityKm?: number;
  transportChallenges?: SocialTransportChallenge[];
  transportChallengeOther?: string;

  employmentStatus?: SocialEmploymentStatus;
  educationLevel?: SocialEducationLevel;

  religiousAffiliation?: SocialReligiousAffiliation;
  religiousAffiliationOther?: string;
  spiritualSupportAvailable?: boolean;
  culturalFactorsAffectingCare?: string;

  hasLegalRepresentative?: boolean;
  advanceDirectivesAvailable?: boolean;
  legalConcerns?: SocialLegalConcern[];
  legalConcernOther?: string;

  familyPreparedForPrognosis?: SocialFamilyPreparedness;
  anticipatoryGrief?: SocialAnticipatoryGrief;
  bereavementRisk?: SocialBereavementRisk;
  familyRequiresSupport?: boolean;

  majorSocialIssues?: SocialMajorIssue[];
  majorSocialIssueOther?: string;
  strengthsAndResources?: string;
  areasRequiringIntervention?: string;

  plannedInterventions?: SocialCarePlanIntervention[];
  plannedInterventionOther?: string;
  followUpPlan?: string;

  assessmentOutcome?: SocialAssessmentOutcome[];
}

export type UpdateSocialAssessmentRequest =
  Partial<CreateSocialAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface SocialAssessmentListResponse {
  items: SocialAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}