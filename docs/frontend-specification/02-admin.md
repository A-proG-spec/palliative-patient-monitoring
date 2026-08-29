# frontend-specification/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMIN SPECIFICATION

## 1. Overview

This document defines the frontend implementation for admin features including dashboard, patient management, staff management, referral management, reports, and settings.

**API Reference:** `api/02-admin.md`

---

## 2. Admin Sidebar Navigation

The admin sidebar contains the following navigation items in order:

```
+---------------------------------------------------+
|  Palliative Care System                           |
|  ------------------------------------------------- |
|                                                     |
|  [Dashboard]                                       |
|  [Patients]                                        |
|  [Staff Management]                                |
|  [Referrals]                                       |
|  [Reports]                                         |
|  [Settings]                                        |
|  ------------------------------------------------- |
|  Admin Name                                        |
|  admin@example.com                                 |
|  [Logout]                                          |
+---------------------------------------------------+
```

### Navigation Items:

| # | Label | Route | Badge/Notification |
|---|---|---|---|
| 1 | Dashboard | `/admin` | Pending staff count, pending referrals count |
| 2 | Patients | `/admin/patients` | Total patients count |
| 3 | Staff Management | `/admin/staff` | Pending approvals count |
| 4 | Referrals | `/admin/referrals` | Pending referrals count |
| 5 | Reports | `/admin/reports` | - |
| 6 | Settings | `/admin/settings` | - |

---

## 3. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/admin` | `AdminDashboardPage` | `DashboardLayout` | Admin |
| `/admin/patients` | `AdminPatientListPage` | `DashboardLayout` | Admin |
| `/admin/patients/:patientId` | `AdminPatientDetailPage` | `DashboardLayout` | Admin |
| `/admin/staff` | `StaffManagementPage` | `DashboardLayout` | Admin |
| `/admin/referrals` | `ReferralManagementPage` | `DashboardLayout` | Admin |
| `/admin/reports` | `ReportsPage` | `DashboardLayout` | Admin |
| `/admin/settings` | `SettingsPage` | `DashboardLayout` | Admin |

---

## 4. Types

```typescript
// src/types/admin.types.ts

export interface PendingStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: string;
}

export interface ApproveStaffRequest {
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface ApprovedStaffResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Active';
  assignedBy: {
    id: string;
    name: string;
  };
  updatedAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  hospitalizedPatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  notifications: {
    staffApprovals: number;
    pendingReferrals: number;
    recentCloseCases: number;
  };
  patientsByStatus: Array<{ status: string; count: number }>;
  recentReferrals: Array<{
    id: string;
    patientName: string;
    date: string;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: string;
    staff: string;
  }>;
}

export interface Notification {
  id: string;
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: string;
    referralId?: string;
    patientId?: string;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: string;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: string;
}

export interface AdminPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: string;
  registeredBy: {
    id: string;
    name: string;
  };
}

export interface AdminPatientDetail extends AdminPatient {
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  visits: Array<{
    id: string;
    visitDate: string;
    outcome: string;
    staff: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    status: string;
  }>;
  labTests: Array<{
    id: string;
    name: string;
    dateOrdered: string;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  createdAt: string;
}

export interface ReportData {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  hospitalizedPatients: number;
  referralsByStatus: Array<{ status: string; count: number }>;
  patientsByLocation: Array<{ location: string; count: number }>;
  patientsByStage: Array<{ stage: string; count: number }>;
  closeCasesByReason: Array<{ reason: string; count: number }>;
  visitsByMonth: Array<{ month: string; count: number }>;
}
```

---

## 5. API Calls

