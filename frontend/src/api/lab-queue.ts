import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Lab technician queue — flat list of pending lab requests
// across all patients.
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
  list: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<LabQueueListResponse>('/labs/pending-requests', { params })
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