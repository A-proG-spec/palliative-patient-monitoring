// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type PainAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'EmergencyPainReview';

export type PainOnset =
  | 'Acute'
  | 'Chronic'
  | 'Progressive';

export type PainLocation =
  | 'Head'
  | 'Chest'
  | 'Abdomen'
  | 'Back'
  | 'Pelvis'
  | 'Limbs'
  | 'MultipleSites'
  | 'Other';

export type PainDescription =
  | 'Sharp'
  | 'Dull'
  | 'Burning'
  | 'Throbbing'
  | 'Cramping'
  | 'Shooting'
  | 'PressureLike';

export type PainType =
  | 'NociceptiveSomatic'
  | 'Visceral'
  | 'Neuropathic'
  | 'Mixed'
  | 'BreakthroughPain';

export type PainPattern =
  | 'Continuous'
  | 'Intermittent'
  | 'BreakthroughEpisodes'
  | 'WorseAtNight'
  | 'MovementRelated';

export type PainAggravatingFactor =
  | 'Movement'
  | 'Coughing'
  | 'Eating'
  | 'Stress'
  | 'Positioning'
  | 'Unknown';

export type PainRelievingFactor =
  | 'Rest'
  | 'Medication'
  | 'PositionChange'
  | 'HeatColdTherapy'
  | 'Massage'
  | 'Other';

export type PainOpioidUse =
  | 'None'
  | 'WeakOpioid'
  | 'StrongOpioid';

export type PainAdjuvantDrug =
  | 'Antidepressants'
  | 'Anticonvulsants'
  | 'Steroids'
  | 'MuscleRelaxants';

export type PainBreakthroughFrequency =
  | 'None'
  | 'OneToTwoPerDay'
  | 'ThreeToFivePerDay'
  | 'Frequent';

export type PainRescueEffectiveness =
  | 'Good'
  | 'Partial'
  | 'Poor';

export type PainImpactArea =
  | 'Mobility'
  | 'Sleep'
  | 'Appetite'
  | 'Mood'
  | 'DailyActivities';

export type PainImpactSeverity =
  | 'NoImpact'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type PainAssociatedSymptom =
  | 'Nausea'
  | 'Vomiting'
  | 'Constipation'
  | 'Fatigue'
  | 'Anxiety'
  | 'Depression'
  | 'Dyspnea';

export type PainPatientBehavior =
  | 'Comfortable'
  | 'Grimacing'
  | 'GuardingArea'
  | 'Restless'
  | 'Crying';

export type PainManagementBarrier =
  | 'FearOfAddiction'
  | 'MedicationSideEffects'
  | 'PoorAdherence'
  | 'FinancialConstraints'
  | 'PoorAccessToOpioids'
  | 'CulturalBeliefs'
  | 'Other';

export type PainDiagnosis =
  | 'ControlledPain'
  | 'PartiallyControlledPain'
  | 'UncontrolledPain'
  | 'ComplexPainSyndrome'
  | 'BreakthroughPainSyndrome';

export type PainIntervention =
  | 'OptimizeOpioidTherapy'
  | 'AddAdjuvantAnalgesics'
  | 'AdjustDosingSchedule'
  | 'BreakthroughPainProtocol'
  | 'NonPharmacologicalTherapy'
  | 'PhysiotherapyReferral'
  | 'PsychologicalSupport';

export type PainNonPharmacologicalMethod =
  | 'Positioning'
  | 'RelaxationTechniques'
  | 'Massage'
  | 'HeatColdTherapy'
  | 'SpiritualSupport';

export type PainMonitoringPlan =
  | 'Daily'
  | 'EveryShift'
  | 'Weekly';

export type PainAssessmentOutcome =
  | 'PainWellControlled'
  | 'RequiresAdjustment'
  | 'RequiresUrgentIntervention'
  | 'ComplexPainManagementRequired'
  | 'MultidisciplinaryReviewNeeded';

