import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dischargeApi } from '@/api/discharge';
import { useToast } from '@/context/ToastContext';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';

/**
 * Fetch the latest discharge summary for a patient.
 * Backend returns 404 if none exists — React Query will surface this
 * as an error state, which the caller should treat as "no discharge
 * summary yet" rather than a failure.
 */
export function useDischargeSummary(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'discharge-summary'],
    queryFn: () => dischargeApi.getByPatient(patientId),
    enabled: !!patientId,
    retry: false, // 404s are expected for active patients
  });
}

/**
 * Create a discharge summary — this is the real discharge action.
 * The backend:
 *   1. Persists the DischargeSummary
 *   2. Flips the linked HospitalAdmission status → 'Discharged'
 *   3. Flips the Patient status → 'Discharged'
 *   4. Creates a `CloseCase` notification for admins
 */
export function useDischargePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: DischargeSummary;
    }) => dischargeApi.create(patientId, data),

    onSuccess: (_, variables) => {
      // Invalidate everything the discharge touches.
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patientId, 'discharge-summary'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patientId, 'admissions'],
      });

      toast.success('Patient discharged successfully.');
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to discharge patient. Please try again.';
      toast.error(message);
    },
  });
}

/**
 * Finalize a Draft discharge summary → Final.
 */
export function useFinalizeDischargeSummary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      summaryId,
    }: {
      patientId: string;
      summaryId: string;
    }) => dischargeApi.finalize(patientId, summaryId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patientId, 'discharge-summary'],
      });
      toast.success('Discharge summary finalized.');
    },

    onError: () => {
      toast.error('Failed to finalize discharge summary.');
    },
  });
}