import apiClient from './client';
import type {
  Referral,
  CreateReferralRequest,
  ReferralListResponse,
} from '@/types/referral.types';

export const referralApi = {
  // ─────────────────────────────────────────────────────────────
  // Patient-scoped
  // ─────────────────────────────────────────────────────────────

  create: (
    patientId: string,
    data: CreateReferralRequest,
  ): Promise<Referral> => {
    return apiClient
      .post<Referral>(`/patients/${patientId}/referrals`, data)
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<ReferralListResponse> => {
    return apiClient
      .get<ReferralListResponse>(`/patients/${patientId}/referrals`, {
        params,
      })
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    referralId: string,
  ): Promise<Referral> => {
    return apiClient
      .get<Referral>(`/patients/${patientId}/referrals/${referralId}`)
      .then((r) => r.data);
  },

  // ─────────────────────────────────────────────────────────────
  // Admin-scoped (system-wide)
  //
  // NOTE: these live on `adminApi` in api/admin.ts so the admin
  // pages keep their existing imports. They're re-exported here
  // for convenience in case anything imports from this module.
  // ─────────────────────────────────────────────────────────────
};

export default referralApi;