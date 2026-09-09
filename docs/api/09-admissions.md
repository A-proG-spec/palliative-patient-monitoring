```markdown
# api/09-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - HOSPITAL ADMISSIONS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/admissions | Staff | Record hospital admission |
| GET | /patients/:patientId/admissions | Staff, Admin | Get patient admissions |
| GET | /patients/:patientId/admissions/:admissionId | Staff, Admin | Get admission details |
| PUT | /patients/:patientId/admissions/:admissionId | **Admin** | Update admission status (discharge) - **ADMIN ONLY** |

---

## 2. Endpoint Details

### POST /patients/:patientId/admissions

**Purpose:** Record hospital admission for patient

**Auth:** Staff (Any staff member - Nurse, Physician, Team Leader)

**Request Body:**

```json
{
  "referralId": "507f1f77bcf86cd799439016",
  "admissionDate": "2026-08-30",
  "hospitalPatientId": "MRN-2026-0845",
  "bedNumber": "B-12",
  "ward": "Palliative Care Ward",
  "admittingPhysician": "Dr. Kebede",
  "careTeam": "Team A",
  "primaryDiagnosis": "Stage IV Breast Cancer",
  "secondaryDiagnoses": ["Metastatic to bone"],
  "diseaseStage": "Advanced",
  "comorbidities": ["Hypertension"],
  "estimatedPrognosis": "Months",
  "ppsScore": 60,
  "functionalStatus": "PartiallyDependent",
  "painScore": 4,
  "painType": "Mixed",
  "symptomsPresent": ["Fatigue", "Anxiety"],
  "emotionalStatus": "Anxious",
  "familySupport": "Moderate",
  "socialChallenges": "Financial constraints for medications",
  "spiritualConcerns": false,
  "spiritualSupportPreferred": null,
  "painManagementPlan": "Morphine 10mg every 6 hours",
  "medicationPlan": "Continue current medications",
  "nursingCarePlan": "Daily monitoring and pain assessment",
  "homeBasedCareRequired": false,
  "psychosocialSupportPlan": "Counseling referral made",
  "physiotherapyRequired": false
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| referralId | Required, valid ObjectId |
| admissionDate | Required, valid date |
| hospitalPatientId | Optional, string (Hospital MRN) |
| bedNumber | Required |
| ward | Required |
| admittingPhysician | Required |
| careTeam | Required |
| primaryDiagnosis | Required |
| diseaseStage | Required, Early, Advanced, or Terminal |
| estimatedPrognosis | Required, Days, Weeks, Months, or Uncertain |
| ppsScore | Required, 0-100 |
| functionalStatus | Required, valid enum |
| painScore | Required, 0-10 |
| painType | Required, valid enum |
| emotionalStatus | Required, valid enum |
| familySupport | Required, valid enum |
| spiritualConcerns | Required, boolean |
| painManagementPlan | Required |
| medicationPlan | Required |
| nursingCarePlan | Required |
| homeBasedCareRequired | Required, boolean |
| physiotherapyRequired | Required, boolean |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Admission recorded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "patientId": "507f1f77bcf86cd799439012",
    "referralId": "507f1f77bcf86cd799439016",
    "admissionDate": "2026-08-30T00:00:00Z",
    "hospitalPatientId": "MRN-2026-0845",
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "status": "Active",
    "createdBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "Nurse"
    },
    "createdAt": "2026-08-30T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 404 | Referral not found | "Referral not found" |
| 400 | Referral not accepted | "Referral must be accepted before admission" |
| 400 | Validation error | Field-specific errors |

---

### GET /patients/:patientId/admissions

**Purpose:** Get all admissions for a patient

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| status | string | undefined | Filter by status (Active, Discharged) |
| page | number | 1 | Page number |
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
        "id": "507f1f77bcf86cd799439017",
        "admissionDate": "2026-08-30T00:00:00Z",
        "dischargeDate": null,
        "hospitalPatientId": "MRN-2026-0845",
        "bedNumber": "B-12",
        "ward": "Palliative Care Ward",
        "admittingPhysician": "Dr. Kebede",
        "status": "Active",
        "createdBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "createdAt": "2026-08-30T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /patients/:patientId/admissions/:admissionId

