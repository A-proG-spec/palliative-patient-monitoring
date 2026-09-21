import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospiceNursingApi } from '@/api/hospice-nursing';
import type {
  CreateHospiceNursingAssessmentRequest,
  UpdateHospiceNursingAssessmentRequest,
} from '@/types/hospice-nursing.types';
import { useToast } from '@/context/ToastContext';

/**
 * List hospice nursing assessments for a patient.
 *
 * Pass `{ includeDeleted: true }` to hit the `/all` endpoint and
 * return deleted-only rows — this is what powers the "Show deleted"
 * toggle on the admin patient detail page.
 */
export function usePatientHospiceAssessments(
  patientId: string,
  params?: {
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const includeDeleted = params?.includeDeleted === true;

  return useQuery({
    queryKey: ['patients', patientId, 'hospice-nursing', params],
    queryFn: () =>
      includeDeleted
        ? hospiceNursingApi.getAllForPatient(patientId, params)
        : hospiceNursingApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useHospiceAssessment(patientId: string, assessmentId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'hospice-nursing', assessmentId],
    queryFn: () => hospiceNursingApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

export function useCreateHospiceAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateHospiceNursingAssessmentRequest) =>
      hospiceNursingApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'hospice-nursing'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Hospice nursing assessment saved.');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        'Failed to save hospice nursing assessment.';
      toast.error(msg);
    },
  });
}

export function useUpdateHospiceAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateHospiceNursingAssessmentRequest;
    }) => hospiceNursingApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'hospice-nursing'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'hospice-nursing',
          variables.assessmentId,
        ],
      });
      toast.success('Hospice nursing assessment updated.');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        'Failed to update hospice nursing assessment.';
      toast.error(msg);
    },
  });
}