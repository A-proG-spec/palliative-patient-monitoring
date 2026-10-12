import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — flat list of medication orders across all
// patients. Two endpoints:
//   • /medications/pending-orders   → status: 'Ordered'
//   • /medications/completed-orders → status: 'Given'
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
  /** Only present on completed rows. */
  dateCompleted?: string | null;
  status: 'Ordered' | 'Given';
}

export interface MedicationQueueListResponse {
  items: PendingMedicationOrder[];
  page: number;
  limit: number;
  total: number;
}

export const medicationQueueApi = {
  /** Pending medication orders (status: 'Ordered'). */
  list: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<MedicationQueueListResponse>('/medications/pending-orders', {
        params,
      })
      .then((r) => r.data),

  /** Completed medication orders (status: 'Given'). */
  listCompleted: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<MedicationQueueListResponse>('/medications/completed-orders', {
        params,
      })
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