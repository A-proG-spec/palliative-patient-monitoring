import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockPatientApi } from './mocks/patients.mock';
import type { Patient, CreatePatientRequest, PatientListResponse, PatientSummaryResponse, PatientProgressData } from '@/types/patient.types';

export const patientApi = {
  register: (data: CreatePatientRequest): Promise<Patient> => {
    if (USE_MOCK) return mockPatientApi.register(data as unknown as Record<string, unknown>);
    return apiClient.post<Patient>('/patients', data).then((r) => r.data);
  },

  getList: (params?: { page?: number; limit?: number; status?: 'Active' | 'Discharged'; search?: string }): Promise<PatientListResponse> => {
    if (USE_MOCK) return mockPatientApi.getList(params);
    return apiClient.get<PatientListResponse>('/patients', { params }).then((r) => r.data);
  },

  getById: (patientId: string): Promise<Patient> => {
    if (USE_MOCK) return mockPatientApi.getById(patientId);
    return apiClient.get<Patient>(`/patients/${patientId}`).then((r) => r.data);
  },

  getSummary: (patientId: string): Promise<PatientSummaryResponse> => {
    if (USE_MOCK) return mockPatientApi.getSummary(patientId);
    return apiClient.get<PatientSummaryResponse>(`/patients/${patientId}/summary`).then((r) => r.data);
  },

  getProgress: (patientId: string): Promise<PatientProgressData> => {
    if (USE_MOCK) return mockPatientApi.getProgress(patientId);
    return apiClient.get<PatientProgressData>(`/patients/${patientId}/progress`).then((r) => r.data);
  },
};
