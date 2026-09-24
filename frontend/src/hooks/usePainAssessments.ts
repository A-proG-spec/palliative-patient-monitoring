import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { painAssessmentApi } from '@/api/pain-assessment';
import type {
  CreatePainAssessmentRequest,
  UpdatePainAssessmentRequest,
} from '@/types/pain-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientPainAssessments(
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
    queryKey: ['patients', patientId, 'pain-assessments', params],
    queryFn: () =>
      includeDeleted
        ? painAssessmentApi.getAllForPatient(patientId, params)
        : painAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function usePainAssessment(patientId: string, assessmentId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'pain-assessments', assessmentId],
    queryFn: () => painAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreatePainAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePainAssessmentRequest) =>
      painAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pain-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Pain assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save pain assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdatePainAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdatePainAssessmentRequest;
    }) => painAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pain-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'pain-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Pain assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update pain assessment.';
      toast.error(msg);
    },
  });
}

export function useDeletePainAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => painAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pain-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Pain assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete pain assessment.';
      toast.error(msg);
    },
  });
}

export function useRestorePainAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      painAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pain-assessments'],
      });
      toast.success('Pain assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore pain assessment.');
    },
  });
}