import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockLabApi } from './mocks/labs.mock';
import type { LaboratoryTest, CreateLabRequest, LabListResponse, UpdateLabRequest } from '@/types/lab.types';

export const labApi = {
  create: (patientId: string, data: CreateLabRequest): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<LaboratoryTest>(`/patients/${patientId}/labs`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }): Promise<LabListResponse> => {
    if (USE_MOCK) return mockLabApi.getByPatient(patientId, params);
    return apiClient.get<LabListResponse>(`/patients/${patientId}/labs`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, labId: string): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.getById(patientId, labId);
    return apiClient.get<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`).then((r) => r.data);
  },

  updateResult: (patientId: string, labId: string, data: UpdateLabRequest): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.updateResult(patientId, labId, data);
    return apiClient.put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data).then((r) => r.data);
  },
};
