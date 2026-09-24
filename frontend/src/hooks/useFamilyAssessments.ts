import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyAssessmentApi } from '@/api/family-assessment';
import type {
  CreateFamilyAssessmentRequest,
  UpdateFamilyAssessmentRequest,
} from '@/types/family-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientFamilyAssessments(
  patientId: string,
  params?: {
    assessmentType?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const includeDeleted = params?.includeDeleted === true;

  return useQuery({
    queryKey: ['patients', patientId, 'family-assessments', params],
    queryFn: () =>
      includeDeleted
        ? familyAssessmentApi.getAllForPatient(patientId, params)
        : familyAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useFamilyAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'family-assessments', assessmentId],
    queryFn: () => familyAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreateFamilyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateFamilyAssessmentRequest) =>
      familyAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'family-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Family assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save family assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdateFamilyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateFamilyAssessmentRequest;
    }) => familyAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'family-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'family-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Family assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update family assessment.';
      toast.error(msg);
    },
  });
}

export function useDeleteFamilyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => familyAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'family-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Family assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete family assessment.';
      toast.error(msg);
    },
  });
}

export function useRestoreFamilyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      familyAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'family-assessments'],
      });
      toast.success('Family assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore family assessment.');
    },
  });
}