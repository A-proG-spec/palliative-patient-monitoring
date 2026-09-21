import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '@/api/admissions';
import type {
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  AdmissionStatus,
} from '@/types/admission.types';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export function usePatientAdmissions(
  patientId: string,
  params?: {
    status?: AdmissionStatus;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const includeDeleted = params?.includeDeleted === true;

  return useQuery({
    queryKey: ['patients', patientId, 'admissions', params],
    queryFn: () =>
      includeDeleted
        ? admissionApi.getAllForPatient(patientId, params)
        : admissionApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useAdmissionDetail(
  patientId: string,
  admissionId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', admissionId],
    queryFn: () => admissionApi.getById(patientId, admissionId),
    enabled: !!patientId && !!admissionId,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export function useRecordAdmission(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateAdmissionRequest) =>
      admissionApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'admissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId],
      });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'referrals'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'referrals'],
      });

      toast.success('Hospital admission recorded successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to record admission. Please try again.';
      toast.error(message);
    },
  });
}

export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      admissionId,
      data,
    }: {
      admissionId: string;
      data: UpdateAdmissionRequest;
    }) => admissionApi.update(patientId, admissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'admissions'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'admissions',
          variables.admissionId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      const isDischarge = variables.data.status === 'Discharged';
      toast.success(
        isDischarge
          ? 'Patient discharged from admission.'
          : 'Admission updated successfully.',
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to update admission. Please try again.';
      toast.error(message);
    },
  });
}