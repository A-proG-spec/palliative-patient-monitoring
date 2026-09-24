// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type PsychiatryAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'EmergencyReview';

export type PsychiatrySymptom =
  | 'Anxiety'
  | 'Depression'
  | 'Insomnia'
  | 'Delirium'
  | 'Hallucinations'
  | 'Agitation'
  | 'SuicidalIdeation'
  | 'CognitiveDecline'
  | 'AdjustmentDisorder'
  | 'Other';

export type PsychiatrySeverity =
  | 'Mild'
  | 'Moderate'
  | 'Severe'
  | 'Fluctuating';

export type PsychiatryAppearanceBehavior =
  | 'Calm'
  | 'Restless'
  | 'Agitated'
  | 'Withdrawn'
  | 'PoorSelfCare';

export type PsychiatrySpeech =
  | 'Normal'
  | 'Slow'
  | 'Pressured'
  | 'Minimal';

export type PsychiatryMood =
  | 'Euthymic'
  | 'Depressed'
  | 'Anxious'
  | 'Irritable';

export type PsychiatryAffect =
  | 'Appropriate'
  | 'Blunted'
  | 'Flat'
  | 'Labile';

export type PsychiatryThoughtProcess =
  | 'Logical'
  | 'Circumstantial'
  | 'Disorganized'
  | 'Tangential';

export type PsychiatryThoughtContent =
  | 'NoDelusions'
  | 'Hopelessness'
  | 'Guilt'
  | 'SuicidalThoughts'
  | 'Paranoia'
  | 'SomaticPreoccupation';

export type PsychiatryPerception =
  | 'NoHallucinations'
  | 'AuditoryHallucinations'
  | 'VisualHallucinations';

export type PsychiatryCognition =
  | 'OrientedX3'
  | 'Disoriented'
  | 'MemoryImpairment'
  | 'AttentionDeficits';

export type PsychiatryInsightJudgment =
  | 'Good'
  | 'Partial'
  | 'Poor';

export type PsychiatrySuicidalIdeation =
  | 'None'
  | 'PassiveThoughts'
  | 'ActiveThoughts'
  | 'PlanPresent';

export type PsychiatrySuicideRiskLevel =
  | 'Low'
  | 'Moderate'
  | 'High';

export type PsychiatryProtectiveFactor =
  | 'FamilySupport'
  | 'ReligiousBeliefs'
  | 'FearOfDeath'
  | 'ResponsibilityForFamily'
  | 'SocialSupport';

export type PsychiatryOrganicCause =
  | 'Pain'
  | 'Hypoxia'
  | 'Infection'
  | 'MedicationSideEffects'
  | 'MetabolicImbalance'
  | 'Delirium'
  | 'CancerProgression';

export type PsychiatrySleepPattern =
  | 'Normal'
  | 'Insomnia'
  | 'FragmentedSleep'
  | 'ExcessiveSleepiness';

export type PsychiatryAppetite =
  | 'Normal'
  | 'Reduced'
  | 'Poor';

export type PsychiatryDailyFunctioning =
  | 'Independent'
  | 'RequiresAssistance'
  | 'Dependent';

export type PsychiatrySocialWithdrawal =
  | 'None'
  | 'Mild'
  | 'Severe';

export type PsychiatryDiagnosis =
  | 'MajorDepressiveDisorder'
  | 'AnxietyDisorder'
  | 'AdjustmentDisorder'
  | 'Delirium'
  | 'DepressionDueToMedicalCondition'
  | 'MixedAnxietyDepression'
  | 'Other';

export type PsychiatryImmediateIntervention =
  | 'CrisisManagement'
  | 'SuicidePrecautions'
  | 'EnvironmentalSafety'
  | 'SupportiveCounseling'
  | 'FamilyCounseling';

export type PsychiatryPharmacologicalPlan =
  | 'Antidepressants'
  | 'Anxiolytics'
  | 'Antipsychotics'
  | 'SleepMedications'
  | 'DoseAdjustmentReview';

export type PsychiatryNonPharmacologicalPlan =
  | 'Psychotherapy'
  | 'RelaxationTechniques'
  | 'SpiritualSupport'
  | 'MusicTherapy'
  | 'BehavioralActivation';

export type PsychiatryMonitoringPlan =
  | 'Daily'
  | 'Weekly'
  | 'AsNeeded';

export type PsychiatryFamilyDistressLevel =
  | 'Low'
  | 'Moderate'
  | 'High';

export type PsychiatryAssessmentOutcome =
  | 'NoPsychiatricInterventionRequired'
  | 'RequiresSupportiveCounseling'
  | 'RequiresPharmacologicalTreatment'
  | 'RequiresCloseMonitoring'
  | 'HighRiskSafetyPrecautionsRequired';

