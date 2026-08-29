# api/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - PATIENT API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients | Staff | Register new patient |
| GET | /patients | Staff | Get patients (filtered) |
| GET | /patients/:patientId | Staff | Get patient details |
| GET | /patients/:patientId/summary | Staff | Get patient summary report |

## 2. Endpoint Details

### POST /patients

**Purpose:** Register new patient

**Auth:** Staff

**Request Body:**

```json
{
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
  "estimatedPrognosis": "Months"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| firstName | Required, min 2 chars |
| lastName | Required, min 2 chars |
| age | Required, number, > 0 |
| sex | Required, Male or Female |
| dateOfBirth | Required, valid date |
| address | Required |
| phone | Required |
| emergencyContactName | Required |
| emergencyContactPhone | Required |
| caregiverName | Required |
| caregiverPhone | Required |
| primaryDiagnosis | Required |
| diseaseStage | Required, Early, Advanced, or EndStage |
| estimatedPrognosis | Required, Days, Weeks, Months, or Uncertain |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Validation error | Field-specific errors |
| 404 | Staff not found | "Staff member not found" |

### GET /patients

**Purpose:** Get list of patients (filtered by role)

**Auth:** Staff, Admin

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
        "registeredAt": "2026-08-29T10:00:00Z"
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
| 400 | Invalid query params | "Invalid pagination parameters" |

### GET /patients/:patientId

**Purpose:** Get patient details

**Auth:** Staff, Admin

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
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

### GET /patients/:patientId/summary

**Purpose:** Get comprehensive patient summary report

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "age": 65,
      "sex": "Female",
      "status": "Active",
      "currentLocation": "Home",
      "patientDisplayId": "PAT-001"
    },
    "diagnosis": {
      "primary": "Stage IV Breast Cancer",
      "secondary": ["Metastatic to bone"],
      "stage": "Advanced"
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "date": "2026-08-29T08:00:00Z",
        "outcome": "Stable",
        "staff": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Jane Doe"
        }
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "status": "Given",
        "administeredAt": "Home"
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
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

## 3. Type Definitions

```typescript
// src/types/patient.types.ts

export interface Patient {
  id: string;
  patientDisplayId?: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
}

export interface PatientListResponse {
  items: Patient[];
  page: number;
  limit: number;
  total: number;
}

export interface PatientSummaryResponse {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    status: string;
    currentLocation: string;
    patientDisplayId?: string;
  };
  diagnosis: {
    primary: string;
    secondary: string[];
    stage: string;
  };
  visits: Array<{
    id: string;
    date: string;
    outcome: string;
    staff: { id: string; name: string };
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    status: string;
    administeredAt: string;
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
}
```