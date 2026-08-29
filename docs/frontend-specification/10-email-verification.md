# frontend-specification/10-email-verification.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND EMAIL VERIFICATION SPECIFICATION

## 1. Overview

This document defines the frontend implementation for email verification features including verifying email addresses and resending verification emails.

**API Reference:** `api/01-email-verification.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/verify-email` | `VerifyEmailPage` | `PublicLayout` | None (Public) |
| `/resend-verification` | `ResendVerificationPage` | `PublicLayout` | None (Public) |

---

## 3. Types

```typescript
// src/types/auth.types.ts

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

export interface User {
  // ... existing fields
  isEmailVerified?: boolean;
}
```

---

## 4. API Calls

```typescript
// src/api/auth.ts

import api from './client';
import { 
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
} from '@/types/auth.types';

export const authApi = {
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

  // ... other auth methods
};
```

---

## 5. Hooks

```typescript
// src/hooks/useAuth.ts

import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';

/**
 * Verify email address using token
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

// ... other auth hooks
```

---

## 6. Pages

### 6.1 VerifyEmailPage

**Route:** `/verify-email`

**Layout:** `PublicLayout`

**Guard:** None (Public)

**Purpose:** Email verification page

**Local State:** None (reads token from URL)

**Behavior:**

1. Reads `token` from URL query parameter using `useSearchParams()`
2. Calls `useVerifyEmail()` mutation on mount
3. Displays loading state while verifying
4. Displays success or error message based on response
5. Provides appropriate action links (login, resend verification)

**States:**

| State | UI |
|---|---|
| Loading | "Verifying your email..." with spinner |
| Success | "Email verified successfully! Please wait for admin approval." + Login link |
| Invalid Token | "Invalid verification link." + Resend link |
| Expired Token | "Verification link has expired. Please request a new one." + Resend link |
| Already Verified | "Email already verified. Please login." + Login link |

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │                    📧 Email Verification                             │ │
│  │                                                                       │ │
│  │                    ┌─────────────────────────────────────────────┐   │ │
│  │                    │  [Loading/Status Icon]                      │   │ │
│  │                    │                                             │   │ │
│  │                    │  Verifying your email...                    │   │ │
│  │                    │  (Loading State)                            │   │ │
│  │                    └─────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │                    ✅ Email Verified                                 │ │
│  │                                                                       │ │
│  │                    Email verified successfully!                      │ │
│  │                    Please wait for admin approval.                   │ │
│  │                                                                       │ │
│  │                    [Go to Login]                                     │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │                    ❌ Verification Failed                            │ │
│  │                                                                       │ │
│  │                    Verification link has expired.                    │ │
│  │                    Please request a new one.                         │ │
│  │                                                                       │ │
│  │                    [Request New Verification Email]                  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/pages/auth/VerifyEmailPage.tsx

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmail } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Request</CardTitle>
          <CardDescription>No verification token provided.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/resend-verification">
            <Button>Request New Verification Email</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying Your Email</CardTitle>
          <CardDescription>Please wait while we verify your email address.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (verifyMutation.isSuccess) {
    const { isEmailVerified } = verifyMutation.data;

    if (isEmailVerified) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Email Verified</CardTitle>
            <CardDescription>
              Email verified successfully! Please wait for admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your email has been verified. You will be able to login once an admin approves your account.
            </p>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-blue-600">ℹ️ Already Verified</CardTitle>
          <CardDescription>Your email is already verified.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your email address has already been verified. Please login to continue.
          </p>
          <Link to="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (verifyMutation.isError) {
    const errorMessage = verifyMutation.error?.response?.data?.message || 'Verification failed.';

    const isExpired = errorMessage.includes('expired');
    const isInvalid = errorMessage.includes('Invalid');

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">
            {isExpired ? '⏰ Link Expired' : isInvalid ? '❌ Invalid Link' : '❌ Verification Failed'}
          </CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isExpired || isInvalid) && (
            <Link to="/resend-verification">
              <Button className="w-full" variant="outline">
                Request New Verification Email
              </Button>
            </Link>
          )}
          <Link to="/login">
            <Button className="w-full" variant="ghost">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
};
```

---

### 6.2 ResendVerificationPage

**Route:** `/resend-verification`

**Layout:** `PublicLayout`

**Guard:** None (Public)

**Purpose:** Resend verification email page

**Local State:** React Hook Form state (email)

**Behavior:**

1. Renders email field
2. Client-side validation with Zod
3. On submit, calls `useResendVerification()` mutation
4. On success, shows success message
5. On error, displays error message

**Validation Schema:**

```typescript
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