**Purpose:** Get detailed admission information

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "patientId": "507f1f77bcf86cd799439012",
    "referralId": "507f1f77bcf86cd799439016",
    "admissionDate": "2026-08-30T00:00:00Z",
    "dischargeDate": null,
    "hospitalPatientId": "MRN-2026-0845",
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "admittingPhysician": "Dr. Kebede",
    "careTeam": "Team A",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "ppsScore": 60,
    "functionalStatus": "PartiallyDependent",
    "painScore": 4,
    "painType": "Mixed",
    "symptomsPresent": ["Fatigue", "Anxiety"],
    "emotionalStatus": "Anxious",
    "familySupport": "Moderate",
    "socialChallenges": "Financial constraints for medications",
    "spiritualConcerns": false,
    "spiritualSupportPreferred": null,
    "painManagementPlan": "Morphine 10mg every 6 hours",
    "medicationPlan": "Continue current medications",
    "nursingCarePlan": "Daily monitoring and pain assessment",
    "homeBasedCareRequired": false,
    "psychosocialSupportPlan": "Counseling referral made",
    "physiotherapyRequired": false,
    "dischargeReason": null,
    "status": "Active",
    "createdBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "Nurse"
    },
    "createdAt": "2026-08-30T10:00:00Z",
    "updatedAt": "2026-08-30T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 404 | Patient not found | "Patient not found" |

---

### PUT /patients/:patientId/admissions/:admissionId (UPDATED - ADMIN ONLY)

**Purpose:** Update admission status or discharge patient

**Auth:** **Admin** (Staff cannot update/discharge admissions)

**Request Body:**

