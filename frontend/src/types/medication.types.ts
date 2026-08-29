// src/types/medication.types.ts

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string | { id: string; name: string };
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
}

export interface UpdateMedicationRequest {
  status: 'Ordered' | 'Given';
}

export interface MedicationListResponse {
  items: Medication[];
  page: number;
  limit: number;
  total: number;
}
