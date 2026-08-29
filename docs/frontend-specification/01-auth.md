# frontend-specification/01-auth.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND AUTH SPECIFICATION

## 1. Overview

This document defines the frontend implementation for authentication features including registration, email verification, login, logout, and user session management.

**API Reference:** `api/01-auth.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/login` | `LoginPage` | `AuthLayout` | None (Public) |
| `/register` | `RegisterPage` | `AuthLayout` | None (Public) |
| `/verify-email` | `VerifyEmailPage` | `PublicLayout` | None (Public) |
| `/resend-verification` | `ResendVerificationPage` | `PublicLayout` | None (Public) |

---

## 3. Types

```typescript
// src/types/auth.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse';
  type: 'staff' | 'admin';
  status?: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface VerifyEmailResponse {
  email: string;
  isEmailVerified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  email: string;
}
```

---

## 4. API Calls

```typescript
// src/api/auth.ts

import api from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
} from '@/types/auth.types';

export const authApi = {
  /**
   * Register new staff member
   * POST /auth/register
   */
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/auth/register', data).then((res) => res.data);
  },

  /**
   * Verify email address
   * GET /auth/verify-email
   */
  verifyEmail: (token: string): Promise<VerifyEmailResponse> => {
    return api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`).then((res) => res.data);
  },

  /**
   * Resend verification email
   * POST /auth/resend-verification
   */
  resendVerification: (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    return api.post<ResendVerificationResponse>('/auth/resend-verification', data).then((res) => res.data);
  },

  /**
   * Login user (staff or admin)
   * POST /auth/login
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', data).then((res) => res.data);
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/auth/me').then((res) => res.data);
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: (): Promise<void> => {
    return api.post('/auth/logout').then((res) => res.data);
  },
};
```

---

## 5. Store

```typescript
// src/store/auth.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## 6. Hooks

```typescript
// src/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';

/**
 * Register new staff member
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

/**
 * Verify email address
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

/**
 * Resend verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.resendVerification(data),
  });
}

/**
 * Login user and redirect based on role
 */
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response;
      setAuth(user, token);

      // Redirect based on user type
      if (user.type === 'admin') {
        navigate('/admin');
      } else if (user.type === 'staff') {
        navigate('/dashboard');
      }
    },
  });
}

/**
 * Logout user and redirect to login
 */
export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}

/**
 * Get current authenticated user
 */
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
```

---

## 7. Pages

### 7.1 LoginPage

**Route:** `/login`

**Layout:** `AuthLayout`

**Guard:** `PublicRoute` (redirects to dashboard if already authenticated)

**Purpose:** User login page for both staff and admin

**Local State:** React Hook Form state (email, password)

**Behavior:**

1. Renders email and password fields
2. Client-side validation with Zod
3. On submit, calls `useLogin()` mutation
4. On success, redirects based on user role (admin → /admin, staff → /dashboard)
5. On error, displays form-level error message

**Error Messages:**

| Error | Display Message |
|---|---|
| Invalid credentials | "Invalid email or password" |
| Email not verified | "Please verify your email before logging in" |
| Account pending | "Account pending admin approval" |
| Account rejected | "Account has been rejected" |

**Components:**

- `Input` (email, password)
- `Button` (submit)
- `Link` (to registration page)
- `Link` (to resend verification page)

**Form Validation Schema:**

```typescript
// src/schemas/auth.schema.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

---

### 7.2 RegisterPage

**Route:** `/register`

**Layout:** `AuthLayout`

**Guard:** `PublicRoute` (redirects to dashboard if already authenticated)

**Purpose:** Staff registration page

**Local State:** React Hook Form state (name, email, phone, password, confirmPassword)

**Behavior:**

1. Renders name, email, phone, password, and confirm password fields
2. Client-side validation with Zod
3. On submit, calls `useRegister()` mutation
4. On success, shows success message and redirects to login
5. On error, displays field-specific or form-level error messages

**Error Messages:**

| Error | Display Message |
|---|---|
| Email already exists | "Email already registered" |
| Validation error | Field-specific errors |

**Success Message:**

"Registration successful! Please check your email to verify your account. Redirecting to login..."

**Components:**

