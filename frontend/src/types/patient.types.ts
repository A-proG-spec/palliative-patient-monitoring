// src/types/patient.types.ts

export interface Patient {
  id: string;
  patientDisplayId?: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  registeredBy: string | { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
}

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
