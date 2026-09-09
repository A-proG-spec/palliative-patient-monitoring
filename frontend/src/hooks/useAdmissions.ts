import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '@/api/admissions';
import type { CreateAdmissionRequest, UpdateAdmissionRequest } from '@/types/admission.types';
import { useToast } from '@/context/ToastContext';

export function usePatientAdmissions(patientId: string, params?: { status?: 'Active' | 'Discharged'; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', params],
    queryFn: () => admissionApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useAdmissionDetail(patientId: string, admissionId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', admissionId],
    queryFn: () => admissionApi.getById(patientId, admissionId),
    enabled: !!patientId && !!admissionId,
  });
}

export function useRecordAdmission(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateAdmissionRequest) => admissionApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      toast.success('Hospital admission recorded successfully.');
    },
    onError: () => {
      toast.error('Failed to record admission. Please try again.');
    },
  });
}

export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdmissionRequest }) =>
      admissionApi.update(patientId, admissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      const isDischarge = variables.data.status === 'Discharged';
      toast.success(isDischarge ? 'Patient discharged successfully.' : 'Admission updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update admission. Please try again.');
    },
  });
}
