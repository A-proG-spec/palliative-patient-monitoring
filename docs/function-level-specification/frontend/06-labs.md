# function-level-specification/frontend/06-labs.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: LABORATORY TESTS

## 1. Overview

This document defines the function-level specification for frontend laboratory test management features including ordering lab tests, viewing lab results, and updating test results.

**Files Covered:**
- `src/api/labs.ts`
- `src/hooks/useLabs.ts`
- `src/components/labs/LabForm.tsx`
- `src/components/labs/LabList.tsx`
- `src/components/labs/LabCard.tsx`
- `src/components/labs/ResultFormModal.tsx`
- `src/pages/staff/OrderLabPage.tsx`
- `src/pages/staff/LabListPage.tsx`
- `src/pages/staff/LabDetailPage.tsx`

---

## 2. API Layer

### src/api/labs.ts

| Function | Signature | Purpose |
|---|---|---|
| create | `(patientId: string, data: CreateLabRequest): Promise<LaboratoryTest>` | POST /patients/:patientId/labs |
| getByPatient | `(patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<LabListResponse>` | GET /patients/:patientId/labs |
| getById | `(patientId: string, labId: string): Promise<LaboratoryTest>` | GET /patients/:patientId/labs/:labId |
| updateResult | `(patientId: string, labId: string, data: UpdateLabRequest): Promise<LaboratoryTest>` | PUT /patients/:patientId/labs/:labId |

**Implementation:**

