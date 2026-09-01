# function-level-specification/frontend/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: ADMIN

## 1. Overview

This document defines the function-level specification for frontend admin features including dashboard, patient management (with full detail view like staff), staff management, referral management (with clickable patient names), reports, settings, visit editing (with audit trail), and print/export functionality.

**Files Covered:**
- `src/api/admin.ts`
- `src/hooks/useAdmin.ts`
- `src/components/admin/DashboardStats.tsx`
- `src/components/admin/NotificationList.tsx`
- `src/components/admin/StaffApprovalList.tsx`
- `src/components/admin/ReferralApprovalList.tsx`
- `src/components/admin/CloseCaseModal.tsx`
- `src/components/admin/VisitEditModal.tsx`
- `src/components/admin/AdminVisitList.tsx`
- `src/components/admin/AdminMedicationList.tsx`
- `src/components/admin/AdminLabList.tsx`
- `src/components/admin/AdminReferralList.tsx`
- `src/components/admin/AdminAdmissionList.tsx`
- `src/components/common/PrintButton.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminPatientListPage.tsx`
- `src/pages/admin/AdminPatientDetailPage.tsx`
- `src/pages/admin/AdminPatientPrintPage.tsx`
- `src/pages/admin/StaffManagementPage.tsx`
- `src/pages/admin/ReferralManagementPage.tsx`
- `src/pages/admin/ReportsPage.tsx`
- `src/pages/admin/SettingsPage.tsx`

---

## 2. API Layer

### src/api/admin.ts

| Function | Signature | Purpose |
|---|---|---|
| getDashboardStats | `(): Promise<DashboardStats>` | GET /admin/dashboard/stats |
| getNotifications | `(params?: { limit?: number; read?: boolean }): Promise<NotificationsResponse>` | GET /admin/dashboard/notifications |
| markNotificationRead | `(notificationId: string): Promise<{ id: string; read: boolean }>` | PUT /admin/dashboard/notifications/:notificationId/read |
| getPatients | `(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }>` | GET /admin/patients |
| getPatientDetail | `(patientId: string): Promise<AdminPatientDetail>` | GET /admin/patients/:patientId |
| getPatientFullDetail | `(patientId: string): Promise<AdminPatientFullDetail>` | GET /admin/patients/:patientId/full |
| getPatientPrintData | `(patientId: string): Promise<AdminPrintData>` | GET /admin/patients/:patientId/print |
| exportPatientPDF | `(patientId: string): Promise<Blob>` | GET /admin/patients/:patientId/export |
| closeCase | `(patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse>` | PUT /admin/patients/:patientId/close-case |
| getPendingStaff | `(): Promise<PendingStaff[]>` | GET /admin/staff/pending |
| approveStaff | `(staffId: string, data: ApproveStaffRequest): Promise<ApprovedStaffResponse>` | PUT /admin/staff/:staffId/approve |
| rejectStaff | `(staffId: string): Promise<{ id: string; status: string }>` | PUT /admin/staff/:staffId/reject |
| getPendingReferrals | `(): Promise<Referral[]>` | GET /admin/referrals/pending |
| approveReferral | `(referralId: string): Promise<Referral>` | PUT /admin/referrals/:referralId/approve |
| declineReferral | `(referralId: string): Promise<Referral>` | PUT /admin/referrals/:referralId/decline |
| getVisitById | `(visitId: string): Promise<AdminVisitDetail>` | GET /admin/visits/:visitId |
| updateVisit | `(visitId: string, data: UpdateVisitRequest): Promise<UpdateVisitResponse>` | PUT /admin/visits/:visitId |
| getVisitEditHistory | `(visitId: string): Promise<VisitEditHistoryEntry[]>` | GET /admin/visits/:visitId/history |
| getReports | `(params?: { startDate?: string; endDate?: string }): Promise<ReportData>` | GET /admin/reports |
| exportReport | `(format: 'pdf' | 'excel'): Promise<Blob>` | GET /admin/reports/export |

---

## 3. Hooks

### src/hooks/useAdmin.ts

