// ═════════════════════════════════════════════════════════════
// Admin Profile types — mirrors the backend AdminProfile DTOs
// ═════════════════════════════════════════════════════════════

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  type: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminProfileRequest {
  name?: string;
}

export type UpdateAdminProfileResponse = AdminProfile;

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangeAdminPasswordResponse {
  id: number;
  updatedAt: string;
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