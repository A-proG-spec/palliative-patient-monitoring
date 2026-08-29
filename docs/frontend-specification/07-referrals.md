# frontend-specification/07-referrals.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND REFERRALS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for referral management features including requesting referrals, viewing referral history, and tracking referral status.

**API Reference:** `api/07-referrals.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/referrals` | `RequestReferralPage` | `DashboardLayout` | Staff |
| `/patients/:id/referrals/:referralId` | `ReferralDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/referral.types.ts

export interface Referral {
  id: string;
  patientId: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  actionTaken?: 'ReferralAccepted' | 'AppointmentScheduled' | 'AdditionalInfoRequested' | 'ReferralDeclined' | 'PatientAdmitted' | 'PatientTransferred' | null;
  outcome?: string | null;
  followUpDate?: string | null;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact' | null;
  requestedBy: string;
  approvedBy?: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralRequest {
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
}

export interface ReferralListResponse {
  items: Referral[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 4. API Calls

```typescript
// src/api/referrals.ts

import api from './client';
import { Referral, CreateReferralRequest, ReferralListResponse } from '@/types/referral.types';

export const referralApi = {
  /**
   * Request referral
   * POST /patients/:patientId/referrals
   */
  create: (patientId: string, data: CreateReferralRequest): Promise<Referral> => {
    return api.post<Referral>(`/patients/${patientId}/referrals`, data).then((res) => res.data);
  },

  /**
   * Get all referrals for a patient
   * GET /patients/:patientId/referrals
   */
  getByPatient: (patientId: string, params?: {
    status?: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
    page?: number;
    limit?: number;
  }): Promise<ReferralListResponse> => {
    return api.get<ReferralListResponse>(`/patients/${patientId}/referrals`, { params }).then((res) => res.data);
  },

  /**
   * Get referral details
   * GET /patients/:patientId/referrals/:referralId
   */
  getById: (patientId: string, referralId: string): Promise<Referral> => {
    return api.get<Referral>(`/patients/${patientId}/referrals/${referralId}`).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useReferrals.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi } from '@/api/referrals';
import { CreateReferralRequest } from '@/types/referral.types';

/**
 * Get all referrals for a patient
 */
export function usePatientReferrals(patientId: string, params?: {
  status?: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'referrals', params],
    queryFn: () => referralApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

/**
 * Get referral details
 */
export function useReferralDetail(patientId: string, referralId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'referrals', referralId],
    queryFn: () => referralApi.getById(patientId, referralId),
    enabled: !!patientId && !!referralId,
  });
}

/**
 * Request referral
 */
export function useRequestReferral(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReferralRequest) => referralApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'referrals'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

---

## 6. Components

### 6.1 ReferralForm

**Purpose:** Form for requesting a referral

**Props:**

```typescript
interface ReferralFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateReferralRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateReferralRequest>;
}
```

**Validation Schema:**

```typescript
export const createReferralSchema = z.object({
  referralType: z.enum(['Incoming', 'Outgoing']),
  referralDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
  ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
  kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100'),
  currentSymptoms: z.object({
    pain: z.number().min(0).max(10),
    dyspnea: z.number().min(0).max(10),
    fatigue: z.number().min(0).max(10),
    anxiety: z.number().min(0).max(10),
    depression: z.number().min(0).max(10),
  }),
  reasons: z.array(z.string()).min(1, 'At least one reason is required'),
  otherReason: z.string().optional(),
  referringFacility: z.string().min(1, 'Referring facility is required'),
  receivingFacility: z.string().min(1, 'Receiving facility is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  preparedByDesignation: z.string().min(1, 'Designation is required'),
  signature: z.string().min(1, 'Signature is required'),
});
```

**Behavior:**
- React Hook Form with Zod validation
- Fields: referralType, referralDate, primaryDiagnosis, diseaseStage, ppsScore, kpsScore, currentSymptoms, reasons, referringFacility, receivingFacility, contactPerson, contactNumber, preparedBy, preparedByDesignation, signature
- Submit button disabled when submitting
- Shows field-level errors
- Default referralType: Outgoing
- Default referralDate: today
- Default diseaseStage: Advanced
- **NEW:** preparedBy, preparedByDesignation, and signature fields added

---

### 6.2 ReferralList

**Purpose:** Display list of referrals for a patient

**Props:**

```typescript
interface ReferralListProps {
  referrals: Referral[];
  loading?: boolean;
  onViewDetail?: (id: string) => void;
}
```

**Behavior:**
- Renders table of referrals
- Columns: Date, Type, Reason, Receiving Facility, Status, Action
- Status badge with color coding (Pending: yellow, Accepted: green, Declined: red, Admitted: blue, InfoRequested: orange)
- "View Details" button
- Shows loading skeleton
- Shows empty state

---

### 6.3 ReferralCard

**Purpose:** Display referral summary card

**Props:**

```typescript
interface ReferralCardProps {
  referral: Referral;
  onClick?: (id: string) => void;
}
```

**Behavior:**
- Renders referral date, type, status
- Renders reason and receiving facility
- Click calls onClick with referral ID

---

### 6.4 ReferralDetail

**Purpose:** Display complete referral information

**Props:**

```typescript
interface ReferralDetailProps {
  referral: Referral;
  loading?: boolean;
  onBack?: () => void;
}
```

