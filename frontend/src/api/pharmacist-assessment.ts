import apiClient from './client';
import type {
  ClinicalPharmacistAssessment,
  ClinicalPharmacistAssessmentListItem,
  CreateClinicalPharmacistAssessmentRequest,
  UpdateClinicalPharmacistAssessmentRequest,
  ClinicalPharmacistAssessmentListResponse,
} from '@/types/pharmacist-assessment.types';

export const pharmacistAssessmentApi = {
  // ─────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────
  create: (
    patientId: string,
    data: CreateClinicalPharmacistAssessmentRequest,
  ): Promise<ClinicalPharmacistAssessment> => {
    return apiClient
      .post<ClinicalPharmacistAssessment>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment`,
        data,
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // LIST — active only
  // ─────────────────────────────────────────────────────────────
  getByPatient: (
    patientId: string,
    params?: {
      assessmentType?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<ClinicalPharmacistAssessmentListResponse> => {
    return apiClient
      .get<ClinicalPharmacistAssessmentListResponse>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment`,
        { params },
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // LIST — active + deleted (admin)
  // ─────────────────────────────────────────────────────────────
  getAllForPatient: (
    patientId: string,
    params?: {
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<ClinicalPharmacistAssessmentListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<ClinicalPharmacistAssessmentListResponse>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment/all`,
        {
          params: {
            ...rest,
            ...(includeDeleted ? { includeDeleted: 'true' } : {}),
          },
        },
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // GET ONE
  // ─────────────────────────────────────────────────────────────
  getById: (
    patientId: string,
    assessmentId: string,
  ): Promise<ClinicalPharmacistAssessment> => {
    return apiClient
      .get<ClinicalPharmacistAssessment>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment/${assessmentId}`,
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // UPDATE — admin only
  // ─────────────────────────────────────────────────────────────
  update: (
    patientId: string,
    assessmentId: string,
    data: UpdateClinicalPharmacistAssessmentRequest,
  ): Promise<ClinicalPharmacistAssessment> => {
    return apiClient
      .patch<ClinicalPharmacistAssessment>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment/${assessmentId}`,
        data,
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // SOFT DELETE — admin only
  // ─────────────────────────────────────────────────────────────
  delete: (
    patientId: string,
    assessmentId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: string; success: boolean; deletedAt: string }>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment/${assessmentId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // RESTORE — admin only
  // ─────────────────────────────────────────────────────────────
  restore: (
    patientId: string,
    assessmentId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/pharmacist/patients/${patientId}/pharmacist-assessment/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // LIST ALL DELETED — admin only, global
  // ─────────────────────────────────────────────────────────────
  getDeleted: (params?: {
    page?: number;
    limit?: number;
  }): Promise<ClinicalPharmacistAssessmentListResponse> => {
    return apiClient
      .get<ClinicalPharmacistAssessmentListResponse>(
        '/pharmacist/admin/pharmacist-assessment/deleted',
        { params },
      )
      .then((r) => r.data);
  },
};

export default pharmacistAssessmentApi;