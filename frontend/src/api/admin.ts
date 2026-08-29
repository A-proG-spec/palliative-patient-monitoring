// src/api/admin.ts
// Endpoints:
//   GET  /admin/dashboard/stats
//   GET  /admin/dashboard/notifications
//   PUT  /admin/dashboard/notifications/:notificationId/read
//   GET  /admin/patients
//   GET  /admin/patients/:patientId
//   PUT  /admin/patients/:patientId/close-case
//   GET  /admin/staff/pending
//   PUT  /admin/staff/:staffId/approve
//   PUT  /admin/staff/:staffId/reject
//   GET  /admin/referrals/pending
//   PUT  /admin/referrals/:referralId/approve
//   PUT  /admin/referrals/:referralId/decline
//   GET  /admin/reports
//   GET  /admin/reports/export

import api from './client';
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
} from '@/types/admin.types';
import type { Referral } from '@/types/referral.types';

export const adminApi = {
  // ── Dashboard ────────────────────────────────────────────────────────────

  /** GET /admin/dashboard/stats */
  getDashboardStats: (): Promise<DashboardStats> =>
    api.get<DashboardStats>('/admin/dashboard/stats').then((res) => res.data),

  /** GET /admin/dashboard/notifications */
  getNotifications: (params?: {
    limit?: number;
    read?: boolean;
  }): Promise<NotificationsResponse> =>
    api
      .get<NotificationsResponse>('/admin/dashboard/notifications', { params })
      .then((res) => res.data),

  /** PUT /admin/dashboard/notifications/:notificationId/read */
  markNotificationRead: (
    notificationId: string
  ): Promise<{ id: string; read: boolean }> =>
    api
      .put<{ id: string; read: boolean }>(
        `/admin/dashboard/notifications/${notificationId}/read`
      )
      .then((res) => res.data),

  // ── Patients ─────────────────────────────────────────────────────────────

  /** GET /admin/patients */
  getPatients: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ items: AdminPatient[]; page: number; limit: number; total: number }> =>
    api
      .get<{ items: AdminPatient[]; page: number; limit: number; total: number }>(
        '/admin/patients',
        { params }
      )
      .then((res) => res.data),

  /** GET /admin/patients/:patientId */
  getPatientDetail: (patientId: string): Promise<AdminPatientDetail> =>
    api
      .get<AdminPatientDetail>(`/admin/patients/${patientId}`)
      .then((res) => res.data),

  /** PUT /admin/patients/:patientId/close-case */
  closeCase: (
    patientId: string,
    data: CloseCaseRequest
  ): Promise<CloseCaseResponse> =>
    api
      .put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data)
      .then((res) => res.data),

  // ── Staff ─────────────────────────────────────────────────────────────────

  /** GET /admin/staff/pending */
  getPendingStaff: (): Promise<PendingStaff[]> =>
    api
      .get<PendingStaff[]>('/admin/staff/pending')
      .then((res) => res.data),

  /** PUT /admin/staff/:staffId/approve */
  approveStaff: (
    staffId: string,
    data: ApproveStaffRequest
  ): Promise<ApprovedStaffResponse> =>
    api
      .put<ApprovedStaffResponse>(`/admin/staff/${staffId}/approve`, data)
      .then((res) => res.data),

  /** PUT /admin/staff/:staffId/reject */
  rejectStaff: (staffId: string): Promise<{ id: string; status: string }> =>
    api
      .put<{ id: string; status: string }>(`/admin/staff/${staffId}/reject`)
      .then((res) => res.data),

  // ── Referrals ─────────────────────────────────────────────────────────────

  /** GET /admin/referrals/pending */
  getPendingReferrals: (): Promise<Referral[]> =>
    api
      .get<Referral[]>('/admin/referrals/pending')
      .then((res) => res.data),

  /** PUT /admin/referrals/:referralId/approve */
  approveReferral: (referralId: string): Promise<Referral> =>
    api
      .put<Referral>(`/admin/referrals/${referralId}/approve`)
      .then((res) => res.data),

  /** PUT /admin/referrals/:referralId/decline */
  declineReferral: (referralId: string): Promise<Referral> =>
    api
      .put<Referral>(`/admin/referrals/${referralId}/decline`)
      .then((res) => res.data),

  // ── Reports ───────────────────────────────────────────────────────────────

  /** GET /admin/reports */
  getReports: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ReportData> =>
    api
      .get<ReportData>('/admin/reports', { params })
      .then((res) => res.data),

  /** GET /admin/reports/export  — returns a Blob for download */
  exportReport: (format: 'pdf' | 'excel'): Promise<Blob> =>
    api
      .get(`/admin/reports/export`, {
        params: { format },
        responseType: 'blob',
      })
      .then((res) => res.data),
};
