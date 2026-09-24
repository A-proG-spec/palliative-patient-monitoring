import apiClient from './client';
import type {
  PsychiatryAssessment,
  PsychiatryAssessmentListItem,
  CreatePsychiatryAssessmentRequest,
  UpdatePsychiatryAssessmentRequest,
  PsychiatryAssessmentListResponse,
} from '@/types/psychiatry-assessment.types';

/**
 * ⚠️ SAFETY NOTE
 * ──────────────
 * Creating a psychiatry assessment with `suicideRiskLevel: 'High'`
 * triggers an automatic notification on the backend.
 *
 * Deleting one with `suicideRiskLevel: 'High'` REQUIRES a non-empty
 * `reason` — the backend will reject the request with a 400 otherwise.
 * The `delete()` method here accepts that reason; passing `undefined`
 * for a high-risk record will surface a clear error toast.
 */
export const psychiatryAssessmentApi = {
  create: (
    patientId: string,
    data: CreatePsychiatryAssessmentRequest,
  ): Promise<PsychiatryAssessment> => {
    return apiClient
      .post<PsychiatryAssessment>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { assessmentType?: string; page?: number; limit?: number },
  ): Promise<PsychiatryAssessmentListResponse> => {
    return apiClient
      .get<PsychiatryAssessmentListResponse>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment`,
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
  ): Promise<PsychiatryAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<PsychiatryAssessmentListResponse>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment/all`,
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
  ): Promise<PsychiatryAssessment> => {
    return apiClient
      .get<PsychiatryAssessment>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    assessmentId: string,
    data: UpdatePsychiatryAssessmentRequest,
  ): Promise<PsychiatryAssessment> => {
    return apiClient
      .patch<PsychiatryAssessment>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment/${assessmentId}`,
        data,
      )
      .then((r) => r.data);
  },

  /**
   * Soft delete.
   *
   * @param reason  REQUIRED when the assessment has `suicideRiskLevel: 'High'`.
   *                Optional (but recommended) for all other cases.
   */
  delete: (
    patientId: string,
    assessmentId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: string; success: boolean; deletedAt: string }>(
        `/psychiatry/patients/${patientId}/psychiatry-assessment/${assessmentId}`,
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
        `/psychiatry/patients/${patientId}/psychiatry-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<PsychiatryAssessmentListResponse> => {
    return apiClient
      .get<PsychiatryAssessmentListResponse>(
        '/psychiatry/admin/psychiatry-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default psychiatryAssessmentApi;