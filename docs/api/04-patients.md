# api/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - PATIENT API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients | Staff | Register new patient |
| GET | /patients | Staff | Get patients (filtered) |
| GET | /patients/:patientId | Staff | Get patient details |
| GET | /patients/:patientId/summary | Staff | Get patient summary report |
| GET | /patients/:patientId/progress | Staff | Get patient progress data (KPS/PPS) |
| GET | /patients/:patientId/print | Staff, Admin | Get patient data formatted for print/export |
| GET | /patients/:patientId/export | Staff, Admin | Export patient history as PDF |

## 2. Endpoint Details

### POST /patients

**Purpose:** Register new patient

**Auth:** Staff

**Request Body:**

```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "age": 65,
  "sex": "Female",
  "dateOfBirth": "1961-08-15",
  "address": "Bole, Addis Ababa",
  "phone": "+251922222222",
  "emergencyContactName": "Michael Johnson",
  "emergencyContactPhone": "+251933333333",
  "caregiverName": "Michael Johnson",
  "caregiverPhone": "+251933333333",
  "primaryDiagnosis": "Stage IV Breast Cancer",
  "secondaryDiagnoses": ["Metastatic to bone"],
  "diseaseStage": "Advanced",
  "comorbidities": ["Hypertension"],
  "estimatedPrognosis": "Months"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| firstName | Required, min 2 chars |
| lastName | Required, min 2 chars |
| age | Required, number, > 0 |
| sex | Required, Male or Female |
| dateOfBirth | Required, valid date |
| address | Required |
| phone | Required |
| emergencyContactName | Required |
| emergencyContactPhone | Required |
| caregiverName | Required |
| caregiverPhone | Required |
| primaryDiagnosis | Required |
| diseaseStage | Required, Early, Advanced, or EndStage |
| estimatedPrognosis | Required, Days, Weeks, Months, or Uncertain |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Validation error | Field-specific errors |
| 404 | Staff not found | "Staff member not found" |

---

### GET /patients

**Purpose:** Get list of patients (filtered by role)

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | undefined | Filter by status (Active, Discharged) |
| search | string | undefined | Search by name or ID |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439012",
        "patientDisplayId": "PAT-001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "age": 65,
        "sex": "Female",
        "status": "Active",
        "currentLocation": "Home",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "registeredAt": "2026-08-29T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid query params | "Invalid pagination parameters" |

---

### GET /patients/:patientId

**Purpose:** Get patient details

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "age": 65,
    "sex": "Female",
    "dateOfBirth": "1961-08-15",
    "address": "Bole, Addis Ababa",
    "phone": "+251922222222",
    "emergencyContactName": "Michael Johnson",
    "emergencyContactPhone": "+251933333333",
    "caregiverName": "Michael Johnson",
    "caregiverPhone": "+251933333333",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /patients/:patientId/summary

**Purpose:** Get comprehensive patient summary report

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "age": 65,
      "sex": "Female",
      "status": "Active",
      "currentLocation": "Home",
      "patientDisplayId": "PAT-001"
    },
    "diagnosis": {
      "primary": "Stage IV Breast Cancer",
      "secondary": ["Metastatic to bone"],
      "stage": "Advanced"
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "date": "2026-08-29T08:00:00Z",
        "outcome": "Stable",
        "staff": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Jane Doe"
        }
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "status": "Given",
        "administeredAt": "Home"
      }
    ],
    "labTests": [
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "Complete Blood Count",
        "dateOrdered": "2026-08-29T09:00:00Z",
        "result": "Normal"
      }
    ],
    "referrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "date": "2026-08-29T09:30:00Z",
        "status": "Pending"
      }
    ],
    "admissions": [
      {
        "id": "507f1f77bcf86cd799439017",
        "date": "2026-08-30T10:00:00Z",
        "status": "Active"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /patients/:patientId/progress (NEW)

**Purpose:** Get patient progress data for KPS/PPS graph

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "patientId": "507f1f77bcf86cd799439012",
    "patientName": "Sarah Johnson",
    "visits": [
      {
        "visitId": "507f1f77bcf86cd799439013",
        "visitDate": "2026-08-29T08:00:00Z",
        "kpsScore": 60,
        "ppsScore": 60
      },
      {
        "visitId": "507f1f77bcf86cd799439018",
        "visitDate": "2026-08-22T08:00:00Z",
        "kpsScore": 45,
        "ppsScore": 50
      },
      {
        "visitId": "507f1f77bcf86cd799439019",
        "visitDate": "2026-08-15T08:00:00Z",
        "kpsScore": 30,
        "ppsScore": 35
      }
    ],
    "trends": {
      "kps": {
        "trend": "declining",
        "percentageChange": -25,
        "firstScore": 60,
        "lastScore": 45
      },
      "pps": {
        "trend": "declining",
        "percentageChange": -20,
        "firstScore": 60,
        "lastScore": 48
      }
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /patients/:patientId/print (NEW)

**Purpose:** Get patient data formatted for print/export with ALL records and FULL details

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439012",
      "patientDisplayId": "PAT-001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "age": 65,
      "sex": "Female",
      "dateOfBirth": "1961-08-15",
      "address": "Bole, Addis Ababa",
      "phone": "+251922222222",
      "emergencyContactName": "Michael Johnson",
      "emergencyContactPhone": "+251933333333",
      "caregiverName": "Michael Johnson",
      "caregiverPhone": "+251933333333",
      "status": "Active",
      "currentLocation": "Home",
      "primaryDiagnosis": "Stage IV Breast Cancer",
      "secondaryDiagnoses": ["Metastatic to bone"],
      "diseaseStage": "Advanced",
      "comorbidities": ["Hypertension"],
      "estimatedPrognosis": "Months",
      "registeredBy": { "id": "507f1f77bcf86cd799439011", "name": "John Doe" },
      "createdAt": "2026-08-29T10:00:00Z"
    },
    "progress": {
      "data": [
        { "visitId": "v1", "visitDate": "2026-08-29T08:00:00Z", "kpsScore": 60, "ppsScore": 60 },
        { "visitId": "v2", "visitDate": "2026-08-22T08:00:00Z", "kpsScore": 45, "ppsScore": 50 }
      ],
      "trends": {
        "kps": { "trend": "declining", "percentageChange": -25, "firstScore": 60, "lastScore": 45 },
        "pps": { "trend": "declining", "percentageChange": -20, "firstScore": 60, "lastScore": 48 }
      }
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "visitDate": "2026-08-29T08:00:00Z",
        "timeStarted": "09:00",
        "timeEnded": "10:30",
        "visitType": "Routine",
        "teamMembers": [
          { "role": "TeamLeader", "name": "Dr. Smith" },
          { "role": "Nurse", "name": "Jane Doe" }
        ],
        "overallStatus": "Stable",
        "mobility": "RequiresAssistance",
        "vitals": {
          "temperature": 36.8,
          "pulse": 78,
          "bp": "120/80",
          "respiration": 18,
          "spo2": 97
        },
        "painScore": 3,
        "painLocation": ["Back"],
        "painCharacteristics": ["Dull"],
        "painMedicationEffective": true,
        "symptoms": ["Fatigue"],
        "adl": {
          "feeding": "NeedsAssistance",
          "bathing": "NeedsAssistance",
          "dressing": "Independent",
          "toileting": "NeedsAssistance",
          "mobility": "NeedsAssistance"
        },
        "ppsScore": 60,
        "kpsScore": 60,
        "appetite": "Fair",
        "oralIntake": "Reduced",
        "hydrationStatus": "Adequate",
        "emotionalStatus": "Stable",
        "familySupport": "Good",
        "financialDifficulty": false,
        "spiritualNeeds": false,
        "religiousSupportRequested": false,
        "medicationAvailable": true,
        "medicationCorrectlyTaken": true,
        "medicationSideEffects": false,
        "medicationRefillNeeded": false,
        "morphineAvailable": true,
        "adherenceLevel": "Good",
        "currentMedications": [],
        "caregiverBurden": "Moderate",
        "caregiverUnderstanding": "Good",
        "caregivingCapacity": "Moderate",
        "familyEmotionalStatus": "Stable",
        "educationProvided": ["PainManagement", "MedicationAdministration"],
        "homeCondition": "Clean",
        "homeObservations": ["AdequateLighting", "Ventilation"],
        "nursingCareGiven": ["MedicationAdmin", "Counseling"],
        "redFlags": ["None"],
        "outcome": "Stable",
        "nextVisitDate": "2026-09-05T00:00:00Z",
        "teamLeader": { "id": "id1", "name": "Dr. Smith" },
        "physician": { "id": "id2", "name": "Dr. Kebede" },
        "nurse": { "id": "id3", "name": "Jane Doe" }
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "frequency": "Every 6 hours",
        "route": "Oral",
        "administeredAt": "Home",
        "status": "Given",
        "prescribedBy": { "id": "id", "name": "John Doe" },
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "labTests": [
      {
        "id": "507f1f77bcf86cd799439015",
        "testName": "Complete Blood Count",
        "dateOrdered": "2026-08-29T00:00:00Z",
        "datePerformed": "2026-08-30T00:00:00Z",
        "result": "Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250",
        "location": "Home",
        "status": "Completed",
        "orderedBy": { "id": "id", "name": "John Doe" }
      }
    ],
    "referrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "referralType": "Outgoing",
        "referralDate": "2026-08-29T00:00:00Z",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "diseaseStage": "Advanced",
        "ppsScore": 60,
        "kpsScore": 60,
        "currentSymptoms": {
          "pain": 3,
          "dyspnea": 2,
          "fatigue": 5,
          "anxiety": 2,
          "depression": 1
        },
        "reasons": ["SymptomControl", "PainManagement"],
        "referringFacility": "Home Care Unit",
        "receivingFacility": "Yekatit 12 Hospital",
        "contactPerson": "Dr. Alem",
        "contactNumber": "+251944444444",
        "status": "Accepted",
        "actionTaken": "ReferralAccepted",
        "outcome": "Patient transferred for inpatient care",
        "followUpDate": "2026-09-05T00:00:00Z",
        "followUpStatus": "Pending",
        "requestedBy": { "id": "id", "name": "John Doe" },
        "approvedBy": { "id": "id", "name": "Admin User" },
        "preparedBy": "Dr. Smith",
        "preparedByDesignation": "Physician",
        "signature": "Dr. Smith",
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "admissions": [
      {
        "id": "507f1f77bcf86cd799439017",
        "admissionDate": "2026-08-30T00:00:00Z",
        "dischargeDate": null,
        "bedNumber": "B-12",
        "ward": "Palliative Care Ward",
        "admittingPhysician": "Dr. Kebede",
        "careTeam": "Team A",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "secondaryDiagnoses": ["Metastatic to bone"],
        "diseaseStage": "Advanced",
        "comorbidities": ["Hypertension"],
        "estimatedPrognosis": "Months",
        "ppsScore": 60,
        "functionalStatus": "PartiallyDependent",
        "painScore": 4,
        "painType": "Mixed",
        "symptomsPresent": ["Fatigue", "Anxiety"],
        "emotionalStatus": "Anxious",
        "familySupport": "Moderate",
        "spiritualConcerns": false,
        "painManagementPlan": "Morphine 10mg every 6 hours",
        "medicationPlan": "Continue current medications",
        "nursingCarePlan": "Daily monitoring and pain assessment",
        "homeBasedCareRequired": false,
        "physiotherapyRequired": false,
        "dischargeReason": null,
        "status": "Active",
        "createdBy": { "id": "id", "name": "John Doe" }
      }
    ],
    "generatedAt": "2026-09-01T10:30:00Z",
    "generatedBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "staff"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /patients/:patientId/export (NEW)

**Purpose:** Export patient history as PDF with ALL records and FULL details

**Auth:** Staff, Admin

**Success Response (200):**

Returns a PDF file blob.

**Response Headers:**

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=patient-history-PAT-001.pdf`

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 500 | PDF generation error | "Failed to generate PDF" |

