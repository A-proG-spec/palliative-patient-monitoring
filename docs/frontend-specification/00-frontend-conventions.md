# frontend-specification/00-frontend-conventions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND CONVENTIONS

## 1. Overview

This document defines the shared conventions, architecture, and patterns used throughout the frontend application.

**Technology Stack:**
- React 18+ with TypeScript
- Vite (Build Tool)
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- Zustand (State Management)
- React Hook Form + Zod
- Recharts (for graphs)
- Sonner (Toast Notifications)

**Folder Structure Reference:**
See `folder-structure/frontend-structure.md` for the complete file and folder organization.

---

## 2. Core Architecture

### 2.1 Route Categories

The application has three route categories:

| Category | Guard | Layout | Applies To |
|---|---|---|---|
| Public (no auth) | None | `PublicLayout` | Landing Page |
| Auth Pages | `PublicRoute` | `AuthLayout` | Login, Register |
| Authenticated | `ProtectedRoute` | `DashboardLayout` | All admin and staff pages |
| Print | `ProtectedRoute` | `PrintLayout` | Print views (minimal UI) |

### 2.2 Role-Based Routing

Based on the `user.type` from the login response:

| User Type | Redirect To | Layout |
|---|---|---|
| `admin` | `/admin` | `DashboardLayout` with admin sidebar |
| `staff` | `/dashboard` | `DashboardLayout` with staff sidebar |

### 2.3 State Management Split

| State Type | Tool | Description |
|---|---|---|
| Server State | TanStack Query | API data, caching, pagination |
| Client State | Zustand | Auth state (token, user) |
| Form State | React Hook Form | Form validation and submission |
| UI State | useState / URL | Local UI state, filters, pagination |

---

## 3. API Layer

### 3.1 API File Structure

All API calls are organized by feature in the `src/api/` folder:

| File | Purpose |
|---|---|
| `client.ts` | Axios instance configuration with interceptors |
| `auth.ts` | Authentication API calls (register, login, logout, get user) |
| `profile.ts` | Profile API calls (get profile, update profile, change password, activity stats) |
| `patients.ts` | Patient API calls (CRUD operations, print/export) |
| `visits.ts` | Home visit API calls |
| `signatures.ts` | Digital signature API calls |
| `medications.ts` | Medication API calls |
| `labs.ts` | Laboratory test API calls |
| `referrals.ts` | Referral API calls |
| `admissions.ts` | Hospital admission API calls |
| `admin.ts` | Admin API calls (staff approval, dashboard stats, notifications, full patient detail, visit edit, admission edit, print/export) |
| `staff.ts` | Staff API calls (dashboard stats, alerts, profile) |
| `index.ts` | API exports |

### 3.2 Axios Instance (`src/api/client.ts`)

```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - unwrap data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// For blob responses (PDF export), don't unwrap
api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### 3.3 API Call Pattern

Each API file exports an object with methods that call the backend endpoints:

```typescript
// Example: src/api/auth.ts

import api from './client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth.types';

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/auth/register', data).then((res) => res.data);
  },

  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', data).then((res) => res.data);
  },

  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/auth/me').then((res) => res.data);
  },

  logout: (): Promise<void> => {
    return api.post('/auth/logout').then((res) => res.data);
  },
};
```

---

## 4. Type Definitions

### 4.1 Auth Types (`src/types/auth.types.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse';
  type: 'staff' | 'admin';
  status?: 'Pending' | 'Active' | 'Rejected';
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
  createdAt: string;
}
```

### 4.2 Patient Progress Types (`src/types/patient.types.ts`)

```typescript
export interface ProgressDataPoint {
  visitId: string;
  visitDate: string;
  kpsScore: number;
  ppsScore: number;
}

