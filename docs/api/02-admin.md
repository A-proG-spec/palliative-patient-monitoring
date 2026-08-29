# api/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - ADMIN API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/staff/pending | Admin | Get pending staff registrations |
| PUT | /admin/staff/:staffId/approve | Admin | Approve staff |
| PUT | /admin/staff/:staffId/reject | Admin | Reject staff |
| GET | /admin/dashboard/stats | Admin | Get dashboard statistics |
| GET | /admin/dashboard/notifications | Admin | Get admin notifications |
| PUT | /admin/dashboard/notifications/:notificationId/read | Admin | Mark notification as read |
| GET | /admin/patients | Admin | Get all patients |
| GET | /admin/patients/:patientId | Admin | Get patient details |
| PUT | /admin/patients/:patientId/close-case | Admin | Close patient case (discharge) |
| GET | /admin/referrals/pending | Admin | Get pending referrals |
| PUT | /admin/referrals/:referralId/approve | Admin | Approve referral |
| PUT | /admin/referrals/:referralId/decline | Admin | Decline referral |
| GET | /admin/reports | Admin | Get system reports |
| GET | /admin/reports/export | Admin | Export report (PDF/Excel) |

## 2. Endpoint Details

### GET /admin/staff/pending

**Purpose:** Get all pending staff registrations

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+251911111111",
      "role": null,
      "status": "Pending",
      "createdAt": "2026-08-29T10:00:00Z"
    }
  ]
}
```

---

### PUT /admin/staff/:staffId/approve

**Purpose:** Approve staff registration and assign role

**Auth:** Admin

**Request Body:**

```json
{
  "role": "Nurse"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| role | Required, must be TeamLeader, Physician, or Nurse |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Staff approved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911111111",
    "role": "Nurse",
    "status": "Active",
    "assignedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "updatedAt": "2026-08-29T10:05:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Staff not found | "Staff member not found" |
| 400 | Invalid role | "Invalid role specified" |
| 400 | Staff already approved | "Staff member is already approved" |

---

### PUT /admin/staff/:staffId/reject

**Purpose:** Reject staff registration

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Staff registration rejected",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "Rejected"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Staff not found | "Staff member not found" |
| 400 | Staff already approved | "Staff member is already approved" |

---

### GET /admin/dashboard/stats

**Purpose:** Get admin dashboard statistics with notifications

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 234,
    "activePatients": 156,
    "hospitalizedPatients": 45,
    "dischargedPatients": 33,
    "pendingReferrals": 12,
    "pendingStaff": 5,
    "notifications": {
      "staffApprovals": 3,
      "pendingReferrals": 12,
      "recentCloseCases": 5
    },
    "patientsByStatus": [
      { "status": "Active", "count": 156 },
      { "status": "Discharged", "count": 33 },
      { "status": "ReferredHospital", "count": 45 }
    ],
    "recentReferrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "patientName": "Sarah Johnson",
        "date": "2026-08-29T09:30:00Z",
        "status": "Pending"
      }
    ],
    "recentVisits": [
      {
        "patientName": "Sarah Johnson",
        "date": "2026-08-29T08:00:00Z",
        "staff": "Jane Doe"
      }
    ]
  }
}
```

---

### GET /admin/dashboard/notifications

**Purpose:** Get admin notifications

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| limit | number | 20 | Number of notifications to return |
| read | boolean | undefined | Filter by read status |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "notifications": [
      {
        "id": "507f1f77bcf86cd799439020",
        "type": "StaffApproval",
        "message": "New staff registration pending: John Doe",
        "data": {
          "staffId": "507f1f77bcf86cd799439011",
          "staffName": "John Doe"
        },
        "read": false,
        "createdAt": "2026-08-29T10:00:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439021",
        "type": "ReferralApproval",
        "message": "New referral request: Sarah Johnson",
        "data": {
          "referralId": "507f1f77bcf86cd799439016",
          "patientId": "507f1f77bcf86cd799439012",
          "patientName": "Sarah Johnson"
        },
        "read": false,
        "createdAt": "2026-08-29T09:30:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "type": "CloseCase",
        "message": "Patient case closed: Michael Brown",
        "data": {
          "patientId": "507f1f77bcf86cd799439013",
          "patientName": "Michael Brown",
          "reason": "Improved"
        },
        "read": true,
        "createdAt": "2026-08-28T16:00:00Z"
      }
    ],
    "unreadCount": 15,
    "totalCount": 25
  }
}
```

---

### PUT /admin/dashboard/notifications/:notificationId/read

**Purpose:** Mark notification as read

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "read": true
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Notification not found | "Notification not found" |

---

### GET /admin/patients

**Purpose:** Get all patients with pagination and filters

**Auth:** Admin

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
        "registeredAt": "2026-08-29T10:00:00Z",
        "registeredBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        }
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

### GET /admin/patients/:patientId

**Purpose:** Get detailed patient information including all records

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "age": 65,
    "sex": "Female",
    "dateOfBirth": "1961-08-15",
    "address": "Bole, Addis Ababa",
    "phone": "+251922222222",
    "emergencyContactName": "Michael Johnson",
    "emergencyContactPhone": "+251933333333",
    "caregiverName": "Michael Johnson",
    "caregiverPhone": "+251933333333",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "visitDate": "2026-08-29T08:00:00Z",
        "outcome": "Stable",
        "staff": "Jane Doe"
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "status": "Given"
      }
    ],
    "labTests": [
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "Complete Blood Count",
        "dateOrdered": "2026-08-29T09:00:00Z",
        "result": "Normal"
      }
    ],
    "referrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "date": "2026-08-29T09:30:00Z",
        "status": "Pending"
      }
    ],
    "admissions": [
      {
        "id": "507f1f77bcf86cd799439017",
        "date": "2026-08-30T10:00:00Z",
        "status": "Active"
      }
    ],
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### PUT /admin/patients/:patientId/close-case

