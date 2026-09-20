// ─────────────────────────────────────────────────────────────
// Shared enums from auth.types
// ─────────────────────────────────────────────────────────────
import type { StaffRole, RegisterableStaffRole } from './auth.types';
export type { StaffRole, RegisterableStaffRole };

// ─────────────────────────────────────────────────────────────
// Staff approval
// ─────────────────────────────────────────────────────────────
export type ApprovableStaffRole = RegisterableStaffRole;

export interface PendingStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ApproveStaffRequest {
  role: ApprovableStaffRole;
}

export interface ApprovedStaffResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: ApprovableStaffRole;
  status: 'Active';
  assignedBy: { id: number; name: string };
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
    id: number;
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
  id: number;
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: number;
    referralId?: number;
    patientId?: number;
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
// Close case (legacy)
// ─────────────────────────────────────────────────────────────
export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: number;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: string;
}

// ─────────────────────────────────────────────────────────────
// Admin patient list + detail
// ─────────────────────────────────────────────────────────────
export interface AdminPatient {
  id: number;
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
  registeredBy: { id: number; name: string };
}

export interface AdminPatientDetail extends AdminPatient {
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;

  secondaryDiagnoses: string[];
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';

  visits: Array<{
    id: number;
    visitDate: string;
    visitType: string;
    overallStatus: string;
    outcome: string;
    ppsScore: number;
    kpsScore: number;
    staff: string;
  }>;

  medications: Array<{
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    administeredAt: string;
    status: string;
    createdAt: string;
  }>;

  labTests: Array<{
    id: number;
    name: string;
    dateOrdered: string;
    datePerformed?: string | null;
    result?: string | null;
    status: string;
    location: string;
  }>;

  imagingOrders: Array<{
    id: number;
    modality: string;
    bodyRegion: string;
    specificSite?: string | null;
    laterality: string;
    priority: string;
    status: string;
    hasReport: boolean;
    dateOrdered: string;
    performedAt?: string | null;
  }>;

  progressNotes: Array<{
    id: number;
    admissionId?: number | null;
    generalCondition: string | null;
    levelOfConsciousness: string | null;
    attendingClinician: string;
    overallAssessment: string | null;
    soapSubjective: string | null;
    createdAt: string;
  }>;

  referrals: Array<{
    id: number;
    date: string;
    referralType: string;
    status: string;
    receivingFacility: string;
  }>;

  admissions: Array<{
    id: number;
    date: string;
    dischargeDate?: string | null;
    ward: string;
    bedNumber: string;
    admittingPhysician: string;
    status: string;
    dischargeReason?: string | null;
  }>;

  dischargeSummary: {
    id: number;
    admissionId?: number | null;
    dateOfDischarge: string;
    timeOfDischarge?: string | null;
    dischargeType: string | null;
    overallCondition: string | null;
    dischargedTo: string | null;
    status: string;
    createdAt: string;
  } | null;

  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Reports
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

  imagingByModality?: Array<{ modality: string; count: number }>;
  imagingByStatus?: Array<{ status: string; count: number }>;
  progressNotesByCondition?: Array<{ condition: string; count: number }>;
  dischargesByType?: Array<{ dischargeType: string; count: number }>;
}

// ─────────────────────────────────────────────────────────────
// Staff management
// ─────────────────────────────────────────────────────────────
export type StaffStatus = 'Pending' | 'Active' | 'Rejected';
export type StaffListFilterStatus = StaffStatus | 'Deleted' | 'All';

export interface StaffListItem {
  id: number;
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
  id: number;
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
  role?: ApprovableStaffRole;
}

export interface DeletedStaffResponse {
  id: number;
  success: boolean;
  deletedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Staff performance
// ─────────────────────────────────────────────────────────────
export interface StaffPerformanceItem {
  id: number;
  name: string;
  role: StaffRole | null;
  totalPatientsAssigned: number;
  totalVisitsRecorded: number;
  averageResponseTimeMinutes: number | null;
}

export interface StaffPerformanceListResponse {
  items: StaffPerformanceItem[];
  page: number;
  limit: number;
  total: number;
}

export type StaffActivityType =
  | 'visit'
  | 'medication'
  | 'lab'
  | 'imaging'
  | 'referral'
  | 'admission'
  | 'progress_note';

export interface StaffActivityItem {
  id: string;
  type: StaffActivityType;
  patientId: string | null;
  patientName: string | null;
  timestamp: string;
  description: string;
}

export interface StaffActivityResponse {
  items: StaffActivityItem[];
  total: number;
  hasMore: boolean;
}

export interface StaffPerformanceDetail {
  id: number;
  name: string;
  role: StaffRole | null;
  totalVisitsRecorded: number;
  totalPatientsAssigned: number;
  totalMedicationsOrdered: number;
  totalLabTestsRequested: number;
  totalImagingOrdersPlaced: number;
  totalReferralsSubmitted: number;
  averageResponseTimeMinutes: number | null;
  recentActivity: StaffActivityItem[];
}