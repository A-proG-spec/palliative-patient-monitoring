// frontend/src/types/medication.types.ts

export interface MedicationActorRef {
  id: number | string;
  name: string;
  type?: 'staff' | 'admin';
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;

  /**
   * Who authored the order.
   *   • Object form { id, name, type } — preferred, emitted by the
   *     backend's toPrescribedBy() so admin-authored orders carry
   *     the admin's name.
   *   • String form — legacy field (raw staff FK as a string).
   *   • null — the raw `prescribedBy` column is empty because the
   *     actor was an admin with no `actingAsStaffId`; callers
   *     should fall back to `enteredBy`.
   */
  prescribedBy?: MedicationActorRef | string | null;

  /** Who physically entered the record (staff or admin). */
  enteredBy?: MedicationActorRef | null;

  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';

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