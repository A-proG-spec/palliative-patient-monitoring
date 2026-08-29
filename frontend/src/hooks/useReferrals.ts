// src/hooks/useReferrals.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi } from '@/api/referrals';
import type { CreateReferralRequest, ReferralStatus } from '@/types/referral.types';

export function usePatientReferrals(
  patientId: string,
  params?: { status?: ReferralStatus; page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['patients', patientId, 'referrals', params],
    queryFn: () => referralApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useReferralDetail(patientId: string, referralId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'referrals', referralId],
    queryFn: () => referralApi.getById(patientId, referralId),
    enabled: !!patientId && !!referralId,
  });
}

export function useRequestReferral(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReferralRequest) =>
      referralApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'referrals'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}
