import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile.types';
import { useToast } from '@/context/ToastContext';
import { useAuthStore } from '@/store/auth.store';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (user) {
        updateUser({
          name: response.name,
          phone: response.phone,
        });
      }
      toast.success('Profile updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password.';
      toast.error('Password change failed', message);
    },
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: () => profileApi.getActivityStats(),
    staleTime: 60 * 1000,
  });
}