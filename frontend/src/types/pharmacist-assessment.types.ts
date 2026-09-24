// ═════════════════════════════════════════════════════════════
// ENUMS — mirror backend Prisma enums exactly
// ═════════════════════════════════════════════════════════════

export type PharmacistAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'MedicationReview';

export type PharmacistWeightStatus =
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Unknown';

export type PharmacistPainControl =
  | 'WellControlled'
  | 'PartiallyControlled'
  | 'PoorlyControlled';

export type PharmacistBreakthroughPain =
  | 'None'
  | 'Occasional'
  | 'Frequent';

export type PharmacistOpioidSideEffect =
  | 'Constipation'
  | 'Nausea'
  | 'Sedation'
  | 'Confusion'
  | 'RespiratoryDepression'
  | 'None';

export type PharmacistInteractionRisk =
  | 'None'
  | 'Possible'
  | 'Significant';

export type PharmacistHighRiskMedication =
  | 'Opioids'
  | 'Benzodiazepines'
  | 'Anticoagulants'
  | 'Steroids'
  | 'Antiepileptics';

export type PharmacistOrganFunction =
  | 'Normal'
  | 'Impaired'
  | 'Unknown';

export type PharmacistEffectiveness =
  | 'Good'
  | 'Fair'
  | 'Poor';

export type PharmacistADRSeverity =
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type PharmacistADRAction =
  | 'DoseAdjustment'
  | 'DrugDiscontinued'
  | 'SymptomaticTreatment'
  | 'ReportedToCommittee';

export type PharmacistBowelFunction =
  | 'Normal'
  | 'Constipated'
  | 'SevereConstipation';

export type PharmacistDoseAdjustmentReason =
  | 'RenalImpairment'
  | 'HepaticImpairment'
  | 'ElderlyDosing'
  | 'WeightBasedAdjustment';

export type PharmacistPatientUnderstanding =
  | 'Good'
  | 'Moderate'
  | 'Poor';

export type PharmacistCounselingTopic =
  | 'PainMedications'
  | 'OpioidSafety'
  | 'SideEffects'
  | 'Adherence'
  | 'ConstipationPrevention'
  | 'EndOfLifeMedications';

export type PharmacistMedicationPlanAction =
  | 'OptimizeAnalgesicRegimen'
  | 'StartAdjustLaxatives'
  | 'ManageNauseaVomiting'
  | 'ReviewPolypharmacy'
  | 'ReduceUnnecessaryMedications'
  | 'InitiateAdjuvantTherapy'
  | 'MonitorSedationLevel'
  | 'Other';

export type PharmacistMedicationAvailability =
  | 'AllAvailable'
  | 'PartiallyAvailable'
  | 'NotAvailable';

export type PharmacistSummaryFlag =
  | 'MedicationRegimenAppropriate'
  | 'RequiresOptimization'
  | 'RequiresUrgentIntervention'
  | 'HighRiskMedicationProfile'
  | 'DeprescribingRecommended'
  | 'OngoingMonitoringRequired';

