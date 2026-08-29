// src/hooks/usePatients.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/api/patients';
import type { CreatePatientRequest } from '@/types/patient.types';

export function usePatients(params?: {
  page?: number;
  limit?: number;
  status?: 'Active' | 'Discharged';
  search?: string;
}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientApi.getList(params),
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => patientApi.getById(patientId),
    enabled: !!patientId,
  });
}

export function usePatientSummary(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'summary'],
    queryFn: () => patientApi.getSummary(patientId),
    enabled: !!patientId,
  });
}

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
