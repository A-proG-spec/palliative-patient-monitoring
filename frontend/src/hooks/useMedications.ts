import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/api/medications';
import type {
  CreateMedicationRequest,
  UpdateMedicationRequest,
  MedicationStatus,
} from '@/types/medication.types';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export function usePatientMedications(
  patientId: string,
  params?: {
    status?: MedicationStatus;
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', params],
    queryFn: () => medicationApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useMedicationDetail(
  patientId: string,
  medicationId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', medicationId],
    queryFn: () => medicationApi.getById(patientId, medicationId),
    enabled: !!patientId && !!medicationId,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export function useOrderMedication(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast.success('Medication ordered successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to order medication. Please try again.';
      toast.error(message);
    },
  });
}

export function useUpdateMedicationStatus(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast.success('Medication status updated.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to update medication status. Please try again.';
      toast.error(message);
    },
  });
}