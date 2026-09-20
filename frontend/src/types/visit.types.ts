// ─────────────────────────────────────────────────────────────
// Shared enums — mirror backend Visit enums
// ─────────────────────────────────────────────────────────────
export type VisitType =
  | 'Routine'
  | 'Emergency'
  | 'FirstAssessment'
  | 'PostDischarge'
  | 'EndOfLife'
  | 'Bereavement';

export type OverallStatus = 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
export type MobilityStatus = 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
export type AdlLevel = 'Independent' | 'NeedsAssistance' | 'FullyDependent';

export type VisitOutcome =
  | 'Stable'
  | 'SymptomsImproved'
  | 'SymptomsUnchanged'
  | 'SymptomsWorsened'
  | 'ReferredToFacility'
  | 'Deceased';

export type VisitTeamRole = 'TeamLeader' | 'Physician' | 'Nurse';

// ─────────────────────────────────────────────────────────────
// Signature
// ─────────────────────────────────────────────────────────────
export interface VisitSignature {
  staffId: string;
  name: string;
  role: VisitTeamRole;
  isTeamLeader?: boolean;
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Home Visit document — mirrors backend HomeVisit model
// ─────────────────────────────────────────────────────────────
export interface HomeVisit {
  id: string;
  patientId: string;

  // Section 2 — Visit details
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: Array<{ staffId?: string; role: string; name: string }>;

  // Section 3 — General condition
  overallStatus: OverallStatus;
  mobility: MobilityStatus;

  // Section 4 — Vitals
  vitals?: {
    temperature?: string | number;
    pulse?: string | number;
    bloodPressure?: string;
    bp?: string; // legacy alias
    respiration?: string | number;
    spO2?: string | number;
  };

  // Section 5 — Pain
  painPresent?: boolean;
  painScore: number;
  painLocation: string[];
  painLocationOther?: string;
  painCharacteristics: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;

  // Section 6 — Symptoms
  symptoms: string[];
  symptomsOther?: string;

  // Section 7 — ADL
  adl: {
    feeding: AdlLevel;
    bathing: AdlLevel;
    dressing: AdlLevel;
    toileting: AdlLevel;
    mobility: AdlLevel;
  };
  ppsScore: number;
  kpsScore: number;

  // Section 8 — Nutrition
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;

  // Section 9 — Psychosocial
  emotionalStatus:
    | 'Stable'
    | 'Anxious'
    | 'Depressed'
    | 'Fearful'
    | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;

  // Section 10 — Spiritual
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;

  // Section 11 — Medication review
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable?: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
  medicationIssues?: string;

  // Section 12 — Caregiver
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';

  // Section 13 — Education
  educationProvided: string[];
  educationProvidedOther?: string;
  trainingNeeds: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;

  // Section 14 — Home environment
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];
  homeEnvironmentDetails?: string;

  // Section 15 — Nursing care
  nursingCareGiven: string[];
  nursingCareOther?: string;

  // Section 16 — Red flags
  redFlags: string[];
  redFlagActions?: string;

  // Section 17 — Referrals made
  referralsMade: string[];

  // Section 18 — Key issues
  keyIssues?: string;

  // Section 19 — Action plan
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;

  // Section 20 — Outcome
  outcome: VisitOutcome;
  dateOfDeath?: string;

  // Section 21 — Signatures
  teamLeaderId: string;
  signatures: VisitSignature[];
  allSigned: boolean;

  // Meta
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  updatedBy?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────
export interface CreateVisitRequest {
  // Section 2
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: Array<{
    staffId?: string;
    role: VisitTeamRole;
    name: string;
    isTeamLeader?: boolean;
  }>;

  // Section 3
  overallStatus: OverallStatus;
  mobility: MobilityStatus;

  // Section 4
  vitals?: {
    temperature?: string;
    pulse?: string;
    bloodPressure?: string;
    respiration?: string;
    spO2?: string;
  };

  // Section 5
  painPresent?: boolean;
  painScore: number;
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;

  // Section 6
  symptoms?: string[];
  symptomsOther?: string;

  // Section 7
  adl: {
    feeding: AdlLevel;
    bathing: AdlLevel;
    dressing: AdlLevel;
    toileting: AdlLevel;
    mobility: AdlLevel;
  };
  ppsScore: number;
  kpsScore: number;

  // Section 8
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;

  // Section 9
  emotionalStatus:
    | 'Stable'
    | 'Anxious'
    | 'Depressed'
    | 'Fearful'
    | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;

  // Section 10
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;

  // Section 11
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable?: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
  medicationIssues?: string;

  // Section 12
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';

  // Section 13
  educationProvided?: string[];
  educationProvidedOther?: string;
  trainingNeeds?: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;

  // Section 14
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  homeEnvironmentDetails?: string;

  // Section 15
  nursingCareGiven?: string[];
  nursingCareOther?: string;

  // Section 16
  redFlags?: string[];
  redFlagActions?: string;

  // Section 17
  referralsMade?: string[];

  // Section 18–19
  keyIssues?: string;
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;

  // Section 20
  outcome: VisitOutcome;
  dateOfDeath?: string;

  // Section 21
  teamLeaderId?: string;
}

export interface UpdateVisitRequest {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  overallStatus?: OverallStatus;
  painScore?: number;
  ppsScore?: number;
  kpsScore?: number;
  outcome?: VisitOutcome;
}

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}