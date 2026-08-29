# function-level-specification/frontend/05-medications.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: MEDICATIONS

## 1. Overview

This document defines the function-level specification for frontend medication management features including ordering medications, viewing medication history, and updating medication status.

**Files Covered:**
- `src/api/medications.ts`
- `src/hooks/useMedications.ts`
- `src/components/medications/MedicationForm.tsx`
- `src/components/medications/MedicationList.tsx`
- `src/components/medications/MedicationCard.tsx`
- `src/pages/staff/OrderMedicationPage.tsx`
- `src/pages/staff/MedicationListPage.tsx`
- `src/pages/staff/MedicationDetailPage.tsx`

---

## 2. API Layer

### src/api/medications.ts

| Function | Signature | Purpose |
|---|---|---|
| create | `(patientId: string, data: CreateMedicationRequest): Promise<Medication>` | POST /patients/:patientId/medications |
| getByPatient | `(patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<MedicationListResponse>` | GET /patients/:patientId/medications |
| getById | `(patientId: string, medicationId: string): Promise<Medication>` | GET /patients/:patientId/medications/:medicationId |
| updateStatus | `(patientId: string, medicationId: string, data: UpdateMedicationRequest): Promise<Medication>` | PUT /patients/:patientId/medications/:medicationId |

**Implementation:**

