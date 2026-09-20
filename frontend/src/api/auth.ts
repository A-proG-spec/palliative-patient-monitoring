import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
} from '@/types/auth.types';
import type {
  StaffProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/types/profile.types';

/**
 * Auth API — no mock branches.
 * Every call hits the real backend at VITE_API_URL (default
 * http://localhost:5000/api/v1).
 */
export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient
      .post<RegisterResponse>('/auth/register', data)
      .then((r) => r.data);
  },

  /**
   * Verify email with a 6-digit OTP.
   * Backend contract: POST /auth/verify-email  { email, otp }
   */
  verifyEmail: (email: string, otp: string): Promise<VerifyEmailResponse> => {
    return apiClient
      .post<VerifyEmailResponse>('/auth/verify-email', { email, otp })
      .then((r) => r.data);
  },

  resendVerification: (
    data: ResendVerificationRequest,
  ): Promise<ResendVerificationResponse> => {
    return apiClient
      .post<ResendVerificationResponse>('/auth/resend-verification', data)
      .then((r) => r.data);
  },

  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient
      .post<LoginResponse>('/auth/login', data)
      .then((r) => r.data);
  },

  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>('/auth/me').then((r) => r.data);
  },

  /**
   * Unified profile endpoint — serves both staff and admin.
   */
  getStaffProfile: (): Promise<StaffProfile> => {
    return apiClient.get<StaffProfile>('/profile').then((r) => r.data);
  },

  logout: (): Promise<void> => {
    return apiClient.post('/auth/logout').then((r) => r.data);
  },

  updateProfile: (
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> => {
    return apiClient
      .put<UpdateProfileResponse>('/profile', data)
      .then((r) => r.data);
  },
};