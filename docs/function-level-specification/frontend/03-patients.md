# function-level-specification/frontend/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: PATIENTS

## 1. Overview

This document defines the function-level specification for frontend patient management features including patient registration, patient list, patient detail, patient summary, patient progress tracking, and print/export functionality.

**Files Covered:**
- `src/api/patients.ts`
- `src/hooks/usePatients.ts`
- `src/components/patients/PatientCard.tsx`
- `src/components/patients/PatientForm.tsx`
- `src/components/patients/PatientList.tsx`
- `src/components/patients/PatientSummary.tsx`
- `src/components/patients/PatientProgressGraph.tsx`
- `src/components/patients/PatientPrintView.tsx`
- `src/components/common/PrintButton.tsx`
- `src/pages/staff/PatientListPage.tsx`
- `src/pages/staff/PatientRegistrationPage.tsx`
- `src/pages/staff/PatientDetailPage.tsx`
- `src/pages/staff/PatientSummaryPage.tsx`
- `src/pages/staff/PatientProgressPage.tsx`
- `src/pages/staff/PatientPrintPage.tsx`

---

## 2. API Layer

### src/api/patients.ts

| Function | Signature | Purpose |
|---|---|---|
| register | `(data: CreatePatientRequest): Promise<Patient>` | POST /patients |
| getList | `(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PatientListResponse>` | GET /patients |
| getById | `(patientId: string): Promise<Patient>` | GET /patients/:patientId |
| getSummary | `(patientId: string): Promise<PatientSummaryResponse>` | GET /patients/:patientId/summary |
| getProgress | `(patientId: string): Promise<PatientProgressData>` | GET /patients/:patientId/progress |
| getPrintData | `(patientId: string): Promise<PatientPrintData>` | GET /patients/:patientId/print |
| exportPDF | `(patientId: string): Promise<Blob>` | GET /patients/:patientId/export |

**Implementation:**

```typescript
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
  register: (data: CreatePatientRequest): Promise<Patient> => {
    return api.post<Patient>('/patients', data).then((res) => res.data);
  },

  getList: (params?: {
    page?: number;
    limit?: number;
    status?: 'Active' | 'Discharged';
    search?: string;
  }): Promise<PatientListResponse> => {
    return api.get<PatientListResponse>('/patients', { params }).then((res) => res.data);
  },

  getById: (patientId: string): Promise<Patient> => {
    return api.get<Patient>(`/patients/${patientId}`).then((res) => res.data);
  },

  getSummary: (patientId: string): Promise<PatientSummaryResponse> => {
    return api.get<PatientSummaryResponse>(`/patients/${patientId}/summary`).then((res) => res.data);
  },

  getProgress: (patientId: string): Promise<PatientProgressData> => {
    return api.get<PatientProgressData>(`/patients/${patientId}/progress`).then((res) => res.data);
  },

  getPrintData: (patientId: string): Promise<PatientPrintData> => {
    return api.get<PatientPrintData>(`/patients/${patientId}/print`).then((res) => res.data);
  },

  exportPDF: (patientId: string): Promise<Blob> => {
    return api.get(`/patients/${patientId}/export`, { responseType: 'blob' }).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/usePatients.ts

#### usePatients

| Field | Detail |
|---|---|
| Signature | `usePatients(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<PatientListResponse>` |
| Query Key | `['patients', params]` |
| Purpose | Get list of patients with pagination and filters |
| Auth | Staff, Admin |
| Edge Cases | Empty list -> returns items: [] |

**Implementation:**

```typescript
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
```

---

#### usePatient

| Field | Detail |
|---|---|
| Signature | `usePatient(patientId: string): UseQueryResult<Patient>` |
| Query Key | `['patients', patientId]` |
| Purpose | Get patient details by ID |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | Patient not found -> 404 error |

**Implementation:**

```typescript
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => patientApi.getById(patientId),
    enabled: !!patientId,
  });
}
```

---

#### usePatientSummary

| Field | Detail |
|---|---|
| Signature | `usePatientSummary(patientId: string): UseQueryResult<PatientSummaryResponse>` |
| Query Key | `['patients', patientId, 'summary']` |
| Purpose | Get comprehensive patient summary report |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | Patient not found -> 404 error |

**Implementation:**

```typescript
export function usePatientSummary(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'summary'],
    queryFn: () => patientApi.getSummary(patientId),
    enabled: !!patientId,
  });
}
```

---

#### usePatientProgress

| Field | Detail |
|---|---|
| Signature | `usePatientProgress(patientId: string): UseQueryResult<PatientProgressData>` |
| Query Key | `['patients', patientId, 'progress']` |
| Purpose | Get patient progress data for KPS/PPS graph |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No visits -> empty visits array, trends null |

**Implementation:**

```typescript
export function usePatientProgress(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress'],
    queryFn: () => patientApi.getProgress(patientId),
    enabled: !!patientId,
  });
}
```

---

#### usePatientPrint (NEW)

| Field | Detail |
|---|---|
| Signature | `usePatientPrint(patientId: string): UseQueryResult<PatientPrintData>` |
| Query Key | `['patients', patientId, 'print']` |
| Purpose | Get patient data formatted for print/export |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | Patient not found -> 404 error |

**Implementation:**

```typescript
export function usePatientPrint(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'print'],
    queryFn: () => patientApi.getPrintData(patientId),
    enabled: !!patientId,
  });
}
```

---

#### useExportPatientPDF (NEW)

| Field | Detail |
|---|---|
| Signature | `useExportPatientPDF(): UseMutationResult<Blob, AxiosError, string>` |
| Purpose | Export patient history as PDF |
| Auth | Staff, Admin |

**Implementation:**

```typescript
export function useExportPatientPDF() {
  return useMutation({
    mutationFn: (patientId: string) => patientApi.exportPDF(patientId),
  });
}
```

---

#### useRegisterPatient

| Field | Detail |
|---|---|
| Signature | `useRegisterPatient(): UseMutationResult<Patient, AxiosError, CreatePatientRequest>` |
| Purpose | Register new patient |
| Side Effects | Invalidates `['patients']` on success |
| Auth | Staff |

**Implementation:**

```typescript
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