#### Dashboard Hooks

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| useDashboardStats | `(): UseQueryResult<DashboardStats>` | Get dashboard statistics | `['admin', 'dashboard', 'stats']` |
| useNotifications | `(params?: { limit?: number; read?: boolean }): UseQueryResult<NotificationsResponse>` | Get notifications | `['admin', 'dashboard', 'notifications', params]` |
| useMarkNotificationRead | `(): UseMutationResult<{ id: string; read: boolean }, AxiosError, string>` | Mark notification as read | Invalidates notifications and stats |

**Implementation:**

```typescript
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
```

---

#### Patient Management Hooks (UPDATED)

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| useAdminPatients | `(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<{ items: AdminPatient[]; total: number }>` | Get all patients | `['admin', 'patients', params]` |
| useAdminPatientDetail | `(patientId: string): UseQueryResult<AdminPatientDetail>` | Get basic patient detail | `['admin', 'patients', patientId]` |
| useAdminPatientFullDetail | `(patientId: string): UseQueryResult<AdminPatientFullDetail>` | Get full patient detail with all records | `['admin', 'patients', patientId, 'full']` |
| useAdminPatientPrint | `(patientId: string): UseQueryResult<AdminPrintData>` | Get patient data formatted for print | `['admin', 'patients', patientId, 'print']` |
| useExportPatientPDF | `(): UseMutationResult<Blob, AxiosError, string>` | Export patient history as PDF | None |
| useCloseCase | `(): UseMutationResult<CloseCaseResponse, AxiosError, { patientId: string; data: CloseCaseRequest }>` | Close patient case | Invalidates patients, stats, notifications |

**Implementation:**

```typescript
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

export function useAdminPatientFullDetail(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId, 'full'],
    queryFn: () => adminApi.getPatientFullDetail(patientId),
    enabled: !!patientId,
  });
}

export function useAdminPatientPrint(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId, 'print'],
    queryFn: () => adminApi.getPatientPrintData(patientId),
    enabled: !!patientId,
  });
}

export function useExportPatientPDF() {
  return useMutation({
    mutationFn: (patientId: string) => adminApi.exportPatientPDF(patientId),
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
```

---

#### Visit Management Hooks (NEW)

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| useVisitDetail | `(visitId: string): UseQueryResult<AdminVisitDetail>` | Get visit details with edit history | `['admin', 'visits', visitId]` |
| useUpdateVisit | `(): UseMutationResult<UpdateVisitResponse, AxiosError, { visitId: string; data: UpdateVisitRequest }>` | Update visit with audit trail | Invalidates patient detail |
| useVisitEditHistory | `(visitId: string): UseQueryResult<VisitEditHistoryEntry[]>` | Get visit edit history | `['admin', 'visits', visitId, 'history']` |

**Implementation:**

```typescript
export function useVisitDetail(visitId: string) {
  return useQuery({
    queryKey: ['admin', 'visits', visitId],
    queryFn: () => adminApi.getVisitById(visitId),
    enabled: !!visitId,
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: UpdateVisitRequest }) =>
      adminApi.updateVisit(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'visits', variables.visitId, 'history'] });
    },
  });
}

export function useVisitEditHistory(visitId: string) {
  return useQuery({
    queryKey: ['admin', 'visits', visitId, 'history'],
    queryFn: () => adminApi.getVisitEditHistory(visitId),
    enabled: !!visitId,
  });
}
```

---

#### Staff Management Hooks

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| usePendingStaff | `(): UseQueryResult<PendingStaff[]>` | Get pending staff | `['admin', 'staff', 'pending']` |
| useApproveStaff | `(): UseMutationResult<ApprovedStaffResponse, AxiosError, { staffId: string; data: ApproveStaffRequest }>` | Approve staff | Invalidates staff, stats, notifications |
| useRejectStaff | `(): UseMutationResult<{ id: string; status: string }, AxiosError, string>` | Reject staff | Invalidates staff, stats, notifications |

**Implementation:**

```typescript
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
```

---

#### Referral Management Hooks

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| usePendingReferrals | `(): UseQueryResult<Referral[]>` | Get pending referrals | `['admin', 'referrals', 'pending']` |
| useApproveReferral | `(): UseMutationResult<Referral, AxiosError, string>` | Approve referral | Invalidates referrals, stats, notifications, patients |
| useDeclineReferral | `(): UseMutationResult<Referral, AxiosError, string>` | Decline referral | Invalidates referrals, stats, notifications |

**Implementation:**

```typescript
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
```

---

