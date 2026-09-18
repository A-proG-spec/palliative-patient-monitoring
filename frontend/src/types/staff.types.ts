export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientName: string;
    patientId: string;
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
    visitType: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: string;
    patientName: string;
    createdAt: string;
  }>;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | 'Pharmacist' | 'LabTechnician' | 'Radiologist';
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: string;
}
