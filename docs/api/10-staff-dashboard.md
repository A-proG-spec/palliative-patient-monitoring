# api/10-staff-dashboard.md


# PALLIATIVE PATIENT MONITORING SYSTEM - STAFF DASHBOARD API SPECIFICATION

## 1. Overview

This document defines the API endpoints for the staff dashboard feature. The staff dashboard provides an overview of assigned patients, upcoming visits, recent activities, and alerts for authenticated staff members.

**Base Path:** `/api/v1/staff`

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /staff/dashboard/stats | Staff | Get staff dashboard statistics |
| GET | /staff/patients | Staff | Get assigned patients |
| GET | /staff/visits/upcoming | Staff | Get upcoming visits |
| GET | /staff/visits/recent | Staff | Get recent visits |
| GET | /staff/alerts | Staff | Get staff alerts |

---

## 3. Endpoint Details

### GET /staff/dashboard/stats

**Purpose:** Get staff dashboard statistics including summary counts and aggregated data

**Auth:** Staff

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "todayVisits": 5,
    "totalPatients": 23,
    "activePatients": 18,
    "pendingTasks": 3,
    "recentVisits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "visitDate": "2026-08-29T08:00:00Z",
        "outcome": "Stable"
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "patientId": "507f1f77bcf86cd799439015",
        "patientName": "Michael Brown",
        "visitDate": "2026-08-28T10:00:00Z",
        "outcome": "SymptomsImproved"
      }
    ],
    "assignedPatients": [
      {
        "id": "507f1f77bcf86cd799439012",
        "patientDisplayId": "PAT-001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "age": 65,
        "sex": "Female",
        "status": "Active",
        "currentLocation": "Home",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "lastVisitDate": "2026-08-29T08:00:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439015",
        "patientDisplayId": "PAT-002",
        "firstName": "Michael",
        "lastName": "Brown",
        "age": 72,
        "sex": "Male",
        "status": "Active",
        "currentLocation": "Home",
        "primaryDiagnosis": "Lung Cancer",
        "lastVisitDate": "2026-08-28T10:00:00Z"
      }
    ],
    "upcomingVisits": [
      {
        "id": "507f1f77bcf86cd799439016",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "scheduledDate": "2026-09-05T09:00:00Z",
        "visitType": "Routine"
      },
      {
        "id": "507f1f77bcf86cd799439017",
        "patientId": "507f1f77bcf86cd799439015",
        "patientName": "Michael Brown",
        "scheduledDate": "2026-09-06T14:00:00Z",
        "visitType": "Follow-up"
      }
    ],
    "alerts": [
      {
        "id": "507f1f77bcf86cd799439018",
        "type": "RedFlag",
        "message": "Severe pain reported for Sarah Johnson",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "createdAt": "2026-08-29T07:00:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439019",
        "type": "ReferralPending",
        "message": "Referral pending for Michael Brown",
        "patientId": "507f1f77bcf86cd799439015",
        "patientName": "Michael Brown",
        "createdAt": "2026-08-28T16:00:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439020",
        "type": "VisitOverdue",
        "message": "Visit overdue for Jane Smith (3 days)",
        "patientId": "507f1f77bcf86cd799439021",
        "patientName": "Jane Smith",
        "createdAt": "2026-08-28T09:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Unauthorized" |
| 404 | Staff not found | "Staff member not found" |

---

### GET /staff/patients

**Purpose:** Get patients assigned to the staff member

**Auth:** Staff

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | undefined | Filter by status (Active, Discharged) |
| search | string | undefined | Search by name or ID |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439012",
        "patientDisplayId": "PAT-001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "age": 65,
        "sex": "Female",
        "status": "Active",
        "currentLocation": "Home",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "lastVisitDate": "2026-08-29T08:00:00Z",
        "nextVisitDate": "2026-09-05T09:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 23
  }
}
```

---

### GET /staff/visits/upcoming

**Purpose:** Get upcoming scheduled visits for the staff member

**Auth:** Staff

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| days | number | 7 | Number of days ahead to look |
| limit | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439016",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "scheduledDate": "2026-09-05T09:00:00Z",
        "visitType": "Routine",
        "priority": "Normal"
      },
      {
        "id": "507f1f77bcf86cd799439017",
        "patientId": "507f1f77bcf86cd799439015",
        "patientName": "Michael Brown",
        "scheduledDate": "2026-09-06T14:00:00Z",
        "visitType": "Follow-up",
        "priority": "High"
      }
    ],
    "total": 2
  }
}
```

---

### GET /staff/visits/recent

**Purpose:** Get recent visits performed by the staff member

