import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spiritualAssessmentApi } from '@/api/spiritual-assessment';
import type {
  CreateSpiritualAssessmentRequest,
  UpdateSpiritualAssessmentRequest,
} from '@/types/spiritual-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientSpiritualAssessments(
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
    queryKey: ['patients', patientId, 'spiritual-assessments', params],
    queryFn: () =>
      includeDeleted
        ? spiritualAssessmentApi.getAllForPatient(patientId, params)
        : spiritualAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useSpiritualAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'spiritual-assessments', assessmentId],
    queryFn: () => spiritualAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreateSpiritualAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSpiritualAssessmentRequest) =>
      spiritualAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'spiritual-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Spiritual assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save spiritual assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdateSpiritualAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateSpiritualAssessmentRequest;
    }) => spiritualAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'spiritual-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'spiritual-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Spiritual assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update spiritual assessment.';
      toast.error(msg);
    },
  });
}

export function useDeleteSpiritualAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => spiritualAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'spiritual-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Spiritual assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete spiritual assessment.';
      toast.error(msg);
    },
  });
}

export function useRestoreSpiritualAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      spiritualAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'spiritual-assessments'],
      });
      toast.success('Spiritual assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore spiritual assessment.');
    },
  });
}