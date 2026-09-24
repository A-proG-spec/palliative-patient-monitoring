import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { physiotherapyAssessmentApi } from '@/api/physiotherapy-assessment';
import type {
  CreatePhysiotherapyAssessmentRequest,
  UpdatePhysiotherapyAssessmentRequest,
} from '@/types/physiotherapy-assessment.types';
import { useToast } from '@/context/ToastContext';

export function usePatientPhysiotherapyAssessments(
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
    queryKey: ['patients', patientId, 'physiotherapy-assessments', params],
    queryFn: () =>
      includeDeleted
        ? physiotherapyAssessmentApi.getAllForPatient(patientId, params)
        : physiotherapyAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function usePhysiotherapyAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: [
      'patients',
      patientId,
      'physiotherapy-assessments',
      assessmentId,
    ],
    queryFn: () => physiotherapyAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreatePhysiotherapyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePhysiotherapyAssessmentRequest) =>
      physiotherapyAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'physiotherapy-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Physiotherapy assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save physiotherapy assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdatePhysiotherapyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdatePhysiotherapyAssessmentRequest;
    }) => physiotherapyAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'physiotherapy-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'physiotherapy-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Physiotherapy assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update physiotherapy assessment.';
      toast.error(msg);
    },
  });
}

export function useDeletePhysiotherapyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => physiotherapyAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'physiotherapy-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Physiotherapy assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete physiotherapy assessment.';
      toast.error(msg);
    },
  });
}

export function useRestorePhysiotherapyAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      physiotherapyAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'physiotherapy-assessments'],
      });
      toast.success('Physiotherapy assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore physiotherapy assessment.');
    },
  });
}