import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagingApi, CreateImagingRequest, UpdateImagingReportRequest, ImagingOrder } from '@/api/imaging';
import { useToast } from '@/context/ToastContext';

export function usePatientImaging(patientId: string, params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['patients', patientId, 'imaging', params],
    queryFn: () => imagingApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useImagingDetail(patientId: string, imagingId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'imaging', imagingId],
    queryFn: () => imagingApi.getById(patientId, imagingId),
    enabled: !!patientId && !!imagingId,
  });
}

export function useOrderImaging(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateImagingRequest) => imagingApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'imaging'] });
      toast.success('Imaging order submitted successfully.');
    },
    onError: () => {
      toast.error('Failed to submit imaging order. Please try again.');
    },
  });
}

export function useUpdateImagingReport(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ imagingId, data }: { imagingId: string; data: UpdateImagingReportRequest }) =>
      imagingApi.updateReport(patientId, imagingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'imaging'] });
      toast.success('Imaging report saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save imaging report. Please try again.');
    },
  });
}

export function useUpdateImagingStatus(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ imagingId, status }: { imagingId: string; status: 'Ordered' | 'Completed' }) =>
      imagingApi.updateStatus(patientId, imagingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'imaging'] });
      toast.success('Imaging status updated.');
    },
    onError: () => {
      toast.error('Failed to update imaging status. Please try again.');
    },
  });
}

export function useDeleteImaging(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (imagingId: string) => imagingApi.delete(patientId, imagingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'imaging'] });
      toast.success('Imaging order deleted.');
    },
    onError: () => {
      toast.error('Failed to delete imaging order. Please try again.');
    },
  });
}