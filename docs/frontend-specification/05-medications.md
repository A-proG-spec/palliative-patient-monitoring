# frontend-specification/05-medications.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND MEDICATIONS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for medication management features including ordering medications and viewing medication history.

**API Reference:** `api/05-medications.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/medications` | `OrderMedicationPage` | `DashboardLayout` | Staff |
| `/patients/:id/medications/:medicationId` | `MedicationDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/medication.types.ts

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
}

export interface UpdateMedicationRequest {
  status: 'Ordered' | 'Given';
}

export interface MedicationListResponse {
  items: Medication[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 4. API Calls

```typescript
// src/api/medications.ts

import api from './client';
import { Medication, CreateMedicationRequest, MedicationListResponse, UpdateMedicationRequest } from '@/types/medication.types';

export const medicationApi = {
  /**
   * Order medication
   * POST /patients/:patientId/medications
   */
  create: (patientId: string, data: CreateMedicationRequest): Promise<Medication> => {
    return api.post<Medication>(`/patients/${patientId}/medications`, data).then((res) => res.data);
  },

  /**
   * Get all medications for a patient
   * GET /patients/:patientId/medications
   */
  getByPatient: (patientId: string, params?: {
    status?: 'Ordered' | 'Given';
    page?: number;
    limit?: number;
  }): Promise<MedicationListResponse> => {
    return api.get<MedicationListResponse>(`/patients/${patientId}/medications`, { params }).then((res) => res.data);
  },

  /**
   * Get medication details
   * GET /patients/:patientId/medications/:medicationId
   */
  getById: (patientId: string, medicationId: string): Promise<Medication> => {
    return api.get<Medication>(`/patients/${patientId}/medications/${medicationId}`).then((res) => res.data);
  },

  /**
   * Update medication status (mark as Given)
   * PUT /patients/:patientId/medications/:medicationId
   */
  updateStatus: (patientId: string, medicationId: string, data: UpdateMedicationRequest): Promise<Medication> => {
    return api.put<Medication>(`/patients/${patientId}/medications/${medicationId}`, data).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useMedications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/api/medications';
import { CreateMedicationRequest, UpdateMedicationRequest } from '@/types/medication.types';

/**
 * Get all medications for a patient
 */
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

/**
 * Get medication details
 */
export function useMedicationDetail(patientId: string, medicationId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'medications', medicationId],
    queryFn: () => medicationApi.getById(patientId, medicationId),
    enabled: !!patientId && !!medicationId,
  });
}

/**
 * Order medication
 */
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

/**
 * Update medication status (mark as Given)
 */
