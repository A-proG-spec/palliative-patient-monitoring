# api/13-profile.md


# PALLIATIVE PATIENT MONITORING SYSTEM - PROFILE API SPECIFICATION

## 1. Overview

This document defines the API endpoints for user profile management features including viewing profile information, updating profile details, and changing passwords for both Staff and Admin users.

**Base Path:** `/api/v1`

**Auth:** All endpoints require authentication (Bearer JWT with staff or admin role)

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /profile | Staff, Admin | Get current user profile |
| PUT | /profile | Staff, Admin | Update profile (name, phone) |
| PUT | /profile/password | Staff, Admin | Change password |
| GET | /profile/activity | Staff, Admin | Get user activity statistics |

---

## 3. Endpoint Details

### GET /profile

**Purpose:** Get current user profile information

**Auth:** Staff, Admin

**Success Response (200) - Staff:**

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
    "isEmailVerified": true,
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-09-01T10:00:00Z"
  }
}
```

**Success Response (200) - Admin:**

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
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-09-01T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 404 | User not found | "User not found" |

---

### PUT /profile

**Purpose:** Update user profile (name and phone only)

**Auth:** Staff, Admin

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

**Success Response (200) - Staff:**

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
    "type": "staff",
    "status": "Active",
    "isEmailVerified": true,
    "updatedAt": "2026-09-01T10:30:00Z"
  }
}
```

**Success Response (200) - Admin:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439001",
    "name": "Admin User Updated",
    "email": "admin@example.com",
    "type": "admin",
    "updatedAt": "2026-09-01T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 400 | Validation error | Field-specific errors |
| 404 | User not found | "User not found" |

**Error Response Example (Validation Error):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    }
  ]
}
```

---

### PUT /profile/password

**Purpose:** Change user password

**Auth:** Staff, Admin

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newSecurePass456",
  "confirmPassword": "newSecurePass456"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| currentPassword | Required, must match current password |
| newPassword | Required, min 8 chars, at least 1 uppercase, 1 number |
| confirmPassword | Required, must match newPassword |

**Password Requirements:**

| Requirement | Description |
|---|---|
| Minimum Length | 8 characters |
| Uppercase | At least 1 uppercase letter |
| Number | At least 1 number |
| Special Character | Optional but recommended |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "updatedAt": "2026-09-01T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Invalid current password | "Current password is incorrect" |
| 400 | New password doesn't meet requirements | Field-specific errors |
| 400 | Passwords don't match | "Passwords do not match" |
| 404 | User not found | "User not found" |

**Error Response Example (Invalid Current Password):**

```json
{
  "statusCode": 401,
  "success": false,
  "message": "Current password is incorrect",
  "errors": []
}
```

**Error Response Example (Passwords Don't Match):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Passwords do not match",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "Passwords do not match"
    }
  ]
}
```

**Error Response Example (Weak Password):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Password does not meet requirements",
  "errors": [
    {
      "field": "newPassword",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### GET /profile/activity

**Purpose:** Get user activity statistics

**Auth:** Staff, Admin

**Success Response (200) - Staff:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalVisits": 45,
    "totalPatients": 23,
    "activePatients": 18,
    "todayVisits": 5,
    "lastLogin": "2026-09-01T08:30:00Z",
    "memberSince": "2026-08-29T10:00:00Z"
  }
}
```

**Success Response (200) - Admin:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 234,
    "activePatients": 156,
    "dischargedPatients": 33,
    "pendingReferrals": 12,
    "pendingStaff": 5,
    "lastLogin": "2026-09-01T08:30:00Z",
    "memberSince": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 404 | User not found | "User not found" |

---

## 4. Type Definitions

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

## 5. Validation Schemas

```typescript
// src/schemas/profile.schema.ts

import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().min(10, 'Invalid phone number').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
```

---

## 6. Service Functions

### src/services/profile.service.ts

#### getProfile

| Field | Detail |
|---|---|
| Signature | `getProfile(userId: string): Promise<Profile>` |
| Purpose | Get current user profile |
| Inputs | userId |
| Output | User profile object |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Read-only |

#### updateProfile

| Field | Detail |
|---|---|
| Signature | `updateProfile(userId: string, data: UpdateProfileInput): Promise<UpdateProfileResponse>` |
| Purpose | Update user profile |
| Inputs | userId, data |
| Output | Updated profile |
| Throws | `ApiError(404, "User not found")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Updates user record |

#### changePassword

| Field | Detail |
|---|---|
| Signature | `changePassword(userId: string, data: ChangePasswordInput): Promise<ChangePasswordResponse>` |
| Purpose | Change user password |
| Inputs | userId, data |
| Output | Updated timestamp |
| Throws | `ApiError(404, "User not found")` |
| Throws | `ApiError(401, "Current password is incorrect")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Hashes new password, updates user record |

#### getActivityStats

| Field | Detail |
|---|---|
| Signature | `getActivityStats(userId: string): Promise<ActivityStats>` |
| Purpose | Get user activity statistics |
| Inputs | userId |
| Output | Activity statistics |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Read-only |

---

## 7. Controller Functions

### src/controllers/profile.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getProfile | `profileService.getProfile(req.user.id)` | 200, `SuccessResponse(200, "OK", result)` |
| updateProfile | `profileService.updateProfile(req.user.id, req.body)` | 200, `SuccessResponse(200, "Profile updated successfully", result)` |
| changePassword | `profileService.changePassword(req.user.id, req.body)` | 200, `SuccessResponse(200, "Password changed successfully", result)` |
| getActivityStats | `profileService.getActivityStats(req.user.id)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 8. Route Definitions

