import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import type {
  LoginRequest,
  RegisterRequest,
  StaffRole,
} from '@/types/auth.types';
import type { UpdateProfileRequest } from '@/types/profile.types';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────────────────────
// Default route per role
//
// Note: the backend enum is `LaboratoryTechnician` (long form).
// Using the short form here would silently fall through to the
// default case and every lab tech would land on /dashboard.
// ─────────────────────────────────────────────────────────────
function getDefaultRoute(user: {
  type: string;
  role?: StaffRole | null;
}): string {
  if (user.type === 'admin') return '/admin';

  switch (user.role) {
    case 'Pharmacist':
      return '/medication-orders';
    case 'LaboratoryTechnician':
      return '/lab-requests';
    case 'Radiologist':
      return '/imaging-orders';
    case 'Physician':
    case 'Nurse':
    case 'TeamLeader':
    default:
      return '/dashboard';
  }
}

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

// ─────────────────────────────────────────────────────────────
// Verify email (OTP)
// ─────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyEmail(email, otp),
  });
}

// ─────────────────────────────────────────────────────────────
// Resend verification
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate(getDefaultRoute(response.user));
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Current user
// ─────────────────────────────────────────────────────────────
// TanStack Query v5 removed `onSuccess` / `onError` from
// useQuery — they only exist on useMutation now. We react to the
// settled state with a useEffect instead.

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Edge-case: no token at all → nothing to verify, mark init complete immediately.
  useEffect(() => {
    if (!token) {
      setInitialized();
    }
  }, [token, setInitialized]);

  useEffect(() => {
    if (query.isSuccess) {
      setInitialized();
    }
    if (query.isError) {
      // Token is invalid or expired — clear auth state and mark
      // initialization complete so the app can render login.
      useAuthStore.getState().logout();
      setInitialized();
    }
  }, [query.isSuccess, query.isError, setInitialized]);

  return query;
}

// ─────────────────────────────────────────────────────────────
// Staff profile (from /profile)
// ─────────────────────────────────────────────────────────────

export function useStaffProfile() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => authApi.getStaffProfile(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────
// Update staff profile
//
// The endpoint serves both staff and admin. The canonical request/
// response types live in `profile.types.ts`.
// ─────────────────────────────────────────────────────────────

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: (response) => {
      // The response is a Profile union — admin has no phone.
      const phone = 'phone' in response ? response.phone : undefined;
      updateUser({ name: response.name, ...(phone ? { phone } : {}) });

      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? 'Failed to update profile.';
      toast.error(message);
    },
  });
}