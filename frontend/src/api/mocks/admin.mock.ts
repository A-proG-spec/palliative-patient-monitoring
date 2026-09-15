import type {
  DashboardStats,
  Notification,
  NotificationsResponse,
  AdminPatient,
  AdminPatientDetail,
  ReportData,
} from '@/types/admin.types';
import { MOCK_PATIENTS } from './patients.mock';
import { MOCK_PENDING_STAFF } from './auth.mock';
import { MOCK_REFERRALS } from './referrals.mock';
import { delay } from '@/lib/utils';
import type { AdminUpdateVisitRequest, AdminUpdateVisitResponse } from '@/api/admin';

// ─────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', type: 'StaffApproval', message: 'New staff registration pending: Abebe Girma', data: { staffId: 'staff-pending-001', staffName: 'Abebe Girma' }, read: false, createdAt: '2026-08-30T08:00:00Z' },
  { id: 'notif-002', type: 'StaffApproval', message: 'New staff registration pending: Sara Tadesse', data: { staffId: 'staff-pending-002', staffName: 'Sara Tadesse' }, read: false, createdAt: '2026-08-29T14:00:00Z' },
  { id: 'notif-003', type: 'ReferralApproval', message: 'New referral request: Michael Brown (Lung Cancer)', data: { referralId: 'ref-002', patientId: 'pat-004', patientName: 'Bekele Haile' }, read: false, createdAt: '2026-08-29T09:00:00Z' },
  { id: 'notif-004', type: 'ReferralApproval', message: 'New referral request: Sarah Johnson', data: { referralId: 'ref-005', patientId: 'pat-001', patientName: 'Sarah Johnson' }, read: true, createdAt: '2026-08-28T16:00:00Z' },
  { id: 'notif-005', type: 'CloseCase', message: 'Case closed: Dawit Kebede (Improved)', data: { patientId: 'pat-006', patientName: 'Dawit Kebede' }, read: true, createdAt: '2026-08-27T11:00:00Z' },
  { id: 'notif-006', type: 'CloseCase', message: 'Case closed: Yohannes Getachew (Improved)', data: { patientId: 'pat-012', patientName: 'Yohannes Getachew' }, read: true, createdAt: '2026-08-26T09:00:00Z' },
  { id: 'notif-007', type: 'StaffApproval', message: 'New staff registration pending: Binyam Haile', data: { staffId: 'staff-pending-003', staffName: 'Binyam Haile' }, read: false, createdAt: '2026-08-25T10:00:00Z' },
];

const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalPatients: MOCK_PATIENTS.length,
  activePatients: MOCK_PATIENTS.filter((p) => p.status === 'Active').length,
  hospitalizedPatients: MOCK_PATIENTS.filter((p) => p.currentLocation === 'ReferredHospital').length,
  dischargedPatients: MOCK_PATIENTS.filter((p) => p.status === 'Discharged').length,
  pendingReferrals: MOCK_REFERRALS.filter((r) => r.status === 'Pending').length,
  pendingStaff: MOCK_PENDING_STAFF.length,
  notifications: {
    staffApprovals: MOCK_PENDING_STAFF.length,
    pendingReferrals: MOCK_REFERRALS.filter((r) => r.status === 'Pending').length,
    recentCloseCases: 2,
  },
  patientsByStatus: [
    { status: 'Active', count: MOCK_PATIENTS.filter((p) => p.status === 'Active').length },
    { status: 'Discharged', count: MOCK_PATIENTS.filter((p) => p.status === 'Discharged').length },
  ],
  recentReferrals: MOCK_REFERRALS.slice(0, 4).map((r) => {
    const p = MOCK_PATIENTS.find((x) => x.id === r.patientId);
    return {
      id: r.id,
      patientName: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
      date: r.referralDate,
      status: r.status,
    };
  }),
  recentVisits: [
    { patientName: 'Sarah Johnson', date: '2026-08-25', staff: 'John Doe' },
    { patientName: 'Mekdes Girma', date: '2026-08-24', staff: 'Selam Bekele' },
    { patientName: 'Bekele Haile', date: '2026-08-24', staff: 'John Doe' },
    { patientName: 'Liya Solomon', date: '2026-08-26', staff: 'John Doe' },
  ],
};

// ─────────────────────────────────────────────────────────────
// Mock API
// ─────────────────────────────────────────────────────────────

