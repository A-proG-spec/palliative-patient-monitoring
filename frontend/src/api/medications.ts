// src/api/medications.ts
// Endpoints: POST /patients/:patientId/medications
//            GET  /patients/:patientId/medications
//            PUT  /patients/:patientId/medications/:medicationId

import api from './client';
import type {
  Medication,
  CreateMedicationRequest,
  UpdateMedicationRequest,
  MedicationListResponse,
} from '@/types/medication.types';

export const medicationApi = {
  /** POST /patients/:patientId/medications */
  create: (
    patientId: string,
    data: CreateMedicationRequest
  ): Promise<Medication> =>
    api
      .post<Medication>(`/patients/${patientId}/medications`, data)
      .then((res) => res.data),

  /** GET /patients/:patientId/medications */
  getByPatient: (
    patientId: string,
    params?: { status?: 'Ordered' | 'Given'; page?: number; limit?: number }
  ): Promise<MedicationListResponse> =>
    api
      .get<MedicationListResponse>(`/patients/${patientId}/medications`, {
        params,
      })
      .then((res) => res.data),

  /** PUT /patients/:patientId/medications/:medicationId */
  updateStatus: (
    patientId: string,
    medicationId: string,
    data: UpdateMedicationRequest
  ): Promise<Medication> =>
    api
      .put<Medication>(
        `/patients/${patientId}/medications/${medicationId}`,
        data
      )
      .then((res) => res.data),
};
