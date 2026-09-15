// ─────────────────────────────────────────────────────────────
// Profile — the union of what GET /profile can return
// ─────────────────────────────────────────────────────────────

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | null;
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
// Editable fields:
//   - staff: name, phone
//   - admin: name only (admin has no phone on the model)
// Email, role, status, isEmailVerified are never client-editable.
// ─────────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

/**
 * The backend returns the same shape it returns from GET /profile —
 * i.e. an updated Profile. Not a hybrid type.
 */
export type UpdateProfileResponse = Profile;

// ─────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────
// confirmPassword is sent by the frontend but ignored server-side;
// password matching is a client concern. Kept optional so future
// callers that omit it still typecheck.
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
// Activity stats — two different shapes based on user type
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