```typescript
// src/api/admin.ts

import api from './client';
import { 
  DashboardStats, 
  Notification, 
  NotificationsResponse,
  PendingStaff,
  ApprovedStaffResponse,
  ApproveStaffRequest,
  CloseCaseRequest,
  CloseCaseResponse,
  AdminPatient,
  AdminPatientDetail,
  ReportData
} from '@/types/admin.types';
import { Referral } from '@/types/referral.types';

export const adminApi = {
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/admin/dashboard/stats').then((res) => res.data);
  },

  getNotifications: (params?: { limit?: number; read?: boolean }): Promise<NotificationsResponse> => {
    return api.get<NotificationsResponse>('/admin/dashboard/notifications', { params }).then((res) => res.data);
  },

  markNotificationRead: (notificationId: string): Promise<{ id: string; read: boolean }> => {
    return api.put<{ id: string; read: boolean }>(`/admin/dashboard/notifications/${notificationId}/read`).then((res) => res.data);
  },

  // Patients
  getPatients: (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }> => {
    return api.get<{ items: AdminPatient[]; total: number }>('/admin/patients', { params }).then((res) => res.data);
  },

  getPatientDetail: (patientId: string): Promise<AdminPatientDetail> => {
    return api.get<AdminPatientDetail>(`/admin/patients/${patientId}`).then((res) => res.data);
  },

  closeCase: (patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse> => {
    return api.put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data).then((res) => res.data);
  },

  // Staff
  getPendingStaff: (): Promise<PendingStaff[]> => {
    return api.get<PendingStaff[]>('/admin/staff/pending').then((res) => res.data);
  },

  approveStaff: (staffId: string, data: ApproveStaffRequest): Promise<ApprovedStaffResponse> => {
    return api.put<ApprovedStaffResponse>(`/admin/staff/${staffId}/approve`, data).then((res) => res.data);
  },

  rejectStaff: (staffId: string): Promise<{ id: string; status: string }> => {
    return api.put<{ id: string; status: string }>(`/admin/staff/${staffId}/reject`).then((res) => res.data);
  },

  // Referrals
  getPendingReferrals: (): Promise<Referral[]> => {
    return api.get<Referral[]>('/admin/referrals/pending').then((res) => res.data);
  },

  approveReferral: (referralId: string): Promise<Referral> => {
    return api.put<Referral>(`/admin/referrals/${referralId}/approve`).then((res) => res.data);
  },

  declineReferral: (referralId: string): Promise<Referral> => {
    return api.put<Referral>(`/admin/referrals/${referralId}/decline`).then((res) => res.data);
  },

  // Reports
  getReports: (params?: { startDate?: string; endDate?: string }): Promise<ReportData> => {
    return api.get<ReportData>('/admin/reports', { params }).then((res) => res.data);
  },

  exportReport: (format: 'pdf' | 'excel'): Promise<Blob> => {
    return api.get(`/admin/reports/export?format=${format}`, { responseType: 'blob' }).then((res) => res.data);
  },
};
```

---

## 6. Hooks

```typescript
// src/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { ApproveStaffRequest, CloseCaseRequest } from '@/types/admin.types';

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => adminApi.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

// Patient Management Hooks
export function useAdminPatients(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'patients', params],
    queryFn: () => adminApi.getPatients(params),
  });
}

export function useAdminPatientDetail(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId],
    queryFn: () => adminApi.getPatientDetail(patientId),
    enabled: !!patientId,
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CloseCaseRequest }) =>
      adminApi.closeCase(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
    },
  });
}

// Staff Management Hooks
export function usePendingStaff() {
  return useQuery({
    queryKey: ['admin', 'staff', 'pending'],
    queryFn: () => adminApi.getPendingStaff(),
  });
}

export function useApproveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: ApproveStaffRequest }) =>
      adminApi.approveStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

export function useRejectStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => adminApi.rejectStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

// Referral Management Hooks
export function usePendingReferrals() {
  return useQuery({
    queryKey: ['admin', 'referrals', 'pending'],
    queryFn: () => adminApi.getPendingReferrals(),
  });
}

export function useApproveReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.approveReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.declineReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

// Reports Hooks
export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format }: { format: 'pdf' | 'excel' }) => adminApi.exportReport(format),
  });
}
```

---

## 7. Components

### 7.1 DashboardStats

**Purpose:** Display statistics cards on admin dashboard

**Props:**

