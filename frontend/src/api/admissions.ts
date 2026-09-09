import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAdmissionApi } from './mocks/admissions.mock';
import type { HospitalAdmission, CreateAdmissionRequest, AdmissionListResponse, UpdateAdmissionRequest } from '@/types/admission.types';

export const admissionApi = {
  create: (patientId: string, data: CreateAdmissionRequest): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<HospitalAdmission>(`/patients/${patientId}/admissions`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { status?: 'Active' | 'Discharged'; page?: number; limit?: number }): Promise<AdmissionListResponse> => {
    if (USE_MOCK) return mockAdmissionApi.getByPatient(patientId, params);
    return apiClient.get<AdmissionListResponse>(`/patients/${patientId}/admissions`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, admissionId: string): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.getById(patientId, admissionId);
    return apiClient.get<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`).then((r) => r.data);
  },

  update: (patientId: string, admissionId: string, data: UpdateAdmissionRequest): Promise<HospitalAdmission> => {
    if (USE_MOCK) return mockAdmissionApi.update(patientId, admissionId, data as unknown as Record<string, unknown>);
    return apiClient.put<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`, data).then((r) => r.data);
  },
};
