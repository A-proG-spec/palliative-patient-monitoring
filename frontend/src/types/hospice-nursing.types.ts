// ─────────────────────────────────────────────────────────────
// Enums — mirror backend hospice nursing enums
// ─────────────────────────────────────────────────────────────
export type HospiceConsciousness =
  | 'Alert'
  | 'Drowsy'
  | 'Confused'
  | 'Unresponsive'
  | 'Comatose';

export type HospiceBreathingPattern =
  | 'Normal'
  | 'Labored'
  | 'Shallow'
  | 'Rapid'
  | 'Slow';

export type HospiceDyspneaSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type HospiceCoughType = 'None' | 'Dry' | 'Productive';
export type HospiceSputumColor = 'None' | 'Clear' | 'Yellow' | 'Green' | 'Bloody';
export type HospicePulseRhythm = 'Regular' | 'Irregular';
export type HospiceEdemaSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type HospiceSkinColor = 'Normal' | 'Pale' | 'Cyanotic' | 'Jaundiced';
export type HospiceAppetite = 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
export type HospiceNauseaSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type HospiceBowelFunction =
  | 'Normal'
  | 'Constipation'
  | 'Diarrhea'
  | 'Incontinence';
export type HospiceUrinaryFunction =
  | 'Normal'
  | 'Frequency'
  | 'Retention'
  | 'Incontinence'
  | 'Catheterized';
export type HospiceUrineAppearance = 'Clear' | 'Cloudy' | 'Bloody' | 'Dark';
export type HospiceSkinIntegrity =
  | 'Intact'
  | 'Dry'
  | 'Fragile'
  | 'WoundPresent'
  | 'PressureUlcer';
export type HospicePressureInjuryRisk = 'Low' | 'Moderate' | 'High';
export type HospicePressureUlcerStage = 'I' | 'II' | 'III' | 'IV';
export type HospiceMobilityStatus =
  | 'Independent'
  | 'RequiresAssistance'
  | 'WheelchairDependent'
  | 'Bedridden';
export type HospiceFallRisk = 'Low' | 'Moderate' | 'High';
export type HospiceAssistiveDevice =
  | 'None'
  | 'Cane'
  | 'Walker'
  | 'Wheelchair'
  | 'Other';
export type HospiceADL = 'Independent' | 'NeedAssistance' | 'Dependent';
export type HospiceEmotionalStatus =
  | 'Stable'
  | 'Anxious'
  | 'Depressed'
  | 'Fearful'
  | 'Agitated'
  | 'Grieving';
export type HospiceCommunicationAbility = 'Normal' | 'Impaired' | 'NonVerbal';
export type HospiceCognitiveStatus =
  | 'Intact'
  | 'MildImpairment'
  | 'SevereImpairment';
export type HospiceFamilySupport = 'Strong' | 'Moderate' | 'Limited' | 'None';
export type HospiceCaregiverStress = 'Low' | 'Moderate' | 'High';
export type HospiceReligiousAffiliation =
  | 'Orthodox'
  | 'Muslim'
  | 'Protestant'
  | 'Catholic'
  | 'Other';
export type HospiceNursingDiagnosis =
  | 'AcutePain'
  | 'ChronicPain'
  | 'ImpairedMobility'
  | 'RiskForFalls'
  | 'ImpairedSkinIntegrity'
  | 'ImbalancedNutrition'
  | 'Anxiety'
  | 'CaregiverStrain'
  | 'IneffectiveBreathingPattern'
  | 'Other';

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────
export interface HospiceNursingAssessment {
  id: string;
  patientId: string;
  hospitalAdmissionId?: string | null;

  assessmentDate: string;
  assessedByStaffId?: string | null;
  assessedByStaff?: { id: string; name: string; role?: string } | null;

  // General observation
  levelOfConsciousness?: HospiceConsciousness;
  orientation: string[];
  generalAppearance: string[];

  // Vitals
  bloodPressure?: string;
  pulseRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;

  // Pain
  painPresent?: boolean;
  painScore?: number;
  painLocation: string[];
  painLocationOther?: string;
  painCharacteristics: string[];
  painReliefMeasures: string[];
  painReliefOther?: string;

  // Respiratory
  breathingPattern?: HospiceBreathingPattern;
  dyspneaSeverity?: HospiceDyspneaSeverity;
  oxygenTherapy?: boolean;
  oxygenFlowRate?: string;
  cough?: HospiceCoughType;
  sputumColor?: HospiceSputumColor;
  respiratoryNotes?: string;

  // Cardiovascular
  pulseRhythm?: HospicePulseRhythm;
  peripheralEdema?: HospiceEdemaSeverity;
  edemaLocation?: string;
  skinColor?: HospiceSkinColor;

  // GI
  appetite?: HospiceAppetite;
  nausea?: HospiceNauseaSeverity;
  vomiting?: boolean;
  vomitingFrequency?: string;
  bowelFunction?: HospiceBowelFunction;
  lastBowelMovement?: string | null;

  // GU
  urinaryFunction?: HospiceUrinaryFunction;
  urineAppearance?: HospiceUrineAppearance;

  // Skin
  skinIntegrity?: HospiceSkinIntegrity;
  pressureInjuryRisk?: HospicePressureInjuryRisk;
  pressureUlcerPresent?: boolean;
  pressureUlcerLocation?: string;
  pressureUlcerStage?: HospicePressureUlcerStage;