---

## 3. Type Definitions

```typescript
// src/types/patient.types.ts

export interface Patient {
  id: string;
  patientDisplayId?: string;
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
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
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

export interface PatientListResponse {
  items: Patient[];
  page: number;
  limit: number;
  total: number;
}

export interface PatientSummaryResponse {
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
    date: string;
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
    dateOrdered: string;
    result?: string;
  }>;
  referrals: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  admissions: Array<{
    id: string;
    date: string;
    status: string;
  }>;
}

// ============================================
// PROGRESS TYPES (NEW)
// ============================================

export interface ProgressDataPoint {
  visitId: string;
  visitDate: string;
  kpsScore: number;
  ppsScore: number;
}

export interface PatientProgressData {
  patientId: string;
  patientName: string;
  visits: ProgressDataPoint[];
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
// PRINT/EXPORT TYPES (NEW)
// ============================================

export interface PrintableVisit {
  id: string;
  visitDate: string;
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
  nextVisitDate?: string;
  teamLeader: { id: string; name: string };
  physician: { id: string; name: string };
  nurse: { id: string; name: string };
}

export interface PrintableMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  prescribedBy: { id: string; name: string };
  createdAt: string;
}

export interface PrintableLab {
  id: string;
  testName: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: { id: string; name: string };
}

export interface PrintableReferral {
  id: string;
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
  status: string;
  actionTaken?: string;
  outcome?: string;
  followUpDate?: string;
  followUpStatus?: string;
  requestedBy: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
}

export interface PrintableAdmission {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
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

export interface PatientPrintData {
  patient: {
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: string;
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
    createdAt: string;
  };
  progress: {
    data: ProgressDataPoint[];
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  visits: PrintableVisit[];
  medications: PrintableMedication[];
  labTests: PrintableLab[];
  referrals: PrintableReferral[];
  admissions: PrintableAdmission[];
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
    role: string;
  };
}
```

---

## 4. Summary of Changes

| Change | Before | After |
|---|---|---|
| Progress endpoint | Not available | Added `GET /patients/:patientId/progress` |
| Print data endpoint | Not available | Added `GET /patients/:patientId/print` |
| Export PDF endpoint | Not available | Added `GET /patients/:patientId/export` |
| Progress types | Not available | Added `ProgressDataPoint`, `PatientProgressData` |
| Print types | Not available | Added `PrintableVisit`, `PrintableMedication`, `PrintableLab`, `PrintableReferral`, `PrintableAdmission`, `PatientPrintData` |
| Visit details in print | Basic summary | FULL visit details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures) |
| Medication details in print | Basic | Full details (name, dosage, frequency, route, status, prescribed by, administered at) |
| Lab details in print | Basic | Full details (test name, ordered date, performed date, result, location, status) |
| Referral details in print | Basic | Full details (type, diagnosis, symptoms, reasons, facilities, prepared by, signature, action taken, outcome, follow-up) |
| Admission details in print | Basic | Full details (care plan, pain management, medication plan, nursing care plan) |
```