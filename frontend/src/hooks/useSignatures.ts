import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signatureApi } from '@/api/signatures';
import { SignVisitRequest } from '@/types/signature.types';
import { useToast } from '@/context/ToastContext';

export function useVisitSignatures(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'signatures'],
    queryFn: () => signatureApi.getVisitSignatures(visitId),
    enabled: !!visitId,
  });
}

export function useSignVisit(visitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SignVisitRequest) => signatureApi.signVisit(visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'signatures'] });
      toast.success('Signature added successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to sign visit.';
      toast.error('Signature failed', message);
    },
  });
}