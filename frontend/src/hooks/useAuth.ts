import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import type { LoginRequest, RegisterRequest, UpdateStaffProfileRequest } from '@/types/auth.types';
import { useToast } from '@/context/ToastContext';

export function useRegister() {
  return useMutation({ 
    mutationFn: (data: RegisterRequest) => authApi.register(data) 
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: (token: string) => authApi.verifyEmail(token) });
}

export function useResendVerification() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.resendVerification(data),
    onSuccess: () => {
      toast.success('Verification email sent. Please check your inbox.');
    },
    onError: () => {
      toast.error('Failed to resend verification email. Please try again.');
    },
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      toast.success('Login successful', `Welcome back, ${response.user.name}!`);
      if (response.user.type === 'admin') navigate('/admin');
      else navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid email or password';
      // Toast is shown inline in the login form
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      toast.info('Logged out successfully');
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    onSuccess: () => {
      setInitialized();
    },
    onError: () => {
      // If token is invalid, clear auth state
      useAuthStore.getState().logout();
      setInitialized();
    },
  });
}

export function useStaffProfile() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => authApi.getStaffProfile(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: UpdateStaffProfileRequest) => authApi.updateProfile(data),
    onSuccess: (response) => {
      updateUser({ name: response.name, phone: response.phone });
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Profile updated successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile.';
      toast.error('Update failed', message);
    },
  });
}