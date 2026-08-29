// src/api/visits.ts
// Endpoints: POST /patients/:patientId/visits
//            GET  /patients/:patientId/visits
//            GET  /patients/:patientId/visits/:visitId

import api from './client';
import type {
  HomeVisit,
  CreateVisitRequest,
  VisitListResponse,
} from '@/types/visit.types';

export const visitApi = {
  /** POST /patients/:patientId/visits */
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> =>
    api
      .post<HomeVisit>(`/patients/${patientId}/visits`, data)
      .then((res) => res.data),

  /** GET /patients/:patientId/visits */
  getByPatient: (
    patientId: string,
    params?: { page?: number; limit?: number }
  ): Promise<VisitListResponse> =>
    api
      .get<VisitListResponse>(`/patients/${patientId}/visits`, { params })
      .then((res) => res.data),

  /** GET /patients/:patientId/visits/:visitId */
  getById: (patientId: string, visitId: string): Promise<HomeVisit> =>
    api
      .get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`)
      .then((res) => res.data),
};
