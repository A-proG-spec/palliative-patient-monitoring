# api/00-api-conventions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - API CONVENTIONS

## 1. Base Conventions

- **Base Path:** `/api/v1`
- **Auth:** `Public` (no token) vs `Staff` (Bearer JWT) vs `Admin` (Bearer JWT)
- **Success Response Envelope:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {}
}
```

- **Error Response Envelope:**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 2. Authentication

### Public Routes
- No authentication required
- Used for registration and login

### Staff Routes
- Bearer JWT token required
- Token obtained via login endpoint
- Staff must have status "Active"

### Admin Routes
- Bearer JWT token required
- Token obtained via login endpoint
- User must have admin role

## 3. Common Error Statuses

| Status | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

## 4. Validation

All request bodies are validated using Zod schemas before reaching controllers. Validation failures return 400 with field-specific errors.

## 5. Timestamps

All date/time fields are ISO 8601 strings (UTC) in both requests and responses.

## 6. Pagination

Endpoints supporting pagination use:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

## 7. Feature to Router Mapping

| Feature | Mounted at | Router File |
|---|---|---|
| Auth | `/api/v1/auth` | `auth.routes.ts` |
| Admin | `/api/v1/admin` | `admin.routes.ts` |
| Patients | `/api/v1/patients` | `patient.routes.ts` |
| Visits | `/api/v1/patients/:patientId/visits` | `visit.routes.ts` |
| Medications | `/api/v1/patients/:patientId/medications` | `medication.routes.ts` |
| Labs | `/api/v1/patients/:patientId/labs` | `lab.routes.ts` |
| Referrals | `/api/v1/patients/:patientId/referrals` | `referral.routes.ts` |
| Admissions | `/api/v1/patients/:patientId/admissions` | `admission.routes.ts` |

## 8. Role-Based Access

### Admin
- Full system access
- Manage staff registrations
- Manage referrals
- View all patients
- Discharge patients
- View dashboard statistics

### Staff (All Roles)
- Register patients
- Record home visits
- Order medications
- Order lab tests
- Request referrals
- View patient history (read-only)
- Record hospital admissions

### Role-Based Restrictions
- All staff have the same permissions for patient care
- No staff can update existing patient records
- No staff can approve referrals
- No staff can discharge patients