**Behavior:**
- Renders all referral sections:
  - Referral Information (type, date, status, facilities)
  - Clinical Information (diagnosis, stage, PPS, KPS)
  - Current Symptoms (pain, dyspnea, fatigue, anxiety, depression)
  - Reasons for Referral
  - Contact Information
  - Action Taken
  - Outcome
  - Follow-up (date, status)
  - Staff Documentation (preparedBy, preparedByDesignation, signature)

---

## 7. Pages

### 7.1 RequestReferralPage

**Route:** `/patients/:id/referrals`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Request a referral

**Local State:** React Hook Form

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useRequestReferral(id)` mutation
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

### 7.2 ReferralListPage

**Purpose:** View all referrals for a patient

**Behavior:**

1. Uses `usePatientReferrals(id)` hook
2. Displays referral list
3. Filter by status
4. Click to view details

**Components:**
- StatusFilter
- ReferralList
- Pagination

**States:**

| State | UI |
|---|---|
| Loading | Skeleton list |
| Error | Error message with retry |
| Empty | "No referrals" |
| Success | Full referral list |

---

### 7.3 ReferralDetailPage

**Route:** `/patients/:id/referrals/:referralId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View referral details

**Behavior:**

1. Uses `useReferralDetail(id, referralId)` hook
2. Displays complete referral information including all fields
3. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full referral details |

---

## 8. Page Implementations

### RequestReferralPage

```typescript
// src/pages/staff/RequestReferralPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useRequestReferral } from '@/hooks/useReferrals';
import { ReferralForm } from '@/components/referrals/ReferralForm';
import { createReferralSchema, CreateReferralFormData } from '@/schemas/referral.schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useAuthStore } from '@/store/auth.store';

export const RequestReferralPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;
  const user = useAuthStore((s) => s.user);

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const requestMutation = useRequestReferral(patientId);

  const form = useForm<CreateReferralFormData>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      referralType: 'Outgoing',
      referralDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced',
      currentSymptoms: {
        pain: 0,
        dyspnea: 0,
        fatigue: 0,
        anxiety: 0,
        depression: 0,
      },
      reasons: [],
      preparedBy: user?.name || '',
      preparedByDesignation: user?.role || '',
      signature: user?.name || '',
    },
  });

  const onSubmit = (data: CreateReferralFormData) => {
    requestMutation.mutate(data, {
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
        Request Referral - {patient.firstName} {patient.lastName}
      </h1>
      <ReferralForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={requestMutation.isPending}
        error={requestMutation.error}
      />
    </div>
  );
};
```

### ReferralList Component

```typescript
// src/components/referrals/ReferralList.tsx

import React from 'react';
import { Referral } from '@/types/referral.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface ReferralListProps {
  referrals: Referral[];
  loading?: boolean;
  onViewDetail?: (id: string) => void;
}

export const ReferralList: React.FC<ReferralListProps> = ({
  referrals,
  loading,
  onViewDetail,
}) => {
  if (loading) {
    return <div className="animate-pulse">Loading referrals...</div>;
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No referrals have been requested for this patient.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Receiving Facility</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((referral) => (
          <TableRow key={referral.id}>
            <TableCell>{new Date(referral.referralDate).toLocaleDateString()}</TableCell>
            <TableCell>{referral.referralType}</TableCell>
            <TableCell>
              {referral.reasons.slice(0, 2).join(', ')}
              {referral.reasons.length > 2 && ` +${referral.reasons.length - 2} more`}
            </TableCell>
            <TableCell>{referral.receivingFacility}</TableCell>
            <TableCell>
              <StatusBadge status={referral.status} />
            </TableCell>
            <TableCell>
              {onViewDetail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetail(referral.id)}
                >
                  View Details
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

## 9. Route Configuration

```typescript
// src/routes/index.tsx (referrals section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/referrals', 
          element: withSuspense(RequestReferralPage) 
        },
        { 
          path: '/patients/:id/referrals/:referralId', 
          element: withSuspense(ReferralDetailPage) 
        },
      ],
    },
  ],
}
```

---

## 10. Flow Diagram

```
+-----------------------------------------------------------+
|                   REFERRALS FLOW (FRONTEND)                |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REQUEST REFERRAL FLOW             | |
|  |                                                     | |
|  |  Staff -> /patients/:id/referrals                   | |
|  |         -> RequestReferralPage                      | |
|  |         -> usePatient(id)                           | |
|  |         -> Get patient name                         | |
|  |         -> Fill form (including preparedBy fields)  | |
|  |         -> Submit -> useRequestReferral()           | |
|  |         -> POST /patients/:id/referrals             | |
|  |         -> Success -> /patients/:id                 | |
|  |         -> Error -> Display validation errors       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW REFERRALS FLOW               | |
|  |                                                     | |
|  |  Staff -> /patients/:id -> PatientDetailPage        | |
|  |         -> Referrals tab                            | |
|  |         -> usePatientReferrals(id)                  | |
|  |         -> GET /patients/:id/referrals              | |
|  |         -> Display referral list                    | |
|  |         -> Filter by status                         | |
|  |         -> View details -> /patients/:id/referrals/:id | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DETAIL FLOW                       | |
|  |                                                     | |
|  |  Staff -> /patients/:id/referrals/:referralId       | |
|  |         -> ReferralDetailPage                       | |
|  |         -> useReferralDetail(id, referralId)        | |
|  |         -> GET /patients/:id/referrals/:id          | |
|  |         -> Display full referral details            | |
|  |         -> Shows all fields including:              | |
|  |            actionTaken, outcome, followUpDate,      | |
|  |            followUpStatus, preparedBy, signature    | |
|  |         -> Back to patient                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
