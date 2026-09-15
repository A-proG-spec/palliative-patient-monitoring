import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signatureApi } from '@/api/signatures';
import type { SignVisitRequest } from '@/types/signature.types';
import { useToast } from '@/context/ToastContext';

/**
 * Read signature status for a visit.
 * Query key is scoped to the patient so invalidation is easy.
 */
export function useVisitSignatures(patientId: string, visitId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', visitId, 'signatures'],
    queryFn: () => signatureApi.getVisitSignatures(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
}

/**
 * Sign a visit. On success, invalidates:
 *   - the signature status for this visit
 *   - the visit detail (so the visit's `signatures` field refreshes)
 */
export function useSignVisit(patientId: string, visitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SignVisitRequest) =>
      signatureApi.signVisit(patientId, visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'visits', visitId, 'signatures'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'visits', visitId],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'visits'],
      });
      toast.success('Signature added successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? 'Failed to sign visit.';
      toast.error(message);
    },
  });
}