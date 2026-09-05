# frontend-specification/17-digital-signatures.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND DIGITAL SIGNATURES SPECIFICATION

## 1. Overview

This document defines the frontend implementation for digital signature functionality used during home visit recording. Team members (Physicians and Nurses) can verify their identity by entering their email and password to "sign" a visit record, confirming their participation and approval of the clinical documentation.

**API Reference:** `api/14-signatures.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits/:visitId` | `VisitDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/signature.types.ts

export interface Signature {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: string;
  autoSigned: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface SignVisitRequest {
  email: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface SignVisitResponse {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: string;
  signedAt: string;
  ipAddress?: string;
}

export interface VisitSignaturesResponse {
  visitId: string;
  visitDate: string;
  teamLeader: Signature | null;
  physician: Signature | null;
  nurse: Signature | null;
  allSigned: boolean;
  totalSignatures: number;
}

export interface SignatureStatus {
  teamLeaderSigned: boolean;
  physicianSigned: boolean;
  nurseSigned: boolean;
  allSigned: boolean;
}
```

---

## 4. API Calls

```typescript
// src/api/signatures.ts

import api from './client';
import { 
  SignVisitRequest,
  SignVisitResponse,
  VisitSignaturesResponse
} from '@/types/signature.types';

export const signatureApi = {
  /**
   * Sign a visit as a team member
   * POST /visits/:visitId/sign
   */
  signVisit: (visitId: string, data: SignVisitRequest): Promise<SignVisitResponse> => {
    return api.post<SignVisitResponse>(`/visits/${visitId}/sign`, data).then((res) => res.data);
  },

  /**
   * Get all signatures for a visit
   * GET /visits/:visitId/signatures
   */
  getVisitSignatures: (visitId: string): Promise<VisitSignaturesResponse> => {
    return api.get<VisitSignaturesResponse>(`/visits/${visitId}/signatures`).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useSignatures.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signatureApi } from '@/api/signatures';
import { SignVisitRequest } from '@/types/signature.types';
import { toastUtils } from '@/lib/toast';

/**
 * Get all signatures for a visit
 */
export function useVisitSignatures(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'signatures'],
    queryFn: () => signatureApi.getVisitSignatures(visitId),
    enabled: !!visitId,
  });
}

/**
 * Sign a visit as a team member
 */
export function useSignVisit(visitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SignVisitRequest) => signatureApi.signVisit(visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'signatures'] });
      toastUtils.success('Signature added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to sign visit';
      toastUtils.error('Signature failed', message);
    },
  });
}
```

---

## 6. Components

### 6.1 SignatureSection

**Purpose:** Display signature status and provide signature functionality for team members

**Props:**

```typescript
interface SignatureSectionProps {
  visitId: string;
  visitDate: string;
  teamLeaderId?: string;
  physicianId?: string;
  nurseId?: string;
  onAllSigned?: () => void;
}
```

