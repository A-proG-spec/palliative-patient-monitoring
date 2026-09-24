import apiClient from './client';
import type {
  PainAssessment,
  PainAssessmentListItem,
  CreatePainAssessmentRequest,
  UpdatePainAssessmentRequest,
  PainAssessmentListResponse,
} from '@/types/pain-assessment.types';

export const painAssessmentApi = {
  create: (
    patientId: string,
    data: CreatePainAssessmentRequest,
  ): Promise<PainAssessment> => {
    return apiClient
      .post<PainAssessment>(
        `/pain/patients/${patientId}/pain-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<PainAssessmentListResponse> => {
    return apiClient
      .get<PainAssessmentListResponse>(
        `/pain/patients/${patientId}/pain-assessment`,
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
  ): Promise<PainAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<PainAssessmentListResponse>(
        `/pain/patients/${patientId}/pain-assessment/all`,
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
  ): Promise<PainAssessment> => {
    return apiClient
      .get<PainAssessment>(
        `/pain/patients/${patientId}/pain-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdatePainAssessmentRequest,
  ): Promise<PainAssessment> => {
    return apiClient
      .patch<PainAssessment>(
        `/pain/patients/${patientId}/pain-assessment/${assessmentId}`,
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
        `/pain/patients/${patientId}/pain-assessment/${assessmentId}`,
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
        `/pain/patients/${patientId}/pain-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<PainAssessmentListResponse> => {
    return apiClient
      .get<PainAssessmentListResponse>(
        '/pain/admin/pain-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default painAssessmentApi;