  // Mobility
  mobilityStatus?: HospiceMobilityStatus;
  fallRisk?: HospiceFallRisk;
  assistiveDevices: HospiceAssistiveDevice[];
  assistiveDevicesOther?: string;

  // ADL
  feeding?: HospiceADL;
  bathing?: HospiceADL;
  dressing?: HospiceADL;
  toileting?: HospiceADL;
  mobility?: HospiceADL;

  // Psychological
  emotionalStatus?: HospiceEmotionalStatus;
  communicationAbility?: HospiceCommunicationAbility;
  cognitiveStatus?: HospiceCognitiveStatus;

  // Family / caregiver
  primaryCaregiverName?: string;
  primaryCaregiverRelationship?: string;
  primaryCaregiverPhone?: string;
  familySupport?: HospiceFamilySupport;
  caregiverStressLevel?: HospiceCaregiverStress;

  // Spiritual / cultural
  spiritualSupportRequested?: boolean;
  religiousAffiliation?: HospiceReligiousAffiliation;
  religiousAffiliationOther?: string;
  culturalConsiderations?: string;

  // Nursing diagnoses + summary
  nursingDiagnoses: HospiceNursingDiagnosis[];
  nursingDiagnosesOther?: string;
  nurseSummary?: string;

  // Audit
  createdBy?: string;
  createdByStaff?: { id: string; name: string } | null;
  updatedBy?: string | null;
  updatedByAdmin?: { id: string; name: string } | null;

  // Soft delete
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────
export interface CreateHospiceNursingAssessmentRequest {
  hospitalAdmissionId?: string;
  assessmentDate?: string;
  assessedByStaffId?: string;

  levelOfConsciousness?: HospiceConsciousness;
  orientation?: string[];
  generalAppearance?: string[];

  bloodPressure?: string;
  pulseRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;

  painPresent?: boolean;
  painScore?: number;
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  painReliefMeasures?: string[];
  painReliefOther?: string;

  breathingPattern?: HospiceBreathingPattern;
  dyspneaSeverity?: HospiceDyspneaSeverity;
  oxygenTherapy?: boolean;
  oxygenFlowRate?: string;
  cough?: HospiceCoughType;
  sputumColor?: HospiceSputumColor;
  respiratoryNotes?: string;

  pulseRhythm?: HospicePulseRhythm;
  peripheralEdema?: HospiceEdemaSeverity;
  edemaLocation?: string;
  skinColor?: HospiceSkinColor;

  appetite?: HospiceAppetite;
  nausea?: HospiceNauseaSeverity;
  vomiting?: boolean;
  vomitingFrequency?: string;
  bowelFunction?: HospiceBowelFunction;
  lastBowelMovement?: string;

  urinaryFunction?: HospiceUrinaryFunction;
  urineAppearance?: HospiceUrineAppearance;

  skinIntegrity?: HospiceSkinIntegrity;
  pressureInjuryRisk?: HospicePressureInjuryRisk;
  pressureUlcerPresent?: boolean;
  pressureUlcerLocation?: string;
  pressureUlcerStage?: HospicePressureUlcerStage;

  mobilityStatus?: HospiceMobilityStatus;
  fallRisk?: HospiceFallRisk;
  assistiveDevices?: HospiceAssistiveDevice[];
  assistiveDevicesOther?: string;

  feeding?: HospiceADL;
  bathing?: HospiceADL;
  dressing?: HospiceADL;
  toileting?: HospiceADL;
  mobility?: HospiceADL;

  emotionalStatus?: HospiceEmotionalStatus;
  communicationAbility?: HospiceCommunicationAbility;
  cognitiveStatus?: HospiceCognitiveStatus;

  primaryCaregiverName?: string;
  primaryCaregiverRelationship?: string;
  primaryCaregiverPhone?: string;
  familySupport?: HospiceFamilySupport;
  caregiverStressLevel?: HospiceCaregiverStress;

  spiritualSupportRequested?: boolean;
  religiousAffiliation?: HospiceReligiousAffiliation;
  religiousAffiliationOther?: string;
  culturalConsiderations?: string;

  nursingDiagnoses?: HospiceNursingDiagnosis[];
  nursingDiagnosesOther?: string;
  nurseSummary?: string;
}

export type UpdateHospiceNursingAssessmentRequest =
  Partial<CreateHospiceNursingAssessmentRequest>;

// ─────────────────────────────────────────────────────────────
// List DTO — lighter shape returned by the list endpoint
// ─────────────────────────────────────────────────────────────
export interface HospiceNursingAssessmentListItem {
  id: string;
  patientId: string;
  assessmentDate: string;
  assessedBy: { id: string; name: string; role?: string } | null;
  levelOfConsciousness?: HospiceConsciousness;
  painScore?: number;
  mobilityStatus?: HospiceMobilityStatus;
  emotionalStatus?: HospiceEmotionalStatus;
  nurseSummary?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface HospiceNursingListResponse {
  items: HospiceNursingAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────
// Deleted list DTO — admin "list all deleted" endpoint
// ─────────────────────────────────────────────────────────────
export interface DeletedHospiceNursingAssessment {
  id: string;
  patientId: string;
  patientName: string;
  assessmentDate: string;
  deletedAt: string;
  deletedBy: { id: string; name: string } | null;
  deletionReason?: string | null;
}

export interface DeletedHospiceNursingListResponse {
  items: DeletedHospiceNursingAssessment[];
  page: number;
  limit: number;
  total: number;
}