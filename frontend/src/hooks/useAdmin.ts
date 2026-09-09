import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { ApproveStaffRequest, CloseCaseRequest } from '@/types/admin.types';
import { useToast } from '@/context/ToastContext';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: any }) =>
      adminApi.updateVisit(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'visits', variables.visitId] });
      toast.success('Visit updated successfully.');
    },
    onError: (error: any) => {
      toast.error('Update failed', error.response?.data?.message || 'Failed to update visit.');
    },
  });
}

export function useVisitEditHistory(visitId: string) {
  return useQuery({
    queryKey: ['admin', 'visits', visitId, 'history'],
    queryFn: () => adminApi.getVisitEditHistory(visitId),
    enabled: !!visitId,
  });
}

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

export function useAdminPatients(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'patients', params],
    queryFn: () => adminApi.getPatients(params),
  });
}

export function useAdminPatientDetail(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId],
    queryFn: () => adminApi.getPatientDetail(patientId),
    enabled: !!patientId,
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CloseCaseRequest }) =>
      adminApi.closeCase(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      const reason = variables.data.reason === 'Deceased'
        ? 'Case closed — patient marked as deceased.'
        : 'Case closed — patient discharged (improved).';
      toast.info(reason);
    },
    onError: () => {
      toast.error('Failed to close case. Please try again.');
    },
  });
}

// ── Discharge API ─────────────────────────────────────────────
export function useDischargePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: any }) =>
      adminApi.dischargePatient(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient discharged successfully.');
    },
    onError: (error: any) => {
      toast.error('Failed to discharge patient.', error.response?.data?.message || 'Please try again.');
    },
  });
}

export function useDischargeSummary(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId, 'discharge-summary'],
    queryFn: () => adminApi.getDischargeSummary(patientId),
    enabled: !!patientId,
  });
}

// ── Update Patient Status ──────────────────────────────────────
export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ patientId, status }: { patientId: string; status: 'Active' | 'Discharged' }) =>
      adminApi.updatePatientStatus(patientId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(`Patient status updated to ${variables.status}.`);
    },
    onError: (error: any) => {
      toast.error('Failed to update patient status.', error.response?.data?.message || 'Please try again.');
    },
  });
}

export function usePendingStaff() {
  return useQuery({
    queryKey: ['admin', 'staff', 'pending'],
    queryFn: () => adminApi.getPendingStaff(),
  });
}

export function useApproveStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: ApproveStaffRequest }) =>
      adminApi.approveStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Staff member approved successfully.');
    },
    onError: () => {
      toast.error('Failed to approve staff member. Please try again.');
    },
  });
}

export function useRejectStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (staffId: string) => adminApi.rejectStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.warning('Staff registration rejected.');
    },
    onError: () => {
      toast.error('Failed to reject staff member. Please try again.');
    },
  });
}

export function usePendingReferrals() {
  return useQuery({
    queryKey: ['admin', 'referrals', 'pending'],
    queryFn: () => adminApi.getPendingReferrals(),
  });
}

export function useApproveReferral() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.approveReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Referral approved. Patient location updated.');
    },
    onError: () => {
      toast.error('Failed to approve referral. Please try again.');
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.declineReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.warning('Referral declined.');
    },
    onError: () => {
      toast.error('Failed to decline referral. Please try again.');
    },
  });
}

export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useExportReport() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ format }: { format: 'pdf' | 'excel' }) => adminApi.exportReport(format),
    onSuccess: (_, variables) => {
      toast.success(`Report exported as ${variables.format.toUpperCase()} successfully.`);
    },
    onError: () => {
      toast.error('Failed to export report. Please try again.');
    },
  });
}