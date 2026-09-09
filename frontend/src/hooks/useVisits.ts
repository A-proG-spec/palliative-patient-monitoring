import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '@/api/visits';
import type { CreateVisitRequest } from '@/types/visit.types';
import { useToast } from '@/context/ToastContext';

export function usePatientVisits(patientId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', params],
    queryFn: () => visitApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useVisitDetail(patientId: string, visitId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', visitId],
    queryFn: () => visitApi.getById(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
}

export function useRecordVisit(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'dashboard', 'stats'] });
      toast.success('Home visit recorded successfully.');
    },
    onError: () => {
      toast.error('Failed to record visit. Please try again.');
    },
  });
}
