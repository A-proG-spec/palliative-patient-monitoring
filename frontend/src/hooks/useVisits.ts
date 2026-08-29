// src/hooks/useVisits.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '@/api/visits';
import type { CreateVisitRequest } from '@/types/visit.types';

export function usePatientVisits(
  patientId: string,
  params?: { page?: number; limit?: number }
) {
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
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'visits'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      queryClient.invalidateQueries({ queryKey: ['staff', 'dashboard', 'stats'] });
    },
  });
}
