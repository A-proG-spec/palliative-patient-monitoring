import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAssessmentApi } from '@/api/social-assessment';
import type {
  CreateSocialAssessmentRequest,
  UpdateSocialAssessmentRequest,
} from '@/types/social-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientSocialAssessments(
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
    queryKey: ['patients', patientId, 'social-assessments', params],
    queryFn: () =>
      includeDeleted
        ? socialAssessmentApi.getAllForPatient(patientId, params)
        : socialAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useSocialAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'social-assessments', assessmentId],
    queryFn: () => socialAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreateSocialAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSocialAssessmentRequest) =>
      socialAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'social-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Social assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save social assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdateSocialAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateSocialAssessmentRequest;
    }) => socialAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'social-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'social-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Social assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update social assessment.';
      toast.error(msg);
    },
  });
}

export function useDeleteSocialAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => socialAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'social-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Social assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete social assessment.';
      toast.error(msg);
    },
  });
}

export function useRestoreSocialAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      socialAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'social-assessments'],
      });
      toast.success('Social assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore social assessment.');
    },
  });
}