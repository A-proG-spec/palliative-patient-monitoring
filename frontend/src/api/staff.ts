// src/api/staff.ts
// Endpoints:
//   GET /staff/dashboard/stats
//   GET /staff/patients
//   GET /staff/visits/upcoming
//   GET /staff/visits/recent
//   GET /staff/alerts
//   PUT /staff/alerts/:alertId/read

import api from './client';
import type {
  StaffDashboardStats,
  StaffProfile,
  AlertsResponse,
  AssignedPatientsResponse,
  UpcomingVisitsResponse,
  RecentVisitsResponse,
} from '@/types/staff.types';

export const staffApi = {
  /** GET /staff/dashboard/stats */
  getDashboardStats: (): Promise<StaffDashboardStats> =>
    api
      .get<StaffDashboardStats>('/staff/dashboard/stats')
      .then((res) => res.data),

  /** GET /staff/me  — staff profile with patient/visit counts */
  getProfile: (): Promise<StaffProfile> =>
    api.get<StaffProfile>('/staff/me').then((res) => res.data),

  /** GET /staff/patients */
  getAssignedPatients: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<AssignedPatientsResponse> =>
    api
      .get<AssignedPatientsResponse>('/staff/patients', { params })
      .then((res) => res.data),

  /** GET /staff/visits/upcoming */
  getUpcomingVisits: (params?: {
    days?: number;
    limit?: number;
  }): Promise<UpcomingVisitsResponse> =>
    api
      .get<UpcomingVisitsResponse>('/staff/visits/upcoming', { params })
      .then((res) => res.data),

  /** GET /staff/visits/recent */
  getRecentVisits: (params?: {
    days?: number;
    limit?: number;
  }): Promise<RecentVisitsResponse> =>
    api
      .get<RecentVisitsResponse>('/staff/visits/recent', { params })
      .then((res) => res.data),

  /** GET /staff/alerts */
  getAlerts: (params?: {
    read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<AlertsResponse> =>
    api
      .get<AlertsResponse>('/staff/alerts', { params })
      .then((res) => res.data),

  /** PUT /staff/alerts/:alertId/read */
  markAlertRead: (alertId: string): Promise<{ id: string; read: boolean }> =>
    api
      .put<{ id: string; read: boolean }>(`/staff/alerts/${alertId}/read`)
      .then((res) => res.data),
};