**Auth:** Staff

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| days | number | 7 | Number of days to look back |
| limit | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439013",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "visitDate": "2026-08-29T08:00:00Z",
        "visitType": "Routine",
        "outcome": "Stable",
        "notes": "Patient stable, medications reviewed"
      }
    ],
    "total": 5
  }
}
```

---

### GET /staff/alerts

**Purpose:** Get alerts for the staff member

**Auth:** Staff

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| read | boolean | undefined | Filter by read status |
| type | string | undefined | Filter by alert type |
| limit | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439018",
        "type": "RedFlag",
        "message": "Severe pain reported for Sarah Johnson",
        "patientId": "507f1f77bcf86cd799439012",
        "patientName": "Sarah Johnson",
        "read": false,
        "createdAt": "2026-08-29T07:00:00Z"
      }
    ],
    "unreadCount": 3,
    "total": 5
  }
}
```

---

### PUT /staff/alerts/:alertId/read

**Purpose:** Mark alert as read

**Auth:** Staff

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Alert marked as read",
  "data": {
    "id": "507f1f77bcf86cd799439018",
    "read": true
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Alert not found | "Alert not found" |

---

## 4. Type Definitions

```typescript
// src/types/staff.types.ts

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    visitDate: string;
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
    lastVisitDate?: string;
  }>;
  upcomingVisits: Array<{
    id: string;
    patientId: string;
    patientName: string;
    scheduledDate: string;
    visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  }>;
  alerts: Array<{
    id: string;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: string;
    patientName: string;
    createdAt: string;
  }>;
}

export interface AssignedPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
}

export interface UpcomingVisit {
  id: string;
  patientId: string;
  patientName: string;
  scheduledDate: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  priority?: 'Normal' | 'High' | 'Urgent';
}

export interface RecentVisit {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType: string;
  outcome: string;
  notes?: string;
}

export interface StaffAlert {
  id: string;
  type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
  message: string;
  patientId: string;
  patientName: string;
  read: boolean;
  createdAt: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: string;
}
```

---

## 5. Backend Service Functions

```typescript
// src/services/staff.service.ts

/**
 * Get staff dashboard statistics
 */
export const getDashboardStats = async (staffId: string): Promise<StaffDashboardStats> => {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get staff member
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Get today's visits
  const todayVisits = await HomeVisit.countDocuments({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId }
    ],
    visitDate: { $gte: today, $lt: tomorrow }
  });

  // Get assigned patients (patients with visits by this staff)
  const assignedPatientIds = await HomeVisit.distinct('patientId', {
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId }
    ]
  });

  const totalPatients = assignedPatientIds.length;

  // Get active patients
  const activePatients = await Patient.countDocuments({
    _id: { $in: assignedPatientIds },
    status: 'Active'
  });

  // Get recent visits
  const recentVisits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId }
    ]
  })
  .sort({ visitDate: -1 })
  .limit(5)
  .populate('patientId', 'firstName lastName');

  // Get upcoming visits (next 7 days)
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingVisits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId }
    ],
    nextVisitDate: { $gte: today, $lte: sevenDaysFromNow }
  })
  .populate('patientId', 'firstName lastName');

  // Get alerts
  const alerts = await getStaffAlerts(staffId);

  // Build assigned patients list
  const assignedPatients = await Patient.find({
    _id: { $in: assignedPatientIds }
  })
  .select('patientDisplayId firstName lastName age sex status currentLocation primaryDiagnosis')
  .lean();

  // Add last visit date for each patient
  const patientsWithLastVisit = await Promise.all(
    assignedPatients.map(async (patient) => {
      const lastVisit = await HomeVisit.findOne({
        patientId: patient._id,
        $or: [
          { teamLeaderId: staffId },
          { physicianId: staffId },
          { nurseId: staffId }
        ]
      })
      .sort({ visitDate: -1 })
      .select('visitDate');

      return {
        ...patient,
        lastVisitDate: lastVisit?.visitDate
      };
    })
  );

  return {
    todayVisits,
    totalPatients,
    activePatients,
    pendingTasks: alerts.filter(a => !a.read).length,
    recentVisits: recentVisits.map(v => ({
      id: v._id.toString(),
      patientId: v.patientId._id.toString(),
      patientName: `${v.patientId.firstName} ${v.patientId.lastName}`,
      visitDate: v.visitDate,
      outcome: v.outcome
    })),
    assignedPatients: patientsWithLastVisit.map(p => ({
      id: p._id.toString(),
      patientDisplayId: p.patientDisplayId,
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      sex: p.sex,
      status: p.status,
      currentLocation: p.currentLocation,
      primaryDiagnosis: p.primaryDiagnosis,
      lastVisitDate: p.lastVisitDate
    })),
    upcomingVisits: upcomingVisits.map(v => ({
      id: v._id.toString(),
      patientId: v.patientId._id.toString(),
      patientName: `${v.patientId.firstName} ${v.patientId.lastName}`,
      scheduledDate: v.nextVisitDate,
      visitType: v.visitType
    })),
    alerts
  };
};

/**
 * Get staff alerts
 */
const getStaffAlerts = async (staffId: string): Promise<StaffAlert[]> => {
  // Get assigned patient IDs
  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId }
    ]
  });

  const alerts: StaffAlert[] = [];

  // Check for red flags in recent visits
  const recentVisitsWithRedFlags = await HomeVisit.find({
    patientId: { $in: patientIds },
    redFlags: { $ne: [] }
  })
  .sort({ visitDate: -1 })
  .limit(5)
  .populate('patientId', 'firstName lastName');

  for (const visit of recentVisitsWithRedFlags) {
    alerts.push({
      id: `rf_${visit._id}`,
      type: 'RedFlag',
      message: `Red flags reported for ${visit.patientId.firstName} ${visit.patientId.lastName}`,
      patientId: visit.patientId._id,
      patientName: `${visit.patientId.firstName} ${visit.patientId.lastName}`,
      read: false,
      createdAt: visit.createdAt
    });
  }

  // Check for pending referrals
  const pendingReferrals = await Referral.find({
    patientId: { $in: patientIds },
    status: 'Pending'
  })
  .populate('patientId', 'firstName lastName');

  for (const referral of pendingReferrals) {
    alerts.push({
      id: `ref_${referral._id}`,
      type: 'ReferralPending',
      message: `Referral pending for ${referral.patientId.firstName} ${referral.patientId.lastName}`,
      patientId: referral.patientId._id,
      patientName: `${referral.patientId.firstName} ${referral.patientId.lastName}`,
      read: false,
      createdAt: referral.createdAt
    });
  }

  // Check for overdue visits
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const overduePatients = await Patient.find({
    _id: { $in: patientIds },
    status: 'Active',
    createdAt: { $lt: sevenDaysAgo }
  });

  for (const patient of overduePatients) {
    const lastVisit = await HomeVisit.findOne({
      patientId: patient._id,
      $or: [
        { teamLeaderId: staffId },
        { physicianId: staffId },
        { nurseId: staffId }
      ]
    })
    .sort({ visitDate: -1 });

    if (lastVisit && lastVisit.visitDate < sevenDaysAgo) {
      alerts.push({
        id: `ov_${patient._id}`,
        type: 'VisitOverdue',
        message: `Visit overdue for ${patient.firstName} ${patient.lastName}`,
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        read: false,
        createdAt: new Date()
      });
    }
  }

  return alerts;
};
```

---

## 6. Controller Functions

```typescript
// src/controllers/staff.controller.ts

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await staffService.getDashboardStats(req.user.id);
  return SuccessResponse(200, 'OK', stats);
});

export const getAssignedPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const patients = await staffService.getAssignedPatients(req.user.id, {
    page: Number(page),
    limit: Number(limit),
    status: status as string,
    search: search as string
  });
  return SuccessResponse(200, 'OK', patients);
});

export const getUpcomingVisits = asyncHandler(async (req: Request, res: Response) => {
  const { days = 7, limit = 20 } = req.query;
  const visits = await staffService.getUpcomingVisits(req.user.id, {
    days: Number(days),
    limit: Number(limit)
  });
  return SuccessResponse(200, 'OK', visits);
});

export const getRecentVisits = asyncHandler(async (req: Request, res: Response) => {
  const { days = 7, limit = 20 } = req.query;
  const visits = await staffService.getRecentVisits(req.user.id, {
    days: Number(days),
    limit: Number(limit)
  });
  return SuccessResponse(200, 'OK', visits);
});

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { read, type, limit = 20 } = req.query;
  const alerts = await staffService.getAlerts(req.user.id, {
    read: read as string,
    type: type as string,
    limit: Number(limit)
  });
  return SuccessResponse(200, 'OK', alerts);
});

export const markAlertRead = asyncHandler(async (req: Request, res: Response) => {
  const alert = await staffService.markAlertRead(req.params.alertId, req.user.id);
  return SuccessResponse(200, 'Alert marked as read', alert);
});
```

---

## 7. Route Definitions

```typescript
// src/routes/staff.routes.ts

import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { staffController } from '@/controllers/staff.controller';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard/stats', staffController.getDashboardStats);
router.get('/patients', staffController.getAssignedPatients);
router.get('/visits/upcoming', staffController.getUpcomingVisits);
router.get('/visits/recent', staffController.getRecentVisits);
router.get('/alerts', staffController.getAlerts);
router.put('/alerts/:alertId/read', staffController.markAlertRead);

export default router;
```

Mounted at: `/api/v1/staff`

