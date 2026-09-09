import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockVisitApi } from './mocks/visits.mock';
import type { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { page?: number; limit?: number }): Promise<VisitListResponse> => {
    if (USE_MOCK) return mockVisitApi.getByPatient(patientId, params);
    return apiClient.get<VisitListResponse>(`/patients/${patientId}/visits`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    if (USE_MOCK) return mockVisitApi.getById(patientId, visitId);
    return apiClient.get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`).then((r) => r.data);
  },
};