```typescript
import api from './client';
import { LaboratoryTest, CreateLabRequest, UpdateLabRequest, LabListResponse } from '@/types/lab.types';

export const labApi = {
  create: (patientId: string, data: CreateLabRequest): Promise<LaboratoryTest> => {
    return api.post<LaboratoryTest>(`/patients/${patientId}/labs`, data).then((res) => res.data);
  },

  getByPatient: (patientId: string, params?: {
    status?: 'Ordered' | 'Completed';
    page?: number;
    limit?: number;
  }): Promise<LabListResponse> => {
    return api.get<LabListResponse>(`/patients/${patientId}/labs`, { params }).then((res) => res.data);
  },

  getById: (patientId: string, labId: string): Promise<LaboratoryTest> => {
    return api.get<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`).then((res) => res.data);
  },

  updateResult: (patientId: string, labId: string, data: UpdateLabRequest): Promise<LaboratoryTest> => {
    return api.put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useLabs.ts

#### usePatientLabs

| Field | Detail |
|---|---|
| Signature | `usePatientLabs(patientId: string, params?: { status?: string; page?: number; limit?: number }): UseQueryResult<LabListResponse>` |
| Query Key | `['patients', patientId, 'labs', params]` |
| Purpose | Get all lab tests for a patient with pagination and status filter |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No lab tests -> items: [] |

**Implementation:**

```typescript
export function usePatientLabs(patientId: string, params?: {
  status?: 'Ordered' | 'Completed';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', params],
    queryFn: () => labApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}
```

---

#### useLabDetail

| Field | Detail |
|---|---|
| Signature | `useLabDetail(patientId: string, labId: string): UseQueryResult<LaboratoryTest>` |
| Query Key | `['patients', patientId, 'labs', labId]` |
| Purpose | Get lab test details by ID |
| Auth | Staff, Admin |
| Enabled | `!!patientId && !!labId` |
| Edge Cases | Lab test not found -> 404 error |

**Implementation:**

```typescript
export function useLabDetail(patientId: string, labId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', labId],
    queryFn: () => labApi.getById(patientId, labId),
    enabled: !!patientId && !!labId,
  });
}
```

---

#### useOrderLab

| Field | Detail |
|---|---|
| Signature | `useOrderLab(patientId: string): UseMutationResult<LaboratoryTest, AxiosError, CreateLabRequest>` |
| Purpose | Order a laboratory test |
| Side Effects | Invalidates labs and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useOrderLab(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabRequest) => labApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

#### useUpdateLabResult

| Field | Detail |
|---|---|
| Signature | `useUpdateLabResult(patientId: string): UseMutationResult<LaboratoryTest, AxiosError, { labId: string; data: UpdateLabRequest }>` |
| Purpose | Update lab test result (mark as Completed) |
| Side Effects | Invalidates labs and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useUpdateLabResult(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labId, data }: { labId: string; data: UpdateLabRequest }) =>
      labApi.updateResult(patientId, labId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 4. Components

### 4.1 LabForm

**Purpose:** Form for ordering laboratory tests

**Props:**

```typescript
interface LabFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateLabRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateLabRequest>;
}
```

**Validation Schema:**

```typescript
export const createLabSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  dateOrdered: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  location: z.enum(['Home', 'Hospital']),
});
```

**Behavior:**
- React Hook Form with Zod validation
- Fields: testName, dateOrdered, location
- Submit button disabled when submitting
- Shows field-level errors
- Default dateOrdered: today
- Default location: Home

---

### 4.2 LabList

**Purpose:** Display list of lab tests for a patient

**Props:**

```typescript
interface LabListProps {
  labs: LaboratoryTest[];
  loading?: boolean;
  onUpdateResult?: (labId: string, data: UpdateLabRequest) => void;
}
```

**Behavior:**
- Renders table of lab tests
- Columns: Test Name, Date Ordered, Date Performed, Location, Status, Result, Action
- Status badge with color coding (Ordered: yellow, Completed: green)
- "Enter Result" button for Ordered tests
- Shows loading skeleton
- Shows empty state

---

### 4.3 LabCard

**Purpose:** Display lab test summary card

**Props:**

```typescript
interface LabCardProps {
  lab: LaboratoryTest;
  onUpdateResult?: (labId: string, data: UpdateLabRequest) => void;
}
```

**Behavior:**
- Renders test name, date ordered, location
- Renders status and result
- "Enter Result" button for Ordered tests

---

### 4.4 ResultFormModal

**Purpose:** Modal form for entering lab test results

**Props:**

```typescript
interface ResultFormModalProps {
  isOpen: boolean;
  lab: LaboratoryTest | null;
  onClose: () => void;
  onSubmit: (data: UpdateLabRequest) => void;
}
```

**Validation Schema:**

```typescript
export const updateLabResultSchema = z.object({
  datePerformed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  result: z.string().min(1, 'Result is required'),
});
```

**Behavior:**
- Modal overlay
- Shows lab test name
- Fields: datePerformed, result (textarea)
- Submit and cancel buttons
- Submit disabled when submitting
- Shows field-level errors
- Default datePerformed: today

---

## 5. Pages

### 5.1 OrderLabPage

**Route:** `/patients/:id/labs`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Order a laboratory test

**Local State:** React Hook Form

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useOrderLab(id)` mutation
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

---

### 5.2 LabListPage

**Purpose:** View all lab tests for a patient

**Behavior:**

1. Uses `usePatientLabs(id)` hook
2. Displays lab test list
3. Filter by status (Ordered/Completed)
4. Enter result for Ordered tests

**Components:**
- StatusFilter
- LabList
- ResultFormModal
- Pagination

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No lab tests ordered" |
| Success | Full lab test list |

---

### 5.3 LabDetailPage

**Route:** `/patients/:id/labs/:labId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View lab test details

**Behavior:**

1. Uses `useLabDetail(id, labId)` hook
2. Displays complete lab test information
3. Enter result button (if status is Ordered)
4. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full lab test details |

---

## 6. Flow Diagram

```
+-----------------------------------------------------------+
|                    LABS FLOW (FRONTEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER LAB FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id/labs -> OrderLabPage        | |
|  |         -> usePatient(id)                           | |
|  |         -> Get patient name                         | |
|  |         -> Fill form                                | |
|  |         -> Submit -> useOrderLab()                  | |
|  |         -> POST /patients/:id/labs                  | |
|  |         -> Success -> /patients/:id                 | |
|  |         -> Error -> Display validation errors       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW LABS FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> Labs tab                                 | |
|  |         -> usePatientLabs(id)                       | |
|  |         -> GET /patients/:id/labs                   | |
|  |         -> Display lab list                         | |
|  |         -> Filter by status                         | |
|  |         -> Enter Result -> ResultFormModal          | |
|  |         -> useUpdateLabResult()                     | |
|  |         -> PUT /patients/:id/labs/:id               | |
|  |         -> Refresh list                             | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  Staff -> /patients/:id/labs/:labId -> LabDetailPage| |
|  |         -> useLabDetail(id, labId)                  | |
|  |         -> GET /patients/:id/labs/:id               | |
|  |         -> Display full lab test details            | |
|  |         -> Enter Result -> useUpdateLabResult()     | |
|  |         -> Back to patient                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
