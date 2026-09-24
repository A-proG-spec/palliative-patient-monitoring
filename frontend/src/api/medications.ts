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

  /**
   * Active-only list. Backend hits the standard endpoint which
   * auto-filters `deletedAt = null`.
   */
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

  /**
   * Active + deleted list. Hits the `/all` route which uses the
   * unextended Prisma client. Pass `{ includeDeleted: true }` to
   * filter down to deleted-only rows (the backend does this when
   * the query string contains `includeDeleted=true`).
   *
   * ⚠️ The backend `/all` route MUST be declared before the
   *   `/:medicationId` route, otherwise this hits the param route
   *   and returns 400.
   */
  getAllForPatient: (
    patientId: string,
    params?: {
      status?: MedicationStatus;
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<MedicationListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<MedicationListResponse>(`/patients/${patientId}/medications/all`, {
        params: {
          ...rest,
          // Backend checks `req.query.includeDeleted === 'true'` (string compare)
          ...(includeDeleted ? { includeDeleted: 'true' } : {}),
        },
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