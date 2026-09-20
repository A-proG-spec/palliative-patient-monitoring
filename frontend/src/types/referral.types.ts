// ─────────────────────────────────────────────────────────────
// Enums — mirror backend
// ─────────────────────────────────────────────────────────────
export type ReferralType = 'Incoming' | 'Outgoing';

export type ReferralStatus =
  | 'Pending'
  | 'Accepted'
  | 'Declined'
  | 'Admitted'
  | 'InfoRequested';

export type ReferralActionTaken =
  | 'ReferralAccepted'
  | 'AppointmentScheduled'
  | 'AdditionalInfoRequested'
  | 'ReferralDeclined'
  | 'PatientAdmitted'
  | 'PatientTransferred'
  | null;

export type ReferralDiseaseStage = 'Early' | 'Advanced' | 'EndStage';

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

// ─────────────────────────────────────────────────────────────
// Referral document
// ─────────────────────────────────────────────────────────────
export interface Referral {
  id: string;
  patientId: string;

  referralType: ReferralType;
  referralDate: string;

  primaryDiagnosis: string;
  diseaseStage: ReferralDiseaseStage;
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: ReferralSymptoms;

  reasons: ReferralReason[];
  otherReason?: string;

  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;

  status: ReferralStatus;
  actionTaken?: ReferralActionTaken;
  outcome?: string | null;

  followUpDate?: string | null;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact' | null;

  requestedBy?: {
    id: string;
    name: string;
    role?: string;
    email?: string;
  } | null;

  approvedBy?: {
    id: string;
    name: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Admin pending DTO — GET /admin/referrals/pending
// ─────────────────────────────────────────────────────────────
export interface AdminPendingReferral {
  id: number;
  patientId: number;
  patientName: string;
  patientDisplayId?: string;

  referralType: ReferralType;
  referralDate: string;

  primaryDiagnosis: string;
  diseaseStage: ReferralDiseaseStage;
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: ReferralSymptoms;

  reasons: ReferralReason[];
  otherReason?: string;

  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;

  status: 'Pending';
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────
export interface CreateReferralRequest {
  referralType: ReferralType;
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: ReferralDiseaseStage;
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: ReferralSymptoms;
  reasons: ReferralReason[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
}

export type UpdateReferralRequest = Partial<CreateReferralRequest>;

// ─────────────────────────────────────────────────────────────
// List envelope
// ─────────────────────────────────────────────────────────────
export interface ReferralListResponse {
  items: Referral[];
  page: number;
  limit: number;
  total: number;
}