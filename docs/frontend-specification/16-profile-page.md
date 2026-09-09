# frontend-specification/16-profile-page.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND PROFILE PAGE SPECIFICATION

## 1. Overview

This document defines the frontend implementation for the user profile page. Both Staff and Admin users can view and edit their profile information, change their password, and view activity statistics.

**API Reference:** `api/13-profile.md`

---

## 2. Route

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/profile` | `ProfilePage` | `DashboardLayout` | Staff, Admin |

---

## 3. Types

```typescript
// src/types/profile.types.ts

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
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

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  type: 'staff' | 'admin';
  status?: string;
  isEmailVerified?: boolean;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  updatedAt: string;
}

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
```

---

## 4. API Calls

```typescript
// src/api/profile.ts

import api from './client';
import { 
  Profile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ActivityStats
} from '@/types/profile.types';

export const profileApi = {
  /**
   * Get current user profile
   * GET /profile
   */
  getProfile: (): Promise<Profile> => {
    return api.get<Profile>('/profile').then((res) => res.data);
  },

  /**
   * Update profile (name, phone)
   * PUT /profile
   */
  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    return api.put<UpdateProfileResponse>('/profile', data).then((res) => res.data);
  },

  /**
   * Change password
   * PUT /profile/password
   */
  changePassword: (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return api.put<ChangePasswordResponse>('/profile/password', data).then((res) => res.data);
  },

  /**
   * Get user activity statistics
   * GET /profile/activity
   */
  getActivityStats: (): Promise<ActivityStats> => {
    return api.get<ActivityStats>('/profile/activity').then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile.types';
import { toastUtils } from '@/lib/toast';

/**
 * Get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update profile (name, phone)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toastUtils.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toastUtils.error('Update failed', error.response?.data?.message || 'Failed to update profile');
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
    onSuccess: () => {
      toastUtils.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toastUtils.error('Password change failed', message);
    },
  });
}

/**
 * Get user activity statistics
 */
export function useActivityStats() {
  return useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: () => profileApi.getActivityStats(),
    staleTime: 60 * 1000,
  });
}
```

---

## 6. Components

### 6.1 ProfileInfo

**Purpose:** Display and edit user profile information

**Props:**

```typescript
interface ProfileInfoProps {
  profile: Profile;
  isLoading?: boolean;
  onSave: (data: UpdateProfileRequest) => void;
  isSaving?: boolean;
}
```

**Behavior:**
- Displays user profile fields
- Name and phone are editable
- Email, role, status are read-only
- "Save Changes" button updates profile
- Shows validation errors

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PROFILE INFORMATION                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Full Name:     [Dr. John Smith              ]  (Editable)            │ │
│  │  Email:         [john@example.com             ]  (Read-only)          │ │
│  │  Phone:         [+251911111111                ]  (Editable)          │ │
│  │  Role:          [Physician                    ]  (Read-only)          │ │
│  │  Status:        [Active ✅                    ]  (Read-only)          │ │
│  │  Member Since:  2026-08-29                    │  (Read-only)          │ │
│  │                                                                       │ │
│  │  [Save Changes]                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 ChangePassword

**Purpose:** Allow users to change their password

**Props:**

```typescript
interface ChangePasswordProps {
  onChangePassword: (data: ChangePasswordRequest) => void;
  isSubmitting?: boolean;
}
```

**Behavior:**
- Three fields: Current Password, New Password, Confirm Password
- Password requirements displayed
- Current password verified before change
- Success/error messages via toast

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CHANGE PASSWORD                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Current Password: [________________________]                        │ │
│  │  New Password:     [________________________]                        │ │
│  │  Confirm Password: [________________________]                        │ │
│  │                                                                       │ │
│  │  Password Requirements:                                              │ │
│  │    • Minimum 8 characters                                            │ │
│  │    • At least 1 uppercase letter                                    │ │
│  │    • At least 1 number                                              │ │
│  │                                                                       │ │
│  │  [Change Password]                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.3 ActivityStats

**Purpose:** Display user activity statistics

**Props:**

```typescript
interface ActivityStatsProps {
  stats: ActivityStats;
  isLoading?: boolean;
  userType: 'staff' | 'admin';
}
```

**Behavior:**
- Displays role-specific statistics
- Shows different stats for Staff vs Admin
- Last login and member since displayed

**Visual Design (Staff):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MY ACTIVITY                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  +----------+  +----------+  +----------+  +----------+              │ │
│  │  | Visits   |  | Total    |  | Active   |  | Today's  |              │ │
│  │  | Recorded |  | Patients |  | Patients |  | Visits   |              │ │
│  │  |          |  |          |  |          |  |          |              │ │
│  │  |   45     |  |   23     |  |   18     |  |    5     |              │ │
│  │  +----------+  +----------+  +----------+  +----------+              │ │
│  │                                                                       │ │
│  │  Last Login:  2026-09-01 08:30 AM                                    │ │
│  │  Member Since: 2026-08-29                                            │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Design (Admin):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MY ACTIVITY                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  +----------+  +----------+  +----------+  +----------+              │ │
│  │  | Total    |  | Active   |  | Dischar- |  | Pending  |              │ │
│  │  | Patients |  | Patients |  | ged      |  | Referrals|              │ │
│  │  |          |  |          |  | Patients |  |          |              │ │
│  │  |   234    |  |   156    |  |   33     |  |   12     |              │ │
│  │  +----------+  +----------+  +----------+  +----------+              │ │
│  │                                                                       │ │
│  │  Pending Staff: 5                                                     │ │
│  │  Last Login:    2026-09-01 08:30 AM                                   │ │
│  │  Member Since:  2026-08-29                                           │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Page Implementation

### ProfilePage

**Route:** `/profile`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff, admin)

**Purpose:** View and edit user profile, change password, view activity

**Behavior:**

1. Uses `useProfile()` hook to fetch profile data
2. Uses `useActivityStats()` hook to fetch activity statistics
3. Uses `useUpdateProfile()` mutation to save profile changes
4. Uses `useChangePassword()` mutation to change password
5. Displays profile information (editable fields)
6. Displays password change form
7. Displays activity statistics
8. Auto-detects user type (Staff vs Admin) for role-specific display

**Components:**

- `ProfileInfo`
- `ChangePassword`
- `ActivityStats`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton loaders for all sections |
| Error | Error message with retry |
| Success | Full profile with all sections |
| Saving | Save button disabled with spinner |

**Implementation:**

```typescript
// src/pages/ProfilePage.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile, useUpdateProfile, useChangePassword, useActivityStats } from '@/hooks/useProfile';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ChangePassword } from '@/components/profile/ChangePassword';
import { ActivityStats } from '@/components/profile/ActivityStats';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { updateProfileSchema, changePasswordSchema } from '@/schemas/profile.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);

  // Profile Form
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.type === 'staff' ? (profile as any).phone || '' : '',
    },
  });

  // Password Form
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Reset forms when profile loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        phone: profile.type === 'staff' ? (profile as any).phone || '' : '',
      });
    }
  }, [profile]);

  const onProfileSubmit = (data: any) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const onPasswordSubmit = (data: any) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
    });
  };

  if (profileLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  if (profileError || !profile) {
    return <ErrorState onRetry={refetchProfile} />;
  }

  const isStaff = profile.type === 'staff';
  const isAdmin = profile.type === 'admin';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfo
            profile={profile}
            isLoading={profileLoading}
            onSave={onProfileSubmit}
            isSaving={updateProfileMutation.isPending}
            form={profileForm}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password for security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePassword
            form={passwordForm}
            onSubmit={onPasswordSubmit}
            isSubmitting={changePasswordMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>My Activity</CardTitle>
            <CardDescription>
              Overview of your activity in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityStats
              stats={stats}
              isLoading={statsLoading}
              userType={profile.type}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

---

## 8. Validation Schemas

```typescript
// src/schemas/profile.schema.ts

import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Invalid phone number').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
```

---

## 9. Route Configuration

```typescript
// src/routes/index.tsx

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        // ... other routes
        { 
          path: '/profile', 
          element: withSuspense(ProfilePage) 
        },
      ],
    },
  ],
}
```

---

## 10. Sidebar Navigation Updates

Add "Profile" link to sidebar for both Staff and Admin:

### Staff Sidebar (Updated)

```
+---------------------------------------------------+
|  Palliative Care System                           |
|  ------------------------------------------------- |
|                                                     |
|  [Dashboard]                                       |
|  [Patients]                                        |
|  [Visits]                                          |
|  ------------------------------------------------- |
|  Staff Name                                        |
|  staff@example.com                                 |
|  [Profile]                                         |
|  [Logout]                                          |
+---------------------------------------------------+
```

### Admin Sidebar (Updated)

```
+---------------------------------------------------+
|  Palliative Care System                           |
|  ------------------------------------------------- |
|                                                     |
|  [Dashboard]                                       |
|  [Patients]                                        |
|  [Staff Management]                                |
|  [Referrals]                                       |
|  [Reports]                                         |
|  [Settings]                                        |
|  ------------------------------------------------- |
|  Admin Name                                        |
|  admin@example.com                                 |
|  [Profile]                                         |
|  [Logout]                                          |
+---------------------------------------------------+
```

---

## 11. Flow Diagram

```
+-----------------------------------------------------------+
|                 PROFILE FLOW (FRONTEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    VIEW PROFILE                      | |
|  |                                                     | |
|  |  User clicks Profile in sidebar                     | |
|  |         ↓                                           | |
|  |  Navigate to /profile                               | |
|  |         ↓                                           | |
|  |  useProfile() → GET /profile                        | |
|  |         ↓                                           | |
|  |  useActivityStats() → GET /profile/activity         | |
|  |         ↓                                           | |
|  |  Display profile info, activity stats               | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE PROFILE                    | |
|  |                                                     | |
|  |  User edits name or phone                          | |
|  |         ↓                                           | |
|  |  Click "Save Changes"                               | |
|  |         ↓                                           | |
|  |  useUpdateProfile() → PUT /profile                  | |
|  |         ↓                                           | |
|  |  Success → Toast "Profile updated"                  | |
|  |  Error → Toast error message                        | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    CHANGE PASSWORD                   | |
|  |                                                     | |
|  |  User enters current + new password                 | |
|  |         ↓                                           | |
|  |  Click "Change Password"                             | |
|  |         ↓                                           | |
|  |  useChangePassword() → PUT /profile/password        | |
|  |         ↓                                           | |
|  |  Success → Toast "Password changed"                 | |
|  |  Error → Toast error message                        | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
