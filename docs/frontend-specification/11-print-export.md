# frontend-specification/11-print-export.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND PRINT/EXPORT SPECIFICATION

## 1. Overview

This document defines the frontend implementation for printing and exporting patient history data. Both Staff and Admin users can print patient records with ALL data and FULL visit details in a professionally formatted document.

**API Reference:** `api/03-patients.md`, `api/02-admin.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/print` | `PatientPrintPage` | `PrintLayout` | Staff, Admin |
| `/admin/patients/:id/print` | `AdminPatientPrintPage` | `PrintLayout` | Admin |

---

## 3. Types

```typescript
// src/types/print.types.ts

export interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export interface PrintLayoutProps {
  children: React.ReactNode;
}

// ============================================
// PRINT DATA TYPES (Shared between Staff and Admin)
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
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: string;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
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
  visitId?: string;
  admissionId?: string;
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
  visitId?: string;
  admissionId?: string;
  createdAt: string;
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
  createdAt: string;
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
    data: Array<{ visitId: string; visitDate: string; kpsScore: number; ppsScore: number }>;
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
// src/api/patients.ts (Staff Print)

import api from './client';
import { PatientPrintData } from '@/types/print.types';

export const patientApi = {
  // ... existing methods

  /**
   * Get patient data formatted for print
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

```typescript
// src/api/admin.ts (Admin Print)

import api from './client';
import { AdminPrintData } from '@/types/admin.types';

export const adminApi = {
  // ... existing methods

  /**
   * Get patient data formatted for print (admin version)
   * GET /admin/patients/:patientId/print
   */
  getPatientPrintData: (patientId: string): Promise<AdminPrintData> => {
    return api.get<AdminPrintData>(`/admin/patients/${patientId}/print`).then((res) => res.data);
  },

  /**
   * Export patient history as PDF (admin version)
   * GET /admin/patients/:patientId/export
   */
  exportPatientPDF: (patientId: string): Promise<Blob> => {
    return api.get(`/admin/patients/${patientId}/export`, { responseType: 'blob' }).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/usePatients.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { patientApi } from '@/api/patients';
import { PatientPrintData } from '@/types/print.types';

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
```

```typescript
// src/hooks/useAdmin.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { AdminPrintData } from '@/types/admin.types';

/**
 * Get patient data formatted for print (admin version)
 */
export function useAdminPatientPrint(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId, 'print'],
    queryFn: () => adminApi.getPatientPrintData(patientId),
    enabled: !!patientId,
  });
}

/**
 * Export patient history as PDF (admin version)
 */
export function useExportPatientPDF() {
  return useMutation({
    mutationFn: (patientId: string) => adminApi.exportPatientPDF(patientId),
  });
}
```

---

## 6. Components

### 6.1 PrintButton

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
- Shows loading state while preparing data
- Available to both Staff and Admin

**Visual Design:**

```
+-----------------------------------------------------------+
|  [🖨️] Print Patient History                                |
|  or                                                         |
|  [📄] Export PDF                                            |
+-----------------------------------------------------------+
```

**Implementation:**

```typescript
// src/components/common/PrintButton.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  patientId: string;
  patientName: string;
  variant?: 'button' | 'icon';
  label?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  patientId,
  patientName,
  variant = 'button',
  label = 'Print Patient History',
  onPrintStart,
  onPrintComplete,
}) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    onPrintStart?.();
    navigate(`/patients/${patientId}/print`);
    onPrintComplete?.();
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrint}
        title={label}
        className="no-print"
      >
        <Printer className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="no-print"
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};
```

---

### 6.2 PrintLayout

**Purpose:** Minimal layout for print views

**Props:**

```typescript
interface PrintLayoutProps {
  children: React.ReactNode;
}
```

**Behavior:**
- Removes all navigation, sidebars, and interactive elements
- Sets white background
- Applies print-specific styles
- Uses minimal padding for print formatting

**Implementation:**

```typescript
// src/components/layouts/PrintLayout.tsx