**Behavior:**
- Displays signature status for each team member
- Shows visual indicators (✅ Signed / ⬜ Pending)
- Team Leader is auto-signed (no action needed)
- Physician and Nurse can sign by entering email + password
- Prevents form submission until all required signatures are complete

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM SIGNATURES                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Team Leader: Dr. Smith                                    ✅ Signed │ │
│  │  Signed at: 2026-09-05 10:30 AM                                     │ │
│  │  (Automatically signed as the logged-in user)                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Physician: Dr. Kebede                                    ⬜ Pending │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Enter Email: [________________________]                             │ │
│  │  Enter Password: [________________________]                          │ │
│  │  [Sign as Physician]                                                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Nurse: Jane Doe                                          ⬜ Pending │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Enter Email: [________________________]                             │ │
│  │  Enter Password: [________________________]                          │ │
│  │  [Sign as Nurse]                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ⚠️ All team members must sign before the visit can be finalized.         │
│                                                                             │
│  [Save Visit (All signatures required)]                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/components/visits/SignatureSection.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitSignatures, useSignVisit } from '@/hooks/useSignatures';
import { signVisitSchema, SignVisitFormData } from '@/schemas/signature.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SignatureSectionProps {
  visitId: string;
  visitDate: string;
  teamLeaderId?: string;
  physicianId?: string;
  nurseId?: string;
  onAllSigned?: () => void;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({
  visitId,
  visitDate,
  teamLeaderId,
  physicianId,
  nurseId,
  onAllSigned,
}) => {
  const [signingRole, setSigningRole] = useState<'Physician' | 'Nurse' | null>(null);

  const { data: signatures, isLoading, refetch } = useVisitSignatures(visitId);
  const signMutation = useSignVisit(visitId);

  const form = useForm<SignVisitFormData>({
    resolver: zodResolver(signVisitSchema),
    defaultValues: {
      role: 'Physician',
      email: '',
      password: '',
    },
  });

  const handleSign = (role: 'Physician' | 'Nurse') => {
    const values = form.getValues();
    signMutation.mutate(
      { ...values, role },
      {
        onSuccess: () => {
          setSigningRole(null);
          form.reset({ role: 'Physician', email: '', password: '' });
          refetch();
          if (signatures?.allSigned) {
            onAllSigned?.();
          }
        },
      }
    );
  };

  const isTeamLeaderSigned = signatures?.teamLeader !== null;
  const isPhysicianSigned = signatures?.physician !== null;
  const isNurseSigned = signatures?.nurse !== null;
  const allSigned = signatures?.allSigned || false;

  const getSignatureBadge = (signed: boolean) => {
    return signed ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Signed
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading signatures...</div>;
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Team Signatures</h3>
        {allSigned && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✅ All Signed
          </Badge>
        )}
      </div>

      {/* Team Leader */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="font-medium">Team Leader</p>
          <p className="text-sm text-muted-foreground">
            {signatures?.teamLeader?.staffName || 'Not assigned'}
          </p>
          {signatures?.teamLeader?.signedAt && (
            <p className="text-xs text-muted-foreground">
              Signed at: {format(new Date(signatures.teamLeader.signedAt), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
        <div>
          {getSignatureBadge(isTeamLeaderSigned)}
          {signatures?.teamLeader?.autoSigned && (
            <span className="text-xs text-muted-foreground block text-center">
              Auto-signed
            </span>
          )}
        </div>
      </div>

      {/* Physician */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="font-medium">Physician</p>
          <p className="text-sm text-muted-foreground">
            {signatures?.physician?.staffName || 'Not signed'}
          </p>
          {signatures?.physician?.signedAt && (
            <p className="text-xs text-muted-foreground">
              Signed at: {format(new Date(signatures.physician.signedAt), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
        <div>
          {getSignatureBadge(isPhysicianSigned)}
          {!isPhysicianSigned && signingRole !== 'Physician' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSigningRole('Physician')}
            >
              Sign as Physician
            </Button>
          )}
        </div>
      </div>

      {/* Physician Sign Form */}
      {signingRole === 'Physician' && !isPhysicianSigned && (
        <div className="p-3 border rounded-lg space-y-3">
          <p className="text-sm font-medium">Sign as Physician</p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="physician-email">Email</Label>
              <Input
                id="physician-email"
                type="email"
                placeholder="physician@example.com"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="physician-password">Password</Label>
              <Input
                id="physician-password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-red-500' : ''}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSign('Physician')}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? 'Verifying...' : 'Confirm Signature'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSigningRole(null);
                form.reset({ role: 'Physician', email: '', password: '' });
              }}
            >
              Cancel
            </Button>
          </div>
          {form.formState.errors.root && (
            <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
          )}
        </div>
      )}

      {/* Nurse */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="font-medium">Nurse</p>
          <p className="text-sm text-muted-foreground">
            {signatures?.nurse?.staffName || 'Not signed'}
          </p>
          {signatures?.nurse?.signedAt && (
            <p className="text-xs text-muted-foreground">
              Signed at: {format(new Date(signatures.nurse.signedAt), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
        <div>
          {getSignatureBadge(isNurseSigned)}
          {!isNurseSigned && signingRole !== 'Nurse' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSigningRole('Nurse')}
            >
              Sign as Nurse
            </Button>
          )}
        </div>
      </div>

      {/* Nurse Sign Form */}
      {signingRole === 'Nurse' && !isNurseSigned && (
        <div className="p-3 border rounded-lg space-y-3">
          <p className="text-sm font-medium">Sign as Nurse</p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="nurse-email">Email</Label>
              <Input
                id="nurse-email"
                type="email"
                placeholder="nurse@example.com"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="nurse-password">Password</Label>
              <Input
                id="nurse-password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-red-500' : ''}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSign('Nurse')}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? 'Verifying...' : 'Confirm Signature'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSigningRole(null);
                form.reset({ role: 'Physician', email: '', password: '' });
              }}
            >
              Cancel
            </Button>
          </div>
          {form.formState.errors.root && (
            <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
          )}
        </div>
      )}

      {/* Status Message */}
      {!allSigned && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-700">
            All team members must sign before the visit can be finalized.
            {!isPhysicianSigned && ' Physician needs to sign.'}
            {!isNurseSigned && ' Nurse needs to sign.'}
          </p>
        </div>
      )}

      {allSigned && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">
            All team members have signed. This visit is ready to be finalized.
          </p>
        </div>
      )}
    </div>
  );
};
```

---

### 6.2 SignatureStatus

**Purpose:** Display signature status in visit detail page (read-only)

**Props:**

```typescript
interface SignatureStatusProps {
  visitId: string;
  compact?: boolean;
}
```

**Behavior:**
- Displays signature status for each team member
- Shows who signed and when
- Read-only view (no sign buttons)

**Visual Design (Compact):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Signatures: ✅ TL · ✅ MD · ⬜ RN                                         │
│ Last signed: 2026-09-01 10:30 AM                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Design (Full):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM SIGNATURES                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Team Leader: Dr. Smith                                    ✅ Signed      │
│  Signed at: 2026-09-05 10:30 AM                                           │
│                                                                             │
│  Physician: Dr. Kebede                                    ✅ Signed      │
│  Signed at: 2026-09-05 10:35 AM                                           │
│                                                                             │
│  Nurse: Jane Doe                                            ⬜ Pending    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Pages

### 7.1 RecordVisitPage (With Signatures)

**Route:** `/patients/:id/visits`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a home visit with digital signatures

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useRecordVisit(id)` mutation
3. Uses `useVisitSignatures()` to track signature status
4. React Hook Form with Zod validation
5. **Signature Section** displayed at the bottom of the form
6. **Save button is disabled until ALL signatures are complete**
7. On success, navigates back to patient detail

**Components:**

- `VisitForm`
- `SignatureSection`

**States:**

| State | UI |
|---|---|
| Idle | Form enabled, signatures pending |
| Signing | Signature form processing |
| All Signed | Save button enabled |
| Submitting | Form disabled with spinner |
| Success | Redirect to patient detail |

**Implementation:**

```typescript
// src/pages/staff/RecordVisitPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useRecordVisit } from '@/hooks/useVisits';
import { useVisitSignatures } from '@/hooks/useSignatures';
import { VisitForm } from '@/components/visits/VisitForm';
import { SignatureSection } from '@/components/visits/SignatureSection';
import { createVisitSchema, CreateVisitFormData } from '@/schemas/visit.schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useAuthStore } from '@/store/auth.store';

export const RecordVisitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id!;
  const user = useAuthStore((s) => s.user);

  const [visitId, setVisitId] = useState<string | null>(null);
  const [allSigned, setAllSigned] = useState(false);

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const recordMutation = useRecordVisit(patientId);
  const { data: signatures, refetch: refetchSignatures } = useVisitSignatures(visitId || '');

  const form = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      timeStarted: '09:00',
      timeEnded: '10:00',
      visitType: 'Routine',
      teamMembers: [{ role: 'TeamLeader', name: '' }],
      // ... other defaults
      teamLeaderId: user?.id || '',
      physicianId: '',
      nurseId: '',
    },
  });

  const onSubmit = (data: CreateVisitFormData) => {
    // Save the visit first
    recordMutation.mutate(data, {
      onSuccess: (response) => {
        setVisitId(response.id);
        // Signatures will be handled separately
        // Navigate after all signatures are complete
      },
    });
  };

  const handleAllSigned = () => {
    setAllSigned(true);
    // Navigate after all signatures are complete
    setTimeout(() => {
      navigate(`/patients/${patientId}`);
    }, 1000);
  };

  if (patientLoading) {
    return <LoadingSpinner />;
  }

  if (patientError || !patient) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  const isSaveDisabled = recordMutation.isPending || (visitId && !allSigned);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Record Home Visit - {patient.firstName} {patient.lastName}
      </h1>

      <VisitForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={recordMutation.isPending}
        error={recordMutation.error}
      />

      {/* Signature Section */}
      {visitId && (
        <div className="mt-6">
          <SignatureSection
            visitId={visitId}
            visitDate={form.getValues('visitDate')}
            teamLeaderId={form.getValues('teamLeaderId')}
            physicianId={form.getValues('physicianId')}
            nurseId={form.getValues('nurseId')}
            onAllSigned={handleAllSigned}
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaveDisabled}
          className="w-full"
        >
          {recordMutation.isPending ? 'Saving...' : 'Save Visit'}
        </Button>
      </div>
    </div>
  );
};
```

---

## 8. Validation Schema

```typescript
// src/schemas/signature.schema.ts

import { z } from 'zod';

export const signVisitSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['TeamLeader', 'Physician', 'Nurse'], {
    message: 'Invalid role. Must be TeamLeader, Physician, or Nurse',
  }),
});

export type SignVisitFormData = z.infer<typeof signVisitSchema>;
```

---

## 9. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              DIGITAL SIGNATURE FLOW (FRONTEND)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    RECORD VISIT FLOW                                │  │
│  │                                                                      │  │
│  │  Staff fills visit form                                             │  │
│  │         ↓                                                            │  │
│  │  Clicks "Save Visit"                                                 │  │
│  │         ↓                                                            │  │
│  │  Backend creates visit record                                        │  │
│  │         ↓                                                            │  │
│  │  Visit ID returned → Signature section appears                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SIGNATURE FLOW                                    │  │
│  │                                                                      │  │
│  │  Team Leader: ✅ Auto-signed (logged-in user)                       │  │
│  │                                                                      │  │
│  │  Physician:                                                          │  │
│  │    1. Enters email + password                                       │  │
│  │    2. Clicks "Sign as Physician"                                    │  │
│  │    3. Backend verifies credentials                                  │  │
│  │    4. If valid → ✅ Signed                                         │  │
│  │    5. If invalid → ❌ Error message                                │  │
│  │                                                                      │  │
│  │  Nurse:                                                              │  │
│  │    1. Enters email + password                                       │  │
│  │    2. Clicks "Sign as Nurse"                                        │  │
│  │    3. Backend verifies credentials                                  │  │
│  │    4. If valid → ✅ Signed                                         │  │
│  │    5. If invalid → ❌ Error message                                │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    COMPLETION FLOW                                  │  │
│  │                                                                      │  │
│  │  All team members signed?                                           │  │
│  │         ↓                                                            │  │
│  │  If YES → "All Signed" badge appears                               │  │
│  │         ↓                                                            │  │
│  │  Save button enabled                                                │  │
│  │         ↓                                                            │  │
│  │  Visit finalized → Navigate to patient detail                      │  │
│  │                                                                      │  │
│  │  If NO → "Pending signatures" message                              │  │
│  │         ↓                                                            │  │
│  │  Save button disabled                                               │  │
│  │         ↓                                                            │  │
│  │  User must complete all signatures                                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
