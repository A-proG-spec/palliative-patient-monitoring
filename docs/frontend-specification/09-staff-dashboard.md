# frontend-specification/09-staff-dashboard.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND STAFF DASHBOARD SPECIFICATION

## 1. Overview

This document defines the frontend implementation for the staff dashboard feature. The staff dashboard serves as the landing page for authenticated staff members (Team Leaders, Physicians, Nurses) and provides an overview of their assigned patients and daily tasks.

**API Reference:** `api/03-patients.md`, `api/04-visits.md`

---

## 2. Route

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/dashboard` | `DashboardPage` | `DashboardLayout` | Staff |

---

## 3. Staff Sidebar Navigation (UPDATED)

The staff sidebar contains the following navigation items in order:

```
+---------------------------------------------------+
|  Palliative Care System                           |
|  ------------------------------------------------- |
|                                                     |
|  [Dashboard]                                       |
|  [Patients]                                        |
|  [Visits]                                          |
|  ------------------------------------------------- |
|  Staff Name                                        |
|  staff@example.com                                 |
|  [Profile]                                         |
|  [Logout]                                          |
+---------------------------------------------------+
```

### Navigation Items:

| # | Label | Route | Badge/Notification |
|---|---|---|---|
| 1 | Dashboard | `/dashboard` | Today's visits count |
| 2 | Patients | `/patients` | Total patients assigned |
| 3 | Visits | `/patients/:id/visits` | - |
| 4 | Profile | `/profile` | - |

---

## 4. Types

```typescript
// src/types/staff.types.ts

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
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

## 5. API Calls

```typescript
// src/api/staff.ts

import api from './client';
import { StaffDashboardStats, StaffProfile } from '@/types/staff.types';

export const staffApi = {
  /**
   * Get staff dashboard statistics
   * GET /staff/dashboard/stats
   */
  getDashboardStats: (): Promise<StaffDashboardStats> => {
    return api.get<StaffDashboardStats>('/staff/dashboard/stats').then((res) => res.data);
  },

  /**
   * Get staff profile
   * GET /staff/me
   */
  getProfile: (): Promise<StaffProfile> => {
    return api.get<StaffProfile>('/staff/me').then((res) => res.data);
  },
};
```

---

## 6. Hooks

```typescript
// src/hooks/useStaff.ts

import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/api/staff';

/**
 * Get staff dashboard statistics
 */
export function useStaffDashboardStats() {
  return useQuery({
    queryKey: ['staff', 'dashboard', 'stats'],
    queryFn: () => staffApi.getDashboardStats(),
    refetchInterval: 60000, // 1 minute
  });
}

/**
 * Get staff profile
 */
export function useStaffProfile() {
  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
  });
}
```

---

## 7. Components

### 7.1 DashboardStats

**Purpose:** Display statistics cards on staff dashboard

**Props:**

```typescript
interface StaffDashboardStatsProps {
  stats: StaffDashboardStats;
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +----------+ +----------+ +----------+ +----------+       |
| | Today's  | | Total    | | Active   | | Pending  |       |
| | Visits   | | Patients | | Patients | | Tasks    |       |
| |          | |          | |          | |          |       |
| |    5     | |    23    | |    18    | |    3     |       |
| +----------+ +----------+ +----------+ +----------+       |
+-----------------------------------------------------------+
```

---

### 7.2 PatientAssignmentList

**Purpose:** Display list of patients assigned to the staff member

**Props:**

```typescript
interface PatientAssignmentListProps {
  patients: StaffDashboardStats['assignedPatients'];
  loading?: boolean;
  onPatientClick?: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| My Patients                                                |
| +-------------------------------------------------------+ |
| | ID        | Name          | Diagnosis       | Status  | |
| +-----------+---------------+---------------+---------+ |
| | PAT-001   | Sarah Johnson | Stage IV Breast| Active  | |
| |           |               | Cancer         |         | |
| | PAT-002   | Michael Brown | Lung Cancer    | Active  | |
| |           |               |                |         | |
| | PAT-003   | Jane Smith    | Heart Failure  | Hospital| |
| +-----------+---------------+---------------+---------+ |
|                                           [View All]      |
+-----------------------------------------------------------+
```

---

### 7.3 RecentVisitsList

**Purpose:** Display recent visits performed by the staff member

**Props:**

```typescript
interface RecentVisitsListProps {
  visits: StaffDashboardStats['recentVisits'];
  loading?: boolean;
  onVisitClick?: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Recent Visits                                              |
| +-------------------------------------------------------+ |
| | Patient        | Date       | Outcome        |         | |
| +----------------+------------+----------------+---------+ |
| | Sarah Johnson  | 2026-08-29 | Stable         | [View]  | |
| | Michael Brown  | 2026-08-28 | Symptoms       | [View]  | |
| |                |            | Improved       |         | |
| | Jane Smith     | 2026-08-27 | Referred to    | [View]  | |
| |                |            | Facility       |         | |
| +----------------+------------+----------------+---------+ |
|                                           [View All]      |
+-----------------------------------------------------------+
```

---

### 7.4 UpcomingVisitsList

**Purpose:** Display upcoming scheduled visits

**Props:**

