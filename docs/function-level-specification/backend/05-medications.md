# function-level-specification/backend/05-medications.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: MEDICATIONS

## 1. Overview

This document defines the function-level specification for medication management features including ordering medications, viewing medication history, and updating medication status.

**Files Covered:**
- `src/schemas/medication.schema.ts`
- `src/services/medication.service.ts`
- `src/controllers/medication.controller.ts`
- `src/routes/medication.routes.ts`

---

## 2. Schema Definitions

### src/schemas/medication.schema.ts

| Schema | Shape |
|---|---|
| createMedicationSchema | `z.object({ body: z.object({ name: z.string().min(1), dosage: z.string().min(1), frequency: z.string().min(1), route: z.string().min(1), administeredAt: z.enum(['Home', 'Hospital']) }) })` |
| updateMedicationStatusSchema | `z.object({ body: z.object({ status: z.enum(['Ordered', 'Given']) }) })` |
| getMedicationsQuerySchema | `z.object({ query: z.object({ status: z.enum(['Ordered', 'Given']).optional(), page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getMedicationParamsSchema | `z.object({ params: z.object({ medicationId: z.string() }) })` |

---

## 3. Service Functions

### src/services/medication.service.ts

#### orderMedication

| Field | Detail |
|---|---|
| Signature | `orderMedication(patientId: string, data: CreateMedicationInput, staffId: string): Promise<MedicationDTO>` |
| Purpose | Order a medication for a patient |
| Inputs | patientId, medication data, staffId |
| Output | Created medication object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates medication record in database |

#### getMedications

| Field | Detail |
|---|---|
| Signature | `getMedications(patientId: string, status?: string, page?: number, limit?: number): Promise<{ items: MedicationDTO[]; total: number }>` |
| Purpose | Get all medications for a patient with pagination and status filter |
| Inputs | patientId, status, page, limit |
| Output | Paginated medication list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getMedicationById

| Field | Detail |
|---|---|
| Signature | `getMedicationById(patientId: string, medicationId: string): Promise<MedicationDetailDTO>` |
| Purpose | Get medication details by ID |
| Inputs | patientId, medicationId |
| Output | Full medication detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Medication not found")` |
| Side Effects | Read-only |

#### updateMedicationStatus