#### Reports Hooks

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| useReports | `(params?: { startDate?: string; endDate?: string }): UseQueryResult<ReportData>` | Get report data | `['admin', 'reports', params]` |
| useExportReport | `(): UseMutationResult<Blob, AxiosError, { format: 'pdf' | 'excel' }>` | Export report | None |

**Implementation:**

```typescript
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

## 4. Components

### 4.1 DashboardStats

**Purpose:** Display statistics cards on admin dashboard

**Props:**

```typescript
interface DashboardStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}
```

**Behavior:**
- Renders 6 stat cards: Total Patients, Active, Hospitalized, Discharged, Pending Staff, Pending Referrals
- Each card shows count and label
- Shows skeleton loading state

---

### 4.2 NotificationList (UPDATED)

**Purpose:** Display admin notifications

**Props:**

```typescript
interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  onMarkRead: (id: string) => void;
  onPatientClick?: (patientId: string) => void;  // NEW
}
```

**Behavior:**
- Renders list of notifications
- Unread notifications highlighted
- Mark as read button for unread notifications
- Clicking on patient name in notification navigates to patient detail page
- Shows "No notifications" empty state

---

### 4.3 StaffApprovalList

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

**Behavior:**
- Renders table of pending staff
- Approve button opens role selection modal
- Reject button with confirmation

---

### 4.4 ReferralApprovalList (UPDATED)

**Purpose:** Display and manage pending referrals

**Props:**

```typescript
interface ReferralApprovalListProps {
  referrals: Referral[];
  loading?: boolean;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onPatientClick?: (patientId: string) => void;  // NEW
}
```

**Behavior:**
- Renders table of pending referrals
- Patient name is displayed as a clickable link
- Clicking patient name navigates to `/admin/patients/:patientId`
- Approve and decline buttons
- Shows referral details in modal

---

### 4.5 CloseCaseModal

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

**Behavior:**
- Shows patient name
- Two radio buttons: Improved, Deceased
- Confirm and cancel buttons
- Validation: must select a reason

---

### 4.6 VisitEditModal (NEW)

**Purpose:** Modal for admin to edit visit records

**Props:**

```typescript
interface VisitEditModalProps {
  open: boolean;
  visitId: string;
  patientName: string;
  visitData: AdminVisitDetail;
  onClose: () => void;
  onSave: (data: UpdateVisitRequest) => void;
  isSubmitting?: boolean;
  editHistory?: VisitEditHistoryEntry[];
}
```

**Behavior:**
- Opens when admin clicks "Edit" button on any visit
- Pre-filled with existing visit data
- Admin can modify any visit field
- Shows audit trail: "Last edited by [Admin Name] on [Date]"
- Shows field-by-field change history
- Validates input before saving
- After save, refreshes visit list and shows success message

---

### 4.7 AdminVisitList (NEW)

**Purpose:** Display full visit list with edit capability

**Props:**

```typescript
interface AdminVisitListProps {
  visits: AdminVisitDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (visitId: string) => void;
}
```

**Behavior:**
- Renders table of visits with ALL fields displayed
- Each visit row shows: Date, Time, Type, Status, Outcome, PPS, KPS, Team, Actions
- "Edit" button for each visit (admin only)
- Expandable rows for full visit details

---

### 4.8 AdminMedicationList (NEW)

**Purpose:** Display full medication list with all details

**Props:**

```typescript
interface AdminMedicationListProps {
  medications: AdminMedicationDetail[];
  loading?: boolean;
}
```

---

### 4.9 AdminLabList (NEW)

**Purpose:** Display full lab test list with all details

**Props:**

```typescript
interface AdminLabListProps {
  labTests: AdminLabDetail[];
  loading?: boolean;
}
```

---

### 4.10 AdminReferralList (NEW)

**Purpose:** Display full referral list with all details

**Props:**

```typescript
interface AdminReferralListProps {
  referrals: AdminReferralDetail[];
  loading?: boolean;
}
```

---

### 4.11 AdminAdmissionList (NEW)

**Purpose:** Display full admission list with all details

**Props:**

```typescript
interface AdminAdmissionListProps {
  admissions: AdminAdmissionDetail[];
  loading?: boolean;
}
```

---

### 4.12 PrintButton (NEW)

**Purpose:** Print/export patient history as PDF

**Props:**

```typescript
interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}
```

**Behavior:**
- Opens print dialog with formatted patient data
- Includes institution header (Yekatit 12 Hospital Medical College)
- Shows ALL patient records with FULL details:
  - Patient Demographics: All fields
  - KPS/PPS Progress Graph: Visual trends
  - Visits: FULL details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures)
  - Medications: Complete details
  - Laboratory Tests: Full details
  - Referrals: Complete details including prepared by, signature, action taken
  - Admissions: Full details including care plans
- Professional print-ready formatting
- Available to both Admin and Staff

---

## 5. Pages

### 5.1 AdminDashboardPage (UPDATED)

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
6. Clicking patient name in notifications navigates to patient detail
7. Auto-refreshes every 30 seconds

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards and lists |
| Error | Error message with retry |
| Success | Full dashboard with data |
| Empty | "All clear" message for each section |

---

### 5.2 AdminPatientListPage

**Route:** `/admin/patients`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View and manage all patients

**Behavior:**

1. Uses `useAdminPatients()` hook
2. Search bar for filtering
3. Status filter dropdown
4. Pagination
5. Click patient name or row navigates to patient detail

**States:**

| State | UI |
|---|---|
| Loading | Skeleton table |
| Error | Error message with retry |
| Empty | "No patients found" |
| Success | Full patient table |

---

### 5.3 AdminPatientDetailPage (FULLY UPDATED)

**Route:** `/admin/patients/:patientId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View patient details with full records (like staff view) and edit visits

