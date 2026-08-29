// src/api/auth.ts
// Endpoints: POST /auth/register, GET /auth/verify-email, POST /auth/resend-verification,
//            POST /auth/login, GET /auth/me, POST /auth/logout,
//            GET /staff/me, PUT /staff/me

import api from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  StaffProfile,
  UpdateStaffProfileRequest,
  UpdateStaffProfileResponse,
} from '@/types/auth.types';

export const authApi = {
  /** POST /auth/register */
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    api.post<RegisterResponse>('/auth/register', data).then((res) => res.data),

  /** GET /auth/verify-email?token=xxx */
  verifyEmail: (token: string): Promise<VerifyEmailResponse> =>
    api
      .get<VerifyEmailResponse>(`/auth/verify-email`, { params: { token } })
      .then((res) => res.data),

  /** POST /auth/resend-verification */
  resendVerification: (
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> =>
    api
      .post<ResendVerificationResponse>('/auth/resend-verification', data)
      .then((res) => res.data),

  /** POST /auth/login */
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  /** GET /auth/me */
  getCurrentUser: (): Promise<User> =>
    api.get<User>('/auth/me').then((res) => res.data),

  /** POST /auth/logout */
  logout: (): Promise<void> =>
    api.post('/auth/logout').then((res) => res.data),

  /** GET /staff/me */
  getStaffProfile: (): Promise<StaffProfile> =>
    api.get<StaffProfile>('/staff/me').then((res) => res.data),

  /** PUT /staff/me */
  updateProfile: (
    data: UpdateStaffProfileRequest
  ): Promise<UpdateStaffProfileResponse> =>
    api
      .put<UpdateStaffProfileResponse>('/staff/me', data)
      .then((res) => res.data),
};