| Field | Detail |
|---|---|
| Signature | `updateMedicationStatus(patientId: string, medicationId: string, status: string, staffId: string): Promise<MedicationDTO>` |
| Purpose | Update medication status (mark as Given) |
| Inputs | patientId, medicationId, status, staffId |
| Output | Updated medication object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Medication not found")` |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Invalid status value")` |
| Side Effects | Updates medication status in database |

---

## 4. Controller Functions

### src/controllers/medication.controller.ts

| Handler | Calls | Response |
|---|---|---|
| orderMedication | `medicationService.orderMedication(req.params.patientId, req.body, req.user.id)` | 201, `SuccessResponse(201, "Medication ordered successfully", result)` |
| getMedications | `medicationService.getMedications(req.params.patientId, req.query.status, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getMedicationById | `medicationService.getMedicationById(req.params.patientId, req.params.medicationId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateMedicationStatus | `medicationService.updateMedicationStatus(req.params.patientId, req.params.medicationId, req.body.status, req.user.id)` | 200, `SuccessResponse(200, "Medication status updated", result)` |

---

## 5. Route Definitions

### src/routes/medication.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createMedicationSchema)` | orderMedication |
| GET | / | `authMiddleware, validate(getMedicationsQuerySchema)` | getMedications |
| GET | /:medicationId | `authMiddleware` | getMedicationById |
| PUT | /:medicationId | `authMiddleware, validate(updateMedicationStatusSchema)` | updateMedicationStatus |

Mounted at: `/api/v1/patients/:patientId/medications`

---

## 6. Implementation Notes

### DTO Types

```typescript
// src/types/medication.types.ts

export interface CreateMedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
}

export interface MedicationDTO {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  prescribedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface MedicationDetailDTO extends MedicationDTO {
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
| `src/schemas/medication.schema.ts` | `tests/schemas/medication.schema.test.ts` | Unit |
| `src/services/medication.service.ts` | `tests/services/medication.service.test.ts` | Unit |
| `src/controllers/medication.controller.ts` | `tests/controllers/medication.controller.test.ts` | Unit |
| `src/routes/medication.routes.ts` | `tests/routes/medication.routes.test.ts` | Integration |

---

## 8. Test Cases

### medication.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createMedicationSchema accepts valid data | parse valid request body | Passes |
| createMedicationSchema rejects empty name | parse with name empty | Validation fails |
| createMedicationSchema rejects empty dosage | parse with dosage empty | Validation fails |
| createMedicationSchema rejects invalid administeredAt | parse with administeredAt "Invalid" | Validation fails |
| updateMedicationStatusSchema accepts valid status | parse `{ body: { status: "Given" } }` | Passes |
| updateMedicationStatusSchema rejects invalid status | parse `{ body: { status: "Invalid" } }` | Validation fails |
| getMedicationsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getMedicationsQuerySchema accepts valid status | parse `{ query: { status: "Ordered" } }` | Passes |

### medication.service.test.ts

#### orderMedication

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found, staff found | call `orderMedication(patientId, data, staffId)` | Resolves with medication object, status Ordered |
| Patient not found | Mock patient not found | call `orderMedication(patientId, data, staffId)` | Throws ApiError(404, "Patient not found") |
| Staff not found | Mock patient found, staff not found | call `orderMedication(patientId, data, staffId)` | Throws ApiError(404, "Staff member not found") |

#### getMedications

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with medications | Mock patient found, medications exist | call `getMedications(patientId)` | Resolves with paginated medication list |
| Patient not found | Mock patient not found | call `getMedications(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no medications | Mock patient found, no medications | call `getMedications(patientId)` | Resolves with empty items list |
| Filter by Ordered status | Mock patient found, medications exist | call `getMedications(patientId, "Ordered")` | Resolves with only Ordered medications |

#### updateMedicationStatus

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Medication exists and Ordered | Mock patient found, medication found with status Ordered | call `updateMedicationStatus(patientId, medicationId, "Given", staffId)` | Resolves with medication, status Given |
| Patient not found | Mock patient not found | call `updateMedicationStatus(patientId, medicationId, "Given", staffId)` | Throws ApiError(404, "Patient not found") |
| Medication not found | Mock patient found, medication not found | call `updateMedicationStatus(patientId, medicationId, "Given", staffId)` | Throws ApiError(404, "Medication not found") |
| Staff not found | Mock patient found, medication found, staff not found | call `updateMedicationStatus(patientId, medicationId, "Given", staffId)` | Throws ApiError(404, "Staff member not found") |
| Invalid status | Mock patient found, medication found | call `updateMedicationStatus(patientId, medicationId, "Invalid", staffId)` | Throws ApiError(400, "Invalid status value") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                 MEDICATIONS FLOW (BACKEND)                 |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER MEDICATION FLOW             | |
|  |                                                     | |
|  |  POST /patients/:patientId/medications              | |
|  |         -> validate(createMedicationSchema)         | |
|  |         -> medicationController.orderMedication     | |
|  |         -> medicationService.orderMedication        | |
|  |         -> Check patient exists                     | |
|  |         -> Check staff exists                       | |
|  |         -> Create medication with status Ordered    | |
|  |         -> Return medication object                 | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST MEDICATIONS FLOW             | |
|  |                                                     | |
|  |  GET /patients/:patientId/medications               | |
|  |         -> validate(getMedicationsQuerySchema)      | |
|  |         -> medicationController.getMedications      | |
|  |         -> medicationService.getMedications         | |
|  |         -> Check patient exists                     | |
|  |         -> Apply status filter and pagination       | |
|  |         -> Return medication list                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW MEDICATION FLOW              | |
|  |                                                     | |
|  |  GET /patients/:patientId/medications/:medicationId | |
|  |         -> medicationController.getMedicationById   | |
|  |         -> medicationService.getMedicationById      | |
|  |         -> Check patient exists                     | |
|  |         -> Find medication by ID                    | |
|  |         -> Return medication detail                 | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE STATUS FLOW                | |
|  |                                                     | |
|  |  PUT /patients/:patientId/medications/:medicationId | |
|  |         -> validate(updateMedicationStatusSchema)   | |
|  |         -> medicationController.updateMedicationStatus| |
|  |         -> medicationService.updateMedicationStatus | |
|  |         -> Check patient exists                     | |
|  |         -> Check medication exists                  | |
|  |         -> Check staff exists                       | |
|  |         -> Update status                            | |
|  |         -> Return updated medication                | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
