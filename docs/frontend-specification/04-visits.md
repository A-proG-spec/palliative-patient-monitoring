# frontend-specification/04-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND VISITS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for home visit features including recording home visits and viewing visit history.

**API Reference:** `api/04-visits.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits/:visitId` | `VisitDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/visit.types.ts

export interface HomeVisit {
  id: string;
  patientId: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: { role: string; name: string }[];
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
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
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
  currentMedications: { name: string; dosage: string; frequency: string; route: string }[];
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
  createdAt: string;
}

export interface CreateVisitRequest {
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: { role: string; name: string }[];
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
  currentMedications?: { name: string; dosage: string; frequency: string; route: string }[];
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

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 4. API Calls

```typescript
// src/api/visits.ts

import api from './client';
import { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  /**
   * Record home visit
   * POST /patients/:patientId/visits
   */
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    return api.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((res) => res.data);
  },

  /**
   * Get all visits for a patient
   * GET /patients/:patientId/visits
   */
  getByPatient: (patientId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<VisitListResponse> => {
    return api.get<VisitListResponse>(`/patients/${patientId}/visits`, { params }).then((res) => res.data);
  },

  /**
   * Get visit details
   * GET /patients/:patientId/visits/:visitId
   */
  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    return api.get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useVisits.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '@/api/visits';
import { CreateVisitRequest } from '@/types/visit.types';

/**
 * Get all visits for a patient
 */
export function usePatientVisits(patientId: string, params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', params],
    queryFn: () => visitApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

/**
 * Get visit details
 */
export function useVisitDetail(patientId: string, visitId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', visitId],
    queryFn: () => visitApi.getById(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
}

/**
 * Record home visit
 */
export function useRecordVisit(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress'] });
    },
  });
}
```

---

## 6. Components

### 6.1 VisitForm

**Purpose:** Form for recording home visits

**Props:**

```typescript
interface VisitFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateVisitRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateVisitRequest>;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Record Home Visit - Sarah Johnson                          |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Visit Details                                          | |
| | +---------------------------------------------------+ | |
| | | Date: [__/__/____]  Start: [__:__]  End: [__:__]   | | |
| | | Type: [Routine/Emergency/FirstAssessment/...]      | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Team Members                                           | |
| | +---------------------------------------------------+ | |
| | | Role: [TeamLeader/Physician/Nurse] Name: [_______] | | |
| | | [Add Member]                                       | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Patient General Condition                             | | |
| | +---------------------------------------------------+ | |
| | | Status: [Stable/Deteriorating/Critical/BedBound]   | | |
| | | Mobility: [Ambulatory/RequiresAssistance/Bedridden]| | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Vital Signs                                           | | |
| | +---------------------------------------------------+ | |
| | | Temp: [___]C  Pulse: [___]  BP: [___]             | | |
| | | Resp: [___]  SpO2: [___]%                         | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Pain Assessment                                       | | |
| | +---------------------------------------------------+ | |
| | | Pain Score: [0-10]  Effective: [Yes/No]           | | |
| | | Location: [Head/Neck/Chest/Abdomen/Back/Limbs]    | | |
| | | Characteristics: [Sharp/Dull/Burning/...]         | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Symptoms                                              | | |
| | +---------------------------------------------------+ | |
| | | [ ] Dyspnea  [ ] Nausea  [ ] Constipation         | | |
| | | [ ] Anxiety  [ ] Fatigue  [ ] Poor Appetite       | | |
| | | [ ] Pressure Sores  [ ] Other: ______            | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Functional Status                                     | | |
| | +---------------------------------------------------+ | |
| | | ADL: Feeding [Ind/Assist/Dependent]               | | |
| | |      Bathing [Ind/Assist/Dependent]               | | |
| | |      Dressing [Ind/Assist/Dependent]              | | |
| | |      Toileting [Ind/Assist/Dependent]             | | |
| | |      Mobility [Ind/Assist/Dependent]              | | |
| | | PPS Score: [0-100]  KPS Score: [0-100]            | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Nutrition & Hydration                                 | | |
| | +---------------------------------------------------+ | |
| | | Appetite: [Good/Fair/Poor/UnableToEat]            | | |
| | | Oral Intake: [Adequate/Reduced/Minimal]           | | |
| | | Hydration: [Adequate/Mild/Severe Dehydration]     | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Psychosocial Assessment                               | | |
| | +---------------------------------------------------+ | |
| | | Emotional Status: [Stable/Anxious/Depressed/...]  | | |
| | | Family Support: [Excellent/Good/Limited/None]     | | |
| | | Financial Difficulty: [Yes/No]                    | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Spiritual Assessment                                  | | |
| | +---------------------------------------------------+ | |
| | | Spiritual Needs: [Yes/No]                         | | |
| | | Religious Support: [Yes/No]                       | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Medication Review                                     | | |
| | +---------------------------------------------------+ | |
| | | Medications Available: [Yes/No]                   | | |
| | | Correctly Taken: [Yes/No]                         | | |
| | | Side Effects: [Yes/No]                            | | |
| | | Refill Needed: [Yes/No]                           | | |
| | | Morphine Available: [Yes/No/N/A]                  | | |
| | | Adherence: [Good/Partial/Poor]                    | | |
| | | Current Medications:                              | | |
| | |   [Medication 1] [Dosage] [Frequency] [Route]    | | |
| | |   [Medication 2] [Dosage] [Frequency] [Route]    | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Caregiver Assessment                                  | | |
| | +---------------------------------------------------+ | |
| | | Caregiver Burden: [Low/Moderate/High]             | | |
| | | Understanding: [Good/Fair/Poor]                   | | |
| | | Capacity: [Strong/Moderate/Weak]                  | | |
| | | Family Emotional Status: [Stable/Stressed/...]    | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Education Provided                                    | | |
| | +---------------------------------------------------+ | |
| | | [ ] Medication Admin  [ ] Pain Management         | | |
| | | [ ] Nutrition Support  [ ] Skin Care              | | |
| | | [ ] Pressure Sore Prevention  [ ] End-of-Life     | | |
| | | [ ] Emergency Signs  [ ] Emotional Support        | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Home Environment                                      | | |
| | +---------------------------------------------------+ | |
| | | Condition: [Clean/Fair/Poor]                      | | |
| | | [ ] Adequate Lighting  [ ] Ventilation            | | |
| | | [ ] Safe Bed  [ ] Clean Water  [ ] Sanitation     | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Nursing Care Provided                                 | | |
| | +---------------------------------------------------+ | |
| | | [ ] Hygiene  [ ] Wound Care  [ ] Medication Admin | | |
| | | [ ] Position Change  [ ] Feeding  [ ] Counseling  | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Red Flag Assessment                                   | | |
| | +---------------------------------------------------+ | |
| | | [ ] Severe Uncontrolled Pain                      | | |
| | | [ ] Severe Shortness of Breath                    | | |
| | | [ ] Massive Bleeding                              | | |
| | | [ ] Uncontrolled Seizures                         | | |
| | | [ ] Altered Mental Status                         | | |
| | | [ ] Severe Dehydration                            | | |
| | | [ ] None                                          | | |
| | | Action Taken: [________________________]           | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Referrals Made                                        | | |
| | +---------------------------------------------------+ | |
| | | [ ] Physician Review  [ ] Hospital Admission      | | |
| | | [ ] Social Worker  [ ] Psychologist               | | |
| | | [ ] Spiritual Care  [ ] Nutrition Support         | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Outcome & Follow-up                                   | | |
| | +---------------------------------------------------+ | |
| | | Outcome: [Stable/Improved/Unchanged/Worsened/...]  | | |
| | | Next Visit: [__/__/____]                          | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Team Signatures                                       | | |
| | +---------------------------------------------------+ | |
| | | Team Leader: [________] Signature: [________]     | | |
| | | Physician: [________] Signature: [________]       | | |
| | | Nurse: [________] Signature: [________]           | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                          [Cancel] [Save Visit]       | | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 VisitList

