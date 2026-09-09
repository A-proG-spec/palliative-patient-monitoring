export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse';
  type: 'staff' | 'admin';
  status?: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

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
  phone: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
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

export interface UpdateStaffProfileRequest {
  name?: string;
  phone?: string;
}

export interface UpdateStaffProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Active';
  isEmailVerified: boolean;
  updatedAt: string;
}