**Purpose:** Close patient case (formerly "discharge patient")

**Auth:** Admin

**Request Body:**

```json
{
  "reason": "Improved"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| reason | Required, must be Improved or Deceased |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Patient case closed successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "Discharged",
    "closeReason": "Improved",
    "closeDate": "2026-08-29T10:15:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Invalid reason | "Invalid close reason" |
| 400 | Already closed | "Patient case is already closed" |

---

### GET /admin/referrals/pending

**Purpose:** Get pending referral requests

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "507f1f77bcf86cd799439016",
      "patientId": "507f1f77bcf86cd799439012",
      "patientName": "Sarah Johnson",
      "referralDate": "2026-08-29T09:30:00Z",
      "primaryDiagnosis": "Stage IV Breast Cancer",
      "status": "Pending",
      "reasons": ["SymptomControl", "PainManagement"],
      "receivingFacility": "Yekatit 12 Hospital"
    }
  ]
}
```

---

### PUT /admin/referrals/:referralId/approve

**Purpose:** Approve referral request

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Referral approved",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "status": "Accepted",
    "approvedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "updatedAt": "2026-08-29T10:10:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Referral not found | "Referral not found" |
| 400 | Referral already processed | "Referral has already been processed" |

---

### PUT /admin/referrals/:referralId/decline

**Purpose:** Decline referral request

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Referral declined",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "status": "Declined"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Referral not found | "Referral not found" |
| 400 | Referral already processed | "Referral has already been processed" |

---

### GET /admin/reports

**Purpose:** Get system reports and analytics

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| startDate | string | undefined | Start date for report (ISO date) |
| endDate | string | undefined | End date for report (ISO date) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 234,
    "activePatients": 156,
    "dischargedPatients": 33,
    "hospitalizedPatients": 45,
    "referralsByStatus": [
      { "status": "Pending", "count": 12 },
      { "status": "Accepted", "count": 25 },
      { "status": "Declined", "count": 8 },
      { "status": "Admitted", "count": 10 }
    ],
    "patientsByLocation": [
      { "location": "Home", "count": 156 },
      { "location": "ReferredHospital", "count": 45 }
    ],
    "patientsByStage": [
      { "stage": "Early", "count": 30 },
      { "stage": "Advanced", "count": 120 },
      { "stage": "EndStage", "count": 84 }
    ],
    "closeCasesByReason": [
      { "reason": "Improved", "count": 20 },
      { "reason": "Deceased", "count": 13 }
    ],
    "visitsByMonth": [
      { "month": "2026-08", "count": 45 },
      { "month": "2026-07", "count": 38 }
    ]
  }
}
```

---

### GET /admin/reports/export

**Purpose:** Export system report in PDF or Excel format

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| format | string | Required | Export format: 'pdf' or 'excel' |
| startDate | string | undefined | Start date for report (ISO date) |
| endDate | string | undefined | End date for report (ISO date) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {} // Returns file blob
}
```

**Response Headers:**

- **For PDF:** `Content-Type: application/pdf`, `Content-Disposition: attachment; filename=report.pdf`
- **For Excel:** `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename=report.xlsx`

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid format | "Invalid export format. Must be 'pdf' or 'excel'" |

---

## 3. Type Definitions

```typescript
// src/types/admin.types.ts

export interface PendingStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: string;
}

export interface ApproveStaffRequest {
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface ApprovedStaffResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Active';
  assignedBy: {
    id: string;
    name: string;
  };
  updatedAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  hospitalizedPatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  notifications: {
    staffApprovals: number;
    pendingReferrals: number;
    recentCloseCases: number;
  };
  patientsByStatus: Array<{ status: string; count: number }>;
  recentReferrals: Array<{
    id: string;
    patientName: string;
    date: string;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: string;
    staff: string;
  }>;
}

export interface Notification {
  id: string;
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: string;
    referralId?: string;
    patientId?: string;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: string;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: string;
}

export interface AdminPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: string;
  registeredBy: {
    id: string;
    name: string;
  };
}

export interface AdminPatientDetail extends AdminPatient {
  dateOfBirth: string;
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
    visitDate: string;
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
    dateOrdered: string;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  createdAt: string;
}

export interface ReportData {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  hospitalizedPatients: number;
  referralsByStatus: Array<{ status: string; count: number }>;
  patientsByLocation: Array<{ location: string; count: number }>;
  patientsByStage: Array<{ stage: string; count: number }>;
  closeCasesByReason: Array<{ reason: string; count: number }>;
  visitsByMonth: Array<{ month: string; count: number }>;
}

export interface ExportReportRequest {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
}
```

---

## 4. Summary of Changes

| Change | Before | After |
|---|---|---|
| Patient discharge endpoint | `PUT /admin/patients/:patientId/discharge` | `PUT /admin/patients/:patientId/close-case` |
| Notification type | `'Discharge'` | `'CloseCase'` |
| Dashboard stats field | `recentDischarges` | `recentCloseCases` |
| Response field | `dischargeReason`, `dischargeDate` | `closeReason`, `closeDate` |
| Request body field | `dischargeReason` | `reason` |
| Report field | `dischargesByReason` | `closeCasesByReason` |
| Export endpoint | Not available | Added `GET /admin/reports/export` |
| Approved staff response | Basic object | Includes `assignedBy` with admin details |
