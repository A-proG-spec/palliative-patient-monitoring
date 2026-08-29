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
| `patients.ts` | Patient API calls (CRUD operations) |
| `visits.ts` | Home visit API calls |
| `medications.ts` | Medication API calls |
| `labs.ts` | Laboratory test API calls |
| `referrals.ts` | Referral API calls |
| `admissions.ts` | Hospital admission API calls |
| `admin.ts` | Admin API calls (staff approval, dashboard stats, notifications) |
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

### 5.3 Graph Component Implementation

```typescript
// src/components/patients/PatientProgressGraph.tsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ProgressDataPoint {
  visitDate: string;
  kpsScore: number;
  ppsScore: number;
}

interface PatientProgressGraphProps {
  patientName: string;
  data: ProgressDataPoint[];
  loading?: boolean;
  trends?: {
    kps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
    pps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
  };
}

export const PatientProgressGraph: React.FC<PatientProgressGraphProps> = ({
  patientName,
  data,
  loading,
  trends,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading progress data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Progress Data</CardTitle>
          <CardDescription>No KPS/PPS scores have been recorded for this patient yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'stable':
        return 'bg-blue-100 text-blue-800';
      case 'declining':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendArrow = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '↑';
      case 'stable':
        return '→';
      case 'declining':
        return '↓';
      default:
        return '';
    }
  };

  const lastKps = data[data.length - 1]?.kpsScore || 0;
  const lastPps = data[data.length - 1]?.ppsScore || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Patient Progress: {patientName}</CardTitle>
            <CardDescription>
              KPS (Karnofsky Performance Score) & PPS (Palliative Performance Scale)
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>KPS: {lastKps}</span>
              {trends && (
                <Badge className={getTrendColor(trends.kps.trend)}>
                  {getTrendArrow(trends.kps.trend)} {Math.abs(trends.kps.percentageChange)}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span>PPS: {lastPps}</span>
              {trends && (
                <Badge className={getTrendColor(trends.pps.trend)}>
                  {getTrendArrow(trends.pps.trend)} {Math.abs(trends.pps.percentageChange)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="visitDate"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">
                          KPS: {payload[0]?.value}
                        </p>
                        <p className="text-sm text-green-600">
                          PPS: {payload[1]?.value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels = {
                    kpsScore: 'KPS Score',
                    ppsScore: 'PPS Score',
                  };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="3 3" label="High" />
              <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" label="Medium" />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="3 3" label="Low" />
              <Line
                type="monotone"
                dataKey="kpsScore"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ppsScore"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        {trends && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">KPS Trend</p>
                <p className="text-sm text-muted-foreground">
                  {trends.kps.trend === 'improving'
                    ? 'Patient shows improvement in functional status'
                    : trends.kps.trend === 'stable'
                    ? 'Patient\'s functional status is stable'
                    : 'Patient shows decline in functional status'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.kps.firstScore} → {trends.kps.lastScore} ({trends.kps.percentageChange}% change)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">PPS Trend</p>
                <p className="text-sm text-muted-foreground">
                  {trends.pps.trend === 'improving'
                    ? 'Patient shows improvement in overall performance'
                    : trends.pps.trend === 'stable'
                    ? 'Patient\'s overall performance is stable'
                    : 'Patient shows decline in overall performance'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.pps.firstScore} → {trends.pps.lastScore} ({trends.pps.percentageChange}% change)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">
          <p>Scores range from 0-100. Higher scores indicate better functional status.</p>
          <p>KPS: Measures functional independence | PPS: Measures overall performance</p>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 6. Route Guards

### 6.1 ProtectedRoute.tsx

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

## 7. Component Reusability Guidelines

### 7.1 When to Create a UI Component

- Used in multiple places
- Has consistent styling
- Is generic (button, input, card)

### 7.2 When to Create a Feature Component

- Specific to a feature (patient card, visit form)
- Contains business logic
- Fetches or manipulates data

### 7.3 When to Create a Page

- Represents a route
- Composes multiple components
- Owns the state for that view

---

## 8. Error Handling Strategy

| Error Type | Handling |
|---|---|
| API Validation (400) | Display field-specific errors |
| Unauthorized (401) | Redirect to login |
| Forbidden (403) | Show permission error |
| Not Found (404) | Show 404 page or component |
| Server Error (500) | Show generic error with retry |
| Network Error | Show offline/connection error |

---

## 9. Performance Optimizations

| Strategy | Implementation |
|---|---|
| Code Splitting | Lazy load pages with React.lazy |
| Data Caching | TanStack Query cache with staleTime |
| Pagination | Fetch only needed data |
| Debouncing | Search inputs |
| Memoization | useMemo, useCallback, React.memo |

---

## 10. Naming Conventions

| File Type | Naming Convention | Example |
|---|---|---|
| Pages | `*Page.tsx` | `LoginPage.tsx` |
| Components | `PascalCase.tsx` | `PatientCard.tsx` |
| Hooks | `use*.ts` | `usePatients.ts` |
| Types | `*.types.ts` | `patient.types.ts` |
| Constants | `*.ts` (index) | `index.ts` |
| Styles | `*.css` | `globals.css` |
| Tests | `*.test.tsx` | `LoginPage.test.tsx` |

---

## 11. Route Summary

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/` | `LandingPage` | `PublicLayout` | None |
| `/login` | `LoginPage` | `AuthLayout` | None |
| `/register` | `RegisterPage` | `AuthLayout` | None |
| `/admin` | `AdminDashboardPage` | `DashboardLayout` | Admin |
| `/admin/staff` | `StaffManagementPage` | `DashboardLayout` | Admin |
| `/admin/referrals` | `ReferralManagementPage` | `DashboardLayout` | Admin |
| `/dashboard` | `DashboardPage` | `DashboardLayout` | Staff |
| `/patients` | `PatientListPage` | `DashboardLayout` | Staff |
| `/patients/new` | `PatientRegistrationPage` | `DashboardLayout` | Staff |
| `/patients/:id` | `PatientDetailPage` | `DashboardLayout` | Staff |
| `/patients/:id/summary` | `PatientSummaryPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/medications` | `OrderMedicationPage` | `DashboardLayout` | Staff |
| `/patients/:id/labs` | `OrderLabPage` | `DashboardLayout` | Staff |
| `/patients/:id/referrals` | `RequestReferralPage` | `DashboardLayout` | Staff |
| `/patients/:id/admissions` | `RecordAdmissionPage` | `DashboardLayout` | Staff |
| `*` | `NotFoundPage` | None | None |
