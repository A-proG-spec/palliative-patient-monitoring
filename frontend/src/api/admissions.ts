import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAdmissionApi } from './mocks/admissions.mock';
import type {
  HospitalAdmission,
  CreateAdmissionRequest,
  AdmissionListResponse,
  UpdateAdmissionRequest,
} from '@/types/admission.types';

export const admissionApi = {
  create: (patientId: string, data: CreateAdmissionRequest): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<HospitalAdmission>(`/patients/${patientId}/admissions`, data).then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { status?: 'Active' | 'Discharged'; page?: number; limit?: number },
  ): Promise<AdmissionListResponse> => {
    if (USE_MOCK) return mockAdmissionApi.getByPatient(patientId, params);
    return apiClient
      .get<AdmissionListResponse>(`/patients/${patientId}/admissions`, { params })
      .then((r) => r.data);
  },

  getById: (patientId: string, admissionId: string): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.getById(patientId, admissionId);
    return apiClient
      .get<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`)
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    admissionId: string,
    data: UpdateAdmissionRequest,
  ): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.update(patientId, admissionId, data as unknown as Record<string, unknown>);
    return apiClient
      .put<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`, data)
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (patientId: string, admissionId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: admissionId, success: true });
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/admissions/${admissionId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  /**
   * Admin-only restore.
   */
  restore: (patientId: string, admissionId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: admissionId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/admissions/${admissionId}/restore`,
      )
      .then((r) => r.data);
  },
};