// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type PhysiotherapyAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'Reassessment';

export type PhysiotherapyComorbidity =
  | 'Hypertension'
  | 'DiabetesMellitus'
  | 'Stroke'
  | 'COPD'
  | 'HeartFailure'
  | 'Cancer'
  | 'Other';

export type PhysiotherapyGeneralCondition =
  | 'Stable'
  | 'Deteriorating'
  | 'Bedbound'
  | 'TerminalPhase';

export type PhysiotherapyPainType =
  | 'Musculoskeletal'
  | 'Neuropathic'
  | 'CancerRelated'
  | 'Mixed'
  | 'Other';

export type PhysiotherapySymptom =
  | 'Fatigue'
  | 'Dyspnea'
  | 'Weakness'
  | 'MuscleStiffness'
  | 'BalanceProblems'
  | 'Contractures';

export type PhysiotherapyMobilityStatus =
  | 'Independent'
  | 'RequiresAssistance'
  | 'WheelchairBound'
  | 'Bedridden';

export type PhysiotherapyTransferAbility =
  | 'Independent'
  | 'MinimalAssistance'
  | 'ModerateAssistance'
  | 'Dependent';

export type PhysiotherapyWalkingAbility =
  | 'Normal'
  | 'ReducedDistance'
  | 'WithAid'
  | 'UnableToWalk';

export type PhysiotherapyAssistiveDevice =
  | 'None'
  | 'Cane'
  | 'Walker'
  | 'Wheelchair'
  | 'Other';

export type PhysiotherapyRangeOfMotion =
  | 'Full'
  | 'Reduced'
  | 'SeverelyLimited';

export type PhysiotherapyJointFinding =
  | 'None'
  | 'Present';

export type PhysiotherapyConsciousness =
  | 'Alert'
  | 'Drowsy'
  | 'Confused';

export type PhysiotherapyCoordination =
  | 'Normal'
  | 'Impaired';

export type PhysiotherapySensoryDeficit =
  | 'None'
  | 'Present';

export type PhysiotherapyBalance =
  | 'Stable'
  | 'Unstable'
  | 'HighFallRisk';

export type PhysiotherapyBreathingPattern =
  | 'Normal'
  | 'Shallow'
  | 'Labored';

export type PhysiotherapyBreathlessnessLevel =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type PhysiotherapyChestExpansion =
  | 'Normal'
  | 'Reduced';

export type PhysiotherapyRespiratoryNeed =
  | 'BreathingExercises'
  | 'ChestPhysiotherapy'
  | 'PositioningSupport';

export type PhysiotherapyPressureRisk =
  | 'Low'
  | 'Moderate'
  | 'High';

export type PhysiotherapyPressureArea =
  | 'None'
  | 'Sacrum'
  | 'Heels'
  | 'Hips'
  | 'Other';

export type PhysiotherapyPressurePrevention =
  | 'Repositioning'
  | 'PressureMattress'
  | 'SkinCareEducation'
  | 'PassiveExercises';

export type PhysiotherapyADLActivity =
  | 'BedMobility'
  | 'Feeding'
  | 'Bathing'
  | 'Dressing'
  | 'Toileting';

export type PhysiotherapyADLLevel =
  | 'Independent'
  | 'Assisted'
  | 'Dependent';

export type PhysiotherapyFallRiskLevel =
  | 'Low'
  | 'Moderate'
  | 'High';

export type PhysiotherapyFallContributor =
  | 'Weakness'
  | 'BalanceIssues'
  | 'SedativeMedication'
  | 'EnvironmentalHazards'
  | 'PosturalHypotension';

export type PhysiotherapyDiagnosis =
  | 'DecreasedMobility'
  | 'MuscleWeakness'
  | 'ImpairedBalance'
  | 'ReducedEndurance'
  | 'JointStiffness'
  | 'RiskOfContractures'
  | 'ReducedFunctionalIndependence';

export type PhysiotherapyIntervention =
  | 'PassiveRangeOfMotionExercises'
  | 'ActiveAssistedExercises'
  | 'BreathingExercises'
  | 'PositioningProgram'
  | 'PainReductionTechniques'
  | 'MobilityTraining'
  | 'SittingBalanceTraining'
  | 'WalkingAssistance'
  | 'FamilyCaregiverTraining';

export type PhysiotherapyFrequency =
  | 'Daily'
  | 'ThreeToFiveTimesPerWeek'
  | 'Weekly'
  | 'AsTolerated';

export type PhysiotherapyEquipment =
  | 'Wheelchair'
  | 'WalkingFrame'
  | 'Crutches'
  | 'PressureMattress'
  | 'BedRails'
  | 'TransferBoard'
  | 'None';

export type PhysiotherapyCaregiverTraining =
  | 'PositioningTechniques'
  | 'SafeTransfers'
  | 'ExerciseAssistance'
  | 'FallPrevention'
  | 'PressureSorePrevention'
  | 'MobilitySupport';

export type PhysiotherapyOutcome =
  | 'FullyIndependent'
  | 'RehabilitationNotRequired'
  | 'RequiresSupportivePhysiotherapy'
  | 'RequiresIntensiveMobilitySupport'
  | 'HighRiskForFunctionalDecline'
  | 'PalliativeComfortFocusedPhysiotherapyRequired';

