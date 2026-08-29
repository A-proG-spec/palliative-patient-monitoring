# function-level-specification/frontend/07-referrals.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FUNCTION-LEVEL SPEC: REFERRALS

## 1. Overview

This document defines the function-level specification for frontend referral management features including requesting referrals, viewing referral history, and tracking referral status.

**Files Covered:**
- `src/api/referrals.ts`
- `src/hooks/useReferrals.ts`
- `src/components/referrals/ReferralForm.tsx`
- `src/components/referrals/ReferralList.tsx`
- `src/components/referrals/ReferralCard.tsx`
- `src/components/referrals/ReferralDetail.tsx`
- `src/pages/staff/RequestReferralPage.tsx`
- `src/pages/staff/ReferralListPage.tsx`
- `src/pages/staff/ReferralDetailPage.tsx`

---

## 2. API Layer

### src/api/referrals.ts

| Function | Signature | Purpose |
|---|---|---|
| create | `(patientId: string, data: CreateReferralRequest): Promise<Referral>` | POST /patients/:patientId/referrals |
| getByPatient | `(patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ReferralListResponse>` | GET /patients/:patientId/referrals |
| getById | `(patientId: string, referralId: string): Promise<Referral>` | GET /patients/:patientId/referrals/:referralId |

**Implementation:**

```typescript
import api from './client';
import { Referral, CreateReferralRequest, ReferralListResponse } from '@/types/referral.types';

export const referralApi = {
  create: (patientId: string, data: CreateReferralRequest): Promise<Referral> => {
    return api.post<Referral>(`/patients/${patientId}/referrals`, data).then((res) => res.data);
  },

  getByPatient: (patientId: string, params?: {
    status?: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
    page?: number;
    limit?: number;
  }): Promise<ReferralListResponse> => {
    return api.get<ReferralListResponse>(`/patients/${patientId}/referrals`, { params }).then((res) => res.data);
  },

  getById: (patientId: string, referralId: string): Promise<Referral> => {
    return api.get<Referral>(`/patients/${patientId}/referrals/${referralId}`).then((res) => res.data);
  },
};
```

---

## 3. Hooks

### src/hooks/useReferrals.ts

#### usePatientReferrals

| Field | Detail |
|---|---|
| Signature | `usePatientReferrals(patientId: string, params?: { status?: string; page?: number; limit?: number }): UseQueryResult<ReferralListResponse>` |
| Query Key | `['patients', patientId, 'referrals', params]` |
| Purpose | Get all referrals for a patient with pagination and status filter |
| Auth | Staff, Admin |
| Enabled | `!!patientId` |
| Edge Cases | No referrals -> items: [] |

**Implementation:**

```typescript
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
```

---

#### useReferralDetail

| Field | Detail |
|---|---|
| Signature | `useReferralDetail(patientId: string, referralId: string): UseQueryResult<Referral>` |
| Query Key | `['patients', patientId, 'referrals', referralId]` |
| Purpose | Get referral details by ID |
| Auth | Staff, Admin |
| Enabled | `!!patientId && !!referralId` |
| Edge Cases | Referral not found -> 404 error |

**Implementation:**

```typescript
export function useReferralDetail(patientId: string, referralId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'referrals', referralId],
    queryFn: () => referralApi.getById(patientId, referralId),
    enabled: !!patientId && !!referralId,
  });
}
```

---

#### useRequestReferral

| Field | Detail |
|---|---|
| Signature | `useRequestReferral(patientId: string): UseMutationResult<Referral, AxiosError, CreateReferralRequest>` |
| Purpose | Request a referral |
| Side Effects | Invalidates referrals and summary queries |
| Auth | Staff |

**Implementation:**

```typescript
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

## 4. Components

### 4.1 ReferralForm

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
});
```

**Behavior:**
- React Hook Form with Zod validation
- Fields: referralType, referralDate, primaryDiagnosis, diseaseStage, ppsScore, kpsScore, currentSymptoms, reasons, referringFacility, receivingFacility, contactPerson, contactNumber
- Submit button disabled when submitting
- Shows field-level errors
- Default referralType: Outgoing
- Default referralDate: today
- Default diseaseStage: Advanced

---

### 4.2 ReferralList

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

### 4.3 ReferralCard

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

### 4.4 ReferralDetail

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
  - Follow-up

---

## 5. Pages

### 5.1 RequestReferralPage

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

### 5.2 ReferralListPage

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

### 5.3 ReferralDetailPage

**Route:** `/patients/:id/referrals/:referralId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View referral details

**Behavior:**

1. Uses `useReferralDetail(id, referralId)` hook
2. Displays complete referral information
3. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full referral details |

---

## 6. Flow Diagram

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
|  |         -> Fill form                                | |
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
|  |         -> Back to patient                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
