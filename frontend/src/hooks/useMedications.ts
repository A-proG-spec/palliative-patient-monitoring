import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/api/medications';
import type {
  CreateMedicationRequest,
  UpdateMedicationRequest,
  MedicationStatus,
} from '@/types/medication.types';
import { useToast } from '@/context/ToastContext';
import api from '@/api/client';
import { QUERY_KEYS } from '@/constants';

// ─────────────────────────────────────────────────────────────
// Queries — patient-scoped
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
// Pharmacist queue — top-level pending orders
//
// Used by the pharmacist's work queue page AND the sidebar badge.
// Pass `{ enabled: false }` to disable when the current user isn't
// a pharmacist.
// ─────────────────────────────────────────────────────────────

export interface PendingMedicationOrder {
  id: number;
  patientId: number;
  patientName: string;
  medicationName: string;
  dose: string;
  frequency: string;
  prescribingClinician: string;
  dateOrdered: string;
  status: 'Ordered' | 'Given';
}

export function useMedicationOrders(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.MEDICATION_ORDERS,
    queryFn: async (): Promise<PendingMedicationOrder[]> => {
      const response = await api.get('/medications/pending-orders');
      return response.data.medications ?? [];
    },
    enabled,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 30 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations — patient-scoped
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEDICATION_ORDERS,
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEDICATION_ORDERS,
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