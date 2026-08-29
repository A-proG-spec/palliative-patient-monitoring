// src/hooks/useAdmissions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '@/api/admissions';
import type {
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
} from '@/types/admission.types';

export function usePatientAdmissions(
  patientId: string,
  params?: { status?: 'Active' | 'Discharged'; page?: number; limit?: number }
) {
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
    },
  });
}

export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      admissionId,
      data,
    }: {
      admissionId: string;
      data: UpdateAdmissionRequest;
    }) => admissionApi.update(patientId, admissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'admissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
    },
  });
}
