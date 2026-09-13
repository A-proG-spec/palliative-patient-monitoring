import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockMedicationApi } from './mocks/medications.mock';
import type {
  Medication,
  CreateMedicationRequest,
  MedicationListResponse,
  UpdateMedicationRequest,
} from '@/types/medication.types';

export const medicationApi = {
  create: (patientId: string, data: CreateMedicationRequest): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<Medication>(`/patients/${patientId}/medications`, data).then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { status?: 'Ordered' | 'Given'; page?: number; limit?: number },
  ): Promise<MedicationListResponse> => {
    if (USE_MOCK) return mockMedicationApi.getByPatient(patientId, params);
    return apiClient
      .get<MedicationListResponse>(`/patients/${patientId}/medications`, { params })
      .then((r) => r.data);
  },

  getById: (patientId: string, medicationId: string): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.getById(patientId, medicationId);
    return apiClient
      .get<Medication>(`/patients/${patientId}/medications/${medicationId}`)
      .then((r) => r.data);
  },

  updateStatus: (
    patientId: string,
    medicationId: string,
    data: UpdateMedicationRequest,
  ): Promise<Medication> => {
    if (USE_MOCK) return mockMedicationApi.updateStatus(patientId, medicationId, data);
    return apiClient
      .put<Medication>(`/patients/${patientId}/medications/${medicationId}`, data)
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (
    patientId: string,
    medicationId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: medicationId, success: true });
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/medications/${medicationId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  /**
   * Admin-only restore.
   */
  restore: (
    patientId: string,
    medicationId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: medicationId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/medications/${medicationId}/restore`,
      )
      .then((r) => r.data);
  },
};