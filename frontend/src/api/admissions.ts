// src/api/admissions.ts
// Endpoints: POST /patients/:patientId/admissions
//            GET  /patients/:patientId/admissions
//            GET  /patients/:patientId/admissions/:admissionId
//            PUT  /patients/:patientId/admissions/:admissionId

import api from './client';
import type {
  HospitalAdmission,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  AdmissionListResponse,
} from '@/types/admission.types';

export const admissionApi = {
  /** POST /patients/:patientId/admissions */
  create: (
    patientId: string,
    data: CreateAdmissionRequest
  ): Promise<HospitalAdmission> =>
    api
      .post<HospitalAdmission>(`/patients/${patientId}/admissions`, data)
      .then((res) => res.data),

  /** GET /patients/:patientId/admissions */
  getByPatient: (
    patientId: string,
    params?: {
      status?: 'Active' | 'Discharged';
      page?: number;
      limit?: number;
    }
  ): Promise<AdmissionListResponse> =>
    api
      .get<AdmissionListResponse>(`/patients/${patientId}/admissions`, {
        params,
      })
      .then((res) => res.data),

  /** GET /patients/:patientId/admissions/:admissionId */
  getById: (
    patientId: string,
    admissionId: string
  ): Promise<HospitalAdmission> =>
    api
      .get<HospitalAdmission>(
        `/patients/${patientId}/admissions/${admissionId}`
      )
      .then((res) => res.data),

  /** PUT /patients/:patientId/admissions/:admissionId */
  update: (
    patientId: string,
    admissionId: string,
    data: UpdateAdmissionRequest
  ): Promise<HospitalAdmission> =>
    api
      .put<HospitalAdmission>(
        `/patients/${patientId}/admissions/${admissionId}`,
        data
      )
      .then((res) => res.data),
};