## 4. Components

### 4.1 PatientCard

**Purpose:** Display patient summary card in patient list

**Props:**

```typescript
interface PatientCardProps {
  patient: Patient;
  onClick?: (id: string) => void;
}
```

**Behavior:**
- Renders patient name, ID, age, sex
- Renders primary diagnosis
- Renders status badge (Active/Discharged)
- Renders current location badge (Home/ReferredHospital)
- Click calls onClick with patient ID

---

### 4.2 PatientForm

**Purpose:** Form for registering new patient

**Props:**

```typescript
interface PatientFormProps {
  onSubmit: (data: CreatePatientRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreatePatientRequest>;
}
```

**Validation Schema:**

```typescript
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
```

**Behavior:**
- React Hook Form with Zod validation
- All fields validated client-side
- Submit button disabled when submitting
- Shows field-level errors

---

### 4.3 PatientList

**Purpose:** Display list of patients

**Props:**

```typescript
interface PatientListProps {
  patients: Patient[];
  loading?: boolean;
  onPatientClick?: (id: string) => void;
}
```

**Behavior:**
- Renders grid of PatientCards
- Shows loading skeleton
- Shows empty state

---

### 4.4 PatientSummary

**Purpose:** Display comprehensive patient summary

**Props:**

```typescript
interface PatientSummaryProps {
  summary: PatientSummaryResponse;
  loading?: boolean;
}
```

**Behavior:**
- Renders patient demographics
- Renders diagnosis information
- Renders visits history table
- Renders medications list
- Renders lab tests list
- Renders referrals list
- Renders admissions list

---

