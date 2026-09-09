import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/api/staff';

export function useStaffDashboardStats() {
  return useQuery({
    queryKey: ['staff', 'dashboard', 'stats'],
    queryFn: () => staffApi.getDashboardStats(),
    refetchInterval: 60000,
  });
}

export function useStaffProfile() {
  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
