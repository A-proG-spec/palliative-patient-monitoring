import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAuthApi } from './mocks/auth.mock';
import type {
  Profile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ActivityStats
} from '@/types/profile.types';

export const profileApi = {
  getProfile: (): Promise<Profile> => {
    if (USE_MOCK) return mockAuthApi.getProfile();
    return apiClient.get<Profile>('/profile').then((r) => r.data);
  },

  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    if (USE_MOCK) return mockAuthApi.updateProfile(data) as Promise<UpdateProfileResponse>;
    return apiClient.put<UpdateProfileResponse>('/profile', data).then((r) => r.data);
  },

  changePassword: (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    if (USE_MOCK) return mockAuthApi.changePassword(data) as Promise<ChangePasswordResponse>;
    return apiClient.put<ChangePasswordResponse>('/profile/password', data).then((r) => r.data);
  },

  getActivityStats: (): Promise<ActivityStats> => {
    if (USE_MOCK) return mockAuthApi.getActivityStats();
    return apiClient.get<ActivityStats>('/profile/activity').then((r) => r.data);
  },
};