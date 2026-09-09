```markdown
# function-level-specification/backend/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: HOSPITAL ADMISSIONS

## 1. Overview

This document defines the function-level specification for hospital admission management features including recording admissions, viewing admission history, updating admission status (admin only), and admin edit with audit trail.

**Files Covered:**
- `src/schemas/admission.schema.ts`
- `src/services/admission.service.ts`
- `src/controllers/admission.controller.ts`
- `src/routes/admission.routes.ts`
- `src/services/admin.service.ts` (for admin admission management)

---

## 2. Schema Definitions

### src/schemas/admission.schema.ts

| Schema | Shape |
|---|---|
| createAdmissionSchema | `z.object({ body: z.object({ referralId: z.string().min(1), admissionDate: z.string().date(), hospitalPatientId: z.string().optional(), bedNumber: z.string().min(1), ward: z.string().min(1), admittingPhysician: z.string().min(1), careTeam: z.string().min(1), primaryDiagnosis: z.string().min(1), secondaryDiagnoses: z.array(z.string()).optional(), diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']), comorbidities: z.array(z.string()).optional(), estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']), ppsScore: z.number().min(0).max(100), functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']), painScore: z.number().min(0).max(10), painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']), symptomsPresent: z.array(z.enum(['Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other'])).optional(), emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']), familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']), socialChallenges: z.string().optional(), spiritualConcerns: z.boolean(), spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(), painManagementPlan: z.string().min(1), medicationPlan: z.string().min(1), nursingCarePlan: z.string().min(1), homeBasedCareRequired: z.boolean(), psychosocialSupportPlan: z.string().optional(), physiotherapyRequired: z.boolean() }) })` |
| updateAdmissionSchema | `z.object({ body: z.object({ dischargeDate: z.string().date().optional(), dischargeReason: z.enum(['Improved', 'Deceased']).optional(), status: z.enum(['Active', 'Discharged']) }) })` |
| updateAdminAdmissionSchema | `z.object({ body: z.object({ admissionDate: z.string().date().optional(), bedNumber: z.string().optional(), ward: z.string().optional(), admittingPhysician: z.string().optional(), careTeam: z.string().optional(), primaryDiagnosis: z.string().optional(), secondaryDiagnoses: z.array(z.string()).optional(), diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']).optional(), comorbidities: z.array(z.string()).optional(), estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']).optional(), ppsScore: z.number().min(0).max(100).optional(), functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']).optional(), painScore: z.number().min(0).max(10).optional(), painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']).optional(), symptomsPresent: z.array(z.string()).optional(), emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']).optional(), familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']).optional(), socialChallenges: z.string().optional(), spiritualConcerns: z.boolean().optional(), spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(), painManagementPlan: z.string().optional(), medicationPlan: z.string().optional(), nursingCarePlan: z.string().optional(), homeBasedCareRequired: z.boolean().optional(), psychosocialSupportPlan: z.string().optional(), physiotherapyRequired: z.boolean().optional(), status: z.enum(['Active', 'Discharged']).optional(), dischargeDate: z.string().date().optional(), dischargeReason: z.enum(['Improved', 'Deceased']).optional() }) })` |
| getAdmissionsQuerySchema | `z.object({ query: z.object({ status: z.enum(['Active', 'Discharged']).optional(), page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getAdmissionParamsSchema | `z.object({ params: z.object({ admissionId: z.string() }) })` |
| getAdminAdmissionParamsSchema | `z.object({ params: z.object({ admissionId: z.string().min(1, 'Admission ID is required') }) })` |

---

## 3. Service Functions

### src/services/admission.service.ts

#### recordAdmission

| Field | Detail |
|---|---|
| Signature | `recordAdmission(patientId: string, data: CreateAdmissionInput, staffId: string): Promise<AdmissionDTO>` |
| Purpose | Record a hospital admission for a patient |
| Inputs | patientId, admission data (including optional hospitalPatientId), staffId |
| Output | Created admission object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Referral not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Referral must be accepted before admission")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates hospital admission record in database, stores hospitalPatientId on patient record if provided |

**Implementation Details:**

1. Validate patient exists
2. Validate referral exists and is `"Accepted"`
3. Validate staff exists
4. Create admission with status `"Active"`
5. Update referral status to `"Admitted"`
6. If `hospitalPatientId` provided, store on patient record
7. Return admission object

---

#### getAdmissions

| Field | Detail |
|---|---|
| Signature | `getAdmissions(patientId: string, status?: string, page?: number, limit?: number): Promise<{ items: AdmissionDTO[]; total: number }>` |
| Purpose | Get all admissions for a patient with pagination and status filter |
| Inputs | patientId, status, page, limit |
| Output | Paginated admission list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

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

---

#### updateAdmission (UPDATED - Admin Only)

| Field | Detail |
|---|---|
| Signature | `updateAdmission(patientId: string, admissionId: string, data: UpdateAdmissionInput, adminId: string): Promise<AdmissionDTO>` |
| Purpose | Update admission status (discharge patient) - ADMIN ONLY |
| Inputs | patientId, admissionId, data (dischargeDate, dischargeReason, status), adminId |
| Output | Updated admission object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Admission not found")` |
| Throws | `ApiError(403, "Only admin can update admissions")` |
| Throws | `ApiError(400, "Discharge date and reason required for discharge")` |
| Throws | `ApiError(400, "Invalid status value")` |
| Side Effects | Updates admission status, sets dischargeDate and dischargeReason if discharging |

---

### src/services/admin.service.ts (ADMIN ADMISSION FUNCTIONS)

#### getAdminAdmissionById

| Field | Detail |
|---|---|
| Signature | `getAdminAdmissionById(admissionId: string): Promise<AdminAdmissionDetailDTO>` |
| Purpose | Get admission details with edit history (admin only) |
| Inputs | admissionId |
| Output | Full admission detail with edit history |
| Throws | `ApiError(404, "Admission not found")` |
| Side Effects | Read-only |

---

#### updateAdminAdmission

| Field | Detail |
|---|---|
| Signature | `updateAdminAdmission(admissionId: string, data: UpdateAdminAdmissionInput, adminId: string): Promise<UpdateAdminAdmissionResponseDTO>` |
| Purpose | Update admission record (admin only) with audit trail |
| Inputs | admissionId, data, adminId |
| Output | Updated admission response with audit trail |
| Throws | `ApiError(404, "Admission not found")` |
| Throws | `ApiError(403, "Only admin can edit admissions")` |
| Throws | `ApiError(400, "Validation error")` |
| Throws | `ApiError(400, "Discharge date and reason required for discharge")` |
| Side Effects | Updates admission record, logs changes in edit history |

**Implementation Details:**

1. Find admission by ID
2. Verify admin role
3. Track changes by comparing each field
4. If discharging (status = "Discharged"), validate dischargeDate and dischargeReason
5. Record changes with before/after values
6. Update admission with new data
7. Append edit history entry with admin ID, timestamp, and changes
8. Return updated admission with audit trail

---

#### getAdminAdmissionEditHistory

| Field | Detail |
|---|---|
| Signature | `getAdminAdmissionEditHistory(admissionId: string): Promise<AdmissionEditHistoryEntry[]>` |
| Purpose | Get admission edit history (admin only) |
| Inputs | admissionId |
| Output | Array of edit history entries |
| Throws | `ApiError(404, "Admission not found")` |
| Side Effects | Read-only |

---

## 4. Controller Functions

### src/controllers/admission.controller.ts

| Handler | Calls | Response |
|---|---|---|
| recordAdmission | `admissionService.recordAdmission(req.params.patientId, req.body, req.user.id)` | 201, `SuccessResponse(201, "Admission recorded successfully", result)` |
| getAdmissions | `admissionService.getAdmissions(req.params.patientId, req.query.status, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getAdmissionById | `admissionService.getAdmissionById(req.params.patientId, req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateAdmission | `admissionService.updateAdmission(req.params.patientId, req.params.admissionId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Admission updated successfully", result)` |

### src/controllers/admin.controller.ts (ADMIN ADMISSION CONTROLLERS)

| Handler | Calls | Response |
|---|---|---|
| getAdminAdmissionById | `adminService.getAdminAdmissionById(req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateAdminAdmission | `adminService.updateAdminAdmission(req.params.admissionId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Admission updated successfully", result)` |
| getAdminAdmissionEditHistory | `adminService.getAdminAdmissionEditHistory(req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 5. Route Definitions

### src/routes/admission.routes.ts (UPDATED - Admin Only for PUT)

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createAdmissionSchema)` | recordAdmission |
| GET | / | `authMiddleware, validate(getAdmissionsQuerySchema)` | getAdmissions |
| GET | /:admissionId | `authMiddleware` | getAdmissionById |
| **PUT** | **/:admissionId** | **`authMiddleware, roleMiddleware(['admin']), validate(updateAdmissionSchema)`** | **updateAdmission** |

Mounted at: `/api/v1/patients/:patientId/admissions`

### src/routes/admin.routes.ts (ADMIN ADMISSION ROUTES)

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /admissions/:admissionId | `authMiddleware, roleMiddleware(['admin'])` | getAdminAdmissionById |
| PUT | /admissions/:admissionId | `authMiddleware, roleMiddleware(['admin']), validate(updateAdminAdmissionSchema)` | updateAdminAdmission |
| GET | /admissions/:admissionId/history | `authMiddleware, roleMiddleware(['admin'])` | getAdminAdmissionEditHistory |

Mounted at: `/api/v1/admin`

---

## 6. Implementation Notes

### DTO Types

```typescript
// src/types/admission.types.ts

export interface CreateAdmissionInput {
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

export interface UpdateAdmissionInput {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

export interface AdmissionDTO {
  id: string;
  admissionDate: Date;
  dischargeDate?: Date;
  hospitalPatientId?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  status: 'Active' | 'Discharged';
  createdBy: {
    id: string;
    name: string;
    role?: string;
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

// ============================================
// ADMIN ADMISSION DTO TYPES
// ============================================

export interface AdminAdmissionDetailDTO {
  id: string;
  patientId: string;
  patientName: string;
  patientDisplayId: string;
  hospitalPatientId?: string;
  referralId: string;
  admissionDate: Date;
  dischargeDate?: Date;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: string;
  comorbidities: string[];
  estimatedPrognosis: string;
  ppsScore: number;
  functionalStatus: string;
  painScore: number;
  painType: string;
  symptomsPresent: string[];
  emotionalStatus: string;
  familySupport: string;
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: string;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: string;
  status: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
  canEdit: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: Date;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
}

export interface UpdateAdminAdmissionInput {
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

export interface UpdateAdminAdmissionResponseDTO {
  id: string;
  updatedAt: Date;
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
    admissionDate: Date;
    bedNumber: string;
    painScore: number;
    status: string;
  };
}

export interface AdmissionEditHistoryEntry {
  editedBy: { id: string; name: string };
  editedAt: Date;
  changes: Array<{ field: string; from: any; to: any }>;
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

### Audit Trail for Admin Admission Edits

```typescript
// src/services/admin.service.ts (internal function)

const trackAdmissionChanges = (original: any, updated: any): Array<{ field: string; from: any; to: any }> => {
  const changes: Array<{ field: string; from: any; to: any }> = [];
  const fieldsToTrack = [
    'admissionDate', 'bedNumber', 'ward', 'admittingPhysician', 'careTeam',
    'primaryDiagnosis', 'diseaseStage', 'estimatedPrognosis', 'ppsScore',
    'functionalStatus', 'painScore', 'painType', 'emotionalStatus',
    'familySupport', 'spiritualConcerns', 'painManagementPlan',
    'medicationPlan', 'nursingCarePlan', 'homeBasedCareRequired',
    'physiotherapyRequired', 'status', 'dischargeDate', 'dischargeReason'
  ];

  for (const field of fieldsToTrack) {
    if (updated[field] !== undefined && original[field] !== updated[field]) {
      changes.push({
        field,
        from: original[field],
        to: updated[field]
      });
    }
  }

  // Handle arrays
  if (updated.secondaryDiagnoses && original.secondaryDiagnoses) {
    if (JSON.stringify(updated.secondaryDiagnoses) !== JSON.stringify(original.secondaryDiagnoses)) {
      changes.push({
        field: 'secondaryDiagnoses',
        from: original.secondaryDiagnoses,
        to: updated.secondaryDiagnoses
      });
    }
  }

  if (updated.comorbidities && original.comorbidities) {
    if (JSON.stringify(updated.comorbidities) !== JSON.stringify(original.comorbidities)) {
      changes.push({
        field: 'comorbidities',
        from: original.comorbidities,
        to: updated.comorbidities
      });
    }
  }

  if (updated.symptomsPresent && original.symptomsPresent) {
    if (JSON.stringify(updated.symptomsPresent) !== JSON.stringify(original.symptomsPresent)) {
      changes.push({
        field: 'symptomsPresent',
        from: original.symptomsPresent,
        to: updated.symptomsPresent
      });
    }
  }

  return changes;
};

const addAdmissionEditHistoryEntry = async (admissionId: string, adminId: string, changes: any[]) => {
  await HospitalAdmission.findByIdAndUpdate(admissionId, {
    $push: {
      editHistory: {
        editedBy: adminId,
        editedAt: new Date(),
        changes
      }
    }
  });
};
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/admission.schema.ts` | `tests/schemas/admission.schema.test.ts` | Unit |
| `src/services/admission.service.ts` | `tests/services/admission.service.test.ts` | Unit |
| `src/services/admin.service.ts` | `tests/services/admin.service.test.ts` | Unit |
| `src/controllers/admission.controller.ts` | `tests/controllers/admission.controller.test.ts` | Unit |
| `src/controllers/admin.controller.ts` | `tests/controllers/admin.controller.test.ts` | Unit |
| `src/routes/admission.routes.ts` | `tests/routes/admission.routes.test.ts` | Integration |
| `src/routes/admin.routes.ts` | `tests/routes/admin.routes.test.ts` | Integration |

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
| updateAdminAdmissionSchema accepts valid data | parse `{ body: { bedNumber: "B-12", painScore: 4 } }` | Passes |
| updateAdminAdmissionSchema rejects invalid painScore | parse `{ body: { painScore: 15 } }` | Validation fails |

### admission.service.test.ts

#### recordAdmission

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists, referral accepted | Mock patient found, referral found with status Accepted, staff found | call `recordAdmission(patientId, data, staffId)` | Resolves with admission object, status Active |
| Patient not found | Mock patient not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Referral not found | Mock patient found, referral not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Referral not found") |
| Referral not accepted | Mock patient found, referral found with status Pending | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(400, "Referral must be accepted before admission") |
| Staff not found | Mock patient found, referral found, staff not found | call `recordAdmission(patientId, data, staffId)` | Throws ApiError(404, "Staff member not found") |
| With hospital MRN | Mock patient found, referral accepted, staff found | call `recordAdmission(patientId, data with hospitalPatientId, staffId)` | Resolves with admission, patient.hospitalPatientId set |

#### getAdmissions

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with admissions | Mock patient found, admissions exist | call `getAdmissions(patientId)` | Resolves with paginated admission list |
| Patient not found | Mock patient not found | call `getAdmissions(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no admissions | Mock patient found, no admissions | call `getAdmissions(patientId)` | Resolves with empty items list |
| Filter by Active status | Mock patient found, admissions exist | call `getAdmissions(patientId, "Active")` | Resolves with only Active admissions |

#### updateAdmission (Admin Only)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Discharge patient (admin) | Mock patient found, admission found with status Active, admin authenticated | call `updateAdmission(patientId, admissionId, { dischargeDate: "2026-09-05", dischargeReason: "Improved", status: "Discharged" }, adminId)` | Resolves with admission, status Discharged |
| Patient not found | Mock patient not found | call `updateAdmission(patientId, admissionId, data, adminId)` | Throws ApiError(404, "Patient not found") |
| Admission not found | Mock patient found, admission not found | call `updateAdmission(patientId, admissionId, data, adminId)` | Throws ApiError(404, "Admission not found") |
| Staff attempts discharge | Mock patient found, admission found, staff authenticated | call `updateAdmission(patientId, admissionId, data, staffId)` | Throws ApiError(403, "Only admin can update admissions") |
| Discharge missing reason | Mock patient found, admission found, admin authenticated | call `updateAdmission(patientId, admissionId, { status: "Discharged" }, adminId)` | Throws ApiError(400, "Discharge date and reason required for discharge") |

#### updateAdminAdmission

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid update | Mock admission found, admin authenticated | call `updateAdminAdmission(admissionId, data, adminId)` | Resolves with updated admission, audit trail created |
| Admission not found | Mock admission not found | call `updateAdminAdmission(admissionId, data, adminId)` | Throws ApiError(404, "Admission not found") |
| Non-admin user | Mock admission found, staff authenticated | call `updateAdminAdmission(admissionId, data, staffId)` | Throws ApiError(403, "Only admin can edit admissions") |
| No changes | Mock admission found, admin authenticated | call `updateAdminAdmission(admissionId, {}, adminId)` | Resolves with no changes, no audit entry |
| Discharge without required fields | Mock admission found, admin authenticated | call `updateAdminAdmission(admissionId, { status: "Discharged" }, adminId)` | Throws ApiError(400, "Discharge date and reason required for discharge") |

---

## 9. Flow Diagram (UPDATED)

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
|  |         -> Store hospital MRN (if provided)         | |
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
|  |                    DISCHARGE FLOW (ADMIN ONLY)       | |
|  |                                                     | |
|  |  PUT /patients/:patientId/admissions/:admissionId   | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> validate(updateAdmissionSchema)          | |
|  |         -> admissionController.updateAdmission      | |
|  |         -> admissionService.updateAdmission         | |
|  |         -> Check patient exists                     | |
|  |         -> Check admission exists                   | |
|  |         -> Verify admin role                        | |
|  |         -> Validate discharge fields                | |
|  |         -> Update status to Discharged              | |
|  |         -> Set dischargeDate and dischargeReason    | |
|  |         -> Return updated admission                 | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    ADMIN EDIT FLOW                   | |
|  |                                                     | |
|  |  GET /admin/admissions/:admissionId                 | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getAdminAdmissionById    | |
|  |         -> adminService.getAdminAdmissionById       | |
|  |         -> Return admission with edit history        | |
|  |                                                     | |
|  |  PUT /admin/admissions/:admissionId                 | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> validate(updateAdminAdmissionSchema)     | |
|  |         -> adminController.updateAdminAdmission     | |
|  |         -> adminService.updateAdminAdmission        | |
|  |         -> Check admission exists                   | |
|  |         -> Verify admin role                        | |
|  |         -> Track changes (before/after)             | |
|  |         -> Update admission fields                  | |
|  |         -> Append edit history entry                | |
|  |         -> Return updated admission with audit trail| |
|  |                                                     | |
|  |  GET /admin/admissions/:admissionId/history         | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getAdminAdmissionEditHistory| |
|  |         -> adminService.getAdminAdmissionEditHistory| |
|  |         -> Return edit history entries              | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```

