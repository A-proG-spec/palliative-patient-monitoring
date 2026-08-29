# frontend-specification/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMISSIONS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for hospital admission management features including recording admissions, viewing admission history, and updating admission status.

**API Reference:** `api/08-admissions.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/admissions` | `RecordAdmissionPage` | `DashboardLayout` | Staff |
| `/patients/:id/admissions/:admissionId` | `AdmissionDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/admission.types.ts

export interface HospitalAdmission {
  id: string;
  patientId: string;
  referralId: string;
  admissionDate: string;
  dischargeDate?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionRequest {
  referralId: string;
  admissionDate: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

export interface AdmissionListResponse {
  items: HospitalAdmission[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 4. API Calls

```typescript
// src/api/admissions.ts

import api from './client';
import { HospitalAdmission, CreateAdmissionRequest, UpdateAdmissionRequest, AdmissionListResponse } from '@/types/admission.types';

export const admissionApi = {
  /**
   * Record hospital admission
   * POST /patients/:patientId/admissions
   */
  create: (patientId: string, data: CreateAdmissionRequest): Promise<HospitalAdmission> => {
    return api.post<HospitalAdmission>(`/patients/${patientId}/admissions`, data).then((res) => res.data);
  },

  /**
   * Get all admissions for a patient
   * GET /patients/:patientId/admissions
   */
  getByPatient: (patientId: string, params?: {
    status?: 'Active' | 'Discharged';
    page?: number;
    limit?: number;
  }): Promise<AdmissionListResponse> => {
    return api.get<AdmissionListResponse>(`/patients/${patientId}/admissions`, { params }).then((res) => res.data);
  },

  /**
   * Get admission details
   * GET /patients/:patientId/admissions/:admissionId
   */
  getById: (patientId: string, admissionId: string): Promise<HospitalAdmission> => {
    return api.get<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`).then((res) => res.data);
  },

  /**
   * Update admission status (discharge)
   * PUT /patients/:patientId/admissions/:admissionId
   */
  update: (patientId: string, admissionId: string, data: UpdateAdmissionRequest): Promise<HospitalAdmission> => {
    return api.put<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`, data).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useAdmissions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '@/api/admissions';
import { CreateAdmissionRequest, UpdateAdmissionRequest } from '@/types/admission.types';

/**
 * Get all admissions for a patient
 */
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

/**
 * Get admission details
 */
export function useAdmissionDetail(patientId: string, admissionId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'admissions', admissionId],
    queryFn: () => admissionApi.getById(patientId, admissionId),
    enabled: !!patientId && !!admissionId,
  });
}

/**
 * Record hospital admission
 */
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

/**
 * Update admission status (discharge)
 */
