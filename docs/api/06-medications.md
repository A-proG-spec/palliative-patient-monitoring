# api/05-medications.md


# PALLIATIVE PATIENT MONITORING SYSTEM - MEDICATIONS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/medications | Staff | Order medication |
| GET | /patients/:patientId/medications | Staff | Get patient medications |
| PUT | /patients/:patientId/medications/:medicationId | Staff | Update medication status |

## 2. Endpoint Details

### POST /patients/:patientId/medications

**Purpose:** Order medication for patient

**Auth:** Staff

**Request Body:**

```json
{
  "name": "Morphine",
  "dosage": "10mg",
  "frequency": "Every 6 hours",
  "route": "Oral",
  "administeredAt": "Home"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| name | Required |
| dosage | Required |
| frequency | Required |
| route | Required |
| administeredAt | Required, Home or Hospital |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Medication ordered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "patientId": "507f1f77bcf86cd799439012",
    "name": "Morphine",
    "dosage": "10mg",
    "frequency": "Every 6 hours",
    "route": "Oral",
    "administeredAt": "Home",
    "status": "Ordered",
    "prescribedBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Validation error | Field-specific errors |

### GET /patients/:patientId/medications

**Purpose:** Get all medications for a patient

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| status | string | undefined | Filter by status (Ordered, Given) |
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
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "frequency": "Every 6 hours",
        "route": "Oral",
        "administeredAt": "Home",
        "status": "Ordered",
        "prescribedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "createdAt": "2026-08-29T10:00:00Z"
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

### PUT /patients/:patientId/medications/:medicationId

**Purpose:** Update medication status (mark as Given)

**Auth:** Staff

**Request Body:**

```json
{
  "status": "Given"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| status | Required, must be Ordered or Given |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Medication status updated",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "patientId": "507f1f77bcf86cd799439012",
    "name": "Morphine",
    "dosage": "10mg",
    "frequency": "Every 6 hours",
    "route": "Oral",
    "administeredAt": "Home",
    "status": "Given",
    "prescribedBy": "507f1f77bcf86cd799439011",
    "updatedAt": "2026-08-29T14:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Medication not found | "Medication not found" |
| 404 | Patient not found | "Patient not found" |
| 400 | Invalid status | "Invalid status value" |

## 3. Type Definitions

```typescript
// src/types/medication.types.ts

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
}

export interface UpdateMedicationRequest {
  status: 'Ordered' | 'Given';
}

export interface MedicationListResponse {
  items: Medication[];
  page: number;
  limit: number;
  total: number;
}