**Purpose:** Display list of visits for a patient

**Props:**

```typescript
interface VisitListProps {
  visits: HomeVisit[];
  patientId: string;
  loading?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Visit History                                              |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date       | Type        | Status     | Outcome  | Staff| |
| +------------+-------------+------------+----------+------+ |
| | 2026-08-29 | Routine     | Stable     | Stable   | Jane | |
| |            |             |            |          | Doe  | |
| | 2026-08-22 | Emergency   | Critical   | Referred | John | |
| |            |             |            | to       | Smith| |
| |            |             |            | Facility |      | |
| | 2026-08-15 | First       | Stable     | Stable   | Jane | |
| |            | Assessment  |            |          | Doe  | |
| +------------+-------------+------------+----------+------+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.3 VisitDetail

**Purpose:** Display detailed visit information

**Props:**

```typescript
interface VisitDetailProps {
  visit: HomeVisit;
  loading?: boolean;
  onBack?: () => void;
}
```

---

## 7. Pages

### 7.1 RecordVisitPage

**Route:** `/patients/:id/visits`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a home visit

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useRecordVisit(id)` mutation
3. React Hook Form with Zod validation
4. On success, navigates back to patient detail
5. On error, displays validation errors

**Components:**

- `VisitForm`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 7.2 VisitDetailPage

