export type VisitType =
  | 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge'
  | 'EndOfLife' | 'Bereavement';

export type OverallStatus = 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
export type MobilityStatus = 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
export type AdlLevel = 'Independent' | 'NeedsAssistance' | 'FullyDependent';
export type VisitOutcome =
  | 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged'
  | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';

export interface VisitSignature {
  staffId: string;
  name: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: string;
}

export interface HomeVisit {
  id: string;
  patientId: string;

  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;

  teamMembers: Array<{ staffId?: string; role: string; name: string }>;

  overallStatus: OverallStatus;
  mobility: MobilityStatus;

  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;
    respiration?: number;
    spo2?: number;
  };

  painPresent?: boolean;
  painScore: number;
  painLocation: string[];
  painLocationOther?: string;
  painCharacteristics: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;

  symptoms: string[];
  symptomsOther?: string;

  adl: {
    feeding: AdlLevel;
    bathing: AdlLevel;
    dressing: AdlLevel;
    toileting: AdlLevel;
    mobility: AdlLevel;
  };
  ppsScore: number;
  kpsScore: number;

  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;

  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;

  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;

  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
  medicationIssues?: string;

  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';

  educationProvided: string[];
  educationProvidedOther?: string;
  trainingNeeds: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;

  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];
  homeEnvironmentDetails?: string;

  nursingCareGiven: string[];
  nursingCareOther?: string;

  redFlags: string[];
  redFlagActions?: string;

  referralsMade: string[];

  keyIssues?: string;

  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;

  outcome: VisitOutcome;
  dateOfDeath?: string;

  // ── Section 21: Signatures ──
  teamLeaderId: string;
  signatures: VisitSignature[];
  allSigned: boolean;

  // ── Meta ──
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateVisitRequest {
  // ─── Section 2: Visit details ────────────────────────────────
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: { role: string; name: string }[];

  // ─── Section 3: General condition ───────────────────────────
  overallStatus: OverallStatus;
  mobility: MobilityStatus;

  // ─── Section 4: Vital signs (confirmed backend fields) ──────
  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;
    respiration?: number;
    spo2?: number;
    // ── Pending backend contract — collected by form but not yet
    //    confirmed in the backend visit schema. The backend must
    //    add these fields before they are persisted. ──────────
    weight?: number;
    height?: number;
  };

  // ─── Section 5: Pain assessment ─────────────────────────────
  painPresent?: boolean;
  painScore: number;
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;

  // ─── Section 6: Symptoms ────────────────────────────────────
  symptoms?: string[];
  symptomsOther?: string;

  // ─── Section 7: Functional status ───────────────────────────
  adl: {
    feeding: AdlLevel;
    bathing: AdlLevel;
    dressing: AdlLevel;
    toileting: AdlLevel;
    mobility: AdlLevel;
  };
  ppsScore: number;
  kpsScore: number;

  // ─── Section 8: Nutrition & hydration ───────────────────────
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;

  // ─── Section 9: Psychosocial ────────────────────────────────
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;

  // ─── Section 10: Spiritual ──────────────────────────────────
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;

  // ─── Section 11: Medication review ──────────────────────────
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable?: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: { name: string; dosage: string; frequency: string; route: string }[];
  medicationIssues?: string;

  // ─── Section 12: Caregiver assessment ───────────────────────
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';

  // ─── Section 13: Education provided ─────────────────────────
  educationProvided?: string[];
  educationProvidedOther?: string;
  trainingNeeds?: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;

  // ─── Section 14: Home environment ───────────────────────────
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  homeEnvironmentDetails?: string;

  // ─── Section 15: Nursing care provided ──────────────────────
  nursingCareGiven?: string[];
  nursingCareOther?: string;

  // ─── Section 16: Red flags ───────────────────────────────────
  redFlags?: string[];
  redFlagActions?: string;

  // ─── Section 17: Referrals made ─────────────────────────────
  referralsMade?: string[];

  // ─── Section 18–19: Key issues / action plan ────────────────
  keyIssues?: string;
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;

  // ─── Section 20: Outcome ────────────────────────────────────
  outcome: VisitOutcome;
  dateOfDeath?: string;

  // ─── Section 21: Team leader ────────────────────────────────
  teamLeaderId: string;

  // ════════════════════════════════════════════════════════════
  // EXTENDED CLINICAL FIELDS — PENDING BACKEND CONTRACT
  //
  // These fields are collected by the visit form and validated
  // by the Zod schema (visit.schema.ts). They are NOT yet
  // confirmed in the backend visit model / createVisitSchema.
  //
  // The form already sends them as part of the payload so they
  // are defined here for internal type consistency. Once the
  // backend team confirms which fields will be persisted, the
  // corresponding backend schema and model should be updated,
  // and the comments below can be removed.
  // ════════════════════════════════════════════════════════════

  /** Section A: General observation — pending backend contract */
  generalObservation?: {
    levelOfConsciousness?: string;
    orientation?: string[];
    generalAppearance?: string[];
  };

  /** Section 5 extra: Pain relief measures — pending backend contract */
  painReliefMeasures?: string[];
  painReliefMeasuresOther?: string;

  /** Section 8 extra: GI assessment — pending backend contract */
  nausea?: string;
  vomiting?: boolean;
  vomitingFrequency?: string;
  bowelFunction?: string;
  lastBowelMovement?: string;

  /** Section 9 extra: Cognitive / communication — pending backend contract */
  communicationAbility?: string;
  cognitiveStatus?: string;

  /** Section 10 extra: Religious / cultural — pending backend contract */
  religiousAffiliation?: string;
  religiousAffiliationOther?: string;
  culturalConsiderations?: string;

  /** Section 12 extra: Caregiver contact — pending backend contract */
  caregiverRelationship?: string;
  caregiverPhone?: string;

  /** Section B1: Respiratory assessment — pending backend contract */
  respiratory?: {
    breathingPattern?: string;
    dyspnea?: string;
    oxygenTherapy?: boolean;
    oxygenFlowRate?: string;
    cough?: string;
    sputum?: string;
  };

  /** Section B2: Cardiovascular assessment — pending backend contract */
  cardiovascular?: {
    pulseRhythm?: string;
    peripheralEdema?: string;
    peripheralEdemaLocation?: string;
    skinColor?: string;
  };

  /** Section C1: Genitourinary assessment — pending backend contract */
  genitourinary?: {
    urinaryFunction?: string;
    urineAppearance?: string;
  };

  /** Section C2: Skin assessment — pending backend contract */
  skin?: {
    skinIntegrity?: string;
    pressureInjuryRisk?: string;
    pressureUlcerPresent?: boolean;
    pressureUlcerLocation?: string;
    pressureUlcerStage?: string;
  };

  /** Section C3: Mobility assessment — pending backend contract */
  mobilityAssessment?: {
    mobilityStatus?: string;
    fallRisk?: string;
    assistiveDevices?: string[];
    assistiveDevicesOther?: string;
  };

  /** Nursing diagnoses — pending backend contract */
  nursingDiagnoses?: string[];
  nursingDiagnosesOther?: string;

  /** Nursing care plan — pending backend contract */
  nursingCarePlan?: {
    problemsIdentified?: string;
    plannedInterventions?: string;
    expectedOutcomes?: string;
  };

  /** Nurse's overall summary — pending backend contract */
  nursesSummary?: string;
}

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}