import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockVisitApi } from './mocks/visits.mock';
import type { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((r) => r.data);
  },

  /**
   * Active-only list.
   */
  getByPatient: (
    patientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<VisitListResponse> => {
    if (USE_MOCK) return mockVisitApi.getByPatient(patientId, params);
    return apiClient
      .get<VisitListResponse>(`/patients/${patientId}/visits`, { params })
      .then((r) => r.data);
  },

  /**
   * Active + deleted list. Hits `/patients/:id/visits/all`.
   */
  getAllForPatient: (
    patientId: string,
    params?: {
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<VisitListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<VisitListResponse>(`/patients/${patientId}/visits/all`, {
        params: {
          ...rest,
          ...(includeDeleted ? { includeDeleted: 'true' } : {}),
        },
      })
      .then((r) => r.data);
  },

  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.getById(patientId, visitId);
    return apiClient
      .get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`)
      .then((r) => r.data);
  },

  update: (patientId: string, visitId: string, data: Record<string, unknown>): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.getById(patientId, visitId);
    return apiClient
      .put<HomeVisit>(`/patients/${patientId}/visits/${visitId}`, data)
      .then((r) => r.data);
  },

  delete: (patientId: string, visitId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, success: true });
    return apiClient
      .delete<{ id: string; success: boolean }>(`/patients/${patientId}/visits/${visitId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  restore: (patientId: string, visitId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/visits/${visitId}/restore`,
      )
      .then((r) => r.data);
  },
};