import apiClient from './client';
import type {
  SocialAssessment,
  SocialAssessmentListItem,
  CreateSocialAssessmentRequest,
  UpdateSocialAssessmentRequest,
  SocialAssessmentListResponse,
} from '@/types/social-assessment.types';

export const socialAssessmentApi = {
  create: (
    patientId: string,
    data: CreateSocialAssessmentRequest,
  ): Promise<SocialAssessment> => {
    return apiClient
      .post<SocialAssessment>(
        `/social/patients/${patientId}/social-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<SocialAssessmentListResponse> => {
    return apiClient
      .get<SocialAssessmentListResponse>(
        `/social/patients/${patientId}/social-assessment`,
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
  ): Promise<SocialAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<SocialAssessmentListResponse>(
        `/social/patients/${patientId}/social-assessment/all`,
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
  ): Promise<SocialAssessment> => {
    return apiClient
      .get<SocialAssessment>(
        `/social/patients/${patientId}/social-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateSocialAssessmentRequest,
  ): Promise<SocialAssessment> => {
    return apiClient
      .patch<SocialAssessment>(
        `/social/patients/${patientId}/social-assessment/${assessmentId}`,
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
        `/social/patients/${patientId}/social-assessment/${assessmentId}`,
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
        `/social/patients/${patientId}/social-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<SocialAssessmentListResponse> => {
    return apiClient
      .get<SocialAssessmentListResponse>(
        '/social/admin/social-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default socialAssessmentApi;