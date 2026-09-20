import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUpdateVisitRequest } from '@/api/admin';
import type {
  ApproveStaffRequest,
  CloseCaseRequest,
  StaffListFilterStatus,
  StaffRole,
} from '@/types/admin.types';
import { useToast } from '@/context/ToastContext';
import { useAuthStore } from '@/store/auth.store';

// ═══════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════

export function useDashboardStats() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    enabled: isAdmin,
    refetchInterval: isAdmin ? 30000 : false,
  });
}

// ═══════════════════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════════════════

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  return useQuery({
    queryKey: ['admin', 'dashboard', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    enabled: isAdmin,
    refetchInterval: isAdmin ? 30000 : false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: number | string) =>
      adminApi.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        'Failed to mark notification as read.';
      toast.error(message);
    },
  });
}

// ═══════════════════════════════════════════════════════════
// Patients
// ═══════════════════════════════════════════════════════════

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

export function useAdminPatientDetail(patientId: number | string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId],
    queryFn: () => adminApi.getPatientDetail(patientId),
    enabled: !!patientId,
  });
}

// ═══════════════════════════════════════════════════════════
// Close case
// ═══════════════════════════════════════════════════════════

export function useCloseCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: number | string;
      data: CloseCaseRequest;
    }) => adminApi.closeCase(patientId, data),
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

// ═══════════════════════════════════════════════════════════
// Staff approvals
// ═══════════════════════════════════════════════════════════

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
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: number | string;
      data: ApproveStaffRequest;
    }) => adminApi.approveStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'list'] });
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
    mutationFn: (staffId: number | string) => adminApi.rejectStaff(staffId),
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

// ═══════════════════════════════════════════════════════════
// Referrals
// ═══════════════════════════════════════════════════════════

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
    mutationFn: (referralId: number | string) =>
      adminApi.approveReferral(referralId),
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
    mutationFn: (referralId: number | string) =>
      adminApi.declineReferral(referralId),
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

// ═══════════════════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════════════════

export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

// ═══════════════════════════════════════════════════════════
// Visit edit / delete / restore
// ═══════════════════════════════════════════════════════════

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: number | string;
      data: AdminUpdateVisitRequest;
    }) => adminApi.updateVisit(visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Visit updated successfully.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update visit.';
      toast.error(msg);
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      visitId,
      reason,
    }: {
      visitId: number | string;
      reason?: string;
    }) => adminApi.deleteVisit(visitId, reason),
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
    mutationFn: (visitId: number | string) => adminApi.restoreVisit(visitId),
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

// ═══════════════════════════════════════════════════════════
// Staff management — active list + CRUD
// ═══════════════════════════════════════════════════════════

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

export function useStaffDetail(staffId: number | string) {
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
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: number | string;
      data: { name?: string; phone?: string; role?: any };
    }) => adminApi.updateStaff(staffId, data),
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
    mutationFn: ({
      staffId,
      reason,
    }: {
      staffId: number | string;
      reason?: string;
    }) => adminApi.deleteStaff(staffId, reason),
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
    mutationFn: (staffId: number | string) => adminApi.restoreStaff(staffId),
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

// ═══════════════════════════════════════════════════════════
// Staff performance
// ═══════════════════════════════════════════════════════════

export function useStaffPerformanceList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
}) {
  return useQuery({
    queryKey: ['admin', 'staff', 'performance', params],
    queryFn: () => adminApi.getStaffPerformanceList(params),
  });
}

export function useStaffPerformanceDetail(staffId: number | string) {
  return useQuery({
    queryKey: ['admin', 'staff', 'performance', staffId],
    queryFn: () => adminApi.getStaffPerformanceDetail(staffId),
    enabled: !!staffId,
  });
}

export function useStaffActivity(
  staffId: number | string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['admin', 'staff', 'performance', staffId, 'activity', params],
    queryFn: () => adminApi.getStaffActivity(staffId, params),
    enabled: !!staffId,
  });
}

