# frontend-specification/03-patients.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND PATIENT SPECIFICATION

## 1. Overview

This document defines the frontend implementation for patient management features including patient registration, patient list, patient detail, and patient summary.

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
  PatientProgressData
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
10. Back button

**Components:**

- `PatientDemographics`
- `PatientDiagnosis`
- `Tabs` (Visits, Medications, Labs, Referrals, Admissions)
- `ActionButtons`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full patient details with tabs |

---

### 7.4 PatientSummaryPage

**Route:** `/patients/:id/summary`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View comprehensive patient summary

**Behavior:**

1. Uses `usePatientSummary(id)` hook
2. Displays complete patient summary
3. Print or export functionality

**Components:**

- `PatientSummary`
- `PatientProgressGraph`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton summary |
| Error | Error message with retry |
| Success | Full patient summary |

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
  ],
}
```

---

## 11. Flow Diagram

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
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SUMMARY FLOW                      | |
|  |                                                     | |
|  |  Staff -> /patients/:id/summary -> PatientSummaryPage| |
|  |                    -> usePatientSummary(id)          | |
|  |                    -> GET /patients/:id/summary      | |
|  |                    -> Display comprehensive summary  | |
|  |                    -> Print/Export                   | |
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
