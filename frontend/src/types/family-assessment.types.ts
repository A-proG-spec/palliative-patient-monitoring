// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type FamilyAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'CrisisReview';

export type FamilyDecisionMaker =
  | 'Patient'
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Other';

export type FamilyCaregiverAvailability =
  | 'FullTime'
  | 'PartTime'
  | 'Occasional'
  | 'NotAvailable';

export type FamilyPhysicalAbility =
  | 'Strong'
  | 'Moderate'
  | 'Limited'
  | 'Unable';

export type FamilyEmotionalReadiness =
  | 'Ready'
  | 'SomewhatReady'
  | 'Overwhelmed'
  | 'NotReady';

export type FamilyKnowledgeLevel =
  | 'Good'
  | 'Moderate'
  | 'Poor'
  | 'None';

export type FamilyInternalSupport =
  | 'StrongFamilyUnity'
  | 'ModerateSupport'
  | 'ConflictPresent'
  | 'NoSupport';

export type FamilyExternalSupport =
  | 'Community'
  | 'ReligiousInstitution'
  | 'NgoSupport'
  | 'None';

export type FamilySocialIsolationRisk =
  | 'Low'
  | 'Moderate'
  | 'High';

export type FamilyIncomeSource =
  | 'Employment'
  | 'Farming'
  | 'Pension'
  | 'FamilySupport'
  | 'NoStableIncome';

export type FamilyIncomeLevel =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Unknown';

export type FamilyFinancialBurden =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type FamilyFinancialChallenge =
  | 'MedicationCosts'
  | 'Transportation'
  | 'FoodInsecurity'
  | 'LossOfIncome'
  | 'CaregiverBurden';

export type FamilyHousingType =
  | 'Owned'
  | 'Rented'
  | 'TemporaryShelter'
  | 'Other';

export type FamilyHomeEnvironment =
  | 'Safe'
  | 'PartiallySafe'
  | 'Unsafe';

export type FamilyUtilityService =
  | 'Water'
  | 'Electricity'
  | 'Sanitation';

export type FamilyCopingAbility =
  | 'Strong'
  | 'Moderate'
  | 'Poor';

export type FamilyEmotionalStatus =
  | 'Calm'
  | 'Anxious'
  | 'Distressed'
  | 'Overwhelmed';

export type FamilyAnticipatoryGrief =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type FamilyReligiousAffiliation =
  | 'Orthodox'
  | 'Muslim'
  | 'Protestant'
  | 'Catholic'
  | 'Other';

export type FamilyPalliativeAcceptance =
  | 'FullyAccepting'
  | 'PartiallyAccepting'
  | 'Resistant'
  | 'NotInformed';

export type FamilyBurdenLevel =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Severe';

export type FamilyBurdenFactor =
  | 'PhysicalExhaustion'
  | 'EmotionalStress'
  | 'FinancialStrain'
  | 'LackOfSupport'
  | 'LackOfKnowledge';

export type FamilyNeed =
  | 'EducationOnDiseaseProcess'
  | 'CaregiverTraining'
  | 'FinancialAssistance'
  | 'PsychologicalCounseling'
  | 'SpiritualSupport'
  | 'RespiteCare'
  | 'BereavementPreparation';

export type FamilyStrength =
  | 'StrongBonding'
  | 'WillingCaregiver'
  | 'ReligiousSupport'
  | 'StableHousing'
  | 'CommunitySupport'
  | 'GoodCommunication';

export type FamilySupportService =
  | 'SocialWork'
  | 'PsychologyPsychiatry'
  | 'SpiritualCare'
  | 'FinancialAssistancePrograms'
  | 'CommunityVolunteers';

export type FamilyFollowUpPlan =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'AsNeeded';

export type FamilyAssessmentOutcome =
  | 'StrongFamilySupport'
  | 'AdequateSupportWithInterventionNeeded'
  | 'HighCaregiverBurden'
  | 'AtRiskFamilySystem'
  | 'RequiresIntensivePsychosocialSupport';