```json
{
  "dischargeDate": "2026-09-05",
  "dischargeReason": "Improved",
  "status": "Discharged"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| dischargeDate | Required if discharging, valid date |
| dischargeReason | Required if discharging, Improved or Deceased |
| status | Required, Active or Discharged |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admission updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "patientId": "507f1f77bcf86cd799439012",
    "admissionDate": "2026-08-30T00:00:00Z",
    "dischargeDate": "2026-09-05T00:00:00Z",
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "dischargeReason": "Improved",
    "status": "Discharged",
    "updatedAt": "2026-09-05T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 404 | Patient not found | "Patient not found" |
| 403 | Staff user | "Only admin can update admissions" |
| 400 | Invalid status | "Invalid status value" |
| 400 | Missing discharge fields | "Discharge date and reason required for discharge" |

---

## 3. Admin Admission Management Endpoints

### GET /admin/admissions/:admissionId

**Purpose:** Get admission details with edit history (admin only)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "patientId": "507f1f77bcf86cd799439012",
    "patientName": "Sarah Johnson",
    "patientDisplayId": "PAT-001",
    "hospitalPatientId": "MRN-2026-0845",
    "referralId": "507f1f77bcf86cd799439016",
    "admissionDate": "2026-08-30T00:00:00Z",
    "dischargeDate": null,
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "admittingPhysician": "Dr. Kebede",
    "careTeam": "Team A",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "ppsScore": 60,
    "functionalStatus": "PartiallyDependent",
    "painScore": 4,
    "painType": "Mixed",
    "symptomsPresent": ["Fatigue", "Anxiety"],
    "emotionalStatus": "Anxious",
    "familySupport": "Moderate",
    "socialChallenges": "Financial constraints for medications",
    "spiritualConcerns": false,
    "spiritualSupportPreferred": null,
    "painManagementPlan": "Morphine 10mg every 6 hours",
    "medicationPlan": "Continue current medications",
    "nursingCarePlan": "Daily monitoring and pain assessment",
    "homeBasedCareRequired": false,
    "psychosocialSupportPlan": "Counseling referral made",
    "physiotherapyRequired": false,
    "dischargeReason": null,
    "status": "Active",
    "createdBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "Nurse"
    },
    "createdAt": "2026-08-30T10:00:00Z",
    "updatedAt": "2026-09-01T10:30:00Z",
    "canEdit": true,
    "editHistory": [
      {
        "editedBy": {
          "id": "507f1f77bcf86cd799439001",
          "name": "Admin User"
        },
        "editedAt": "2026-09-01T10:30:00Z",
        "changes": [
          {
            "field": "bedNumber",
            "from": "B-10",
            "to": "B-12"
          },
          {
            "field": "painScore",
            "from": 5,
            "to": 4
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 403 | Non-admin user | "Forbidden" |
| 401 | Missing or invalid token | "Unauthorized" |

---

### PUT /admin/admissions/:admissionId

**Purpose:** Update admission record (admin only) with audit trail

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Request Body:**

```json
{
  "bedNumber": "B-12",
  "painScore": 4,
  "ppsScore": 60,
  "careTeam": "Team A",
  "functionalStatus": "PartiallyDependent"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| admissionDate | Optional, valid ISO date |
| bedNumber | Optional, string |
| ward | Optional, string |
| admittingPhysician | Optional, string |
| careTeam | Optional, string |
| primaryDiagnosis | Optional, string |
| secondaryDiagnoses | Optional, array of strings |
| diseaseStage | Optional, valid enum (Early, Advanced, Terminal) |
| comorbidities | Optional, array of strings |
| estimatedPrognosis | Optional, valid enum (Days, Weeks, Months, Uncertain) |
| ppsScore | Optional, number between 0-100 |
| functionalStatus | Optional, valid enum (FullyIndependent, PartiallyDependent, FullyDependent) |
| painScore | Optional, number between 0-10 |
| painType | Optional, valid enum (Acute, Chronic, Neuropathic, Mixed) |
| symptomsPresent | Optional, array of strings |
| emotionalStatus | Optional, valid enum (Stable, Anxious, Depressed, Distressed) |
| familySupport | Optional, valid enum (Strong, Moderate, Weak, None) |
| socialChallenges | Optional, string |
| spiritualConcerns | Optional, boolean |
| spiritualSupportPreferred | Optional, valid enum (ReligiousLeader, Counselor, Other) |
| painManagementPlan | Optional, string |
| medicationPlan | Optional, string |
| nursingCarePlan | Optional, string |
| homeBasedCareRequired | Optional, boolean |
| psychosocialSupportPlan | Optional, string |
| physiotherapyRequired | Optional, boolean |
| status | Optional, valid enum (Active, Discharged) |
| dischargeDate | Optional, valid ISO date (required if discharging) |
| dischargeReason | Optional, valid enum (Improved, Deceased) (required if discharging) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admission updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "updatedAt": "2026-09-01T10:35:00Z",
    "updatedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "changes": [
      {
        "field": "bedNumber",
        "from": "B-10",
        "to": "B-12"
      },
      {
        "field": "painScore",
        "from": 5,
        "to": 4"
      }
    ],
    "admission": {
      "id": "507f1f77bcf86cd799439017",
      "admissionDate": "2026-08-30T00:00:00Z",
      "bedNumber": "B-12",
      "painScore": 4,
      "status": "Active"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 403 | Not admin | "Only admin can edit admissions" |
| 400 | Validation error | Field-specific errors |
| 400 | Missing discharge fields | "Discharge date and reason required for discharge" |
| 401 | Missing or invalid token | "Unauthorized" |

---

### GET /admin/admissions/:admissionId/history

**Purpose:** Get admission edit history (audit trail)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "editedBy": {
        "id": "507f1f77bcf86cd799439001",
        "name": "Admin User"
      },
      "editedAt": "2026-09-01T10:30:00Z",
      "changes": [
        {
          "field": "bedNumber",
          "from": "B-10",
          "to": "B-12"
        },
        {
          "field": "painScore",
          "from": 5,
          "to": 4
        }
      ]
    },
    {
      "editedBy": {
        "id": "507f1f77bcf86cd799439005",
        "name": "Super Admin"
      },
      "editedAt": "2026-08-31T14:20:00Z",
      "changes": [
        {
          "field": "ppsScore",
          "from": 55,
          "to": 60
        }
      ]
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 401 | Missing or invalid token | "Unauthorized" |
| 403 | Non-admin user | "Forbidden" |

---

## 4. Type Definitions

```typescript
// src/types/admission.types.ts

export interface HospitalAdmission {
  id: string;
  patientId: string;
  referralId: string;
  admissionDate: string;
  dischargeDate?: string;
  hospitalPatientId?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionRequest {
  referralId: string;
  admissionDate: string;
  hospitalPatientId?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

export interface AdmissionListResponse {
  items: HospitalAdmission[];
  page: number;
  limit: number;
  total: number;
}

// ============================================
// ADMIN ADMISSION TYPES (NEW)
// ============================================

export interface AdminAdmissionDetail extends HospitalAdmission {
  patientName: string;
  patientDisplayId: string;
  canEdit: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: string;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
}

export interface UpdateAdminAdmissionRequest {
  admissionDate?: string;
  bedNumber?: string;
  ward?: string;
  admittingPhysician?: string;
  careTeam?: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  diseaseStage?: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis?: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore?: number;
  functionalStatus?: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore?: number;
  painType?: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  emotionalStatus?: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport?: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns?: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan?: string;
  medicationPlan?: string;
  nursingCarePlan?: string;
  homeBasedCareRequired?: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired?: boolean;
  status?: 'Active' | 'Discharged';
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
}

export interface UpdateAdminAdmissionResponse {
  id: string;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  };
  changes: Array<{
    field: string;
    from: any;
    to: any;
  }>;
  admission: {
    id: string;
    admissionDate: string;
    bedNumber: string;
    painScore: number;
    status: string;
  };
}

export interface AdmissionEditHistoryEntry {
  editedBy: { id: string; name: string };
  editedAt: string;
  changes: Array<{ field: string; from: any; to: any }>;
}
```