**Behavior:**

1. Uses `useAdminPatientFullDetail(patientId)` hook - fetches ALL data
2. Displays patient demographics with all fields
3. Displays medical diagnosis with all fields
4. Displays KPS/PPS progress graph (if data exists)
5. Displays tabs with FULL DATA:
   - **Visits:** Full visit details with expandable rows, Edit button
   - **Medications:** Full medication details
   - **Labs:** Full lab test details
   - **Referrals:** Full referral details
   - **Admissions:** Full admission details
6. Each visit has an "Edit" button (admin only)
7. Click "Edit" opens VisitEditModal with full visit data
8. After edit, visit data refreshes and shows audit trail
9. Print/Export button
10. Close Case button opens modal

**Components:**

- `PatientDemographics` (full)
- `PatientDiagnosis` (full)
- `PatientProgressGraph` (KPS/PPS)
- `Tabs` with full data components:
  - `AdminVisitList` (with Edit)
  - `AdminMedicationList`
  - `AdminLabList`
  - `AdminReferralList`
  - `AdminAdmissionList`
- `VisitEditModal`
- `PrintButton`
- `CloseCaseButton`
- `CloseCaseModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details with all records |

---

### 5.4 AdminPatientPrintPage (NEW)

**Route:** `/admin/patients/:patientId/print`

**Layout:** `PrintLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Dedicated print-friendly view for admin patient history with full visit details

**Behavior:**

1. Uses `useAdminPatientPrint(patientId)` hook
2. Displays print-optimized layout with ALL patient records and FULL details
3. Automatically triggers print dialog on load
4. Includes institution header (Yekatit 12 Hospital Medical College)
5. Shows all sections with complete data:
   - **Patient Demographics:** All fields
   - **KPS/PPS Progress Graph:** Visual trends
   - **Visits:** FULL details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures)
   - **Medications:** Complete details
   - **Laboratory Tests:** Full details
   - **Referrals:** Complete details including prepared by, signature, action taken
   - **Admissions:** Full details including care plans
6. Shows generated timestamp and admin user info

**Components:**

- `AdminPatientPrintView`

**States:**

| State | UI |
|---|---|
| Loading | "Loading patient data..." |
| Error | Error message with retry |
| Success | Full print view with auto-print |

---

### 5.5 StaffManagementPage

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

---

### 5.6 ReferralManagementPage (UPDATED)

**Route:** `/admin/referrals`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Manage referral approvals

**Behavior:**

1. Uses `usePendingReferrals()` hook
2. Displays list of pending referrals
3. Patient name is clickable → navigates to `/admin/patients/:patientId`
4. Approve button confirms referral
5. Decline button removes from list
6. Refreshes list on action

---

### 5.7 ReportsPage

**Route:** `/admin/reports`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View system reports

**Behavior:**

