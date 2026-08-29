# function-level-specification/backend/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: ADMIN

## 1. Overview

This document defines the function-level specification for admin features including staff management, dashboard statistics, notifications, referral management, patient discharge, and patient management.

**Files Covered:**
- `src/schemas/admin.schema.ts`
- `src/services/admin.service.ts`
- `src/controllers/admin.controller.ts`
- `src/routes/admin.routes.ts`

---

## 2. Schema Definitions

### src/schemas/admin.schema.ts

| Schema | Shape |
|---|---|
| approveStaffSchema | `z.object({ body: z.object({ role: z.enum(['TeamLeader', 'Physician', 'Nurse']) }) })` |
| dischargePatientSchema | `z.object({ body: z.object({ dischargeReason: z.enum(['Improved', 'Deceased']) }) })` |
| getNotificationsQuerySchema | `z.object({ query: z.object({ limit: z.coerce.number().int().positive().optional().default(20), read: z.enum(['true', 'false']).optional() }) })` |
| getPatientsQuerySchema | `z.object({ query: z.object({ page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20), status: z.enum(['Active', 'Discharged']).optional(), search: z.string().optional() }) })` |
| getReportsQuerySchema | `z.object({ query: z.object({ startDate: z.string().date().optional(), endDate: z.string().date().optional() }) })` |

---

## 3. Service Functions

### src/services/admin.service.ts

#### getPendingStaff

| Field | Detail |
|---|---|
| Signature | `getPendingStaff(): Promise<PendingStaffDTO[]>` |
| Purpose | Get all pending staff registrations |
| Inputs | None |
| Output | Array of pending staff objects |
| Throws | None |
| Side Effects | Read-only |

#### approveStaff

| Field | Detail |
|---|---|
| Signature | `approveStaff(staffId: string, role: string, adminId: string): Promise<StaffDTO>` |
| Purpose | Approve staff registration and assign role |
| Inputs | staffId, role, adminId |
| Output | Updated staff object |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Invalid role specified")` |
| Side Effects | Updates staff status to Active, assigns role, creates notification |

#### rejectStaff

| Field | Detail |
|---|---|
| Signature | `rejectStaff(staffId: string): Promise<{ id: string; status: string }>` |
| Purpose | Reject staff registration |
| Inputs | staffId |
| Output | Staff id and updated status |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Updates staff status to Rejected |

#### getDashboardStats

| Field | Detail |
|---|---|
| Signature | `getDashboardStats(): Promise<DashboardStatsDTO>` |
| Purpose | Get admin dashboard statistics with notifications |
| Inputs | None |
| Output | Dashboard statistics object |
| Throws | None |
| Side Effects | Read-only |

#### getNotifications

| Field | Detail |
|---|---|
| Signature | `getNotifications(limit?: number, read?: boolean): Promise<NotificationsResponseDTO>` |
| Purpose | Get admin notifications |
| Inputs | limit, read |
| Output | Notifications list with unread count |
| Throws | None |
| Side Effects | Read-only |

#### markNotificationRead

| Field | Detail |
|---|---|
| Signature | `markNotificationRead(notificationId: string): Promise<{ id: string; read: boolean }>` |
| Purpose | Mark notification as read |
| Inputs | notificationId |
| Output | Updated notification |
| Throws | `ApiError(404, "Notification not found")` |
| Side Effects | Updates notification read status |

#### getPatients

| Field | Detail |
|---|---|
| Signature | `getPatients(page?: number, limit?: number, status?: string, search?: string): Promise<{ items: AdminPatientDTO[]; total: number }>` |
| Purpose | Get all patients with pagination and filters |
| Inputs | page, limit, status, search |
| Output | Paginated patient list |
| Throws | None |
| Side Effects | Read-only |

#### getPatientDetail

| Field | Detail |
|---|---|
| Signature | `getPatientDetail(patientId: string): Promise<AdminPatientDetailDTO>` |
| Purpose | Get detailed patient information including all records |
| Inputs | patientId |
| Output | Complete patient detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### dischargePatient

