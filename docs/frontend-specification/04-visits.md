# frontend-specification/04-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND VISITS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for home visit features including recording home visits, viewing visit history, and digital signatures for team members.

**API Reference:** `api/04-visits.md`, `api/14-signatures.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits/:visitId` | `VisitDetailPage` | `DashboardLayout` | Staff |

---

## 3. Types

```typescript
// src/types/visit.types.ts

export interface HomeVisit {
  id: string;
  patientId: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: { role: string; name: string }[];
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation: string[];
  painCharacteristics: string[];
  painMedicationEffective: boolean;
  symptoms: string[];
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;
  kpsScore: number;
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: { name: string; dosage: string; frequency: string; route: string }[];
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
  createdAt: string;
  isFinalized?: boolean;
}

export interface CreateVisitRequest {
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: { role: string; name: string }[];
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective: boolean;
  symptoms?: string[];
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;
  kpsScore: number;
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: { name: string; dosage: string; frequency: string; route: string }[];
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
}

export interface VisitListResponse {
  items: HomeVisit[];
  page: number;
  limit: number;
  total: number;
}
```

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
// src/api/visits.ts

import api from './client';
import { HomeVisit, CreateVisitRequest, VisitListResponse } from '@/types/visit.types';

export const visitApi = {
  /**
   * Record home visit
   * POST /patients/:patientId/visits
   */
  create: (patientId: string, data: CreateVisitRequest): Promise<HomeVisit> => {
    return api.post<HomeVisit>(`/patients/${patientId}/visits`, data).then((res) => res.data);
  },

  /**
   * Get all visits for a patient
   * GET /patients/:patientId/visits
   */
  getByPatient: (patientId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<VisitListResponse> => {
    return api.get<VisitListResponse>(`/patients/${patientId}/visits`, { params }).then((res) => res.data);
  },

  /**
   * Get visit details
   * GET /patients/:patientId/visits/:visitId
   */
  getById: (patientId: string, visitId: string): Promise<HomeVisit> => {
    return api.get<HomeVisit>(`/patients/${patientId}/visits/${visitId}`).then((res) => res.data);
  },
};
```

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
// src/hooks/useVisits.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '@/api/visits';
import { CreateVisitRequest } from '@/types/visit.types';

/**
 * Get all visits for a patient
 */
export function usePatientVisits(patientId: string, params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', params],
    queryFn: () => visitApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

/**
 * Get visit details
 */
export function useVisitDetail(patientId: string, visitId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'visits', visitId],
    queryFn: () => visitApi.getById(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
}

/**
 * Record home visit
 */
export function useRecordVisit(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress'] });
    },
  });
}
```

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

### 6.1 VisitForm

**Purpose:** Form for recording home visits

**Props:**

```typescript
interface VisitFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateVisitRequest) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateVisitRequest>;
  isFinalized?: boolean;
}
```

**Visual Design:**

```
+-----------------------------------------------------------+
| Record Home Visit - Sarah Johnson                          |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Visit Details                                          | |
| | +---------------------------------------------------+ | |
| | | Date: [__/__/____]  Start: [__:__]  End: [__:__]   | | |
| | | Type: [Routine/Emergency/FirstAssessment/...]      | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | Team Members                                           | |
| | +---------------------------------------------------+ | |
| | | Role: [TeamLeader/Physician/Nurse] Name: [_______] | | |
| | | [Add Member]                                       | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | ... (all other visit fields)                          | |
| |                                                       | |
| | +---------------------------------------------------+ | |
| | | TEAM SIGNATURES                                   | | |
| | | Team Leader: Dr. Smith                    ✅ Signed | | |
| | | (Automatically signed)                             | | |
| | |                                                   | | |
| | | Physician: Dr. Kebede                    ⬜ Pending | | |
| | | Email: [________________________]                  | | |
| | | Password: [________________________]               | | |
| | | [Sign as Physician]                               | | |
| | |                                                   | | |
| | | Nurse: Jane Doe                          ⬜ Pending | | |
| | | Email: [________________________]                  | | |
| | | Password: [________________________]               | | |
| | | [Sign as Nurse]                                   | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
| | ⚠️ All team members must sign before finalizing.     | |
| |                                                       | |
| |                          [Cancel] [Finalize Visit]    | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.2 SignatureSection

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

### 6.3 SignatureStatus

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

### 6.4 VisitList (UPDATED)

**Purpose:** Display list of visits for a patient with signature status

**Props:**

```typescript
interface VisitListProps {
  visits: HomeVisit[];
  patientId: string;
  loading?: boolean;
}
```

**Visual Design (UPDATED):**

```
+-----------------------------------------------------------+
| Visit History                                              |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date       | Type        | Status     | Outcome  | Staff| |
| +------------+-------------+------------+----------+------+ |
| | 2026-08-29 | Routine     | Stable     | Stable   | Jane | |
| |            |             | ✅ Signed  |          | Doe  | |
| | 2026-08-22 | Emergency   | Critical   | Referred | John | |
| |            |             | ⬜ Pending | to       | Smith| |
| |            |             |            | Facility |      | |
| | 2026-08-15 | First       | Stable     | Stable   | Jane | |
| |            | Assessment  | ✅ Signed  |          | Doe  | |
| +------------+-------------+------------+----------+------+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.5 VisitDetail (UPDATED)

**Purpose:** Display detailed visit information with signatures

**Props:**

```typescript
interface VisitDetailProps {
  visit: HomeVisit;
  loading?: boolean;
  onBack?: () => void;
}
```

**Behavior:**
- Displays all visit details
- Includes signature section showing who signed and when
- Shows if visit is finalized

---

## 7. Pages

### 7.1 RecordVisitPage (UPDATED)

**Route:** `/patients/:id/visits`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** Record a home visit with digital signatures

**Behavior:**

1. Uses `usePatient(id)` to get patient name
2. Uses `useRecordVisit(id)` mutation
3. Uses `useVisitSignatures()` to track signature status
4. React Hook Form with Zod validation
5. **Signature Section** displayed after visit is created
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
      overallStatus: 'Stable',
      mobility: 'Ambulatory',
      painScore: 0,
      painMedicationEffective: false,
      ppsScore: 100,
      kpsScore: 100,
      appetite: 'Good',
      oralIntake: 'Adequate',
      hydrationStatus: 'Adequate',
      emotionalStatus: 'Stable',
      familySupport: 'Good',
      financialDifficulty: false,
      spiritualNeeds: false,
      religiousSupportRequested: false,
      medicationAvailable: false,
      medicationCorrectlyTaken: false,
      medicationSideEffects: false,
      medicationRefillNeeded: false,
      morphineAvailable: false,
      adherenceLevel: 'Good',
      caregiverBurden: 'Low',
      caregiverUnderstanding: 'Good',
      caregivingCapacity: 'Strong',
      familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
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

### 7.2 VisitDetailPage (UPDATED)

**Route:** `/patients/:id/visits/:visitId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View visit details with signatures

**Behavior:**

1. Uses `useVisitDetail(id, visitId)` hook
2. Uses `useVisitSignatures(visitId)` hook
3. Displays complete visit information
4. Displays signature status (who signed, when)
5. Back button to patient detail

**Components:**

- `VisitDetail`
- `SignatureStatus`

---

## 8. Validation Schemas

```typescript
// src/schemas/visit.schema.ts

import { z } from 'zod';

export const createVisitSchema = z.object({
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']),
  teamMembers: z.array(z.object({
    role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
    name: z.string().min(1, 'Name is required'),
  })).min(1, 'At least one team member is required'),
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),
  vitals: z.object({
    temperature: z.number().optional(),
    pulse: z.number().optional(),
    bp: z.string().optional(),
    respiration: z.number().optional(),
    spo2: z.number().optional(),
  }).optional(),
  painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10'),
  painLocation: z.array(z.string()).optional(),
  painCharacteristics: z.array(z.string()).optional(),
  painMedicationEffective: z.boolean(),
  symptoms: z.array(z.string()).optional(),
  adl: z.object({
    feeding: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    bathing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    dressing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    toileting: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    mobility: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
  }),
  ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
  kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100'),
  appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
  oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
  hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
  familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
  financialDifficulty: z.boolean(),
  spiritualNeeds: z.boolean(),
  religiousSupportRequested: z.boolean(),
  medicationAvailable: z.boolean(),
  medicationCorrectlyTaken: z.boolean(),
  medicationSideEffects: z.boolean(),
  medicationRefillNeeded: z.boolean(),
  morphineAvailable: z.boolean(),
  adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
  currentMedications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    route: z.string(),
  })).optional(),
  caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
  caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
  caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
  familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),
  educationProvided: z.array(z.string()).optional(),
  homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
  homeObservations: z.array(z.string()).optional(),
  nursingCareGiven: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  redFlagActions: z.string().optional(),
  referralsMade: z.array(z.string()).optional(),
  outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']),
  nextVisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  physicianId: z.string().min(1, 'Physician is required'),
  nurseId: z.string().min(1, 'Nurse is required'),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
