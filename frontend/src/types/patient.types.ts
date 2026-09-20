// ─────────────────────────────────────────────────────────────
// Patient — mirrors backend Patient model
// ─────────────────────────────────────────────────────────────
export type PatientSex = 'Male' | 'Female';
export type PatientStatus = 'Active' | 'Discharged';
export type PatientCurrentLocation = 'Home' | 'ReferredHospital';
export type DiseaseStage = 'Early' | 'Advanced' | 'EndStage';
export type Prognosis = 'Days' | 'Weeks' | 'Months' | 'Uncertain';

export interface Patient {
  id: string;
  patientDisplayId?: string;
  hospitalPatientId?: string | null;

  firstName: string;
  lastName: string;
  age: number;
  sex: PatientSex;
  dateOfBirth: string;

  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  caregiverName: string;
  caregiverPhone: string;
  caregiverRelation?: string | null;

  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: DiseaseStage;
  comorbidities: string[];
  estimatedPrognosis: Prognosis;

  status: PatientStatus;
  currentLocation: PatientCurrentLocation;

  registeredBy: string;
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────
export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  age: number;
  sex: PatientSex;
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverRelation?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: DiseaseStage;
  comorbidities?: string[];
  estimatedPrognosis: Prognosis;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  age?: number;
  sex?: PatientSex;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverRelation?: string;
  hospitalPatientId?: string;
}

// ─────────────────────────────────────────────────────────────
// List / summary / progress
// ─────────────────────────────────────────────────────────────
export interface PatientListResponse {
  items: Patient[];
  page: number;
  limit: number;
  total: number;
}

export interface PatientSummaryResponse {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    status: string;
    currentLocation: string;
    patientDisplayId?: string;
  };
  diagnosis: {
    primary: string;
    secondary: string[];
    stage: string;
  };
  visits: Array<{
    id: string;
    date: string;
    outcome: string;
    staff: { id: string; name: string };
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    status: string;
    administeredAt: string;
  }>;
  labTests: Array<{
    id: string;
    name: string;
    dateOrdered: string;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: string;
    status: string;
  }>;
}

export interface ProgressDataPoint {
  visitId: string;
  visitDate: string;
  kpsScore: number;
  ppsScore: number;
}

export interface PatientProgressData {
  patientId: string;
  patientName: string;
  visits: ProgressDataPoint[];
  trends: {
    kps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
    pps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
  };
}