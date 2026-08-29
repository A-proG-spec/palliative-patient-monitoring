# function-level-specification/frontend/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: HOSPITAL ADMISSIONS

## 1. Overview

This document defines the function-level specification for frontend hospital admission management features including recording admissions, viewing admission history, and discharging patients.

**Files Covered:**
- `src/api/admissions.ts`
- `src/hooks/useAdmissions.ts`
- `src/components/admissions/AdmissionForm.tsx`
- `src/components/admissions/AdmissionList.tsx`
- `src/components/admissions/AdmissionCard.tsx`
- `src/components/admissions/AdmissionDetail.tsx`
- `src/components/admissions/DischargeModal.tsx`
- `src/pages/staff/RecordAdmissionPage.tsx`
- `src/pages/staff/AdmissionListPage.tsx`
- `src/pages/staff/AdmissionDetailPage.tsx`

---

## 2. API Layer

### src/api/admissions.ts

| Function | Signature | Purpose |
|---|---|---|
| create | `(patientId: string, data: CreateAdmissionRequest): Promise<HospitalAdmission>` | POST /patients/:patientId/admissions |
| getByPatient | `(patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<AdmissionListResponse>` | GET /patients/:patientId/admissions |
| getById | `(patientId: string, admissionId: string): Promise<HospitalAdmission>` | GET /patients/:patientId/admissions/:admissionId |
| update | `(patientId: string, admissionId: string, data: UpdateAdmissionRequest): Promise<HospitalAdmission>` | PUT /patients/:patientId/admissions/:admissionId |

**Implementation:**

