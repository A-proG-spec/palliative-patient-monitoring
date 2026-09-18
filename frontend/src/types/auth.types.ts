// ─────────────────────────────────────────────────────────────
// User (returned from /auth/me and /auth/login)
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse' | 'Pharmacist' | 'LabTechnician' | 'Radiologist' | null;
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
// The backend's registerStaff currently returns the raw Staff
// document with `password` stripped, plus `id`. That means:
//   - `_id` and `__v` leak through
//   - `emailVerificationOtp` (hashed) and its expiry leak through
//   - `role`, `assignedBy`, `updatedAt` are present
//
// The frontend only reads: id, name, email, phone, status,
// isEmailVerified. Everything else is declared optional so the
// UI doesn't accidentally depend on the leaky fields, and so
// that later fixes on the backend don't break the frontend.
// ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  role?: 'TeamLeader' | 'Physician' | 'Nurse' | 'Pharmacist' | 'LabTechnician' | 'Radiologist' | null;
  createdAt?: string;
  updatedAt?: string;
  assignedBy?: string | null;

  // Present on the real backend response but should not be relied on.
  // Server-side leak tracked separately.
  _id?: string;
  __v?: number;
  emailVerificationOtp?: string | null;
  emailVerificationOtpExpires?: string | null;
  emailVerificationOtpAttempts?: number;
}

// ─────────────────────────────────────────────────────────────
// Email verification (OTP flow — no tokens)
// ─────────────────────────────────────────────────────────────

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  email: string;
  isEmailVerified: boolean;
}

// ─────────────────────────────────────────────────────────────
// Resend verification
// ─────────────────────────────────────────────────────────────

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  email: string;
}

// ─────────────────────────────────────────────────────────────
// Staff profile (read from /profile now, not /staff/me)
// ─────────────────────────────────────────────────────────────

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | 'Pharmacist' | 'LabTechnician' | 'Radiologist' | null;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: string;
}

export interface UpdateStaffProfileRequest {
  name?: string;
  phone?: string;
}

export interface UpdateStaffProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse' | 'Pharmacist' | 'LabTechnician' | 'Radiologist' | null;
  status?: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified?: boolean;
  updatedAt: string;
}