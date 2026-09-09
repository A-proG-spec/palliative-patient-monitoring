import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/api/medications';
import type { CreateMedicationRequest, UpdateMedicationRequest } from '@/types/medication.types';
import { useToast } from '@/context/ToastContext';

export function usePatientMedications(patientId: string, params?: { status?: 'Ordered' | 'Given'; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', params],
    queryFn: () => medicationApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useMedicationDetail(patientId: string, medicationId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', medicationId],
    queryFn: () => medicationApi.getById(patientId, medicationId),
    enabled: !!patientId && !!medicationId,
  });
}

export function useOrderMedication(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateMedicationRequest) => medicationApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      toast.success('Medication ordered successfully.');
    },
    onError: () => {
      toast.error('Failed to order medication. Please try again.');
    },
  });
}

export function useUpdateMedicationStatus(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: UpdateMedicationRequest }) =>
      medicationApi.updateStatus(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      toast.success('Medication status updated.');
    },
    onError: () => {
      toast.error('Failed to update medication status. Please try again.');
    },
  });
}
