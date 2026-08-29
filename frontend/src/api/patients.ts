// src/api/patients.ts
// Endpoints: POST /patients, GET /patients, GET /patients/:id, GET /patients/:id/summary

import api from './client';
import type {
  Patient,
  CreatePatientRequest,
  PatientListResponse,
  PatientSummaryResponse,
} from '@/types/patient.types';

export const patientApi = {
  /** POST /patients */
  register: (data: CreatePatientRequest): Promise<Patient> =>
    api.post<Patient>('/patients', data).then((res) => res.data),

  /** GET /patients */
  getList: (params?: {
    page?: number;
    limit?: number;
    status?: 'Active' | 'Discharged';
    search?: string;
  }): Promise<PatientListResponse> =>
    api
      .get<PatientListResponse>('/patients', { params })
      .then((res) => res.data),

  /** GET /patients/:patientId */
  getById: (patientId: string): Promise<Patient> =>
    api.get<Patient>(`/patients/${patientId}`).then((res) => res.data),

  /** GET /patients/:patientId/summary */
  getSummary: (patientId: string): Promise<PatientSummaryResponse> =>
    api
      .get<PatientSummaryResponse>(`/patients/${patientId}/summary`)
      .then((res) => res.data),
};