export function useUpdateMedicationStatus(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: UpdateMedicationRequest }) =>
      medicationApi.updateStatus(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'medications'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 6. Components

### 6.1 MedicationForm

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

**Visual Design:**

```
+-----------------------------------------------------------+
| Order Medication - Sarah Johnson                           |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Medication Details                                     | |
| | +---------------------------------------------------+ | |
| | | Medication Name: [________________________]        | | |
| | | Dosage: [________________________]                 | | |
| | | Frequency: [________________________]              | | |
| | | Route: [________________________]                  | | |
| | | Administered At: [Home / Hospital]                | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                              [Cancel] [Order]         | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 MedicationList

**Purpose:** Display list of medications for a patient

**Props:**

```typescript
interface MedicationListProps {
  medications: Medication[];
  patientId: string;
  loading?: boolean;
  onStatusUpdate?: (medicationId: string, status: 'Ordered' | 'Given') => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Medications                                               |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Name       | Dosage   | Frequency | Status  | Admin At | |
| +------------+----------+-----------+---------+----------+ |
| | Morphine   | 10mg     | Every 6h  | Ordered | Home     | |
| |            |          |           |         | [Mark as | |
| |            |          |           |         | Given]   | |
| | Oxycodone  | 5mg      | Every 8h  | Given   | Hospital | |
| |            |          |           |         |          | |
| | Paracetamo | 500mg    | Every 6h  | Ordered | Home     | |
| | l          |          |           |         | [Mark as | |
| |            |          |           |         | Given]   | |
| +------------+----------+-----------+---------+----------+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.3 MedicationCard

**Purpose:** Display medication summary card

**Props:**

```typescript
interface MedicationCardProps {
  medication: Medication;
  onStatusUpdate?: (id: string, status: 'Ordered' | 'Given') => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Morphine                                              | |
| | Dosage: 10mg   Frequency: Every 6 hours               | |
| | Route: Oral   Administered At: Home                   | |
| | Status: [Ordered]  Prescribed: 2026-08-29            | |
| |                                   [Mark as Given]     | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.4 StatusBadge

**Purpose:** Display medication status with color coding

**Props:**

```typescript
interface StatusBadgeProps {
  status: 'Ordered' | 'Given';
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Status Badges                                              |
|                                                           |
|  +----------+          +----------+                       |
|  | Ordered  |          | Given    |                       |
|  | (Yellow) |          | (Green)  |                       |
|  +----------+          +----------+                       |
+-----------------------------------------------------------+
```

---

## 7. Pages

### 7.1 OrderMedicationPage

**Route:** `/patients/:id/medications`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Order medication for a patient

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useOrderMedication(id)` mutation
3. React Hook Form with Zod validation
4. On success, shows success message and stays on page or navigates back
5. On error, displays validation errors

**Components:**

- `MedicationForm`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Success message displayed |

---

### 7.2 MedicationListPage

**Purpose:** View all medications for a patient

**Behavior:**

1. Uses `usePatientMedications(id)` hook
2. Displays medication list
3. Filter by status (Ordered/Given)
4. Mark medication as Given

**Components:**

- `StatusFilter`
- `MedicationList`
- `Pagination`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No medications ordered" |
| Success | Full medication list |

---

### 7.3 MedicationDetailPage

**Route:** `/patients/:id/medications/:medicationId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View medication details

**Behavior:**

1. Uses `useMedicationDetail(id, medicationId)` hook
2. Displays complete medication information
3. Mark as Given button (if status is Ordered)
4. Back button

**Components:**

- `MedicationDetail`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full medication details |

---

## 8. Form Validation Schema

```typescript
// src/schemas/medication.schema.ts

import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  administeredAt: z.enum(['Home', 'Hospital']),
});

export const updateMedicationStatusSchema = z.object({
  status: z.enum(['Ordered', 'Given']),
});

export type CreateMedicationFormData = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationStatusFormData = z.infer<typeof updateMedicationStatusSchema>;
```

---

## 9. Page Implementations

### OrderMedicationPage

```typescript
// src/pages/staff/OrderMedicationPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useOrderMedication } from '@/hooks/useMedications';
import { MedicationForm } from '@/components/medications/MedicationForm';
import { createMedicationSchema, CreateMedicationFormData } from '@/schemas/medication.schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const OrderMedicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
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

  if (patientLoading) {
    return <LoadingSpinner />;
  }

  if (patientError || !patient) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Order Medication - {patient.firstName} {patient.lastName}
      </h1>
      <MedicationForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={orderMutation.isPending}
        error={orderMutation.error}
      />
    </div>
  );
};
```

### MedicationList Component

```typescript
// src/components/medications/MedicationList.tsx

import React from 'react';
import { Medication } from '@/types/medication.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface MedicationListProps {
  medications: Medication[];
  loading?: boolean;
  onStatusUpdate?: (id: string, status: 'Ordered' | 'Given') => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  loading,
  onStatusUpdate,
}) => {
  if (loading) {
    return <div className="animate-pulse">Loading medications...</div>;
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No medications have been ordered for this patient.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medication</TableHead>
          <TableHead>Dosage</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Administered At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medications.map((medication) => (
          <TableRow key={medication.id}>
            <TableCell className="font-medium">{medication.name}</TableCell>
            <TableCell>{medication.dosage}</TableCell>
            <TableCell>{medication.frequency}</TableCell>
            <TableCell>{medication.administeredAt}</TableCell>
            <TableCell>
              <StatusBadge status={medication.status} />
            </TableCell>
            <TableCell>
              {medication.status === 'Ordered' && onStatusUpdate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(medication.id, 'Given')}
                >
                  Mark as Given
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

## 10. Route Configuration

```typescript
// src/routes/index.tsx (medications section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/medications', 
          element: withSuspense(OrderMedicationPage) 
        },
        { 
          path: '/patients/:id/medications/:medicationId', 
          element: withSuspense(MedicationDetailPage) 
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
|                  MEDICATIONS FLOW (FRONTEND)               |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER MEDICATION FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id/medications                 | |
|  |                    -> OrderMedicationPage            | |
|  |                    -> usePatient(id)                 | |
|  |                    -> Get patient name               | |
|  |                    -> Fill form                      | |
|  |                    -> Submit -> useOrderMedication() | |
|  |                    -> POST /patients/:id/medications | |
|  |                    -> Success -> /patients/:id       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW MEDICATIONS FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |                    -> Medications tab                | |
|  |                    -> usePatientMedications(id)      | |
|  |                    -> GET /patients/:id/medications  | |
|  |                    -> Display medication list        | |
|  |                    -> Filter by status               | |
|  |                    -> Mark as Given                  | |
|  |                    -> useUpdateMedicationStatus()    | |
|  |                    -> PUT /patients/:id/medications  | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
