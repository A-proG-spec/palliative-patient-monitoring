# function-level-specification/frontend/09-staff-dashboard.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: STAFF DASHBOARD

## 1. Overview

This document defines the function-level specification for frontend staff dashboard features including dashboard statistics, assigned patients, upcoming visits, recent visits, and alerts.

**Files Covered:**
- `src/api/staff.ts`
- `src/hooks/useStaff.ts`
- `src/components/staff/StaffDashboardStats.tsx`
- `src/components/staff/PatientAssignmentList.tsx`
- `src/components/staff/RecentVisitsList.tsx`
- `src/components/staff/UpcomingVisitsList.tsx`
- `src/components/staff/AlertList.tsx`
- `src/pages/staff/DashboardPage.tsx`

---

## 2. API Layer

### src/api/staff.ts

| Function | Signature | Purpose |
|---|---|---|
| getDashboardStats | `(): Promise<StaffDashboardStats>` | GET /staff/dashboard/stats |
| getAssignedPatients | `(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AssignedPatient[]; total: number }>` | GET /staff/patients |
| getUpcomingVisits | `(params?: { days?: number; limit?: number }): Promise<{ items: UpcomingVisit[]; total: number }>` | GET /staff/visits/upcoming |
| getRecentVisits | `(params?: { days?: number; limit?: number }): Promise<{ items: RecentVisit[]; total: number }>` | GET /staff/visits/recent |
| getAlerts | `(params?: { read?: boolean; type?: string; limit?: number }): Promise<{ items: StaffAlert[]; unreadCount: number; total: number }>` | GET /staff/alerts |
| markAlertRead | `(alertId: string): Promise<{ id: string; read: boolean }>` | PUT /staff/alerts/:alertId/read |

**Implementation:**

