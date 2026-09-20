import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationQueueApi } from '@/api/medication-queue';
import { QUERY_KEYS } from '@/constants';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — list
// ─────────────────────────────────────────────────────────────

export function useMedicationQueue(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.MEDICATION_ORDERS,
    queryFn: () => medicationQueueApi.list({ limit: 100 }),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — single order detail
// ─────────────────────────────────────────────────────────────

export function useMedicationOrderDetail(
  id: number | string | undefined,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: [...QUERY_KEYS.MEDICATION_ORDERS, id],
    queryFn: () => medicationQueueApi.getById(id!),
    enabled: enabled && id !== undefined && id !== null,
  });
}

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — mark as given
// ─────────────────────────────────────────────────────────────

export function useMarkMedicationGiven() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number | string) => medicationQueueApi.markGiven(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICATION_ORDERS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.MEDICATION_ORDERS, id],
      });
      toast.success('Medication marked as given.');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update medication status.';
      toast.error(message);
    },
  });
}