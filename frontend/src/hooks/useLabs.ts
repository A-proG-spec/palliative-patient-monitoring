import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/api/labs';
import type { CreateLabRequest, UpdateLabRequest } from '@/types/lab.types';
import { useToast } from '@/context/ToastContext';

export function usePatientLabs(patientId: string, params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }) {
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

export function useOrderLab(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateLabRequest) => labApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      toast.success('Lab test ordered successfully.');
    },
    onError: () => {
      toast.error('Failed to order lab test. Please try again.');
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
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      toast.success('Lab result saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save lab result. Please try again.');
    },
  });
}
