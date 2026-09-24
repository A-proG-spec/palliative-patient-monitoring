import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { psychiatryAssessmentApi } from '@/api/psychiatry-assessment';
import type {
  CreatePsychiatryAssessmentRequest,
  UpdatePsychiatryAssessmentRequest,
} from '@/types/psychiatry-assessment.types';
import { useToast } from '@/context/ToastContext';

/**
 * ⚠️ SAFETY NOTE
 * ──────────────
 * Creating with `suicideRiskLevel: 'High'` triggers a backend
 * notification automatically.
 *
 * Deleting a high-risk assessment REQUIRES a non-empty `reason`
 * — the backend rejects the request with 400 otherwise, which
 * surfaces here as an error toast.
 */

export function usePatientPsychiatryAssessments(
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
    queryKey: ['patients', patientId, 'psychiatry-assessments', params],
    queryFn: () =>
      includeDeleted
        ? psychiatryAssessmentApi.getAllForPatient(patientId, params)
        : psychiatryAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function usePsychiatryAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: ['patients', patientId, 'psychiatry-assessments', assessmentId],
    queryFn: () => psychiatryAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreatePsychiatryAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePsychiatryAssessmentRequest) =>
      psychiatryAssessmentApi.create(patientId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'psychiatry-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });

      // Warn the user when high risk is recorded (the backend
      // has already notified the admins).
      if (response.suicideRiskLevel === 'High') {
        toast.warning(
          'High suicide risk recorded. Administrators have been notified.',
        );
      } else {
        toast.success('Psychiatry assessment saved.');
      }
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save psychiatry assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdatePsychiatryAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdatePsychiatryAssessmentRequest;
    }) => psychiatryAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'psychiatry-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'psychiatry-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Psychiatry assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update psychiatry assessment.';
      toast.error(msg);
    },
  });
}

export function useDeletePsychiatryAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => psychiatryAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'psychiatry-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Psychiatry assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete psychiatry assessment.';
      toast.error(msg);
    },
  });
}

export function useRestorePsychiatryAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      psychiatryAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'psychiatry-assessments'],
      });
      toast.success('Psychiatry assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore psychiatry assessment.');
    },
  });
}