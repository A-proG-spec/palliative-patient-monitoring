import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockMedicationApi } from './mocks/medications.mock';
import type { Medication, CreateMedicationRequest, MedicationListResponse, UpdateMedicationRequest } from '@/types/medication.types';

export const medicationApi = {
  create: (patientId: string, data: CreateMedicationRequest): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<Medication>(`/patients/${patientId}/medications`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { status?: 'Ordered' | 'Given'; page?: number; limit?: number }): Promise<MedicationListResponse> => {
    if (USE_MOCK) return mockMedicationApi.getByPatient(patientId, params);
    return apiClient.get<MedicationListResponse>(`/patients/${patientId}/medications`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, medicationId: string): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.getById(patientId, medicationId);
    return apiClient.get<Medication>(`/patients/${patientId}/medications/${medicationId}`).then((r) => r.data);
  },

  updateStatus: (patientId: string, medicationId: string, data: UpdateMedicationRequest): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.updateStatus(patientId, medicationId, data);
    return apiClient.put<Medication>(`/patients/${patientId}/medications/${medicationId}`, data).then((r) => r.data);
  },
};
