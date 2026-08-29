# function-level-specification/frontend/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: ADMIN

## 1. Overview

This document defines the function-level specification for frontend admin features including dashboard, patient management, staff management, referral management, reports, and settings.

**Files Covered:**
- `src/api/admin.ts`
- `src/hooks/useAdmin.ts`
- `src/components/admin/DashboardStats.tsx`
- `src/components/admin/NotificationList.tsx`
- `src/components/admin/StaffApprovalList.tsx`
- `src/components/admin/ReferralApprovalList.tsx`
- `src/components/admin/CloseCaseModal.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminPatientListPage.tsx`
- `src/pages/admin/AdminPatientDetailPage.tsx`
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
| closeCase | `(patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse>` | PUT /admin/patients/:patientId/close-case |
| getPendingStaff | `(): Promise<PendingStaff[]>` | GET /admin/staff/pending |
| approveStaff | `(staffId: string, data: ApproveStaffRequest): Promise<ApprovedStaffResponse>` | PUT /admin/staff/:staffId/approve |
| rejectStaff | `(staffId: string): Promise<{ id: string; status: string }>` | PUT /admin/staff/:staffId/reject |
| getPendingReferrals | `(): Promise<Referral[]>` | GET /admin/referrals/pending |
| approveReferral | `(referralId: string): Promise<Referral>` | PUT /admin/referrals/:referralId/approve |
| declineReferral | `(referralId: string): Promise<Referral>` | PUT /admin/referrals/:referralId/decline |
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

#### Patient Management Hooks

| Hook | Signature | Purpose | Query Key |
|---|---|---|---|
| useAdminPatients | `(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<{ items: AdminPatient[]; total: number }>` | Get all patients | `['admin', 'patients', params]` |
| useAdminPatientDetail | `(patientId: string): UseQueryResult<AdminPatientDetail>` | Get patient detail | `['admin', 'patients', patientId]` |
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

### 4.2 NotificationList

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

**Behavior:**
- Renders list of notifications
- Unread notifications highlighted
- Mark as read button for unread notifications
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

### 4.4 ReferralApprovalList

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

**Behavior:**
- Renders table of pending referrals
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

## 5. Pages

### 5.1 AdminDashboardPage

**Route:** `/admin`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Admin dashboard

**Behavior:**
1. Uses `useDashboardStats()` hook
2. Uses `useNotifications({ limit: 10 })` hook
3. Uses `usePendingStaff()` hook
4. Uses `usePendingReferrals()` hook
5. Renders DashboardStats, NotificationList, StaffApprovalList, ReferralApprovalList
6. Auto-refreshes every 30 seconds

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards and lists |
| Error | Error message with retry |
| Success | Full dashboard |
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
5. Click patient row navigates to detail

**States:**

| State | UI |
|---|---|
| Loading | Skeleton table |
| Error | Error message with retry |
| Empty | "No patients found" |
| Success | Full patient table |

---

### 5.3 AdminPatientDetailPage

**Route:** `/admin/patients/:patientId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View patient details and close case

**Behavior:**
1. Uses `useAdminPatientDetail(patientId)` hook
2. Displays patient demographics and diagnosis
3. Displays tabs for visits, medications, labs, referrals, admissions
4. Close Case button opens modal

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details |

---

### 5.4 StaffManagementPage

**Route:** `/admin/staff`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Manage staff registrations

**Behavior:**
1. Uses `usePendingStaff()` hook
2. Approve button opens role selection modal
3. Reject button with confirmation
4. Refreshes list on action

---

### 5.5 ReferralManagementPage

**Route:** `/admin/referrals`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Manage referral approvals

**Behavior:**
1. Uses `usePendingReferrals()` hook
2. Approve button confirms referral
3. Decline button removes from list
4. Click row opens detail modal

---

### 5.6 ReportsPage

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

### 5.7 SettingsPage

**Route:** `/admin/settings`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** System settings (placeholder)

**Behavior:**
- Shows system information
- Future feature placeholder

---

## 6. Flow Diagram

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
