# function-level-specification/backend/07-referrals.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: REFERRALS

## 1. Overview

This document defines the function-level specification for backend referral management features including requesting referrals, viewing referral history, and tracking referral status.

**Files Covered:**
- `src/schemas/referral.schema.ts`
- `src/services/referral.service.ts`
- `src/controllers/referral.controller.ts`
- `src/routes/referral.routes.ts`

---

## 2. Schema Definitions

### src/schemas/referral.schema.ts

| Schema | Shape |
|---|---|
| createReferralSchema | `z.object({ body: z.object({ referralType: z.enum(['Incoming', 'Outgoing']), referralDate: z.string().date(), primaryDiagnosis: z.string().min(1), diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']), ppsScore: z.number().min(0).max(100), kpsScore: z.number().min(0).max(100), currentSymptoms: z.object({ pain: z.number().min(0).max(10), dyspnea: z.number().min(0).max(10), fatigue: z.number().min(0).max(10), anxiety: z.number().min(0).max(10), depression: z.number().min(0).max(10) }), reasons: z.array(z.enum(['PainManagement', 'SymptomControl', 'EndOfLifeCare', 'HomeHospiceCare', 'InpatientAdmission', 'PsychologicalSupport', 'SpiritualCare', 'CaregiverSupport', 'BereavementServices', 'EmergencyCare', 'DiagnosticEvaluation', 'Other'])).min(1), otherReason: z.string().optional(), referringFacility: z.string().min(1), receivingFacility: z.string().min(1), contactPerson: z.string().min(1), contactNumber: z.string().min(1), preparedBy: z.string().min(1), preparedByDesignation: z.string().min(1), signature: z.string().min(1) }) })` |
| getReferralsQuerySchema | `z.object({ query: z.object({ status: z.enum(['Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested']).optional(), page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getReferralParamsSchema | `z.object({ params: z.object({ referralId: z.string() }) })` |

---

## 3. Service Functions

### src/services/referral.service.ts

#### requestReferral

| Field | Detail |
|---|---|
| Signature | `requestReferral(patientId: string, data: CreateReferralInput, staffId: string): Promise<ReferralDTO>` |
| Purpose | Request a referral for a patient |
| Inputs | patientId, referral data (including preparedBy, preparedByDesignation, signature), staffId |
| Output | Created referral object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates referral record in database, creates admin notification |

---

#### getReferrals

| Field | Detail |
|---|---|
| Signature | `getReferrals(patientId: string, status?: string, page?: number, limit?: number): Promise<{ items: ReferralDTO[]; total: number }>` |
| Purpose | Get all referrals for a patient with pagination and status filter |
| Inputs | patientId, status, page, limit |
| Output | Paginated referral list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

#### getReferralById

| Field | Detail |
|---|---|
| Signature | `getReferralById(patientId: string, referralId: string): Promise<ReferralDetailDTO>` |
| Purpose | Get referral details by ID |
| Inputs | patientId, referralId |
| Output | Full referral detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Referral not found")` |
| Side Effects | Read-only |

---

## 4. Controller Functions

### src/controllers/referral.controller.ts