**States:**

| State | UI |
|---|---|
| Idle | Form fields enabled, submit button enabled |
| Submitting | Submit button disabled, loading spinner |
| Error | Form-level error message displayed |
| Success | Success message displayed |

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │                    📧 Resend Verification Email                      │ │
│  │                                                                       │ │
│  │                    Enter your email address to receive a new         │ │
│  │                    verification link.                                │ │
│  │                                                                       │ │
│  │                    ┌─────────────────────────────────────────────┐   │ │
│  │                    │  Email Address                              │   │ │
│  │                    │  ┌─────────────────────────────────────────┐ │   │ │
│  │                    │  │  john@example.com                       │ │   │ │
│  │                    │  └─────────────────────────────────────────┘ │   │ │
│  │                    └─────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │                    ┌─────────────────────────────────────────────┐   │ │
│  │                    │  [Send Verification Email]                 │   │ │
│  │                    └─────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │                    Back to Login                                     │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/pages/auth/ResendVerificationPage.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useResendVerification } from '@/hooks/useAuth';
import { resendVerificationSchema, ResendVerificationFormData } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const ResendVerificationPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const resendMutation = useResendVerification();

  const onSubmit = (data: ResendVerificationFormData) => {
    resendMutation.mutate(data, {
      onError: (error: any) => {
        const message = error.response?.data?.message;
        if (message) {
          setError('root', { message });
        } else {
          setError('root', { message: 'Failed to send verification email. Please try again.' });
        }
      },
    });
  };

  if (resendMutation.isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">✅ Email Sent</CardTitle>
          <CardDescription>
            Verification email sent. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A new verification link has been sent to your email address.
            Please check your inbox (and spam folder) and click the link to verify your account.
          </p>
          <Link to="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Resend Verification Email</CardTitle>
        <CardDescription>
          Enter your email address to receive a new verification link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              disabled={resendMutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? 'Sending...' : 'Send Verification Email'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
```

---

## 7. Form Validation Schema

```typescript
// src/schemas/auth.schema.ts

import { z } from 'zod';

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;
```

---

## 8. Route Configuration

```typescript
// src/routes/index.tsx

{
  element: <PublicRoute />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: withSuspense(LoginPage) },
        { path: '/register', element: withSuspense(RegisterPage) },
      ],
    },
    {
      element: <PublicLayout />,
      children: [
        { path: '/verify-email', element: withSuspense(VerifyEmailPage) },
        { path: '/resend-verification', element: withSuspense(ResendVerificationPage) },
      ],
    },
  ],
}
```

---

## 9. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               EMAIL VERIFICATION FLOW (FRONTEND)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    VERIFICATION FLOW                                 │  │
│  │                                                                      │  │
│  │  User receives email → Clicks verification link                     │  │
│  │         ↓                                                            │  │
│  │  /verify-email?token=xxx → VerifyEmailPage                          │  │
│  │         ↓                                                            │  │
│  │  useVerifyEmail(token) → GET /auth/verify-email?token=xxx          │  │
│  │         ↓                                                            │  │
│  │  Success → Show "Email verified" message + Login link               │  │
│  │  Expired → Show "Link expired" message + Resend link                │  │
│  │  Invalid → Show "Invalid link" message + Resend link                │  │
│  │  Already Verified → Show "Already verified" message + Login link    │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    RESEND VERIFICATION FLOW                          │  │
│  │                                                                      │  │
│  │  User navigates to /resend-verification                             │  │
│  │         ↓                                                            │  │
│  │  ResendVerificationPage → Fill email → Submit                       │  │
│  │         ↓                                                            │  │
│  │  useResendVerification({ email }) → POST /auth/resend-verification  │  │
│  │         ↓                                                            │  │
│  │  Success → Show "Email sent" message + Login link                   │  │
│  │  Error → Display error message                                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
