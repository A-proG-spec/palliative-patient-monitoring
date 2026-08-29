# function-level-specification/backend/04-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: VISITS

## 1. Overview

This document defines the function-level specification for home visit features including recording home visits and retrieving visit history.

**Files Covered:**
- `src/schemas/visit.schema.ts`
- `src/services/visit.service.ts`
- `src/controllers/visit.controller.ts`
- `src/routes/visit.routes.ts`

---

## 2. Schema Definitions

### src/schemas/visit.schema.ts

| Schema | Shape |
|---|---|
| createVisitSchema | `z.object({ body: z.object({ visitDate: z.string().date(), timeStarted: z.string().regex(/^\d{2}:\d{2}$/), timeEnded: z.string().regex(/^\d{2}:\d{2}$/), visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']), teamMembers: z.array(z.object({ role: z.enum(['TeamLeader', 'Physician', 'Nurse']), name: z.string().min(1) })).min(1), overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']), mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']), vitals: z.object({ temperature: z.number().optional(), pulse: z.number().optional(), bp: z.string().optional(), respiration: z.number().optional(), spo2: z.number().optional() }).optional(), painScore: z.number().min(0).max(10), painLocation: z.array(z.enum(['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other'])).optional(), painCharacteristics: z.array(z.enum(['Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous'])).optional(), painMedicationEffective: z.boolean(), symptoms: z.array(z.enum(['Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other'])).optional(), adl: z.object({ feeding: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']), bathing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']), dressing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']), toileting: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']), mobility: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']) }), ppsScore: z.number().min(0).max(100), kpsScore: z.number().min(0).max(100), appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']), oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']), hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']), emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']), familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']), financialDifficulty: z.boolean(), spiritualNeeds: z.boolean(), religiousSupportRequested: z.boolean(), medicationAvailable: z.boolean(), medicationCorrectlyTaken: z.boolean(), medicationSideEffects: z.boolean(), medicationRefillNeeded: z.boolean(), morphineAvailable: z.boolean(), adherenceLevel: z.enum(['Good', 'Partial', 'Poor']), currentMedications: z.array(z.object({ name: z.string(), dosage: z.string(), frequency: z.string(), route: z.string() })).optional(), caregiverBurden: z.enum(['Low', 'Moderate', 'High']), caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']), caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']), familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']), educationProvided: z.array(z.enum(['MedicationAdministration', 'PainManagement', 'NutritionSupport', 'SkinCare', 'PressureSorePrevention', 'EndOfLifeCare', 'EmergencySigns', 'EmotionalSupport', 'Other'])).optional(), homeCondition: z.enum(['Clean', 'Fair', 'Poor']), homeObservations: z.array(z.enum(['AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues'])).optional(), nursingCareGiven: z.array(z.enum(['Hygiene', 'WoundCare', 'MedicationAdmin', 'PositionChange', 'FeedingAssistance', 'Counseling', 'Other'])).optional(), redFlags: z.array(z.enum(['SevereUncontrolledPain', 'SevereShortnessOfBreath', 'MassiveBleeding', 'UncontrolledSeizures', 'AlteredMentalStatus', 'SevereDehydration', 'None'])).optional(), redFlagActions: z.string().optional(), referralsMade: z.array(z.enum(['PhysicianReview', 'HospitalAdmission', 'SocialWorker', 'Psychologist', 'SpiritualCare', 'NutritionSupport'])).optional(), outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']), nextVisitDate: z.string().date().optional(), teamLeaderId: z.string(), physicianId: z.string(), nurseId: z.string() }) })` |
| getVisitsQuerySchema | `z.object({ query: z.object({ page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20) }) })` |
| getVisitParamsSchema | `z.object({ params: z.object({ visitId: z.string() }) })` |

---

## 3. Service Functions

### src/services/visit.service.ts

#### recordVisit

| Field | Detail |
|---|---|
| Signature | `recordVisit(patientId: string, data: CreateVisitInput): Promise<HomeVisitDTO>` |
| Purpose | Record a home visit for a patient |
| Inputs | patientId, visit data |
| Output | Created home visit object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Creates home visit record in database |

#### getVisits

| Field | Detail |
|---|---|
| Signature | `getVisits(patientId: string, page?: number, limit?: number): Promise<{ items: HomeVisitSummaryDTO[]; total: number }>` |
| Purpose | Get all visits for a patient with pagination |
| Inputs | patientId, page, limit |
| Output | Paginated visit list |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

#### getVisitById

| Field | Detail |
|---|---|
| Signature | `getVisitById(patientId: string, visitId: string): Promise<HomeVisitDetailDTO>` |
| Purpose | Get detailed visit information |
| Inputs | patientId, visitId |
| Output | Full visit detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

---

## 4. Controller Functions

### src/controllers/visit.controller.ts

