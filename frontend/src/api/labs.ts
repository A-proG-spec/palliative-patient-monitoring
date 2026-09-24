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

  /**
   * Active-only list.
   */
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

  /**
   * Active + deleted list. Hits `/patients/:id/labs/all`.
   * Pass `{ includeDeleted: true }` to filter to deleted-only.
   */
  getAllForPatient: (
    patientId: string,
    params?: {
      status?: LabStatus;
      category?: LabCategory;
      priority?: LabPriority;
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<LabListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<LabListResponse>(`/patients/${patientId}/labs/all`, {
        params: {
          ...rest,
          ...(includeDeleted ? { includeDeleted: 'true' } : {}),
        },
      })
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
   * Admin-only restore. Backend uses PUT for labs.
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