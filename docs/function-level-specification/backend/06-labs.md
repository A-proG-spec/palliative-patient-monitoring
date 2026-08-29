# function-level-specification/backend/06-labs.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: LABORATORY TESTS

## 1. Overview

This document defines the function-level specification for laboratory test management features including ordering lab tests, viewing lab results, and updating test results.

**Files Covered:**
- `src/schemas/lab.schema.ts`
- `src/services/lab.service.ts`
- `src/controllers/lab.controller.ts`
- `src/routes/lab.routes.ts`

---

## 2. Schema Definitions

### src/schemas/lab.schema.ts

| Schema | Shape |
|---|---|
| createLabSchema | `z.object({ body: z.object({ testName: z.string().min(1), dateOrdered: z.string().date(), location: z.enum(['Home', 'Hospital']) }) })` |
| updateLabResultSchema | `z.object({ body: z.object({ datePerformed: z.string().date(), result: z.string().min(1) }) })` |
| getLabsQuerySchema | `z.object({ query: z.object({ status: z.enum(['Ordered', 'Completed']).optional(), page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getLabParamsSchema | `z.object({ params: z.object({ labId: z.string() }) })` |

---

## 3. Service Functions

### src/services/lab.service.ts

#### orderLabTest

| Field | Detail |
|---|---|
| Signature | `orderLabTest(patientId: string, data: CreateLabInput, staffId: string): Promise<LabTestDTO>` |
| Purpose | Order a laboratory test for a patient |
| Inputs | patientId, lab test data, staffId |
| Output | Created lab test object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates lab test record in database |

#### getLabTests

| Field | Detail |
|---|---|
| Signature | `getLabTests(patientId: string, status?: string, page?: number, limit?: number): Promise<{ items: LabTestDTO[]; total: number }>` |
| Purpose | Get all lab tests for a patient with pagination and status filter |
| Inputs | patientId, status, page, limit |
| Output | Paginated lab test list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getLabTestById

| Field | Detail |
|---|---|
| Signature | `getLabTestById(patientId: string, labId: string): Promise<LabTestDetailDTO>` |
| Purpose | Get lab test details by ID |
| Inputs | patientId, labId |
| Output | Full lab test detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Lab test not found")` |
| Side Effects | Read-only |

#### updateLabResult

| Field | Detail |
|---|---|
| Signature | `updateLabResult(patientId: string, labId: string, data: UpdateLabInput, staffId: string): Promise<LabTestDTO>` |
| Purpose | Update lab test result (mark as Completed) |
| Inputs | patientId, labId, datePerformed, result, staffId |
| Output | Updated lab test object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Lab test not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Lab test is already completed")` |
| Side Effects | Updates lab test status to Completed, sets result and datePerformed |

---

## 4. Controller Functions

### src/controllers/lab.controller.ts