1. Uses `useReports()` hook
2. Date range filter
3. Displays charts and statistics
4. Export buttons for PDF/Excel

---

### 5.8 SettingsPage

**Route:** `/admin/settings`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** System settings (placeholder)

**Behavior:**
- Shows system information
- Future feature placeholder

---

## 6. Page Implementations

### AdminDashboardPage

```typescript
// src/pages/admin/AdminDashboardPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useNotifications, useMarkNotificationRead } from '@/hooks/useAdmin';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { NotificationList } from '@/components/admin/NotificationList';
import { StaffApprovalList } from '@/components/admin/StaffApprovalList';
import { ReferralApprovalList } from '@/components/admin/ReferralApprovalList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: notificationsData, isLoading: notifLoading } = useNotifications({ limit: 10 });
  const markReadMutation = useMarkNotificationRead();

  const handlePatientClick = (patientId: string) => {
    navigate(`/admin/patients/${patientId}`);
  };

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
          onPatientClick={handlePatientClick}
        />

        <StaffApprovalList />
      </div>

      <ReferralApprovalList />
    </div>
  );
};
```

### AdminPatientDetailPage (FULLY UPDATED)

```typescript
// src/pages/admin/AdminPatientDetailPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminPatientFullDetail, useUpdateVisit, useCloseCase } from '@/hooks/useAdmin';
import { PatientDemographics } from '@/components/patients/PatientDemographics';
import { PatientDiagnosis } from '@/components/patients/PatientDiagnosis';
import { PatientProgressGraph } from '@/components/patients/PatientProgressGraph';
import { AdminVisitList } from '@/components/admin/AdminVisitList';
import { AdminMedicationList } from '@/components/admin/AdminMedicationList';
import { AdminLabList } from '@/components/admin/AdminLabList';
import { AdminReferralList } from '@/components/admin/AdminReferralList';
import { AdminAdmissionList } from '@/components/admin/AdminAdmissionList';
import { VisitEditModal } from '@/components/admin/VisitEditModal';
import { CloseCaseModal } from '@/components/admin/CloseCaseModal';
import { PrintButton } from '@/components/common/PrintButton';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visits');
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useAdminPatientFullDetail(patientId!);
  const updateVisitMutation = useUpdateVisit();
  const closeCaseMutation = useCloseCase();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorState onRetry={refetch} />;
  }

  const handleEditVisit = (visitId: string) => {
    setEditingVisit(visitId);
  };

  const handleSaveVisit = (visitId: string, updatedData: any) => {
    updateVisitMutation.mutate(
      { visitId, data: updatedData },
      {
        onSuccess: () => {
          setEditingVisit(null);
          refetch();
        },
      }
    );
  };

  const handleCloseCase = (reason: 'Improved' | 'Deceased') => {
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason } },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          refetch();
        },
      }
    );
  };

  const currentVisit = editingVisit 
    ? data.visits.find(v => v.id === editingVisit) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {data.firstName} {data.lastName}
          </h1>
          <p className="text-muted-foreground">
            {data.patientDisplayId} · {data.status}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton 
            patientId={patientId!} 
            patientName={`${data.firstName} ${data.lastName}`}
          />
          {data.status === 'Active' && (
            <Button 
              variant="destructive" 
              onClick={() => setIsCloseModalOpen(true)}
            >
              Close Case
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/patients')}>
            Back
          </Button>
        </div>
      </div>

      {/* Patient Demographics */}
      <PatientDemographics patient={data} />

      {/* Diagnosis */}
      <PatientDiagnosis diagnosis={data} />

      {/* KPS/PPS Progress Graph */}
      {data.progress && data.progress.data.length > 0 && (
        <PatientProgressGraph
          patientName={`${data.firstName} ${data.lastName}`}
          data={data.progress.data}
          trends={data.progress.trends}
        />
      )}

      {/* Tabs with Full Data */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visits">Visits ({data.visits.length})</TabsTrigger>
          <TabsTrigger value="medications">Medications ({data.medications.length})</TabsTrigger>
          <TabsTrigger value="labs">Lab Tests ({data.labTests.length})</TabsTrigger>
          <TabsTrigger value="referrals">Referrals ({data.referrals.length})</TabsTrigger>
          <TabsTrigger value="admissions">Admissions ({data.admissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          <AdminVisitList
            visits={data.visits}
            patientId={patientId!}
            onEdit={handleEditVisit}
          />
        </TabsContent>

        <TabsContent value="medications">
          <AdminMedicationList medications={data.medications} />
        </TabsContent>

        <TabsContent value="labs">
          <AdminLabList labTests={data.labTests} />
        </TabsContent>

        <TabsContent value="referrals">
          <AdminReferralList referrals={data.referrals} />
        </TabsContent>

        <TabsContent value="admissions">
          <AdminAdmissionList admissions={data.admissions} />
        </TabsContent>
      </Tabs>

      {/* Edit Visit Modal */}
      {currentVisit && (
        <VisitEditModal
          open={!!editingVisit}
          visitId={editingVisit!}
          patientName={`${data.firstName} ${data.lastName}`}
          visitData={currentVisit}
          onClose={() => setEditingVisit(null)}
          onSave={(data) => handleSaveVisit(editingVisit!, data)}
          isSubmitting={updateVisitMutation.isPending}
          editHistory={currentVisit.editHistory}
        />
      )}

      {/* Close Case Modal */}
      <CloseCaseModal
        open={isCloseModalOpen}
        patientId={patientId!}
        patientName={`${data.firstName} ${data.lastName}`}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseCase}
      />
    </div>
  );
};
```

