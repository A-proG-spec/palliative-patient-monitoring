import apiClient from './client';
import type {
  FamilyAssessment,
  FamilyAssessmentListItem,
  CreateFamilyAssessmentRequest,
  UpdateFamilyAssessmentRequest,
  FamilyAssessmentListResponse,
} from '@/types/family-assessment.types';

export const familyAssessmentApi = {
  create: (
    patientId: string,
    data: CreateFamilyAssessmentRequest,
  ): Promise<FamilyAssessment> => {
    return apiClient
      .post<FamilyAssessment>(
        `/family/patients/${patientId}/family-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<FamilyAssessmentListResponse> => {
    return apiClient
      .get<FamilyAssessmentListResponse>(
        `/family/patients/${patientId}/family-assessment`,
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
  ): Promise<FamilyAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<FamilyAssessmentListResponse>(
        `/family/patients/${patientId}/family-assessment/all`,
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
  ): Promise<FamilyAssessment> => {
    return apiClient
      .get<FamilyAssessment>(
        `/family/patients/${patientId}/family-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateFamilyAssessmentRequest,
  ): Promise<FamilyAssessment> => {
    return apiClient
      .patch<FamilyAssessment>(
        `/family/patients/${patientId}/family-assessment/${assessmentId}`,
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
        `/family/patients/${patientId}/family-assessment/${assessmentId}`,
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
        `/family/patients/${patientId}/family-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<FamilyAssessmentListResponse> => {
    return apiClient
      .get<FamilyAssessmentListResponse>(
        '/family/admin/family-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default familyAssessmentApi;