| Handler | Calls | Response |
|---|---|---|
| requestReferral | `referralService.requestReferral(req.params.patientId, req.body, req.user.id)` | 201, `SuccessResponse(201, "Referral requested successfully", result)` |
| getReferrals | `referralService.getReferrals(req.params.patientId, req.query.status, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getReferralById | `referralService.getReferralById(req.params.patientId, req.params.referralId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 5. Route Definitions

### src/routes/referral.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createReferralSchema)` | requestReferral |
| GET | / | `authMiddleware, validate(getReferralsQuerySchema)` | getReferrals |
| GET | /:referralId | `authMiddleware` | getReferralById |

Mounted at: `/api/v1/patients/:patientId/referrals`

---

## 6. DTO Types

```typescript
// src/types/referral.types.ts

export interface CreateReferralInput {
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
}

export interface ReferralDTO {
  id: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: Date;
  primaryDiagnosis: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  reasons: string[];
  receivingFacility: string;
  requestedBy: {
    id: string;
    name: string;
  };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  actionTaken?: string | null;
  outcome?: string | null;
  followUpDate?: Date | null;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact' | null;
  createdAt: Date;
}

export interface ReferralDetailDTO extends ReferralDTO {
  patientId: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  otherReason?: string;
  referringFacility: string;
  contactPerson: string;
  contactNumber: string;
  actionTaken?: string | null;
  outcome?: string | null;
  followUpDate?: Date | null;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact' | null;
  approvedBy?: {
    id: string;
    name: string;
  };
  updatedAt: Date;
}
```

---

## 7. Implementation Notes

### Notification Creation

```typescript
// src/services/referral.service.ts (internal function)

const createReferralNotification = async (patientId: string, patientName: string, referralId: string) => {
  await Notification.create({
    type: 'ReferralApproval',
    message: `New referral request: ${patientName}`,
    data: {
      referralId,
      patientId,
      patientName,
    },
    read: false,
  });
};
```

### Prepared By Fields Validation

```typescript
// src/services/referral.service.ts (internal validation)

const validatePreparedByFields = (data: CreateReferralInput) => {
  if (!data.preparedBy || data.preparedBy.trim().length === 0) {
    throw new ApiError(400, 'preparedBy is required');
  }
  if (!data.preparedByDesignation || data.preparedByDesignation.trim().length === 0) {
    throw new ApiError(400, 'preparedByDesignation is required');
  }
  if (!data.signature || data.signature.trim().length === 0) {
    throw new ApiError(400, 'signature is required');
  }
};
```

---

## 8. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/referral.schema.ts` | `tests/schemas/referral.schema.test.ts` | Unit |
| `src/services/referral.service.ts` | `tests/services/referral.service.test.ts` | Unit |
| `src/controllers/referral.controller.ts` | `tests/controllers/referral.controller.test.ts` | Unit |
| `src/routes/referral.routes.ts` | `tests/routes/referral.routes.test.ts` | Integration |

---

## 9. Test Cases

### referral.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createReferralSchema accepts valid data | parse valid request body with all fields | Passes |
| createReferralSchema rejects invalid referralType | parse with referralType "Invalid" | Validation fails |
| createReferralSchema rejects invalid diseaseStage | parse with diseaseStage "Invalid" | Validation fails |
| createReferralSchema rejects invalid ppsScore | parse with ppsScore 150 | Validation fails |
| createReferralSchema rejects empty reasons | parse with reasons [] | Validation fails |
| createReferralSchema rejects invalid currentSymptoms | parse with pain 15 | Validation fails |
| createReferralSchema rejects empty preparedBy | parse with preparedBy "" | Validation fails |
| createReferralSchema rejects empty preparedByDesignation | parse with preparedByDesignation "" | Validation fails |
| createReferralSchema rejects empty signature | parse with signature "" | Validation fails |
| getReferralsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getReferralsQuerySchema accepts valid status | parse `{ query: { status: "Pending" } }` | Passes |

### referral.service.test.ts

#### requestReferral

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with all fields | Mock patient found, staff found, all fields provided | call `requestReferral(patientId, data, staffId)` | Resolves with referral object, status Pending, notification created |
| Patient not found | Mock patient not found | call `requestReferral(patientId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Staff not found | Mock patient found, staff not found | call `requestReferral(patientId, data, staffId)` | Throws ApiError(404, "Staff member not found") |
| Missing preparedBy | Mock patient found, preparedBy empty | call `requestReferral(patientId, data, staffId)` | Throws ApiError(400, "preparedBy is required") |
| Missing preparedByDesignation | Mock patient found, preparedByDesignation empty | call `requestReferral(patientId, data, staffId)` | Throws ApiError(400, "preparedByDesignation is required") |
| Missing signature | Mock patient found, signature empty | call `requestReferral(patientId, data, staffId)` | Throws ApiError(400, "signature is required") |

#### getReferrals

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with referrals | Mock patient found, referrals exist | call `getReferrals(patientId)` | Resolves with paginated referral list including preparedBy fields |
| Patient not found | Mock patient not found | call `getReferrals(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no referrals | Mock patient found, no referrals | call `getReferrals(patientId)` | Resolves with empty items list |
| Filter by Pending status | Mock patient found, referrals exist | call `getReferrals(patientId, "Pending")` | Resolves with only Pending referrals |

#### getReferralById

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Referral exists | Mock patient found, referral found | call `getReferralById(patientId, referralId)` | Resolves with referral detail including all fields |
| Patient not found | Mock patient not found | call `getReferralById(patientId, referralId)` | Throws ApiError(404, "Patient not found") |
| Referral not found | Mock patient found, referral not found | call `getReferralById(patientId, referralId)` | Throws ApiError(404, "Referral not found") |

---

## 10. Flow Diagram

```
+-----------------------------------------------------------+
|                  REFERRALS FLOW (BACKEND)                  |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REQUEST REFERRAL FLOW             | |
|  |                                                     | |
|  |  POST /patients/:patientId/referrals                | |
|  |         -> validate(createReferralSchema)           | |
|  |         -> referralController.requestReferral       | |
|  |         -> referralService.requestReferral          | |
|  |         -> Check patient exists                     | |
|  |         -> Check staff exists                       | |
|  |         -> Validate preparedBy fields               | |
|  |         -> Create referral with status Pending      | |
|  |         -> Create admin notification                | |
|  |         -> Return referral object                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST REFERRALS FLOW               | |
|  |                                                     | |
|  |  GET /patients/:patientId/referrals                 | |
|  |         -> validate(getReferralsQuerySchema)        | |
|  |         -> referralController.getReferrals          | |
|  |         -> referralService.getReferrals             | |
|  |         -> Check patient exists                     | |
|  |         -> Apply status filter and pagination       | |
|  |         -> Return referral list with preparedBy     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW REFERRAL FLOW                | |
|  |                                                     | |
|  |  GET /patients/:patientId/referrals/:referralId     | |
|  |         -> referralController.getReferralById       | |
|  |         -> referralService.getReferralById          | |
|  |         -> Check patient exists                     | |
|  |         -> Find referral by ID                      | |
|  |         -> Return referral detail with all fields   | |
|  |            including actionTaken, outcome,          | |
|  |            followUpDate, followUpStatus,            | |
|  |            preparedBy, signature                    | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```

---

## 11. Field Reference Table

| Field | Type | Required | Source | Description |
|---|---|---|---|---|
| referralType | Enum | Yes | Request Body | Incoming or Outgoing |
| referralDate | Date | Yes | Request Body | Date of referral |
| primaryDiagnosis | String | Yes | Request Body | Primary diagnosis |
| diseaseStage | Enum | Yes | Request Body | Early, Advanced, EndStage |
| ppsScore | Number | Yes | Request Body | 0-100 |
| kpsScore | Number | Yes | Request Body | 0-100 |
| currentSymptoms | Object | Yes | Request Body | Pain, Dyspnea, Fatigue, Anxiety, Depression (0-10) |
| reasons | Array | Yes | Request Body | At least one reason |
| otherReason | String | No | Request Body | Custom reason |
| referringFacility | String | Yes | Request Body | Referring facility |
| receivingFacility | String | Yes | Request Body | Receiving facility |
| contactPerson | String | Yes | Request Body | Contact person |
| contactNumber | String | Yes | Request Body | Contact number |
| preparedBy | String | Yes | Request Body | Name of staff preparing referral |
| preparedByDesignation | String | Yes | Request Body | Designation of staff |
| signature | String | Yes | Request Body | Signature of staff |
| status | Enum | System | Auto | Pending, Accepted, Declined, Admitted, InfoRequested |
| actionTaken | Enum | No | System/Admin | ReferralAccepted, AppointmentScheduled, etc. |
| outcome | String | No | System/Admin | Outcome description |
| followUpDate | Date | No | System/Admin | Follow-up date |
| followUpStatus | Enum | No | System/Admin | Completed, Pending, UnableToContact |

---

## 12. Summary of Changes

| Change | Before | After |
|---|---|---|
| preparedBy field | Not in service | Added to request validation, DTO, and response |
| preparedByDesignation field | Not in service | Added to request validation, DTO, and response |
| signature field | Not in service | Added to request validation, DTO, and response |
| Validation logic | Missing preparedBy validation | Added validatePreparedByFields function |
| DTO types | Missing fields | Added preparedBy, preparedByDesignation, signature, actionTaken, outcome, followUpDate, followUpStatus |
| Service function inputs | Missing preparedBy fields | Added preparedBy, preparedByDesignation, signature to CreateReferralInput |
| Test cases | Missing preparedBy tests | Added test cases for preparedBy, preparedByDesignation, signature validation |