```typescript
import api from './client';
import { HospitalAdmission, CreateAdmissionRequest, UpdateAdmissionRequest, AdmissionListResponse } from '@/types/admission.types';

export const admissionApi = {
  create: (patientId: string, data: CreateAdmissionRequest): Promise<HospitalAdmission> => {
    return api.post<HospitalAdmission>(`/patients/${patientId}/admissions`, data).then((res) => res.data);
  },

  getByPatient: (patientId: string, params?: {
    status?: 'Active' | 'Discharged';
    page?: number;
    limit?: number;
  }): Promise<AdmissionListResponse> => {
    return api.get<AdmissionListResponse>(`/patients/${patientId}/admissions`, { params }).then((res) => res.data);
  },

  getById: (patientId: string, admissionId: string): Promise<HospitalAdmission> => {
    return api.get<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`).then((res) => res.data);
  },

  update: (patientId: string, admissionId: string, data: UpdateAdmissionRequest): Promise<HospitalAdmission> => {
    return api.put<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`, data).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useAdmissions.ts

#### usePatientAdmissions

| Field | Detail |
|---|---|
| Signature | `usePatientAdmissions(patientId: string, params?: { status?: string; page?: number; limit?: number }): UseQueryResult<AdmissionListResponse>` |
| Query Key | `['patients', patientId, 'admissions', params]` |
| Purpose | Get all admissions for a patient with pagination and status filter |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No admissions -> items: [] |

**Implementation:**

```typescript
export function usePatientAdmissions(patientId: string, params?: {
  status?: 'Active' | 'Discharged';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', params],
    queryFn: () => admissionApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}
```

---

#### useAdmissionDetail

| Field | Detail |
|---|---|
| Signature | `useAdmissionDetail(patientId: string, admissionId: string): UseQueryResult<HospitalAdmission>` |
| Query Key | `['patients', patientId, 'admissions', admissionId]` |
| Purpose | Get admission details by ID |
| Auth | Staff, Admin |
| Enabled | `!!patientId && !!admissionId` |
| Edge Cases | Admission not found -> 404 error |

**Implementation:**

```typescript
export function useAdmissionDetail(patientId: string, admissionId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', admissionId],
    queryFn: () => admissionApi.getById(patientId, admissionId),
    enabled: !!patientId && !!admissionId,
  });
}
```

---

#### useRecordAdmission

| Field | Detail |
|---|---|
| Signature | `useRecordAdmission(patientId: string): UseMutationResult<HospitalAdmission, AxiosError, CreateAdmissionRequest>` |
| Purpose | Record a hospital admission |
| Side Effects | Invalidates admissions and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useRecordAdmission(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdmissionRequest) => admissionApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

#### useUpdateAdmission

| Field | Detail |
|---|---|
| Signature | `useUpdateAdmission(patientId: string): UseMutationResult<HospitalAdmission, AxiosError, { admissionId: string; data: UpdateAdmissionRequest }>` |
| Purpose | Update admission status (discharge patient) |
| Side Effects | Invalidates admissions and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdmissionRequest }) =>
      admissionApi.update(patientId, admissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 4. Components

### 4.1 AdmissionForm

**Purpose:** Form for recording hospital admission

**Props:**

```typescript
interface AdmissionFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateAdmissionRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateAdmissionRequest>;
  referrals: Array<{ id: string; referralDate: string; receivingFacility: string }>;
}
```

**Validation Schema:**

```typescript
export const createAdmissionSchema = z.object({
  referralId: z.string().min(1, 'Referral is required'),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  bedNumber: z.string().min(1, 'Bed number is required'),
  ward: z.string().min(1, 'Ward is required'),
  admittingPhysician: z.string().min(1, 'Admitting physician is required'),
  careTeam: z.string().min(1, 'Care team is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional(),
  diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']),
  comorbidities: z.array(z.string()).optional(),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
  ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
  functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']),
  painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10'),
  painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']),
  symptomsPresent: z.array(z.string()).optional(),
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']),
  familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']),
  socialChallenges: z.string().optional(),
  spiritualConcerns: z.boolean(),
  spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(),
  painManagementPlan: z.string().min(1, 'Pain management plan is required'),
  medicationPlan: z.string().min(1, 'Medication plan is required'),
  nursingCarePlan: z.string().min(1, 'Nursing care plan is required'),
  homeBasedCareRequired: z.boolean(),
  psychosocialSupportPlan: z.string().optional(),
  physiotherapyRequired: z.boolean(),
});
```

**Behavior:**
- React Hook Form with Zod validation
- Fields: referralId (select from accepted referrals), admissionDate, bedNumber, ward, admittingPhysician, careTeam, primaryDiagnosis, secondaryDiagnoses, diseaseStage, comorbidities, estimatedPrognosis, ppsScore, functionalStatus, painScore, painType, symptomsPresent, emotionalStatus, familySupport, socialChallenges, spiritualConcerns, spiritualSupportPreferred, painManagementPlan, medicationPlan, nursingCarePlan, homeBasedCareRequired, psychosocialSupportPlan, physiotherapyRequired
- Submit button disabled when submitting
- Shows field-level errors
- Default admissionDate: today
- Default diseaseStage: Advanced

---

### 4.2 AdmissionList

**Purpose:** Display list of admissions for a patient

**Props:**

```typescript
interface AdmissionListProps {
  admissions: HospitalAdmission[];
  loading?: boolean;
  onViewDetail?: (id: string) => void;
  onDischarge?: (id: string) => void;
}
```

**Behavior:**
- Renders table of admissions
- Columns: Admission Date, Bed, Ward, Physician, Status, Action
- Status badge with color coding (Active: green, Discharged: gray)
- "View" button and "Discharge" button for Active admissions
- Shows loading skeleton
- Shows empty state

---

### 4.3 AdmissionCard

**Purpose:** Display admission summary card

**Props:**

```typescript
interface AdmissionCardProps {
  admission: HospitalAdmission;
  onClick?: (id: string) => void;
}
```

**Behavior:**
- Renders admission date, bed number, ward
- Renders status, physician, care team
- Renders primary diagnosis
- Click calls onClick with admission ID

---

### 4.4 AdmissionDetail

**Purpose:** Display complete admission information

**Props:**

```typescript
interface AdmissionDetailProps {
  admission: HospitalAdmission;
  loading?: boolean;
  onBack?: () => void;
  onDischarge?: (id: string) => void;
}
```

**Behavior:**
- Renders all admission sections:
  - Admission Information (date, status, bed, ward, physician, care team)
  - Referral Information
  - Medical Diagnosis
  - Pain & Symptoms
  - Care Plan
  - Discharge Information

---

### 4.5 DischargeModal

**Purpose:** Modal for discharging a patient from admission

**Props:**

```typescript
interface DischargeModalProps {
  open: boolean;
  admissionId: string;
  patientName: string;
  onClose: () => void;
  onConfirm: (data: UpdateAdmissionRequest) => void;
}
```

**Validation Schema:**

```typescript
export const updateAdmissionSchema = z.object({
  dischargeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dischargeReason: z.enum(['Improved', 'Deceased']),
  status: z.literal('Discharged'),
});
```

**Behavior:**
- Modal overlay
- Shows patient name
- Fields: dischargeDate, dischargeReason (radio buttons: Improved, Deceased)
- Confirm and cancel buttons
- Confirm disabled when submitting
- Shows validation errors
- Default dischargeDate: today

---

## 5. Pages

### 5.1 RecordAdmissionPage

**Route:** `/patients/:id/admissions`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a hospital admission

**Local State:** React Hook Form

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `usePatientReferrals(id)` to get accepted referrals
3. Uses `useRecordAdmission(id)` mutation
4. React Hook Form with Zod validation
5. On success, navigates back to patient detail
6. On error, displays validation errors

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 5.2 AdmissionListPage

**Purpose:** View all admissions for a patient

**Behavior:**

1. Uses `usePatientAdmissions(id)` hook
2. Displays admission list
3. Filter by status (Active/Discharged)
4. View details or discharge patient

**Components:**
- StatusFilter
- AdmissionList
- DischargeModal
- Pagination

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No admissions" |
| Success | Full admission list |

---

### 5.3 AdmissionDetailPage

**Route:** `/patients/:id/admissions/:admissionId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View admission details and discharge patient

**Behavior:**

1. Uses `useAdmissionDetail(id, admissionId)` hook
2. Displays complete admission information
3. Discharge button (if status is Active)
4. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full admission details |

---

## 6. Flow Diagram

```
+-----------------------------------------------------------+
|                  ADMISSIONS FLOW (FRONTEND)                |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD ADMISSION FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id/admissions                  | |
|  |         -> RecordAdmissionPage                      | |
|  |         -> usePatient(id)                           | |
|  |         -> Get patient name                         | |
|  |         -> usePatientReferrals(id)                  | |
|  |         -> Get accepted referrals                   | |
|  |         -> Fill form                                | |
|  |         -> Submit -> useRecordAdmission()           | |
|  |         -> POST /patients/:id/admissions            | |
|  |         -> Success -> /patients/:id                 | |
|  |         -> Error -> Display validation errors       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW ADMISSIONS FLOW              | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> Admissions tab                           | |
|  |         -> usePatientAdmissions(id)                 | |
|  |         -> GET /patients/:id/admissions             | |
|  |         -> Display admission list                   | |
|  |         -> Filter by status                         | |
|  |         -> View details -> /patients/:id/admissions/:id | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DISCHARGE FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id/admissions/:admissionId     | |
|  |         -> AdmissionDetailPage                      | |
|  |         -> Click Discharge                          | |
|  |         -> Open DischargeModal                      | |
|  |         -> Select reason & date                     | |
|  |         -> Confirm -> useUpdateAdmission()          | |
|  |         -> PUT /patients/:id/admissions/:id         | |
|  |         -> Refresh list and details                 | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
