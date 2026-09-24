import apiClient from './client';
import type {
  SpiritualAssessment,
  SpiritualAssessmentListItem,
  CreateSpiritualAssessmentRequest,
  UpdateSpiritualAssessmentRequest,
  SpiritualAssessmentListResponse,
} from '@/types/spiritual-assessment.types';

export const spiritualAssessmentApi = {
  create: (
    patientId: string,
    data: CreateSpiritualAssessmentRequest,
  ): Promise<SpiritualAssessment> => {
    return apiClient
      .post<SpiritualAssessment>(
        `/spiritual/patients/${patientId}/spiritual-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<SpiritualAssessmentListResponse> => {
    return apiClient
      .get<SpiritualAssessmentListResponse>(
        `/spiritual/patients/${patientId}/spiritual-assessment`,
        { params },
      )
      .then((r) => r.data);
  },

  getAllForPatient: (
    patientId: string,
    params?: {
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<SpiritualAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<SpiritualAssessmentListResponse>(
        `/spiritual/patients/${patientId}/spiritual-assessment/all`,
        {
          params: {
            ...rest,
            ...(includeDeleted ? { includeDeleted: 'true' } : {}),
          },
        },
      )
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    assessmentId: string,
  ): Promise<SpiritualAssessment> => {
    return apiClient
      .get<SpiritualAssessment>(
        `/spiritual/patients/${patientId}/spiritual-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateSpiritualAssessmentRequest,
  ): Promise<SpiritualAssessment> => {
    return apiClient
      .patch<SpiritualAssessment>(
        `/spiritual/patients/${patientId}/spiritual-assessment/${assessmentId}`,
        data,
      )
      .then((r) => r.data);
  },

  delete: (
    patientId: string,
    assessmentId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: string; success: boolean; deletedAt: string }>(
        `/spiritual/patients/${patientId}/spiritual-assessment/${assessmentId}`,
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
        `/spiritual/patients/${patientId}/spiritual-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<SpiritualAssessmentListResponse> => {
    return apiClient
      .get<SpiritualAssessmentListResponse>(
        '/spiritual/admin/spiritual-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default spiritualAssessmentApi;