import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProfileApi } from '@/api/admin-profile.api';
import type {
  UpdateAdminProfileRequest,
  ChangeAdminPasswordRequest,
} from '@/types/admin-profile.types';
import { useToast } from '@/context/ToastContext';
import { useAuthStore } from '@/store/auth.store';

// ─────────────────────────────────────────────────────────────
// GET /admin/profile
// ─────────────────────────────────────────────────────────────

export function useAdminProfile() {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => adminProfileApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /admin/profile
// ─────────────────────────────────────────────────────────────

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: UpdateAdminProfileRequest) =>
      adminProfileApi.updateProfile(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });

      // Mirror the change into the auth store so the sidebar's
      // displayed name stays in sync without waiting for a refresh.
      if (user) {
        updateUser({ name: response.name });
      }

      toast.success('Profile updated successfully.');
    },

    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update profile. Please try again.';
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /admin/profile/password
// ─────────────────────────────────────────────────────────────

export function useChangeAdminPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ChangeAdminPasswordRequest) =>
      adminProfileApi.changePassword(data),

    onSuccess: () => {
      toast.success('Password changed successfully.');
    },

    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to change password.';
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// GET /admin/profile/activity
// ─────────────────────────────────────────────────────────────

export function useAdminActivityStats() {
  return useQuery({
    queryKey: ['admin-profile', 'activity'],
    queryFn: () => adminProfileApi.getActivityStats(),
    staleTime: 60 * 1000,
  });
}