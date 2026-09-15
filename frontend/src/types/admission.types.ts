// ─────────────────────────────────────────────────────────────
// Enum-like unions — mirror the backend model
// ─────────────────────────────────────────────────────────────

export type AdmissionStatus = 'Active' | 'Discharged';
export type AdmissionDischargeReason = 'Improved' | 'Deceased';

export type AdmissionDiseaseStage = 'Early' | 'Advanced' | 'Terminal';

export type AdmissionPrognosis = 'Days' | 'Weeks' | 'Months' | 'Uncertain';

export type AdmissionFunctionalStatus =
  | 'FullyIndependent'
  | 'PartiallyDependent'
  | 'FullyDependent';

export type AdmissionPainType = 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';

export type AdmissionEmotionalStatus =
  | 'Stable'
  | 'Anxious'
  | 'Depressed'
  | 'Distressed';

export type AdmissionFamilySupport = 'Strong' | 'Moderate' | 'Weak' | 'None';

export type AdmissionReferredFrom =
  | 'InternalWard'
  | 'OutpatientDepartment'
  | 'ICU'
  | 'ExternalHospital'
  | 'Community'
  | 'Home'
  | 'Other';

export type AdmissionReferralReason =
  | 'PainManagement'
  | 'EndOfLifeCare'
  | 'SymptomControl'
  | 'HomeBasedCare'
  | 'PsychosocialSupport'
  | 'Other';

export type AdmissionSymptom =
  | 'Dyspnea'
  | 'Nausea'
  | 'Fatigue'
  | 'Anxiety'
  | 'Depression'
  | 'Insomnia'
  | 'Other';

export type AdmissionSpiritualSupport =
  | 'ReligiousLeader'
  | 'Counselor'
  | 'Other';

// ─────────────────────────────────────────────────────────────
// Main document (aggregate returned by
// GET /patients/:patientId/admissions/:admissionId)
// ─────────────────────────────────────────────────────────────

export interface HospitalAdmission {
  id: string;
  patientId: string;

  // ── Section 1: Patient snapshot ──
  patientName?: string;
  hospitalPatientId?: string;
  age?: number;
  sex?: 'Male' | 'Female';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // ── Section 2: Referral information ──
  referralId?: string | null;
  referredFrom?: AdmissionReferredFrom;
  referredFromOther?: string;
  referringClinician?: string;
  diagnosisAtReferral?: string;
  referralReason?: AdmissionReferralReason;
  referralReasonOther?: string;

  // ── Admission details ──
  admissionDate: string;
  dischargeDate?: string | null;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;

  // ── Section 3: Medical diagnosis ──
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: AdmissionDiseaseStage;
  comorbidities: string[];

  // ── Section 4: Eligibility ──
  estimatedPrognosis: AdmissionPrognosis;
  ppsScore: number;
  kpsScore?: number;
  functionalStatus: AdmissionFunctionalStatus;

  // ── Section 5: Pain & symptom ──
  painScore: number;
  painType: AdmissionPainType;
  symptomsPresent: AdmissionSymptom[];
  symptomsPresentOther?: string;

  // ── Section 6: Psychosocial ──
  emotionalStatus: AdmissionEmotionalStatus;
  familySupport: AdmissionFamilySupport;
  socialChallenges?: string;

  // ── Section 7: Spiritual ──
  spiritualConcerns: boolean;
  spiritualNeedsDescription?: string;
  spiritualSupportPreferred?: AdmissionSpiritualSupport;
  spiritualSupportPreferredOther?: string;

  // ── Section 8: Care plan ──
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;

  // ── Section 10: Decision ──
  admittedToHospiceUnit?: boolean;

  // ── Discharge ──
  status: AdmissionStatus;
  dischargeReason?: AdmissionDischargeReason;

  // ── Aggregates ──
  progressNoteCount?: number;
  dischargeSummaryId?: string | null;
  dischargeSummaryStatus?: 'Draft' | 'Final' | null;

  // ── Meta ──
  createdBy?: {
    id: string;
    name: string;
    role?: string;
  } | null;
  createdAt: string;
  updatedAt?: string | null;
}

// ─────────────────────────────────────────────────────────────
// List DTO — GET /patients/:patientId/admissions
// ─────────────────────────────────────────────────────────────

export interface AdmissionListItem {
  id: string;
  admissionDate: string;
  dischargeDate?: string | null;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  status: AdmissionStatus;
  dischargeReason?: AdmissionDischargeReason;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Request payloads
// ─────────────────────────────────────────────────────────────

export interface CreateAdmissionRequest {
  // Section 1 (snapshot)
  patientName?: string;
  hospitalPatientId?: string;
  age?: number;
  sex?: 'Male' | 'Female';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // Section 2
  referralId?: string;
  referredFrom?: AdmissionReferredFrom;
  referredFromOther?: string;
  referringClinician?: string;
  diagnosisAtReferral?: string;
  referralReason?: AdmissionReferralReason;
  referralReasonOther?: string;

  // Admission details
  admissionDate: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;

  // Section 3
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: AdmissionDiseaseStage;
  comorbidities?: string[];

  // Section 4
  estimatedPrognosis: AdmissionPrognosis;
  ppsScore: number;
  kpsScore?: number;
  functionalStatus: AdmissionFunctionalStatus;

  // Section 5
  painScore: number;
  painType: AdmissionPainType;
  symptomsPresent?: AdmissionSymptom[];
  symptomsPresentOther?: string;

  // Section 6
  emotionalStatus: AdmissionEmotionalStatus;
  familySupport: AdmissionFamilySupport;
  socialChallenges?: string;

  // Section 7
  spiritualConcerns: boolean;
  spiritualNeedsDescription?: string;
  spiritualSupportPreferred?: AdmissionSpiritualSupport;
  spiritualSupportPreferredOther?: string;

  // Section 8
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;

  // Section 10
  admittedToHospiceUnit?: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: AdmissionDischargeReason;
  status: AdmissionStatus;
}

// ─────────────────────────────────────────────────────────────
// List envelope
// ─────────────────────────────────────────────────────────────

export interface AdmissionListResponse {
  items: AdmissionListItem[];
  page: number;
  limit: number;
  total: number;
}