// src/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import type {
  LoginRequest,
  RegisterRequest,
  UpdateStaffProfileRequest,
} from '@/types/auth.types';

// ─── Register ────────────────────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

// ─── Resend Verification ──────────────────────────────────────────────────────

export function useResendVerification() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.resendVerification(data),
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response;
      setAuth(user, token);
      if (user.type === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}

// ─── Current User ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Staff Profile ────────────────────────────────────────────────────────────

export function useStaffProfile() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => authApi.getStaffProfile(),
    enabled: !!token && user?.type === 'staff',
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Update Staff Profile ─────────────────────────────────────────────────────

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (data: UpdateStaffProfileRequest) => authApi.updateProfile(data),
    onSuccess: (response) => {
      if (user && token) {
        setAuth({ ...user, name: response.name, phone: response.phone }, token);
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
    },
  });
}