export type PhysiotherapyFinalRecommendation =
  | 'ComfortFocusedPhysiotherapy'
  | 'MobilityMaintenanceExercises'
  | 'PainReliefPositioningTherapy'
  | 'BreathingExercises'
  | 'CaregiverTraining'
  | 'MultidisciplinaryHospiceCarePlan';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface PhysiotherapyADLRow {
  id?: string;
  activity: PhysiotherapyADLActivity;
  level?: PhysiotherapyADLLevel | null;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface PhysiotherapyAssessment {
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

  assessmentType: PhysiotherapyAssessmentType;

  // Medical overview
  comorbidities: PhysiotherapyComorbidity[];
  comorbidityOther?: string | null;
  generalCondition?: PhysiotherapyGeneralCondition | null;

  // Pain & symptom
  painLevel?: number | null;
  painTypes: PhysiotherapyPainType[];
  painTypeOther?: string | null;
  symptoms: PhysiotherapySymptom[];

  // Mobility
  mobilityStatus?: PhysiotherapyMobilityStatus | null;
  transferAbility?: PhysiotherapyTransferAbility | null;
  walkingAbility?: PhysiotherapyWalkingAbility | null;
  assistiveDevices: PhysiotherapyAssistiveDevice[];
  assistiveDeviceOther?: string | null;

  // Musculoskeletal
  upperLimbStrength?: number | null;
  lowerLimbStrength?: number | null;
  rangeOfMotion?: PhysiotherapyRangeOfMotion | null;
  jointPainOrStiffness?: PhysiotherapyJointFinding | null;
  jointPainLocation?: string | null;

  // Neurological
  consciousness?: PhysiotherapyConsciousness | null;
  coordination?: PhysiotherapyCoordination | null;
  sensoryDeficit?: PhysiotherapySensoryDeficit | null;
  balance?: PhysiotherapyBalance | null;

  // Respiratory
  breathingPattern?: PhysiotherapyBreathingPattern | null;
  breathlessnessLevel?: PhysiotherapyBreathlessnessLevel | null;
  chestExpansion?: PhysiotherapyChestExpansion | null;
  respiratoryNeeds: PhysiotherapyRespiratoryNeed[];

  // Pressure injury
  pressureRisk?: PhysiotherapyPressureRisk | null;
  pressureAreas: PhysiotherapyPressureArea[];
  pressureAreaOther?: string | null;
  pressurePreventions: PhysiotherapyPressurePrevention[];

  // Fall risk
  fallHistory?: boolean | null;
  fallRiskLevel?: PhysiotherapyFallRiskLevel | null;
  fallContributors: PhysiotherapyFallContributor[];

  // Diagnosis
  diagnosis: PhysiotherapyDiagnosis[];

  // Care plan
  goals?: string | null;
  interventions: PhysiotherapyIntervention[];
  frequency: PhysiotherapyFrequency[];
  equipment: PhysiotherapyEquipment[];
  caregiverTrainings: PhysiotherapyCaregiverTraining[];

  // Summary
  outcome: PhysiotherapyOutcome[];
  finalRecommendations: PhysiotherapyFinalRecommendation[];

  // Children
  adl: PhysiotherapyADLRow[];

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

export interface PhysiotherapyAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: PhysiotherapyAssessmentType;
  generalCondition?: PhysiotherapyGeneralCondition | null;
  mobilityStatus?: PhysiotherapyMobilityStatus | null;
  fallRiskLevel?: PhysiotherapyFallRiskLevel | null;
  diagnosis?: PhysiotherapyDiagnosis[];
  outcome?: PhysiotherapyOutcome[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreatePhysiotherapyAssessmentRequest {
  assessmentType: PhysiotherapyAssessmentType;

  comorbidities?: PhysiotherapyComorbidity[];
  comorbidityOther?: string;
  generalCondition?: PhysiotherapyGeneralCondition;

  painLevel?: number;
  painTypes?: PhysiotherapyPainType[];
  painTypeOther?: string;
  symptoms?: PhysiotherapySymptom[];

  mobilityStatus?: PhysiotherapyMobilityStatus;
  transferAbility?: PhysiotherapyTransferAbility;
  walkingAbility?: PhysiotherapyWalkingAbility;
  assistiveDevices?: PhysiotherapyAssistiveDevice[];
  assistiveDeviceOther?: string;

  upperLimbStrength?: number;
  lowerLimbStrength?: number;
  rangeOfMotion?: PhysiotherapyRangeOfMotion;
  jointPainOrStiffness?: PhysiotherapyJointFinding;
  jointPainLocation?: string;

  consciousness?: PhysiotherapyConsciousness;
  coordination?: PhysiotherapyCoordination;
  sensoryDeficit?: PhysiotherapySensoryDeficit;
  balance?: PhysiotherapyBalance;

  breathingPattern?: PhysiotherapyBreathingPattern;
  breathlessnessLevel?: PhysiotherapyBreathlessnessLevel;
  chestExpansion?: PhysiotherapyChestExpansion;
  respiratoryNeeds?: PhysiotherapyRespiratoryNeed[];

  pressureRisk?: PhysiotherapyPressureRisk;
  pressureAreas?: PhysiotherapyPressureArea[];
  pressureAreaOther?: string;
  pressurePreventions?: PhysiotherapyPressurePrevention[];

  fallHistory?: boolean;
  fallRiskLevel?: PhysiotherapyFallRiskLevel;
  fallContributors?: PhysiotherapyFallContributor[];

  diagnosis?: PhysiotherapyDiagnosis[];

  goals?: string;
  interventions?: PhysiotherapyIntervention[];
  frequency?: PhysiotherapyFrequency[];
  equipment?: PhysiotherapyEquipment[];
  caregiverTrainings?: PhysiotherapyCaregiverTraining[];

  outcome?: PhysiotherapyOutcome[];
  finalRecommendations?: PhysiotherapyFinalRecommendation[];

  adl?: Omit<PhysiotherapyADLRow, 'id'>[];
}

export type UpdatePhysiotherapyAssessmentRequest =
  Partial<CreatePhysiotherapyAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface PhysiotherapyAssessmentListResponse {
  items: PhysiotherapyAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}