import apiClient from './client';
import type {
  DashboardStats,
  NotificationsResponse,
  PendingStaff,
  ApproveStaffRequest,
  ApprovedStaffResponse,
  CloseCaseRequest,
  CloseCaseResponse,
  AdminPatient,
  AdminPatientDetail,
  ReportData,
  StaffListResponse,
  StaffDetail,
  UpdateStaffRequest,
  DeletedStaffResponse,
} from '@/types/admin.types';
import type { Referral } from '@/types/referral.types';

// ─────────────────────────────────────────────────────────────
// Visit edit payload — mirrors the backend `updateVisitSchema`
// ─────────────────────────────────────────────────────────────

export interface AdminUpdateVisitRequest {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  overallStatus?: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  painScore?: number;
  ppsScore?: number;
  kpsScore?: number;
  outcome?:
    | 'Stable'
    | 'SymptomsImproved'
    | 'SymptomsUnchanged'
    | 'SymptomsWorsened'
    | 'ReferredToFacility'
    | 'Deceased';
}

export interface AdminUpdateVisitResponse {
  id: string;
  updatedAt: string;
  changes: Array<{ field: string; from: unknown; to: unknown }>;
}

export const adminApi = {
  // ── Dashboard ─────────────────────────────────────────────
  getDashboardStats: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats').then((r) => r.data);
  },

  getNotifications: (
    params?: { limit?: number; read?: boolean },
  ): Promise<NotificationsResponse> => {
    return apiClient
      .get<NotificationsResponse>('/admin/dashboard/notifications', { params })
      .then((r) => r.data);
  },

  markNotificationRead: (id: string): Promise<{ id: string; read: boolean }> => {
    return apiClient
      .put<{ id: string; read: boolean }>(`/admin/dashboard/notifications/${id}/read`)
      .then((r) => r.data);
  },

  // ── Patients ─────────────────────────────────────────────
  getPatients: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ items: AdminPatient[]; total: number }> => {
    return apiClient
      .get<{ items: AdminPatient[]; total: number }>('/admin/patients', { params })
      .then((r) => r.data);
  },

  getPatientDetail: (patientId: string): Promise<AdminPatientDetail> => {
    return apiClient
      .get<AdminPatientDetail>(`/admin/patients/${patientId}`)
      .then((r) => r.data);
  },

  closeCase: (
    patientId: string,
    data: CloseCaseRequest,
  ): Promise<CloseCaseResponse> => {
    return apiClient
      .put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data)
      .then((r) => r.data);
  },

  // ── Staff management ─────────────────────────────────────
  getPendingStaff: (): Promise<PendingStaff[]> => {
    return apiClient.get<PendingStaff[]>('/admin/staff/pending').then((r) => r.data);
  },

  approveStaff: (
    staffId: string,
    data: ApproveStaffRequest,
  ): Promise<ApprovedStaffResponse> => {
    return apiClient
      .put<ApprovedStaffResponse>(`/admin/staff/${staffId}/approve`, data)
      .then((r) => r.data);
  },

  rejectStaff: (staffId: string): Promise<{ id: string; status: string }> => {
    return apiClient
      .put<{ id: string; status: string }>(`/admin/staff/${staffId}/reject`)
      .then((r) => r.data);
  },

  // ── NEW: Active staff list + CRUD ────────────────────────
  getStaffList: (params?: {
    page?: number;
    limit?: number;
    status?: 'Active' | 'Pending' | 'Rejected' | 'Deleted' | 'All';
    role?: 'TeamLeader' | 'Physician' | 'Nurse';
    search?: string;
  }): Promise<StaffListResponse> => {
    return apiClient
      .get<StaffListResponse>('/admin/staff', { params })
      .then((r) => r.data);
  },

  getStaffById: (staffId: string): Promise<StaffDetail> => {
    return apiClient
      .get<StaffDetail>(`/admin/staff/${staffId}`)
      .then((r) => r.data);
  },

  updateStaff: (
    staffId: string,
    data: UpdateStaffRequest,
  ): Promise<StaffDetail> => {
    return apiClient
      .put<StaffDetail>(`/admin/staff/${staffId}`, data)
      .then((r) => r.data);
  },

  deleteStaff: (
    staffId: string,
    reason?: string,
  ): Promise<DeletedStaffResponse> => {
    return apiClient
      .delete<DeletedStaffResponse>(`/admin/staff/${staffId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  restoreStaff: (staffId: string): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(`/admin/staff/${staffId}/restore`)
      .then((r) => r.data);
  },

  // ── Referrals ────────────────────────────────────────────
  getPendingReferrals: (): Promise<Referral[]> => {
    return apiClient.get<Referral[]>('/admin/referrals/pending').then((r) => r.data);
  },

  approveReferral: (referralId: string): Promise<Referral> => {
    return apiClient
      .put<Referral>(`/admin/referrals/${referralId}/approve`)
      .then((r) => r.data);
  },

  declineReferral: (referralId: string): Promise<Referral> => {
    return apiClient
      .put<Referral>(`/admin/referrals/${referralId}/decline`)
      .then((r) => r.data);
  },

  // ── Reports ──────────────────────────────────────────────
  getReports: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ReportData> => {
    return apiClient.get<ReportData>('/admin/reports', { params }).then((r) => r.data);
  },

  // ── Admin visit edit / delete / restore ──────────────────
  updateVisit: (
    visitId: string,
    data: AdminUpdateVisitRequest,
  ): Promise<AdminUpdateVisitResponse> => {
    return apiClient
      .put<AdminUpdateVisitResponse>(`/admin/visits/${visitId}`, data)
      .then((r) => r.data);
  },

  deleteVisit: (
    visitId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: string; success: boolean; deletedAt: string }>(
        `/admin/visits/${visitId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreVisit: (visitId: string): Promise<{ id: string; restored: boolean }> => {
    return apiClient
      .post<{ id: string; restored: boolean }>(`/admin/visits/${visitId}/restore`)
      .then((r) => r.data);
  },
};