export interface PatientProgressData {
  patientId: string;
  patientName: string;
  visits: ProgressDataPoint[];
  trends: {
    kps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
    pps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
  };
}
```

### 4.3 Print Types (`src/types/print.types.ts`)

```typescript
export interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export interface PrintLayoutProps {
  children: React.ReactNode;
}
```

### 4.4 Toast Types (`src/types/toast.types.ts`)

```typescript
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  description?: string;
}
```

---

## 5. Graph Component for KPS/PPS Tracking

### 5.1 PatientProgressGraph Component

**Purpose:** Display KPS and PPS scores over time for a patient across multiple visits.

**Props:**

```typescript
interface PatientProgressGraphProps {
  patientName: string;
  data: ProgressDataPoint[];
  loading?: boolean;
  trends?: {
    kps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
    pps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
  };
  isPrintView?: boolean; // Disables interactivity for print
}
```

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Patient Progress: Sarah Johnson                                           │
│  KPS (Karnofsky Performance Score) & PPS (Palliative Performance Scale)   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Score                                                                      │
│  100 ┤                                                                      │
│   90 ┤                    ╭──────╮                                         │
│   80 ┤          ╭─────────╯      │                                         │
│   70 ┤    ╭─────╯               ╰──────╮                                  │
│   60 ┤────╯                             ╰─────────                        │
│   50 ┤                                                                      │
│   40 ┤                                                                      │
│   30 ┤                                                                      │
│   20 ┤                                                                      │
│   10 ┤                                                                      │
│    0 ┼────────┬────────┬────────┬────────┬────────┬────────┬────────────── │
│       Visit 1  Visit 2  Visit 3  Visit 4  Visit 5  Visit 6  Visit 7        │
│       08/01    08/08    08/15    08/22    08/29    09/05    09/12           │
│                                                                             │
│  ─── KPS Score (60 → 55 → 50 → 45 → 40 → 35)                              │
│  ─── PPS Score (70 → 65 → 60 → 55 → 50 → 45)                              │
│                                                                             │
│  Legend:                                                                    │
│  ● KPS (Karnofsky Performance Score) - Measures functional independence   │
│  ● PPS (Palliative Performance Scale) - Measures overall performance      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Graph Hook (`src/hooks/usePatientProgress.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { patientApi } from '@/api/patients';

export function usePatientProgress(patientId: string) {
  return useQuery({
    queryKey: ['patient-progress', patientId],
    queryFn: () => patientApi.getProgress(patientId),
    enabled: !!patientId,
  });
}
```

---

## 6. Print/Export Conventions

### 6.1 Print Layout

A minimal layout for print views that hides all navigation, sidebars, and interactive elements:

```typescript
// src/components/layouts/PrintLayout.tsx

import React from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ children }) => {
  return (
    <div className="print-layout min-h-screen bg-white">
      {children}
    </div>
  );
};
```

### 6.2 Print Button Component

Reusable print button that triggers patient history print:

```typescript
// src/components/common/PrintButton.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  patientId,
  patientName,
  variant = 'button',
  label = 'Print Patient History',
  onPrintStart,
  onPrintComplete,
}) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    onPrintStart?.();
    navigate(`/patients/${patientId}/print`);
    onPrintComplete?.();
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrint}
        title={label}
        className="no-print"
      >
        <Printer className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="no-print"
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};
```

### 6.3 Print Styles (Global)

```css
/* src/styles/print.css */

