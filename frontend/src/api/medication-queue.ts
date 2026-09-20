import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — flat list of pending medication orders
// across all patients.
// ─────────────────────────────────────────────────────────────

export interface PendingMedicationOrder {
  id: number;
  patientId: number;
  patientName: string;
  patientDisplayId?: string | null;
  currentLocation?: string;

  medicationName: string;
  dose: string;
  frequency: string;
  route: string;
  administeredAt: string;

  prescribingClinician: string;
  prescribedById: number;

  dateOrdered: string;
  status: 'Ordered' | 'Given';
}

export interface MedicationQueueListResponse {
  items: PendingMedicationOrder[];
  page: number;
  limit: number;
  total: number;
}

export const medicationQueueApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<MedicationQueueListResponse>('/medications/pending-orders', { params })
      .then((r) => r.data),

  getById: (id: number | string) =>
    apiClient
      .get<PendingMedicationOrder>(`/medications/queue/${id}`)
      .then((r) => r.data),

  markGiven: (id: number | string) =>
    apiClient
      .patch<{ id: number; status: 'Given'; updatedAt: string }>(
        `/medications/queue/${id}/status`,
        { status: 'Given' },
      )
      .then((r) => r.data),
};

export default medicationQueueApi;