```typescript
interface DashboardStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +----------+ +----------+ +----------+ +----------+       |
| | Total    | | Active   | | Hospital-| | Dischar- |       |
| | Patients | | Patients | | ized     | | ged      |       |
| |          | |          | | Patients | | Patients |       |
| |   234    | |   156    | |   45     | |   33     |       |
| +----------+ +----------+ +----------+ +----------+       |
|                                                           |
| +----------+ +----------+ +-----------------------------+ |
| | Pending  | | Pending  | | Notifications               | |
| | Staff    | | Referrals| |                             | |
| |          | |          | | Staff Approvals: 3          | |
| |    5     | |    12    | | Pending Referrals: 12      | |
| +----------+ +----------+ | Recent Close Cases: 5       | |
|                           +-----------------------------+ |
+-----------------------------------------------------------+
```

---

### 7.2 NotificationList

**Purpose:** Display admin notifications

**Props:**

```typescript
interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  onMarkRead: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Notifications (15 unread)                                  |
|                                                           |
| +-------------------------------------------------------+ |
| | [Notification Icon] Staff Approval                     | |
| | New staff registration pending: John Doe              | |
| | 2 minutes ago                           [Mark as Read] | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | [Notification Icon] Referral                           | |
| | New referral request: Sarah Johnson                   | |
| | 15 minutes ago                           [Mark as Read] | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | [Notification Icon] Close Case                         | |
| | Patient case closed: Michael Brown (Improved)         | |
| | 1 hour ago                                             | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 7.3 StaffApprovalList

**Purpose:** Display and manage pending staff registrations

**Props:**

```typescript
interface StaffApprovalListProps {
  staff: PendingStaff[];
  loading?: boolean;
  onApprove: (id: string, role: string) => void;
  onReject: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Pending Staff Approvals                                    |
|                                                           |
| +-------------------------------------------------------+ |
| | Name       | Email          | Phone        | Action   | |
| +------------+----------------+--------------+----------+ |
| | John Doe   | john@example.. | +251911111111 | [Approve]| |
| |            |                |              | [Reject] | |
| | Jane Smith | jane@example.. | +251922222222 | [Approve]| |
| |            |                |              | [Reject] | |
| | Mark Lee   | mark@example.. | +251933333333 | [Approve]| |
| |            |                |              | [Reject] | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 7.4 ReferralApprovalList

**Purpose:** Display and manage pending referrals

**Props:**

```typescript
interface ReferralApprovalListProps {
  referrals: Referral[];
  loading?: boolean;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Pending Referrals                                          |
|                                                           |
| +-------------------------------------------------------+ |
| | Patient       | Diagnosis       | Date       | Action  | |
| +---------------+-----------------+------------+---------+ |
| | Sarah Johnson | Stage IV Breast | 2026-08-29 | [Approv]| |
| |               | Cancer          |            | [Declin]| |
| | Michael Brown | Lung Cancer     | 2026-08-28 | [Approv]| |
| |               |                 |            | [Declin]| |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 7.5 CloseCaseModal

**Purpose:** Modal for closing a patient case

**Props:**

```typescript
interface CloseCaseModalProps {
  open: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onConfirm: (reason: 'Improved' | 'Deceased') => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Close Patient Case                                     | |
| | ----------------------------------------------------- | |
| |                                                       | |
| | Are you sure you want to close the case for           | |
| | Sarah Johnson?                                        | |
| |                                                       | |
| | Select reason for closing case:                       | |
| |                                                       | |
| | ( ) Improved                                          | |
| | ( ) Deceased                                          | |
| |                                                       | |
| |              [Cancel] [Confirm Close Case]            | |
| |                                                       | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

## 8. Pages

### 8.1 AdminDashboardPage

**Route:** `/admin`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Admin dashboard with statistics, notifications, and pending items

**Behavior:**

1. Uses `useDashboardStats()` hook
2. Uses `useNotifications({ limit: 10 })` hook
3. Uses `usePendingStaff()` hook
4. Uses `usePendingReferrals()` hook
5. Renders DashboardStats, NotificationList, StaffApprovalList, ReferralApprovalList
6. Auto-refreshes every 30 seconds

**Components:**

- `DashboardStats`
- `NotificationList`
- `StaffApprovalList`
- `ReferralApprovalList`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards and lists |
| Error | Error message with retry |
| Success | Full dashboard with data |
| Empty | "All clear" message for each section |

---

### 8.2 AdminPatientListPage

**Route:** `/admin/patients`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View and manage all patients

**Behavior:**

1. Uses `useAdminPatients()` hook
2. Search bar for filtering
3. Status filter dropdown
4. Pagination
5. Click patient row navigates to detail

**Components:**

- `PatientSearchBar`
- `PatientFilterDropdown`
- `AdminPatientTable`
- `Pagination`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton table |
| Error | Error message with retry |
| Empty | "No patients found" |
| Success | Full patient table |

---

### 8.3 AdminPatientDetailPage

**Route:** `/admin/patients/:patientId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View patient details and close case

**Behavior:**

1. Uses `useAdminPatientDetail(patientId)` hook
2. Displays patient demographics
3. Displays medical diagnosis
4. Displays all patient records (visits, medications, labs, referrals, admissions)
5. Close Case button opens modal

**Components:**

- `PatientDemographics`
- `PatientDiagnosis`
- `PatientRecordsList`
- `PatientProgressGraph`
- `CloseCaseButton`
- `CloseCaseModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details |

---

### 8.4 StaffManagementPage

**Route:** `/admin/staff`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Manage staff registrations

**Behavior:**

1. Uses `usePendingStaff()` hook
2. Displays list of pending staff
3. Approve button opens role selection modal
4. Reject button confirms and removes
5. Refreshes list on action

**Components:**

- `StaffApprovalList`
- `RoleSelectionModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No pending staff registrations" |
| Success | Full list |

---

### 8.5 ReferralManagementPage

**Route:** `/admin/referrals`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Manage referral approvals

**Behavior:**

1. Uses `usePendingReferrals()` hook
2. Displays list of pending referrals
3. Approve button confirms referral
4. Decline button removes from list
5. Refreshes list on action

**Components:**

- `ReferralApprovalList`
- `ReferralDetailModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No pending referrals" |
| Success | Full list |

---

### 8.6 ReportsPage

**Route:** `/admin/reports`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View system reports and analytics

**Behavior:**

1. Uses `useReports()` hook
2. Displays report charts and statistics
3. Filter by date range
4. Export reports (PDF/Excel)

**Components:**

- `ReportFilters` (date range picker)
- `ReportCharts` (bar charts, pie charts)
- `ReportStatistics`
- `ExportButtons`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton charts |
| Error | Error message with retry |
| Success | Full reports with charts |

---

### 8.7 SettingsPage

**Route:** `/admin/settings`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** System settings (future feature)

**Behavior:**

1. Placeholder for future settings
2. Shows system information

**Components:**

- `SystemInfo`
- `ProfileSettings`

**States:**

| State | UI |
|---|---|
| Success | Settings form |

---

## 9. Page Implementations

### AdminDashboardPage

```typescript
// src/pages/admin/AdminDashboardPage.tsx

import React from 'react';
import { useDashboardStats, useNotifications, useMarkNotificationRead } from '@/hooks/useAdmin';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { NotificationList } from '@/components/admin/NotificationList';
import { StaffApprovalList } from '@/components/admin/StaffApprovalList';
import { ReferralApprovalList } from '@/components/admin/ReferralApprovalList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: notificationsData, isLoading: notifLoading } = useNotifications({ limit: 10 });
  const markReadMutation = useMarkNotificationRead();

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  if (statsError) {
    return <ErrorState onRetry={refetchStats} />;
  }

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats!} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationList
          notifications={notificationsData?.notifications || []}
          unreadCount={notificationsData?.unreadCount || 0}
          loading={notifLoading}
          onMarkRead={(id) => markReadMutation.mutate(id)}
        />

        <StaffApprovalList />
      </div>

      <ReferralApprovalList />
    </div>
  );
};
```

---

## 10. Route Configuration

```typescript
// src/routes/index.tsx (admin section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/admin', 
          element: withSuspense(AdminDashboardPage) 
        },
        { 
          path: '/admin/patients', 
          element: withSuspense(AdminPatientListPage) 
        },
        { 
          path: '/admin/patients/:patientId', 
          element: withSuspense(AdminPatientDetailPage) 
        },
        { 
          path: '/admin/staff', 
          element: withSuspense(StaffManagementPage) 
        },
        { 
          path: '/admin/referrals', 
          element: withSuspense(ReferralManagementPage) 
        },
        { 
          path: '/admin/reports', 
          element: withSuspense(ReportsPage) 
        },
        { 
          path: '/admin/settings', 
          element: withSuspense(SettingsPage) 
        },
      ],
    },
  ],
}
```

---

## 11. Flow Diagram

```
+-----------------------------------------------------------+
|                    ADMIN FLOW (FRONTEND)                   |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    DASHBOARD FLOW                    | |
|  |                                                     | |
|  |  Admin -> /admin -> AdminDashboardPage              | |
|  |         -> useDashboardStats()                      | |
|  |         -> GET /admin/dashboard/stats               | |
|  |         -> Display stats, notifications, pending    | |
|  |         -> Auto-refresh every 30 seconds            | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PATIENT FLOW                      | |
|  |                                                     | |
|  |  Admin -> /admin/patients -> AdminPatientListPage   | |
|  |         -> useAdminPatients()                       | |
|  |         -> GET /admin/patients                      | |
|  |         -> Display patient list                     | |
|  |         -> Click patient -> /admin/patients/:patientId| |
|  |         -> useAdminPatientDetail()                  | |
|  |         -> GET /admin/patients/:patientId           | |
|  |         -> Display patient details                  | |
|  |         -> Close case -> useCloseCase()             | |
|  |         -> PUT /admin/patients/:patientId/close-case| |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    STAFF FLOW                        | |
|  |                                                     | |
|  |  Admin -> /admin/staff -> StaffManagementPage       | |
|  |         -> usePendingStaff()                        | |
|  |         -> GET /admin/staff/pending                 | |
|  |         -> Display pending staff                    | |
|  |         -> Approve -> useApproveStaff()             | |
|  |         -> PUT /admin/staff/:staffId/approve        | |
|  |         -> Reject -> useRejectStaff()               | |
|  |         -> PUT /admin/staff/:staffId/reject         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REFERRAL FLOW                     | |
|  |                                                     | |
|  |  Admin -> /admin/referrals -> ReferralManagementPage| |
|  |         -> usePendingReferrals()                    | |
|  |         -> GET /admin/referrals/pending             | |
|  |         -> Display pending referrals                | |
|  |         -> Approve -> useApproveReferral()          | |
|  |         -> PUT /admin/referrals/:referralId/approve | |
|  |         -> Decline -> useDeclineReferral()          | |
|  |         -> PUT /admin/referrals/:referralId/decline | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REPORTS FLOW                      | |
|  |                                                     | |
|  |  Admin -> /admin/reports -> ReportsPage             | |
|  |         -> useReports()                             | |
|  |         -> GET /admin/reports                       | |
|  |         -> Display charts and statistics            | |
|  |         -> Filter by date range                     | |
|  |         -> Export PDF/Excel                         | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```

---

## 12. Summary of Changes

| Change | Before | After |
|---|---|---|
| Patient discharge endpoint | `PUT /admin/patients/:patientId/discharge` | `PUT /admin/patients/:patientId/close-case` |
| Notification type | `'Discharge'` | `'CloseCase'` |
| Dashboard stats field | `recentDischarges` | `recentCloseCases` |
| Response field | `dischargeReason`, `dischargeDate` | `closeReason`, `closeDate` |
| Request body field | `dischargeReason` | `reason` |
| Hook name | `useDischargePatient` | `useCloseCase` |
| Modal name | `PatientDischargeModal` | `CloseCaseModal` |
| Button label | "Discharge Patient" | "Close Case" |
| Report field | `dischargesByReason` | `closeCasesByReason` |
| Approved staff response type | `PendingStaff` | `ApprovedStaffResponse` (includes assignedBy details) |