```typescript
import api from './client';
import { Medication, CreateMedicationRequest, MedicationListResponse, UpdateMedicationRequest } from '@/types/medication.types';

export const medicationApi = {
  create: (patientId: string, data: CreateMedicationRequest): Promise<Medication> => {
    return api.post<Medication>(`/patients/${patientId}/medications`, data).then((res) => res.data);
  },

  getByPatient: (patientId: string, params?: {
    status?: 'Ordered' | 'Given';
    page?: number;
    limit?: number;
  }): Promise<MedicationListResponse> => {
    return api.get<MedicationListResponse>(`/patients/${patientId}/medications`, { params }).then((res) => res.data);
  },

  getById: (patientId: string, medicationId: string): Promise<Medication> => {
    return api.get<Medication>(`/patients/${patientId}/medications/${medicationId}`).then((res) => res.data);
  },

  updateStatus: (patientId: string, medicationId: string, data: UpdateMedicationRequest): Promise<Medication> => {
    return api.put<Medication>(`/patients/${patientId}/medications/${medicationId}`, data).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useMedications.ts

#### usePatientMedications

| Field | Detail |
|---|---|
| Signature | `usePatientMedications(patientId: string, params?: { status?: string; page?: number; limit?: number }): UseQueryResult<MedicationListResponse>` |
| Query Key | `['patients', patientId, 'medications', params]` |
| Purpose | Get all medications for a patient with pagination and status filter |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No medications -> items: [] |

**Implementation:**

```typescript
export function usePatientMedications(patientId: string, params?: {
  status?: 'Ordered' | 'Given';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', params],
    queryFn: () => medicationApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}
```

---

#### useMedicationDetail

| Field | Detail |
|---|---|
| Signature | `useMedicationDetail(patientId: string, medicationId: string): UseQueryResult<Medication>` |
| Query Key | `['patients', patientId, 'medications', medicationId]` |
| Purpose | Get medication details by ID |
| Auth | Staff, Admin |
| Enabled | `!!patientId && !!medicationId` |
| Edge Cases | Medication not found -> 404 error |

**Implementation:**

```typescript
export function useMedicationDetail(patientId: string, medicationId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', medicationId],
    queryFn: () => medicationApi.getById(patientId, medicationId),
    enabled: !!patientId && !!medicationId,
  });
}
```

---

#### useOrderMedication

| Field | Detail |
|---|---|
| Signature | `useOrderMedication(patientId: string): UseMutationResult<Medication, AxiosError, CreateMedicationRequest>` |
| Purpose | Order a medication |
| Side Effects | Invalidates medications and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useOrderMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicationRequest) => medicationApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

#### useUpdateMedicationStatus

| Field | Detail |
|---|---|
| Signature | `useUpdateMedicationStatus(patientId: string): UseMutationResult<Medication, AxiosError, { medicationId: string; data: UpdateMedicationRequest }>` |
| Purpose | Update medication status (mark as Given) |
| Side Effects | Invalidates medications and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
export function useUpdateMedicationStatus(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: UpdateMedicationRequest }) =>
      medicationApi.updateStatus(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 4. Components

### 4.1 MedicationForm

**Purpose:** Form for ordering medication

**Props:**

```typescript
interface MedicationFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateMedicationRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateMedicationRequest>;
}
```

**Validation Schema:**

```typescript
export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  administeredAt: z.enum(['Home', 'Hospital']),
});
```

**Behavior:**
- React Hook Form with Zod validation
- Fields: name, dosage, frequency, route, administeredAt
- Submit button disabled when submitting
- Shows field-level errors
- Default administeredAt: Home

---

### 4.2 MedicationList

**Purpose:** Display list of medications for a patient

**Props:**

```typescript
interface MedicationListProps {
  medications: Medication[];
  loading?: boolean;
  onStatusUpdate?: (medicationId: string, status: 'Ordered' | 'Given') => void;
}
```

**Behavior:**
- Renders table of medications
- Columns: Name, Dosage, Frequency, Administered At, Status, Action
- Status badge with color coding (Ordered: yellow, Given: green)
- "Mark as Given" button for Ordered medications
- Shows loading skeleton
- Shows empty state

---

### 4.3 MedicationCard

**Purpose:** Display medication summary card

**Props:**

```typescript
interface MedicationCardProps {
  medication: Medication;
  onStatusUpdate?: (id: string, status: 'Ordered' | 'Given') => void;
}
```

**Behavior:**
- Renders medication name, dosage, frequency, route
- Renders administeredAt and status
- "Mark as Given" button for Ordered medications

---

## 5. Pages

### 5.1 OrderMedicationPage

**Route:** `/patients/:id/medications`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Order medication for a patient

**Local State:** React Hook Form

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useOrderMedication(id)` mutation
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
export const OrderMedicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const orderMutation = useOrderMedication(patientId);

  const form = useForm<CreateMedicationFormData>({
    resolver: zodResolver(createMedicationSchema),
    defaultValues: {
      administeredAt: 'Home',
    },
  });

  const onSubmit = (data: CreateMedicationFormData) => {
    orderMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/patients/${patientId}`);
      },
    });
  };

  // Render logic
};
```

---

### 5.2 MedicationListPage

**Purpose:** View all medications for a patient

**Behavior:**

1. Uses `usePatientMedications(id)` hook
2. Displays medication list
3. Filter by status (Ordered/Given)
4. Mark medication as Given

**Components:**
- StatusFilter
- MedicationList
- Pagination

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No medications ordered" |
| Success | Full medication list |

---

### 5.3 MedicationDetailPage

**Route:** `/patients/:id/medications/:medicationId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View medication details

**Behavior:**

1. Uses `useMedicationDetail(id, medicationId)` hook
2. Displays complete medication information
3. Mark as Given button (if status is Ordered)
4. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full medication details |

---

## 6. Flow Diagram

```
+-----------------------------------------------------------+
|                 MEDICATIONS FLOW (FRONTEND)                |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER MEDICATION FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id/medications                 | |
|  |         -> OrderMedicationPage                      | |
|  |         -> usePatient(id)                           | |
|  |         -> Get patient name                         | |
|  |         -> Fill form                                | |
|  |         -> Submit -> useOrderMedication()           | |
|  |         -> POST /patients/:id/medications           | |
|  |         -> Success -> /patients/:id                 | |
|  |         -> Error -> Display validation errors       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW MEDICATIONS FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> Medications tab                          | |
|  |         -> usePatientMedications(id)                | |
|  |         -> GET /patients/:id/medications            | |
|  |         -> Display medication list                  | |
|  |         -> Filter by status                         | |
|  |         -> Mark as Given                            | |
|  |         -> useUpdateMedicationStatus()              | |
|  |         -> PUT /patients/:id/medications/:id        | |
|  |         -> Refresh list                             | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  Staff -> /patients/:id/medications/:medicationId   | |
|  |         -> MedicationDetailPage                     | |
|  |         -> useMedicationDetail(id, medicationId)    | |
|  |         -> GET /patients/:id/medications/:id        | |
|  |         -> Display full medication details          | |
|  |         -> Mark as Given -> useUpdateMedicationStatus| |
|  |         -> Back to patient                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