export type PainFinalRecommendation =
  | 'ContinueCurrentRegimen'
  | 'IncreaseOpioidDose'
  | 'AddAdjuvantTherapy'
  | 'ManageBreakthroughPain'
  | 'IntegratePsychosocialSupport'
  | 'FullHospicePainProtocolActivation';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface PainAssessmentImpactRow {
  id?: string;
  area: PainImpactArea;
  severity?: PainImpactSeverity | null;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface PainAssessment {
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

  assessmentType: PainAssessmentType;

  // Pain history
  primaryPainComplaint?: string | null;
  painOnset?: PainOnset | null;
  painDuration?: string | null;
  painLocations: PainLocation[];
  painLocationOther?: string | null;
  painDescriptions: PainDescription[];

  // Severity
  currentPainScore?: number | null;
  worstPainLast24h?: number | null;
  leastPainLast24h?: number | null;

  // Type & pattern
  painType: PainType[];
  painPattern: PainPattern[];

  // Aggravating & relieving
  aggravatingFactors: PainAggravatingFactor[];
  relievingFactors: PainRelievingFactor[];
  relievingOther?: string | null;

  // Opioid use
  opioidUse?: PainOpioidUse | null;
  adjuvantDrugs: PainAdjuvantDrug[];

  // Breakthrough
  breakthroughFrequency?: PainBreakthroughFrequency | null;
  rescueMedicationUsed?: boolean | null;
  rescueEffectiveness?: PainRescueEffectiveness | null;

  // Associated
  associatedSymptoms: PainAssociatedSymptom[];
  patientBehaviors: PainPatientBehavior[];

  // Barriers
  managementBarriers: PainManagementBarrier[];
  managementBarrierOther?: string | null;

  // Diagnosis
  diagnosis: PainDiagnosis[];

  // Plan
  managementGoals?: string | null;
  interventions: PainIntervention[];
  nonPharmacologicalMethods: PainNonPharmacologicalMethod[];
  monitoringPlan: PainMonitoringPlan[];

  // Summary
  assessmentOutcome: PainAssessmentOutcome[];
  finalRecommendations: PainFinalRecommendation[];

  // Children
  impacts: PainAssessmentImpactRow[];

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

export interface PainAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: PainAssessmentType;
  currentPainScore?: number | null;
  worstPainLast24h?: number | null;
  painType?: PainType[];
  diagnosis?: PainDiagnosis[];
  assessmentOutcome?: PainAssessmentOutcome[];
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreatePainAssessmentRequest {
  assessmentType: PainAssessmentType;

  primaryPainComplaint?: string;
  painOnset?: PainOnset;
  painDuration?: string;
  painLocations?: PainLocation[];
  painLocationOther?: string;
  painDescriptions?: PainDescription[];

  currentPainScore?: number;
  worstPainLast24h?: number;
  leastPainLast24h?: number;

  painType?: PainType[];
  painPattern?: PainPattern[];

  aggravatingFactors?: PainAggravatingFactor[];
  relievingFactors?: PainRelievingFactor[];
  relievingOther?: string;

  opioidUse?: PainOpioidUse;
  adjuvantDrugs?: PainAdjuvantDrug[];

  breakthroughFrequency?: PainBreakthroughFrequency;
  rescueMedicationUsed?: boolean;
  rescueEffectiveness?: PainRescueEffectiveness;

  associatedSymptoms?: PainAssociatedSymptom[];
  patientBehaviors?: PainPatientBehavior[];

  managementBarriers?: PainManagementBarrier[];
  managementBarrierOther?: string;

  diagnosis?: PainDiagnosis[];

  managementGoals?: string;
  interventions?: PainIntervention[];
  nonPharmacologicalMethods?: PainNonPharmacologicalMethod[];
  monitoringPlan?: PainMonitoringPlan[];

  assessmentOutcome?: PainAssessmentOutcome[];
  finalRecommendations?: PainFinalRecommendation[];

  impacts?: Omit<PainAssessmentImpactRow, 'id'>[];
}

export type UpdatePainAssessmentRequest =
  Partial<CreatePainAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface PainAssessmentListResponse {
  items: PainAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}