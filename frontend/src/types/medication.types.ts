export type MedicationStatus = 'Ordered' | 'Given';
export type MedicationAdministeredAt = 'Home' | 'Hospital';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;

  /**
   * Backend returns a populated object on list/detail endpoints
   * (`{ id, name }`), but the raw model field is a numeric ID.
   */
  prescribedBy?: { id: string; name: string } | string;

  administeredAt: MedicationAdministeredAt;
  status: MedicationStatus;

  visitId?: string;
  admissionId?: string;

  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: MedicationAdministeredAt;
}

export interface UpdateMedicationRequest {
  status: MedicationStatus;
}

export interface MedicationListResponse {
  items: Medication[];
  page: number;
  limit: number;
  total: number;
}