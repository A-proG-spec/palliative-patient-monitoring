# function-level-specification/frontend/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: PATIENTS

## 1. Overview

This document defines the function-level specification for frontend patient management features including patient registration, patient list, patient detail, patient summary, and patient progress tracking.

**Files Covered:**
- `src/api/patients.ts`
- `src/hooks/usePatients.ts`
- `src/components/patients/PatientCard.tsx`
- `src/components/patients/PatientForm.tsx`
- `src/components/patients/PatientList.tsx`
- `src/components/patients/PatientSummary.tsx`
- `src/components/patients/PatientProgressGraph.tsx`
- `src/pages/staff/PatientListPage.tsx`
- `src/pages/staff/PatientRegistrationPage.tsx`
- `src/pages/staff/PatientDetailPage.tsx`
- `src/pages/staff/PatientSummaryPage.tsx`
- `src/pages/staff/PatientProgressPage.tsx`

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

**Implementation:**

```typescript
import api from './client';
import { 
  Patient, 
  CreatePatientRequest, 
  PatientListResponse, 
  PatientSummaryResponse,
  PatientProgressData
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

### 4.5 PatientProgressGraph

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

### 5.3 PatientDetailPage

**Route:** `/patients/:id`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View patient details

**Local State:** `activeTab`

**Behavior:**

1. Uses `usePatient(id)` hook
2. Displays patient demographics
3. Displays tabs: Visits, Medications, Labs, Referrals, Admissions
4. Action buttons: View Summary, Record Visit, Order Medication, Order Lab, Request Referral, Record Admission

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details with tabs |

---

### 5.4 PatientSummaryPage

**Route:** `/patients/:id/summary`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View comprehensive patient summary

**Behavior:**

1. Uses `usePatientSummary(id)` hook
2. Displays complete patient summary
3. Includes PatientProgressGraph

**States:**

| State | UI |
|---|---|
| Loading | Skeleton summary |
| Error | Error message with retry |
| Success | Full patient summary |

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

**States:**

| State | UI |
|---|---|
| Loading | Skeleton graph |
| Error | Error message with retry |
| Empty | "No progress data available" |
| Success | Full progress graphs |

---

## 6. Flow Diagram

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
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> usePatient(id)                           | |
|  |         -> GET /patients/:id                        | |
|  |         -> Display patient details                  | |
|  |         -> Tabs: Visits, Medications, Labs,        | |
|  |                Referrals, Admissions                | |
|  |         -> Action buttons                           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SUMMARY FLOW                      | |
|  |                                                     | |
|  |  Staff -> /patients/:id/summary -> PatientSummaryPage| |
|  |         -> usePatientSummary(id)                    | |
|  |         -> GET /patients/:id/summary                | |
|  |         -> Display comprehensive summary            | |
|  |         -> PatientProgressGraph                     | |
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
