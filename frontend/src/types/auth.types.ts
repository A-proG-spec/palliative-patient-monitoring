// ─────────────────────────────────────────────────────────────
// Shared staff role enum — mirrors backend StaffRole
// ─────────────────────────────────────────────────────────────
export type StaffRole =
  | 'TeamLeader'
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'Radiologist'
  | 'LaboratoryTechnician';

export type RegisterableStaffRole =
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'Radiologist'
  | 'LaboratoryTechnician';

// ─────────────────────────────────────────────────────────────
// User (returned from /auth/me and /auth/login)
// ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: StaffRole | null;
  type: 'staff' | 'admin';
  status?: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified?: boolean;
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: RegisterableStaffRole;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: StaffRole | null;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  assignedBy?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Email verification
// ─────────────────────────────────────────────────────────────
export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  email: string;
  isEmailVerified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  email: string;
}

// NOTE: `StaffProfile`, `UpdateStaffProfileRequest`, and
// `UpdateStaffProfileResponse` used to live here. They are now
// canonical in `profile.types.ts` — import from there instead.