export type FamilyFinalRecommendation =
  | 'ContinueFamilyInvolvement'
  | 'ProvideCaregiverTraining'
  | 'InitiateFinancialSocialSupport'
  | 'PsychologicalCounselingRequired'
  | 'BereavementPreparationNeeded'
  | 'MultidisciplinaryFamilyIntervention';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface FamilyHouseholdMemberRow {
  id?: string;
  name?: string;
  age?: number | null;
  relationship?: string;
  occupation?: string;
  contact?: string;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface FamilyAssessment {
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

  assessmentType: FamilyAssessmentType;

  householdSize?: number | null;
  primaryDecisionMaker?: FamilyDecisionMaker | null;
  primaryDecisionMakerName?: string | null;

  primaryCaregiverName?: string | null;
  primaryCaregiverRelationship?: string | null;
  primaryCaregiverAge?: number | null;
  primaryCaregiverPhone?: string | null;

  secondaryCaregiverName?: string | null;
  secondaryCaregiverRelationship?: string | null;
  secondaryCaregiverPhone?: string | null;

  caregiverAvailability?: FamilyCaregiverAvailability | null;
  physicalAbility?: FamilyPhysicalAbility | null;
  emotionalReadiness?: FamilyEmotionalReadiness | null;
  knowledgeOfIllness?: FamilyKnowledgeLevel | null;

  internalSupport?: FamilyInternalSupport | null;
  externalSupport: FamilyExternalSupport[];
  socialIsolationRisk?: FamilySocialIsolationRisk | null;

  incomeSources: FamilyIncomeSource[];
  monthlyIncomeLevel?: FamilyIncomeLevel | null;
  financialBurden?: FamilyFinancialBurden | null;
  financialChallenges: FamilyFinancialChallenge[];

  housingType?: FamilyHousingType | null;
  housingTypeOther?: string | null;
  homeEnvironment?: FamilyHomeEnvironment | null;
  utilitiesAccess: Record<string, boolean>;

  copingAbility?: FamilyCopingAbility | null;
  familyEmotionalStatus?: FamilyEmotionalStatus | null;
  anticipatoryGrief?: FamilyAnticipatoryGrief | null;

  religiousAffiliation?: FamilyReligiousAffiliation | null;
  religiousAffiliationOther?: string | null;
  culturalBeliefsAffectingCare?: string | null;
  palliativeCareAcceptance?: FamilyPalliativeAcceptance | null;

  burdenLevel?: FamilyBurdenLevel | null;
  burdenFactors: FamilyBurdenFactor[];

  needs: FamilyNeed[];
  strengths: FamilyStrength[];

  plannedInterventions?: string | null;
  supportServices: FamilySupportService[];
  followUpPlan?: FamilyFollowUpPlan | null;

  assessmentOutcome: FamilyAssessmentOutcome[];
  finalRecommendations: FamilyFinalRecommendation[];
  assessorName?: string | null;

  householdMembers: FamilyHouseholdMemberRow[];

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

export interface FamilyAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: FamilyAssessmentType;
  burdenLevel?: FamilyBurdenLevel | null;
  palliativeCareAcceptance?: FamilyPalliativeAcceptance | null;
  assessmentOutcome?: FamilyAssessmentOutcome[];
  assessorName?: string | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateFamilyAssessmentRequest {
  assessmentType: FamilyAssessmentType;

  householdSize?: number;
  householdMembers?: Omit<FamilyHouseholdMemberRow, 'id'>[];

  primaryDecisionMaker?: FamilyDecisionMaker;
  primaryDecisionMakerName?: string;

  primaryCaregiverName?: string;
  primaryCaregiverRelationship?: string;
  primaryCaregiverAge?: number;
  primaryCaregiverPhone?: string;

  secondaryCaregiverName?: string;
  secondaryCaregiverRelationship?: string;
  secondaryCaregiverPhone?: string;

  caregiverAvailability?: FamilyCaregiverAvailability;
  physicalAbility?: FamilyPhysicalAbility;
  emotionalReadiness?: FamilyEmotionalReadiness;
  knowledgeOfIllness?: FamilyKnowledgeLevel;

  internalSupport?: FamilyInternalSupport;
  externalSupport?: FamilyExternalSupport[];
  socialIsolationRisk?: FamilySocialIsolationRisk;

  incomeSources?: FamilyIncomeSource[];
  monthlyIncomeLevel?: FamilyIncomeLevel;
  financialBurden?: FamilyFinancialBurden;
  financialChallenges?: FamilyFinancialChallenge[];

  housingType?: FamilyHousingType;
  housingTypeOther?: string;
  homeEnvironment?: FamilyHomeEnvironment;
  utilitiesAccess?: Record<string, boolean>;

  copingAbility?: FamilyCopingAbility;
  familyEmotionalStatus?: FamilyEmotionalStatus;
  anticipatoryGrief?: FamilyAnticipatoryGrief;

  religiousAffiliation?: FamilyReligiousAffiliation;
  religiousAffiliationOther?: string;
  culturalBeliefsAffectingCare?: string;
  palliativeCareAcceptance?: FamilyPalliativeAcceptance;

  burdenLevel?: FamilyBurdenLevel;
  burdenFactors?: FamilyBurdenFactor[];

  needs?: FamilyNeed[];
  strengths?: FamilyStrength[];

  plannedInterventions?: string;
  supportServices?: FamilySupportService[];
  followUpPlan?: FamilyFollowUpPlan;

  assessmentOutcome?: FamilyAssessmentOutcome[];
  finalRecommendations?: FamilyFinalRecommendation[];
  assessorName?: string;
}

export type UpdateFamilyAssessmentRequest =
  Partial<CreateFamilyAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface FamilyAssessmentListResponse {
  items: FamilyAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}