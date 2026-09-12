import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockStaffApi } from './mocks/staff.mock';
import type { StaffDashboardStats } from '@/types/staff.types';
import type { StaffProfile } from '@/types/auth.types';

export const staffApi = {
  getDashboardStats: (): Promise<StaffDashboardStats> => {
    if (USE_MOCK) return mockStaffApi.getDashboardStats();
    return apiClient.get<StaffDashboardStats>('/staff/dashboard/stats').then((r) => r.data);
  },


  getProfile: (): Promise<StaffProfile> => {
    if (USE_MOCK) return mockStaffApi.getProfile();
    return apiClient.get<StaffProfile>('/profile').then((r) => r.data);
  },
};