```

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

## 9. Route Configuration

```typescript
// src/routes/index.tsx (visits section)

{
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { 
          path: '/patients/:id/visits', 
          element: withSuspense(RecordVisitPage) 
        },
        { 
          path: '/patients/:id/visits/:visitId', 
          element: withSuspense(VisitDetailPage) 
        },
      ],
    },
  ],
}
```

---

## 10. Flow Diagram (UPDATED)

```
+-----------------------------------------------------------+
|              VISITS FLOW WITH SIGNATURES (FRONTEND)        |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    RECORD VISIT FLOW                 | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits -> RecordVisitPage   | |
|  |                    -> usePatient(id)                 | |
|  |                    -> Get patient name               | |
|  |                    -> Fill form                      | |
|  |                    -> Submit -> useRecordVisit()     | |
|  |                    -> POST /patients/:id/visits      | |
|  |                    -> Visit created → visitId set   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SIGNATURE FLOW                    | |
|  |                                                     | |
|  |  Team Leader: ✅ Auto-signed                        | |
|  |  Physician:   Enter email + password → Sign        | |
|  |  Nurse:       Enter email + password → Sign        | |
|  |                                                     | |
|  |  useSignVisit() → POST /visits/:visitId/sign       | |
|  |  Success → ✅ Signed   Error → ❌ Error message    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    COMPLETION FLOW                   | |
|  |                                                     | |
|  |  All team members signed?                           | |
|  |    ↓                                                | |
|  |  YES → ✅ "All Signed" badge                        | |
|  |         → Save button enabled                        | |
|  |         → Click Save → Navigate to patient detail   | |
|  |                                                     | |
|  |  NO → ⬜ "Pending signatures" message               | |
|  |       → Save button disabled                         | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VIEW VISIT FLOW                   | |
|  |                                                     | |
|  |  Staff -> /patients/:id/visits/:visitId             | |
|  |                    -> VisitDetailPage                | |
|  |                    -> useVisitDetail(id, visitId)    | |
|  |                    -> GET /patients/:id/visits/:id   | |
|  |                    -> useVisitSignatures(visitId)    | |
|  |                    -> Display full visit details     | |
|  |                    -> Display signature status       | |
|  |                    -> Back to patient                | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```