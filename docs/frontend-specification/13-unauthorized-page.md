# frontend-specification/13-unauthorized-page.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND UNAUTHORIZED PAGE SPECIFICATION

## 1. Overview

This document defines the frontend implementation for the Unauthorized page, which is displayed when a user attempts to access a route they do not have permission to view (e.g., a staff member trying to access an admin-only route).

**Purpose:** Provide a clear, user-friendly error page that informs users they don't have access to the requested resource and guides them back to their appropriate dashboard.

---

## 2. Route

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/unauthorized` | `UnauthorizedPage` | `PublicLayout` | None (public) |

---

## 3. Types

```typescript
// src/types/common.types.ts

export interface UnauthorizedPageProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}
```

---

## 4. Component

### UnauthorizedPage

**Purpose:** Display an unauthorized access message with navigation options

**Props:**

```typescript
interface UnauthorizedPageProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}
```

**Behavior:**
- Displays a clear "Access Denied" message
- Shows the user's current role (Staff/Admin)
- Provides a button to navigate back to the appropriate dashboard
- Uses the `PublicLayout` (minimal layout without sidebar/navigation)
- Auto-detects user role from auth store to suggest correct redirect

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                    ⛔ Access Denied                                        │
│                                                                             │
│                    You do not have permission to view this page.           │
│                                                                             │
│                    ┌─────────────────────────────────────────────────────┐ │
│                    │  👤 Staff User                                     │ │
│                    │  You are logged in as a Staff member.              │ │
│                    │  This area is restricted to Administrators only.   │ │
│                    └─────────────────────────────────────────────────────┘ │
│                                                                             │
│                    [Return to Dashboard]                                    │
│                                                                             │
│                    If you believe this is an error, please contact your    │
│                    system administrator.                                   │
│                                                                             │
│                    Palliative Care System v1.0                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/pages/UnauthorizedPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface UnauthorizedPageProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  message,
  redirectPath,
  redirectLabel,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getDefaultRedirect = () => {
    if (user?.type === 'admin') {
      return '/admin';
    }
    return '/dashboard';
  };

  const defaultMessage = user?.type === 'admin'
    ? 'You do not have permission to view this page as an Administrator.'
    : 'This area is restricted to Administrators only.';

  const defaultRedirectLabel = user?.type === 'admin'
    ? 'Return to Admin Dashboard'
    : 'Return to Staff Dashboard';

  const handleRedirect = () => {
    const path = redirectPath || getDefaultRedirect();
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">⛔</div>
          <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
          <CardDescription>
            {message || defaultMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">👤 Current User:</span>
              <span>{user?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">🔑 Role:</span>
              <span className="capitalize">{user?.type || 'Unknown'}</span>
            </div>
            {user?.type === 'staff' && (
              <div className="mt-2 text-muted-foreground text-xs">
                Staff members can access patient management features from the dashboard.
              </div>
            )}
            {user?.type === 'admin' && (
              <div className="mt-2 text-muted-foreground text-xs">
                Administrators have full system access.
              </div>
            )}
          </div>

          <Button
            onClick={handleRedirect}
            className="w-full"
          >
            {redirectLabel || defaultRedirectLabel}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            If you believe this is an error, please contact your system administrator.
          </p>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            Palliative Care System v1.0
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 5. Route Guard Integration

### ProtectedRoute (Updated)

The `ProtectedRoute` should redirect unauthorized role attempts to the Unauthorized page instead of silently redirecting to the dashboard.

**Current Behavior:**
```typescript
// Current - silently redirects
if (user?.type === 'admin' && window.location.pathname.startsWith('/dashboard')) {
  return <Navigate to="/admin" replace />;
}
```

**Updated Behavior:**
```typescript
// src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Staff trying to access admin routes → Unauthorized
  if (user?.type === 'staff' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Admin trying to access staff-only routes → Unauthorized
  if (user?.type === 'admin' && window.location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

---

## 6. Admin Route Protection

### Admin Routes Wrapper

For routes that should only be accessible by admins, use a dedicated wrapper:

```typescript
// src/routes/AdminRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.type !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

### Staff Route Protection

```typescript
// src/routes/StaffRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const StaffRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.type !== 'staff') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

---

## 7. Route Configuration (Updated)

```typescript
// src/routes/index.tsx

import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { StaffRoute } from './StaffRoute';
import { PublicRoute } from './PublicRoute';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/resend-verification',
        element: <ResendVerificationPage />,
      },
    ],
  },

  // Unauthorized page (public)
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      // Admin routes
      {
        element: <AdminRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/patients', element: <AdminPatientListPage /> },
              { path: '/admin/patients/:patientId', element: <AdminPatientDetailPage /> },
              { path: '/admin/staff', element: <StaffManagementPage /> },
              { path: '/admin/referrals', element: <ReferralManagementPage /> },
              { path: '/admin/reports', element: <ReportsPage /> },
              { path: '/admin/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },

      // Staff routes
      {
        element: <StaffRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/patients', element: <PatientListPage /> },
              { path: '/patients/new', element: <PatientRegistrationPage /> },
              { path: '/patients/:patientId', element: <PatientDetailPage /> },
              { path: '/patients/:patientId/summary', element: <PatientSummaryPage /> },
              { path: '/patients/:patientId/progress', element: <PatientProgressPage /> },
              { path: '/patients/:patientId/visits', element: <RecordVisitPage /> },
              { path: '/patients/:patientId/medications', element: <OrderMedicationPage /> },
              { path: '/patients/:patientId/labs', element: <OrderLabPage /> },
              { path: '/patients/:patientId/referrals', element: <RequestReferralPage /> },
              { path: '/patients/:patientId/admissions', element: <RecordAdmissionPage /> },
            ],
          },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

---

## 8. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNAUTHORIZED ACCESS FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    USER ATTEMPTS ACCESS                             │  │
│  │                                                                      │  │
│  │  Staff user tries to visit /admin                                   │  │
│  │  Admin user tries to visit /dashboard                              │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    PROTECTED ROUTE CHECK                           │  │
│  │                                                                      │  │
│  │  ProtectedRoute checks user type:                                   │  │
│  │    - If staff → /admin → Redirect to /unauthorized                  │  │
│  │    - If admin → /dashboard → Redirect to /unauthorized              │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    UNAUTHORIZED PAGE                               │  │
│  │                                                                      │  │
│  │  Displays:                                                           │  │
│  │    - "Access Denied" message                                        │  │
│  │    - User's name and role                                           │  │
│  │    - Explanation of why access is denied                            │  │
│  │    - "Return to Dashboard" button                                   │  │
│  │                                                                      │  │
│  │  User clicks button → Navigates to appropriate dashboard            │  │
│  │    - Staff → /dashboard                                             │  │
│  │    - Admin → /admin                                                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Summary of Changes

| Change | Before | After |
|---|---|---|
| Unauthorized page | Not available | Added `UnauthorizedPage` component |
| Route protection | Silent redirect to dashboard | Redirect to `/unauthorized` with explanation |
| AdminRoute | Not available | Added dedicated admin route wrapper |
| StaffRoute | Not available | Added dedicated staff route wrapper |
| User feedback | Confusing role-based redirects | Clear message explaining access denial |
| Navigation | Automatic redirect | User chooses to return to dashboard |
| Visual design | None | Professional card-based error page |
| Route configuration | Basic | Updated with new route wrappers |
```

---

## 10. Files to Update

| File | Action |
|---|---|
| `src/pages/UnauthorizedPage.tsx` | Create new file |
| `src/routes/ProtectedRoute.tsx` | Update with unauthorized redirect |
| `src/routes/AdminRoute.tsx` | Create new file |
| `src/routes/StaffRoute.tsx` | Create new file |
| `src/routes/index.tsx` | Update with new routes |
| `src/types/common.types.ts` | Add UnauthorizedPageProps |
| `frontend-specification/12-unauthorized-page.md` | Create this document |