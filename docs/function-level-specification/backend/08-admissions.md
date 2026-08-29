# function-level-specification/backend/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: HOSPITAL ADMISSIONS

## 1. Overview

This document defines the function-level specification for hospital admission management features including recording admissions, viewing admission history, and updating admission status.

**Files Covered:**
- `src/schemas/admission.schema.ts`
- `src/services/admission.service.ts`
- `src/controllers/admission.controller.ts`
- `src/routes/admission.routes.ts`

---

## 2. Schema Definitions

### src/schemas/admission.schema.ts

| Schema | Shape |
|---|---|
| createAdmissionSchema | `z.object({ body: z.object({ referralId: z.string().min(1), admissionDate: z.string().date(), bedNumber: z.string().min(1), ward: z.string().min(1), admittingPhysician: z.string().min(1), careTeam: z.string().min(1), primaryDiagnosis: z.string().min(1), secondaryDiagnoses: z.array(z.string()).optional(), diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']), comorbidities: z.array(z.string()).optional(), estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']), ppsScore: z.number().min(0).max(100), functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']), painScore: z.number().min(0).max(10), painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']), symptomsPresent: z.array(z.enum(['Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other'])).optional(), emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']), familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']), socialChallenges: z.string().optional(), spiritualConcerns: z.boolean(), spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(), painManagementPlan: z.string().min(1), medicationPlan: z.string().min(1), nursingCarePlan: z.string().min(1), homeBasedCareRequired: z.boolean(), psychosocialSupportPlan: z.string().optional(), physiotherapyRequired: z.boolean() }) })` |
| updateAdmissionSchema | `z.object({ body: z.object({ dischargeDate: z.string().date().optional(), dischargeReason: z.enum(['Improved', 'Deceased']).optional(), status: z.enum(['Active', 'Discharged']) }) })` |
| getAdmissionsQuerySchema | `z.object({ query: z.object({ status: z.enum(['Active', 'Discharged']).optional(), page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getAdmissionParamsSchema | `z.object({ params: z.object({ admissionId: z.string() }) })` |

---

## 3. Service Functions

### src/services/admission.service.ts

#### recordAdmission

| Field | Detail |
|---|---|
| Signature | `recordAdmission(patientId: string, data: CreateAdmissionInput, staffId: string): Promise<AdmissionDTO>` |
| Purpose | Record a hospital admission for a patient |
| Inputs | patientId, admission data, staffId |
| Output | Created admission object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Referral not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Referral must be accepted before admission")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates hospital admission record in database |

#### getAdmissions

| Field | Detail |
|---|---|
| Signature | `getAdmissions(patientId: string, status?: string, page?: number, limit?: number): Promise<{ items: AdmissionDTO[]; total: number }>` |
| Purpose | Get all admissions for a patient with pagination and status filter |
| Inputs | patientId, status, page, limit |
| Output | Paginated admission list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getAdmissionById

| Field | Detail |
|---|---|
| Signature | `getAdmissionById(patientId: string, admissionId: string): Promise<AdmissionDetailDTO>` |
| Purpose | Get admission details by ID |
| Inputs | patientId, admissionId |
| Output | Full admission detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Admission not found")` |
| Side Effects | Read-only |

#### updateAdmission

| Field | Detail |
|---|---|
| Signature | `updateAdmission(patientId: string, admissionId: string, data: UpdateAdmissionInput, staffId: string): Promise<AdmissionDTO>` |
| Purpose | Update admission status (discharge patient) |
| Inputs | patientId, admissionId, data (dischargeDate, dischargeReason, status), staffId |
| Output | Updated admission object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Admission not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Discharge date and reason required for discharge")` |
| Throws | `ApiError(400, "Invalid status value")` |
| Side Effects | Updates admission status, sets dischargeDate and dischargeReason if discharging |

---

## 4. Controller Functions

### src/controllers/admission.controller.ts