| Field | Detail |
|---|---|
| Signature | `dischargePatient(patientId: string, reason: string, adminId: string): Promise<DischargeResponseDTO>` |
| Purpose | Discharge patient (case closed) |
| Inputs | patientId, reason, adminId |
| Output | Patient discharge response |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(400, "Patient is already discharged")` |
| Side Effects | Updates patient status to Discharged, creates notification |

#### getPendingReferrals

| Field | Detail |
|---|---|
| Signature | `getPendingReferrals(): Promise<ReferralDTO[]>` |
| Purpose | Get all pending referral requests |
| Inputs | None |
| Output | Array of pending referrals |
| Throws | None |
| Side Effects | Read-only |

#### approveReferral

| Field | Detail |
|---|---|
| Signature | `approveReferral(referralId: string, adminId: string): Promise<ReferralDTO>` |
| Purpose | Approve referral request |
| Inputs | referralId, adminId |
| Output | Updated referral object |
| Throws | `ApiError(404, "Referral not found")` |
| Side Effects | Updates referral status to Accepted, updates patient location to ReferredHospital, creates notification |

#### declineReferral

| Field | Detail |
|---|---|
| Signature | `declineReferral(referralId: string): Promise<ReferralDTO>` |
| Purpose | Decline referral request |
| Inputs | referralId |
| Output | Updated referral object |
| Throws | `ApiError(404, "Referral not found")` |
| Side Effects | Updates referral status to Declined |

#### getReports

| Field | Detail |
|---|---|
| Signature | `getReports(startDate?: string, endDate?: string): Promise<ReportDataDTO>` |
| Purpose | Get system reports and analytics |
| Inputs | startDate, endDate |
| Output | Report data object |
| Throws | None |
| Side Effects | Read-only |

---

## 4. Controller Functions

### src/controllers/admin.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getPendingStaff | `adminService.getPendingStaff()` | 200, `SuccessResponse(200, "OK", result)` |
| approveStaff | `adminService.approveStaff(req.params.staffId, req.body.role, req.user.id)` | 200, `SuccessResponse(200, "Staff approved successfully", result)` |
| rejectStaff | `adminService.rejectStaff(req.params.staffId)` | 200, `SuccessResponse(200, "Staff registration rejected", result)` |
| getDashboardStats | `adminService.getDashboardStats()` | 200, `SuccessResponse(200, "OK", result)` |
| getNotifications | `adminService.getNotifications(req.query.limit, req.query.read)` | 200, `SuccessResponse(200, "OK", result)` |
| markNotificationRead | `adminService.markNotificationRead(req.params.notificationId)` | 200, `SuccessResponse(200, "Notification marked as read", result)` |
| getPatients | `adminService.getPatients(req.query.page, req.query.limit, req.query.status, req.query.search)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientDetail | `adminService.getPatientDetail(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |
| dischargePatient | `adminService.dischargePatient(req.params.patientId, req.body.dischargeReason, req.user.id)` | 200, `SuccessResponse(200, "Patient discharged successfully", result)` |
| getPendingReferrals | `adminService.getPendingReferrals()` | 200, `SuccessResponse(200, "OK", result)` |
| approveReferral | `adminService.approveReferral(req.params.referralId, req.user.id)` | 200, `SuccessResponse(200, "Referral approved", result)` |
| declineReferral | `adminService.declineReferral(req.params.referralId)` | 200, `SuccessResponse(200, "Referral declined", result)` |
| getReports | `adminService.getReports(req.query.startDate, req.query.endDate)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 5. Route Definitions

### src/routes/admin.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /staff/pending | `authMiddleware, roleMiddleware(['admin'])` | getPendingStaff |
| PUT | /staff/:staffId/approve | `authMiddleware, roleMiddleware(['admin']), validate(approveStaffSchema)` | approveStaff |
| PUT | /staff/:staffId/reject | `authMiddleware, roleMiddleware(['admin'])` | rejectStaff |
| GET | /dashboard/stats | `authMiddleware, roleMiddleware(['admin'])` | getDashboardStats |
| GET | /dashboard/notifications | `authMiddleware, roleMiddleware(['admin']), validate(getNotificationsQuerySchema)` | getNotifications |
| PUT | /dashboard/notifications/:notificationId/read | `authMiddleware, roleMiddleware(['admin'])` | markNotificationRead |
| GET | /patients | `authMiddleware, roleMiddleware(['admin']), validate(getPatientsQuerySchema)` | getPatients |
| GET | /patients/:patientId | `authMiddleware, roleMiddleware(['admin'])` | getPatientDetail |
| PUT | /patients/:patientId/discharge | `authMiddleware, roleMiddleware(['admin']), validate(dischargePatientSchema)` | dischargePatient |
| GET | /referrals/pending | `authMiddleware, roleMiddleware(['admin'])` | getPendingReferrals |
| PUT | /referrals/:referralId/approve | `authMiddleware, roleMiddleware(['admin'])` | approveReferral |
| PUT | /referrals/:referralId/decline | `authMiddleware, roleMiddleware(['admin'])` | declineReferral |
| GET | /reports | `authMiddleware, roleMiddleware(['admin']), validate(getReportsQuerySchema)` | getReports |

