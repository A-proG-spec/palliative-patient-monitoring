export type VisitType = 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
export type OverallStatus = 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
export type MobilityStatus = 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
export type AdlLevel = 'Independent' | 'NeedsAssistance' | 'FullyDependent';
export type VisitOutcome = 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';

export interface HomeVisit {
  id: string;
  patientId: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: { role: string; name: string }[];
  overallStatus: OverallStatus;
  mobility: MobilityStatus;
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
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
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: { name: string; dosage: string; frequency: string; route: string }[];
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  outcome: VisitOutcome;
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
  createdAt: string;
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
  painScore: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective: boolean;
  symptoms?: string[];
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
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: { name: string; dosage: string; frequency: string; route: string }[];
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome: VisitOutcome;
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
}

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}