```typescript
// src/api/staff.ts

import api from './client';
import { 
  StaffDashboardStats, 
  AssignedPatient, 
  UpcomingVisit, 
  RecentVisit, 
  StaffAlert 
} from '@/types/staff.types';

export const staffApi = {
  getDashboardStats: (): Promise<StaffDashboardStats> => {
    return api.get<StaffDashboardStats>('/staff/dashboard/stats').then((res) => res.data);
  },

  getAssignedPatients: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ items: AssignedPatient[]; total: number }> => {
    return api.get<{ items: AssignedPatient[]; total: number }>('/staff/patients', { params }).then((res) => res.data);
  },

  getUpcomingVisits: (params?: {
    days?: number;
    limit?: number;
  }): Promise<{ items: UpcomingVisit[]; total: number }> => {
    return api.get<{ items: UpcomingVisit[]; total: number }>('/staff/visits/upcoming', { params }).then((res) => res.data);
  },

  getRecentVisits: (params?: {
    days?: number;
    limit?: number;
  }): Promise<{ items: RecentVisit[]; total: number }> => {
    return api.get<{ items: RecentVisit[]; total: number }>('/staff/visits/recent', { params }).then((res) => res.data);
  },

  getAlerts: (params?: {
    read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<{ items: StaffAlert[]; unreadCount: number; total: number }> => {
    return api.get<{ items: StaffAlert[]; unreadCount: number; total: number }>('/staff/alerts', { params }).then((res) => res.data);
  },

  markAlertRead: (alertId: string): Promise<{ id: string; read: boolean }> => {
    return api.put<{ id: string; read: boolean }>(`/staff/alerts/${alertId}/read`).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useStaff.ts

#### useStaffDashboardStats

| Field | Detail |
|---|---|
| Signature | `useStaffDashboardStats(): UseQueryResult<StaffDashboardStats>` |
| Query Key | `['staff', 'dashboard', 'stats']` |
| Purpose | Get staff dashboard statistics |
| Auth | Staff |
| Refetch Interval | 60000 (1 minute) |
| Edge Cases | Staff not found -> error from API |

**Implementation:**

```typescript
export function useStaffDashboardStats() {
  return useQuery({
    queryKey: ['staff', 'dashboard', 'stats'],
    queryFn: () => staffApi.getDashboardStats(),
    refetchInterval: 60000,
  });
}
```

---

#### useAssignedPatients

| Field | Detail |
|---|---|
| Signature | `useAssignedPatients(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<{ items: AssignedPatient[]; total: number }>` |
| Query Key | `['staff', 'patients', params]` |
| Purpose | Get patients assigned to the staff member |
| Auth | Staff |
| Edge Cases | No patients -> items: [] |

**Implementation:**

```typescript
export function useAssignedPatients(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['staff', 'patients', params],
    queryFn: () => staffApi.getAssignedPatients(params),
  });
}
```

---

#### useUpcomingVisits

| Field | Detail |
|---|---|
| Signature | `useUpcomingVisits(params?: { days?: number; limit?: number }): UseQueryResult<{ items: UpcomingVisit[]; total: number }>` |
| Query Key | `['staff', 'visits', 'upcoming', params]` |
| Purpose | Get upcoming scheduled visits |
| Auth | Staff |
| Edge Cases | No upcoming visits -> items: [] |

**Implementation:**

```typescript
export function useUpcomingVisits(params?: {
  days?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['staff', 'visits', 'upcoming', params],
    queryFn: () => staffApi.getUpcomingVisits(params),
  });
}
```

---

#### useRecentVisits

| Field | Detail |
|---|---|
| Signature | `useRecentVisits(params?: { days?: number; limit?: number }): UseQueryResult<{ items: RecentVisit[]; total: number }>` |
| Query Key | `['staff', 'visits', 'recent', params]` |
| Purpose | Get recent visits performed by staff |
| Auth | Staff |
| Edge Cases | No recent visits -> items: [] |

**Implementation:**

```typescript
export function useRecentVisits(params?: {
  days?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['staff', 'visits', 'recent', params],
    queryFn: () => staffApi.getRecentVisits(params),
  });
}
```

---

#### useStaffAlerts

| Field | Detail |
|---|---|
| Signature | `useStaffAlerts(params?: { read?: boolean; type?: string; limit?: number }): UseQueryResult<{ items: StaffAlert[]; unreadCount: number; total: number }>` |
| Query Key | `['staff', 'alerts', params]` |
| Purpose | Get staff alerts |
| Auth | Staff |
| Edge Cases | No alerts -> items: [] |

**Implementation:**

```typescript
export function useStaffAlerts(params?: {
  read?: boolean;
  type?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['staff', 'alerts', params],
    queryFn: () => staffApi.getAlerts(params),
  });
}
```

---

#### useMarkAlertRead

| Field | Detail |
|---|---|
| Signature | `useMarkAlertRead(): UseMutationResult<{ id: string; read: boolean }, AxiosError, string>` |
| Purpose | Mark alert as read |
| Side Effects | Invalidates alerts query |
| Auth | Staff |

**Implementation:**

```typescript
export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => staffApi.markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'dashboard', 'stats'] });
    },
  });
}
```

---

## 4. Components

### 4.1 StaffDashboardStats

**Purpose:** Display statistics cards on staff dashboard

**Props:**

```typescript
interface StaffDashboardStatsProps {
  stats: StaffDashboardStats;
  loading?: boolean;
}
```

**Behavior:**
- Renders 4 stat cards: Today's Visits, Total Patients, Active Patients, Pending Tasks
- Each card shows count and label
- Shows skeleton loading state

---

### 4.2 PatientAssignmentList

**Purpose:** Display list of patients assigned to the staff member

**Props:**

```typescript
interface PatientAssignmentListProps {
  patients: AssignedPatient[];
  loading?: boolean;
  onPatientClick?: (id: string) => void;
  onViewAll?: () => void;
}
```

**Behavior:**
- Renders table of patients (max 5, with "View All" button)
- Columns: ID, Name, Diagnosis, Status
- Click row to navigate to patient detail
- Status badge with color coding (Active: green, Discharged: gray)
- Shows loading skeleton
- Shows empty state

---

### 4.3 RecentVisitsList

**Purpose:** Display recent visits performed by staff

**Props:**

```typescript
interface RecentVisitsListProps {
  visits: RecentVisit[];
  loading?: boolean;
  onVisitClick?: (id: string) => void;
  onViewAll?: () => void;
}
```

**Behavior:**
- Renders table of recent visits (max 5)
- Columns: Patient, Date, Outcome
- Outcome badge with color coding (Stable: green, Improved: blue, Worsened: red)
- Shows loading skeleton
- Shows empty state

---

### 4.4 UpcomingVisitsList

**Purpose:** Display upcoming scheduled visits

**Props:**

```typescript
interface UpcomingVisitsListProps {
  visits: UpcomingVisit[];
  loading?: boolean;
  onVisitClick?: (id: string) => void;
}
```

**Behavior:**
- Renders list of upcoming visits (max 5)
- Shows patient name, date, visit type
- Priority indicator (High, Urgent)
- Shows loading skeleton
- Shows empty state

---

### 4.5 AlertList

**Purpose:** Display alerts for the staff member

**Props:**

```typescript
interface AlertListProps {
  alerts: StaffAlert[];
  unreadCount: number;
  loading?: boolean;
  onAlertClick?: (alertId: string) => void;
  onMarkRead?: (alertId: string) => void;
}
```

**Behavior:**
- Renders list of alerts
- Alert type icon: RedFlag (⚠️), ReferralPending (ℹ️), VisitOverdue (🔔)
- Unread alerts highlighted
- "Mark as Read" button for unread alerts
- Shows "No alerts" empty state

---

## 5. Page Implementation

### DashboardPage

**Route:** `/dashboard`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff only)

**Purpose:** Staff dashboard landing page

**Local State:** None (all data from hooks)

**Behavior:**

1. Uses `useStaffProfile()` hook to get staff name and role
2. Uses `useStaffDashboardStats()` hook
3. Uses `useStaffAlerts({ limit: 5 })` hook
4. Uses `useMarkAlertRead()` hook for marking alerts read
5. Displays welcome message with staff name and role
6. Displays statistics cards
7. Displays alerts section (if any)
8. Displays assigned patients list
9. Displays recent visits list
10. Displays upcoming visits list
11. Auto-refreshes every 60 seconds

**Components:**

- `StaffDashboardStats`
- `PatientAssignmentList`
- `RecentVisitsList`
- `UpcomingVisitsList`
- `AlertList`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards and lists |
| Error | Error message with retry |
| Success | Full dashboard |
| Empty | "No data available" messages |

---

## 6. Type Definitions

```typescript
// src/types/staff.types.ts

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    visitDate: string;
    outcome: string;
  }>;
  assignedPatients: Array<{
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    status: 'Active' | 'Discharged';
    currentLocation: 'Home' | 'ReferredHospital';
    primaryDiagnosis: string;
    lastVisitDate?: string;
  }>;
  upcomingVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    scheduledDate: string;
    visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  }>;
  alerts: Array<{
    id: string;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: string;
    patientName: string;
    createdAt: string;
  }>;
}

