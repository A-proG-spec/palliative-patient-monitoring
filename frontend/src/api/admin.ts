import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAdminApi } from './mocks/admin.mock';
import type { DashboardStats, NotificationsResponse, PendingStaff, ApproveStaffRequest, ApprovedStaffResponse, CloseCaseRequest, CloseCaseResponse, AdminPatient, AdminPatientDetail, ReportData } from '@/types/admin.types';
import type { Referral } from '@/types/referral.types';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';

export const adminApi = {
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

  getPatients: (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }> => {
    if (USE_MOCK) return mockAdminApi.getPatients(params);
    return apiClient.get<{ items: AdminPatient[]; total: number }>('/admin/patients', { params }).then((r) => r.data);
  },

  getPatientDetail: (patientId: string): Promise<AdminPatientDetail> => {
    if (USE_MOCK) return mockAdminApi.getPatientDetail(patientId);
    return apiClient.get<AdminPatientDetail>(`/admin/patients/${patientId}`).then((r) => r.data);
  },

  closeCase: (patientId: string, data: CloseCaseRequest): Promise<CloseCaseResponse> => {
    if (USE_MOCK) return mockAdminApi.closeCase(patientId, data);
    return apiClient.put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data).then((r) => r.data);
  },

  // ── Discharge API ─────────────────────────────────────────────
  dischargePatient: (patientId: string, data: DischargeSummary): Promise<{ id: string; status: 'Discharged'; dischargeDate: string }> => {
    if (USE_MOCK) return mockAdminApi.dischargePatient(patientId, data);
    return apiClient.post<{ id: string; status: 'Discharged'; dischargeDate: string }>(`/patients/${patientId}/discharge`, data).then((r) => r.data);
  },

  getDischargeSummary: (patientId: string): Promise<DischargeSummary> => {
    if (USE_MOCK) return mockAdminApi.getDischargeSummary(patientId);
    return apiClient.get<DischargeSummary>(`/patients/${patientId}/discharge-summary`).then((r) => r.data);
  },

  updatePatientStatus: (patientId: string, status: 'Active' | 'Discharged'): Promise<{ id: string; status: string }> => {
    if (USE_MOCK) return mockAdminApi.updatePatientStatus(patientId, status);
    return apiClient.put<{ id: string; status: string }>(`/patients/${patientId}/status`, { status }).then((r) => r.data);
  },

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

  getReports: (params?: { startDate?: string; endDate?: string }): Promise<ReportData> => {
    if (USE_MOCK) return mockAdminApi.getReports();
    return apiClient.get<ReportData>('/admin/reports', { params }).then((r) => r.data);
  },

  exportReport: (format: 'pdf' | 'excel'): Promise<Blob> => {
    if (USE_MOCK) return mockAdminApi.exportReport(format);
    return apiClient.get(`/admin/reports/export?format=${format}`, { responseType: 'blob' }).then((r) => r.data);
  },

  updateVisit: (visitId: string, data: any): Promise<any> => {
    if (USE_MOCK) return mockAdminApi.updateVisit(visitId, data);
    return apiClient.put(`/admin/visits/${visitId}`, data).then((r) => r.data);
  },

  getVisitEditHistory: (visitId: string): Promise<any> => {
    if (USE_MOCK) return mockAdminApi.getVisitEditHistory(visitId);
    return apiClient.get(`/admin/visits/${visitId}/history`).then((r) => r.data);
  },
};