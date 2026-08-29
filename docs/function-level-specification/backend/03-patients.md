# function-level-specification/backend/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: PATIENTS

## 1. Overview

This document defines the function-level specification for patient management features including patient registration, patient listing, patient details, patient summary, and patient progress tracking.

**Files Covered:**
- `src/schemas/patient.schema.ts`
- `src/services/patient.service.ts`
- `src/controllers/patient.controller.ts`
- `src/routes/patient.routes.ts`

---

## 2. Schema Definitions

### src/schemas/patient.schema.ts

| Schema | Shape |
|---|---|
| createPatientSchema | `z.object({ body: z.object({ firstName: z.string().min(2), lastName: z.string().min(2), age: z.number().min(1).max(150), sex: z.enum(['Male', 'Female']), dateOfBirth: z.string().date(), address: z.string().min(1), phone: z.string().min(10), emergencyContactName: z.string().min(1), emergencyContactPhone: z.string().min(10), caregiverName: z.string().min(1), caregiverPhone: z.string().min(10), primaryDiagnosis: z.string().min(1), secondaryDiagnoses: z.array(z.string()).optional(), diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']), comorbidities: z.array(z.string()).optional(), estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']) }) })` |
| getPatientsQuerySchema | `z.object({ query: z.object({ page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20), status: z.enum(['Active', 'Discharged']).optional(), search: z.string().optional() }) })` |
| getPatientParamsSchema | `z.object({ params: z.object({ patientId: z.string() }) })` |

---

## 3. Service Functions

### src/services/patient.service.ts

#### registerPatient

| Field | Detail |
|---|---|
| Signature | `registerPatient(data: CreatePatientInput, staffId: string): Promise<PatientDTO>` |
| Purpose | Register a new patient |
| Inputs | Patient data, staffId |
| Output | Created patient object |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Creates patient record in database, generates patientDisplayId (PAT-001, PAT-002, etc.) |

#### getPatients

| Field | Detail |
|---|---|
| Signature | `getPatients(staffId: string, page?: number, limit?: number, status?: string, search?: string): Promise<{ items: PatientDTO[]; total: number }>` |
| Purpose | Get list of patients with pagination and filters |
| Inputs | staffId, page, limit, status, search |
| Output | Paginated patient list |
| Throws | None |
| Side Effects | Read-only |

#### getPatientById

| Field | Detail |
|---|---|
| Signature | `getPatientById(patientId: string): Promise<PatientDetailDTO>` |
| Purpose | Get patient details by ID |
| Inputs | patientId |
| Output | Patient detail object with registeredBy info |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getPatientSummary

| Field | Detail |
|---|---|
| Signature | `getPatientSummary(patientId: string): Promise<PatientSummaryDTO>` |
| Purpose | Get comprehensive patient summary report |
| Inputs | patientId |
| Output | Patient summary with all related records |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getPatientProgress

| Field | Detail |
|---|---|
| Signature | `getPatientProgress(patientId: string): Promise<PatientProgressDTO>` |
| Purpose | Get KPS and PPS scores over time for progress tracking |
| Inputs | patientId |
| Output | Patient progress data with trends |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

## 4. Controller Functions

### src/controllers/patient.controller.ts

