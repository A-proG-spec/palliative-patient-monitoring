// src/api/referrals.ts
// Endpoints: POST /patients/:patientId/referrals
//            GET  /patients/:patientId/referrals
//            GET  /patients/:patientId/referrals/:referralId

import api from './client';
import type {
  Referral,
  CreateReferralRequest,
  ReferralListResponse,
  ReferralStatus,
} from '@/types/referral.types';

export const referralApi = {
  /** POST /patients/:patientId/referrals */
  create: (
    patientId: string,
    data: CreateReferralRequest
  ): Promise<Referral> =>
    api
      .post<Referral>(`/patients/${patientId}/referrals`, data)
      .then((res) => res.data),

  /** GET /patients/:patientId/referrals */
  getByPatient: (
    patientId: string,
    params?: {
      status?: ReferralStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<ReferralListResponse> =>
    api
      .get<ReferralListResponse>(`/patients/${patientId}/referrals`, { params })
      .then((res) => res.data),

  /** GET /patients/:patientId/referrals/:referralId */
  getById: (patientId: string, referralId: string): Promise<Referral> =>
    api
      .get<Referral>(`/patients/${patientId}/referrals/${referralId}`)
      .then((res) => res.data),
};