@media print {
  /* Hide non-print elements */
  .no-print {
    display: none !important;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 20mm;
  }

  /* Ensure all content is visible */
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  }

  /* Preserve colors in print */
  .print-color {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Preserve background colors */
  .print-bg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* Card styling in print */
  .print-card {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  /* Header styling */
  .print-header {
    text-align: center;
    border-bottom: 2px solid #002395;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .print-header h1 {
    color: #002395;
    font-size: 20pt;
    margin: 0;
  }

  .print-header .subtitle {
    font-size: 12pt;
    color: #555;
  }

  /* Section styling */
  .print-section {
    margin-bottom: 16px;
  }

  .print-section h2 {
    font-size: 14pt;
    color: #002395;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }

  .print-section h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #1f2937;
    margin: 6px 0;
  }

  /* Field labels */
  .print-label {
    font-weight: 600;
    color: #4b5563;
  }

  /* Data table styling */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }

  .print-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  .print-table td {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  /* Status badges */
  .print-badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 9pt;
    font-weight: 500;
  }

  .print-badge-active {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-discharged {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .print-badge-ordered {
    background-color: #fef3c7;
    color: #92400e;
  }

  .print-badge-given {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-pending {
    background-color: #fef3c7;
    color: #92400e;
  }

  .print-badge-accepted {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-declined {
    background-color: #fce4ec;
    color: #b71c1c;
  }

  /* Footer */
  .print-footer {
    text-align: center;
    font-size: 9pt;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 20px;
  }

  /* Force page breaks */
  .page-break {
    page-break-before: always;
  }

  /* Graph container */
  .print-graph {
    width: 100%;
    max-width: 100%;
    margin: 8px 0;
  }

  /* Avoid breaking inside */
  .print-avoid-break {
    page-break-inside: avoid;
  }
}
```

### 6.4 Print Component Guidelines

| Rule | Description |
|---|---|
| `no-print` class | Add to any element that should be hidden in print (buttons, navigation, sidebars) |
| `print-color` class | Add to elements that need to preserve colors (badges, status indicators) |
| `print-bg` class | Add to elements that need to preserve background colors |
| `print-card` class | For card-like containers in print view |
| `print-header` class | For the institution header |
| `print-section` class | For each data section (Demographics, Visits, Medications, etc.) |
| `print-table` class | For data tables |
| `print-badge-*` classes | For status badges with color coding |
| `page-break` class | Force a page break before an element |
| `print-avoid-break` class | Prevent page break inside an element |

---

## 7. Toast Notifications Conventions

### 7.1 Overview

Toast notifications provide real-time feedback for user actions.

**Library:** `sonner`

### 7.2 Toast Types

| Type | Color | Duration | Usage |
|---|---|---|---|
| Success | Green (#43B982) | 3000ms | Operation completed successfully |
| Error | Red (#E74F3D) | 5000ms | Operation failed |
| Warning | Amber (#F5A34A) | 4000ms | User needs attention |
| Info | Blue (#002395) | 3000ms | Informational message |
| Loading | Gray (#6B7280) | Until resolved | Operation in progress |

### 7.3 Toast Utility

```typescript
// src/lib/toast.ts

import { toast } from 'sonner';

export const toastUtils = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (id: string | number) => {
    toast.dismiss(id);
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

export default toastUtils;
```

### 7.4 Toast Usage in Hooks

```typescript
// Example: src/hooks/useAuth.ts

import { toastUtils } from '@/lib/toast';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response;
      setAuth(user, token);
      toastUtils.success('Login successful', `Welcome back, ${user.name}!`);
      // ... redirect
    },
    onError: (error: any) => {
      toastUtils.error('Login failed', error.response?.data?.message);
    },
  });
}
```

### 7.5 Toast Provider Setup

```typescript
// src/App.tsx

import { Toaster } from 'sonner';
import '@/styles/globals.css';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        visibleToasts={5}
        toastOptions={{
          style: {
            fontFamily: 'Outfit, system-ui, sans-serif',
            borderRadius: '8px',
          },
        }}
      />
      <Router />
    </>
  );
}
```

---

## 8. Route Guards

### 8.1 ProtectedRoute.tsx

```typescript
// src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user?.type === 'admin' && window.location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.type === 'staff' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
```

---

## 9. Component Reusability Guidelines

### 9.1 When to Create a UI Component

- Used in multiple places
- Has consistent styling
- Is generic (button, input, card)

### 9.2 When to Create a Feature Component

- Specific to a feature (patient card, visit form)
- Contains business logic
- Fetches or manipulates data

### 9.3 When to Create a Page

- Represents a route
- Composes multiple components
- Owns the state for that view

---

## 10. Error Handling Strategy

| Error Type | Handling | Toast Type |
|---|---|---|
| API Validation (400) | Display field-specific errors | Warning |
| Unauthorized (401) | Redirect to login + toast | Error |
| Forbidden (403) | Show permission error + toast | Error |
| Not Found (404) | Show 404 page or component | Warning |
| Server Error (500) | Show generic error with retry + toast | Error |
| Network Error | Show offline/connection error + toast | Error |
| Success | Show success message | Success |
| Info | Show informational message | Info |

---

## 11. Performance Optimizations

| Strategy | Implementation |
|---|---|
| Code Splitting | Lazy load pages with React.lazy |
| Data Caching | TanStack Query cache with staleTime |
| Pagination | Fetch only needed data |
| Debouncing | Search inputs |
| Memoization | useMemo, useCallback, React.memo |

---

## 12. Naming Conventions

| File Type | Naming Convention | Example |
|---|---|---|
| Pages | `*Page.tsx` | `LoginPage.tsx` |
| Components | `PascalCase.tsx` | `PatientCard.tsx` |
| Hooks | `use*.ts` | `usePatients.ts` |
| Types | `*.types.ts` | `patient.types.ts` |
| Constants | `*.ts` (index) | `index.ts` |
| Styles | `*.css` | `globals.css`, `print.css` |
| Tests | `*.test.tsx` | `LoginPage.test.tsx` |

---

## 13. Route Summary (UPDATED)

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/` | `LandingPage` | `PublicLayout` | None |
| `/login` | `LoginPage` | `AuthLayout` | None |
| `/register` | `RegisterPage` | `AuthLayout` | None |
| `/verify-email` | `VerifyEmailPage` | `PublicLayout` | None |
| `/resend-verification` | `ResendVerificationPage` | `PublicLayout` | None |
| `/unauthorized` | `UnauthorizedPage` | `PublicLayout` | None |
| `/admin` | `AdminDashboardPage` | `DashboardLayout` | Admin |
| `/admin/patients` | `AdminPatientListPage` | `DashboardLayout` | Admin |
| `/admin/patients/:id` | `AdminPatientDetailPage` | `DashboardLayout` | Admin |
| `/admin/patients/:id/print` | `AdminPatientPrintPage` | `PrintLayout` | Admin |
| `/admin/staff` | `StaffManagementPage` | `DashboardLayout` | Admin |
| `/admin/referrals` | `ReferralManagementPage` | `DashboardLayout` | Admin |
| `/admin/reports` | `ReportsPage` | `DashboardLayout` | Admin |
| `/admin/settings` | `SettingsPage` | `DashboardLayout` | Admin |
| `/dashboard` | `DashboardPage` | `DashboardLayout` | Staff |
| `/profile` | `ProfilePage` | `DashboardLayout` | Staff, Admin |
| `/patients` | `PatientListPage` | `DashboardLayout` | Staff |
| `/patients/new` | `PatientRegistrationPage` | `DashboardLayout` | Staff |
| `/patients/:id` | `PatientDetailPage` | `DashboardLayout` | Staff |
| `/patients/:id/summary` | `PatientSummaryPage` | `DashboardLayout` | Staff |
| `/patients/:id/progress` | `PatientProgressPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/medications` | `OrderMedicationPage` | `DashboardLayout` | Staff |
| `/patients/:id/labs` | `OrderLabPage` | `DashboardLayout` | Staff |
| `/patients/:id/referrals` | `RequestReferralPage` | `DashboardLayout` | Staff |
| `/patients/:id/admissions` | `RecordAdmissionPage` | `DashboardLayout` | Staff |
| `/patients/:id/print` | `PatientPrintPage` | `PrintLayout` | Staff, Admin |
| `*` | `NotFoundPage` | None | None |