| Handler | Calls | Response |
|---|---|---|
| recordVisit | `visitService.recordVisit(req.params.patientId, req.body)` | 201, `SuccessResponse(201, "Home visit recorded successfully", result)` |
| getVisits | `visitService.getVisits(req.params.patientId, req.query.page, req.query.limit)` | 200, `SuccessResponse(200, "OK", result)` |
| getVisitById | `visitService.getVisitById(req.params.patientId, req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 5. Route Definitions

### src/routes/visit.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | / | `authMiddleware, validate(createVisitSchema)` | recordVisit |
| GET | / | `authMiddleware, validate(getVisitsQuerySchema)` | getVisits |
| GET | /:visitId | `authMiddleware` | getVisitById |

Mounted at: `/api/v1/patients/:patientId/visits`

---

## 6. Implementation Notes

### DTO Types

```typescript
// src/types/visit.types.ts

export interface CreateVisitInput {
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{ role: 'TeamLeader' | 'Physician' | 'Nurse'; name: string }>;
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective: boolean;
  symptoms?: string[];
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;
  kpsScore: number;
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
}

export interface HomeVisitSummaryDTO {
  id: string;
  visitDate: Date;
  visitType: string;
  overallStatus: string;
  outcome: string;
  teamMembers: Array<{ role: string; name: string }>;
  createdAt: Date;
}

export interface HomeVisitDetailDTO extends HomeVisitSummaryDTO {
  timeStarted: string;
  timeEnded: string;
  mobility: string;
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
  adl: {
    feeding: string;
    bathing: string;
    dressing: string;
    toileting: string;
    mobility: string;
  };
  ppsScore: number;
  kpsScore: number;
  appetite: string;
  oralIntake: string;
  hydrationStatus: string;
  emotionalStatus: string;
  familySupport: string;
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: string;
  currentMedications: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden: string;
  caregiverUnderstanding: string;
  caregivingCapacity: string;
  familyEmotionalStatus: string;
  educationProvided: string[];
  homeCondition: string;
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  nextVisitDate?: Date;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
}
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/visit.schema.ts` | `tests/schemas/visit.schema.test.ts` | Unit |
| `src/services/visit.service.ts` | `tests/services/visit.service.test.ts` | Unit |
| `src/controllers/visit.controller.ts` | `tests/controllers/visit.controller.test.ts` | Unit |
| `src/routes/visit.routes.ts` | `tests/routes/visit.routes.test.ts` | Integration |

---

## 8. Test Cases

### visit.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| createVisitSchema accepts valid data | parse valid request body | Passes |
| createVisitSchema rejects invalid visitDate | parse with invalid date | Validation fails |
| createVisitSchema rejects invalid painScore | parse with painScore -1 | Validation fails |
| createVisitSchema rejects invalid ppsScore | parse with ppsScore 150 | Validation fails |
| createVisitSchema rejects empty teamMembers | parse with empty teamMembers | Validation fails |
| getVisitsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |

### visit.service.test.ts

#### recordVisit

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found | call `recordVisit(patientId, data)` | Resolves with visit object |
| Patient not found | Mock patient not found | call `recordVisit(patientId, data)` | Throws ApiError(404, "Patient not found") |
| Invalid teamLeaderId | Mock patient found, invalid teamLeaderId | call `recordVisit(patientId, data)` | Throws ApiError(400, "Team leader not found") |

#### getVisits

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with visits | Mock patient found, visits exist | call `getVisits(patientId)` | Resolves with paginated visit list |
| Patient not found | Mock patient not found | call `getVisits(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient exists with no visits | Mock patient found, no visits | call `getVisits(patientId)` | Resolves with empty items list |

#### getVisitById

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Visit exists | Mock patient found, visit found | call `getVisitById(patientId, visitId)` | Resolves with visit detail |
| Patient not found | Mock patient not found | call `getVisitById(patientId, visitId)` | Throws ApiError(404, "Patient not found") |
| Visit not found | Mock patient found, visit not found | call `getVisitById(patientId, visitId)` | Throws ApiError(404, "Visit not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                    VISITS FLOW (BACKEND)                   |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD VISIT FLOW                 | |
|  |                                                     | |
|  |  POST /patients/:patientId/visits                   | |
|  |         -> validate(createVisitSchema)              | |
|  |         -> visitController.recordVisit              | |
|  |         -> visitService.recordVisit                 | |
|  |         -> Check patient exists                     | |
|  |         -> Validate team members exist              | |
|  |         -> Create visit record                      | |
|  |         -> Return visit object                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST VISITS FLOW                  | |
|  |                                                     | |
|  |  GET /patients/:patientId/visits                    | |
|  |         -> validate(getVisitsQuerySchema)           | |
|  |         -> visitController.getVisits                | |
|  |         -> visitService.getVisits                   | |
|  |         -> Check patient exists                     | |
|  |         -> Get visits with pagination               | |
|  |         -> Return visit list                        | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW VISIT FLOW                   | |
|  |                                                     | |
|  |  GET /patients/:patientId/visits/:visitId           | |
|  |         -> visitController.getVisitById             | |
|  |         -> visitService.getVisitById                | |
|  |         -> Check patient exists                     | |
|  |         -> Find visit by ID                         | |
|  |         -> Return visit detail                      | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
