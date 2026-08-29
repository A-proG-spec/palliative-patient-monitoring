# function-level-specification/frontend/01-auth.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: AUTH

## 1. Overview

This document defines the function-level specification for frontend authentication features including registration, login, logout, and user session management.

**Files Covered:**
- `src/api/auth.ts`
- `src/store/auth.store.ts`
- `src/hooks/useAuth.ts`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/routes/PublicRoute.tsx`

---

## 2. API Layer

### src/api/auth.ts

| Function | Signature | Purpose |
|---|---|---|
| register | `(data: RegisterRequest): Promise<RegisterResponse>` | POST /auth/register |
| login | `(data: LoginRequest): Promise<LoginResponse>` | POST /auth/login |
| getCurrentUser | `(): Promise<User>` | GET /auth/me |
| logout | `(): Promise<void>` | POST /auth/logout |

**Implementation:**

```typescript
import api from './client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth.types';

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/auth/register', data).then((res) => res.data);
  },

  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', data).then((res) => res.data);
  },

  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/auth/me').then((res) => res.data);
  },

  logout: (): Promise<void> => {
    return api.post('/auth/logout').then((res) => res.data);
  },
};
```

---

## 3. Store

### src/store/auth.store.ts

| Field | Type | Description |
|---|---|---|
| user | `User \| null` | Current authenticated user |
| token | `string \| null` | JWT token |
| isAuthenticated | `boolean` | Whether user is authenticated |

| Method | Signature | Purpose |
|---|---|---|
| setAuth | `(user: User, token: string): void` | Set user and token, update isAuthenticated |
| logout | `(): void` | Clear user and token, update isAuthenticated |

**Implementation:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Behavior:**
- `setAuth`: Sets user and token, marks as authenticated
- `logout`: Clears user and token, marks as unauthenticated
- Persisted under key `auth-storage` in localStorage

---

## 4. Hooks

### src/hooks/useAuth.ts

#### useRegister

| Field | Detail |
|---|---|
| Signature | `useRegister(): UseMutationResult<RegisterResponse, AxiosError, RegisterRequest>` |
| Purpose | Register new staff member |
| API Call | `authApi.register(data)` |
| Side Effects | None (redirect handled by page) |
| Edge Cases | Email already exists -> error from API |

**Implementation:**

```typescript
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}
```

---

#### useLogin

| Field | Detail |
|---|---|
| Signature | `useLogin(): UseMutationResult<LoginResponse, AxiosError, LoginRequest>` |
| Purpose | Login user and redirect based on role |
| API Call | `authApi.login(data)` |
| Side Effects | Sets auth state, navigates to appropriate dashboard |
| Edge Cases | Invalid credentials -> error from API |
| Edge Cases | Account pending -> error from API |
| Edge Cases | Account rejected -> error from API |

**Implementation:**

```typescript
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
```

---

#### useLogout

| Field | Detail |
|---|---|
| Signature | `useLogout(): UseMutationResult<void, AxiosError, void>` |
| Purpose | Logout user and redirect to login |
| API Call | `authApi.logout()` |
| Side Effects | Clears auth state, navigates to /login |
| Edge Cases | API call fails -> still clears local state |

**Implementation:**

```typescript
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
```

---

#### useCurrentUser

| Field | Detail |
|---|---|
| Signature | `useCurrentUser(): UseQueryResult<User>` |
| Purpose | Get current authenticated user |
| API Call | `authApi.getCurrentUser()` |
| Query Key | `['auth', 'me']` |
| Enabled | `!!token` |
| Stale Time | 5 minutes |
| Retry | false |

**Implementation:**

```typescript
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
```

---

## 5. Pages

### 5.1 LoginPage

**Route:** `/login`

**Layout:** `AuthLayout`

**Guard:** `PublicRoute`

**Purpose:** User login page

**Local State:** React Hook Form state (email, password)

**Behavior:**

1. Renders email and password fields
2. Client-side validation with Zod
3. On submit, calls `useLogin()` mutation
4. On success, redirects based on user role
5. On error, displays form-level error message

**Validation Schema:**

```typescript
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