| Handler | Calls | Response |
|---|---|---|
| recordAdmission | `admissionService.recordAdmission(req.params.patientId, req.body, req.user.id)` | 201, `SuccessResponse(201, "Admission recorded successfully", result)` |
| getAdmissions | `admissionService.getAdmissions(req.params.patientId, req.query.status, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getAdmissionById | `admissionService.getAdmissionById(req.params.patientId, req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateAdmission | `admissionService.updateAdmission(req.params.patientId, req.params.admissionId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Admission updated successfully", result)` |

---

## 5. Route Definitions

### src/routes/admission.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createAdmissionSchema)` | recordAdmission |
| GET | / | `authMiddleware, validate(getAdmissionsQuerySchema)` | getAdmissions |
| GET | /:admissionId | `authMiddleware` | getAdmissionById |
| PUT | /:admissionId | `authMiddleware, validate(updateAdmissionSchema)` | updateAdmission |

Mounted at: `/api/v1/patients/:patientId/admissions`

---

## 6. Implementation Notes

### DTO Types

```typescript
// src/types/admission.types.ts

export interface CreateAdmissionInput {
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

export interface UpdateAdmissionInput {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

export interface AdmissionDTO {
  id: string;
  admissionDate: Date;
  dischargeDate?: Date;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  status: 'Active' | 'Discharged';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface AdmissionDetailDTO extends AdmissionDTO {
  patientId: string;
  referralId: string;
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
  updatedAt: Date;
}
```

### Referral Validation

```typescript
// src/services/admission.service.ts (internal validation)

const validateReferralForAdmission = async (referralId: string) => {
  const referral = await Referral.findById(referralId);
  
  if (!referral) {
    throw new ApiError(404, 'Referral not found');
  }
  
  if (referral.status !== 'Accepted') {
    throw new ApiError(400, 'Referral must be accepted before admission');
  }
  
  return referral;
};
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/admission.schema.ts` | `tests/schemas/admission.schema.test.ts` | Unit |
| `src/services/admission.service.ts` | `tests/services/admission.service.test.ts` | Unit |
| `src/controllers/admission.controller.ts` | `tests/controllers/admission.controller.test.ts` | Unit |
| `src/routes/admission.routes.ts` | `tests/routes/admission.routes.test.ts` | Integration |

---

## 8. Test Cases

### admission.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createAdmissionSchema accepts valid data | parse valid request body | Passes |
| createAdmissionSchema rejects invalid referralId | parse with referralId empty | Validation fails |
| createAdmissionSchema rejects invalid diseaseStage | parse with diseaseStage "Invalid" | Validation fails |
| createAdmissionSchema rejects invalid ppsScore | parse with ppsScore 150 | Validation fails |
| updateAdmissionSchema accepts valid discharge | parse `{ body: { dischargeDate: "2026-09-05", dischargeReason: "Improved", status: "Discharged" } }` | Passes |
| updateAdmissionSchema rejects invalid status | parse `{ body: { status: "Invalid" } }` | Validation fails |
| getAdmissionsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getAdmissionsQuerySchema accepts valid status | parse `{ query: { status: "Active" } }` | Passes |

### admission.service.test.ts

#### recordAdmission

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists, referral accepted | Mock patient found, referral found with status Accepted, staff found | call `recordAdmission(patientId, data, staffId)` | Resolves with admission object, status Active |
| Patient not found | Mock patient not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Referral not found | Mock patient found, referral not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Referral not found") |
| Referral not accepted | Mock patient found, referral found with status Pending | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(400, "Referral must be accepted before admission") |
| Staff not found | Mock patient found, referral found, staff not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Staff member not found") |

#### getAdmissions

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with admissions | Mock patient found, admissions exist | call `getAdmissions(patientId)` | Resolves with paginated admission list |
| Patient not found | Mock patient not found | call `getAdmissions(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no admissions | Mock patient found, no admissions | call `getAdmissions(patientId)` | Resolves with empty items list |
| Filter by Active status | Mock patient found, admissions exist | call `getAdmissions(patientId, "Active")` | Resolves with only Active admissions |

#### updateAdmission

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Discharge patient | Mock patient found, admission found with status Active, staff found | call `updateAdmission(patientId, admissionId, { dischargeDate: "2026-09-05", dischargeReason: "Improved", status: "Discharged" }, staffId)` | Resolves with admission, status Discharged |
| Patient not found | Mock patient not found | call `updateAdmission(patientId, admissionId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Admission not found | Mock patient found, admission not found | call `updateAdmission(patientId, admissionId, data, staffId)` | Throws ApiError(404, "Admission not found") |
| Discharge missing reason | Mock patient found, admission found | call `updateAdmission(patientId, admissionId, { status: "Discharged" }, staffId)` | Throws ApiError(400, "Discharge date and reason required for discharge") |
| Staff not found | Mock patient found, admission found, staff not found | call `updateAdmission(patientId, admissionId, data, staffId)` | Throws ApiError(404, "Staff member not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                 ADMISSIONS FLOW (BACKEND)                  |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD ADMISSION FLOW             | |
|  |                                                     | |
|  |  POST /patients/:patientId/admissions               | |
|  |         -> validate(createAdmissionSchema)          | |
|  |         -> admissionController.recordAdmission      | |
|  |         -> admissionService.recordAdmission         | |
|  |         -> Check patient exists                     | |
|  |         -> Check referral exists                    | |
|  |         -> Validate referral is Accepted            | |
|  |         -> Check staff exists                       | |
|  |         -> Create admission with status Active      | |
|  |         -> Return admission object                  | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST ADMISSIONS FLOW              | |
|  |                                                     | |
|  |  GET /patients/:patientId/admissions                | |
|  |         -> validate(getAdmissionsQuerySchema)       | |
|  |         -> admissionController.getAdmissions        | |
|  |         -> admissionService.getAdmissions           | |
|  |         -> Check patient exists                     | |
|  |         -> Apply status filter and pagination       | |
|  |         -> Return admission list                    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW ADMISSION FLOW               | |
|  |                                                     | |
|  |  GET /patients/:patientId/admissions/:admissionId   | |
|  |         -> admissionController.getAdmissionById     | |
|  |         -> admissionService.getAdmissionById        | |
|  |         -> Check patient exists                     | |
|  |         -> Find admission by ID                     | |
|  |         -> Return admission detail                  | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DISCHARGE FLOW                    | |
|  |                                                     | |
|  |  PUT /patients/:patientId/admissions/:admissionId   | |
|  |         -> validate(updateAdmissionSchema)          | |
|  |         -> admissionController.updateAdmission      | |
|  |         -> admissionService.updateAdmission         | |
|  |         -> Check patient exists                     | |
|  |         -> Check admission exists                   | |
|  |         -> Validate discharge fields                | |
|  |         -> Check staff exists                       | |
|  |         -> Update status to Discharged              | |
|  |         -> Set dischargeDate and dischargeReason    | |
|  |         -> Return updated admission                 | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