import React from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ children }) => {
  return (
    <div className="print-layout min-h-screen bg-white p-8">
      {children}
    </div>
  );
};
```

---

### 6.3 PatientPrintView

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
- Uses `print-color` and `print-bg` classes for color preservation

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

### 7.1 PatientPrintPage (Staff)

**Route:** `/patients/:id/print`

**Layout:** `PrintLayout`

**Guard:** `ProtectedRoute` (staff, admin)

**Purpose:** Dedicated print-friendly view for patient history

**Behavior:**

1. Uses `usePatientPrint(id)` hook to fetch formatted print data
2. Displays print-optimized layout with ALL patient records and FULL details
3. Automatically triggers print dialog on load
4. Includes institution header (Yekatit 12 Hospital Medical College)
5. Shows ALL sections with FULL data:
   - Patient Demographics: All fields
   - KPS/PPS Progress Graph: Visual trends
   - Visits: FULL details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures)
   - Medications: Complete details
   - Laboratory Tests: Full details
   - Referrals: Complete details including prepared by, signature, action taken
   - Admissions: Full details including care plans
6. Shows generated timestamp and user info

**Components:**

- `PatientPrintView`

**States:**

| State | UI |
|---|---|
| Loading | "Loading patient data..." with spinner |
| Error | Error message with retry |
| Success | Full print view with auto-print |

**Implementation:**

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

### 7.2 AdminPatientPrintPage (Admin)

**Route:** `/admin/patients/:patientId/print`

**Layout:** `PrintLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** Dedicated print-friendly view for admin patient history

**Behavior:**

1. Uses `useAdminPatientPrint(patientId)` hook
2. Same display as staff version but with admin context
3. May include additional admin-specific fields (e.g., edit history, audit trail)
4. Auto-triggers print on load

---

## 8. Print Styles

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
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* Preserve colors in print */
  .print-color {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Preserve background colors */
  .print-bg {
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
    border: 1px solid #e5e7eb;
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
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }

  .print-section h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #1f2937;
    margin: 6px 0;
  }

  /* Field labels */
  .print-label {
    font-weight: 600;
    color: #4b5563;
  }

  /* Data table styling */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }

  .print-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  .print-table td {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  /* Status badges */
  .print-badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 9pt;
    font-weight: 500;
  }

  .print-badge-active {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-discharged {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .print-badge-ordered {
    background-color: #fef3c7;
    color: #92400e;
  }

  .print-badge-given {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-pending {
    background-color: #fef3c7;
    color: #92400e;
  }

  .print-badge-accepted {
    background-color: #d1fae5;
    color: #065f46;
  }

  .print-badge-declined {
    background-color: #fce4ec;
    color: #b71c1c;
  }

  /* Footer */
  .print-footer {
    text-align: center;
    font-size: 9pt;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 20px;
  }

  /* Force page breaks */
  .page-break {
    page-break-before: always;
  }

  /* Graph container */
  .print-graph {
    width: 100%;
    max-width: 100%;
    margin: 8px 0;
  }

  /* Avoid breaking inside */
  .print-avoid-break {
    page-break-inside: avoid;
  }
}
```

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                    PRINT FLOW (FRONTEND)                   |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    USER ACTION                       | |
|  |                                                     | |
|  |  User clicks Print button on patient detail or      | |
|  |  summary page                                       | |
|  |         ↓                                           | |
|  |  PrintButton component handles click                | |
|  |         ↓                                           | |
|  |  Navigate to /patients/:id/print                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DATA FETCHING                     | |
|  |                                                     | |
|  |  PatientPrintPage component mounts                  | |
|  |         ↓                                           | |
|  |  usePatientPrint(id) hook                          | |
|  |         ↓                                           | |
|  |  GET /patients/:id/print                           | |
|  |         ↓                                           | |
|  |  Returns PatientPrintData with ALL records         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    RENDER PRINT VIEW                 | |
|  |                                                     | |
|  |  PatientPrintView renders:                         | |
|  |    - Institution header                            | |
|  |    - Patient demographics                          | |
|  |    - KPS/PPS progress graph                        | |
|  |    - Visits (FULL details)                         | |
|  |    - Medications (FULL details)                    | |
|  |    - Lab tests (FULL details)                      | |
|  |    - Referrals (FULL details)                      | |
|  |    - Admissions (FULL details)                     | |
|  |    - Generated timestamp and user info             | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    AUTO-PRINT                       | |
|  |                                                     | |
|  |  useEffect triggers window.print()                 | |
|  |         ↓                                           | |
|  |  Browser print dialog opens                         | |
|  |         ↓                                           | |
|  |  User selects "Save as PDF" or "Print"             | |
|  |         ↓                                           | |
|  |  PDF generated with ALL data and FULL details      | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
