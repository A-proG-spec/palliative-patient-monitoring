# frontend-specification/14-toast-notifications.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND TOAST NOTIFICATIONS SPECIFICATION

## 1. Overview

This document defines the comprehensive frontend implementation for toast notifications used throughout the Palliative Patient Monitoring System. Toast notifications provide real-time feedback to users for actions like successful operations, errors, warnings, and informational messages.

**Library:** `sonner` (https://sonner.emilkowal.ski/)

---

## 2. Installation & Setup

### 2.1 Installation

```bash
npm install sonner
# or
yarn add sonner
# or
pnpm add sonner
```

### 2.2 Provider Setup

Add the Toaster component to your main App file:

```typescript
// src/App.tsx or src/main.tsx

import { Toaster } from 'sonner';
import '@/styles/globals.css';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={5}
        duration={3000}
        gap={12}
        theme="light"
        toastOptions={{
          style: {
            fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          classNames: {
            toast: 'toast-custom',
            title: 'toast-title',
            description: 'toast-description',
            actionButton: 'toast-action',
            cancelButton: 'toast-cancel',
            closeButton: 'toast-close',
          },
        }}
      />
      <Router />
    </>
  );
}
```

---

## 3. Toast Types

### 3.1 Type Definitions

| Type | Color | Icon | Duration | Usage |
|---|---|---|---|---|
| **Success** | Green (#43B982) | ✓ | 3000ms | Operation completed successfully |
| **Error** | Red (#E74F3D) | ✕ | 5000ms | Operation failed |
| **Warning** | Amber (#F5A34A) | ⚠ | 4000ms | User needs attention |
| **Info** | Blue (#002395) | ℹ | 3000ms | Informational message |
| **Loading** | Gray (#6B7280) | ⟳ | Until resolved | Operation in progress |

### 3.2 Visual Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ Success                                                               │
│     Patient registered successfully                                       │
│     Sarah Johnson has been registered.                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ❌ Error                                                                 │
│     Login failed                                                          │
│     Invalid email or password. Please try again.                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⚠️ Warning                                                               │
│     Validation error                                                      │
│     Please check the form fields highlighted in red.                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ℹ️ Info                                                                  │
│     Email sent                                                            │
│     Verification email has been sent to your inbox.                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⏳ Loading                                                               │
│     Saving...                                                             │
│     Please wait while we save your changes.                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Toast Utility

### 4.1 Complete Toast Utility File

```typescript
// src/lib/toast.ts

import { toast, ToastOptions } from 'sonner';

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
  LOADING: Infinity,
} as const;

export const TOAST_POSITION = {
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_LEFT: 'bottom-left',
} as const;

type ToastPosition = typeof TOAST_POSITION[keyof typeof TOAST_POSITION];
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptionsExtended extends ToastOptions {
  position?: ToastPosition;
  duration?: number;
}

export const toastUtils = {
  /**
   * Show a success toast
   * @param message - The main message
   * @param description - Optional description
   * @param options - Optional toast options
   */
  success: (message: string, description?: string, options?: ToastOptionsExtended) => {
    return toast.success(message, {
      description,
      duration: TOAST_DURATION.SUCCESS,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Show an error toast
   * @param message - The main message
   * @param description - Optional description
   * @param options - Optional toast options
   */
  error: (message: string, description?: string, options?: ToastOptionsExtended) => {
    return toast.error(message, {
      description,
      duration: TOAST_DURATION.ERROR,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Show a warning toast
   * @param message - The main message
   * @param description - Optional description
   * @param options - Optional toast options
   */
  warning: (message: string, description?: string, options?: ToastOptionsExtended) => {
    return toast.warning(message, {
      description,
      duration: TOAST_DURATION.WARNING,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Show an info toast
   * @param message - The main message
   * @param description - Optional description
   * @param options - Optional toast options
   */
  info: (message: string, description?: string, options?: ToastOptionsExtended) => {
    return toast.info(message, {
      description,
      duration: TOAST_DURATION.INFO,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Show a loading toast
   * @param message - The main message
   * @param options - Optional toast options
   * @returns The toast ID for dismissal
   */
  loading: (message: string, options?: ToastOptionsExtended) => {
    return toast.loading(message, {
      duration: TOAST_DURATION.LOADING,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Dismiss a specific toast by ID
   * @param id - The toast ID
   */
  dismiss: (id: string | number) => {
    toast.dismiss(id);
  },

  /**
   * Dismiss all active toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Create a promise-based toast
   * @param promise - The promise to track
   * @param messages - The messages to display
   * @param options - Optional toast options
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptionsExtended
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: TOAST_DURATION.SUCCESS,
      position: options?.position || 'top-right',
      ...options,
    });
  },

  /**
   * Create a custom toast with custom styling
   * @param element - React element or custom content
   * @param options - Toast options
   */
  custom: (element: React.ReactNode, options?: ToastOptionsExtended) => {
    return toast.custom(element, {
      duration: TOAST_DURATION.INFO,
      position: options?.position || 'top-right',
      ...options,
    });
  },
};

export default toastUtils;
```

---

## 5. Toast Messages Reference

### 5.1 Auth Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Register | "Registration successful! Please check your email to verify your account." | "Email already registered" |
| Verify Email | "Email verified successfully! Please wait for admin approval." | "Invalid verification link" |
| Resend Verification | "Verification email sent. Please check your inbox." | "Email not found" |
| Login | "Welcome back, {name}!" | "Invalid email or password" |
| Logout | "Logged out successfully" | "Logout failed" |
| Login - Email Not Verified | - | "Please verify your email before logging in" |
| Login - Account Pending | - | "Account pending admin approval" |
| Login - Account Rejected | - | "Account has been rejected" |

### 5.2 Staff/Profile Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Update Profile | "Profile updated successfully" | "Failed to update profile" |

### 5.3 Patient Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Register Patient | "Patient registered successfully" | "Failed to register patient" |
| Get Patient List | - | "Failed to load patients" |
| Get Patient Details | - | "Failed to load patient details" |

### 5.4 Visit Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Record Visit | "Home visit recorded successfully" | "Failed to record visit" |
| Edit Visit (Admin) | "Visit updated successfully" | "Failed to update visit" |
| Get Visits | - | "Failed to load visits" |

### 5.5 Medication Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Order Medication | "Medication ordered successfully" | "Failed to order medication" |
| Update Medication | "Medication status updated" | "Failed to update medication" |

### 5.6 Lab Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Order Lab Test | "Lab test ordered successfully" | "Failed to order lab test" |
| Update Lab Result | "Lab test result updated" | "Failed to update lab result" |

### 5.7 Referral Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Request Referral | "Referral requested successfully" | "Failed to request referral" |
| Approve Referral (Admin) | "Referral approved" | "Failed to approve referral" |
| Decline Referral (Admin) | "Referral declined" | "Failed to decline referral" |

### 5.8 Admission Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Record Admission | "Admission recorded successfully" | "Failed to record admission" |
| Discharge Admission | "Admission updated successfully" | "Failed to update admission" |

### 5.9 Admin Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Approve Staff | "Staff approved successfully" | "Failed to approve staff" |
| Reject Staff | "Staff registration rejected" | "Failed to reject staff" |
| Close Case | "Patient case closed successfully" | "Failed to close case" |
| Mark Notification Read | "Notification marked as read" | "Failed to mark notification as read" |
| Export Report | "Report exported successfully" | "Failed to export report" |

### 5.10 Print/Export Toast Messages

| Action | Success Message | Error Message |
|---|---|---|
| Print Patient History | "Print dialog opened" | "Failed to load patient data for printing" |
| Export Patient PDF | "PDF exported successfully" | "Failed to export PDF" |

---

## 6. Usage Examples

### 6.1 Basic Usage in Hooks

```typescript
// src/hooks/useAuth.ts

import { toastUtils } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response;
      setAuth(user, token);
      
      toastUtils.success(
        'Login successful',
        `Welcome back, ${user.name}!`
      );
      
      if (user.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      toastUtils.error('Login failed', message);
    },
  });
}
```

### 6.2 Promise-Based Usage

```typescript
// src/hooks/usePatients.ts

import { toastUtils } from '@/lib/toast';

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientApi.register(data),
    onMutate: () => {
      // Show loading toast
      return toastUtils.loading('Registering patient...');
    },
    onSuccess: (response, variables, toastId) => {
      toastUtils.dismiss(toastId);
      toastUtils.success(
        'Patient registered successfully',
        `Patient ${response.patientDisplayId} has been created.`
      );
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(`/patients/${response.id}`);
    },
    onError: (error: any, variables, toastId) => {
      toastUtils.dismiss(toastId);
      const message = error.response?.data?.message || 'Registration failed';
      toastUtils.error('Registration failed', message);
    },
  });
}
```

### 6.3 Promise Helper Usage

```typescript
// src/pages/staff/PatientRegistrationPage.tsx

import { toastUtils } from '@/lib/toast';

export const PatientRegistrationPage = () => {
  const registerMutation = useRegisterPatient();

  const onSubmit = (data: CreatePatientFormData) => {
    toastUtils.promise(
      patientApi.register(data),
      {
        loading: 'Registering patient...',
        success: (response) => 
          `Patient ${response.patientDisplayId} registered successfully!`,
        error: (error) => 
          error.response?.data?.message || 'Failed to register patient',
      }
    ).then((response) => {
      navigate(`/patients/${response.id}`);
    });
  };
};
```

### 6.4 Admin Usage with Description

```typescript
// src/pages/admin/AdminPatientDetailPage.tsx

import { toastUtils } from '@/lib/toast';

const handleCloseCase = () => {
  closeCaseMutation.mutate(
    { patientId, data: { reason } },
    {
      onSuccess: () => {
        toastUtils.success(
          'Case closed successfully',
          `Patient ${patientName} has been discharged. Reason: ${reason}`,
          { duration: 5000 } // Extend duration for important messages
        );
        setIsCloseModalOpen(false);
        refetch();
      },
      onError: (error: any) => {
        toastUtils.error(
          'Failed to close case',
          error.response?.data?.message || 'An unexpected error occurred.',
          { duration: 6000 }
        );
      },
    }
  );
};
```

### 6.5 Loading State with Dismiss

```typescript
// src/pages/staff/OrderMedicationPage.tsx

import { toastUtils } from '@/lib/toast';

export const OrderMedicationPage = () => {
  const orderMutation = useOrderMedication(patientId);
  let toastId: string | number;

  const onSubmit = (data: CreateMedicationFormData) => {
    toastId = toastUtils.loading('Ordering medication...');
    
    orderMutation.mutate(data, {
      onSuccess: (response) => {
        toastUtils.dismiss(toastId);
        toastUtils.success(
          'Medication ordered successfully',
          `${response.name} (${response.dosage}) has been ordered.`
        );
        navigate(`/patients/${patientId}`);
      },
      onError: (error: any) => {
        toastUtils.dismiss(toastId);
        toastUtils.error(
          'Failed to order medication',
          error.response?.data?.message || 'Please try again.'
        );
      },
    });
  };
};
```

### 6.6 Warning Toast for Validation

```typescript
// src/components/patients/PatientForm.tsx

import { toastUtils } from '@/lib/toast';

const onSubmit = (data: CreatePatientFormData) => {
  // Validate before submission
  if (!data.primaryDiagnosis) {
    toastUtils.warning(
      'Missing information',
      'Primary diagnosis is required. Please fill in all required fields.'
    );
    return;
  }
  
  // Proceed with submission
  onSubmit(data);
};
```

### 6.7 Info Toast for Informational Messages

```typescript
// src/pages/auth/VerifyEmailPage.tsx

import { toastUtils } from '@/lib/toast';

export const VerifyEmailPage = () => {
  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token, {
        onSuccess: (data) => {
          if (data.isEmailVerified) {
            toastUtils.info(
              'Email already verified',
              'You can now login to your account.'
            );
          } else {
            toastUtils.success(
              'Email verified successfully',
              'Please wait for admin approval.'
            );
          }
        },
        onError: (error: any) => {
          const message = error.response?.data?.message;
          if (message?.includes('expired')) {
            toastUtils.error(
              'Verification link expired',
              'Please request a new verification email.'
            );
          } else {
            toastUtils.error(
              'Verification failed',
              message || 'Invalid verification link.'
            );
          }
        },
      });
    }
  }, [token]);
};
```

---

## 7. Toast Configuration

### 7.1 Global Configuration

```typescript
// src/lib/toast-config.ts

import { ToasterProps } from 'sonner';

export const toasterConfig: ToasterProps = {
  position: 'top-right',
  richColors: true,
  closeButton: true,
  expand: false,
  visibleToasts: 5,
  duration: 3000,
  gap: 12,
  theme: 'light',
  toastOptions: {
    style: {
      fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    classNames: {
      toast: 'toast-custom',
      title: 'toast-title',
      description: 'toast-description',
      actionButton: 'toast-action',
      cancelButton: 'toast-cancel',
      closeButton: 'toast-close',
    },
  },
};

export default toasterConfig;
```

### 7.2 Theme Configuration

```typescript
// src/styles/toast.css

/* Toast Custom Styles */
.toast-custom {
  border: 1px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  font-family: 'Outfit', system-ui, sans-serif;
}

.toast-description {
  font-size: 13px;
  font-weight: 400;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #4b5563;
}

.toast-close {
  color: #6b7280;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #1f2937;
}

/* Success Toast */
[data-sonner-toast][data-type="success"] {
  border-color: #43b982;
}

[data-sonner-toast][data-type="success"] .toast-title {
  color: #065f46;
}

/* Error Toast */
[data-sonner-toast][data-type="error"] {
  border-color: #e74f3d;
}

[data-sonner-toast][data-type="error"] .toast-title {
  color: #991b1b;
}

/* Warning Toast */
[data-sonner-toast][data-type="warning"] {
  border-color: #f5a34a;
}

[data-sonner-toast][data-type="warning"] .toast-title {
  color: #92400e;
}

/* Info Toast */
[data-sonner-toast][data-type="info"] {
  border-color: #002395;
}

[data-sonner-toast][data-type="info"] .toast-title {
  color: #002395;
}

/* Loading Toast */
[data-sonner-toast][data-type="loading"] {
  border-color: #6b7280;
}

[data-sonner-toast][data-type="loading"] .toast-title {
  color: #374151;
}
```

---

## 8. Toast Design System

### 8.1 Colors

| Token | Type | Color |
|---|---|---|
| toast-success | Success | `#43B982` |
| toast-success-bg | Success Background | `#EAF8F2` |
| toast-success-text | Success Text | `#065F46` |
| toast-error | Error | `#E74F3D` |
| toast-error-bg | Error Background | `#FCE8E8` |
| toast-error-text | Error Text | `#991B1B` |
| toast-warning | Warning | `#F5A34A` |
| toast-warning-bg | Warning Background | `#FFF3E0` |
| toast-warning-text | Warning Text | `#92400E` |
| toast-info | Info | `#002395` |
| toast-info-bg | Info Background | `#E8ECF7` |
| toast-info-text | Info Text | `#002395` |
| toast-loading | Loading | `#6B7280` |
| toast-loading-bg | Loading Background | `#F3F4F6` |
| toast-loading-text | Loading Text | `#374151` |

### 8.2 Typography

| Token | Value |
|---|---|
| Toast Font | 'Outfit', system-ui, sans-serif |
| Toast Title Size | 14px |
| Toast Title Weight | 600 |
| Toast Description Size | 13px |
| Toast Description Weight | 400 |
| Toast Icon Size | 20px |

### 8.3 Spacing & Layout

| Token | Value |
|---|---|
| Toast Padding | 12px 16px |
| Toast Gap | 8px |
| Toast Border Radius | 8px |
| Toast Shadow | 0 4px 12px rgba(0,0,0,0.15) |
| Toast Max Width | 380px |
| Toast Min Width | 280px |

---

## 9. Error Handling Integration

### 9.1 Global Error Interceptor

```typescript
// src/api/client.ts

import { toastUtils } from '@/lib/toast';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors
    if (!error.response) {
      toastUtils.error(
        'Network Error',
        'Please check your internet connection and try again.'
      );
      return Promise.reject(error);
    }

    // Server errors (500)
    if (error.response.status >= 500) {
      toastUtils.error(
        'Server Error',
        'Something went wrong on our end. Please try again later.'
      );
      return Promise.reject(error);
    }

    // 404 Not Found
    if (error.response.status === 404) {
      toastUtils.warning(
        'Not Found',
        'The requested resource could not be found.'
      );
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (error.response.status === 403) {
      toastUtils.error(
        'Access Denied',
        'You do not have permission to perform this action.'
      );
      return Promise.reject(error);
    }

    // 401 Unauthorized
    if (error.response.status === 401) {
      toastUtils.warning(
        'Session Expired',
        'Please login again to continue.'
      );
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
```

### 9.2 Form Validation Errors

```typescript
// src/components/patients/PatientForm.tsx

import { toastUtils } from '@/lib/toast';

const onSubmit = (data: CreatePatientFormData) => {
  registerMutation.mutate(data, {
    onError: (error: any) => {
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        // Show first validation error as toast
        const firstError = errors[0];
        toastUtils.warning(
          'Validation Error',
          `${firstError.field}: ${firstError.message}`
        );
      } else {
        toastUtils.error(
          'Submission Failed',
          error.response?.data?.message || 'Please check your input and try again.'
        );
      }
    },
  });
};
```

---

## 10. Toast Accessibility

### 10.1 ARIA Support

Sonner automatically handles accessibility:

- `role="status"` for success, info, warning
- `role="alert"` for error
- `role="progressbar"` for loading
- Proper ARIA labels on close buttons

### 10.2 Keyboard Navigation

- `ESC` key dismisses toasts
- `Tab` key navigates through interactive elements
- `Enter`/`Space` activates buttons

### 10.3 Screen Reader Support

- Toast messages are announced by screen readers
- Loading states indicate progress
- Error messages are announced as alerts

---

## 11. Performance Considerations

| Consideration | Recommendation |
|---|---|
| Max visible toasts | 5 |
| Max queue size | 10 |
| Dismiss unused toasts | Automatically after duration |
| Avoid excessive toasts | Batch related notifications |
| Heavy custom content | Use sparingly |

---

## 12. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TOAST NOTIFICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    USER ACTION                                      │  │
│  │                                                                      │  │
│  │  User performs an action (register, login, save, delete, etc.)      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    HOOK/MUTATION                                   │  │
│  │                                                                      │  │
│  │  onMutate: Show loading toast                                       │  │
│  │  onSuccess: Show success toast                                     │  │
│  │  onError: Show error toast                                        │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    TOAST UTILITY                                  │  │
│  │                                                                      │  │
│  │  toastUtils.success(message, description)                           │  │
│  │  toastUtils.error(message, description)                            │  │
│  │  toastUtils.warning(message, description)                          │  │
│  │  toastUtils.info(message, description)                             │  │
│  │  toastUtils.loading(message)                                       │  │
│  │  toastUtils.promise(promise, messages)                             │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    TOAST RENDER                                   │  │
│  │                                                                      │  │
│  │  Sonner Toaster renders toast with:                                 │  │
│  │    - Icon (✓, ✕, ⚠, ℹ, ⟳)                                         │  │
│  │    - Title                                                          │  │
│  │    - Description                                                    │  │
│  │    - Close button                                                   │  │
│  │    - Color based on type                                           │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    DISMISS                                        │  │
│  │                                                                      │  │
│  │  Auto-dismiss after duration                                        │  │
│  │  User clicks close button                                           │  │
│  │  Programmatic dismiss: toastUtils.dismiss(id)                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
