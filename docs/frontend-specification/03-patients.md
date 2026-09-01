# frontend-specification/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND PATIENT SPECIFICATION

## 1. Overview

This document defines the frontend implementation for patient management features including patient registration, patient list, patient detail, patient summary, and patient history print/export.

**API Reference:** `api/03-patients.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients` | `PatientListPage` | `DashboardLayout` | Staff |
| `/patients/new` | `PatientRegistrationPage` | `DashboardLayout` | Staff |
| `/patients/:id` | `PatientDetailPage` | `DashboardLayout` | Staff |
| `/patients/:id/summary` | `PatientSummaryPage` | `DashboardLayout` | Staff |
| `/patients/:id/progress` | `PatientProgressPage` | `DashboardLayout` | Staff |
| `/patients/:id/print` | `PatientPrintPage` | `PrintLayout` | Staff, Admin |

---

## 3. Types

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

## 4. API Calls

```typescript
// src/api/patients.ts

import api from './client';
import { 
  Patient, 
  CreatePatientRequest, 
  PatientListResponse, 
  PatientSummaryResponse,
  PatientProgressData,
  PatientPrintData
} from '@/types/patient.types';

export const patientApi = {
  /**
   * Register new patient
   * POST /patients
   */
  register: (data: CreatePatientRequest): Promise<Patient> => {
    return api.post<Patient>('/patients', data).then((res) => res.data);
  },

  /**
   * Get list of patients (filtered)
   * GET /patients
   */
  getList: (params?: {
    page?: number;
    limit?: number;
    status?: 'Active' | 'Discharged';
    search?: string;
  }): Promise<PatientListResponse> => {
    return api.get<PatientListResponse>('/patients', { params }).then((res) => res.data);
  },

  /**
   * Get patient details
   * GET /patients/:patientId
   */
  getById: (patientId: string): Promise<Patient> => {
    return api.get<Patient>(`/patients/${patientId}`).then((res) => res.data);
  },

  /**
   * Get patient summary report
   * GET /patients/:patientId/summary
   */
  getSummary: (patientId: string): Promise<PatientSummaryResponse> => {
    return api.get<PatientSummaryResponse>(`/patients/${patientId}/summary`).then((res) => res.data);
  },

  /**
   * Get patient progress data for KPS/PPS graph
   * GET /patients/:patientId/progress
   */
  getProgress: (patientId: string): Promise<PatientProgressData> => {
    return api.get<PatientProgressData>(`/patients/${patientId}/progress`).then((res) => res.data);
  },

  /**
   * Get patient data formatted for print/export
   * GET /patients/:patientId/print
   */
  getPrintData: (patientId: string): Promise<PatientPrintData> => {
    return api.get<PatientPrintData>(`/patients/${patientId}/print`).then((res) => res.data);
  },

  /**
   * Export patient history as PDF
   * GET /patients/:patientId/export
   */
  exportPDF: (patientId: string): Promise<Blob> => {
    return api.get(`/patients/${patientId}/export`, { responseType: 'blob' }).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/usePatients.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/api/patients';
import { CreatePatientRequest } from '@/types/patient.types';

/**
 * Get list of patients
 */
export function usePatients(params?: {
  page?: number;
  limit?: number;
  status?: 'Active' | 'Discharged';
  search?: string;
}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientApi.getList(params),
  });
}

/**
 * Get patient details
 */
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => patientApi.getById(patientId),
    enabled: !!patientId,
  });
}

/**
 * Get patient summary report
 */
export function usePatientSummary(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'summary'],
    queryFn: () => patientApi.getSummary(patientId),
    enabled: !!patientId,
  });
}

/**
 * Get patient progress data for KPS/PPS graph
 */
export function usePatientProgress(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress'],
    queryFn: () => patientApi.getProgress(patientId),
    enabled: !!patientId,
  });
}

/**
 * Get patient data formatted for print
 */
export function usePatientPrint(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'print'],
    queryFn: () => patientApi.getPrintData(patientId),
    enabled: !!patientId,
  });
}

/**
 * Export patient history as PDF
 */
export function useExportPatientPDF() {
  return useMutation({
    mutationFn: (patientId: string) => patientApi.exportPDF(patientId),
  });
}

/**
 * Register new patient
 */
export function useRegisterPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
```

