import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockReferralApi } from './mocks/referrals.mock';
import type { Referral, CreateReferralRequest, ReferralListResponse } from '@/types/referral.types';

export const referralApi = {
  create: (patientId: string, data: CreateReferralRequest): Promise<Referral> => {
    if (USE_MOCK) return mockReferralApi.create(patientId, data as unknown as Record<string, unknown>);
    return apiClient.post<Referral>(`/patients/${patientId}/referrals`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ReferralListResponse> => {
    if (USE_MOCK) return mockReferralApi.getByPatient(patientId, params);
    return apiClient.get<ReferralListResponse>(`/patients/${patientId}/referrals`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, referralId: string): Promise<Referral> => {
    if (USE_MOCK) return mockReferralApi.getById(patientId, referralId);
    return apiClient.get<Referral>(`/patients/${patientId}/referrals/${referralId}`).then((r) => r.data);
  },
};
