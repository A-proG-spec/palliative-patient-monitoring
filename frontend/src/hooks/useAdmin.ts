// src/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import {
  ADMIN_DASHBOARD_REFRESH_INTERVAL,
} from '@/constants';
import type { ApproveStaffRequest, CloseCaseRequest } from '@/types/admin.types';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: ADMIN_DASHBOARD_REFRESH_INTERVAL,
  });
}

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    refetchInterval: ADMIN_DASHBOARD_REFRESH_INTERVAL,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      adminApi.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
    },
  });
}

// ─── Patients ─────────────────────────────────────────────────────────────────

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

export function useCloseCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: CloseCaseRequest;
    }) => adminApi.closeCase(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
    },
  });
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export function usePendingStaff() {
  return useQuery({
    queryKey: ['admin', 'staff', 'pending'],
    queryFn: () => adminApi.getPendingStaff(),
  });
}

export function useApproveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string;
      data: ApproveStaffRequest;
    }) => adminApi.approveStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
    },
  });
}

export function useRejectStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => adminApi.rejectStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
    },
  });
}

// ─── Referrals ────────────────────────────────────────────────────────────────

export function usePendingReferrals() {
  return useQuery({
    queryKey: ['admin', 'referrals', 'pending'],
    queryFn: () => adminApi.getPendingReferrals(),
  });
}

export function useApproveReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.approveReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'referrals', 'pending'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.declineReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'referrals', 'pending'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'notifications'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard', 'stats'],
      });
    },
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format }: { format: 'pdf' | 'excel' }) =>
      adminApi.exportReport(format),
    onSuccess: (blob, variables) => {
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${variables.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}