Mounted at: `/api/v1/admin`

---

## 6. Implementation Notes

### Role Middleware

```typescript
// src/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.type === 'admin' && allowedRoles.includes('admin')) {
      return next();
    }

    if (req.user.type === 'staff' && req.user.role && allowedRoles.includes(req.user.role)) {
      return next();
    }

    throw new ApiError(403, 'Forbidden');
  };
};
```

### Notification Creation

```typescript
// src/services/admin.service.ts (internal function)

const createNotification = async (type: string, message: string, data: any) => {
  await Notification.create({
    type,
    message,
    data,
    read: false,
  });
};
```

### DTO Types

```typescript
// src/types/admin.types.ts

export interface PendingStaffDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: Date;
}

export interface DashboardStatsDTO {
  totalPatients: number;
  activePatients: number;
  hospitalizedPatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  notifications: {
    staffApprovals: number;
    pendingReferrals: number;
    recentDischarges: number;
  };
  patientsByStatus: Array<{ status: string; count: number }>;
  recentReferrals: Array<{
    id: string;
    patientName: string;
    date: Date;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: Date;
    staff: string;
  }>;
}

export interface AdminPatientDTO {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: Date;
  registeredBy: {
    id: string;
    name: string;
  };
}

export interface AdminPatientDetailDTO extends AdminPatientDTO {
  dateOfBirth: Date;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  visits: Array<{
    id: string;
    visitDate: Date;
    outcome: string;
    staff: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    status: string;
  }>;
  labTests: Array<{
    id: string;
    name: string;
    dateOrdered: Date;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
}

export interface DischargeResponseDTO {
  id: string;
  status: 'Discharged';
  dischargeReason: 'Improved' | 'Deceased';
  dischargeDate: Date;
}

export interface ReportDataDTO {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  hospitalizedPatients: number;
  referralsByStatus: Array<{ status: string; count: number }>;
  patientsByLocation: Array<{ location: string; count: number }>;
  patientsByStage: Array<{ stage: string; count: number }>;
  dischargesByReason: Array<{ reason: string; count: number }>;
  visitsByMonth: Array<{ month: string; count: number }>;
}
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/admin.schema.ts` | `tests/schemas/admin.schema.test.ts` | Unit |
| `src/services/admin.service.ts` | `tests/services/admin.service.test.ts` | Unit |
| `src/controllers/admin.controller.ts` | `tests/controllers/admin.controller.test.ts` | Unit |
| `src/routes/admin.routes.ts` | `tests/routes/admin.routes.test.ts` | Integration |

---

## 8. Test Cases

### admin.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| approveStaffSchema accepts valid role | parse `{ body: { role: "Nurse" } }` | Passes |
| approveStaffSchema rejects invalid role | parse `{ body: { role: "Invalid" } }` | Validation fails |
| dischargePatientSchema accepts valid reason | parse `{ body: { dischargeReason: "Improved" } }` | Passes |
| dischargePatientSchema rejects invalid reason | parse `{ body: { dischargeReason: "Invalid" } }` | Validation fails |
| getPatientsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getPatientsQuerySchema accepts valid status | parse `{ query: { status: "Active" } }` | Passes |
| getPatientsQuerySchema rejects invalid status | parse `{ query: { status: "Invalid" } }` | Validation fails |

### admin.service.test.ts

