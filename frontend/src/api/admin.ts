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
  StaffListFilterStatus,
  StaffRole,
  StaffPerformanceListResponse,
  StaffPerformanceDetail,
  StaffActivityResponse,
} from '@/types/admin.types';
import type { AdminPendingReferral } from '@/types/referral.types';

// ─────────────────────────────────────────────────────────────
// Visit edit payload — mirrors backend `updateVisitSchema`
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
  id: number;
  updatedAt: string;
  changes: Array<{ field: string; from: unknown; to: unknown }>;
}

export const adminApi = {
  // ═══════════════════════════════════════════════════════════
  // Dashboard
  // ═══════════════════════════════════════════════════════════
  getDashboardStats: (): Promise<DashboardStats> => {
    return apiClient
      .get<DashboardStats>('/admin/dashboard/stats')
      .then((r) => r.data);
  },

  getNotifications: (params?: {
    limit?: number;
    read?: boolean;
  }): Promise<NotificationsResponse> => {
    return apiClient
      .get<NotificationsResponse>('/admin/dashboard/notifications', { params })
      .then((r) => r.data);
  },

  markNotificationRead: (
    id: number | string,
  ): Promise<{ id: number; read: boolean }> => {
    return apiClient
      .put<{ id: number; read: boolean }>(
        `/admin/dashboard/notifications/${id}/read`,
      )
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Patients
  // ═══════════════════════════════════════════════════════════
  getPatients: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ items: AdminPatient[]; page: number; limit: number; total: number }> => {
    return apiClient
      .get<{ items: AdminPatient[]; page: number; limit: number; total: number }>(
        '/admin/patients',
        { params },
      )
      .then((r) => r.data);
  },

  getPatientDetail: (patientId: number | string): Promise<AdminPatientDetail> => {
    return apiClient
      .get<AdminPatientDetail>(`/admin/patients/${patientId}`)
      .then((r) => r.data);
  },

  closeCase: (
    patientId: number | string,
    data: CloseCaseRequest,
  ): Promise<CloseCaseResponse> => {
    return apiClient
      .put<CloseCaseResponse>(`/admin/patients/${patientId}/close-case`, data)
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Staff approvals
  // ═══════════════════════════════════════════════════════════
  getPendingStaff: (): Promise<PendingStaff[]> => {
    return apiClient
      .get<PendingStaff[]>('/admin/staff/pending')
      .then((r) => r.data);
  },

  approveStaff: (
    staffId: number | string,
    data: ApproveStaffRequest,
  ): Promise<ApprovedStaffResponse> => {
    return apiClient
      .put<ApprovedStaffResponse>(`/admin/staff/${staffId}/approve`, data)
      .then((r) => r.data);
  },

  rejectStaff: (
    staffId: number | string,
  ): Promise<{ id: number; status: string }> => {
    return apiClient
      .put<{ id: number; status: string }>(`/admin/staff/${staffId}/reject`)
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Staff management
  // ═══════════════════════════════════════════════════════════
  getStaffList: (params?: {
    page?: number;
    limit?: number;
    status?: StaffListFilterStatus;
    role?: StaffRole;
    search?: string;
  }): Promise<StaffListResponse> => {
    return apiClient
      .get<StaffListResponse>('/admin/staff', { params })
      .then((r) => r.data);
  },

  getStaffById: (staffId: number | string): Promise<StaffDetail> => {
    return apiClient
      .get<StaffDetail>(`/admin/staff/${staffId}`)
      .then((r) => r.data);
  },

  updateStaff: (
    staffId: number | string,
    data: UpdateStaffRequest,
  ): Promise<StaffDetail> => {
    return apiClient
      .put<StaffDetail>(`/admin/staff/${staffId}`, data)
      .then((r) => r.data);
  },

  deleteStaff: (
    staffId: number | string,
    reason?: string,
  ): Promise<DeletedStaffResponse> => {
    return apiClient
      .delete<DeletedStaffResponse>(`/admin/staff/${staffId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  restoreStaff: (
    staffId: number | string,
  ): Promise<{ id: number; restored: boolean }> => {
    return apiClient
      .post<{ id: number; restored: boolean }>(
        `/admin/staff/${staffId}/restore`,
      )
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Staff performance
  // ═══════════════════════════════════════════════════════════
  getStaffPerformanceList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: StaffRole;
  }): Promise<StaffPerformanceListResponse> => {
    return apiClient
      .get<StaffPerformanceListResponse>('/admin/staff/performance', { params })
      .then((r) => r.data);
  },

  getStaffPerformanceDetail: (
    staffId: number | string,
  ): Promise<StaffPerformanceDetail> => {
    return apiClient
      .get<StaffPerformanceDetail>(`/admin/staff/performance/${staffId}`)
      .then((r) => r.data);
  },

  getStaffActivity: (
    staffId: number | string,
    params?: { page?: number; limit?: number },
  ): Promise<StaffActivityResponse> => {
    return apiClient
      .get<StaffActivityResponse>(
        `/admin/staff/performance/${staffId}/activity`,
        { params },
      )
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Referrals
  // ═══════════════════════════════════════════════════════════
  getPendingReferrals: (): Promise<AdminPendingReferral[]> => {
    return apiClient
      .get<AdminPendingReferral[]>('/admin/referrals/pending')
      .then((r) => r.data);
  },

  approveReferral: (
    referralId: number | string,
  ): Promise<{ id: number; status: string }> => {
    return apiClient
      .put<{ id: number; status: string }>(
        `/admin/referrals/${referralId}/approve`,
      )
      .then((r) => r.data);
  },

  declineReferral: (
    referralId: number | string,
  ): Promise<{ id: number; status: string }> => {
    return apiClient
      .put<{ id: number; status: string }>(
        `/admin/referrals/${referralId}/decline`,
      )
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Reports
  // ═══════════════════════════════════════════════════════════
  getReports: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ReportData> => {
    return apiClient
      .get<ReportData>('/admin/reports', { params })
      .then((r) => r.data);
  },

  // ═══════════════════════════════════════════════════════════
  // Admin visit edit / delete / restore
  // ═══════════════════════════════════════════════════════════
  updateVisit: (
    visitId: number | string,
    data: AdminUpdateVisitRequest,
  ): Promise<AdminUpdateVisitResponse> => {
    return apiClient
      .put<AdminUpdateVisitResponse>(`/admin/visits/${visitId}`, data)
      .then((r) => r.data);
  },

  deleteVisit: (
    visitId: number | string,
    reason?: string,
  ): Promise<{ id: number; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number; success: boolean; deletedAt: string }>(
        `/admin/visits/${visitId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreVisit: (
    visitId: number | string,
  ): Promise<{ id: number; restored: boolean }> => {
    return apiClient
      .post<{ id: number; restored: boolean }>(
        `/admin/visits/${visitId}/restore`,
      )
      .then((r) => r.data);
  },
    // ═══════════════════════════════════════════════════════════
  // ADMIN SOFT DELETE / RESTORE — sub-resources
  // ═══════════════════════════════════════════════════════════

  // ─── Medication ───
  deleteMedication: (
    patientId: number | string,
    medicationId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/patients/${patientId}/medications/${medicationId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreMedication: (
    patientId: number | string,
    medicationId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    return apiClient
      .post<{ id: number | string; restored: boolean }>(
        `/patients/${patientId}/medications/${medicationId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─── Lab Test ───
  deleteLabTest: (
    patientId: number | string,
    labId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/patients/${patientId}/labs/${labId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreLabTest: (
    patientId: number | string,
    labId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    // NOTE: labs use PUT for restore (inconsistent with other resources)
    return apiClient
      .put<{ id: number | string; restored: boolean }>(
        `/patients/${patientId}/labs/${labId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─── Imaging ───
  deleteImaging: (
    patientId: number | string,
    imagingId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/patients/${patientId}/imaging/${imagingId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreImaging: (
    patientId: number | string,
    imagingId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    return apiClient
      .post<{ id: number | string; restored: boolean }>(
        `/patients/${patientId}/imaging/${imagingId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─── Admission ───
  deleteAdmission: (
    patientId: number | string,
    admissionId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/patients/${patientId}/admissions/${admissionId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreAdmission: (
    patientId: number | string,
    admissionId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    return apiClient
      .post<{ id: number | string; restored: boolean }>(
        `/patients/${patientId}/admissions/${admissionId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─── Progress Note ───
  deleteProgressNote: (
    patientId: number | string,
    noteId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/patients/${patientId}/progress-notes/${noteId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreProgressNote: (
    patientId: number | string,
    noteId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    return apiClient
      .post<{ id: number | string; restored: boolean }>(
        `/patients/${patientId}/progress-notes/${noteId}/restore`,
      )
      .then((r) => r.data);
  },

  // ─── Hospice Nursing ───
  deleteHospiceNursing: (
    patientId: number | string,
    assessmentId: number | string,
    reason?: string,
  ): Promise<{ id: number | string; success: boolean; deletedAt: string }> => {
    return apiClient
      .delete<{ id: number | string; success: boolean; deletedAt: string }>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restoreHospiceNursing: (
    patientId: number | string,
    assessmentId: number | string,
  ): Promise<{ id: number | string; restored: boolean }> => {
    return apiClient
      .post<{ id: number | string; restored: boolean }>(
        `/hospice/patients/${patientId}/hospice-nursing/${assessmentId}/restore`,
      )
      .then((r) => r.data);
  },
};