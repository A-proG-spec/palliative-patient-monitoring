import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile.types';
import { useToast } from '@/context/ToastContext';
import { useAuthStore } from '@/store/auth.store';

// ─────────────────────────────────────────────────────────────
// GET /profile
// ─────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /profile
// ─────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Mirror the change into the auth store so the sidebar's
      // displayed name stays in sync without waiting for a refresh.
      if (user) {
        if (response.type === 'staff') {
          updateUser({
            name: response.name,
            phone: response.phone,
          });
        } else {
          // admin has no phone field
          updateUser({ name: response.name });
        }
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
// PUT /profile/password
// ─────────────────────────────────────────────────────────────

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),

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
// GET /profile/activity
// ─────────────────────────────────────────────────────────────

export function useActivityStats() {
  return useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: () => profileApi.getActivityStats(),
    staleTime: 60 * 1000,
  });
}