- `Input` (name, email, phone, password, confirm password)
- `Button` (submit)
- `Link` (to login page)

---

### 7.3 VerifyEmailPage

**Route:** `/verify-email`

**Layout:** `PublicLayout`

**Guard:** None (Public)

**Purpose:** Email verification page

**Behavior:**

1. Reads `token` from URL query parameter
2. Calls `useVerifyEmail()` mutation
3. Displays success or error message
4. Provides link to login or resend verification

**States:**

| State | UI |
|---|---|
| Loading | "Verifying your email..." |
| Success | "Email verified successfully! Please wait for admin approval." + Login link |
| Invalid Token | "Invalid verification link." + Resend link |
| Expired Token | "Verification link has expired." + Resend link |
| Already Verified | "Email already verified. Please login." + Login link |

---

### 7.4 ResendVerificationPage

**Route:** `/resend-verification`

**Layout:** `PublicLayout`

**Guard:** None (Public)

**Purpose:** Resend verification email

**Local State:** React Hook Form state (email)

**Behavior:**

1. Renders email field
2. Client-side validation with Zod
3. On submit, calls `useResendVerification()` mutation
4. On success, shows success message
5. On error, displays error message

**Error Messages:**

| Error | Display Message |
|---|---|
| Email not found | "No account found with this email" |
| Already verified | "Email already verified. Please login." |
| Too many requests | "Please wait before requesting another email" |

**Success Message:**

"Verification email sent. Please check your inbox."

---

## 8. Route Guards

### 8.1 ProtectedRoute

**Purpose:** Protect routes that require authentication

**Behavior:**

1. Check if user is authenticated from store
2. If not authenticated, redirect to /login
3. If authenticated, check user role for route
4. If admin tries to access staff route, redirect to /admin
5. If staff tries to access admin route, redirect to /dashboard

---

### 8.2 PublicRoute

**Purpose:** Protect routes that should not be accessible when authenticated

**Behavior:**

1. Check if user is authenticated from store
2. If authenticated, redirect to appropriate dashboard based on role
3. If not authenticated, render child routes

---

## 9. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW (FRONTEND)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    REGISTRATION FLOW                                 │  │
│  │                                                                      │  │
│  │  User → /register → RegisterPage → Fill form → Submit               │  │
│  │                              ↓                                       │  │
│  │                    useRegister() → POST /auth/register               │  │
│  │                              ↓                                       │  │
│  │                    Success → Show success message                    │  │
│  │                              ↓                                       │  │
│  │                    Redirect to /login after 3s                       │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    EMAIL VERIFICATION FLOW                           │  │
│  │                                                                      │  │
│  │  User clicks email link → /verify-email?token=xxx                   │  │
│  │                              ↓                                       │  │
│  │                    useVerifyEmail() → GET /auth/verify-email         │  │
│  │                              ↓                                       │  │
│  │                    Success → Show verification success               │  │
│  │                    Error → Show verification error                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    LOGIN FLOW                                        │  │
│  │                                                                      │  │
│  │  User → /login → LoginPage → Fill form → Submit                     │  │
│  │                              ↓                                       │  │
│  │                    useLogin() → POST /auth/login                     │  │
│  │                              ↓                                       │  │
│  │                    Response: { token, user }                         │  │
│  │                              ↓                                       │  │
│  │                    Store token & user in Zustand (persisted)         │  │
│  │                              ↓                                       │  │
│  │                    Redirect based on user.type:                      │  │
│  │                    admin → /admin   staff → /dashboard               │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SESSION MANAGEMENT                                │  │
│  │                                                                      │  │
│  │  ProtectedRoute → Checks isAuthenticated from store                  │  │
│  │                    ↓                                                 │  │
│  │  If not authenticated → Redirect to /login                           │  │
│  │  If authenticated → Render child routes                             │  │
│  │  If wrong role → Redirect to correct dashboard                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    LOGOUT FLOW                                       │  │
│  │                                                                      │  │
│  │  User clicks Logout → useLogout() → POST /auth/logout               │  │
│  │                              ↓                                       │  │
│  │                    Clear token & user from store                     │  │
│  │                              ↓                                       │  │
│  │                    Redirect to /login                                │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

