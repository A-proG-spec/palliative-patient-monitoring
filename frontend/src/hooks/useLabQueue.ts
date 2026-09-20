import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labQueueApi, type EnterLabResultRequest } from '@/api/lab-queue';
import { QUERY_KEYS } from '@/constants';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Lab technician queue — list
// ─────────────────────────────────────────────────────────────

export function useLabQueue(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.LAB_REQUESTS,
    queryFn: () => labQueueApi.list({ limit: 100 }),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Lab technician queue — single request detail
// ─────────────────────────────────────────────────────────────

export function useLabRequestDetail(
  id: number | string | undefined,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: [...QUERY_KEYS.LAB_REQUESTS, id],
    queryFn: () => labQueueApi.getById(id!),
    enabled: enabled && id !== undefined && id !== null,
  });
}

// ─────────────────────────────────────────────────────────────
// Lab technician queue — enter result
// ─────────────────────────────────────────────────────────────

export function useEnterLabResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: EnterLabResultRequest;
    }) => labQueueApi.enterResult(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_REQUESTS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.LAB_REQUESTS, variables.id],
      });
      toast.success('Lab result entered successfully.');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save lab result.';
      toast.error(message);
    },
  });
}