import apiClient from './client';
import type {
  Medication,
  CreateMedicationRequest,
  UpdateMedicationRequest,
  MedicationListResponse,
  MedicationStatus,
  MedicationAdministeredAt,
} from '@/types/medication.types';

export const medicationApi = {
  create: (
    patientId: string,
    data: CreateMedicationRequest,
  ): Promise<Medication> => {
    return apiClient
      .post<Medication>(`/patients/${patientId}/medications`, data)
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: {
      status?: MedicationStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<MedicationListResponse> => {
    return apiClient
      .get<MedicationListResponse>(`/patients/${patientId}/medications`, {
        params,
      })
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    medicationId: string,
  ): Promise<Medication> => {
    return apiClient
      .get<Medication>(`/patients/${patientId}/medications/${medicationId}`)
      .then((r) => r.data);
  },

  updateStatus: (
    patientId: string,
    medicationId: string,
    data: UpdateMedicationRequest,
  ): Promise<Medication> => {
    return apiClient
      .put<Medication>(
        `/patients/${patientId}/medications/${medicationId}`,
        data,
      )
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
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/medications/${medicationId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  /**
   * Admin-only restore of a soft-deleted medication.
   * Note: the backend uses POST for medication restore.
   */
  restore: (
    patientId: string,
    medicationId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/medications/${medicationId}/restore`,
      )
      .then((r) => r.data);
  },
};