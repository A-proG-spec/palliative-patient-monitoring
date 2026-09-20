// ─────────────────────────────────────────────────────────────
// Profile union — GET /profile
// ─────────────────────────────────────────────────────────────
export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role:
    | 'TeamLeader'
    | 'Physician'
    | 'Nurse'
    | 'Pharmacist'
    | 'Radiologist'
    | 'LaboratoryTechnician'
    | null;
  type: 'staff';
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  type: 'admin';
  createdAt: string;
  updatedAt: string;
}

export type Profile = StaffProfile | AdminProfile;

// ─────────────────────────────────────────────────────────────
// Update profile
// ─────────────────────────────────────────────────────────────
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export type UpdateProfileResponse = Profile;

// ─────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  id: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Activity stats — depends on user type
// ─────────────────────────────────────────────────────────────
export interface StaffActivityStats {
  totalVisits: number;
  totalPatients: number;
  activePatients: number;
  todayVisits: number;
  lastLogin: string;
  memberSince: string;
}

export interface AdminActivityStats {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  lastLogin: string;
  memberSince: string;
}

export type ActivityStats = StaffActivityStats | AdminActivityStats;