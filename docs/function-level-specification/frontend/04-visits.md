# function-level-specification/frontend/04-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: VISITS

## 1. Overview

This document defines the function-level specification for frontend home visit features including recording home visits and viewing visit history.

**Files Covered:**
- `src/api/visits.ts`
- `src/hooks/useVisits.ts`
- `src/components/visits/VisitForm.tsx`
- `src/components/visits/VisitList.tsx`
- `src/components/visits/VisitDetail.tsx`
- `src/pages/staff/RecordVisitPage.tsx`
- `src/pages/staff/VisitDetailPage.tsx`

---

## 2. API Layer

### src/api/visits.ts

| Function | Signature | Purpose |
|---|---|---|
| create | `(patientId: string, data: CreateVisitRequest): Promise<HomeVisit>` | POST /patients/:patientId/visits |
| getByPatient | `(patientId: string, params?: { page?: number; limit?: number }): Promise<VisitListResponse>` | GET /patients/:patientId/visits |
| getById | `(patientId: string, visitId: string): Promise<HomeVisit>` | GET /patients/:patientId/visits/:visitId |

**Implementation:**

```typescript
import api from './client';
import { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    return api.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((res) => res.data);
  },

  getByPatient: (patientId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<VisitListResponse> => {
    return api.get<VisitListResponse>(`/patients/${patientId}/visits`, { params }).then((res) => res.data);
  },

  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    return api.get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useVisits.ts

#### usePatientVisits

| Field | Detail |
|---|---|
| Signature | `usePatientVisits(patientId: string, params?: { page?: number; limit?: number }): UseQueryResult<VisitListResponse>` |
| Query Key | `['patients', patientId, 'visits', params]` |
| Purpose | Get all visits for a patient with pagination |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No visits -> items: [] |

**Implementation:**

```typescript
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
```

---

#### useVisitDetail

| Field | Detail |
|---|---|
| Signature | `useVisitDetail(patientId: string, visitId: string): UseQueryResult<HomeVisit>` |
| Query Key | `['patients', patientId, 'visits', visitId]` |
| Purpose | Get detailed visit information |
| Auth | Staff, Admin |
| Enabled | `!!patientId && !!visitId` |
| Edge Cases | Visit not found -> 404 error |

**Implementation:**

```typescript
export function useVisitDetail(patientId: string, visitId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', visitId],
    queryFn: () => visitApi.getById(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
}
```

---

#### useRecordVisit

| Field | Detail |
|---|---|
| Signature | `useRecordVisit(patientId: string): UseMutationResult<HomeVisit, AxiosError, CreateVisitRequest>` |
| Purpose | Record a home visit |
| Side Effects | Invalidates visits, summary, progress queries |
| Auth | Staff |

**Implementation:**

```typescript
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

## 4. Components

### 4.1 VisitForm

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

**Validation Schema:**

```typescript
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
```

**Behavior:**
- React Hook Form with Zod validation
- All fields validated client-side
- Dynamic team member addition/removal
- Submit button disabled when submitting
- Shows field-level errors

---

### 4.2 VisitList

**Purpose:** Display list of visits for a patient

**Props:**

```typescript
interface VisitListProps {
  visits: HomeVisit[];
  loading?: boolean;
  onViewDetail?: (id: string) => void;
}
```

**Behavior:**
- Renders table of visits
- Columns: Date, Type, Status, Outcome, Staff
- Click row to view details
- Shows loading skeleton
- Shows empty state

---

### 4.3 VisitDetail

**Purpose:** Display detailed visit information

**Props:**

```typescript
interface VisitDetailProps {
  visit: HomeVisit;
  loading?: boolean;
  onBack?: () => void;
}
```

**Behavior:**
- Renders all visit sections:
  - Visit Details (date, time, type, team)
  - Patient Condition
  - Vital Signs
  - Pain Assessment
  - Symptoms
  - Functional Status
  - Nutrition & Hydration
  - Psychosocial Assessment
  - Spiritual Assessment
  - Medication Review
  - Caregiver Assessment
  - Education Provided
  - Home Environment
  - Nursing Care Given
  - Red Flags
  - Referrals Made
  - Outcome & Follow-up
  - Team Signatures

---

## 5. Pages

### 5.1 RecordVisitPage

**Route:** `/patients/:id/visits`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a home visit

**Local State:** React Hook Form

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useRecordVisit(id)` mutation
3. React Hook Form with Zod validation
4. On success, navigates back to patient detail
5. On error, displays validation errors

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

**Implementation:**

```typescript
export const RecordVisitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const recordMutation = useRecordVisit(patientId);

  const form = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      timeStarted: '09:00',
      timeEnded: '10:00',
      visitType: 'Routine',
      teamMembers: [{ role: 'TeamLeader', name: '' }],
      overallStatus: 'Stable',
      mobility: 'Ambulatory',
      painScore: 0,
      painMedicationEffective: false,
      ppsScore: 100,
      kpsScore: 100,
      appetite: 'Good',
      oralIntake: 'Adequate',
      hydrationStatus: 'Adequate',
      emotionalStatus: 'Stable',
      familySupport: 'Good',
      financialDifficulty: false,
      spiritualNeeds: false,
      religiousSupportRequested: false,
      medicationAvailable: false,
      medicationCorrectlyTaken: false,
      medicationSideEffects: false,
      medicationRefillNeeded: false,
      morphineAvailable: false,
      adherenceLevel: 'Good',
      caregiverBurden: 'Low',
      caregiverUnderstanding: 'Good',
      caregivingCapacity: 'Strong',
      familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
      teamLeaderId: '',
      physicianId: '',
      nurseId: '',
    },
  });

  const onSubmit = (data: CreateVisitFormData) => {
    recordMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/patients/${patientId}`);
      },
    });
  };

  // Render logic
};
```

---

### 5.2 VisitDetailPage

**Route:** `/patients/:id/visits/:visitId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View visit details

**Behavior:**

1. Uses `useVisitDetail(id, visitId)` hook
2. Displays complete visit information
3. Back button to patient detail

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full visit details |

---

## 6. Flow Diagram

```
+-----------------------------------------------------------+
|                  VISITS FLOW (FRONTEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD VISIT FLOW                 | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits -> RecordVisitPage   | |
|  |         -> usePatient(id)                           | |
|  |         -> Get patient name                         | |
|  |         -> Fill form                                | |
|  |         -> Submit -> useRecordVisit()               | |
|  |         -> POST /patients/:id/visits                | |
|  |         -> Success -> /patients/:id                 | |
|  |         -> Error -> Display validation errors       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW VISIT FLOW                   | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits/:visitId             | |
|  |         -> useVisitDetail(id, visitId)              | |
|  |         -> GET /patients/:id/visits/:id             | |
|  |         -> Display full visit details               | |
|  |         -> Back to patient                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
