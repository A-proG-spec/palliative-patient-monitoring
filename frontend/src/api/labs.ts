import apiClient from './client';
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
  create: (
    patientId: string,
    data: CreateLabRequest,
  ): Promise<LaboratoryTest> => {
    return apiClient
      .post<LaboratoryTest>(`/patients/${patientId}/labs`, data)
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: {
      status?: LabStatus;
      category?: LabCategory;
      priority?: LabPriority;
      page?: number;
      limit?: number;
    },
  ): Promise<LabListResponse> => {
    return apiClient
      .get<LabListResponse>(`/patients/${patientId}/labs`, { params })
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    labId: string,
  ): Promise<LaboratoryTest> => {
    return apiClient
      .get<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`)
      .then((r) => r.data);
  },

  updateResult: (
    patientId: string,
    labId: string,
    data: UpdateLabRequest,
  ): Promise<LaboratoryTest> => {
    return apiClient
      .put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data)
      .then((r) => r.data);
  },

  /**
   * Cancel a pending lab test (status → Cancelled).
   */
  cancel: (
    patientId: string,
    labId: string,
    reason?: string,
  ): Promise<LaboratoryTest> => {
    return apiClient
      .put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}/cancel`, {
        reason,
      })
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (
    patientId: string,
    labId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/labs/${labId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  /**
   * Admin-only restore of a soft-deleted lab test.
   * Note: the backend uses PUT for the lab restore route.
   */
  restore: (
    patientId: string,
    labId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .put<{ id: string; restored: boolean }>(
        `/patients/${patientId}/labs/${labId}/restore`,
      )
      .then((r) => r.data);
  },
};