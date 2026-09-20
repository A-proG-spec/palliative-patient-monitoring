import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Radiologist queue — flat list of pending imaging orders
// across all patients.
// ─────────────────────────────────────────────────────────────

export interface PendingImagingOrder {
  id: number;
  patientId: number;
  patientName: string;
  patientDisplayId?: string | null;

  modality: string;
  bodyRegion: string;
  specificSite?: string | null;
  provisionalDiagnosis?: string | null;
  specialClinicalQuestion?: string | null;

  requestingClinician: string;
  orderedById: number;

  priority: 'Routine' | 'Urgent' | 'Emergency';
  dateOrdered: string;
  status: 'Ordered' | 'Completed' | 'Cancelled';
}

export interface ImagingQueueListResponse {
  items: PendingImagingOrder[];
  page: number;
  limit: number;
  total: number;
}

export interface ImagingOrderDetail extends PendingImagingOrder {
  age?: number;
  sex?: string;
  laterality?: string;
  presentingSymptoms?: string | null;
  findings?: string | null;
  impression?: string | null;
  recommendation?: string | null;
  reportDate?: string | null;
}

export interface SubmitImagingReportRequest {
  findings: string;
  impression: string;
  recommendation?: string;
}

export interface SubmitImagingReportResponse {
  id: number;
  status: 'Completed';
  findings: string;
  impression: string;
  recommendation?: string | null;
  reportDate: string;
}

export const imagingQueueApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<ImagingQueueListResponse>('/imaging/pending-orders', { params })
      .then((r) => r.data),

  getById: (id: number | string) =>
    apiClient
      .get<ImagingOrderDetail>(`/imaging/queue/${id}`)
      .then((r) => r.data),

  submitReport: (id: number | string, data: SubmitImagingReportRequest) =>
    apiClient
      .patch<SubmitImagingReportResponse>(`/imaging/queue/${id}/report`, data)
      .then((r) => r.data),
};

export default imagingQueueApi;