**Route:** `/patients/:id/visits/:visitId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View visit details

**Behavior:**

1. Uses `useVisitDetail(id, visitId)` hook
2. Displays complete visit information
3. Back button to patient detail

**Components:**

- `VisitDetail`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full visit details |

---

## 8. Form Validation Schema

```typescript
// src/schemas/visit.schema.ts

import { z } from 'zod';

export const createVisitSchema = z.object({
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']),
  teamMembers: z.array(z.object({
    role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
    name: z.string().min(1, 'Name is required'),
  })).min(1, 'At least one team member is required'),
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),
  vitals: z.object({
    temperature: z.number().optional(),
    pulse: z.number().optional(),
    bp: z.string().optional(),
    respiration: z.number().optional(),
    spo2: z.number().optional(),
  }).optional(),
  painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10'),
  painLocation: z.array(z.string()).optional(),
  painCharacteristics: z.array(z.string()).optional(),
  painMedicationEffective: z.boolean(),
  symptoms: z.array(z.string()).optional(),
  adl: z.object({
    feeding: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    bathing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    dressing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    toileting: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    mobility: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
  }),
  ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
  kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100'),
  appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
  oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
  hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
  familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
  financialDifficulty: z.boolean(),
  spiritualNeeds: z.boolean(),
  religiousSupportRequested: z.boolean(),
  medicationAvailable: z.boolean(),
  medicationCorrectlyTaken: z.boolean(),
  medicationSideEffects: z.boolean(),
  medicationRefillNeeded: z.boolean(),
  morphineAvailable: z.boolean(),
  adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
  currentMedications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    route: z.string(),
  })).optional(),
  caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
  caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
  caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
  familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),
  educationProvided: z.array(z.string()).optional(),
  homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
  homeObservations: z.array(z.string()).optional(),
  nursingCareGiven: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  redFlagActions: z.string().optional(),
  referralsMade: z.array(z.string()).optional(),
  outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']),
  nextVisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  physicianId: z.string().min(1, 'Physician is required'),
  nurseId: z.string().min(1, 'Nurse is required'),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
```

---

## 9. Route Configuration

```typescript
// src/routes/index.tsx (visits section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/visits', 
          element: withSuspense(RecordVisitPage) 
        },
        { 
          path: '/patients/:id/visits/:visitId', 
          element: withSuspense(VisitDetailPage) 
        },
      ],
    },
  ],
}
```

---

## 10. Flow Diagram

```
+-----------------------------------------------------------+
|                    VISITS FLOW (FRONTEND)                  |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD VISIT FLOW                 | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits -> RecordVisitPage   | |
|  |                    -> usePatient(id)                 | |
|  |                    -> Get patient name               | |
|  |                    -> Fill form                      | |
|  |                    -> Submit -> useRecordVisit()     | |
|  |                    -> POST /patients/:id/visits      | |
|  |                    -> Success -> /patients/:id       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW VISIT FLOW                   | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits/:visitId             | |
|  |                    -> VisitDetailPage                | |
|  |                    -> useVisitDetail(id, visitId)    | |
|  |                    -> GET /patients/:id/visits/:id   | |
|  |                    -> Display full visit details     | |
|  |                    -> Back to patient                | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
