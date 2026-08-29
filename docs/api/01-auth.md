# api/01-auth.md


# PALLIATIVE PATIENT MONITORING SYSTEM - AUTH API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | Public | Staff registration |
| POST | /auth/login | Public | Unified login for staff and admin |
| GET | /auth/me | Staff, Admin | Get current authenticated user |
| POST | /auth/logout | Staff, Admin | Logout user |
| GET | /staff/me | Staff | Get staff profile |
| PUT | /staff/me | Staff | Update staff profile |

## 2. Endpoint Details

### POST /auth/register

**Purpose:** Register new staff member

**Auth:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251911111111",
  "password": "securepassword"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| name | Required, min 2 chars |
| email | Required, valid email format |
| phone | Required, valid phone number |
| password | Required, min 8 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful, pending admin approval",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911111111",
    "status": "Pending",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Email already exists | "Email already registered" |
| 400 | Validation error | Field-specific errors |

---

### POST /auth/login

**Purpose:** Unified login for both staff and admin

**Auth:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| email | Required, valid email format |
| password | Required, min 8 chars |

**Success Response (200):**

**For Staff User:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+251911111111",
      "role": "Nurse",
      "type": "staff",
      "status": "Active",
      "createdAt": "2026-08-29T10:00:00Z"
    }
  }
}
```

**For Admin User:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User",
      "email": "admin@example.com",
      "type": "admin",
      "createdAt": "2026-08-29T10:00:00Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Invalid credentials | "Invalid email or password" |
| 401 | Account pending (staff only) | "Account pending admin approval" |
| 401 | Account rejected (staff only) | "Account has been rejected" |

---

### GET /auth/me

**Purpose:** Get current authenticated user

**Auth:** Staff, Admin

**Success Response (200):**

**For Staff:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911111111",
    "role": "Nurse",
    "type": "staff",
    "status": "Active",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**For Admin:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439001",
    "name": "Admin User",
    "email": "admin@example.com",
    "type": "admin",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |

---

### POST /auth/logout

**Purpose:** Logout user and invalidate session

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |

---

### GET /staff/me

**Purpose:** Get staff profile (alias for /auth/me with staff-specific fields)

**Auth:** Staff

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911111111",
    "role": "Nurse",
    "status": "Active",
    "assignedPatientsCount": 12,
    "todayVisitsCount": 3,
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 404 | Staff not found | "Staff member not found" |

---

### PUT /staff/me

**Purpose:** Update staff profile (name, phone)

**Auth:** Staff

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "phone": "+251912222222"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| name | Optional, min 2 chars |
| phone | Optional, valid phone number |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+251912222222",
    "role": "Nurse",
    "status": "Active",
    "updatedAt": "2026-08-29T11:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 404 | Staff not found | "Staff member not found" |
| 400 | Validation error | Field-specific errors |

---

## 3. Type Definitions

```typescript
// src/types/auth.types.ts

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: 'TeamLeader' | 'Physician' | 'Nurse';
    type: 'staff' | 'admin';
    status?: 'Pending' | 'Active' | 'Rejected';
    createdAt?: string;
  };
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'TeamLeader' | 'Physician' | 'Nurse';
  type: 'staff' | 'admin';
  status?: 'Pending' | 'Active' | 'Rejected';
  createdAt?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Pending' | 'Active' | 'Rejected';
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
  updatedAt: string;
}
```

---

## 4. Frontend API Calls

```typescript
// src/api/auth.ts

import api from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  StaffProfile,
  UpdateStaffProfileRequest,
  UpdateStaffProfileResponse
} from '@/types/auth.types';

export const authApi = {
  /**
   * Register new staff member
   * POST /auth/register
   */
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/auth/register', data).then((res) => res.data);
  },

  /**
   * Login user (staff or admin)
   * POST /auth/login
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', data).then((res) => res.data);
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/auth/me').then((res) => res.data);
  },

  /**
   * Get staff profile
   * GET /staff/me
   */
  getStaffProfile: (): Promise<StaffProfile> => {
    return api.get<StaffProfile>('/staff/me').then((res) => res.data);
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: (): Promise<void> => {
    return api.post('/auth/logout').then((res) => res.data);
  },

  /**
   * Update staff profile
   * PUT /staff/me
   */
  updateProfile: (data: UpdateStaffProfileRequest): Promise<UpdateStaffProfileResponse> => {
    return api.put<UpdateStaffProfileResponse>('/staff/me', data).then((res) => res.data);
  },
};
```

---

## 5. Frontend Hooks

```typescript
// src/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { LoginRequest, RegisterRequest, UpdateStaffProfileRequest } from '@/types/auth.types';

/**
 * Register new staff member
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

/**
 * Login user and redirect based on role
 */
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response;
      setAuth(user, token);

      // Redirect based on user type
      if (user.type === 'admin') {
        navigate('/admin');
      } else if (user.type === 'staff') {
        navigate('/dashboard');
      }
    },
  });
}

/**
 * Logout user and redirect to login
 */
export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get staff profile
 */
export function useStaffProfile() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => authApi.getStaffProfile(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update staff profile
 */
export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: UpdateStaffProfileRequest) => authApi.updateProfile(data),
    onSuccess: (response) => {
      // Update user in store with new data
      if (user) {
        const updatedUser = {
          ...user,
          name: response.name,
          phone: response.phone,
        };
        const token = useAuthStore.getState().token;
        if (token) {
          setAuth(updatedUser, token);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
    },
  });
}
```

---

## 6. Flow Diagram

```
+-----------------------------------------------------------+
|                    AUTHENTICATION FLOW                     |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                  | |
|  |                                                     | |
|  |  Staff -> POST /auth/register -> Status: Pending    | |
|  |         -> Admin approves -> Status: Active         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGIN FLOW                        | |
|  |                                                     | |
|  |  User -> POST /auth/login -> Backend validates      | |
|  |                              ↓                       | |
|  |                        Returns { token, user }       | |
|  |                              ↓                       | |
|  |                   Frontend stores token & user       | |
|  |                              ↓                       | |
|  |              Redirect based on user.type:            | |
|  |              admin -> /admin   staff -> /dashboard   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    AUTHENTICATED REQUESTS            | |
|  |                                                     | |
|  |  Frontend -> Attaches Bearer token to header        | |
|  |  Backend  -> Verifies token, attaches user to req   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PROFILE FLOWS                     | |
|  |                                                     | |
|  |  GET /auth/me   -> Get current user (generic)      | |
|  |  GET /staff/me  -> Get staff profile (staff only)  | |
|  |  PUT /staff/me  -> Update staff profile             | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGOUT FLOW                       | |
|  |                                                     | |
|  |  User -> POST /auth/logout -> Token invalidated     | |
|  |                              ↓                       | |
|  |                   Frontend clears token & user       | |
|  |                              ↓                       | |
|  |                    Redirect to /login                | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
