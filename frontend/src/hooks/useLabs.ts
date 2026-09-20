import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/api/labs';
import type { CreateLabRequest, UpdateLabRequest } from '@/types/lab.types';
import { useToast } from '@/context/ToastContext';
import api from '@/api/client';
import { QUERY_KEYS } from '@/constants';

// ─────────────────────────────────────────────────────────────
// Queries — patient-scoped
// ─────────────────────────────────────────────────────────────

export function usePatientLabs(
  patientId: string,
  params?: {
    status?: 'Ordered' | 'Completed' | 'Cancelled';
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', params],
    queryFn: () => labApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useLabDetail(patientId: string, labId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', labId],
    queryFn: () => labApi.getById(patientId, labId),
    enabled: !!patientId && !!labId,
  });
}

// ─────────────────────────────────────────────────────────────
// Lab technician queue — top-level pending requests
// ─────────────────────────────────────────────────────────────

export interface PendingLabRequest {
  id: number;
  patientId: number;
  patientName: string;
  testName: string;
  requestingClinician: string;
  dateRequested: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Ordered' | 'Completed' | 'Cancelled';
}

export function useLabRequests(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.LAB_REQUESTS,
    queryFn: async (): Promise<PendingLabRequest[]> => {
      const response = await api.get('/labs/pending-requests');
      return response.data.labs ?? [];
    },
    enabled,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 30 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export function useOrderLab(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateLabRequest) => labApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'labs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_REQUESTS });
      toast.success('Lab test ordered successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to order lab test. Please try again.';
      toast.error(message);
    },
  });
}

export function useUpdateLabResult(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ labId, data }: { labId: string; data: UpdateLabRequest }) =>
      labApi.updateResult(patientId, labId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'labs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_REQUESTS });
      toast.success('Lab result saved successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to save lab result. Please try again.';
      toast.error(message);
    },
  });
}