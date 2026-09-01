# frontend-specification/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMIN SPECIFICATION

## 1. Overview

This document defines the frontend implementation for admin features including dashboard, patient management (with full detail view like staff), staff management, referral management (with clickable patient names), reports, settings, admin edit visits, and print/export patient history.

**API Reference:** `api/02-admin.md`, `api/11-admin-visits.md`

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
| `/admin/patients/:patientId/print` | `AdminPatientPrintPage` | `PrintLayout` | Admin |
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

// ============================================
// ADMIN FULL PATIENT DETAIL (LIKE STAFF VIEW)
// ============================================

export interface AdminVisitDetail {
  id: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{ role: string; name: string }>;
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
  adl: {
    feeding: string;
    bathing: string;
    dressing: string;
    toileting: string;
    mobility: string;
  };
  ppsScore: number;
  kpsScore: number;
  appetite: string;
  oralIntake: string;
  hydrationStatus: string;
  emotionalStatus: string;
  familySupport: string;
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: string;
  currentMedications: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden: string;
  caregiverUnderstanding: string;
  caregivingCapacity: string;
  familyEmotionalStatus: string;
  educationProvided: string[];
  homeCondition: string;
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  outcome: string;
  nextVisitDate?: string;
  teamLeader: { id: string; name: string };
  physician: { id: string; name: string };
  nurse: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: string;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
  canEdit: boolean; // Always true for admin
}

