import type { User, LoginResponse, RegisterResponse, StaffProfile } from '@/types/auth.types';
import { delay } from '@/lib/utils';

// Mock users
export const MOCK_USERS = {
  staff: {
    id: 'staff-001',
    name: 'John Doe',
    email: 'john@gmail.com',
    phone: '+251911234567',
    role: 'Physician' as const,
    type: 'staff' as const,
    status: 'Active' as const,
    isEmailVerified: true,
    createdAt: '2026-01-15T08:00:00Z',
  } satisfies User,
  admin: {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    type: 'admin' as const,
    createdAt: '2025-12-01T08:00:00Z',
  } satisfies User,
};

// ── Persist mock user in localStorage ──────────────────────────
const MOCK_USER_STORAGE_KEY = 'mock-current-user';

const getCurrentMockUser = (): User | null => {
  try {
    const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setCurrentMockUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
  }
};

// Additional staff for admin panel fixtures
export const MOCK_STAFF_LIST = [
  { id: 'staff-001', name: 'John Doe', email: 'john@gmail.com', phone: '+251911234567', role: 'Physician' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'staff-002', name: 'Dr. Tigist Alemu', email: 'tigist@hospital.et', phone: '+251922345678', role: 'TeamLeader' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-20T08:00:00Z' },
  { id: 'staff-003', name: 'Nurse Selam Bekele', email: 'selam@hospital.et', phone: '+251933456789', role: 'Nurse' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-02-01T08:00:00Z' },
];

export const MOCK_PENDING_STAFF = [
  { id: 'staff-pending-001', name: 'Abebe Girma', email: 'abebe@example.com', phone: '+251944567890', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-28T10:00:00Z' },
  { id: 'staff-pending-002', name: 'Sara Tadesse', email: 'sara@example.com', phone: '+251955678901', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-27T14:00:00Z' },
  { id: 'staff-pending-003', name: 'Binyam Haile', email: 'binyam@example.com', phone: '+251966789012', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-26T09:00:00Z' },
];

export const MOCK_STAFF_PROFILE: StaffProfile = {
  id: 'staff-001',
  name: 'John Doe',
  email: 'john@gmail.com',
  phone: '+251911234567',
  role: 'Physician',
  status: 'Active',
  isEmailVerified: true,
  assignedPatientsCount: 8,
  todayVisitsCount: 3,
  createdAt: '2026-01-15T08:00:00Z',
};

// ── Mock Activity Stats ─────────────────────────────────────────
const MOCK_STAFF_ACTIVITY = {
  totalVisits: 45,
  totalPatients: 23,
  activePatients: 18,
  todayVisits: 5,
  lastLogin: new Date().toISOString(),
  memberSince: '2026-01-15T08:00:00Z',
};

const MOCK_ADMIN_ACTIVITY = {
  totalPatients: 234,
  activePatients: 156,
  dischargedPatients: 33,
  pendingReferrals: 12,
  pendingStaff: 5,
  lastLogin: new Date().toISOString(),
  memberSince: '2025-12-01T08:00:00Z',
};

export const mockAuthApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await delay(600);
    if (email === 'john@gmail.com' && password === 'abcdefghi') {
      setCurrentMockUser(MOCK_USERS.staff);
      return { token: 'mock-staff-token-xyz123', user: MOCK_USERS.staff };
    }
    if (email === 'admin@example.com' && password === 'admin123') {
      setCurrentMockUser(MOCK_USERS.admin);
      return { token: 'mock-admin-token-abc456', user: MOCK_USERS.admin };
    }
    const err = new Error('Invalid email or password') as Error & { response?: { data?: { message: string }; status: number } };
    err.response = { data: { message: 'Invalid email or password' }, status: 401 };
    throw err;
  },

  register: async (data: { name: string; email: string; phone: string; password: string }): Promise<RegisterResponse> => {
    await delay(800);
    return {
      id: 'staff-new-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: 'Pending',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    };
  },

  verifyEmail: async (token: string): Promise<{ email: string; isEmailVerified: boolean }> => {
    await delay(500);
    if (token === 'valid-token') {
      return { email: 'test@example.com', isEmailVerified: true };
    }
    if (token === 'expired-token') {
      const err = new Error('Verification link has expired. Please request a new one.') as Error & { response?: { data?: { message: string }; status: number } };
      err.response = { data: { message: 'Verification link has expired. Please request a new one.' }, status: 400 };
      throw err;
    }
    const err = new Error('Invalid verification link') as Error & { response?: { data?: { message: string }; status: number } };
    err.response = { data: { message: 'Invalid verification link' }, status: 400 };
    throw err;
  },

  resendVerification: async (email: string): Promise<{ email: string }> => {
    await delay(600);
    return { email };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    const user = getCurrentMockUser() || MOCK_USERS.staff;
    return user;
  },

  getStaffProfile: async (): Promise<StaffProfile> => {
    await delay(300);
    const user = getCurrentMockUser() || MOCK_USERS.staff;
    // If admin is logged in, return admin as staff (fallback)
    if (user.type === 'admin') {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: '+251900000000',
        role: 'Physician',
        status: 'Active',
        isEmailVerified: true,
        assignedPatientsCount: 0,
        todayVisitsCount: 0,
        createdAt: user.createdAt || new Date().toISOString(),
      } as StaffProfile;
    }
    return {
      ...MOCK_STAFF_PROFILE,
      name: user.name,
      email: user.email,
      phone: (user as any).phone || MOCK_STAFF_PROFILE.phone,
      role: (user as any).role || MOCK_STAFF_PROFILE.role,
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
    setCurrentMockUser(null);
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    await delay(500);
    const user = getCurrentMockUser() || MOCK_USERS.staff;
    return {
      id: user.id,
      name: data.name || user.name,
      email: user.email,
      phone: data.phone || (user.type === 'staff' ? '+251911234567' : ''),
      role: user.type === 'staff' ? 'Physician' : undefined,
      type: user.type,
      status: user.type === 'staff' ? 'Active' : undefined,
      isEmailVerified: user.type === 'staff' ? true : undefined,
      updatedAt: new Date().toISOString(),
    };
  },

  // ── Profile endpoints ──────────────────────────────────────────
  getProfile: async () => {
    await delay(300);
    const user = getCurrentMockUser() || MOCK_USERS.staff;

    if (user.type === 'admin') {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        type: 'admin' as const,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: (user as any).phone || '+251911234567',
      role: (user as any).role || 'Physician',
      type: 'staff' as const,
      status: (user as any).status || 'Active',
      isEmailVerified: (user as any).isEmailVerified !== undefined ? (user as any).isEmailVerified : true,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    await delay(600);
    // In mock mode, always succeed
    return { updatedAt: new Date().toISOString() };
  },

  getActivityStats: async () => {
    await delay(400);
    const user = getCurrentMockUser() || MOCK_USERS.staff;
    if (user.type === 'admin') {
      return MOCK_ADMIN_ACTIVITY;
    }
    return MOCK_STAFF_ACTIVITY;
  },
};