| Handler | Calls | Response |
|---|---|---|
| registerPatient | `patientService.registerPatient(req.body, req.user.id)` | 201, `SuccessResponse(201, "Patient registered successfully", result)` |
| getPatients | `patientService.getPatients(req.user.id, req.query.page, req.query.limit, req.query.status, req.query.search)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientById | `patientService.getPatientById(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientSummary | `patientService.getPatientSummary(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientProgress | `patientService.getPatientProgress(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 5. Route Definitions

### src/routes/patient.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createPatientSchema)` | registerPatient |
| GET | / | `authMiddleware, validate(getPatientsQuerySchema)` | getPatients |
| GET | /:patientId | `authMiddleware` | getPatientById |
| GET | /:patientId/summary | `authMiddleware` | getPatientSummary |
| GET | /:patientId/progress | `authMiddleware` | getPatientProgress |

Mounted at: `/api/v1/patients`

---

## 6. Implementation Notes

### Patient Display ID Generation

```typescript
// src/services/patient.service.ts (internal function)

const generatePatientDisplayId = async (): Promise<string> => {
  const count = await Patient.countDocuments();
  const nextNumber = count + 1;
  return `PAT-${String(nextNumber).padStart(3, '0')}`;
};
```

### DTO Types

```typescript
// src/types/patient.types.ts

export interface CreatePatientInput {
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

export interface PatientDTO {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: Date;
}

export interface PatientDetailDTO extends PatientDTO {
  dateOfBirth: Date;
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
  registeredBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientSummaryDTO {
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
    date: Date;
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
    dateOrdered: Date;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
}

export interface PatientProgressDTO {
  patientId: string;
  patientName: string;
  visits: Array<{
    visitId: string;
    visitDate: Date;
    kpsScore: number;
    ppsScore: number;
  }>;
  trends: {
    kps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
    pps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
  };
}
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/patient.schema.ts` | `tests/schemas/patient.schema.test.ts` | Unit |
| `src/services/patient.service.ts` | `tests/services/patient.service.test.ts` | Unit |
| `src/controllers/patient.controller.ts` | `tests/controllers/patient.controller.test.ts` | Unit |
| `src/routes/patient.routes.ts` | `tests/routes/patient.routes.test.ts` | Integration |

---

## 8. Test Cases

### patient.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createPatientSchema accepts valid data | parse valid request body | Passes |
| createPatientSchema rejects missing firstName | parse with firstName empty | Validation fails |
| createPatientSchema rejects invalid age | parse with age 0 | Validation fails |
| createPatientSchema rejects invalid sex | parse with sex "Invalid" | Validation fails |
| createPatientSchema rejects invalid diseaseStage | parse with diseaseStage "Invalid" | Validation fails |
| getPatientsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getPatientsQuerySchema accepts valid status | parse `{ query: { status: "Active" } }` | Passes |

### patient.service.test.ts

#### registerPatient

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid registration | Mock staff exists | call `registerPatient(data, staffId)` | Resolves with patient object, patientDisplayId generated |
| Staff not found | Mock staff not found | call `registerPatient(data, staffId)` | Throws ApiError(404, "Staff member not found") |

#### getPatientById

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found | call `getPatientById(patientId)` | Resolves with patient detail |
| Patient not found | Mock patient not found | call `getPatientById(patientId)` | Throws ApiError(404, "Patient not found") |

#### getPatientSummary

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found with visits, medications, labs, referrals, admissions | call `getPatientSummary(patientId)` | Resolves with complete summary |
| Patient not found | Mock patient not found | call `getPatientSummary(patientId)` | Throws ApiError(404, "Patient not found") |

#### getPatientProgress

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with visits | Mock patient found with multiple visits containing KPS/PPS scores | call `getPatientProgress(patientId)` | Resolves with progress data and trends |
| Patient exists with no visits | Mock patient found with empty visits | call `getPatientProgress(patientId)` | Resolves with empty visits, trends null |
| Patient not found | Mock patient not found | call `getPatientProgress(patientId)` | Throws ApiError(404, "Patient not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                    PATIENT FLOW (BACKEND)                  |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                 | |
|  |                                                     | |
|  |  POST /patients                                     | |
|  |         -> validate(createPatientSchema)            | |
|  |         -> patientController.registerPatient        | |
|  |         -> patientService.registerPatient           | |
|  |         -> Check staff exists                       | |
|  |         -> Generate patientDisplayId                | |
|  |         -> Create patient with status Active        | |
|  |         -> Return patient object                    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST FLOW                         | |
|  |                                                     | |
|  |  GET /patients                                      | |
|  |         -> validate(getPatientsQuerySchema)         | |
|  |         -> patientController.getPatients            | |
|  |         -> patientService.getPatients               | |
|  |         -> Apply filters and pagination             | |
|  |         -> Return patient list                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  GET /patients/:patientId                           | |
|  |         -> patientController.getPatientById         | |
|  |         -> patientService.getPatientById            | |
|  |         -> Find patient by ID                      | |
|  |         -> Populate registeredBy                    | |
|  |         -> Return patient detail                    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SUMMARY FLOW                      | |
|  |                                                     | |
|  |  GET /patients/:patientId/summary                   | |
|  |         -> patientController.getPatientSummary      | |
|  |         -> patientService.getPatientSummary         | |
|  |         -> Find patient                            | |
|  |         -> Get all visits                          | |
|  |         -> Get all medications                     | |
|  |         -> Get all lab tests                       | |
|  |         -> Get all referrals                       | |
|  |         -> Get all admissions                      | |
|  |         -> Return comprehensive summary            | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PROGRESS FLOW                     | |
|  |                                                     | |
|  |  GET /patients/:patientId/progress                  | |
|  |         -> patientController.getPatientProgress     | |
|  |         -> patientService.getPatientProgress        | |
|  |         -> Find patient                            | |
|  |         -> Get visits with KPS/PPS scores          | |
|  |         -> Calculate trends                         | |
|  |         -> Return progress data                     | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
