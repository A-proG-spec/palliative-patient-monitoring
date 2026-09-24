import apiClient from './client';
import type {
  PhysiotherapyAssessment,
  PhysiotherapyAssessmentListItem,
  CreatePhysiotherapyAssessmentRequest,
  UpdatePhysiotherapyAssessmentRequest,
  PhysiotherapyAssessmentListResponse,
} from '@/types/physiotherapy-assessment.types';

export const physiotherapyAssessmentApi = {
  create: (
    patientId: string,
    data: CreatePhysiotherapyAssessmentRequest,
  ): Promise<PhysiotherapyAssessment> => {
    return apiClient
      .post<PhysiotherapyAssessment>(
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<PhysiotherapyAssessmentListResponse> => {
    return apiClient
      .get<PhysiotherapyAssessmentListResponse>(
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment`,
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
  ): Promise<PhysiotherapyAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<PhysiotherapyAssessmentListResponse>(
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment/all`,
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
  ): Promise<PhysiotherapyAssessment> => {
    return apiClient
      .get<PhysiotherapyAssessment>(
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdatePhysiotherapyAssessmentRequest,
  ): Promise<PhysiotherapyAssessment> => {
    return apiClient
      .patch<PhysiotherapyAssessment>(
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment/${assessmentId}`,
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
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment/${assessmentId}`,
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
        `/physiotherapy/patients/${patientId}/physiotherapy-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<PhysiotherapyAssessmentListResponse> => {
    return apiClient
      .get<PhysiotherapyAssessmentListResponse>(
        '/physiotherapy/admin/physiotherapy-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default physiotherapyAssessmentApi;