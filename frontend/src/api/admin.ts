import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAdminApi } from './mocks/admin.mock';
import type {
  DashboardStats, NotificationsResponse, PendingStaff,
  ApproveStaffRequest, ApprovedStaffResponse,
  CloseCaseRequest, CloseCaseResponse,
  AdminPatient, AdminPatientDetail, ReportData,
} from '@/types/admin.types';
import type { Referral } from '@/types/referral.types';

export interface AdminUpdateVisitRequest {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  overallStatus?: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  painScore?: number;
  ppsScore?: number;
  kpsScore?: number;
  outcome?:
    | 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged'
    | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
}

export const adminApi = {
  // ── Dashboard ─────────────────────────────────────────────
  getDashboardStats: (): Promise<DashboardStats> => {
    if (USE_MOCK) return mockAdminApi.getDashboardStats();
    return apiClient.get<DashboardStats>('/admin/dashboard/stats').then((r) => r.data);
  },

  getNotifications: (params?: { limit?: number; read?: boolean }): Promise<NotificationsResponse> => {
    if (USE_MOCK) return mockAdminApi.getNotifications(params);
    return apiClient.get<NotificationsResponse>('/admin/dashboard/notifications', { params }).then((r) => r.data);
  },

  markNotificationRead: (id: string): Promise<{ id: string; read: boolean }> => {
    if (USE_MOCK) return mockAdminApi.markNotificationRead(id);
    return apiClient.put<{ id: string; read: boolean }>(`/admin/dashboard/notifications/${id}/read`).then((r) => r.data);
  },

  // ── Patients ─────────────────────────────────────────────
  getPatients: (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }> => {
    if (USE_MOCK) return mockAdminApi.getPatients(params);
    return apiClient.get<{ items: AdminPatient[]; total: number }>('/admin/patients', { params }).then((r) => r.data);
  },

  getPatientDetail: (patientId: string): Promise<AdminPatientDetail> => {
    if (USE_MOCK) return mockAdminApi.getPatientDetail(patientId);
    return apiClient.get<AdminPatientDetail>(`/admin/patients/${patientId}`).then((r) => r.data);
  },

  /**
   * Legacy close-case path. Flips Patient.status to Discharged and
   * records a notification — but does NOT create a DischargeSummary.
   * Prefer `dischargeApi.create()` for real discharges.
   */
  closeCase: (patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse> => {
    if (USE_MOCK) return mockAdminApi.closeCase(patientId, data) as any;
    return apiClient.put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data).then((r) => r.data);
  },

  // ── Staff management ─────────────────────────────────────
  getPendingStaff: (): Promise<PendingStaff[]> => {
    if (USE_MOCK) return mockAdminApi.getPendingStaff();
    return apiClient.get<PendingStaff[]>('/admin/staff/pending').then((r) => r.data);
  },

  approveStaff: (staffId: string, data: ApproveStaffRequest): Promise<ApprovedStaffResponse> => {
    if (USE_MOCK) return mockAdminApi.approveStaff(staffId, data);
    return apiClient.put<ApprovedStaffResponse>(`/admin/staff/${staffId}/approve`, data).then((r) => r.data);
  },

  rejectStaff: (staffId: string): Promise<{ id: string; status: string }> => {
    if (USE_MOCK) return mockAdminApi.rejectStaff(staffId);
    return apiClient.put<{ id: string; status: string }>(`/admin/staff/${staffId}/reject`).then((r) => r.data);
  },

  // ── Referrals ────────────────────────────────────────────
  getPendingReferrals: (): Promise<Referral[]> => {
    if (USE_MOCK) return mockAdminApi.getPendingReferrals();
    return apiClient.get<Referral[]>('/admin/referrals/pending').then((r) => r.data);
  },

  approveReferral: (referralId: string): Promise<Referral> => {
    if (USE_MOCK) return mockAdminApi.approveReferral(referralId);
    return apiClient.put<Referral>(`/admin/referrals/${referralId}/approve`).then((r) => r.data);
  },

  declineReferral: (referralId: string): Promise<Referral> => {
    if (USE_MOCK) return mockAdminApi.declineReferral(referralId);
    return apiClient.put<Referral>(`/admin/referrals/${referralId}/decline`).then((r) => r.data);
  },

  // ── Reports ──────────────────────────────────────────────
  getReports: (params?: { startDate?: string; endDate?: string }): Promise<ReportData> => {
    if (USE_MOCK) return mockAdminApi.getReports();
    return apiClient.get<ReportData>('/admin/reports', { params }).then((r) => r.data);
  },

  // ── Admin visit edit / delete / restore ──────────────────
  updateVisit: (visitId: string, data: AdminUpdateVisitRequest): Promise<any> => {
    if (USE_MOCK) return mockAdminApi.updateVisit(visitId, data);
    return apiClient.put(`/admin/visits/${visitId}`, data).then((r) => r.data);
  },

  deleteVisit: (visitId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, success: true });
    return apiClient.delete<{ id: string; success: boolean }>(`/admin/visits/${visitId}`, { data: { reason } }).then((r) => r.data);
  },

  restoreVisit: (visitId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: visitId, restored: true });
    return apiClient.post<{ id: string; restored: boolean }>(`/admin/visits/${visitId}/restore`).then((r) => r.data);
  },
};