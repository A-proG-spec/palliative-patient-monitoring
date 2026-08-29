# api/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - HOSPITAL ADMISSIONS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/admissions | Staff | Record hospital admission |
| GET | /patients/:patientId/admissions | Staff | Get patient admissions |
| GET | /patients/:patientId/admissions/:admissionId | Staff | Get admission details |
| PUT | /patients/:patientId/admissions/:admissionId | Staff | Update admission status |

## 2. Endpoint Details

### POST /patients/:patientId/admissions

**Purpose:** Record hospital admission for patient

**Auth:** Staff

**Request Body:**

```json
{
  "referralId": "507f1f77bcf86cd799439016",
  "admissionDate": "2026-08-30",
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
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "status": "Active",
    "createdBy": "507f1f77bcf86cd799439011",
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
        "bedNumber": "B-12",
        "ward": "Palliative Care Ward",
        "admittingPhysician": "Dr. Kebede",
        "status": "Active",
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
      "name": "John Doe"
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

### PUT /patients/:patientId/admissions/:admissionId

**Purpose:** Update admission status or discharge patient

**Auth:** Staff

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
| 400 | Invalid status | "Invalid status value" |
| 400 | Missing discharge fields | "Discharge date and reason required for discharge" |

## 3. Type Definitions

```typescript
// src/types/admission.types.ts

export interface HospitalAdmission {
  id: string;
  patientId: string;
  referralId: string;
  admissionDate: string;
  dischargeDate?: string;
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
```