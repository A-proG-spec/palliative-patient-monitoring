import apiClient from './client';
import type {
  HospitalAdmission,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  AdmissionListResponse,
  AdmissionStatus,
} from '@/types/admission.types';

export const admissionApi = {
  // ─────────────────────────────────────────────────────────────
  // Create
  // Backend also flips Patient.currentLocation → 'ReferredHospital'
  // and Referral.status → 'Admitted' (when referralId is provided).
  // ─────────────────────────────────────────────────────────────
  create: (
    patientId: string,
    data: CreateAdmissionRequest,
  ): Promise<HospitalAdmission> => {
    return apiClient
      .post<HospitalAdmission>(`/patients/${patientId}/admissions`, data)
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // List
  // ─────────────────────────────────────────────────────────────
  getByPatient: (
    patientId: string,
    params?: {
      status?: AdmissionStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<AdmissionListResponse> => {
    return apiClient
      .get<AdmissionListResponse>(`/patients/${patientId}/admissions`, {
        params,
      })
      .then((r) => r.data);
  },
getById: (
    patientId: string,
    admissionId: string,
  ): Promise<HospitalAdmission> => {
    return apiClient
      .get<HospitalAdmission>(
        `/patients/${patientId}/admissions/${admissionId}`,
      )
      .then((r) => r.data);
  },

   update: (
    patientId: string,
    admissionId: string,
    data: UpdateAdmissionRequest,
  ): Promise<HospitalAdmission> => {
    return apiClient
      .put<HospitalAdmission>(
        `/patients/${patientId}/admissions/${admissionId}`,
        data,
      )
      .then((r) => r.data);
  },

  delete: (
    patientId: string,
    admissionId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/admissions/${admissionId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restore: (
    patientId: string,
    admissionId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/admissions/${admissionId}/restore`,
      )
      .then((r) => r.data);
  },
};