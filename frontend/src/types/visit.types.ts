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
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: { role: string; name: string }[];
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
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;
  symptoms?: string[];
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
  morphineAvailable?: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: { name: string; dosage: string; frequency: string; route: string }[];
  medicationIssues?: string;
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  educationProvidedOther?: string;
  trainingNeeds?: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  homeEnvironmentDetails?: string;
  nursingCareGiven?: string[];
  nursingCareOther?: string;
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  keyIssues?: string;
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;
  outcome: VisitOutcome;
  dateOfDeath?: string;
  teamLeaderId: string;
}

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}