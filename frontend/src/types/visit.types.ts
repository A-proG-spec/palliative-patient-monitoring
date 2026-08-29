// src/types/visit.types.ts

export type VisitType = 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
export type OverallStatus = 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
export type MobilityStatus = 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
export type ADLStatus = 'Independent' | 'NeedsAssistance' | 'FullyDependent';
export type AppetiteStatus = 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
export type OralIntakeStatus = 'Adequate' | 'Reduced' | 'Minimal';
export type HydrationStatus = 'Adequate' | 'MildDehydration' | 'SevereDehydration';
export type EmotionalStatus = 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
export type FamilySupportStatus = 'Excellent' | 'Good' | 'Limited' | 'None';
export type AdherenceLevel = 'Good' | 'Partial' | 'Poor';
export type CaregiverBurden = 'Low' | 'Moderate' | 'High';
export type CaregiverUnderstanding = 'Good' | 'Fair' | 'Poor';
export type CaregivingCapacity = 'Strong' | 'Moderate' | 'Weak';
export type FamilyEmotionalStatus = 'Stable' | 'Stressed' | 'Overwhelmed';
export type HomeCondition = 'Clean' | 'Fair' | 'Poor';
export type VisitOutcome = 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';

export interface Vitals {
  temperature: number;
  pulse: number;
  bp: string;
  respiration: number;
  spo2: number;
}

export interface ADL {
  feeding: ADLStatus;
  bathing: ADLStatus;
  dressing: ADLStatus;
  toileting: ADLStatus;
  mobility: ADLStatus;
}

export interface CurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
}

export interface TeamMember {
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  name: string;
  staffId?: string;
}

export interface HomeVisit {
  id: string;
  patientId: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: VisitType;
  teamMembers: TeamMember[];
  overallStatus: OverallStatus;
  mobility: MobilityStatus;
  vitals?: Vitals;
  painScore: number;
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
  adl: ADL;
  ppsScore: number;
  kpsScore: number;
  appetite: AppetiteStatus;
  oralIntake: OralIntakeStatus;
  hydrationStatus: HydrationStatus;
  emotionalStatus: EmotionalStatus;
  familySupport: FamilySupportStatus;
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: AdherenceLevel;
  currentMedications: CurrentMedication[];
  caregiverBurden: CaregiverBurden;
  caregiverUnderstanding: CaregiverUnderstanding;
  caregivingCapacity: CaregivingCapacity;
  familyEmotionalStatus: FamilyEmotionalStatus;
  educationProvided: string[];
  homeCondition: HomeCondition;
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
  teamMembers: TeamMember[];
  overallStatus: OverallStatus;
  mobility: MobilityStatus;
  vitals?: Vitals;
  painScore: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective: boolean;
  symptoms?: string[];
  adl: ADL;
  ppsScore: number;
  kpsScore: number;
  appetite: AppetiteStatus;
  oralIntake: OralIntakeStatus;
  hydrationStatus: HydrationStatus;
  emotionalStatus: EmotionalStatus;
  familySupport: FamilySupportStatus;
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: AdherenceLevel;
  currentMedications?: CurrentMedication[];
  caregiverBurden: CaregiverBurden;
  caregiverUnderstanding: CaregiverUnderstanding;
  caregivingCapacity: CaregivingCapacity;
  familyEmotionalStatus: FamilyEmotionalStatus;
  educationProvided?: string[];
  homeCondition: HomeCondition;
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
