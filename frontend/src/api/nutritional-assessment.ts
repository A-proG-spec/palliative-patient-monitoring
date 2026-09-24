import apiClient from './client';
import type {
  NutritionalAssessment,
  NutritionalAssessmentListItem,
  CreateNutritionalAssessmentRequest,
  UpdateNutritionalAssessmentRequest,
  NutritionalAssessmentListResponse,
} from '@/types/nutritional-assessment.types';

export const nutritionalAssessmentApi = {
  create: (
    patientId: string,
    data: CreateNutritionalAssessmentRequest,
  ): Promise<NutritionalAssessment> => {
    return apiClient
      .post<NutritionalAssessment>(
        `/nutrition/patients/${patientId}/nutritional-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<NutritionalAssessmentListResponse> => {
    return apiClient
      .get<NutritionalAssessmentListResponse>(
        `/nutrition/patients/${patientId}/nutritional-assessment`,
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
  ): Promise<NutritionalAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<NutritionalAssessmentListResponse>(
        `/nutrition/patients/${patientId}/nutritional-assessment/all`,
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
  ): Promise<NutritionalAssessment> => {
    return apiClient
      .get<NutritionalAssessment>(
        `/nutrition/patients/${patientId}/nutritional-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateNutritionalAssessmentRequest,
  ): Promise<NutritionalAssessment> => {
    return apiClient
      .patch<NutritionalAssessment>(
        `/nutrition/patients/${patientId}/nutritional-assessment/${assessmentId}`,
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
        `/nutrition/patients/${patientId}/nutritional-assessment/${assessmentId}`,
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
        `/nutrition/patients/${patientId}/nutritional-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<NutritionalAssessmentListResponse> => {
    return apiClient
      .get<NutritionalAssessmentListResponse>(
        '/nutrition/admin/nutritional-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default nutritionalAssessmentApi;