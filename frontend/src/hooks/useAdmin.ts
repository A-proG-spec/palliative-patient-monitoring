import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUpdateVisitRequest } from '@/api/admin';
import type { ApproveStaffRequest, CloseCaseRequest } from '@/types/admin.types';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
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

// ─────────────────────────────────────────────────────────────
// Patients
// ─────────────────────────────────────────────────────────────

export function useAdminPatients(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
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

// ─────────────────────────────────────────────────────────────
// Close case (legacy)
// ─────────────────────────────────────────────────────────────

export function useCloseCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CloseCaseRequest }) =>
      adminApi.closeCase(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      const reason =
        variables.data.reason === 'Deceased'
          ? 'Case closed — patient marked as deceased.'
          : 'Case closed — patient discharged (improved).';
      toast.info(reason);
    },
    onError: () => {
      toast.error('Failed to close case. Please try again.');
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Staff management
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Referrals
// ─────────────────────────────────────────────────────────────

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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to approve referral. Please try again.';
      toast.error(message);
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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to decline referral. Please try again.';
      toast.error(message);
    },
  });
}
// ─────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────

export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

// ─────────────────────────────────────────────────────────────
// Admin visit edit / delete / restore
// ─────────────────────────────────────────────────────────────

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: AdminUpdateVisitRequest }) =>
      adminApi.updateVisit(visitId, data),
    onSuccess: (_, variables) => {
      // Invalidate both the admin patient detail (aggregates visits)
      // and the staff-facing visit list/detail queries.
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.visitId] });
      toast.success('Visit updated successfully.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update visit.';
      toast.error(msg);
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ visitId, reason }: { visitId: string; reason?: string }) =>
      adminApi.deleteVisit(visitId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.info('Visit deleted.');
    },
    onError: () => {
      toast.error('Failed to delete visit. Please try again.');
    },
  });
}

export function useRestoreVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (visitId: string) => adminApi.restoreVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Visit restored.');
    },
    onError: () => {
      toast.error('Failed to restore visit. Please try again.');
    },
  });
}
// ─────────────────────────────────────────────────────────────
// Staff management — active list + CRUD
// ─────────────────────────────────────────────────────────────

import type {
  StaffListResponse,
  StaffDetail,
  UpdateStaffRequest,
  StaffListFilterStatus,
  StaffRole,
} from '@/types/admin.types';

export function useStaffList(params?: {
  page?: number;
  limit?: number;
  status?: StaffListFilterStatus;
  role?: StaffRole;
  search?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'staff', 'list', params],
    queryFn: () => adminApi.getStaffList(params),
  });
}

export function useStaffDetail(staffId: string) {
  return useQuery({
    queryKey: ['admin', 'staff', 'detail', staffId],
    queryFn: () => adminApi.getStaffById(staffId),
    enabled: !!staffId,
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: UpdateStaffRequest }) =>
      adminApi.updateStaff(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'staff', 'detail', variables.staffId],
      });
      toast.success('Staff member updated successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? 'Failed to update staff member.';
      toast.error(message);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ staffId, reason }: { staffId: string; reason?: string }) =>
      adminApi.deleteStaff(staffId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'list'] });
      toast.success('Staff member deleted.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? 'Failed to delete staff member.';
      toast.error(message);
    },
  });
}

export function useRestoreStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (staffId: string) => adminApi.restoreStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'list'] });
      toast.success('Staff member restored.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? 'Failed to restore staff member.';
      toast.error(message);
    },
  });
}