export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdmissionRequest }) =>
      admissionApi.update(patientId, admissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 6. Components

### 6.1 AdmissionForm

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

**Visual Design:**

```
+-----------------------------------------------------------+
| Record Hospital Admission - Sarah Johnson                  |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Referral Information                                   | |
| | +---------------------------------------------------+ | |
| | | Referral: [Select accepted referral]               | | |
| | | Admission Date: [__/__/____]                      | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Bed & Ward Details                                    | | |
| | +---------------------------------------------------+ | |
| | | Bed Number: [________]   Ward: [________]         | | |
| | | Admitting Physician: [________________________]   | | |
| | | Care Team: [________________________]             | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Medical Information                                   | | |
| | +---------------------------------------------------+ | |
| | | Primary Diagnosis: [________________________]      | | |
| | | Secondary Diagnoses: [________________________]   | | |
| | | Disease Stage: [Early/Advanced/Terminal]          | | |
| | | Comorbidities: [________________________]         | | |
| | | Estimated Prognosis: [Days/Weeks/Months/Uncertain]| | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Palliative Assessment                                 | | |
| | +---------------------------------------------------+ | |
| | | PPS Score: [___] %                               | | |
| | | Functional Status: [FullyIndependent/Partially/   | | |
| | |                    FullyDependent]                | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Pain & Symptom Assessment                             | | |
| | +---------------------------------------------------+ | |
| | | Pain Score: [0-10]                                | | |
| | | Pain Type: [Acute/Chronic/Neuropathic/Mixed]      | | |
| | | Symptoms: [ ] Dyspnea  [ ] Nausea  [ ] Fatigue   | | |
| | |          [ ] Anxiety  [ ] Depression  [ ] Insomnia| | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Psychosocial & Spiritual Assessment                   | | |
| | +---------------------------------------------------+ | |
| | | Emotional Status: [Stable/Anxious/Depressed/...]  | | |
| | | Family Support: [Strong/Moderate/Weak/None]       | | |
| | | Social Challenges: [________________________]     | | |
| | | Spiritual Concerns: [Yes/No]                     | | |
| | | Spiritual Support: [ReligiousLeader/Counselor/Other]| | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Initial Care Plan                                     | | |
| | +---------------------------------------------------+ | |
| | | Pain Management Plan: [________________________]  | | |
| | | Medication Plan: [________________________]       | | |
| | | Nursing Care Plan: [________________________]     | | |
| | | Home-Based Care Required: [Yes/No]               | | |
| | | Psychosocial Support Plan: [____________________] | | |
| | | Physiotherapy Required: [Yes/No]                 | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| |                              [Cancel] [Save]          | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 AdmissionList

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

**Visual Design:**

```
+-----------------------------------------------------------+
| Hospital Admissions                                        |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date       | Bed   | Ward   | Status   | Action       | |
| +------------+-------+--------+----------+--------------+ |
| | 2026-08-30 | B-12  | Pallia-| Active   | [View]       | |
| |            |       | tive   |          | [Discharge]  | |
| |            |       | Ward   |          |              | |
| | 2026-08-22 | A-05  | Medical| Dischar- | [View]       | |
| |            |       | Ward   | ged      |              | |
| +------------+-------+--------+----------+--------------+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.3 AdmissionCard

**Purpose:** Display admission summary card

**Props:**

```typescript
interface AdmissionCardProps {
  admission: HospitalAdmission;
  onClick?: (id: string) => void;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Admission: 2026-08-30                                  | |
| | Bed: B-12   Ward: Palliative Care Ward                | |
| | Status: [Active]                                      | |
| | Physician: Dr. Kebede                                 | |
| | Care Team: Team A                                     | |
| | Diagnosis: Stage IV Breast Cancer                     | |
| |                                    [View Details]     | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.4 AdmissionDetail

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

**Visual Design:**

```
+-----------------------------------------------------------+
| Admission Details                                          |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Admission Information                                  | |
| | Date: 2026-08-30   Status: [Active]                   | |
| | Bed: B-12   Ward: Palliative Care Ward                | |
| | Physician: Dr. Kebede   Care Team: Team A             | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Referral Information                                   | |
| | Referral ID: REF-001                                  | |
| | From: Home Care Unit                                  | |
| | To: Yekatit 12 Hospital                               | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Medical Diagnosis                                      | |
| | Primary: Stage IV Breast Cancer                       | |
| | Secondary: Metastatic to bone                         | |
| | Stage: Advanced                                       | |
| | Prognosis: Months                                     | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Pain & Symptoms                                        | |
| | Pain Score: 4/10   Type: Mixed                        | |
| | Symptoms: Fatigue, Anxiety                            | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Care Plan                                              | |
| | Pain Management: Morphine 10mg every 6 hours          | |
| | Medication: Continue current medications              | |
| | Nursing: Daily monitoring and pain assessment         | |
| | Home-Based Care: No                                   | |
| | Physiotherapy: No                                     | |
| +-------------------------------------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Discharge Information                                  | |
| | Discharge Date: -   Reason: -                         | |
| +-------------------------------------------------------+ |
|                                                           |
|                         [Back] [Discharge Patient]        |
+-----------------------------------------------------------+
```

---

### 6.5 StatusBadge

**Purpose:** Display admission status with color coding

**Props:**

```typescript
interface StatusBadgeProps {
  status: 'Active' | 'Discharged';
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Status Badges                                              |
|                                                           |
|  +----------+          +----------+                       |
|  | Active   |          | Dischar- |                       |
|  | (Green)  |          | ged      |                       |
|  +----------+          | (Gray)   |                       |
|                        +----------+                       |
+-----------------------------------------------------------+
```

---

### 6.6 DischargeModal

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

**Visual Design:**

```
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Discharge Patient                                      | |
| | ----------------------------------------------------- | |
| |                                                       | |
| | Are you sure you want to discharge Sarah Johnson?    | |
| |                                                       | |
| | Discharge Date: [__/__/____]                         | |
| |                                                       | |
| | Reason for Discharge:                                 | |
| | ( ) Improved                                          | |
| | ( ) Deceased                                          | |
| |                                                       | |
| |              [Cancel] [Confirm Discharge]             | |
| |                                                       | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

## 7. Pages

### 7.1 RecordAdmissionPage

**Route:** `/patients/:id/admissions`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a hospital admission for a patient

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `usePatientReferrals(id)` to get accepted referrals
3. Uses `useRecordAdmission(id)` mutation
4. React Hook Form with Zod validation
5. On success, navigates back to patient detail
6. On error, displays validation errors

**Components:**

- `AdmissionForm`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 7.2 AdmissionListPage

**Purpose:** View all admissions for a patient

**Behavior:**

1. Uses `usePatientAdmissions(id)` hook
2. Displays admission list
3. Filter by status (Active/Discharged)
4. View details or discharge patient

**Components:**

- `StatusFilter`
- `AdmissionList`
- `Pagination`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No admissions" |
| Success | Full admission list |

---

### 7.3 AdmissionDetailPage

**Route:** `/patients/:id/admissions/:admissionId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View admission details and discharge patient

**Behavior:**

1. Uses `useAdmissionDetail(id, admissionId)` hook
2. Displays complete admission information
3. Discharge button (if status is Active)
4. Back button

**Components:**

- `AdmissionDetail`
- `DischargeModal`

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full admission details |

---

## 8. Form Validation Schema

```typescript
// src/schemas/admission.schema.ts

import { z } from 'zod';

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

export const updateAdmissionSchema = z.object({
  dischargeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
  status: z.enum(['Active', 'Discharged']),
});

export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
```

---

## 9. Page Implementations

### RecordAdmissionPage

```typescript
// src/pages/staff/RecordAdmissionPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { useRecordAdmission } from '@/hooks/useAdmissions';
import { AdmissionForm } from '@/components/admissions/AdmissionForm';
import { createAdmissionSchema, CreateAdmissionFormData } from '@/schemas/admission.schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

export const RecordAdmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const { data: referralsData, isLoading: referralsLoading } = usePatientReferrals(patientId);
  const recordMutation = useRecordAdmission(patientId);

  const form = useForm<CreateAdmissionFormData>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: {
      admissionDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced',
      functionalStatus: 'PartiallyDependent',
      painType: 'Mixed',
      emotionalStatus: 'Stable',
      familySupport: 'Moderate',
      spiritualConcerns: false,
      homeBasedCareRequired: false,
      physiotherapyRequired: false,
    },
  });

  const onSubmit = (data: CreateAdmissionFormData) => {
    recordMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/patients/${patientId}`);
      },
    });
  };

  if (patientLoading || referralsLoading) {
    return <LoadingSpinner />;
  }

  if (patientError || !patient) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  const acceptedReferrals = referralsData?.items.filter(
    (r) => r.status === 'Accepted'
  ) || [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Record Hospital Admission - {patient.firstName} {patient.lastName}
      </h1>
      <AdmissionForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={recordMutation.isPending}
        error={recordMutation.error}
        referrals={acceptedReferrals}
      />
    </div>
  );
};
```

### AdmissionList Component

```typescript
// src/components/admissions/AdmissionList.tsx

import React from 'react';
import { HospitalAdmission } from '@/types/admission.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface AdmissionListProps {
  admissions: HospitalAdmission[];
  loading?: boolean;
  onViewDetail?: (id: string) => void;
  onDischarge?: (id: string) => void;
}

export const AdmissionList: React.FC<AdmissionListProps> = ({
  admissions,
  loading,
  onViewDetail,
  onDischarge,
}) => {
  if (loading) {
    return <div className="animate-pulse">Loading admissions...</div>;
  }

  if (admissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hospital admissions have been recorded for this patient.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admission Date</TableHead>
          <TableHead>Bed</TableHead>
          <TableHead>Ward</TableHead>
          <TableHead>Physician</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admissions.map((admission) => (
          <TableRow key={admission.id}>
            <TableCell>{new Date(admission.admissionDate).toLocaleDateString()}</TableCell>
            <TableCell>{admission.bedNumber}</TableCell>
            <TableCell>{admission.ward}</TableCell>
            <TableCell>{admission.admittingPhysician}</TableCell>
            <TableCell>
              <StatusBadge status={admission.status} />
            </TableCell>
            <TableCell>
              {onViewDetail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetail(admission.id)}
                >
                  View
                </Button>
              )}
              {onDischarge && admission.status === 'Active' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-2"
                  onClick={() => onDischarge(admission.id)}
                >
                  Discharge
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
// src/routes/index.tsx (admissions section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/admissions', 
          element: withSuspense(RecordAdmissionPage) 
        },
        { 
          path: '/patients/:id/admissions/:admissionId', 
          element: withSuspense(AdmissionDetailPage) 
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
|                  ADMISSIONS FLOW (FRONTEND)                |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD ADMISSION FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id/admissions                  | |
|  |                    -> RecordAdmissionPage            | |
|  |                    -> usePatient(id)                 | |
|  |                    -> Get patient name               | |
|  |                    -> usePatientReferrals(id)        | |
|  |                    -> Get accepted referrals         | |
|  |                    -> Fill form                      | |
|  |                    -> Submit -> useRecordAdmission() | |
|  |                    -> POST /patients/:id/admissions  | |
|  |                    -> Success -> /patients/:id       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW ADMISSIONS FLOW              | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |                    -> Admissions tab                 | |
|  |                    -> usePatientAdmissions(id)       | |
|  |                    -> GET /patients/:id/admissions   | |
|  |                    -> Display admission list         | |
|  |                    -> Filter by status               | |
|  |                    -> View details                   | |
|  |                    -> /patients/:id/admissions/:id   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DISCHARGE FLOW                    | |
|  |                                                     | |
|  |  Staff -> /patients/:id/admissions/:admissionId     | |
|  |                    -> AdmissionDetailPage            | |
|  |                    -> Click Discharge                 | |
|  |                    -> Open DischargeModal            | |
|  |                    -> Select reason & date           | |
|  |                    -> Confirm -> useUpdateAdmission()| |
|  |                    -> PUT /patients/:id/admissions   | |
|  |                    -> Refresh list and details       | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