```typescript
interface UpcomingVisitsListProps {
  visits: StaffDashboardStats['upcomingVisits'];
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Upcoming Visits                                            |
| +-------------------------------------------------------+ |
| | Patient        | Date       | Type            |         | |
| +----------------+------------+-----------------+---------+ |
| | Sarah Johnson  | 2026-09-05 | Routine         |         | |
| | Michael Brown  | 2026-09-06 | Follow-up       |         | |
| | John Smith     | 2026-09-07 | Emergency       | ⚠️      | |
| +----------------+------------+-----------------+---------+ |
+-----------------------------------------------------------+
```

---

### 7.5 AlertList

**Purpose:** Display alerts for the staff member

**Props:**

```typescript
interface AlertListProps {
  alerts: StaffDashboardStats['alerts'];
  loading?: boolean;
  onAlertClick?: (alertId: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Alerts                                                     |
| +-------------------------------------------------------+ |
| | ⚠️ Red Flag: Severe pain reported for Sarah Johnson   | |
| |   2 hours ago                                         | |
| +-------------------------------------------------------+ |
| | ℹ️ Referral Pending: Michael Brown                    | |
| |   1 day ago                                           | |
| +-------------------------------------------------------+ |
| | ℹ️ Visit Overdue: Jane Smith                          | |
| |   3 days ago                                          | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

## 8. Page Implementation

### DashboardPage

**Route:** `/dashboard`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff only)

**Purpose:** Staff dashboard landing page

**Behavior:**

1. Uses `useStaffDashboardStats()` hook
2. Uses `useStaffProfile()` hook
3. Displays staff name and role
4. Displays statistics cards
5. Displays assigned patients list
6. Displays recent visits
7. Displays upcoming visits
8. Displays alerts
9. Auto-refreshes every 60 seconds

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

**Implementation:**

```typescript
// src/pages/staff/DashboardPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffDashboardStats, useStaffProfile } from '@/hooks/useStaff';
import { StaffDashboardStats } from '@/components/staff/StaffDashboardStats';
import { PatientAssignmentList } from '@/components/staff/PatientAssignmentList';
import { RecentVisitsList } from '@/components/staff/RecentVisitsList';
import { UpcomingVisitsList } from '@/components/staff/UpcomingVisitsList';
import { AlertList } from '@/components/staff/AlertList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStaffDashboardStats();
  const { data: profile, isLoading: profileLoading } = useStaffProfile();

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
      {stats?.alerts && stats.alerts.length > 0 && (
        <AlertList
          alerts={stats.alerts}
          onAlertClick={(id) => console.log('Alert clicked:', id)}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Patients */}
        <PatientAssignmentList
          patients={stats?.assignedPatients || []}
          onPatientClick={(id) => navigate(`/patients/${id}`)}
        />

        {/* Recent Visits */}
        <RecentVisitsList
          visits={stats?.recentVisits || []}
          onVisitClick={(id) => navigate(`/patients/${id}`)}
        />
      </div>

      {/* Upcoming Visits */}
      <UpcomingVisitsList
        visits={stats?.upcomingVisits || []}
      />
    </div>
  );
};
```

---

## 9. Route Configuration

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
        { 
          path: '/profile', 
          element: withSuspense(ProfilePage) 
        },
        // ... other staff routes
      ],
    },
  ],
}
```

---

## 10. Flow Diagram (UPDATED)

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
|  |                    QUICK ACTIONS                     | |
|  |                                                     | |
|  |  "Record Visit" button -> /patients/:id/visits      | |
|  |  "View Summary" button -> /patients/:id/summary    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PROFILE FLOW (NEW)                | |
|  |                                                     | |
|  |  Staff clicks Profile in sidebar -> /profile        | |
|  |         -> ProfilePage                              | |
|  |         -> View profile information                 | |
|  |         -> Edit name and phone                      | |
|  |         -> Change password                          | |
|  |         -> View activity statistics                 | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```

---

## 11. Summary of Features

| Feature | Description |
|---|---|
| Welcome Section | Displays staff name, role, and current date |
| Statistics Cards | Today's Visits, Total Patients, Active Patients, Pending Tasks |
| My Patients | List of patients assigned to the staff member |
| Recent Visits | Recent visits performed by the staff member |
| Upcoming Visits | Scheduled upcoming visits |
| Alerts | Red flags, pending referrals, overdue visits |
| Quick Actions | Record Visit, View Summary buttons |
| Auto-Refresh | Dashboard updates every 60 seconds |
| Profile Access | Access to profile page from sidebar |

---

## 12. Backend API Requirements

To support the staff dashboard, the following backend endpoints are required:

| Endpoint | Method | Purpose |
|---|---|---|
| `/staff/me` | GET | Get staff profile |
| `/staff/dashboard/stats` | GET | Get dashboard statistics |
| `/patients` | GET | Get assigned patients (already exists) |
| `/patients/:patientId/visits` | GET | Get patient visits (already exists) |

### Backend Service Functions

```typescript
// src/services/staff.service.ts

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientName: string;
    visitDate: Date;
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
    lastVisitDate?: Date;
  }>;
  upcomingVisits: Array<{
    id: string;
    patientName: string;
    scheduledDate: Date;
    visitType: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: string;
    patientName: string;
    createdAt: Date;
  }>;
}
```
