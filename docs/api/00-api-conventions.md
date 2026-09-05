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
| Staff Dashboard | `/api/v1/staff` | `staff.routes.ts` |
| Profile | `/api/v1/profile` | `profile.routes.ts` |
| Signatures | `/api/v1/visits/:visitId/sign` | `signature.routes.ts` |

## 8. Role-Based Access

### Admin
- Full system access
- Manage staff registrations
- Manage referrals
- View all patients
- Close patient cases (discharge)
- View dashboard statistics
- Edit visit records (with audit trail)
- Edit admission records (with audit trail)
- Export patient data

### Staff (All Roles)
- Register patients
- Record home visits
- Order medications
- Order lab tests
- Request referrals
- View patient history (read-only)
- Record hospital admissions
- Sign visit records (Physicians and Nurses)
- View staff dashboard
- Update own profile (name, phone)
- Change own password

### Role-Based Restrictions
- All staff have the same permissions for patient care
- No staff can update existing patient records
- No staff can approve referrals
- No staff can close patient cases (discharge)
- No staff can edit visits or admissions
- No staff can approve staff registrations
- No staff can access admin dashboard or reports

## 9. Role Enum Values

| Role | Value |
|---|---|
| Team Leader | `TeamLeader` |
| Physician | `Physician` |
| Nurse | `Nurse` |
| Admin | `admin` |
| Staff | `staff` |

## 10. Common Request Headers

| Header | Value | Required |
|---|---|---|
| `Authorization` | `Bearer <jwt_token>` | For authenticated routes |
| `Content-Type` | `application/json` | For POST/PUT requests |
| `Accept` | `application/json` | For all requests |
| `Accept` | `application/pdf` | For PDF export endpoints |

## 11. Common Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | undefined | Filter by status |
| `search` | string | undefined | Search by name or ID |

## 12. Date Formats

| Context | Format | Example |
|---|---|---|
| Request body (date only) | `YYYY-MM-DD` | `2026-08-29` |
| Request body (time only) | `HH:MM` | `09:00` |
| Response (timestamp) | ISO 8601 UTC | `2026-08-29T10:00:00Z` |
| Response (date only) | ISO 8601 UTC | `2026-08-29T00:00:00Z` |

## 13. Feature to Permission Matrix

| Feature | Public | Staff | Admin |
|---|---|---|---|
| Register | ✓ | - | - |
| Verify Email | ✓ | - | - |
| Resend Verification | ✓ | - | - |
| Login | ✓ | - | - |
| Get Current User | - | ✓ | ✓ |
| Logout | - | ✓ | ✓ |
| Update Profile | - | ✓ | ✓ |
| Change Password | - | ✓ | ✓ |
| View Profile Activity | - | ✓ | ✓ |
| View Staff Dashboard | - | ✓ | - |
| Register Patient | - | ✓ | - |
| View Patients | - | ✓ | ✓ |
| View Patient Detail | - | ✓ | ✓ |
| View Patient Full Detail | - | - | ✓ |
| Record Visit | - | ✓ | - |
| Sign Visit | - | ✓ | - |
| Edit Visit | - | - | ✓ |
| View Visit Edit History | - | - | ✓ |
| Order Medication | - | ✓ | - |
| Order Lab Test | - | ✓ | - |
| Request Referral | - | ✓ | - |
| Approve Referral | - | - | ✓ |
| Record Admission | - | ✓ | - |
| Edit Admission | - | - | ✓ |
| View Admission Edit History | - | - | ✓ |
| Close Case | - | - | ✓ |
| Print Patient History | - | ✓ | ✓ |
| Export Patient PDF | - | ✓ | ✓ |
| Approve Staff | - | - | ✓ |
| View Admin Dashboard | - | - | ✓ |
| View Reports | - | - | ✓ |
| Export Reports | - | - | ✓ |
```