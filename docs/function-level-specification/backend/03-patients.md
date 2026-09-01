# function-level-specification/backend/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: PATIENTS

## 1. Overview

This document defines the function-level specification for patient management features including patient registration, patient listing, patient details, patient summary, patient progress tracking, and print/export functionality.

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

---

#### getPatients

| Field | Detail |
|---|---|
| Signature | `getPatients(staffId: string, page?: number, limit?: number, status?: string, search?: string): Promise<{ items: PatientDTO[]; total: number }>` |
| Purpose | Get list of patients with pagination and filters |
| Inputs | staffId, page, limit, status, search |
| Output | Paginated patient list |
| Throws | None |
| Side Effects | Read-only |

---

#### getPatientById

| Field | Detail |
|---|---|
| Signature | `getPatientById(patientId: string): Promise<PatientDetailDTO>` |
| Purpose | Get patient details by ID |
| Inputs | patientId |
| Output | Patient detail object with registeredBy info |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

#### getPatientSummary

| Field | Detail |
|---|---|
| Signature | `getPatientSummary(patientId: string): Promise<PatientSummaryDTO>` |
| Purpose | Get comprehensive patient summary report |
| Inputs | patientId |
| Output | Patient summary with all related records |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

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

#### getPatientPrintData (NEW)

| Field | Detail |
|---|---|
| Signature | `getPatientPrintData(patientId: string, userId: string): Promise<PatientPrintDataDTO>` |
| Purpose | Get patient data formatted for print/export with ALL records and FULL details |
| Inputs | patientId, userId |
| Output | Print-formatted patient data with all records |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Read-only |

**Implementation Details:**

1. Find patient by ID with registeredBy populated
2. Get all visits with FULL details (including team members, vitals, pain scores, ADL, symptoms, red flags, signatures)
3. Get all medications with FULL details (name, dosage, frequency, route, status, prescribed by, administered at)
4. Get all lab tests with FULL details (test name, ordered date, performed date, result, location, status)
5. Get all referrals with FULL details (type, diagnosis, symptoms, reasons, facilities, preparedBy, signature, actionTaken, outcome, follow-up)
6. Get all admissions with FULL details (care plan, pain management, medication plan, nursing care plan)
7. Calculate KPS/PPS progress data from visits with trends
8. Add generation timestamp and user info
9. Return combined object

---

#### exportPatientPDF (NEW)

| Field | Detail |
|---|---|
| Signature | `exportPatientPDF(patientId: string, userId: string): Promise<Buffer>` |
| Purpose | Export patient history as PDF with ALL records and FULL details |
| Inputs | patientId, userId |
| Output | PDF buffer |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(404, "User not found")` |
| Throws | `ApiError(500, "Failed to generate PDF")` |
| Side Effects | Generates PDF file |

**Implementation Details:**

1. Get patient print data using `getPatientPrintData()`
2. Generate HTML from print data with professional styling
3. Convert HTML to PDF using PDF generation library (e.g., puppeteer, pdfkit)
4. Return PDF buffer

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
| getPatientPrintData | `patientService.getPatientPrintData(req.params.patientId, req.user.id)` | 200, `SuccessResponse(200, "OK", result)` |
| exportPatientPDF | `patientService.exportPatientPDF(req.params.patientId, req.user.id)` | 200, Returns PDF file blob |

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
| GET | /:patientId/print | `authMiddleware` | getPatientPrintData |
| GET | /:patientId/export | `authMiddleware` | exportPatientPDF |

Mounted at: `/api/v1/patients`

---

## 6. Implementation Notes

### Patient Display ID Generation

```typescript
// src/services/patient.service.ts (internal function)

const generatePatientDisplayId = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'patientId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const number = counter.value;
  return `PAT-${String(number).padStart(3, '0')}`;
};
```

### Print Data Assembly (NEW)

```typescript
// src/services/patient.service.ts (internal function for print data)

