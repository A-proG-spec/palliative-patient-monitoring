// src/api/labs.ts
// Endpoints: POST /patients/:patientId/labs
//            GET  /patients/:patientId/labs
//            PUT  /patients/:patientId/labs/:labId

import api from './client';
import type {
  LaboratoryTest,
  CreateLabRequest,
  UpdateLabRequest,
  LabListResponse,
} from '@/types/lab.types';

export const labApi = {
  /** POST /patients/:patientId/labs */
  create: (patientId: string, data: CreateLabRequest): Promise<LaboratoryTest> =>
    api
      .post<LaboratoryTest>(`/patients/${patientId}/labs`, data)
      .then((res) => res.data),

  /** GET /patients/:patientId/labs */
  getByPatient: (
    patientId: string,
    params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }
  ): Promise<LabListResponse> =>
    api
      .get<LabListResponse>(`/patients/${patientId}/labs`, { params })
      .then((res) => res.data),

  /** PUT /patients/:patientId/labs/:labId */
  updateResult: (
    patientId: string,
    labId: string,
    data: UpdateLabRequest
  ): Promise<LaboratoryTest> =>
    api
      .put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data)
      .then((res) => res.data),
};
