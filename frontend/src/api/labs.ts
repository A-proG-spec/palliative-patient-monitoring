import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockLabApi } from './mocks/labs.mock';
import type {
  LaboratoryTest,
  CreateLabRequest,
  UpdateLabRequest,
  LabListResponse,
  LabCategory,
  LabPriority,
  LabStatus,
} from '@/types/lab.types';

export const labApi = {
  create: (patientId: string, data: CreateLabRequest): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<LaboratoryTest>(`/patients/${patientId}/labs`, data).then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { status?: LabStatus; category?: LabCategory; priority?: LabPriority; page?: number; limit?: number },
  ): Promise<LabListResponse> => {
    if (USE_MOCK) return mockLabApi.getByPatient(patientId, params as any);
    return apiClient
      .get<LabListResponse>(`/patients/${patientId}/labs`, { params })
      .then((r) => r.data);
  },

  getById: (patientId: string, labId: string): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.getById(patientId, labId);
    return apiClient.get<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`).then((r) => r.data);
  },

  updateResult: (patientId: string, labId: string, data: UpdateLabRequest): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.updateResult(patientId, labId, data);
    return apiClient.put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data).then((r) => r.data);
  },

  /**
   * Cancel a pending lab test. Different from delete — a cancelled
   * test remains visible in the patient record.
   */
  cancel: (patientId: string, labId: string, reason?: string): Promise<LaboratoryTest> => {
    if (USE_MOCK) return mockLabApi.getById(patientId, labId);
    return apiClient
      .put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}/cancel`, { reason })
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (patientId: string, labId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: labId, success: true });
    return apiClient
      .delete<{ id: string; success: boolean }>(`/patients/${patientId}/labs/${labId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  /**
   * Admin-only restore.
   * Note: the backend uses PUT for the lab restore route (the only
   * resource that does — everything else uses POST).
   */
  restore: (patientId: string, labId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: labId, restored: true });
    return apiClient
      .put<{ id: string; restored: boolean }>(`/patients/${patientId}/labs/${labId}/restore`)
      .then((r) => r.data);
  },
};