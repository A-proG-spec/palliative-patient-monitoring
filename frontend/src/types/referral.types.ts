// src/types/referral.types.ts

export type ReferralStatus = 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
export type ReferralActionTaken =
  | 'ReferralAccepted'
  | 'AppointmentScheduled'
  | 'AdditionalInfoRequested'
  | 'ReferralDeclined'
  | 'PatientAdmitted'
  | 'PatientTransferred'
  | null;
export type FollowUpStatus = 'Completed' | 'Pending' | 'UnableToContact';
export type ReferralReason =
  | 'PainManagement'
  | 'SymptomControl'
  | 'EndOfLifeCare'
  | 'HomeHospiceCare'
  | 'InpatientAdmission'
  | 'PsychologicalSupport'
  | 'SpiritualCare'
  | 'CaregiverSupport'
  | 'BereavementServices'
  | 'EmergencyCare'
  | 'DiagnosticEvaluation'
  | 'Other';

export interface ReferralSymptoms {
  pain: number;
  dyspnea: number;
  fatigue: number;
  anxiety: number;
  depression: number;
}

export interface Referral {
  id: string;
  patientId: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: ReferralSymptoms;
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  status: ReferralStatus;
  actionTaken?: ReferralActionTaken;
  outcome?: string | null;
  followUpDate?: string | null;
  followUpStatus?: FollowUpStatus | null;
  requestedBy: string | { id: string; name: string };
  approvedBy?: string | null;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralRequest {
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: ReferralSymptoms;
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
}

export interface ReferralListResponse {
  items: Referral[];
  page: number;
  limit: number;
  total: number;
}