export interface AdminMedicationDetail {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  prescribedBy: { id: string; name: string };
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminLabDetail {
  id: string;
  testName: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: { id: string; name: string };
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminReferralDetail {
  id: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  status: string;
  actionTaken?: string;
  outcome?: string;
  followUpDate?: string;
  followUpStatus?: string;
  requestedBy: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAdmissionDetail {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: string;
  comorbidities: string[];
  estimatedPrognosis: string;
  ppsScore: number;
  functionalStatus: string;
  painScore: number;
  painType: string;
  symptomsPresent: string[];
  emotionalStatus: string;
  familySupport: string;
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: string;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: string;
  status: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface AdminPatientFullDetail extends AdminPatient {
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
  visits: AdminVisitDetail[];
  medications: AdminMedicationDetail[];
  labTests: AdminLabDetail[];
  referrals: AdminReferralDetail[];
  admissions: AdminAdmissionDetail[];
  createdAt: string;
  updatedAt: string;
  // Progress data for KPS/PPS graph
  progress: {
    data: Array<{ visitId: string; visitDate: string; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
}

// ============================================
// ADMIN VISIT UPDATE TYPES
// ============================================

export interface UpdateVisitRequest {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  visitType?: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers?: Array<{ role: string; name: string; staffId?: string }>;
  overallStatus?: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility?: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;
    respiration?: number;
    spo2?: number;
  };
  painScore?: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective?: boolean;
  symptoms?: string[];
  adl?: {
    feeding?: string;
    bathing?: string;
    dressing?: string;
    toileting?: string;
    mobility?: string;
  };
  ppsScore?: number;
  kpsScore?: number;
  appetite?: string;
  oralIntake?: string;
  hydrationStatus?: string;
  emotionalStatus?: string;
  familySupport?: string;
  financialDifficulty?: boolean;
  spiritualNeeds?: boolean;
  religiousSupportRequested?: boolean;
  medicationAvailable?: boolean;
  medicationCorrectlyTaken?: boolean;
  medicationSideEffects?: boolean;
  medicationRefillNeeded?: boolean;
  morphineAvailable?: boolean;
  adherenceLevel?: string;
  currentMedications?: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden?: string;
  caregiverUnderstanding?: string;
  caregivingCapacity?: string;
  familyEmotionalStatus?: string;
  educationProvided?: string[];
  homeCondition?: string;
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome?: string;
  nextVisitDate?: string;
  teamLeaderId?: string;
  physicianId?: string;
  nurseId?: string;
}

export interface UpdateVisitResponse {
  id: string;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  };
  changes: Array<{
    field: string;
    from: any;
    to: any;
  }>;
}

// ============================================
// ADMIN PRINT TYPES
// ============================================

export interface AdminPrintData {
  patient: {
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    caregiverName: string;
    caregiverPhone: string;
    status: string;
    currentLocation: string;
    primaryDiagnosis: string;
    secondaryDiagnoses: string[];
    diseaseStage: string;
    comorbidities: string[];
    estimatedPrognosis: string;
    registeredBy: { id: string; name: string };
    createdAt: string;
  };
  progress: {
    data: Array<{ visitId: string; visitDate: string; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  visits: AdminVisitDetail[];
  medications: AdminMedicationDetail[];
  labTests: AdminLabDetail[];
  referrals: AdminReferralDetail[];
  admissions: AdminAdmissionDetail[];
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
    role: string;
  };
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
  AdminPatientFullDetail,
  AdminPrintData,
  UpdateVisitRequest,
  UpdateVisitResponse,
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

  // Patients - Full detail like staff view
  getPatients: (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }> => {
    return api.get<{ items: AdminPatient[]; total: number }>('/admin/patients', { params }).then((res) => res.data);
  },

  getPatientFullDetail: (patientId: string): Promise<AdminPatientFullDetail> => {
    return api.get<AdminPatientFullDetail>(`/admin/patients/${patientId}/full`).then((res) => res.data);
  },

  // Admin Visit Management
  updateVisit: (visitId: string, data: UpdateVisitRequest): Promise<UpdateVisitResponse> => {
    return api.put<UpdateVisitResponse>(`/admin/visits/${visitId}`, data).then((res) => res.data);
  },

  getVisitEditHistory: (visitId: string): Promise<Array<{ editedBy: { id: string; name: string }; editedAt: string; changes: Array<{ field: string; from: any; to: any }> }>> => {
    return api.get(`/admin/visits/${visitId}/history`).then((res) => res.data);
  },

  // Admin Print/Export
  getPatientPrintData: (patientId: string): Promise<AdminPrintData> => {
    return api.get<AdminPrintData>(`/admin/patients/${patientId}/print`).then((res) => res.data);
  },

  exportPatientPDF: (patientId: string): Promise<Blob> => {
    return api.get(`/admin/patients/${patientId}/export`, { responseType: 'blob' }).then((res) => res.data);
  },

  // Close Case
  closeCase: (patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse> => {
    return api.put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data).then((res) => res.data);
  },

  // Staff Management
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
import { ApproveStaffRequest, CloseCaseRequest, UpdateVisitRequest } from '@/types/admin.types';

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

// Patient Management Hooks - Full Detail
export function useAdminPatients(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'patients', params],
    queryFn: () => adminApi.getPatients(params),
  });
}

export function useAdminPatientFullDetail(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId, 'full'],
    queryFn: () => adminApi.getPatientFullDetail(patientId),
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

// Admin Visit Management Hooks
export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: UpdateVisitRequest }) =>
      adminApi.updateVisit(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients', variables.visitId, 'full'] });
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

// Admin Print Hooks
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
  onPatientClick?: (patientId: string) => void;
}
```

**Behavior:**
- Renders list of notifications
- Unread notifications highlighted
- Mark as read button for unread notifications
- Clicking on patient name in notification navigates to patient detail page
- Shows "No notifications" empty state

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
  onPatientClick?: (patientId: string) => void;
}
```

**Behavior:**
- Renders table of pending referrals
- Patient name is displayed as a clickable link
- Clicking patient name navigates to `/admin/patients/:patientId`
- Approve and decline buttons
- Shows referral details in modal

**Visual Design:**

```
+-----------------------------------------------------------+
| Pending Referrals                                          |
|                                                           |
| +-------------------------------------------------------+ |
| | Patient       | Diagnosis       | Date       | Action  | |
| +---------------+-----------------+------------+---------+ |
| | Sarah Johnson | Stage IV Breast | 2026-08-29 | [Approv]| |
| | (Clickable)   | Cancer          |            | [Declin]| |
| | Michael Brown | Lung Cancer     | 2026-08-28 | [Approv]| |
| | (Clickable)   |                 |            | [Declin]| |
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

### 7.6 VisitEditModal (Admin Only)

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
  editHistory?: Array<{ editedBy: { name: string }; editedAt: string; changes: Array<{ field: string; from: any; to: any }> }>;
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

**Visual Design:**

```
+-----------------------------------------------------------+
| Edit Visit Record - Sarah Johnson                          |
| Visit Date: 2026-08-29                                     |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Visit Details                                          | |
| | Date: [2026-08-29]  Start: [09:00]  End: [10:30]    | |
| | Type: [Routine ▼]                                     | |
| |                                                       | |
| | General Condition                                     | |
| | Status: [Stable ▼]   Mobility: [Requires Assistance ▼]| |
| |                                                       | |
| | Vital Signs                                           | |
| | Temp: [36.8]  Pulse: [78]  BP: [120/80]             | |
| | Resp: [18]  SpO2: [97]                               | |
| |                                                       | |
| | Pain Assessment                                       | |
| | Pain Score: [3]   Medication Effective: [Yes]        | |
| | Location: [Back]   Characteristics: [Dull]           | |
| |                                                       | |
| | Functional Status                                     | |
| | PPS: [60]   KPS: [60]                                | |
| |                                                       | |
| | Outcome                                               | |
| | [Stable ▼]                                            | |
| |                                                       | |
| |                        [Cancel] [Save Changes]        | |
| +-------------------------------------------------------+ |
|                                                           |
| ⚠️ Last edited by Admin User on 2026-09-01 at 10:30     |
|                                                           |
| 📝 Edit History:                                         |
|    - Field: painScore, From: 5, To: 3                    |
|    - Field: outcome, From: SymptomsWorsened, To: Stable  |
+-----------------------------------------------------------+
```

---

### 7.7 PrintButton (Admin & Staff)

**Purpose:** Print/export patient history as PDF with full visit details

**Props:**

```typescript
interface PrintButtonProps {
  patientId: string;
  patientName: string;
  label?: string;
  variant?: 'button' | 'icon';
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}
```

**Behavior:**
- Opens print dialog with formatted patient data
- Includes institution header (Yekatit 12 Hospital Medical College)
- Shows **ALL** patient records with **FULL DETAILS**:
  - **Patient Demographics:** Complete patient information
  - **KPS/PPS Progress Graph:** Visual trend of patient progress
  - **Visits:** Full visit details including vitals, pain scores, ADL, symptoms, red flags, team members, and signatures
  - **Medications:** Complete medication details (name, dosage, frequency, route, status, prescribed by, administered at)
  - **Laboratory Tests:** Full lab details (test name, ordered date, performed date, result, location, status)
  - **Referrals:** Complete referral details including prepared by, designation, signature, action taken, outcome, follow-up
  - **Admissions:** Full admission details including care plan, pain management, medication plan, nursing care plan
- Professional print-ready formatting
- Available to both Admin and Staff

**Print View Structure:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    YEKATIT 12 HOSPITAL MEDICAL COLLEGE                    │
│                    Palliative Care Unit                                   │
│                    Tel: +251-XXX-XXXXXX                                   │
│                                                                             │
│                    PATIENT HISTORY REPORT                                  │
│                    Generated: 2026-09-01 10:30 AM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENT INFORMATION                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Patient ID: PAT-001                                                 │ │
│  │  Name: Sarah Johnson                                                │ │
│  │  Age: 65   Sex: Female   DOB: 1961-08-15                           │ │
│  │  Address: Bole, Addis Ababa   Phone: +251922222222                  │ │
│  │  Emergency Contact: Michael Johnson (+251933333333)                 │ │
│  │  Caregiver: Michael Johnson (+251933333333)                         │ │
│  │  Status: Active   Location: Home                                   │ │
│  │  Primary Diagnosis: Stage IV Breast Cancer                         │ │
│  │  Secondary Diagnoses: Metastatic to bone                           │ │
│  │  Disease Stage: Advanced                                            │ │
│  │  Comorbidities: Hypertension                                        │ │
│  │  Estimated Prognosis: Months                                       │ │
│  │  Registered: 2026-08-29 by John Doe                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  PATIENT PROGRESS (KPS/PPS)                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  [KPS/PPS PROGRESS GRAPH - showing trends over all visits]          │ │
│  │                                                                       │ │
│  │  KPS: 60 → 55 → 50 → 45 → 40 → 35 (Declining -25%)                 │ │
│  │  PPS: 70 → 65 → 60 → 55 → 50 → 45 (Declining -25%)                 │ │
│  │                                                                       │ │
│  │  Data Points:                                                         │ │
│  │  08/01: KPS=60, PPS=70                                               │ │
│  │  08/08: KPS=55, PPS=65                                               │ │
│  │  08/15: KPS=50, PPS=60                                               │ │
│  │  08/22: KPS=45, PPS=55                                               │ │
│  │  08/29: KPS=40, PPS=50                                               │ │
│  │  09/05: KPS=35, PPS=45                                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  VISIT HISTORY (12 visits) - FULL DETAILS                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Visit 1 - 2026-08-29                                                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Time: 09:00 - 10:30   Type: Routine                                │ │
│  │  Team: Dr. Smith (TeamLeader), Jane Doe (Nurse)                     │ │
│  │                                                                       │ │
│  │  General Condition:                                                   │ │
│  │    Overall Status: Stable                                            │ │
│  │    Mobility: Requires Assistance                                     │ │
│  │                                                                       │ │
│  │  Vital Signs:                                                         │ │
│  │    Temperature: 36.8°C   Pulse: 78 bpm   BP: 120/80 mmHg            │ │
│  │    Respiration: 18/min   SpO2: 97%                                  │ │
│  │                                                                       │ │
│  │  Pain Assessment:                                                     │ │
│  │    Pain Score: 3/10   Medication Effective: Yes                     │ │
│  │    Location: Back   Characteristics: Dull, Intermittent             │ │
│  │                                                                       │ │
│  │  Symptoms: Fatigue, Anxiety                                          │ │
│  │                                                                       │ │
│  │  Functional Status:                                                   │ │
│  │    ADL: Feeding (NeedsAssistance), Bathing (NeedsAssistance),        │ │
│  │         Dressing (Independent), Toileting (NeedsAssistance),         │ │
│  │         Mobility (NeedsAssistance)                                   │ │
│  │    PPS: 60   KPS: 60                                                 │ │
│  │                                                                       │ │
│  │  Nutrition & Hydration:                                               │ │
│  │    Appetite: Fair   Oral Intake: Reduced   Hydration: Adequate      │ │
│  │                                                                       │ │
│  │  Psychosocial:                                                        │ │
│  │    Emotional Status: Stable   Family Support: Good                   │ │
│  │    Financial Difficulty: No                                         │ │
│  │                                                                       │ │
│  │  Spiritual: Spiritual Needs: No   Religious Support: No              │ │
│  │                                                                       │ │
│  │  Medication Review:                                                   │ │
│  │    Medications Available: Yes   Correctly Taken: Yes                 │ │
│  │    Side Effects: No   Refill Needed: No                             │ │
│  │    Morphine Available: Yes   Adherence: Good                        │ │
│  │    Current Medications: Morphine 10mg Every 6h Oral                 │ │
│  │                                                                       │ │
│  │  Caregiver Assessment:                                                │ │
│  │    Burden: Moderate   Understanding: Good   Capacity: Moderate       │ │
│  │    Family Emotional Status: Stable                                   │ │
│  │                                                                       │ │
│  │  Education Provided: Pain Management, Medication Administration     │ │
│  │                                                                       │ │
│  │  Home Environment: Clean   Observations: Adequate Lighting,          │ │
│  │    Ventilation                                                        │ │
│  │                                                                       │ │
│  │  Nursing Care Given: Medication Admin, Counseling                    │ │
│  │                                                                       │ │
│  │  Red Flags: None                                                     │ │
│  │                                                                       │ │
│  │  Outcome: Stable                                                     │ │
│  │  Next Visit: 2026-09-05                                              │ │
│  │                                                                       │ │
│  │  Signatures:                                                          │ │
│  │    Team Leader: Dr. Smith   Physician: Dr. Kebede                   │ │
│  │    Nurse: Jane Doe                                                   │ │
│  │                                                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Visit 2 - 2026-08-22                                                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [Full details of visit 2...]                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All visits listed chronologically with FULL details]              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  MEDICATIONS (5 records) - FULL DETAILS                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Medication: Morphine                                               │ │
│  │    Dosage: 10mg   Frequency: Every 6 hours   Route: Oral            │ │
│  │    Status: Given   Administered At: Home                            │ │
│  │    Prescribed By: Dr. Smith   Prescribed: 2026-08-29                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Medication: Oxycodone                                              │ │
│  │    Dosage: 5mg   Frequency: Every 8 hours   Route: Oral             │ │
│  │    Status: Given   Administered At: Home                            │ │
│  │    Prescribed By: Dr. Kebede   Prescribed: 2026-08-22               │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All medications listed with full details]                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  LABORATORY TESTS (8 records) - FULL DETAILS                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Test: Complete Blood Count                                          │ │
│  │    Date Ordered: 2026-08-29   Date Performed: 2026-08-30            │ │
│  │    Location: Home   Status: Completed                                │ │
│  │    Ordered By: Dr. Smith                                            │ │
│  │    Result: Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250        │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Test: Urinalysis                                                    │ │
│  │    Date Ordered: 2026-08-28   Date Performed: 2026-08-29            │ │
│  │    Location: Home   Status: Completed                                │ │
│  │    Ordered By: Dr. Kebede                                           │ │
│  │    Result: Abnormal - Protein: 2+, Blood: 1+                        │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All lab tests listed with full details]                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  REFERRALS (3 records) - FULL DETAILS                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Referral 1 - 2026-08-29                                             │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Type: Outgoing   Status: Accepted                                  │ │
│  │  Diagnosis: Stage IV Breast Cancer                                  │ │
│  │  Disease Stage: Advanced                                            │ │
│  │  PPS: 60   KPS: 60                                                  │ │
│  │  Symptoms: Pain: 3, Dyspnea: 2, Fatigue: 5, Anxiety: 2, Depression: 1│ │
│  │  Reasons: Pain Management, Symptom Control                          │ │
│  │  From: Home Care Unit   To: Yekatit 12 Hospital                    │ │
│  │  Contact: Dr. Alem (+251944444444)                                  │ │
│  │  Prepared By: Dr. Smith (Physician)                                │ │
│  │  Signature: Dr. Smith                                               │ │
│  │  Action Taken: Referral Accepted                                    │ │
│  │  Outcome: Patient transferred for inpatient care                    │ │
│  │  Follow-up: 2026-09-05 (Pending)                                   │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All referrals listed with full details]                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ADMISSIONS (2 records) - FULL DETAILS                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Admission 1 - 2026-08-30                                            │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Bed: B-12   Ward: Palliative Care Ward                            │ │
│  │  Admitting Physician: Dr. Kebede   Care Team: Team A               │ │
│  │  Status: Active                                                     │ │
│  │  Primary Diagnosis: Stage IV Breast Cancer                          │ │
│  │  Secondary Diagnoses: Metastatic to bone                            │ │
│  │  Disease Stage: Advanced   Prognosis: Months                        │ │
│  │  PPS: 60   Functional Status: Partially Dependent                   │ │
│  │  Pain: Score 4/10   Type: Mixed                                     │ │
│  │  Symptoms: Fatigue, Anxiety                                         │ │
│  │  Emotional Status: Anxious   Family Support: Moderate              │ │
│  │  Spiritual Concerns: No                                             │ │
│  │                                                                       │ │
│  │  Care Plan:                                                          │ │
│  │    Pain Management: Morphine 10mg every 6 hours                     │ │
│  │    Medication Plan: Continue current medications                     │ │
│  │    Nursing Care: Daily monitoring and pain assessment               │ │
│  │    Home-Based Care Required: No                                     │ │
│  │    Physiotherapy Required: No                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All admissions listed with full details]                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Report Generated By: Admin User (Admin) on 2026-09-01                    │
│  This is a computer-generated document.                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 7.8 AdminVisitList (Full Detail View)

**Purpose:** Display full visit list with all details and edit capability

**Props:**

```typescript
interface AdminVisitListProps {
  visits: AdminVisitDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (visitId: string) => void;
  onViewHistory?: (visitId: string) => void;
}
```

**Behavior:**
- Renders table of visits with ALL fields displayed
- Each visit row shows: Date, Time, Type, Status, Outcome, PPS, KPS, Team, Actions
- "Edit" button for each visit (admin only)
- "View History" button showing edit audit trail
- Expandable rows for full visit details

**Visual Design:**

```
+-----------------------------------------------------------+
| Visit History - Full Details                               |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date  | Type   | Status   | Outcome   | PPS | KPS |   | |
| +-------+--------+----------+-----------+-----+-----+---+ |
| | 08-29 | Routin | Stable   | Stable    | 60  | 60  |   | |
| |       | e      |          |           |     |     |   | |
| |       |        |          |           |     |     |   | |
| | 08-22 | Emerg. | Critical | Referred  | 40  | 35  |   | |
| |       |        |          | to        |     |     |   | |
| |       |        |          | Facility  |     |     |   | |
| | 08-15 | First  | Stable   | Stable    | 70  | 65  |   | |
| |       | Assess |          |           |     |     |   | |
| +-------+--------+----------+-----------+-----+-----+---+ |
|                                                           |
| Click [View Details] to see full visit record            |
| Click [Edit] to modify visit (admin only)               |
| Click [History] to view edit audit trail                |
+-----------------------------------------------------------+
```

---

### 7.9 AdminMedicationList (Full Detail View)

**Purpose:** Display full medication list with all details

**Props:**

```typescript
interface AdminMedicationListProps {
  medications: AdminMedicationDetail[];
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Medications - Full Details                                 |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Name     | Dosage | Freq   | Route | Status | Admin At | |
| +----------+--------+--------+-------+--------+----------+ |
| | Morphine | 10mg   | Every  | Oral  | Given  | Home     | |
| |          |        | 6h     |       |        |          | |
| | Oxycodon | 5mg    | Every  | Oral  | Given  | Home     | |
| | e        |        | 8h     |       |        |          | |
| +----------+--------+--------+-------+--------+----------+ |
+-----------------------------------------------------------+
```

---

### 7.10 AdminLabList (Full Detail View)

**Purpose:** Display full lab test list with all details

**Props:**

```typescript
interface AdminLabListProps {
  labTests: AdminLabDetail[];
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Laboratory Tests - Full Details                            |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Test Name       | Ordered  | Performed | Result | Status| |
| +-----------------+----------+-----------+--------+-------+ |
| | Complete Blood  | 2026-08- | 2026-08- | Normal | Com-  | |
| | Count           | 29       | 30       |        | pleted| |
| | Urinalysis      | 2026-08- | 2026-08- | Abnor- | Com-  | |
| |                 | 28       | 29       | mal    | pleted| |
| +-----------------+----------+-----------+--------+-------+ |
+-----------------------------------------------------------+
```

---

### 7.11 AdminReferralList (Full Detail View)

**Purpose:** Display full referral list with all details

**Props:**

```typescript
interface AdminReferralListProps {
  referrals: AdminReferralDetail[];
  loading?: boolean;
}
```

---

### 7.12 AdminAdmissionList (Full Detail View)

**Purpose:** Display full admission list with all details

**Props:**

```typescript
interface AdminAdmissionListProps {
  admissions: AdminAdmissionDetail[];
  loading?: boolean;
}
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
6. Clicking patient name in notifications navigates to patient detail
7. Auto-refreshes every 30 seconds

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
5. Click patient name or row navigates to patient detail

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

### 8.3 AdminPatientDetailPage (FULLY UPDATED)

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
   - **Visits:** Full visit details with expandable rows, Edit button, History button
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
  - `AdminVisitList` (with Edit & History)
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

**Page Implementation:**

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

### 8.5 ReferralManagementPage (UPDATED)

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

**Components:**

- `ReferralApprovalList`
- `ReferralDetailModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No pending referrals" |
| Success | Full list with clickable patient names |

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

---

### 8.8 AdminPatientPrintPage (NEW)

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

## 9. Page Implementations

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
    // Print route with minimal layout
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <PrintLayout />,
          children: [
            { 
              path: '/admin/patients/:patientId/print', 
              element: withSuspense(AdminPatientPrintPage) 
            },
          ],
        },
      ],
    },
  ],
}
```

---

## 11. Flow Diagram (UPDATED)

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
|  |                    REFERRAL FLOW                     | |
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

---

## 12. Audit Trail Display

When an admin edits a visit, the audit trail is displayed:

```
+-----------------------------------------------------------+
| Visit Edit History                                         |
| +-------------------------------------------------------+ |
| | Edited By     | Edited At          | Changes           | |
| +--------------+-------------------+---------------------+ |
| | Admin User   | 2026-09-01 10:30 | painScore: 5 → 3   | |
| |              |                   | outcome: Symptoms   | |
| |              |                   | Worsened → Stable   | |
| | Dr. Smith    | 2026-08-30 14:20 | ppsScore: 55 → 60  | |
| +--------------+-------------------+---------------------+ |
+-----------------------------------------------------------+
```