| Handler | Calls | Response |
|---|---|---|
| orderLabTest | `labService.orderLabTest(req.params.patientId, req.body, req.user.id)` | 201, `SuccessResponse(201, "Lab test ordered successfully", result)` |
| getLabTests | `labService.getLabTests(req.params.patientId, req.query.status, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getLabTestById | `labService.getLabTestById(req.params.patientId, req.params.labId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateLabResult | `labService.updateLabResult(req.params.patientId, req.params.labId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Lab test result updated", result)` |

---

## 5. Route Definitions

### src/routes/lab.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createLabSchema)` | orderLabTest |
| GET | / | `authMiddleware, validate(getLabsQuerySchema)` | getLabTests |
| GET | /:labId | `authMiddleware` | getLabTestById |
| PUT | /:labId | `authMiddleware, validate(updateLabResultSchema)` | updateLabResult |

Mounted at: `/api/v1/patients/:patientId/labs`

---

## 6. Implementation Notes

### DTO Types

```typescript
// src/types/lab.types.ts

export interface CreateLabInput {
  testName: string;
  dateOrdered: string;
  location: 'Home' | 'Hospital';
}

export interface UpdateLabInput {
  datePerformed: string;
  result: string;
}

export interface LabTestDTO {
  id: string;
  testName: string;
  dateOrdered: Date;
  datePerformed?: Date;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface LabTestDetailDTO extends LabTestDTO {
  patientId: string;
  visitId?: string;
  admissionId?: string;
  updatedAt?: Date;
}
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/lab.schema.ts` | `tests/schemas/lab.schema.test.ts` | Unit |
| `src/services/lab.service.ts` | `tests/services/lab.service.test.ts` | Unit |
| `src/controllers/lab.controller.ts` | `tests/controllers/lab.controller.test.ts` | Unit |
| `src/routes/lab.routes.ts` | `tests/routes/lab.routes.test.ts` | Integration |

---

## 8. Test Cases

### lab.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createLabSchema accepts valid data | parse valid request body | Passes |
| createLabSchema rejects empty testName | parse with testName empty | Validation fails |
| createLabSchema rejects invalid dateOrdered | parse with invalid date | Validation fails |
| createLabSchema rejects invalid location | parse with location "Invalid" | Validation fails |
| updateLabResultSchema accepts valid data | parse `{ body: { datePerformed: "2026-08-30", result: "Normal" } }` | Passes |
| updateLabResultSchema rejects empty result | parse with result empty | Validation fails |
| getLabsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getLabsQuerySchema accepts valid status | parse `{ query: { status: "Completed" } }` | Passes |

### lab.service.test.ts

#### orderLabTest

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found, staff found | call `orderLabTest(patientId, data, staffId)` | Resolves with lab test object, status Ordered |
| Patient not found | Mock patient not found | call `orderLabTest(patientId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Staff not found | Mock patient found, staff not found | call `orderLabTest(patientId, data, staffId)` | Throws ApiError(404, "Staff member not found") |

#### getLabTests

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with lab tests | Mock patient found, lab tests exist | call `getLabTests(patientId)` | Resolves with paginated lab test list |
| Patient not found | Mock patient not found | call `getLabTests(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no lab tests | Mock patient found, no lab tests | call `getLabTests(patientId)` | Resolves with empty items list |
| Filter by Completed status | Mock patient found, lab tests exist | call `getLabTests(patientId, "Completed")` | Resolves with only Completed lab tests |

#### updateLabResult

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Lab test exists and Ordered | Mock patient found, lab test found with status Ordered | call `updateLabResult(patientId, labId, data, staffId)` | Resolves with lab test, status Completed |
| Patient not found | Mock patient not found | call `updateLabResult(patientId, labId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Lab test not found | Mock patient found, lab test not found | call `updateLabResult(patientId, labId, data, staffId)` | Throws ApiError(404, "Lab test not found") |
| Lab test already completed | Mock patient found, lab test found with status Completed | call `updateLabResult(patientId, labId, data, staffId)` | Throws ApiError(400, "Lab test is already completed") |
| Staff not found | Mock patient found, lab test found, staff not found | call `updateLabResult(patientId, labId, data, staffId)` | Throws ApiError(404, "Staff member not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                   LABS FLOW (BACKEND)                      |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER LAB FLOW                    | |
|  |                                                     | |
|  |  POST /patients/:patientId/labs                     | |
|  |         -> validate(createLabSchema)                | |
|  |         -> labController.orderLabTest               | |
|  |         -> labService.orderLabTest                  | |
|  |         -> Check patient exists                     | |
|  |         -> Check staff exists                       | |
|  |         -> Create lab test with status Ordered      | |
|  |         -> Return lab test object                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST LABS FLOW                    | |
|  |                                                     | |
|  |  GET /patients/:patientId/labs                      | |
|  |         -> validate(getLabsQuerySchema)             | |
|  |         -> labController.getLabTests                | |
|  |         -> labService.getLabTests                   | |
|  |         -> Check patient exists                     | |
|  |         -> Apply status filter and pagination       | |
|  |         -> Return lab test list                     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW LAB FLOW                     | |
|  |                                                     | |
|  |  GET /patients/:patientId/labs/:labId               | |
|  |         -> labController.getLabTestById             | |
|  |         -> labService.getLabTestById                | |
|  |         -> Check patient exists                     | |
|  |         -> Find lab test by ID                      | |
|  |         -> Return lab test detail                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE RESULT FLOW                | |
|  |                                                     | |
|  |  PUT /patients/:patientId/labs/:labId               | |
|  |         -> validate(updateLabResultSchema)          | |
|  |         -> labController.updateLabResult            | |
|  |         -> labService.updateLabResult               | |
|  |         -> Check patient exists                     | |
|  |         -> Check lab test exists                    | |
|  |         -> Check lab test is Ordered                | |
|  |         -> Check staff exists                       | |
|  |         -> Update result and status to Completed    | |
|  |         -> Return updated lab test                  | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