---

## 7. Flow Diagram (UPDATED)

```
+-----------------------------------------------------------+
|                  ADMIN FLOW (FRONTEND)                     |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    DASHBOARD FLOW                    | |
|  |                                                     | |
|  |  Admin -> /admin -> AdminDashboardPage              | |
|  |         -> useDashboardStats()                      | |
|  |         -> GET /admin/dashboard/stats               | |
|  |         -> useNotifications()                       | |
|  |         -> GET /admin/dashboard/notifications       | |
|  |         -> usePendingStaff()                        | |
|  |         -> GET /admin/staff/pending                 | |
|  |         -> usePendingReferrals()                    | |
|  |         -> GET /admin/referrals/pending             | |
|  |         -> Display stats, notifications, pending    | |
|  |         -> Click patient name -> Navigate to patient| |
|  |         -> Auto-refresh every 30 seconds            | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PATIENT FLOW (UPDATED)            | |
|  |                                                     | |
|  |  Admin -> /admin/patients -> AdminPatientListPage   | |
|  |         -> useAdminPatients()                       | |
|  |         -> GET /admin/patients                      | |
|  |         -> Display patient list                     | |
|  |         -> Click patient -> /admin/patients/:id     | |
|  |         -> useAdminPatientFullDetail()              | |
|  |         -> GET /admin/patients/:id/full             | |
|  |         -> Display FULL patient details:            | |
|  |            - Demographics (all fields)              | |
|  |            - Diagnosis (all fields)                 | |
|  |            - KPS/PPS Progress Graph                 | |
|  |            - Visits (FULL details + Edit)           | |
|  |            - Medications (FULL details)             | |
|  |            - Labs (FULL details)                    | |
|  |            - Referrals (FULL details)               | |
|  |            - Admissions (FULL details)              | |
|  |         -> Edit visit -> useUpdateVisit()           | |
|  |         -> PUT /admin/visits/:visitId               | |
|  |         -> Close case -> useCloseCase()             | |
|  |         -> PUT /admin/patients/:id/close-case       | |
|  |         -> Print -> /admin/patients/:id/print       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PRINT FLOW (NEW)                  | |
|  |                                                     | |
|  |  Admin clicks Print -> /admin/patients/:id/print    | |
|  |         -> AdminPatientPrintPage                    | |
|  |         -> useAdminPatientPrint(id)                 | |
|  |         -> GET /admin/patients/:id/print            | |
|  |         -> Display print-optimized view with        | |
|  |            ALL patient data (FULL visit details)    | |
|  |         -> Auto-trigger window.print()              | |
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
|  |                    REFERRAL FLOW (UPDATED)           | |
|  |                                                     | |
|  |  Admin -> /admin/referrals -> ReferralManagementPage| |
|  |         -> usePendingReferrals()                    | |
|  |         -> GET /admin/referrals/pending             | |
|  |         -> Display pending referrals                | |
|  |         -> Click patient name -> Navigate to patient| |
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