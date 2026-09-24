import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionalAssessmentApi } from '@/api/nutritional-assessment';
import type {
  CreateNutritionalAssessmentRequest,
  UpdateNutritionalAssessmentRequest,
} from '@/types/nutritional-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientNutritionalAssessments(
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
    queryKey: ['patients', patientId, 'nutritional-assessments', params],
    queryFn: () =>
      includeDeleted
        ? nutritionalAssessmentApi.getAllForPatient(patientId, params)
        : nutritionalAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useNutritionalAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: [
      'patients',
      patientId,
      'nutritional-assessments',
      assessmentId,
    ],
    queryFn: () => nutritionalAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreateNutritionalAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateNutritionalAssessmentRequest) =>
      nutritionalAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'nutritional-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Nutritional assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save nutritional assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdateNutritionalAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateNutritionalAssessmentRequest;
    }) => nutritionalAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'nutritional-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'nutritional-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Nutritional assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update nutritional assessment.';
      toast.error(msg);
    },
  });
}

export function useDeleteNutritionalAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => nutritionalAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'nutritional-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Nutritional assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete nutritional assessment.';
      toast.error(msg);
    },
  });
}

export function useRestoreNutritionalAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      nutritionalAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'nutritional-assessments'],
      });
      toast.success('Nutritional assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore nutritional assessment.');
    },
  });
}