# api/07-labs.md


# PALLIATIVE PATIENT MONITORING SYSTEM - LABORATORY TESTS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/labs | Staff | Order laboratory test |
| GET | /patients/:patientId/labs | Staff | Get patient lab tests |
| PUT | /patients/:patientId/labs/:labId | Staff | Update lab test result |

## 2. Endpoint Details

### POST /patients/:patientId/labs

**Purpose:** Order laboratory test for patient

**Auth:** Staff

**Request Body:**

```json
{
  "testName": "Complete Blood Count",
  "dateOrdered": "2026-08-29",
  "location": "Home"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| testName | Required |
| dateOrdered | Required, valid date |
| location | Required, Home or Hospital |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Lab test ordered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "patientId": "507f1f77bcf86cd799439012",
    "testName": "Complete Blood Count",
    "dateOrdered": "2026-08-29T00:00:00Z",
    "location": "Home",
    "orderedBy": "507f1f77bcf86cd799439011",
    "status": "Ordered",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Validation error | Field-specific errors |

### GET /patients/:patientId/labs

**Purpose:** Get all lab tests for a patient

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| status | string | undefined | Filter by status (Ordered, Completed) |
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
        "id": "507f1f77bcf86cd799439015",
        "testName": "Complete Blood Count",
        "dateOrdered": "2026-08-29T00:00:00Z",
        "datePerformed": "2026-08-30T00:00:00Z",
        "result": "Normal",
        "location": "Home",
        "status": "Completed",
        "orderedBy": {
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

### PUT /patients/:patientId/labs/:labId

**Purpose:** Update lab test result (mark as Completed with result)

**Auth:** Staff

**Request Body:**

```json
{
  "datePerformed": "2026-08-30",
  "result": "Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| datePerformed | Required, valid date |
| result | Required |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Lab test result updated",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "patientId": "507f1f77bcf86cd799439012",
    "testName": "Complete Blood Count",
    "dateOrdered": "2026-08-29T00:00:00Z",
    "datePerformed": "2026-08-30T00:00:00Z",
    "result": "Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250",
    "location": "Home",
    "status": "Completed",
    "orderedBy": "507f1f77bcf86cd799439011",
    "updatedAt": "2026-08-30T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Lab test not found | "Lab test not found" |
| 404 | Patient not found | "Patient not found" |

## 3. Type Definitions

```typescript
// src/types/lab.types.ts

export interface LaboratoryTest {
  id: string;
  patientId: string;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabRequest {
  testName: string;
  dateOrdered: string;
  location: 'Home' | 'Hospital';
}

export interface UpdateLabRequest {
  datePerformed: string;
  result: string;
}

export interface LabListResponse {
  items: LaboratoryTest[];
  page: number;
  limit: number;
  total: number;
}
```