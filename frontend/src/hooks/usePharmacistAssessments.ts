import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacistAssessmentApi } from '@/api/pharmacist-assessment';
import type {
  CreateClinicalPharmacistAssessmentRequest,
  UpdateClinicalPharmacistAssessmentRequest,
} from '@/types/pharmacist-assessment.types';
import { useToast } from '@/context/ToastContext';

// ═════════════════════════════════════════════════════════════
// LIST (active only)
// ═════════════════════════════════════════════════════════════
export function usePatientPharmacistAssessments(
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
    queryKey: ['patients', patientId, 'pharmacist-assessments', params],
    queryFn: () =>
      includeDeleted
        ? pharmacistAssessmentApi.getAllForPatient(patientId, params)
        : pharmacistAssessmentApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

// ═════════════════════════════════════════════════════════════
// GET ONE
// ═════════════════════════════════════════════════════════════
export function usePharmacistAssessment(
  patientId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: [
      'patients',
      patientId,
      'pharmacist-assessments',
      assessmentId,
    ],
    queryFn: () => pharmacistAssessmentApi.getById(patientId, assessmentId),
    enabled: !!patientId && !!assessmentId,
  });
}

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export function useCreatePharmacistAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateClinicalPharmacistAssessmentRequest) =>
      pharmacistAssessmentApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pharmacist-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.success('Pharmacist assessment saved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save pharmacist assessment.';
      toast.error(msg);
    },
  });
}

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export function useUpdatePharmacistAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateClinicalPharmacistAssessmentRequest;
    }) => pharmacistAssessmentApi.update(patientId, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pharmacist-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'patients',
          patientId,
          'pharmacist-assessments',
          variables.assessmentId,
        ],
      });
      toast.success('Pharmacist assessment updated.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update pharmacist assessment.';
      toast.error(msg);
    },
  });
}

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export function useDeletePharmacistAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      assessmentId,
      reason,
    }: {
      assessmentId: string;
      reason?: string;
    }) => pharmacistAssessmentApi.delete(patientId, assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pharmacist-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'summary'],
      });
      toast.info('Pharmacist assessment deleted.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete pharmacist assessment.';
      toast.error(msg);
    },
  });
}

// ═════════════════════════════════════════════════════════════
// RESTORE
// ═════════════════════════════════════════════════════════════
export function useRestorePharmacistAssessment(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      pharmacistAssessmentApi.restore(patientId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'pharmacist-assessments'],
      });
      toast.success('Pharmacist assessment restored.');
    },
    onError: () => {
      toast.error('Failed to restore pharmacist assessment.');
    },
  });
}