### src/routes/profile.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | / | `authMiddleware` | getProfile |
| PUT | / | `authMiddleware, validate(updateProfileSchema)` | updateProfile |
| PUT | /password | `authMiddleware, validate(changePasswordSchema)` | changePassword |
| GET | /activity | `authMiddleware` | getActivityStats |

Mounted at: `/api/v1/profile`

---

## 9. Implementation Notes

### Password Hashing

```typescript
// src/utils/password.ts

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Profile Update Logic

```typescript
// src/services/profile.service.ts (internal logic)

const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  // Try staff first
  let user = await Staff.findById(userId);
  let userType = 'staff';
  
  if (!user) {
    user = await Admin.findById(userId);
    userType = 'admin';
  }
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Only update allowed fields
  if (data.name) user.name = data.name;
  if (data.phone && userType === 'staff') {
    (user as any).phone = data.phone;
  }
  
  await user.save();
  
  // Return updated profile
  // ...
};
```

### Change Password Logic

```typescript
// src/services/profile.service.ts (internal logic)

const changePassword = async (userId: string, data: ChangePasswordInput) => {
  // Find user
  const user = await Staff.findById(userId) || await Admin.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Verify current password
  const isMatch = await comparePassword(data.currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  
  // Hash and set new password
  const hashedPassword = await hashPassword(data.newPassword);
  user.password = hashedPassword;
  await user.save();
  
  return { updatedAt: user.updatedAt };
};
```

---

## 10. Test Cases

### GET /profile

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Staff exists | Mock staff found | GET /profile | 200, returns staff profile |
| Admin exists | Mock admin found | GET /profile | 200, returns admin profile |
| User not found | Mock user not found | GET /profile | 404, "User not found" |

### PUT /profile

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid update | Mock user found | PUT /profile with valid data | 200, profile updated |
| Invalid name | Mock user found | PUT /profile with name "J" | 400, validation error |
| Invalid phone | Mock user found | PUT /profile with invalid phone | 400, validation error |
| User not found | Mock user not found | PUT /profile | 404, "User not found" |

### PUT /profile/password

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid password change | Mock user found, current password correct | PUT /profile/password with valid data | 200, password changed |
| Invalid current password | Mock user found, current password incorrect | PUT /profile/password | 401, "Current password is incorrect" |
| Weak new password | Mock user found | PUT /profile/password with weak password | 400, validation error |
| Passwords don't match | Mock user found | PUT /profile/password with mismatched passwords | 400, "Passwords do not match" |

### GET /profile/activity

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Staff exists | Mock staff found | GET /profile/activity | 200, returns staff activity stats |
| Admin exists | Mock admin found | GET /profile/activity | 200, returns admin activity stats |
| User not found | Mock user not found | GET /profile/activity | 404, "User not found" |

---

## 11. Flow Diagram

```
+-----------------------------------------------------------+
|                    PROFILE FLOW (BACKEND)                  |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    GET PROFILE                       | |
|  |                                                     | |
|  |  GET /profile                                       | |
|  |         -> authMiddleware                           | |
|  |         -> profileController.getProfile             | |
|  |         -> profileService.getProfile                | |
|  |         -> Find user (Staff or Admin)              | |
|  |         -> Return user profile                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE PROFILE                    | |
|  |                                                     | |
|  |  PUT /profile                                       | |
|  |         -> authMiddleware                           | |
|  |         -> validate(updateProfileSchema)            | |
|  |         -> profileController.updateProfile          | |
|  |         -> profileService.updateProfile             | |
|  |         -> Find user (Staff or Admin)              | |
|  |         -> Update allowed fields (name, phone)      | |
|  |         -> Save changes                             | |
|  |         -> Return updated profile                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    CHANGE PASSWORD                   | |
|  |                                                     | |
|  |  PUT /profile/password                              | |
|  |         -> authMiddleware                           | |
|  |         -> validate(changePasswordSchema)           | |
|  |         -> profileController.changePassword         | |
|  |         -> profileService.changePassword            | |
|  |         -> Find user (Staff or Admin)              | |
|  |         -> Verify current password                  | |
|  |         -> Hash new password                        | |
|  |         -> Save changes                             | |
|  |         -> Return success                           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET ACTIVITY STATS                | |
|  |                                                     | |
|  |  GET /profile/activity                              | |
|  |         -> authMiddleware                           | |
|  |         -> profileController.getActivityStats       | |
|  |         -> profileService.getActivityStats          | |
|  |         -> Find user (Staff or Admin)              | |
|  |         -> Calculate user-specific stats            | |
|  |         -> Return activity statistics               | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```