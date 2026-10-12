import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Lab technician queue — flat list of lab requests across all
// patients. Two endpoints:
//   • /labs/pending-requests    → status: 'Ordered'
//   • /labs/completed-requests  → status: 'Completed'
// ─────────────────────────────────────────────────────────────

export interface PendingLabRequest {
  id: number;
  patientId: number;
  patientName: string;
  patientDisplayId?: string | null;

  testName: string;
  category: string;
  specimenType?: string | null;
  specimenSite?: string | null;
  clinicalHistory?: string | null;

  requestingClinician: string;
  requestedById: number;

  priority: 'Routine' | 'Urgent' | 'Emergency';
  dateRequested: string;
  /** Only present on completed rows. */
  dateCompleted?: string | null;
  status: 'Ordered' | 'Completed' | 'Cancelled';
}

export interface LabQueueListResponse {
  items: PendingLabRequest[];
  page: number;
  limit: number;
  total: number;
}

export interface LabRequestDetail extends PendingLabRequest {
  age?: number;
  sex?: string;
  result?: string | null;
  datePerformed?: string | null;
  performedBy?: string | null;
}

export interface EnterLabResultRequest {
  result: string;
  datePerformed?: string;
  performedBy?: string;
}

export interface EnterLabResultResponse {
  id: number;
  status: 'Completed';
  result: string;
  datePerformed: string;
}

export const labQueueApi = {
  /** Pending lab requests (status: 'Ordered'). */
  list: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<LabQueueListResponse>('/labs/pending-requests', { params })
      .then((r) => r.data),

  /** Completed lab requests (status: 'Completed'). */
  listCompleted: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<LabQueueListResponse>('/labs/completed-requests', { params })
      .then((r) => r.data),

  getById: (id: number | string) =>
    apiClient
      .get<LabRequestDetail>(`/labs/queue/${id}`)
      .then((r) => r.data),

  enterResult: (id: number | string, data: EnterLabResultRequest) =>
    apiClient
      .patch<EnterLabResultResponse>(`/labs/queue/${id}/result`, data)
      .then((r) => r.data),
};

export default labQueueApi;