// src/hooks/useMedications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/api/medications';
import type {
  CreateMedicationRequest,
  UpdateMedicationRequest,
} from '@/types/medication.types';

export function usePatientMedications(
  patientId: string,
  params?: { status?: 'Ordered' | 'Given'; page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', params],
    queryFn: () => medicationApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useOrderMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicationRequest) =>
      medicationApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'medications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}

export function useUpdateMedicationStatus(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      medicationId,
      data,
    }: {
      medicationId: string;
      data: UpdateMedicationRequest;
    }) => medicationApi.updateStatus(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'medications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}