### 4.5 PatientProgressGraph (UPDATED)

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
  isPrintView?: boolean;  // NEW - disables interactivity for print
}
```

**Behavior:**
- Uses Recharts LineChart
- Two lines: KPS (blue) and PPS (green)
- X-axis: visit dates
- Y-axis: 0-100
- Reference lines at 80, 50, 20
- Tooltip shows values on hover
- Trend summary with arrows and percentages
- In print view: static rendering with no interactivity

---

### 4.6 PrintButton (NEW)

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

---

### 4.7 PatientPrintView (NEW)

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

---

## 5. Pages

### 5.1 PatientListPage

**Route:** `/patients`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Display list of patients

**Local State:** `page`, `search`, `status`

**Behavior:**

1. Uses `usePatients({ page, limit, search, status })`
2. Search bar for filtering
3. Status filter dropdown
4. Pagination controls
5. "Register New Patient" button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton cards |
| Error | Error message with retry |
| Empty | Empty state with "Register Patient" button |
| Success | Grid of patient cards |

**Implementation:**

```typescript
export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'Active' | 'Discharged' | undefined>(undefined);
  const limit = 12;

  const { data, isLoading, error, refetch } = usePatients({ page, limit, search, status });

  // Render logic
};
```

---

### 5.2 PatientRegistrationPage

**Route:** `/patients/new`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Register new patient

**Local State:** React Hook Form

**Behavior:**

1. Uses `useRegisterPatient()` mutation
2. React Hook Form with Zod validation
3. On success, navigates to patient detail
4. On error, displays validation errors

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 5.3 PatientDetailPage (UPDATED)

**Route:** `/patients/:id`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View patient details

**Local State:** `activeTab`

**Behavior:**

1. Uses `usePatient(id)` hook
2. Displays patient demographics
3. Displays tabs: Visits, Medications, Labs, Referrals, Admissions
4. Action buttons: View Summary, Record Visit, Order Medication, Order Lab, Request Referral, Record Admission, Print History

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

### 5.4 PatientSummaryPage (UPDATED)

**Route:** `/patients/:id/summary`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View comprehensive patient summary with print functionality

**Behavior:**

1. Uses `usePatientSummary(id)` hook
2. Uses `usePatientProgress(id)` hook
3. Displays complete patient summary
4. Displays KPS/PPS progress graph
5. Print/Export functionality available

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

### 5.5 PatientProgressPage

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

### 5.6 PatientPrintPage (NEW)

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

## 6. Page Implementations

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

## 7. Flow Diagram (UPDATED)

```
+-----------------------------------------------------------+
|                 PATIENT FLOW (FRONTEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                 | |
|  |                                                     | |
|  |  Staff -> /patients/new -> PatientRegistrationPage  | |
|  |         -> useRegisterPatient()                     | |
|  |         -> POST /patients                           | |
|  |         -> Success -> /patients/:id                 | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LIST FLOW                         | |
|  |                                                     | |
|  |  Staff -> /patients -> PatientListPage              | |
|  |         -> usePatients()                            | |
|  |         -> GET /patients                            | |
|  |         -> Display patient cards                    | |
|  |         -> Search and filter                        | |
|  |         -> Pagination                               | |
|  |         -> Click patient -> /patients/:id           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW (UPDATED)             | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> usePatient(id)                           | |
|  |         -> GET /patients/:id                        | |
|  |         -> Display patient details                  | |
|  |         -> Tabs: Visits, Medications, Labs,        | |
|  |                Referrals, Admissions                | |
|  |         -> Action buttons                           | |
|  |         -> Print History -> /patients/:id/print     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SUMMARY FLOW (UPDATED)            | |
|  |                                                     | |
|  |  Staff -> /patients/:id/summary -> PatientSummaryPage| |
|  |         -> usePatientSummary(id)                    | |
|  |         -> GET /patients/:id/summary                | |
|  |         -> Display comprehensive summary            | |
|  |         -> PatientProgressGraph                     | |
|  |         -> Print button -> /patients/:id/print      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PRINT FLOW (NEW)                  | |
|  |                                                     | |
|  |  User clicks Print -> /patients/:id/print           | |
|  |         -> PatientPrintPage                         | |
|  |         -> usePatientPrint(id)                      | |
|  |         -> GET /patients/:id/print                  | |
|  |         -> Display print-optimized view with        | |
|  |            ALL patient data (FULL visit details)    | |
|  |         -> Auto-trigger window.print()              | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PROGRESS FLOW                     | |
|  |                                                     | |
|  |  Staff -> /patients/:id/progress -> PatientProgressPage| |
|  |         -> usePatientProgress(id)                   | |
|  |         -> GET /patients/:id/progress               | |
|  |         -> Display KPS/PPS graphs                   | |
|  |         -> Trend analysis                           | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```