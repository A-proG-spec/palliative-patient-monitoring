import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi } from '@/api/referrals';
import type { CreateReferralRequest } from '@/types/referral.types';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export function usePatientReferrals(
  patientId: string,
  params?: { status?: string; page?: number; limit?: number },
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

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export function useRequestReferral(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      queryClient.invalidateQueries({
        queryKey: ['admin', 'referrals', 'pending'],
      });
      toast.success('Referral submitted. Awaiting admin approval.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to submit referral. Please try again.';
      toast.error(message);
    },
  });
}