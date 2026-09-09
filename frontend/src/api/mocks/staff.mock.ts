import type { StaffDashboardStats } from '@/types/staff.types';
import { MOCK_PATIENTS } from './patients.mock';
import { MOCK_STAFF_PROFILE } from './auth.mock';
import { delay } from '@/lib/utils';

const MOCK_STAFF_DASHBOARD: StaffDashboardStats = {
  todayVisits: 3,
  totalPatients: 8,
  activePatients: 7,
  pendingTasks: 2,
  recentVisits: [
    { id: 'v-001', patientId: 'pat-001', patientName: 'Sarah Johnson', visitDate: '2026-08-25T08:00:00Z', outcome: 'Stable' },
    { id: 'v-008', patientId: 'pat-004', patientName: 'Bekele Haile', visitDate: '2026-08-24T08:00:00Z', outcome: 'SymptomsWorsened' },
    { id: 'v-009', patientId: 'pat-005', patientName: 'Mekdes Girma', visitDate: '2026-08-23T08:00:00Z', outcome: 'Stable' },
    { id: 'v-004', patientId: 'pat-002', patientName: 'Michael Brown', visitDate: '2026-08-20T08:00:00Z', outcome: 'SymptomsWorsened' },
  ],
  assignedPatients: MOCK_PATIENTS.slice(0, 8).map((p) => ({
    id: p.id,
    patientDisplayId: p.patientDisplayId || '',
    firstName: p.firstName,
    lastName: p.lastName,
    age: p.age,
    sex: p.sex,
    status: p.status,
    currentLocation: p.currentLocation,
    primaryDiagnosis: p.primaryDiagnosis,
    lastVisitDate: '2026-08-25T00:00:00Z',
  })),
  upcomingVisits: [
    { id: 'v-upcoming-001', patientId: 'pat-001', patientName: 'Sarah Johnson', scheduledDate: '2026-09-05', visitType: 'Routine' },
    { id: 'v-upcoming-002', patientId: 'pat-003', patientName: 'Almaz Tesfaye', scheduledDate: '2026-09-06', visitType: 'Routine' },
    { id: 'v-upcoming-003', patientId: 'pat-004', patientName: 'Bekele Haile', scheduledDate: '2026-09-01', visitType: 'Emergency' },
  ],
  alerts: [
    { id: 'alert-001', type: 'RedFlag', message: 'Severe uncontrolled pain reported during last visit', patientId: 'pat-004', patientName: 'Bekele Haile', createdAt: '2026-08-24T11:00:00Z' },
    { id: 'alert-002', type: 'RedFlag', message: 'Severe dehydration noted — immediate attention required', patientId: 'pat-008', patientName: 'Tesfaye Mulugeta', createdAt: '2026-08-29T10:00:00Z' },
    { id: 'alert-003', type: 'ReferralPending', message: 'Referral awaiting admin approval', patientId: 'pat-002', patientName: 'Michael Brown', createdAt: '2026-08-26T14:00:00Z' },
    { id: 'alert-004', type: 'VisitOverdue', message: 'Scheduled visit overdue by 3 days', patientId: 'pat-010', patientName: 'Girma Desta', createdAt: '2026-08-27T00:00:00Z' },
  ],
};

export const mockStaffApi = {
  getDashboardStats: async (): Promise<StaffDashboardStats> => {
    await delay(450);
    return MOCK_STAFF_DASHBOARD;
  },

  getProfile: async () => {
    await delay(300);
    return MOCK_STAFF_PROFILE;
  },
};
