// ─────────────────────────────────────────────────────────────
// Enum-like unions — mirror the backend model
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

export type DiseaseStage = 'Early' | 'Advanced' | 'EndStage';

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
// Staff / patient-scoped referral (GET /patients/:id/referrals/:id)
// ─────────────────────────────────────────────────────────────

export interface Referral {
  id: string;
  patientId: string;

  referralType: ReferralType;
  referralDate: string;

  primaryDiagnosis: string;
  diseaseStage: DiseaseStage;
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
// Admin pending DTO — shape returned by
// GET /admin/referrals/pending
//
// The backend populates `patientId` from the Referral collection
// so the response contains a `patientName` and `patientDisplayId`
// on each row. Do NOT try to render `patientId` as a string here.
// ─────────────────────────────────────────────────────────────

export interface AdminPendingReferral {
  id: string;
  patientId: string;
  patientName: string;
  patientDisplayId?: string;

  referralType: ReferralType;
  referralDate: string;

  primaryDiagnosis: string;
  diseaseStage: DiseaseStage;
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
// Request payloads
// ─────────────────────────────────────────────────────────────

export interface CreateReferralRequest {
  referralType: ReferralType;
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: DiseaseStage;
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

// ─────────────────────────────────────────────────────────────
// List / pagination envelope
// ─────────────────────────────────────────────────────────────

export interface ReferralListResponse {
  items: Referral[];
  page: number;
  limit: number;
  total: number;
}