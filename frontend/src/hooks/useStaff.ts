// src/hooks/useStaff.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/api/staff';
import { STAFF_DASHBOARD_REFRESH_INTERVAL } from '@/constants';

export function useStaffDashboardStats() {
  return useQuery({
    queryKey: ['staff', 'dashboard', 'stats'],
    queryFn: () => staffApi.getDashboardStats(),
    refetchInterval: STAFF_DASHBOARD_REFRESH_INTERVAL,
  });
}

export function useStaffProfileData() {
  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignedPatients(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['staff', 'patients', params],
    queryFn: () => staffApi.getAssignedPatients(params),
  });
}

export function useUpcomingVisits(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['staff', 'visits', 'upcoming', params],
    queryFn: () => staffApi.getUpcomingVisits(params),
  });
}

export function useRecentVisits(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['staff', 'visits', 'recent', params],
    queryFn: () => staffApi.getRecentVisits(params),
  });
}

export function useStaffAlerts(params?: {
  read?: boolean;
  type?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['staff', 'alerts', params],
    queryFn: () => staffApi.getAlerts(params),
    refetchInterval: STAFF_DASHBOARD_REFRESH_INTERVAL,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => staffApi.markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'dashboard', 'stats'] });
    },
  });
}
