import apiClient from './client';
import type {
  AdminProfile,
  UpdateAdminProfileRequest,
  UpdateAdminProfileResponse,
  ChangeAdminPasswordRequest,
  ChangeAdminPasswordResponse,
  AdminActivityStats,
} from '@/types/admin-profile.types';

// ═════════════════════════════════════════════════════════════
// Admin Profile API
//
// Mirrors the staff `profileApi` pattern exactly — same axios
// client, same `.then((r) => r.data)` unwrap.
//
// The `apiClient` axios instance already injects the
// Authorization header via its request interceptor, so we do
// NOT touch tokens here.
//
// Mock support is intentionally omitted for this module — the
// generic mock shapes don't match the strict AdminProfile DTO.
// ═════════════════════════════════════════════════════════════

export const adminProfileApi = {
  getProfile: (): Promise<AdminProfile> =>
    apiClient
      .get<AdminProfile>('/admin/profile')
      .then((r) => r.data),

  updateProfile: (
    data: UpdateAdminProfileRequest,
  ): Promise<UpdateAdminProfileResponse> =>
    apiClient
      .put<UpdateAdminProfileResponse>('/admin/profile', data)
      .then((r) => r.data),

  changePassword: (
    data: ChangeAdminPasswordRequest,
  ): Promise<ChangeAdminPasswordResponse> =>
    apiClient
      .put<ChangeAdminPasswordResponse>('/admin/profile/password', data)
      .then((r) => r.data),

  getActivityStats: (): Promise<AdminActivityStats> =>
    apiClient
      .get<AdminActivityStats>('/admin/profile/activity')
      .then((r) => r.data),
};