---

## 6. Components

### 6.1 PatientCard

**Purpose:** Display patient summary card in patient list

**Props:**

```typescript
interface PatientCardProps {
  patient: Patient;
  onClick?: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | [Patient Avatar]   Sarah Johnson                      | |
| |                    PAT-001                            | |
| |                    Age: 65  Female                    | |
| |                    Stage IV Breast Cancer             | |
| |                    Status: Active  Location: Home     | |
| |                    Registered: 2026-08-29             | |
| |                                    [View Details]     | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 PatientForm

**Purpose:** Form for registering new patient

**Props:**

```typescript
interface PatientFormProps {
  onSubmit: (data: CreatePatientRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreatePatientRequest>;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Patient Registration                                       |
| +-------------------------------------------------------+ |
| | Personal Information                                   | |
| | +---------------------------------------------------+ | |
| | | First Name: [________________] Last Name: [_______]| | |
| | | Age: [___]  Sex: [Male/Female]  DOB: [__/__/____] | | |
| | | Address: [________________________]               | | |
| | | Phone: [________________________]                 | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Emergency Contact                                     | |
| | +---------------------------------------------------+ | |
| | | Name: [________________] Phone: [________________]  | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Caregiver Information                                 | |
| | +---------------------------------------------------+ | |
| | | Name: [________________] Phone: [________________]  | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Medical Information                                   | |
| | +---------------------------------------------------+ | |
| | | Primary Diagnosis: [________________________]      | | |
| | | Secondary Diagnoses: [________________________]   | | |
| | | Disease Stage: [Early/Advanced/EndStage]          | | |
| | | Comorbidities: [________________________]         | | |
| | | Estimated Prognosis: [Days/Weeks/Months/Uncertain]| | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                              [Cancel] [Register]      | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.3 PatientSummary

**Purpose:** Display comprehensive patient summary

**Props:**

```typescript
interface PatientSummaryProps {
  summary: PatientSummaryResponse;
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Patient Summary: Sarah Johnson                             |
| PAT-001                                                    |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Patient Information                                    | |
| | Name: Sarah Johnson   Age: 65   Sex: Female           | |
| | Status: Active        Location: Home                  | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Diagnosis                                              | |
| | Primary: Stage IV Breast Cancer                       | |
| | Secondary: Metastatic to bone                         | |
| | Stage: Advanced                                       | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Visit History                                          | |
| | Date          Outcome    Staff                        | |
| | 2026-08-29    Stable     Jane Doe                     | |
| | 2026-08-22    Stable     Jane Doe                     | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Medications                                            | |
| | Name         Dosage     Status   Administered At      | |
| | Morphine     10mg       Given    Home                 | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Lab Tests                                              | |
| | Name                  Date Ordered   Result            | |
| | Complete Blood Count  2026-08-29     Normal            | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Referrals                                              | |
| | Date          Status                                   | |
| | 2026-08-29    Pending                                  | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Admissions                                             | |
| | Date          Status                                   | |
| | 2026-08-30    Active                                   | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.4 PatientProgressGraph

**Purpose:** Display KPS and PPS trends over time

**Props:**

```typescript
interface PatientProgressGraphProps {
  patientName: string;
  data: ProgressDataPoint[];
  loading?: boolean;
  trends?: {
    kps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
    pps: { trend: 'improving' | 'stable' | 'declining'; percentageChange: number };
  };
  isPrintView?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Patient Progress: Sarah Johnson                            |
| KPS (Karnofsky Performance Score) & PPS (Palliative       |
| Performance Scale)                                         |
| +-------------------------------------------------------+ |
| | KPS: 35  (Declining -15%)   PPS: 45  (Declining -18%) | |
| +-------------------------------------------------------+ |
|                                                           |
| Score                                                     |
| 100 -                                                     |
|  90 -                                                     |
|  80 -                                                     |
|  70 -                                           *         |
|  60 -                                  *                  |
|  50 -                         *                           |
|  40 -                *                                    |
|  30 -       *                                             |
|  20 -                                                     |
|  10 -                                                     |
|   0 +--------+--------+--------+--------+--------+-------+ |
|     08/01    08/08    08/15    08/22    08/29    09/05    |
|                                                           |
| Legend:                                                   |
| ---- KPS Score (60 -> 55 -> 50 -> 45 -> 40 -> 35)        |
| ---- PPS Score (70 -> 65 -> 60 -> 55 -> 50 -> 45)        |
+-----------------------------------------------------------+
```

---

### 6.5 PrintButton (NEW)

**Purpose:** Reusable print/export PDF button for patient history

**Props:**

```typescript
interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}
```

**Behavior:**
- Opens print dialog with formatted patient data
- Uses `window.print()` for browser print
- Can also trigger PDF export via backend

**Visual Design:**

```
+-----------------------------------------------------------+
|  [🖨️] Print Patient History                                |
|  or                                                         |
|  [📄] Export PDF                                            |
+-----------------------------------------------------------+
```

---

### 6.6 PatientPrintView (NEW)

**Purpose:** Print-friendly layout for patient history

**Props:**

```typescript
interface PatientPrintViewProps {
  data: PatientPrintData;
  loading?: boolean;
}
```

**Behavior:**
- Displays print-optimized layout with ALL patient records
- Includes institution header (Yekatit 12 Hospital Medical College)
- Shows ALL sections with FULL details:
  - Patient Demographics: All fields
  - KPS/PPS Progress Graph: Visual trends
  - Visits: FULL details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures)
  - Medications: Complete details (name, dosage, frequency, route, status, prescribed by, administered at)
  - Laboratory Tests: Full details (test name, ordered date, performed date, result, location, status)
  - Referrals: Complete details including prepared by, designation, signature, action taken, outcome, follow-up
  - Admissions: Full details including care plan, pain management, medication plan, nursing care plan
- Shows generated timestamp and user info

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    YEKATIT 12 HOSPITAL MEDICAL COLLEGE                    │
│                    Palliative Care Unit                                   │
│                    Tel: +251-XXX-XXXXXX                                   │
│                                                                             │
│                    PATIENT HISTORY REPORT                                  │
│                    Generated: 2026-09-01 10:30 AM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENT INFORMATION                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Patient ID: PAT-001                                                 │ │
│  │  Name: Sarah Johnson                                                │ │
│  │  Age: 65   Sex: Female   DOB: 1961-08-15                           │ │
│  │  Address: Bole, Addis Ababa   Phone: +251922222222                  │ │
│  │  Emergency Contact: Michael Johnson (+251933333333)                 │ │
│  │  Caregiver: Michael Johnson (+251933333333)                         │ │
│  │  Status: Active   Location: Home                                   │ │
│  │  Primary Diagnosis: Stage IV Breast Cancer                         │ │
│  │  Secondary Diagnoses: Metastatic to bone                           │ │
│  │  Disease Stage: Advanced                                            │ │
│  │  Comorbidities: Hypertension                                        │ │
│  │  Estimated Prognosis: Months                                       │ │
│  │  Registered: 2026-08-29 by John Doe                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  PATIENT PROGRESS (KPS/PPS)                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  [KPS/PPS PROGRESS GRAPH - showing trends over all visits]          │ │
│  │                                                                       │ │
│  │  KPS: 60 → 55 → 50 → 45 → 40 → 35 (Declining -25%)                 │ │
│  │  PPS: 70 → 65 → 60 → 55 → 50 → 45 (Declining -25%)                 │ │
│  │                                                                       │ │
│  │  Data Points:                                                         │ │
│  │  08/01: KPS=60, PPS=70                                               │ │
│  │  08/08: KPS=55, PPS=65                                               │ │
│  │  08/15: KPS=50, PPS=60                                               │ │
│  │  08/22: KPS=45, PPS=55                                               │ │
│  │  08/29: KPS=40, PPS=50                                               │ │
│  │  09/05: KPS=35, PPS=45                                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  VISIT HISTORY (12 visits) - FULL DETAILS                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Visit 1 - 2026-08-29                                                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Time: 09:00 - 10:30   Type: Routine                                │ │
│  │  Team: Dr. Smith (TeamLeader), Jane Doe (Nurse)                     │ │
│  │                                                                       │ │
│  │  General Condition:                                                   │ │
│  │    Overall Status: Stable                                            │ │
│  │    Mobility: Requires Assistance                                     │ │
│  │                                                                       │ │
│  │  Vital Signs:                                                         │ │
│  │    Temperature: 36.8°C   Pulse: 78 bpm   BP: 120/80 mmHg            │ │
│  │    Respiration: 18/min   SpO2: 97%                                  │ │
│  │                                                                       │ │
│  │  Pain Assessment:                                                     │ │
│  │    Pain Score: 3/10   Medication Effective: Yes                     │ │
│  │    Location: Back   Characteristics: Dull, Intermittent             │ │
│  │                                                                       │ │
│  │  Symptoms: Fatigue, Anxiety                                          │ │
│  │                                                                       │ │
│  │  Functional Status:                                                   │ │
│  │    ADL: Feeding (NeedsAssistance), Bathing (NeedsAssistance),        │ │
│  │         Dressing (Independent), Toileting (NeedsAssistance),         │ │
│  │         Mobility (NeedsAssistance)                                   │ │
│  │    PPS: 60   KPS: 60                                                 │ │
│  │                                                                       │ │
│  │  Nutrition & Hydration:                                               │ │
│  │    Appetite: Fair   Oral Intake: Reduced   Hydration: Adequate      │ │
│  │                                                                       │ │
│  │  Psychosocial:                                                        │ │
│  │    Emotional Status: Stable   Family Support: Good                   │ │
│  │    Financial Difficulty: No                                         │ │
│  │                                                                       │ │
│  │  Spiritual: Spiritual Needs: No   Religious Support: No              │ │
│  │                                                                       │ │
│  │  Medication Review:                                                   │ │
│  │    Medications Available: Yes   Correctly Taken: Yes                 │ │
│  │    Side Effects: No   Refill Needed: No                             │ │
│  │    Morphine Available: Yes   Adherence: Good                        │ │
│  │    Current Medications: Morphine 10mg Every 6h Oral                 │ │
│  │                                                                       │ │
│  │  Caregiver Assessment:                                                │ │
│  │    Burden: Moderate   Understanding: Good   Capacity: Moderate       │ │
│  │    Family Emotional Status: Stable                                   │ │
│  │                                                                       │ │
│  │  Education Provided: Pain Management, Medication Administration     │ │
│  │                                                                       │ │
│  │  Home Environment: Clean   Observations: Adequate Lighting,          │ │
│  │    Ventilation                                                        │ │
│  │                                                                       │ │
│  │  Nursing Care Given: Medication Admin, Counseling                    │ │
│  │                                                                       │ │
│  │  Red Flags: None                                                     │ │
│  │                                                                       │ │
│  │  Outcome: Stable                                                     │ │
│  │  Next Visit: 2026-09-05                                              │ │
│  │                                                                       │ │
│  │  Signatures:                                                          │ │
│  │    Team Leader: Dr. Smith   Physician: Dr. Kebede                   │ │
│  │    Nurse: Jane Doe                                                   │ │
│  │                                                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Visit 2 - 2026-08-22                                                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [Full details of visit 2...]                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All visits listed chronologically with FULL details]              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  MEDICATIONS (5 records) - FULL DETAILS                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Medication: Morphine                                               │ │
│  │    Dosage: 10mg   Frequency: Every 6 hours   Route: Oral            │ │
│  │    Status: Given   Administered At: Home                            │ │
│  │    Prescribed By: Dr. Smith   Prescribed: 2026-08-29                │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Medication: Oxycodone                                              │ │
│  │    Dosage: 5mg   Frequency: Every 8 hours   Route: Oral             │ │
│  │    Status: Given   Administered At: Home                            │ │
│  │    Prescribed By: Dr. Kebede   Prescribed: 2026-08-22               │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All medications listed with full details]                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  LABORATORY TESTS (8 records) - FULL DETAILS                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Test: Complete Blood Count                                          │ │
│  │    Date Ordered: 2026-08-29   Date Performed: 2026-08-30            │ │
│  │    Location: Home   Status: Completed                                │ │
│  │    Ordered By: Dr. Smith                                            │ │
│  │    Result: Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250        │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Test: Urinalysis                                                    │ │
│  │    Date Ordered: 2026-08-28   Date Performed: 2026-08-29            │ │
│  │    Location: Home   Status: Completed                                │ │
│  │    Ordered By: Dr. Kebede                                           │ │
│  │    Result: Abnormal - Protein: 2+, Blood: 1+                        │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All lab tests listed with full details]                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  REFERRALS (3 records) - FULL DETAILS                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Referral 1 - 2026-08-29                                             │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Type: Outgoing   Status: Accepted                                  │ │
│  │  Diagnosis: Stage IV Breast Cancer                                  │ │
│  │  Disease Stage: Advanced                                            │ │
│  │  PPS: 60   KPS: 60                                                  │ │
│  │  Symptoms: Pain: 3, Dyspnea: 2, Fatigue: 5, Anxiety: 2, Depression: 1│ │
│  │  Reasons: Pain Management, Symptom Control                          │ │
│  │  From: Home Care Unit   To: Yekatit 12 Hospital                    │ │
│  │  Contact: Dr. Alem (+251944444444)                                  │ │
│  │  Prepared By: Dr. Smith (Physician)                                │ │
│  │  Signature: Dr. Smith                                               │ │
│  │  Action Taken: Referral Accepted                                    │ │
│  │  Outcome: Patient transferred for inpatient care                    │ │
│  │  Follow-up: 2026-09-05 (Pending)                                   │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All referrals listed with full details]                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ADMISSIONS (2 records) - FULL DETAILS                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Admission 1 - 2026-08-30                                            │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Bed: B-12   Ward: Palliative Care Ward                            │ │
│  │  Admitting Physician: Dr. Kebede   Care Team: Team A               │ │
│  │  Status: Active                                                     │ │
│  │  Primary Diagnosis: Stage IV Breast Cancer                          │ │
│  │  Secondary Diagnoses: Metastatic to bone                            │ │
│  │  Disease Stage: Advanced   Prognosis: Months                        │ │
│  │  PPS: 60   Functional Status: Partially Dependent                   │ │
│  │  Pain: Score 4/10   Type: Mixed                                     │ │
│  │  Symptoms: Fatigue, Anxiety                                         │ │
│  │  Emotional Status: Anxious   Family Support: Moderate              │ │
│  │  Spiritual Concerns: No                                             │ │
│  │                                                                       │ │
│  │  Care Plan:                                                          │ │
│  │    Pain Management: Morphine 10mg every 6 hours                     │ │
│  │    Medication Plan: Continue current medications                     │ │
│  │    Nursing Care: Daily monitoring and pain assessment               │ │
│  │    Home-Based Care Required: No                                     │ │
│  │    Physiotherapy Required: No                                       │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  [All admissions listed with full details]                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Report Generated By: John Doe (Staff) on 2026-09-01                     │
│  This is a computer-generated document.                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Pages

### 7.1 PatientListPage

**Route:** `/patients`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Display list of patients

**Behavior:**

1. Uses `usePatients()` hook
2. Displays patient cards in grid
3. Search bar for filtering patients
4. Filter by status dropdown
5. Pagination controls
6. "Register New Patient" button

**Components:**

- `SearchBar`
- `StatusFilter`
- `PatientCard`
- `Pagination`
- `Button` (Register New Patient)

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards |
| Error | Error message with retry |
| Empty | Empty state with "Register New Patient" button |
| Success | Grid of patient cards |

---

### 7.2 PatientRegistrationPage

**Route:** `/patients/new`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Register new patient

**Behavior:**

1. Uses `useRegisterPatient()` mutation
2. React Hook Form with Zod validation
3. On success, navigates to patient detail
4. On error, displays validation errors

**Components:**

- `PatientForm`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 7.3 PatientDetailPage

**Route:** `/patients/:id`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View patient details

**Behavior:**

1. Uses `usePatient(id)` hook
2. Displays patient information
3. Tabs for different sections (Visits, Medications, Labs, Referrals, Admissions)
4. "View Summary" button
5. "Record Visit" button
6. "Order Medication" button
7. "Order Lab Test" button
8. "Request Referral" button
9. "Record Admission" button
10. "Print History" button
11. Back button

**Components:**

- `PatientDemographics`
- `PatientDiagnosis`
- `Tabs` (Visits, Medications, Labs, Referrals, Admissions)
- `ActionButtons`
- `PrintButton`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details with tabs |

---

### 7.4 PatientSummaryPage (UPDATED)

**Route:** `/patients/:id/summary`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View comprehensive patient summary with print functionality

**Behavior:**

1. Uses `usePatientSummary(id)` hook
2. Uses `usePatientProgress(id)` hook
3. Displays complete patient summary
4. Displays KPS/PPS progress graph
5. **Print/Export functionality available**

**Components:**

- `PatientSummary`
- `PatientProgressGraph`
- `PrintButton`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton summary |
| Error | Error message with retry |
| Success | Full patient summary with print button |

---

### 7.5 PatientProgressPage

**Route:** `/patients/:id/progress`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View KPS/PPS progress graphs

**Behavior:**

1. Uses `usePatientProgress(id)` hook
2. Displays KPS and PPS trend graphs
3. Shows trend analysis

**Components:**

- `PatientProgressGraph`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton graph |
| Error | Error message with retry |
| Empty | "No progress data available" |
| Success | Full progress graphs |

---

### 7.6 PatientPrintPage (NEW)

**Route:** `/patients/:id/print`

**Layout:** `PrintLayout`

**Guard:** `ProtectedRoute` (staff, admin)

**Purpose:** Dedicated print-friendly view for patient history with full visit details

**Behavior:**

1. Uses `usePatientPrint(id)` hook to fetch formatted print data
2. Displays print-optimized layout with ALL patient records and FULL details
3. Automatically triggers print dialog on load
4. Includes institution header (Yekatit 12 Hospital Medical College)
5. Shows ALL sections with FULL data:
   - **Patient Demographics:** All fields
   - **KPS/PPS Progress Graph:** Visual trends
   - **Visits:** FULL details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures)
   - **Medications:** Complete details
   - **Laboratory Tests:** Full details
   - **Referrals:** Complete details including prepared by, signature, action taken
   - **Admissions:** Full details including care plans
6. Shows generated timestamp and user info

**Components:**

- `PatientPrintView`

**States:**

| State | UI |
|---|---|
| Loading | "Loading patient data..." |
| Error | Error message with retry |
| Success | Full print view with auto-print |

---

## 8. Page Implementations

### PatientListPage

```typescript
// src/pages/staff/PatientListPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { PatientCard } from '@/components/patients/PatientCard';
import { SearchBar } from '@/components/common/SearchBar';
import { StatusFilter } from '@/components/common/StatusFilter';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'Active' | 'Discharged' | undefined>(undefined);
  const limit = 12;

  const { data, isLoading, error, refetch } = usePatients({ page, limit, search, status });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Patients</h1>
          <Button onClick={() => navigate('/patients/new')}>Register New Patient</Button>
        </div>
        <EmptyState
          title="No patients found"
          description="Start by registering your first patient."
          actionLabel="Register Patient"
          onAction={() => navigate('/patients/new')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button onClick={() => navigate('/patients/new')}>Register New Patient</Button>
      </div>

      <div className="flex gap-4">
        <SearchBar
          placeholder="Search patients..."
          value={search}
          onChange={setSearch}
        />
        <StatusFilter
          value={status}
          onChange={setStatus}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Discharged', label: 'Discharged' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={(id) => navigate(`/patients/${id}`)}
          />
        ))}
      </div>

      <Pagination
        page={page}
        total={data.total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### PatientRegistrationPage

```typescript
// src/pages/staff/PatientRegistrationPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterPatient } from '@/hooks/usePatients';
import { PatientForm } from '@/components/patients/PatientForm';
import { createPatientSchema, CreatePatientFormData } from '@/schemas/patient.schema';

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterPatient();

  const form = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      sex: 'Female',
      diseaseStage: 'Early',
      estimatedPrognosis: 'Months',
    },
  });

  const onSubmit = (data: CreatePatientFormData) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        navigate(`/patients/${response.id}`);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Register New Patient</h1>
      <PatientForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={registerMutation.isPending}
        error={registerMutation.error}
      />
    </div>
  );
};
```

### PatientSummaryPage (UPDATED)

```typescript
// src/pages/staff/PatientSummaryPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientSummary, usePatientProgress } from '@/hooks/usePatients';
import { PatientSummary } from '@/components/patients/PatientSummary';
import { PatientProgressGraph } from '@/components/patients/PatientProgressGraph';
import { PrintButton } from '@/components/common/PrintButton';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const PatientSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = usePatientSummary(patientId);
  const { data: progress, isLoading: progressLoading } = usePatientProgress(patientId);

  if (summaryLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  if (summaryError || !summary) {
    return <ErrorState onRetry={refetchSummary} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Patient Summary: {summary.patient.firstName} {summary.patient.lastName}
        </h1>
        <div className="flex gap-2">
          <PrintButton
            patientId={patientId}
            patientName={`${summary.patient.firstName} ${summary.patient.lastName}`}
          />
          <Button variant="outline" onClick={() => navigate(`/patients/${patientId}`)}>
            Back
          </Button>
        </div>
      </div>

      <PatientSummary summary={summary} />

      {progress && progress.visits.length > 0 && (
        <PatientProgressGraph
          patientName={progress.patientName}
          data={progress.visits}
          trends={progress.trends}
        />
      )}
    </div>
  );
};
```

### PatientPrintPage (NEW)

```typescript
// src/pages/staff/PatientPrintPage.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientPrint } from '@/hooks/usePatients';
import { PatientPrintView } from '@/components/patients/PatientPrintView';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const PatientPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data, isLoading, error, refetch } = usePatientPrint(patientId);

  // Auto-trigger print dialog when data is loaded
  useEffect(() => {
    if (data && !isLoading) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-4 text-muted-foreground">Loading patient data...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return <PatientPrintView data={data} />;
};
```

---

## 9. Form Validation Schema

```typescript
// src/schemas/patient.schema.ts

import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z.number().min(1, 'Age must be greater than 0').max(150, 'Invalid age'),
  sex: z.enum(['Male', 'Female']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  caregiverName: z.string().min(1, 'Caregiver name is required'),
  caregiverPhone: z.string().min(10, 'Caregiver phone is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional(),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
  comorbidities: z.array(z.string()).optional(),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
```

---

## 10. Route Configuration

```typescript
// src/routes/index.tsx (patient section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients', 
          element: withSuspense(PatientListPage) 
        },
        { 
          path: '/patients/new', 
          element: withSuspense(PatientRegistrationPage) 
        },
        { 
          path: '/patients/:id', 
          element: withSuspense(PatientDetailPage) 
        },
        { 
          path: '/patients/:id/summary', 
          element: withSuspense(PatientSummaryPage) 
        },
        { 
          path: '/patients/:id/progress', 
          element: withSuspense(PatientProgressPage) 
        },
      ],
    },
    // Print route uses minimal layout
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <PrintLayout />,
          children: [
            { 
              path: '/patients/:id/print', 
              element: withSuspense(PatientPrintPage) 
            },
          ],
        },
      ],
    },
  ],
}
```

---

## 11. Print Styles (Global)

```css
/* src/styles/print.css */

@media print {
  /* Hide non-print elements */
  .no-print {
    display: none !important;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 20mm;
  }

  /* Ensure all content is visible */
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
  }

  /* Preserve colors in print */
  .print-color {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* Card styling in print */
  .print-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  /* Header styling */
  .print-header {
    text-align: center;
    border-bottom: 2px solid #002395;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .print-header h1 {
    color: #002395;
    font-size: 20pt;
    margin: 0;
  }

  .print-header .subtitle {
    font-size: 12pt;
    color: #555;
  }

  /* Section styling */
  .print-section {
    margin-bottom: 16px;
  }

  .print-section h2 {
    font-size: 14pt;
    color: #002395;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }

  /* Footer */
  .print-footer {
    text-align: center;
    font-size: 10pt;
    color: #888;
    border-top: 1px solid #ddd;
    padding-top: 12px;
    margin-top: 20px;
  }
}
```

---

## 12. Flow Diagram (UPDATED)

```
+-----------------------------------------------------------+
|                    PATIENT FLOW (FRONTEND)                 |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                 | |
|  |                                                     | |
|  |  Staff -> /patients/new -> PatientRegistrationPage  | |
|  |                    -> useRegisterPatient()           | |
|  |                    -> POST /patients                 | |
|  |                    -> Success -> /patients/:id       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST FLOW                         | |
|  |                                                     | |
|  |  Staff -> /patients -> PatientListPage              | |
|  |                    -> usePatients()                  | |
|  |                    -> GET /patients                  | |
|  |                    -> Display patient cards          | |
|  |                    -> Search and filter              | |
|  |                    -> Pagination                     | |
|  |                    -> Click patient -> /patients/:id | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |                    -> usePatient(id)                 | |
|  |                    -> GET /patients/:id              | |
|  |                    -> Display patient details        | |
|  |                    -> Action buttons                 | |
|  |                    -> View Summary                   | |
|  |                    -> Record Visit                   | |
|  |                    -> Order Medication               | |
|  |                    -> Order Lab Test                 | |
|  |                    -> Request Referral               | |
|  |                    -> Record Admission               | |
|  |                    -> Print History                  | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SUMMARY FLOW (UPDATED)            | |
|  |                                                     | |
|  |  Staff -> /patients/:id/summary -> PatientSummaryPage| |
|  |                    -> usePatientSummary(id)          | |
|  |                    -> GET /patients/:id/summary      | |
|  |                    -> Display comprehensive summary  | |
|  |                    -> Display KPS/PPS progress       | |
|  |                    -> Print button -> /print         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PRINT FLOW (NEW)                  | |
|  |                                                     | |
|  |  User clicks Print button -> /patients/:id/print    | |
|  |                    -> PatientPrintPage               | |
|  |                    -> usePatientPrint(id)            | |
|  |                    -> GET /patients/:id/print        | |
|  |                    -> Display print-optimized view   | |
|  |                    -> Auto-trigger window.print()    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PROGRESS FLOW                     | |
|  |                                                     | |
|  |  Staff -> /patients/:id/progress -> PatientProgressPage| |
|  |                    -> usePatientProgress(id)         | |
|  |                    -> GET /patients/:id/progress     | |
|  |                    -> Display KPS/PPS graphs         | |
|  |                    -> Trend analysis                 | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```