const assemblePrintData = async (
  patient: any,
  visits: any[],
  medications: any[],
  labTests: any[],
  referrals: any[],
  admissions: any[],
  userId: string
): Promise<PatientPrintDataDTO> => {
  // Get user info
  const user = await Staff.findById(userId) || await Admin.findById(userId);
  
  // Calculate KPS/PPS progress
  const progressData = visits.map(v => ({
    visitId: v._id.toString(),
    visitDate: v.visitDate,
    kpsScore: v.kpsScore,
    ppsScore: v.ppsScore
  }));
  
  // Calculate trends
  // ... trend calculation logic
  
  return {
    patient: {
      id: patient._id.toString(),
      patientDisplayId: patient.patientDisplayId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      sex: patient.sex,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      phone: patient.phone,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      caregiverName: patient.caregiverName,
      caregiverPhone: patient.caregiverPhone,
      status: patient.status,
      currentLocation: patient.currentLocation,
      primaryDiagnosis: patient.primaryDiagnosis,
      secondaryDiagnoses: patient.secondaryDiagnoses,
      diseaseStage: patient.diseaseStage,
      comorbidities: patient.comorbidities,
      estimatedPrognosis: patient.estimatedPrognosis,
      registeredBy: {
        id: patient.registeredBy._id.toString(),
        name: patient.registeredBy.name
      },
      createdAt: patient.createdAt
    },
    progress: {
      data: progressData,
      trends: {
        kps: { trend, percentageChange, firstScore, lastScore },
        pps: { trend, percentageChange, firstScore, lastScore }
      }
    },
    visits: visits.map(formatVisitForPrint),
    medications: medications.map(formatMedicationForPrint),
    labTests: labTests.map(formatLabForPrint),
    referrals: referrals.map(formatReferralForPrint),
    admissions: admissions.map(formatAdmissionForPrint),
    generatedAt: new Date(),
    generatedBy: {
      id: user._id.toString(),
      name: user.name,
      role: user.role || 'admin'
    }
  };
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

// ============================================
// PRINT/EXPORT DTO TYPES (NEW)
// ============================================

export interface PrintableVisitDTO {
  id: string;
  visitDate: Date;
  timeStarted: string;
  timeEnded: string;
  visitType: string;
  teamMembers: Array<{ role: string; name: string }>;
  overallStatus: string;
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
  outcome: string;
  nextVisitDate?: Date;
  teamLeader: { id: string; name: string };
  physician: { id: string; name: string };
  nurse: { id: string; name: string };
}

export interface PrintableMedicationDTO {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  prescribedBy: { id: string; name: string };
  createdAt: Date;
}

export interface PrintableLabDTO {
  id: string;
  testName: string;
  dateOrdered: Date;
  datePerformed?: Date;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: { id: string; name: string };
}

export interface PrintableReferralDTO {
  id: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: Date;
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
  status: string;
  actionTaken?: string;
  outcome?: string;
  followUpDate?: Date;
  followUpStatus?: string;
  requestedBy: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: Date;
}

export interface PrintableAdmissionDTO {
  id: string;
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
  createdBy: { id: string; name: string };
}

export interface PatientPrintDataDTO {
  patient: {
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: Date;
    address: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    caregiverName: string;
    caregiverPhone: string;
    status: string;
    currentLocation: string;
    primaryDiagnosis: string;
    secondaryDiagnoses: string[];
    diseaseStage: string;
    comorbidities: string[];
    estimatedPrognosis: string;
    registeredBy: { id: string; name: string };
    createdAt: Date;
  };
  progress: {
    data: Array<{ visitId: string; visitDate: Date; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  visits: PrintableVisitDTO[];
  medications: PrintableMedicationDTO[];
  labTests: PrintableLabDTO[];
  referrals: PrintableReferralDTO[];
  admissions: PrintableAdmissionDTO[];
  generatedAt: Date;
  generatedBy: {
    id: string;
    name: string;
    role: string;
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

#### getPatientPrintData (NEW)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with all records | Mock patient found with visits, medications, labs, referrals, admissions | call `getPatientPrintData(patientId, userId)` | Resolves with complete print data including all records |
| Patient exists with no visits | Mock patient found with empty records | call `getPatientPrintData(patientId, userId)` | Resolves with print data, empty arrays for records |
| Patient not found | Mock patient not found | call `getPatientPrintData(patientId, userId)` | Throws ApiError(404, "Patient not found") |
| User not found | Mock patient found, user not found | call `getPatientPrintData(patientId, userId)` | Throws ApiError(404, "User not found") |

#### exportPatientPDF (NEW)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found with all records | call `exportPatientPDF(patientId, userId)` | Resolves with PDF buffer |
| Patient not found | Mock patient not found | call `exportPatientPDF(patientId, userId)` | Throws ApiError(404, "Patient not found") |
| PDF generation fails | Mock PDF generation error | call `exportPatientPDF(patientId, userId)` | Throws ApiError(500, "Failed to generate PDF") |

---

## 9. Flow Diagram (UPDATED)

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
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PRINT FLOW (NEW)                  | |
|  |                                                     | |
|  |  GET /patients/:patientId/print                     | |
|  |         -> patientController.getPatientPrintData    | |
|  |         -> patientService.getPatientPrintData       | |
|  |         -> Find patient                            | |
|  |         -> Get ALL records with FULL details       | |
|  |         -> Calculate KPS/PPS trends                | |
|  |         -> Format for print                         | |
|  |         -> Return print data                        | |
|  |                                                     | |
|  |  GET /patients/:patientId/export                     | |
|  |         -> patientController.exportPatientPDF       | |
|  |         -> patientService.exportPatientPDF          | |
|  |         -> Get print data                          | |
|  |         -> Generate PDF from HTML                  | |
|  |         -> Return PDF buffer                        | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```