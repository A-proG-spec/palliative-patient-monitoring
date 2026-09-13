import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockVisitApi } from './mocks/visits.mock';
import type { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<VisitListResponse> => {
    if (USE_MOCK) return mockVisitApi.getByPatient(patientId, params);
    return apiClient
      .get<VisitListResponse>(`/patients/${patientId}/visits`, { params })
      .then((r) => r.data);
  },

  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.getById(patientId, visitId);
    return apiClient
      .get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`)
      .then((r) => r.data);
  },

  /**
   * Admin-only. Partial update of a visit — the backend whitelists
   * a small set of fields (see `updateVisitSchema`).
   */
  update: (patientId: string, visitId: string, data: Record<string, unknown>): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.getById(patientId, visitId);
    return apiClient
      .put<HomeVisit>(`/patients/${patientId}/visits/${visitId}`, data)
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (patientId: string, visitId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, success: true });
    return apiClient
      .delete<{ id: string; success: boolean }>(`/patients/${patientId}/visits/${visitId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  /**
   * Admin-only restore of a soft-deleted visit.
   */
  restore: (patientId: string, visitId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/visits/${visitId}/restore`,
      )
      .then((r) => r.data);
  },
};