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
// Main document — GET /hospice/patients/:id/hospice-nursing/:assessmentId
// ─────────────────────────────────────────────────────────────
export interface HospiceNursingAssessment {
  id: number;
  patientId: number;
  hospitalAdmissionId?: number | null;

  assessmentDate: string;

  // ── Assessor ──
  assessedByStaffId?: number | null;
  assessedBy?: { id: number; name: string; role?: string } | null;

  // ── General observation ──
  levelOfConsciousness?: HospiceConsciousness | null;
  orientation: string[];
  generalAppearance: string[];

  // ── Vitals ──
  bloodPressure?: string | null;
  pulseRate?: number | null;
  respiratoryRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;

  // ── Pain ──
  painPresent?: boolean | null;
  painScore?: number | null;
  painLocation: string[];
  painLocationOther?: string | null;
  painCharacteristics: string[];
  painReliefMeasures: string[];
  painReliefOther?: string | null;

  // ── Respiratory ──
  breathingPattern?: HospiceBreathingPattern | null;
  dyspneaSeverity?: HospiceDyspneaSeverity | null;
  oxygenTherapy?: boolean | null;
  oxygenFlowRate?: string | null;
  cough?: HospiceCoughType | null;
  sputumColor?: HospiceSputumColor | null;
  respiratoryNotes?: string | null;

  // ── Cardiovascular ──
  pulseRhythm?: HospicePulseRhythm | null;
  peripheralEdema?: HospiceEdemaSeverity | null;
  edemaLocation?: string | null;
  skinColor?: HospiceSkinColor | null;

  // ── GI ──
  appetite?: HospiceAppetite | null;
  nausea?: HospiceNauseaSeverity | null;
  vomiting?: boolean | null;
  vomitingFrequency?: string | null;
  bowelFunction?: HospiceBowelFunction | null;
  lastBowelMovement?: string | null;

  // ── GU ──
  urinaryFunction?: HospiceUrinaryFunction | null;
  urineAppearance?: HospiceUrineAppearance | null;

  // ── Skin ──
  skinIntegrity?: HospiceSkinIntegrity | null;
  pressureInjuryRisk?: HospicePressureInjuryRisk | null;
  pressureUlcerPresent?: boolean | null;
  pressureUlcerLocation?: string | null;
  pressureUlcerStage?: HospicePressureUlcerStage | null;

  // ── Mobility ──
  mobilityStatus?: HospiceMobilityStatus | null;
  fallRisk?: HospiceFallRisk | null;
  assistiveDevices: HospiceAssistiveDevice[];
  assistiveDevicesOther?: string | null;

  // ── ADL ──
  feeding?: HospiceADL | null;
  bathing?: HospiceADL | null;
  dressing?: HospiceADL | null;
  toileting?: HospiceADL | null;
  mobility?: HospiceADL | null;

  // ── Psychological ──
  emotionalStatus?: HospiceEmotionalStatus | null;
  communicationAbility?: HospiceCommunicationAbility | null;
  cognitiveStatus?: HospiceCognitiveStatus | null;

  // ── Family / caregiver ──
  primaryCaregiverName?: string | null;
  primaryCaregiverRelationship?: string | null;
  primaryCaregiverPhone?: string | null;
  familySupport?: HospiceFamilySupport | null;
  caregiverStressLevel?: HospiceCaregiverStress | null;

  // ── Spiritual ──
  spiritualSupportRequested?: boolean | null;
  religiousAffiliation?: HospiceReligiousAffiliation | null;
  religiousAffiliationOther?: string | null;
  culturalConsiderations?: string | null;

  // ── Nursing diagnoses ──
  nursingDiagnoses: HospiceNursingDiagnosis[];
  nursingDiagnosesOther?: string | null;

  // ── Summary ──
  nurseSummary?: string | null;

  // ── Audit ──
  createdBy?: number;
  createdByStaff?: { id: number; name: string } | null;
  updatedBy?: number | null;
  updatedByAdmin?: { id: number; name: string } | null;

  // ── Soft delete ──
  deletedAt?: string | null;
  deletedBy?: number | null;
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
  id: number;
  patientId: number;
  assessmentDate: string;
  assessedBy: { id: number; name: string; role?: string } | null;
  levelOfConsciousness?: HospiceConsciousness | null;
  painScore?: number | null;
  mobilityStatus?: HospiceMobilityStatus | null;
  emotionalStatus?: HospiceEmotionalStatus | null;
  nurseSummary?: string | null;
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
  id: number;
  patientId: number;
  patientName: string;
  assessmentDate: string;
  deletedAt: string;
  deletedBy: { id: number; name: string } | null;
  deletionReason?: string | null;
}

export interface DeletedHospiceNursingListResponse {
  items: DeletedHospiceNursingAssessment[];
  page: number;
  limit: number;
  total: number;
}