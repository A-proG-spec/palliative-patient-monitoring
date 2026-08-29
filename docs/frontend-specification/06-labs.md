# frontend-specification/06-labs.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND LABS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for laboratory test management features including ordering lab tests, viewing lab results, and updating test results.

**API Reference:** `api/06-labs.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/labs` | `OrderLabPage` | `DashboardLayout` | Staff |
| `/patients/:id/labs/:labId` | `LabDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/lab.types.ts

export interface LaboratoryTest {
  id: string;
  patientId: string;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabRequest {
  testName: string;
  dateOrdered: string;
  location: 'Home' | 'Hospital';
}

export interface UpdateLabRequest {
  datePerformed: string;
  result: string;
}

export interface LabListResponse {
  items: LaboratoryTest[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 4. API Calls

```typescript
// src/api/labs.ts

import api from './client';
import { LaboratoryTest, CreateLabRequest, UpdateLabRequest, LabListResponse } from '@/types/lab.types';

export const labApi = {
  /**
   * Order laboratory test
   * POST /patients/:patientId/labs
   */
  create: (patientId: string, data: CreateLabRequest): Promise<LaboratoryTest> => {
    return api.post<LaboratoryTest>(`/patients/${patientId}/labs`, data).then((res) => res.data);
  },

  /**
   * Get all lab tests for a patient
   * GET /patients/:patientId/labs
   */
  getByPatient: (patientId: string, params?: {
    status?: 'Ordered' | 'Completed';
    page?: number;
    limit?: number;
  }): Promise<LabListResponse> => {
    return api.get<LabListResponse>(`/patients/${patientId}/labs`, { params }).then((res) => res.data);
  },

  /**
   * Get lab test details
   * GET /patients/:patientId/labs/:labId
   */
  getById: (patientId: string, labId: string): Promise<LaboratoryTest> => {
    return api.get<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`).then((res) => res.data);
  },

  /**
   * Update lab test result (mark as Completed)
   * PUT /patients/:patientId/labs/:labId
   */
  updateResult: (patientId: string, labId: string, data: UpdateLabRequest): Promise<LaboratoryTest> => {
    return api.put<LaboratoryTest>(`/patients/${patientId}/labs/${labId}`, data).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useLabs.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/api/labs';
import { CreateLabRequest, UpdateLabRequest } from '@/types/lab.types';

/**
 * Get all lab tests for a patient
 */
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

/**
 * Get lab test details
 */
export function useLabDetail(patientId: string, labId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'labs', labId],
    queryFn: () => labApi.getById(patientId, labId),
    enabled: !!patientId && !!labId,
  });
}

/**
 * Order laboratory test
 */
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

/**
 * Update lab test result (mark as Completed)
 */
export function useUpdateLabResult(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labId, data }: { labId: string; data: UpdateLabRequest }) =>
      labApi.updateResult(patientId, labId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 6. Components

### 6.1 LabForm

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

**Visual Design:**

```
+-----------------------------------------------------------+
| Order Lab Test - Sarah Johnson                             |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Lab Test Details                                       | |
| | +---------------------------------------------------+ | |
| | | Test Name: [________________________]              | | |
| | | Date Ordered: [__/__/____]                        | | |
| | | Location: [Home / Hospital]                       | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                              [Cancel] [Order]         | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 LabList

**Purpose:** Display list of lab tests for a patient

**Props:**

```typescript
interface LabListProps {
  labs: LaboratoryTest[];
  patientId: string;
  loading?: boolean;
  onUpdateResult?: (labId: string, data: UpdateLabRequest) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Lab Tests                                                  |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Test Name          | Date Ordered | Status    | Result | |
| +--------------------+--------------+-----------+--------+ |
| | Complete Blood     | 2026-08-29   | Completed | Normal | |
| | Count              |              |           |        | |
| |                    |              |           |        | |
| | Urinalysis         | 2026-08-28   | Ordered   | -      | |
| |                    |              |           | [Enter | |
| |                    |              |           | Result]| |
| |                    |              |           |        | |
| | Blood Glucose      | 2026-08-27   | Completed | High   | |
| +--------------------+--------------+-----------+--------+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.3 LabCard

**Purpose:** Display lab test summary card

**Props:**

```typescript
interface LabCardProps {
  lab: LaboratoryTest;
  onUpdateResult?: (labId: string, data: UpdateLabRequest) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Complete Blood Count                                   | |
| | Ordered: 2026-08-29   Location: Home                  | |
| | Status: [Completed]                                    | |
| | Result: Normal                                         | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Urinalysis                                             | |
| | Ordered: 2026-08-28   Location: Home                  | |
| | Status: [Ordered]                                      | |
| | [Enter Result]                                         | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.4 ResultForm

**Purpose:** Form for entering lab test results

**Props:**

```typescript
interface ResultFormProps {
  labId: string;
  labName: string;
  onSubmit: (data: UpdateLabRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Enter Lab Result                                           |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Test: Complete Blood Count                             | |
| | +---------------------------------------------------+ | |
| | | Date Performed: [__/__/____]                      | | |
| | | Result:                                           | | |
| | | [                                              ]  | | |
| | | [                                              ]  | | |
| | | [                                              ]  | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                    [Cancel] [Save Result]             | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.5 StatusBadge

**Purpose:** Display lab test status with color coding

**Props:**

```typescript
interface StatusBadgeProps {
  status: 'Ordered' | 'Completed';
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Status Badges                                              |
|                                                           |
|  +----------+          +----------+                       |
|  | Ordered  |          | Completed|                       |
|  | (Yellow) |          | (Green)  |                       |
|  +----------+          +----------+                       |
+-----------------------------------------------------------+
```

---

## 7. Pages

### 7.1 OrderLabPage

**Route:** `/patients/:id/labs`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Order laboratory test for a patient

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useOrderLab(id)` mutation
3. React Hook Form with Zod validation
4. On success, shows success message and stays on page or navigates back
5. On error, displays validation errors

**Components:**

- `LabForm`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Success message displayed |

---

### 7.2 LabListPage

**Purpose:** View all lab tests for a patient

**Behavior:**

1. Uses `usePatientLabs(id)` hook
2. Displays lab test list
3. Filter by status (Ordered/Completed)
4. Enter result for Ordered tests

**Components:**

- `StatusFilter`
- `LabList`
- `ResultForm` (modal)
- `Pagination`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No lab tests ordered" |
| Success | Full lab test list |

---

### 7.3 LabDetailPage

**Route:** `/patients/:id/labs/:labId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View lab test details

**Behavior:**

1. Uses `useLabDetail(id, labId)` hook
2. Displays complete lab test information
3. Enter result button (if status is Ordered)
4. Back button

**Components:**

- `LabDetail`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full lab test details |

---

## 8. Form Validation Schema

```typescript
// src/schemas/lab.schema.ts

import { z } from 'zod';

export const createLabSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  dateOrdered: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  location: z.enum(['Home', 'Hospital']),
});

export const updateLabResultSchema = z.object({
  datePerformed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  result: z.string().min(1, 'Result is required'),
});

export type CreateLabFormData = z.infer<typeof createLabSchema>;
export type UpdateLabResultFormData = z.infer<typeof updateLabResultSchema>;
```

---

## 9. Page Implementations

### OrderLabPage

```typescript
// src/pages/staff/OrderLabPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useOrderLab } from '@/hooks/useLabs';
import { LabForm } from '@/components/labs/LabForm';
import { createLabSchema, CreateLabFormData } from '@/schemas/lab.schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const OrderLabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const orderMutation = useOrderLab(patientId);

  const form = useForm<CreateLabFormData>({
    resolver: zodResolver(createLabSchema),
    defaultValues: {
      location: 'Home',
      dateOrdered: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: CreateLabFormData) => {
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
        Order Lab Test - {patient.firstName} {patient.lastName}
      </h1>
      <LabForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={orderMutation.isPending}
        error={orderMutation.error}
      />
    </div>
  );
};
```

### LabList Component

```typescript
// src/components/labs/LabList.tsx

import React, { useState } from 'react';
import { LaboratoryTest, UpdateLabRequest } from '@/types/lab.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ResultFormModal } from './ResultFormModal';

interface LabListProps {
  labs: LaboratoryTest[];
  loading?: boolean;
  onUpdateResult?: (labId: string, data: UpdateLabRequest) => void;
}

export const LabList: React.FC<LabListProps> = ({
  labs,
  loading,
  onUpdateResult,
}) => {
  const [selectedLab, setSelectedLab] = useState<LaboratoryTest | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  if (loading) {
    return <div className="animate-pulse">Loading lab tests...</div>;
  }

  if (labs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No lab tests have been ordered for this patient.
      </div>
    );
  }

  const handleEnterResult = (lab: LaboratoryTest) => {
    setSelectedLab(lab);
    setIsResultModalOpen(true);
  };

  const handleResultSubmit = (data: UpdateLabRequest) => {
    if (selectedLab && onUpdateResult) {
      onUpdateResult(selectedLab.id, data);
      setIsResultModalOpen(false);
      setSelectedLab(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Name</TableHead>
            <TableHead>Date Ordered</TableHead>
            <TableHead>Date Performed</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labs.map((lab) => (
            <TableRow key={lab.id}>
              <TableCell className="font-medium">{lab.testName}</TableCell>
              <TableCell>{new Date(lab.dateOrdered).toLocaleDateString()}</TableCell>
              <TableCell>
                {lab.datePerformed ? new Date(lab.datePerformed).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>{lab.location}</TableCell>
              <TableCell>
                <StatusBadge status={lab.status} />
              </TableCell>
              <TableCell>{lab.result || '-'}</TableCell>
              <TableCell>
                {lab.status === 'Ordered' && onUpdateResult && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEnterResult(lab)}
                  >
                    Enter Result
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResultFormModal
        isOpen={isResultModalOpen}
        lab={selectedLab}
        onClose={() => setIsResultModalOpen(false)}
        onSubmit={handleResultSubmit}
      />
    </>
  );
};
```

### ResultFormModal

```typescript
// src/components/labs/ResultFormModal.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LaboratoryTest, UpdateLabRequest } from '@/types/lab.types';
import { updateLabResultSchema, UpdateLabResultFormData } from '@/schemas/lab.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';

interface ResultFormModalProps {
  isOpen: boolean;
  lab: LaboratoryTest | null;
  onClose: () => void;
  onSubmit: (data: UpdateLabRequest) => void;
}

export const ResultFormModal: React.FC<ResultFormModalProps> = ({
  isOpen,
  lab,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateLabResultFormData>({
    resolver: zodResolver(updateLabResultSchema),
    defaultValues: {
      datePerformed: new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = (data: UpdateLabResultFormData) => {
    onSubmit(data);
  };

  if (!lab) return null;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Enter Lab Result</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Test Name</Label>
            <p className="text-sm font-medium">{lab.testName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datePerformed">Date Performed</Label>
            <Input
              id="datePerformed"
              type="date"
              {...register('datePerformed')}
              className={errors.datePerformed ? 'border-red-500' : ''}
            />
            {errors.datePerformed && (
              <p className="text-sm text-red-500">{errors.datePerformed.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Result</Label>
            <Textarea
              id="result"
              placeholder="Enter test result..."
              rows={4}
              {...register('result')}
              className={errors.result ? 'border-red-500' : ''}
            />
            {errors.result && (
              <p className="text-sm text-red-500">{errors.result.message}</p>
            )}
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Result</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
```

---

## 10. Route Configuration

```typescript
// src/routes/index.tsx (labs section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/labs', 
          element: withSuspense(OrderLabPage) 
        },
        { 
          path: '/patients/:id/labs/:labId', 
          element: withSuspense(LabDetailPage) 
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
|                    LABS FLOW (FRONTEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    ORDER LAB FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id/labs -> OrderLabPage        | |
|  |                    -> usePatient(id)                 | |
|  |                    -> Get patient name               | |
|  |                    -> Fill form                      | |
|  |                    -> Submit -> useOrderLab()        | |
|  |                    -> POST /patients/:id/labs        | |
|  |                    -> Success -> /patients/:id       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW LABS FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |                    -> Labs tab                       | |
|  |                    -> usePatientLabs(id)             | |
|  |                    -> GET /patients/:id/labs         | |
|  |                    -> Display lab list               | |
|  |                    -> Filter by status               | |
|  |                    -> Enter Result                   | |
|  |                    -> useUpdateLabResult()           | |
|  |                    -> PUT /patients/:id/labs/:id     | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
