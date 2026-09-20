import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  imagingQueueApi,
  type SubmitImagingReportRequest,
} from '@/api/imaging-queue';
import { QUERY_KEYS } from '@/constants';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Radiologist queue — list
// ─────────────────────────────────────────────────────────────

export function useImagingQueue(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.IMAGING_ORDERS,
    queryFn: () => imagingQueueApi.list({ limit: 100 }),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Radiologist queue — single order detail
// ─────────────────────────────────────────────────────────────

export function useImagingOrderDetail(
  id: number | string | undefined,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: [...QUERY_KEYS.IMAGING_ORDERS, id],
    queryFn: () => imagingQueueApi.getById(id!),
    enabled: enabled && id !== undefined && id !== null,
  });
}

// ─────────────────────────────────────────────────────────────
// Radiologist queue — submit report
// ─────────────────────────────────────────────────────────────

export function useSubmitImagingReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: SubmitImagingReportRequest;
    }) => imagingQueueApi.submitReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.IMAGING_ORDERS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.IMAGING_ORDERS, variables.id],
      });
      toast.success('Imaging report submitted successfully.');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to submit imaging report.';
      toast.error(message);
    },
  });
}