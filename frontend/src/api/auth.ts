import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAuthApi } from './mocks/auth.mock';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  User, StaffProfile,
  UpdateStaffProfileRequest, UpdateStaffProfileResponse,
  VerifyEmailResponse,
  ResendVerificationRequest, ResendVerificationResponse,
} from '@/types/auth.types';

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    if (USE_MOCK) return mockAuthApi.register(data);
    return apiClient.post<RegisterResponse>('/auth/register', data).then((r) => r.data);
  },

  /**
   * Verify email with a 6-digit OTP.
   * Backend contract: POST /auth/verify-email  { email, otp }
   */
  verifyEmail: (email: string, otp: string): Promise<VerifyEmailResponse> => {
    if (USE_MOCK) return mockAuthApi.verifyEmail(otp);
    return apiClient
      .post<VerifyEmailResponse>('/auth/verify-email', { email, otp })
      .then((r) => r.data);
  },

  resendVerification: (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    if (USE_MOCK) return mockAuthApi.resendVerification(data.email);
    return apiClient.post<ResendVerificationResponse>('/auth/resend-verification', data).then((r) => r.data);
  },

  login: (data: LoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) return mockAuthApi.login(data.email, data.password);
    return apiClient.post<LoginResponse>('/auth/login', data).then((r) => r.data);
  },

  getCurrentUser: (): Promise<User> => {
    if (USE_MOCK) return mockAuthApi.getCurrentUser();
    return apiClient.get<User>('/auth/me').then((r) => r.data);
  },

  /**
   * The old `/staff/me` route does not exist on the backend.
   * The unified profile endpoint serves both staff and admin.
   */
  getStaffProfile: (): Promise<StaffProfile> => {
    if (USE_MOCK) return mockAuthApi.getStaffProfile();
    return apiClient.get<StaffProfile>('/profile').then((r) => r.data);
  },

  logout: (): Promise<void> => {
    if (USE_MOCK) return mockAuthApi.logout();
    return apiClient.post('/auth/logout').then((r) => r.data);
  },

  /**
   * Update profile — routed to the unified `/profile` endpoint.
   * Note: the backend only accepts `name` and (staff only) `phone`.
   */
  updateProfile: (data: UpdateStaffProfileRequest): Promise<UpdateStaffProfileResponse> => {
    if (USE_MOCK) return mockAuthApi.updateProfile(data) as Promise<UpdateStaffProfileResponse>;
    return apiClient.put<UpdateStaffProfileResponse>('/profile', data).then((r) => r.data);
  },
};