// ═══════════════════════════════════════════════════════════
// Admin soft delete / restore — sub-resources
//
// Each hook takes the parent (patientId) plus the resource id,
// invalidates the correct query keys, and toasts on success/failure.
// ═══════════════════════════════════════════════════════════

function makeDeleteHook(
  mutationFn: (args: {
    patientId: number | string;
    resourceId: number | string;
    reason?: string;
  }) => Promise<unknown>,
  invalidateKeys: (patientId: number | string) => unknown[][],
  resourceLabel: string,
) {
  return function useDelete() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
      mutationFn,
      onSuccess: (_, variables) => {
        invalidateKeys(variables.patientId).forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
        toast.info(`${resourceLabel} deleted.`);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ??
            `Failed to delete ${resourceLabel.toLowerCase()}.`,
        );
      },
    });
  };
}

function makeRestoreHook(
  mutationFn: (args: {
    patientId: number | string;
    resourceId: number | string;
  }) => Promise<unknown>,
  invalidateKeys: (patientId: number | string) => unknown[][],
  resourceLabel: string,
) {
  return function useRestore() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
      mutationFn,
      onSuccess: (_, variables) => {
        invalidateKeys(variables.patientId).forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
        toast.success(`${resourceLabel} restored.`);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ??
            `Failed to restore ${resourceLabel.toLowerCase()}.`,
        );
      },
    });
  };
}

// ── Medication ──
export const useDeleteMedication = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteMedication(patientId, resourceId, reason),
  (pid) => [['patients', pid, 'medications'], ['patients', pid, 'summary']],
  'Medication',
);

export const useRestoreMedication = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreMedication(patientId, resourceId),
  (pid) => [['patients', pid, 'medications'], ['patients', pid, 'summary']],
  'Medication',
);

// ── Lab Test ──
export const useDeleteLabTest = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteLabTest(patientId, resourceId, reason),
  (pid) => [['patients', pid, 'labs'], ['patients', pid, 'summary']],
  'Lab test',
);

export const useRestoreLabTest = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreLabTest(patientId, resourceId),
  (pid) => [['patients', pid, 'labs'], ['patients', pid, 'summary']],
  'Lab test',
);

// ── Imaging ──
export const useDeleteImaging = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteImaging(patientId, resourceId, reason),
  (pid) => [['patients', pid, 'imaging'], ['patients', pid, 'summary']],
  'Imaging order',
);

export const useRestoreImaging = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreImaging(patientId, resourceId),
  (pid) => [['patients', pid, 'imaging'], ['patients', pid, 'summary']],
  'Imaging order',
);

// ── Admission ──
export const useDeleteAdmission = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteAdmission(patientId, resourceId, reason),
  (pid) => [['patients', pid, 'admissions'], ['patients', pid, 'summary']],
  'Admission',
);

export const useRestoreAdmission = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreAdmission(patientId, resourceId),
  (pid) => [['patients', pid, 'admissions'], ['patients', pid, 'summary']],
  'Admission',
);

// ── Progress Note ──
export const useDeleteProgressNote = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteProgressNote(patientId, resourceId, reason),
  (pid) => [['patients', pid, 'progress-notes'], ['patients', pid, 'summary']],
  'Progress note',
);

export const useRestoreProgressNote = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreProgressNote(patientId, resourceId),
  (pid) => [['patients', pid, 'progress-notes'], ['patients', pid, 'summary']],
  'Progress note',
);

// ── Hospice Nursing ──
export const useDeleteHospiceNursing = makeDeleteHook(
  ({ patientId, resourceId, reason }) =>
    adminApi.deleteHospiceNursing(patientId, resourceId, reason),
  (pid) => [
    ['patients', pid, 'hospice-nursing'],
    ['patients', pid, 'summary'],
  ],
  'Hospice nursing assessment',
);

export const useRestoreHospiceNursing = makeRestoreHook(
  ({ patientId, resourceId }) =>
    adminApi.restoreHospiceNursing(patientId, resourceId),
  (pid) => [
    ['patients', pid, 'hospice-nursing'],
    ['patients', pid, 'summary'],
  ],
  'Hospice nursing assessment',
);