export const mockAdminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(500);
    return MOCK_DASHBOARD_STATS;
  },

  getNotifications: async (params?: { limit?: number; read?: boolean }): Promise<NotificationsResponse> => {
    await delay(400);
    let filtered = [...MOCK_NOTIFICATIONS];
    if (params?.read !== undefined) filtered = filtered.filter((n) => n.read === params.read);
    const limit = params?.limit || 20;
    return {
      notifications: filtered.slice(0, limit),
      unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
      totalCount: MOCK_NOTIFICATIONS.length,
    };
  },

  markNotificationRead: async (id: string): Promise<{ id: string; read: boolean }> => {
    await delay(200);
    const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
    if (idx !== -1) MOCK_NOTIFICATIONS[idx].read = true;
    return { id, read: true };
  },

  getPatients: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ items: AdminPatient[]; total: number }> => {
    await delay(400);
    let filtered: AdminPatient[] = MOCK_PATIENTS.map((p) => ({
      id: p.id,
      patientDisplayId: p.patientDisplayId || '',
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      sex: p.sex,
      status: p.status,
      currentLocation: p.currentLocation,
      primaryDiagnosis: p.primaryDiagnosis,
      diseaseStage: p.diseaseStage,
      registeredAt: p.createdAt,
      registeredBy: { id: 'staff-001', name: 'John Doe' },
    }));
    if (params?.status) filtered = filtered.filter((p) => p.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.patientDisplayId.toLowerCase().includes(q),
      );
    }
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total: filtered.length };
  },

  getPatientDetail: async (patientId: string): Promise<AdminPatientDetail> => {
    await delay(500);
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');
    return {
      id: patient.id,
      patientDisplayId: patient.patientDisplayId || '',
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      sex: patient.sex,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      phone: patient.phone,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      caregiverName: patient.caregiverName,
      caregiverPhone: patient.caregiverPhone,
      primaryDiagnosis: patient.primaryDiagnosis,
      secondaryDiagnoses: patient.secondaryDiagnoses,
      diseaseStage: patient.diseaseStage,
      comorbidities: patient.comorbidities,
      estimatedPrognosis: patient.estimatedPrognosis,
      status: patient.status,
      currentLocation: patient.currentLocation,
      registeredAt: patient.createdAt,
      registeredBy: { id: 'staff-001', name: 'John Doe' },
      visits: [
        {
          id: `v-${patientId}-1`,
          visitDate: '2026-08-25T00:00:00Z',
          visitType: 'Routine',
          overallStatus: 'Stable',
          outcome: 'Stable',
          ppsScore: 40,
          kpsScore: 42,
          staff: 'John Doe',
        },
        {
          id: `v-${patientId}-2`,
          visitDate: '2026-08-18T00:00:00Z',
          visitType: 'Routine',
          overallStatus: 'Stable',
          outcome: 'SymptomsImproved',
          ppsScore: 44,
          kpsScore: 46,
          staff: 'Dr. Tigist Alemu',
        },
      ],
      medications: [
        {
          id: `med-${patientId}-1`,
          name: 'Morphine',
          dosage: '10mg',
          frequency: 'Every 6 hours',
          route: 'Oral',
          administeredAt: 'Home',
          status: 'Ordered',
          createdAt: '2026-08-20T08:00:00Z',
        },
      ],
      labTests: [
        {
          id: `lab-${patientId}-1`,
          name: 'Complete Blood Count',
          dateOrdered: '2026-08-20T00:00:00Z',
          datePerformed: '2026-08-21T00:00:00Z',
          result: 'Hb: 9.5 g/dL',
          status: 'Completed',
          location: 'Home',
        },
      ],
      imagingOrders: [],
      progressNotes: [],
      referrals: MOCK_REFERRALS.filter((r) => r.patientId === patientId).map((r) => ({
        id: r.id,
        date: r.referralDate,
        referralType: r.referralType,
        status: r.status,
        receivingFacility: r.receivingFacility,
      })),
      admissions: [],
      dischargeSummary: null,
      createdAt: patient.createdAt,
    };
  },

  closeCase: async (patientId: string, data: { reason: 'Improved' | 'Deceased' }) => {
    await delay(600);
    const idx = MOCK_PATIENTS.findIndex((p) => p.id === patientId);
    if (idx !== -1) MOCK_PATIENTS[idx].status = 'Discharged';
    return {
      id: patientId,
      status: 'Discharged' as const,
      closeReason: data.reason,
      closeDate: new Date().toISOString(),
    };
  },

  getPendingStaff: async () => {
    await delay(350);
    return [...MOCK_PENDING_STAFF];
  },

  approveStaff: async (staffId: string, data: { role: 'TeamLeader' | 'Physician' | 'Nurse' }) => {
    await delay(600);
    const idx = MOCK_PENDING_STAFF.findIndex((s) => s.id === staffId);
    if (idx !== -1) MOCK_PENDING_STAFF.splice(idx, 1);
    return {
      id: staffId,
      name: 'Approved Staff',
      email: 'approved@example.com',
      phone: '+251900000000',
      role: data.role,
      status: 'Active' as const,
      assignedBy: { id: 'admin-001', name: 'Admin User' },
      updatedAt: new Date().toISOString(),
    };
  },

  rejectStaff: async (staffId: string) => {
    await delay(500);
    const idx = MOCK_PENDING_STAFF.findIndex((s) => s.id === staffId);
    if (idx !== -1) MOCK_PENDING_STAFF.splice(idx, 1);
    return { id: staffId, status: 'Rejected' as const };
  },

  getPendingReferrals: async () => {
    await delay(400);
    return MOCK_REFERRALS.filter((r) => r.status === 'Pending');
  },

  approveReferral: async (referralId: string) => {
    await delay(600);
    const idx = MOCK_REFERRALS.findIndex((r) => r.id === referralId);
    if (idx !== -1) {
      MOCK_REFERRALS[idx].status = 'Accepted';
      MOCK_REFERRALS[idx].actionTaken = 'ReferralAccepted';
      MOCK_REFERRALS[idx].updatedAt = new Date().toISOString();
    }
    return MOCK_REFERRALS[idx];
  },

  declineReferral: async (referralId: string) => {
    await delay(600);
    const idx = MOCK_REFERRALS.findIndex((r) => r.id === referralId);
    if (idx !== -1) {
      MOCK_REFERRALS[idx].status = 'Declined';
      MOCK_REFERRALS[idx].actionTaken = 'ReferralDeclined';
      MOCK_REFERRALS[idx].updatedAt = new Date().toISOString();
    }
    return MOCK_REFERRALS[idx];
  },

  getReports: async (): Promise<ReportData> => {
    await delay(500);
    return {
      totalPatients: MOCK_PATIENTS.length,
      activePatients: MOCK_PATIENTS.filter((p) => p.status === 'Active').length,
      dischargedPatients: MOCK_PATIENTS.filter((p) => p.status === 'Discharged').length,
      hospitalizedPatients: MOCK_PATIENTS.filter((p) => p.currentLocation === 'ReferredHospital').length,
      referralsByStatus: [
        { status: 'Pending', count: 2 },
        { status: 'Accepted', count: 1 },
        { status: 'Declined', count: 1 },
        { status: 'Admitted', count: 0 },
        { status: 'InfoRequested', count: 1 },
      ],
      patientsByLocation: [
        { location: 'Home', count: MOCK_PATIENTS.filter((p) => p.currentLocation === 'Home').length },
        { location: 'ReferredHospital', count: MOCK_PATIENTS.filter((p) => p.currentLocation === 'ReferredHospital').length },
      ],
      patientsByStage: [
        { stage: 'Early', count: MOCK_PATIENTS.filter((p) => p.diseaseStage === 'Early').length },
        { stage: 'Advanced', count: MOCK_PATIENTS.filter((p) => p.diseaseStage === 'Advanced').length },
        { stage: 'EndStage', count: MOCK_PATIENTS.filter((p) => p.diseaseStage === 'EndStage').length },
      ],
      closeCasesByReason: [
        { reason: 'Improved', count: 2 },
        { reason: 'Deceased', count: 0 },
      ],
      visitsByMonth: [
        { month: 'Mar 2026', count: 8 },
        { month: 'Apr 2026', count: 12 },
        { month: 'May 2026', count: 15 },
        { month: 'Jun 2026', count: 18 },
        { month: 'Jul 2026', count: 22 },
        { month: 'Aug 2026', count: 24 },
      ],
      imagingByModality: [],
      imagingByStatus: [],
      progressNotesByCondition: [],
      dischargesByType: [],
    };
  },

  // ── Admin visit edit / delete / restore ──
  updateVisit: async (
    visitId: string,
    data: AdminUpdateVisitRequest,
  ): Promise<AdminUpdateVisitResponse> => {
    await delay(500);
    const changes = Object.entries(data).map(([field, to]) => ({ field, from: null, to }));
    return { id: visitId, updatedAt: new Date().toISOString(), changes };
  },
};