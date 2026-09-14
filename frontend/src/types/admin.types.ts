// ─────────────────────────────────────────────────────────────
// Staff approval
// ─────────────────────────────────────────────────────────────

export interface PendingStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  isEmailVerified: boolean;
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
  assignedBy: { id: string; name: string };
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Close case (legacy path — used only when no full discharge
// summary is submitted). Prefer dischargeApi.create().
// ─────────────────────────────────────────────────────────────

export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: string;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: string;
}

// ─────────────────────────────────────────────────────────────
// Patient list item — used by AdminPatientListPage
// ─────────────────────────────────────────────────────────────

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
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  registeredAt: string;
  registeredBy: { id: string; name: string };
}

// ─────────────────────────────────────────────────────────────
// Patient detail — aggregates every sub-resource the backend
// returns from `admin.service.getPatientDetail`
// ─────────────────────────────────────────────────────────────

export interface AdminPatientDetail extends AdminPatient {
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

  // ── Sub-record collections ──
  visits: Array<{
    id: string;
    visitDate: string;
    visitType: string;
    overallStatus: string;
    outcome: string;
    ppsScore: number;
    kpsScore: number;
    staff: string;
  }>;

  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    administeredAt: string;
    status: string;
    createdAt: string;
  }>;

  labTests: Array<{
    id: string;
    name: string;
    dateOrdered: string;
    datePerformed?: string;
    result?: string;
    status: string;
    location: string;
  }>;

  imagingOrders: Array<{
    id: string;
    modality: string;
    bodyRegion: string;
    specificSite?: string;
    laterality: string;
    priority: string;
    status: string;
    hasReport: boolean;
    dateOrdered: string;
    performedAt?: string;
  }>;

  progressNotes: Array<{
    id: string;
    admissionId?: string;
    generalCondition: string;
    levelOfConsciousness: string;
    attendingClinician: string;
    overallAssessment: string;
    soapSubjective: string;
    createdAt: string;
  }>;

  referrals: Array<{
    id: string;
    date: string;
    referralType: string;
    status: string;
    receivingFacility: string;
  }>;

  admissions: Array<{
    id: string;
    date: string;
    dischargeDate?: string;
    ward: string;
    bedNumber: string;
    admittingPhysician: string;
    status: string;
    dischargeReason?: string;
  }>;

  dischargeSummary: {
    id: string;
    admissionId?: string;
    dateOfDischarge: string;
    timeOfDischarge?: string;
    dischargeType: string;
    overallCondition: string;
    dischargedTo: string;
    status: string;
    createdAt: string;
  } | null;

  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Reports — superset of the original chart data
// ─────────────────────────────────────────────────────────────

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

  // ── Extended aggregates (present on the real backend response) ──
  imagingByModality?: Array<{ modality: string; count: number }>;
  imagingByStatus?: Array<{ status: string; count: number }>;
  progressNotesByCondition?: Array<{ condition: string; count: number }>;
  dischargesByType?: Array<{ dischargeType: string; count: number }>;
}

// ─────────────────────────────────────────────────────────────
// Staff management (active list + CRUD)
// ─────────────────────────────────────────────────────────────

export type StaffRole = 'TeamLeader' | 'Physician' | 'Nurse';
export type StaffStatus = 'Pending' | 'Active' | 'Rejected';
export type StaffListFilterStatus = StaffStatus | 'Deleted' | 'All';

export interface StaffListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole | null;
  status: StaffStatus;
  isEmailVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  items: StaffListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface StaffDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole | null;
  status: StaffStatus;
  isEmailVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStaffRequest {
  name?: string;
  phone?: string;
  role?: StaffRole;
}

export interface DeletedStaffResponse {
  id: string;
  success: boolean;
  deletedAt: string;
}