# function-level-specification/backend/09-staff-dashboard.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: STAFF DASHBOARD

## 1. Overview

This document defines the function-level specification for backend staff dashboard features including dashboard statistics, assigned patients, upcoming visits, recent visits, and alerts.

**Files Covered:**
- `src/schemas/staff.schema.ts`
- `src/services/staff.service.ts`
- `src/controllers/staff.controller.ts`
- `src/routes/staff.routes.ts`

---

## 2. Schema Definitions

### src/schemas/staff.schema.ts

| Schema | Shape |
|---|---|
| getDashboardStatsSchema | `z.object({})` (no params) |
| getAssignedPatientsQuerySchema | `z.object({ query: z.object({ page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20), status: z.enum(['Active', 'Discharged']).optional(), search: z.string().optional() }) })` |
| getUpcomingVisitsQuerySchema | `z.object({ query: z.object({ days: z.coerce.number().int().positive().optional().default(7), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getRecentVisitsQuerySchema | `z.object({ query: z.object({ days: z.coerce.number().int().positive().optional().default(7), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getAlertsQuerySchema | `z.object({ query: z.object({ read: z.enum(['true', 'false']).optional(), type: z.enum(['RedFlag', 'ReferralPending', 'MedicationDue', 'VisitOverdue']).optional(), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| markAlertReadParamsSchema | `z.object({ params: z.object({ alertId: z.string() }) })` |

---

## 3. Service Functions

### src/services/staff.service.ts

#### getDashboardStats

| Field | Detail |
|---|---|
| Signature | `getDashboardStats(staffId: string): Promise<StaffDashboardStatsDTO>` |
| Purpose | Get staff dashboard statistics including summary counts and aggregated data |
| Inputs | staffId |
| Output | Dashboard statistics object |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Read-only |

**Implementation Details:**

1. Validate staff exists
2. Get today's date range
3. Count today's visits (where staff is teamLeader, physician, or nurse)
4. Get distinct patient IDs from visits involving staff
5. Count total assigned patients
6. Count active patients
7. Get recent visits (last 5)
8. Get upcoming visits (next 7 days)
9. Build assigned patients list with last visit dates
10. Generate alerts
11. Return aggregated dashboard data

---

#### getAssignedPatients

| Field | Detail |
|---|---|
| Signature | `getAssignedPatients(staffId: string, params: { page: number; limit: number; status?: string; search?: string }): Promise<{ items: AssignedPatientDTO[]; total: number }>` |
| Purpose | Get patients assigned to the staff member with pagination and filters |
| Inputs | staffId, page, limit, status, search |
| Output | Paginated list of assigned patients |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Read-only |

---

#### getUpcomingVisits

| Field | Detail |
|---|---|
| Signature | `getUpcomingVisits(staffId: string, params: { days: number; limit: number }): Promise<{ items: UpcomingVisitDTO[]; total: number }>` |
| Purpose | Get upcoming scheduled visits for the staff member |
| Inputs | staffId, days, limit |
| Output | List of upcoming visits |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Read-only |

---

#### getRecentVisits

| Field | Detail |
|---|---|
| Signature | `getRecentVisits(staffId: string, params: { days: number; limit: number }): Promise<{ items: RecentVisitDTO[]; total: number }>` |
| Purpose | Get recent visits performed by the staff member |
| Inputs | staffId, days, limit |
| Output | List of recent visits |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Read-only |

---

#### getAlerts

| Field | Detail |
|---|---|
| Signature | `getAlerts(staffId: string, params: { read?: string; type?: string; limit: number }): Promise<{ items: StaffAlertDTO[]; unreadCount: number; total: number }>` |
| Purpose | Get alerts for the staff member |
| Inputs | staffId, read, type, limit |
| Output | List of alerts with unread count |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Read-only |

---

#### markAlertRead

| Field | Detail |
|---|---|
| Signature | `markAlertRead(alertId: string, staffId: string): Promise<{ id: string; read: boolean }>` |
| Purpose | Mark alert as read |
| Inputs | alertId, staffId |
| Output | Updated alert object |
| Throws | `ApiError(404, "Alert not found")` |
| Throws | `ApiError(403, "Forbidden")` |
| Side Effects | Updates alert read status |

---

## 4. Controller Functions

### src/controllers/staff.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getDashboardStats | `staffService.getDashboardStats(req.user.id)` | 200, `SuccessResponse(200, "OK", result)` |
| getAssignedPatients | `staffService.getAssignedPatients(req.user.id, req.query)` | 200, `SuccessResponse(200, "OK", result)` |
| getUpcomingVisits | `staffService.getUpcomingVisits(req.user.id, req.query)` | 200, `SuccessResponse(200, "OK", result)` |
| getRecentVisits | `staffService.getRecentVisits(req.user.id, req.query)` | 200, `SuccessResponse(200, "OK", result)` |
| getAlerts | `staffService.getAlerts(req.user.id, req.query)` | 200, `SuccessResponse(200, "OK", result)` |
| markAlertRead | `staffService.markAlertRead(req.params.alertId, req.user.id)` | 200, `SuccessResponse(200, "Alert marked as read", result)` |

---

## 5. Route Definitions

### src/routes/staff.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /dashboard/stats | `authMiddleware` | getDashboardStats |
| GET | /patients | `authMiddleware, validate(getAssignedPatientsQuerySchema)` | getAssignedPatients |
| GET | /visits/upcoming | `authMiddleware, validate(getUpcomingVisitsQuerySchema)` | getUpcomingVisits |
| GET | /visits/recent | `authMiddleware, validate(getRecentVisitsQuerySchema)` | getRecentVisits |
| GET | /alerts | `authMiddleware, validate(getAlertsQuerySchema)` | getAlerts |
| PUT | /alerts/:alertId/read | `authMiddleware, validate(markAlertReadParamsSchema)` | markAlertRead |

Mounted at: `/api/v1/staff`

---

## 6. DTO Types

```typescript
// src/types/staff.types.ts

export interface StaffDashboardStatsDTO {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    visitDate: Date;
    outcome: string;
  }>;
  assignedPatients: Array<{
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    status: 'Active' | 'Discharged';
    currentLocation: 'Home' | 'ReferredHospital';
    primaryDiagnosis: string;
    lastVisitDate?: Date;
  }>;
  upcomingVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    scheduledDate: Date;
    visitType: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: string;
    patientName: string;
    createdAt: Date;
  }>;
}

export interface AssignedPatientDTO {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  lastVisitDate?: Date;
  nextVisitDate?: Date;
}

export interface UpcomingVisitDTO {
  id: string;
  patientId: string;
  patientName: string;
  scheduledDate: Date;
  visitType: string;
  priority?: 'Normal' | 'High' | 'Urgent';
}

export interface RecentVisitDTO {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: Date;
  visitType: string;
  outcome: string;
  notes?: string;
}

export interface StaffAlertDTO {
  id: string;
  type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
  message: string;
  patientId: string;
  patientName: string;
  read: boolean;
  createdAt: Date;
}

export interface StaffAlertListResponseDTO {
  items: StaffAlertDTO[];
  unreadCount: number;
  total: number;
}
```

---

## 7. Implementation Notes

### Staff ID Validation

```typescript
// src/services/staff.service.ts (internal helper)

const validateStaff = async (staffId: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }
  return staff;
};
```

### Alert Generation Logic

| Alert Type | Condition |
|---|---|
| RedFlag | Recent visit has red flags reported |
| ReferralPending | Patient has pending referral |
| VisitOverdue | Patient has not had a visit in over 7 days |

### Query Optimization

```typescript
// Index recommendations for staff dashboard queries
StaffSchema.index({ _id: 1 }); // Already exists
HomeVisitSchema.index({ teamLeaderId: 1, visitDate: -1 });
HomeVisitSchema.index({ physicianId: 1, visitDate: -1 });
HomeVisitSchema.index({ nurseId: 1, visitDate: -1 });
HomeVisitSchema.index({ patientId: 1, teamLeaderId: 1 });
HomeVisitSchema.index({ patientId: 1, physicianId: 1 });
HomeVisitSchema.index({ patientId: 1, nurseId: 1 });
HomeVisitSchema.index({ nextVisitDate: 1 });
ReferralSchema.index({ patientId: 1, status: 1 });
PatientSchema.index({ status: 1 });
```

---

## 8. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/staff.schema.ts` | `tests/schemas/staff.schema.test.ts` | Unit |
| `src/services/staff.service.ts` | `tests/services/staff.service.test.ts` | Unit |
| `src/controllers/staff.controller.ts` | `tests/controllers/staff.controller.test.ts` | Unit |
| `src/routes/staff.routes.ts` | `tests/routes/staff.routes.test.ts` | Integration |

---

## 9. Test Cases

### staff.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| getAssignedPatientsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getAssignedPatientsQuerySchema accepts valid status | parse `{ query: { status: "Active" } }` | Passes |
| getAssignedPatientsQuerySchema rejects invalid status | parse `{ query: { status: "Invalid" } }` | Validation fails |
| getUpcomingVisitsQuerySchema default values | parse `{ query: {} }` | days=7, limit=20 |
| getAlertsQuerySchema accepts valid type | parse `{ query: { type: "RedFlag" } }` | Passes |
| getAlertsQuerySchema rejects invalid type | parse `{ query: { type: "Invalid" } }` | Validation fails |

### staff.service.test.ts

#### getDashboardStats

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Staff exists with data | Mock staff found with visits, patients | call `getDashboardStats(staffId)` | Resolves with dashboard stats |
| Staff not found | Mock staff not found | call `getDashboardStats(staffId)` | Throws ApiError(404, "Staff member not found") |

#### getAlerts

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Alerts exist | Mock staff found with red flags, pending referrals | call `getAlerts(staffId, {})` | Resolves with alerts list |
| No alerts | Mock staff found with no red flags or pending referrals | call `getAlerts(staffId, {})` | Resolves with empty items array |
| Filter by read status | Mock staff found with alerts | call `getAlerts(staffId, { read: "false" })` | Resolves with only unread alerts |

#### markAlertRead

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Alert exists and belongs to staff | Mock alert found, belongs to staff | call `markAlertRead(alertId, staffId)` | Resolves with updated alert |
| Alert not found | Mock alert not found | call `markAlertRead(alertId, staffId)` | Throws ApiError(404, "Alert not found") |
| Alert belongs to different staff | Mock alert found, belongs to different staff | call `markAlertRead(alertId, staffId)` | Throws ApiError(403, "Forbidden") |

---

## 10. Flow Diagram

```
+-----------------------------------------------------------+
|                 STAFF DASHBOARD FLOW (BACKEND)             |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    GET DASHBOARD STATS               | |
|  |                                                     | |
|  |  GET /staff/dashboard/stats                         | |
|  |         -> staffController.getDashboardStats         | |
|  |         -> staffService.getDashboardStats           | |
|  |         -> Validate staff exists                    | |
|  |         -> Count today's visits                     | |
|  |         -> Get assigned patients                    | |
|  |         -> Count active patients                    | |
|  |         -> Get recent visits                        | |
|  |         -> Get upcoming visits                      | |
|  |         -> Generate alerts                          | |
|  |         -> Return dashboard stats                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET ASSIGNED PATIENTS             | |
|  |                                                     | |
|  |  GET /staff/patients                                | |
|  |         -> validate(getAssignedPatientsQuerySchema) | |
|  |         -> staffController.getAssignedPatients      | |
|  |         -> staffService.getAssignedPatients         | |
|  |         -> Get patient IDs from visits              | |
|  |         -> Apply filters and pagination             | |
|  |         -> Return patient list                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET VISITS                        | |
|  |                                                     | |
|  |  GET /staff/visits/upcoming                         | |
|  |         -> staffController.getUpcomingVisits        | |
|  |         -> staffService.getUpcomingVisits           | |
|  |         -> Get visits with future dates             | |
|  |         -> Return upcoming visits                   | |
|  |                                                     | |
|  |  GET /staff/visits/recent                           | |
|  |         -> staffController.getRecentVisits          | |
|  |         -> staffService.getRecentVisits             | |
|  |         -> Get visits with past dates               | |
|  |         -> Return recent visits                     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET ALERTS                       | |
|  |                                                     | |
|  |  GET /staff/alerts                                  | |
|  |         -> validate(getAlertsQuerySchema)           | |
|  |         -> staffController.getAlerts               | |
|  |         -> staffService.getAlerts                  | |
|  |         -> Query alerts with filters               | |
|  |         -> Return alerts with unread count         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    MARK ALERT READ                   | |
|  |                                                     | |
|  |  PUT /staff/alerts/:alertId/read                    | |
|  |         -> validate(markAlertReadParamsSchema)      | |
|  |         -> staffController.markAlertRead            | |
|  |         -> staffService.markAlertRead               | |
|  |         -> Find alert by ID                         | |
|  |         -> Verify belongs to staff                  | |
|  |         -> Update read status                       | |
|  |         -> Return updated alert                     | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
