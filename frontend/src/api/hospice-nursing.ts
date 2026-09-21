import apiClient from './client';
import type {
  HospiceNursingAssessment,
  HospiceNursingListResponse,
  CreateHospiceNursingAssessmentRequest,
  UpdateHospiceNursingAssessmentRequest,
} from '@/types/hospice-nursing.types';

export const hospiceNursingApi = {
  create: (
    patientId: string,
    data: CreateHospiceNursingAssessmentRequest,
  ): Promise<HospiceNursingAssessment> => {
    return apiClient
      .post<HospiceNursingAssessment>(
        `/hospice/patients/${patientId}/hospice-nursing`,
        data,
      )
      .then((r) => r.data);
  },

  /**
   * Active-only list.
   */
  getByPatient: (
    patientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<HospiceNursingListResponse> => {
    return apiClient
      .get<HospiceNursingListResponse>(
        `/hospice/patients/${patientId}/hospice-nursing`,
        { params },
      )
      .then((r) => r.data);
  },

  /**
   * Active + deleted list. Hits `/hospice/patients/:id/all`.
   * Pass `{ includeDeleted: true }` to filter to deleted-only.
   *
   * NOTE: The hospice mount point differs from the other resources —
   * it's `/hospice/patients/:id/all`, NOT
   * `/patients/:id/hospice-nursing/all`.
   */
  getAllForPatient: (
    patientId: string,
    params?: {
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<HospiceNursingListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<HospiceNursingListResponse>(`/hospice/patients/${patientId}/all`, {
        params: {
          ...rest,
          ...(includeDeleted ? { includeDeleted: 'true' } : {}),
        },
      })
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    assessmentId: string,
  ): Promise<HospiceNursingAssessment> => {
    return apiClient
      .get<HospiceNursingAssessment>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateHospiceNursingAssessmentRequest,
  ): Promise<HospiceNursingAssessment> => {
    return apiClient
      .patch<HospiceNursingAssessment>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}`,
        data,
      )
      .then((r) => r.data);
  },

  delete: (
    patientId: string,
    assessmentId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restore: (
    patientId: string,
    assessmentId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },
};

export default hospiceNursingApi;