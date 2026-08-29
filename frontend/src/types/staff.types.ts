// src/types/staff.types.ts

export type AlertType = 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    visitDate: string;
    outcome: string;
  }>;
  assignedPatients: Array<{
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    status: 'Active' | 'Discharged';
    currentLocation: 'Home' | 'ReferredHospital';
    primaryDiagnosis: string;
    lastVisitDate?: string;
  }>;
  upcomingVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    scheduledDate: string;
    visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  }>;
  alerts: Array<{
    id: string;
    type: AlertType;
    message: string;
    patientId: string;
    patientName: string;
    createdAt: string;
  }>;
}

export interface AssignedPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
}

export interface UpcomingVisit {
  id: string;
  patientId: string;
  patientName: string;
  scheduledDate: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  priority?: 'Normal' | 'High' | 'Urgent';
}

export interface RecentVisit {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType?: string;
  outcome: string;
  notes?: string;
}

export interface StaffAlert {
  id: string;
  type: AlertType;
  message: string;
  patientId: string;
  patientName: string;
  read: boolean;
  createdAt: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: string;
}

export interface AlertsResponse {
  items: StaffAlert[];
  unreadCount: number;
  total: number;
}

export interface AssignedPatientsResponse {
  items: AssignedPatient[];
  page: number;
  limit: number;
  total: number;
}

export interface UpcomingVisitsResponse {
  items: UpcomingVisit[];
  total: number;
}

export interface RecentVisitsResponse {
  items: RecentVisit[];
  total: number;
}
