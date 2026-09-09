## `docs/api/00-api-conventions.md`

---

# API Conventions

## Version

**API Version:** 1.0.0

**Base URL:** `/api/v1`

---

## 1.0 Authentication

### 1.1 Bearer Token

All API endpoints (except auth endpoints) require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

### 1.2 Token Expiry

- Access tokens expire after **24 hours**
- Clients must handle 401 responses by redirecting to login

---

## 2.0 Request & Response Format

### 2.1 Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <token>` | For protected endpoints |
| `Content-Type` | `application/json` | For POST/PUT/PATCH with body |
| `Accept` | `application/json` | Always |

### 2.2 Response Envelope

All responses follow a standard envelope structure:

**Success Response:**
```typescript
{
  success: true;
  statusCode: 200 | 201 | 204;
  message?: string;
  data: T;  // The actual response data
}
```

**Error Response:**
```typescript
{
  success: false;
  statusCode: 400 | 401 | 403 | 404 | 422 | 500;
  message: string;
  errors?: Record<string, string[]>;  // Validation errors
}
```

### 2.3 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request — Invalid input |
| 401 | Unauthorised — Missing/invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 422 | Unprocessable Entity — Validation failed |
| 500 | Internal Server Error |

---

## 3.0 Pagination

### 3.1 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page (max: 100) |

### 3.2 Paginated Response

```typescript
{
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}
```

### 3.3 Example

```
GET /patients?page=2&limit=10
```

---

## 4.0 Filtering & Sorting

### 4.1 Filter Parameters

Filter parameters are typically query strings:

```
GET /patients?status=Active&search=john
```

### 4.2 Supported Filters

| Resource | Supported Filters |
|----------|-------------------|
| Patients | `status`, `search` |
| Visits | `patientId`, `date` |
| Medications | `patientId`, `status` |
| Labs | `patientId`, `status` |
| Imaging | `patientId`, `status` |
| Referrals | `patientId`, `status` |
| Admissions | `patientId`, `status` |
| Staff | `status` |

---

## 5.0 Date & Time Format

### 5.1 ISO 8601

All date/time fields are transmitted in **ISO 8601** format:

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

**Example:** `2026-09-10T14:30:00.000Z`

### 5.2 Date-Only Fields

Date-only fields use the format:

```
YYYY-MM-DD
```

**Example:** `2026-09-10`

---

## 6.0 Field Naming Conventions

### 6.1 camelCase

All JSON fields use **camelCase**:

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| `firstName` | `first_name` |
| `patientId` | `patient_id` |
| `dateOfBirth` | `date_of_birth` |

### 6.2 Common Field Names

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (MongoDB ObjectId) |
| `patientId` | string | Reference to Patient |
| `staffId` | string | Reference to Staff |
| `createdAt` | string | ISO timestamp of creation |
| `updatedAt` | string | ISO timestamp of last update |
| `status` | string | Status enum value |

---

## 7.0 Nested Resources

### 7.1 Resource Hierarchy

Resources are nested under their parent:

```
/patients/:patientId/visits
/patients/:patientId/medications
/patients/:patientId/labs
/patients/:patientId/imaging
/patients/:patientId/referrals
/patients/:patientId/admissions
/patients/:patientId/progress-notes
```

### 7.2 Nested Resource Example

```
GET /patients/PAT-001/visits
POST /patients/PAT-001/visits
GET /patients/PAT-001/visits/VIS-001
```

---

## 8.0 Enum Values

### 8.1 Common Enums

| Enum | Values |
|------|--------|
| `PatientStatus` | `Active`, `Discharged` |
| `PatientLocation` | `Home`, `ReferredHospital` |
| `DiseaseStage` | `Early`, `Advanced`, `EndStage`, `Terminal` |
| `Prognosis` | `Days`, `Weeks`, `Months`, `Uncertain` |
| `ReferralStatus` | `Pending`, `Accepted`, `Declined`, `Admitted`, `InfoRequested` |
| `VisitOutcome` | `Stable`, `SymptomsImproved`, `SymptomsUnchanged`, `SymptomsWorsened`, `ReferredToFacility`, `Deceased` |
| `LabStatus` | `Ordered`, `Completed` |
| `MedicationStatus` | `Ordered`, `Given` |
| `AdmissionStatus` | `Active`, `Discharged` |
| `ImagingStatus` | `Ordered`, `Completed` |

### 8.2 Strict Enum Validation

All enum values are validated at the API level. Invalid values return a 400 error.

---

## 9.0 Error Handling

### 9.1 Validation Errors

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### 9.2 Resource Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Patient not found"
}
```

### 9.3 Unauthorised

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorised — Invalid or expired token"
}
```

### 9.4 Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden — Insufficient permissions"
}
```

---

## 10.0 Idempotency

### 10.1 Safe Methods

The following methods are **idempotent**:

- `GET` — safe, no state change
- `PUT` — full update, idempotent
- `DELETE` — idempotent

### 10.2 Non-Idempotent Methods

The following methods are **not idempotent**:

- `POST` — creates new resources (each call creates a new resource)
- `PATCH` — partial update (may not be idempotent)

---

## 11.0 Rate Limiting

### 11.1 Limits

| Endpoint Type | Rate Limit |
|---------------|------------|
| Auth endpoints (login, register) | 5 requests per minute |
| Public endpoints | 60 requests per minute |
| Authenticated endpoints | 120 requests per minute |
| Admin endpoints | 300 requests per minute |

### 11.2 Headers

Rate limit information is returned in response headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Request limit per window |
| `X-RateLimit-Remaining` | Remaining requests in window |
| `X-RateLimit-Reset` | Time when limit resets |

---

## 12.0 Versioning

### 12.1 Version Strategy

API versions are included in the URL path:

```
/api/v1/patients
/api/v2/patients   (future)
```

### 12.2 Deprecation

Deprecated endpoints will be supported for **6 months** before removal.

Deprecated endpoints include a `Deprecation` header:

```
Deprecation: true
Sunset: 2027-03-10
```

---

## 13.0 CORS

### 13.1 Allowed Origins

| Environment | Allowed Origins |
|-------------|-----------------|
| Development | `http://localhost:5173`, `http://localhost:3000` |
| Staging | `https://staging.palliative-care.et` |
| Production | `https://palliative-care.et` |

### 13.2 CORS Headers

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## 14.0 Logging

### 14.1 Request Logging

All API requests are logged with:

- Timestamp
- HTTP method
- URL path
- Status code
- Response time
- User ID (if authenticated)

### 14.2 Error Logging

All API errors are logged with:

- Stack trace (development only)
- Request context
- User ID (if authenticated)

---

## 15.0 API Endpoint Index

| Resource | Base Path |
|----------|-----------|
| Authentication | `/auth` |
| Staff | `/staff` |
| Admin | `/admin` |
| Patients | `/patients` |
| Visits | `/patients/:patientId/visits` |
| Medications | `/patients/:patientId/medications` |
| Labs | `/patients/:patientId/labs` |
| Imaging | `/patients/:patientId/imaging` |
| Referrals | `/patients/:patientId/referrals` |
| Admissions | `/patients/:patientId/admissions` |
| Progress Notes | `/patients/:patientId/progress-notes` |
| Signatures | `/visits/:visitId/signatures` |
| Profile | `/profile` |

---