**States:**

| State | UI |
|---|---|
| Idle | Form fields enabled, submit button enabled |
| Submitting | Submit button disabled, loading spinner |
| Error | Form-level error message displayed |
| Success | Redirect to dashboard |

**Implementation:**

```typescript
export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (error: any) => {
        setError('root', {
          message: error.response?.data?.message || 'Login failed. Please try again.',
        });
      },
    });
  };

  // Render form with fields and error states
};
```

---

### 5.2 RegisterPage

**Route:** `/register`

**Layout:** `AuthLayout`

**Guard:** `PublicRoute`

**Purpose:** Staff registration page

**Local State:** React Hook Form state

**Behavior:**

1. Renders name, email, phone, password, confirm password fields
2. Client-side validation with Zod
3. On submit, calls `useRegister()` mutation
4. On success, shows success message and redirects to login
5. On error, displays field-specific or form-level errors

**Validation Schema:**

```typescript
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

**States:**

| State | UI |
|---|---|
| Idle | Form fields enabled, submit button enabled |
| Submitting | Submit button disabled, loading spinner |
| Error | Field-specific or form-level error messages |
| Success | Success message displayed, redirect to login |

**Implementation:**

```typescript
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...requestData } = data;
    
    registerMutation.mutate(requestData, {
      onSuccess: () => {
        // Show success message and redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message;
        if (message === 'Email already registered') {
          setError('email', { message: 'Email already registered' });
        } else {
          setError('root', { message: message || 'Registration failed. Please try again.' });
        }
      },
    });
  };

  // Render form with fields and error states
};
```

---

## 6. Route Guards

### 6.1 ProtectedRoute

**Purpose:** Protect routes that require authentication

**Behavior:**

1. Check if user is authenticated from store
2. If not authenticated, redirect to /login
3. If authenticated, check user role for route
4. If admin tries to access staff route, redirect to /admin
5. If staff tries to access admin route, redirect to /dashboard

**Implementation:**

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user?.type === 'admin' && window.location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.type === 'staff' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
```

---

### 6.2 PublicRoute

**Purpose:** Protect routes that should not be accessible when authenticated

**Behavior:**

1. Check if user is authenticated from store
2. If authenticated, redirect to appropriate dashboard based on role
3. If not authenticated, render child routes

**Implementation:**

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect based on role
    if (user?.type === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.type === 'staff') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
```

---

## 7. Flow Diagram

```
+-----------------------------------------------------------+
|               AUTHENTICATION FLOW (FRONTEND)               |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                 | |
|  |                                                     | |
|  |  User -> /register -> RegisterPage                  | |
|  |         -> useRegister() -> POST /auth/register     | |
|  |         -> Success -> Show success message          | |
|  |         -> Redirect to /login after 2s              | |
|  |         -> Error -> Display error message           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGIN FLOW                        | |
|  |                                                     | |
|  |  User -> /login -> LoginPage                        | |
|  |         -> useLogin() -> POST /auth/login           | |
|  |         -> Success -> Store token & user            | |
|  |         -> Redirect based on role:                  | |
|  |            admin -> /admin                          | |
|  |            staff -> /dashboard                      | |
|  |         -> Error -> Display error message           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    AUTHENTICATED FLOW                | |
|  |                                                     | |
|  |  Request -> ProtectedRoute                          | |
|  |         -> Check isAuthenticated                    | |
|  |         -> If false -> Redirect to /login           | |
|  |         -> If true -> Check role for route          | |
|  |         -> Render child routes                      | |
|  |                                                     | |
|  |  Auth pages -> PublicRoute                          | |
|  |         -> Check isAuthenticated                    | |
|  |         -> If true -> Redirect to dashboard         | |
|  |         -> If false -> Render child routes          | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGOUT FLOW                       | |
|  |                                                     | |
|  |  User clicks Logout -> useLogout()                  | |
|  |         -> POST /auth/logout                        | |
|  |         -> Clear token & user from store            | |
|  |         -> Redirect to /login                       | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