export interface AssignedPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
}

export interface UpcomingVisit {
  id: string;
  patientId: string;
  patientName: string;
  scheduledDate: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  priority?: 'Normal' | 'High' | 'Urgent';
}

export interface RecentVisit {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType: string;
  outcome: string;
  notes?: string;
}

export interface StaffAlert {
  id: string;
  type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
  message: string;
  patientId: string;
  patientName: string;
  read: boolean;
  createdAt: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: string;
}
```

---

## 7. Page Implementation

```typescript
// src/pages/staff/DashboardPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffProfile } from '@/hooks/useAuth';
import { useStaffDashboardStats, useStaffAlerts, useMarkAlertRead } from '@/hooks/useStaff';
import { StaffDashboardStats } from '@/components/staff/StaffDashboardStats';
import { PatientAssignmentList } from '@/components/staff/PatientAssignmentList';
import { RecentVisitsList } from '@/components/staff/RecentVisitsList';
import { UpcomingVisitsList } from '@/components/staff/UpcomingVisitsList';
import { AlertList } from '@/components/staff/AlertList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useStaffProfile();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStaffDashboardStats();
  const { data: alertsData, isLoading: alertsLoading } = useStaffAlerts({ limit: 5 });
  const markReadMutation = useMarkAlertRead();

  if (statsLoading || profileLoading) {
    return <LoadingSpinner />;
  }

  if (statsError) {
    return <ErrorState onRetry={refetchStats} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.name}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role} · Today is {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Total Patients: {stats?.totalPatients || 0}</p>
          <p>Today's Visits: {stats?.todayVisits || 0}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <StaffDashboardStats stats={stats!} />

      {/* Alerts Section */}
      {alertsData && alertsData.items.length > 0 && (
        <AlertList
          alerts={alertsData.items}
          unreadCount={alertsData.unreadCount}
          loading={alertsLoading}
          onMarkRead={(id) => markReadMutation.mutate(id)}
          onAlertClick={(id) => {
            // Navigate to patient associated with alert
            const alert = alertsData.items.find(a => a.id === id);
            if (alert) {
              navigate(`/patients/${alert.patientId}`);
            }
          }}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Patients */}
        <PatientAssignmentList
          patients={stats?.assignedPatients || []}
          onPatientClick={(id) => navigate(`/patients/${id}`)}
          onViewAll={() => navigate('/patients')}
        />

        {/* Recent Visits */}
        <RecentVisitsList
          visits={stats?.recentVisits || []}
          onVisitClick={(id) => navigate(`/patients/${id}`)}
          onViewAll={() => navigate('/patients')}
        />
      </div>

      {/* Upcoming Visits */}
      <UpcomingVisitsList
        visits={stats?.upcomingVisits || []}
        onVisitClick={(id) => navigate(`/patients/${id}`)}
      />
    </div>
  );
};
```

---

## 8. Route Configuration

```typescript
// src/routes/index.tsx (staff section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/dashboard', 
          element: withSuspense(DashboardPage) 
        },
        // ... other staff routes
      ],
    },
  ],
}
```

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                STAFF DASHBOARD FLOW (FRONTEND)             |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    DASHBOARD LOAD                    | |
|  |                                                     | |
|  |  Staff -> /dashboard -> DashboardPage               | |
|  |         -> useStaffProfile()                        | |
|  |         -> GET /staff/me                            | |
|  |         -> Display staff name and role              | |
|  |         -> useStaffDashboardStats()                 | |
|  |         -> GET /staff/dashboard/stats               | |
|  |         -> Display stats, patients, visits, alerts  | |
|  |         -> Auto-refresh every 60 seconds            | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PATIENT NAVIGATION                | |
|  |                                                     | |
|  |  Click patient card -> navigate to /patients/:id    | |
|  |  Click "View All" -> navigate to /patients          | |
|  |  Click visit -> navigate to patient detail          | |
|  |  Click alert -> navigate to relevant patient        | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    ALERT ACTIONS                     | |
|  |                                                     | |
|  |  Click "Mark as Read" -> useMarkAlertRead()         | |
|  |         -> PUT /staff/alerts/:alertId/read          | |
|  |         -> Invalidate alerts query                   | |
|  |         -> Invalidate dashboard stats                | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