export type PharmacistFinalRecommendation =
  | 'ContinueCurrentRegimen'
  | 'ModifyAnalgesicPlan'
  | 'InitiateSymptomControlMedications'
  | 'DeprescribeNonEssentialMedications'
  | 'EnhanceSafetyMonitoring'
  | 'MultidisciplinaryReviewRequired';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface PharmacistAssessmentMedicationRow {
  id?: string;
  name?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  indication?: string;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT — as returned by the API
// ═════════════════════════════════════════════════════════════

export interface ClinicalPharmacistAssessment {
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

  // Header
  assessmentType: PharmacistAssessmentType;
  weightKg?: number | null;
  allergies?: string | null;
  wardUnit?: string | null;

  // Medication history
  otcHerbalUsed: boolean;
  otcHerbalDetails?: string | null;
  medicationHistoryAdherence?: PharmacistWeightStatus | null;
  hasAdrHistory: boolean;
  adrHistoryDetails?: string | null;

  // Pain management review
  analgesicNonOpioids: boolean;
  analgesicWeakOpioids: boolean;
  analgesicStrongOpioids: boolean;
  analgesicAdjuvants: boolean;
  analgesicOtherDetails?: string | null;
  painControl?: PharmacistPainControl | null;
  breakthroughPain?: PharmacistBreakthroughPain | null;
  opioidSideEffects: PharmacistOpioidSideEffect[];

  // Medication safety
  drugDrugInteractions?: PharmacistInteractionRisk | null;
  drugDrugInteractionDetails?: string | null;
  drugDiseaseInteractions: boolean;
  drugDiseaseInteractionDetails?: string | null;
  highRiskMedications: PharmacistHighRiskMedication[];

  // Renal & hepatic
  renalFunction?: PharmacistOrganFunction | null;
  creatinine?: string | null;
  hepaticFunction?: PharmacistOrganFunction | null;
  lfts?: string | null;

  // Symptom-related review — map of symptom → effectiveness
  symptomMedicationEffectiveness: Record<string, PharmacistEffectiveness | ''>;

  // ADR
  suspectedAdr: boolean;
  suspectedAdrDrug?: string | null;
  suspectedAdrReaction?: string | null;
  adrSeverity?: PharmacistADRSeverity | null;
  adrManagement: PharmacistADRAction[];

  // Constipation
  bowelFunction?: PharmacistBowelFunction | null;
  laxativeUse: boolean;
  laxativeDetails?: string | null;

  // Dose adjustment
  doseAdjustmentRequired: boolean;
  doseAdjustmentReasons: PharmacistDoseAdjustmentReason[];

  // Counselling
  patientUnderstanding?: PharmacistPatientUnderstanding | null;
  counselingTopics: PharmacistCounselingTopic[];

  // Plan
  currentIssuesIdentified?: string | null;
  medicationPlanActions: PharmacistMedicationPlanAction[];
  medicationPlanOther?: string | null;

  // Access & supply
  medicationAvailability?: PharmacistMedicationAvailability | null;
  financialBarriers: boolean;
  pharmacyIntervention: boolean;

  // Summary
  pharmacistSummary?: string | null;
  summaryFlags: PharmacistSummaryFlag[];
  finalRecommendations: PharmacistFinalRecommendation[];
  clinicalPharmacistName?: string | null;

  // Children
  currentMedications: PharmacistAssessmentMedicationRow[];

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
// LIST DTO — lighter shape returned by list endpoints
// ═════════════════════════════════════════════════════════════

export interface ClinicalPharmacistAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: PharmacistAssessmentType;
  painControl?: PharmacistPainControl | null;
  pharmacistSummary?: string | null;
  summaryFlags?: PharmacistSummaryFlag[];
  finalRecommendations?: PharmacistFinalRecommendation[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateClinicalPharmacistAssessmentRequest {
  assessmentType: PharmacistAssessmentType;
  weightKg?: number;
  allergies?: string;
  wardUnit?: string;

  otcHerbalUsed?: boolean;
  otcHerbalDetails?: string;
  medicationHistoryAdherence?: PharmacistWeightStatus;
  hasAdrHistory?: boolean;
  adrHistoryDetails?: string;

  analgesicNonOpioids?: boolean;
  analgesicWeakOpioids?: boolean;
  analgesicStrongOpioids?: boolean;
  analgesicAdjuvants?: boolean;
  analgesicOtherDetails?: string;
  painControl?: PharmacistPainControl;
  breakthroughPain?: PharmacistBreakthroughPain;
  opioidSideEffects?: PharmacistOpioidSideEffect[];

  drugDrugInteractions?: PharmacistInteractionRisk;
  drugDrugInteractionDetails?: string;
  drugDiseaseInteractions?: boolean;
  drugDiseaseInteractionDetails?: string;
  highRiskMedications?: PharmacistHighRiskMedication[];

  renalFunction?: PharmacistOrganFunction;
  creatinine?: string;
  hepaticFunction?: PharmacistOrganFunction;
  lfts?: string;

  symptomMedicationEffectiveness?: Record<string, PharmacistEffectiveness | ''>;

  suspectedAdr?: boolean;
  suspectedAdrDrug?: string;
  suspectedAdrReaction?: string;
  adrSeverity?: PharmacistADRSeverity;
  adrManagement?: PharmacistADRAction[];

  bowelFunction?: PharmacistBowelFunction;
  laxativeUse?: boolean;
  laxativeDetails?: string;

  doseAdjustmentRequired?: boolean;
  doseAdjustmentReasons?: PharmacistDoseAdjustmentReason[];

  patientUnderstanding?: PharmacistPatientUnderstanding;
  counselingTopics?: PharmacistCounselingTopic[];

  currentIssuesIdentified?: string;
  medicationPlanActions?: PharmacistMedicationPlanAction[];
  medicationPlanOther?: string;

  medicationAvailability?: PharmacistMedicationAvailability;
  financialBarriers?: boolean;
  pharmacyIntervention?: boolean;

  pharmacistSummary?: string;
  summaryFlags?: PharmacistSummaryFlag[];
  finalRecommendations?: PharmacistFinalRecommendation[];
  clinicalPharmacistName?: string;

  currentMedications?: Omit<PharmacistAssessmentMedicationRow, 'id'>[];
}

export type UpdateClinicalPharmacistAssessmentRequest =
  Partial<CreateClinicalPharmacistAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface ClinicalPharmacistAssessmentListResponse {
  items: ClinicalPharmacistAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}