#### approveStaff

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Staff exists and pending | Mock staff found with status Pending | call `approveStaff(staffId, role, adminId)` | Resolves with updated staff, status Active |
| Staff not found | Mock staff not found | call `approveStaff(staffId, role, adminId)` | Throws ApiError(404, "Staff member not found") |
| Invalid role | Mock staff found | call `approveStaff(staffId, "Invalid", adminId)` | Throws ApiError(400, "Invalid role specified") |

#### dischargePatient

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists and active | Mock patient found with status Active | call `dischargePatient(patientId, reason, adminId)` | Resolves with updated patient, status Discharged |
| Patient not found | Mock patient not found | call `dischargePatient(patientId, reason, adminId)` | Throws ApiError(404, "Patient not found") |
| Patient already discharged | Mock patient found with status Discharged | call `dischargePatient(patientId, reason, adminId)` | Throws ApiError(400, "Patient is already discharged") |

#### approveReferral

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Referral exists and pending | Mock referral found with status Pending | call `approveReferral(referralId, adminId)` | Resolves with updated referral, status Accepted |
| Referral not found | Mock referral not found | call `approveReferral(referralId, adminId)` | Throws ApiError(404, "Referral not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                    ADMIN FLOW (BACKEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    STAFF APPROVAL FLOW               | |
|  |                                                     | |
|  |  GET /admin/staff/pending                           | |
|  |         -> adminService.getPendingStaff()           | |
|  |         -> Return pending staff list                | |
|  |                                                     | |
|  |  PUT /admin/staff/:staffId/approve                  | |
|  |         -> adminService.approveStaff()              | |
|  |         -> Check staff exists                       | |
|  |         -> Check staff is pending                   | |
|  |         -> Assign role                              | |
|  |         -> Update status to Active                  | |
|  |         -> Create notification                      | |
|  |         -> Return updated staff                     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DASHBOARD FLOW                    | |
|  |                                                     | |
|  |  GET /admin/dashboard/stats                         | |
|  |         -> adminService.getDashboardStats()         | |
|  |         -> Count patients by status                 | |
|  |         -> Count pending staff                      | |
|  |         -> Count pending referrals                  | |
|  |         -> Get recent referrals and visits          | |
|  |         -> Return statistics                        | |
|  |                                                     | |
|  |  GET /admin/dashboard/notifications                 | |
|  |         -> adminService.getNotifications()          | |
|  |         -> Return notifications with unread count   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PATIENT MANAGEMENT FLOW           | |
|  |                                                     | |
|  |  GET /admin/patients                                | |
|  |         -> adminService.getPatients()               | |
|  |         -> Apply filters and pagination             | |
|  |         -> Return patient list                      | |
|  |                                                     | |
|  |  GET /admin/patients/:patientId                     | |
|  |         -> adminService.getPatientDetail()          | |
|  |         -> Get patient with all records             | |
|  |         -> Return patient detail                    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REFERRAL MANAGEMENT FLOW          | |
|  |                                                     | |
|  |  GET /admin/referrals/pending                       | |
|  |         -> adminService.getPendingReferrals()       | |
|  |         -> Return pending referrals                 | |
|  |                                                     | |
|  |  PUT /admin/referrals/:referralId/approve           | |
|  |         -> adminService.approveReferral()           | |
|  |         -> Check referral exists                    | |
|  |         -> Update status to Accepted                | |
|  |         -> Update patient location to ReferredHospital| |
|  |         -> Create notification                      | |
|  |         -> Return updated referral                  | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DISCHARGE FLOW                    | |
|  |                                                     | |
|  |  PUT /admin/patients/:patientId/discharge           | |
|  |         -> adminService.dischargePatient()          | |
|  |         -> Check patient exists                     | |
|  |         -> Check patient is active                  | |
|  |         -> Update status to Discharged              | |
|  |         -> Record discharge reason and date         | |
|  |         -> Create notification                      | |
|  |         -> Return discharge response                | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REPORTS FLOW                      | |
|  |                                                     | |
|  |  GET /admin/reports                                 | |
|  |         -> adminService.getReports()                | |
|  |         -> Aggregate patient data                   | |
|  |         -> Aggregate referral data                  | |
|  |         -> Aggregate visit data                     | |
|  |         -> Return report data                       | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