export type PsychiatryFinalRecommendation =
  | 'ContinueHospicePsychologicalSupport'
  | 'InitiatePsychiatricMedication'
  | 'CrisisInterventionRequired'
  | 'FamilyCounselingRequired'
  | 'OngoingPsychiatricFollowUp';

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface PsychiatryAssessment {
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

  assessmentType: PsychiatryAssessmentType;

  // Presenting problem
  reasonForReferral?: string | null;
  currentSymptoms: PsychiatrySymptom[];
  symptomOther?: string | null;
  onsetAndDuration?: string | null;
  severity?: PsychiatrySeverity | null;

  // Mental state examination
  appearanceBehavior: PsychiatryAppearanceBehavior[];
  speech?: PsychiatrySpeech | null;
  mood?: PsychiatryMood | null;
  affect?: PsychiatryAffect | null;
  thoughtProcess: PsychiatryThoughtProcess[];
  thoughtContent: PsychiatryThoughtContent[];
  perception: PsychiatryPerception[];
  cognition: PsychiatryCognition[];
  insightJudgment?: PsychiatryInsightJudgment | null;

  // Suicide risk
  suicidalIdeation?: PsychiatrySuicidalIdeation | null;
  suicideRiskLevel?: PsychiatrySuicideRiskLevel | null;
  protectiveFactors: PsychiatryProtectiveFactor[];

  // Organic
  organicCauses: PsychiatryOrganicCause[];
  medicationsAffectingMentalState?: string | null;

  // Sleep & appetite
  sleepPattern?: PsychiatrySleepPattern | null;
  appetite?: PsychiatryAppetite | null;

  // Functional & social
  dailyFunctioning?: PsychiatryDailyFunctioning | null;
  socialWithdrawal?: PsychiatrySocialWithdrawal | null;

  // Diagnosis
  diagnoses: PsychiatryDiagnosis[];
  diagnosisOther?: string | null;

  // Plan
  immediateInterventions: PsychiatryImmediateIntervention[];
  pharmacologicalPlan: PsychiatryPharmacologicalPlan[];
  nonPharmacologicalPlan: PsychiatryNonPharmacologicalPlan[];
  monitoringPlan: PsychiatryMonitoringPlan[];

  // Family
  familyDistressLevel?: PsychiatryFamilyDistressLevel | null;
  caregiverBurnout?: boolean | null;
  familyCounselingNeeded?: boolean | null;

  // Summary
  assessmentOutcome: PsychiatryAssessmentOutcome[];
  finalRecommendations: PsychiatryFinalRecommendation[];

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

export interface PsychiatryAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: PsychiatryAssessmentType;
  severity?: PsychiatrySeverity | null;
  suicidalIdeation?: PsychiatrySuicidalIdeation | null;
  suicideRiskLevel?: PsychiatrySuicideRiskLevel | null;
  diagnoses?: PsychiatryDiagnosis[];
  assessmentOutcome?: PsychiatryAssessmentOutcome[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
//
// ⚠️ SAFETY NOTE
// ──────────────
// Creating with `suicideRiskLevel: 'High'` triggers a backend
// notification. Deleting a high-risk assessment REQUIRES a
// non-empty `reason` (enforced by the backend service).
// ═════════════════════════════════════════════════════════════

export interface CreatePsychiatryAssessmentRequest {
  assessmentType: PsychiatryAssessmentType;

  reasonForReferral?: string;
  currentSymptoms?: PsychiatrySymptom[];
  symptomOther?: string;
  onsetAndDuration?: string;
  severity?: PsychiatrySeverity;

  appearanceBehavior?: PsychiatryAppearanceBehavior[];
  speech?: PsychiatrySpeech;
  mood?: PsychiatryMood;
  affect?: PsychiatryAffect;
  thoughtProcess?: PsychiatryThoughtProcess[];
  thoughtContent?: PsychiatryThoughtContent[];
  perception?: PsychiatryPerception[];
  cognition?: PsychiatryCognition[];
  insightJudgment?: PsychiatryInsightJudgment;

  suicidalIdeation?: PsychiatrySuicidalIdeation;
  suicideRiskLevel?: PsychiatrySuicideRiskLevel;
  protectiveFactors?: PsychiatryProtectiveFactor[];

  organicCauses?: PsychiatryOrganicCause[];
  medicationsAffectingMentalState?: string;

  sleepPattern?: PsychiatrySleepPattern;
  appetite?: PsychiatryAppetite;

  dailyFunctioning?: PsychiatryDailyFunctioning;
  socialWithdrawal?: PsychiatrySocialWithdrawal;

  diagnoses?: PsychiatryDiagnosis[];
  diagnosisOther?: string;

  immediateInterventions?: PsychiatryImmediateIntervention[];
  pharmacologicalPlan?: PsychiatryPharmacologicalPlan[];
  nonPharmacologicalPlan?: PsychiatryNonPharmacologicalPlan[];
  monitoringPlan?: PsychiatryMonitoringPlan[];

  familyDistressLevel?: PsychiatryFamilyDistressLevel;
  caregiverBurnout?: boolean;
  familyCounselingNeeded?: boolean;

  assessmentOutcome?: PsychiatryAssessmentOutcome[];
  finalRecommendations?: PsychiatryFinalRecommendation[];
}

export type UpdatePsychiatryAssessmentRequest =
  Partial<CreatePsychiatryAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface PsychiatryAssessmentListResponse {
  items: PsychiatryAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}