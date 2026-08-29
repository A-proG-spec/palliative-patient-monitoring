// src/types/admission.types.ts

export type DiseaseStageAdmission = 'Early' | 'Advanced' | 'Terminal';
export type FunctionalStatus = 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
export type PainType = 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
export type AdmissionEmotionalStatus = 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
export type AdmissionFamilySupport = 'Strong' | 'Moderate' | 'Weak' | 'None';
export type SpiritualSupportPreferred = 'ReligiousLeader' | 'Counselor' | 'Other';
export type DischargeReason = 'Improved' | 'Deceased';
export type AdmissionStatus = 'Active' | 'Discharged';

export interface HospitalAdmission {
  id: string;
  patientId: string;
  referralId: string;
  admissionDate: string;
  dischargeDate?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: DiseaseStageAdmission;
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: FunctionalStatus;
  painScore: number;
  painType: PainType;
  symptomsPresent: string[];
  emotionalStatus: AdmissionEmotionalStatus;
  familySupport: AdmissionFamilySupport;
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: SpiritualSupportPreferred;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: DischargeReason;
  status: AdmissionStatus;
  createdBy: string | { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionRequest {
  referralId: string;
  admissionDate: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: DiseaseStageAdmission;
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: FunctionalStatus;
  painScore: number;
  painType: PainType;
  symptomsPresent?: string[];
  emotionalStatus: AdmissionEmotionalStatus;
  familySupport: AdmissionFamilySupport;
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: SpiritualSupportPreferred;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: DischargeReason;
  status: AdmissionStatus;
}

export interface AdmissionListResponse {
  items: HospitalAdmission[];
  page: number;
  limit: number;
  total: number;
}
