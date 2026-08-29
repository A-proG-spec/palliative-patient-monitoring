// src/hooks/useLabs.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/api/labs';
import type {
  CreateLabRequest,
  UpdateLabRequest,
} from '@/types/lab.types';

export function usePatientLabs(
  patientId: string,
  params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', params],
    queryFn: () => labApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useOrderLab(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabRequest) => labApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'labs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}

export function useUpdateLabResult(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      labId,
      data,
    }: {
      labId: string;
      data: UpdateLabRequest;
    }) => labApi.updateResult(patientId, labId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'labs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}
