```markdown
# frontend-specification/08-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMISSIONS SPECIFICATION

## 1. Overview

This document defines the frontend implementation for hospital admission management features including recording admissions, viewing admission history, updating admission status (admin only), and admin editing of admission records with audit trail.

**API Reference:** `api/08-admissions.md`, `api/12-admin-admissions.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/patients/:id/admissions` | `RecordAdmissionPage` | `DashboardLayout` | Staff |
| `/patients/:id/admissions/:admissionId` | `AdmissionDetailPage` | `DashboardLayout` | Staff |
| `/admin/patients/:patientId` | `AdminPatientDetailPage` | `DashboardLayout` | Admin |

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
  hospitalPatientId?: string;
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
  hospitalPatientId?: string;
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

// ============================================
// ADMIN ADMISSION TYPES (NEW)
// ============================================

export interface AdminAdmissionDetail extends HospitalAdmission {
  patientName: string;
  patientDisplayId: string;
  canEdit: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: string;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
}

export interface UpdateAdminAdmissionRequest {
  admissionDate?: string;
  bedNumber?: string;
  ward?: string;
  admittingPhysician?: string;
  careTeam?: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  diseaseStage?: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis?: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore?: number;
  functionalStatus?: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore?: number;
  painType?: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  emotionalStatus?: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport?: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns?: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan?: string;
  medicationPlan?: string;
  nursingCarePlan?: string;
  homeBasedCareRequired?: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired?: boolean;
  status?: 'Active' | 'Discharged';
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
}

export interface UpdateAdminAdmissionResponse {
  id: string;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  };
  changes: Array<{
    field: string;
    from: any;
    to: any;
  }>;
  admission: {
    id: string;
    admissionDate: string;
    bedNumber: string;
    painScore: number;
    status: string;
  };
}

export interface AdmissionEditHistoryEntry {
  editedBy: { id: string; name: string };
  editedAt: string;
  changes: Array<{ field: string; from: any; to: any }>;
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
   * Update admission status (discharge) - ADMIN ONLY
   * PUT /patients/:patientId/admissions/:admissionId
   */
  update: (patientId: string, admissionId: string, data: UpdateAdmissionRequest): Promise<HospitalAdmission> => {
    return api.put<HospitalAdmission>(`/patients/${patientId}/admissions/${admissionId}`, data).then((res) => res.data);
  },
};
```

```typescript
// src/api/admin.ts (NEW ADMIN ADMISSION METHODS)

import api from './client';
import { 
  AdminAdmissionDetail,
  UpdateAdminAdmissionRequest,
  UpdateAdminAdmissionResponse,
  AdmissionEditHistoryEntry
} from '@/types/admission.types';

export const adminApi = {
  // ... existing methods

  /**
   * Get admission details with edit history (admin only)
   * GET /admin/admissions/:admissionId
   */
  getAdmissionById: (admissionId: string): Promise<AdminAdmissionDetail> => {
    return api.get<AdminAdmissionDetail>(`/admin/admissions/${admissionId}`).then((res) => res.data);
  },

  /**
   * Update admission record (admin only)
   * PUT /admin/admissions/:admissionId
   */
  updateAdmission: (admissionId: string, data: UpdateAdminAdmissionRequest): Promise<UpdateAdminAdmissionResponse> => {
    return api.put<UpdateAdminAdmissionResponse>(`/admin/admissions/${admissionId}`, data).then((res) => res.data);
  },

  /**
   * Get admission edit history (admin only)
   * GET /admin/admissions/:admissionId/history
   */
  getAdmissionEditHistory: (admissionId: string): Promise<AdmissionEditHistoryEntry[]> => {
    return api.get<AdmissionEditHistoryEntry[]>(`/admin/admissions/${admissionId}/history`).then((res) => res.data);
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
 * Update admission status (discharge) - ADMIN ONLY
 * This hook should only be used by admin users
 */
export function useUpdateAdmission(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdmissionRequest }) =>
      admissionApi.update(patientId, admissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'summary'] });
    },
  });
}
```

```typescript
// src/hooks/useAdmin.ts (NEW ADMIN ADMISSION HOOKS)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { UpdateAdminAdmissionRequest } from '@/types/admission.types';
import { toastUtils } from '@/lib/toast';

/**
 * Get admission details with edit history (admin only)
 */
export function useAdminAdmissionDetail(admissionId: string) {
  return useQuery({
    queryKey: ['admin', 'admissions', admissionId],
    queryFn: () => adminApi.getAdmissionById(admissionId),
    enabled: !!admissionId,
  });
}

/**
 * Update admission record (admin only)
 */
export function useUpdateAdminAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdminAdmissionRequest }) =>
      adminApi.updateAdmission(admissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admissions', variables.admissionId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'admissions', variables.admissionId, 'history'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      toastUtils.success('Admission updated successfully');
    },
    onError: (error: any) => {
      toastUtils.error('Update failed', error.response?.data?.message || 'Failed to update admission');
    },
  });
}

/**
 * Get admission edit history (admin only)
 */
export function useAdminAdmissionEditHistory(admissionId: string) {
  return useQuery({
    queryKey: ['admin', 'admissions', admissionId, 'history'],
    queryFn: () => adminApi.getAdmissionEditHistory(admissionId),
    enabled: !!admissionId,
  });
}
```

---

## 6. Components

### 6.1 AdmissionForm (UPDATED)

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

**Visual Design (UPDATED):**

```
+-----------------------------------------------------------+
| Record Hospital Admission - Sarah Johnson                  |
| System ID: PAT-001                                         |
+-----------------------------------------------------------+
|                                                           |
| +-------------------------------------------------------+ |
| | Hospital Identification                                | |
| | +---------------------------------------------------+ | |
| | | Hospital Patient ID (MRN): [____________________] | | |
| | | (Assigned by hospital upon admission)            | | |
| | +---------------------------------------------------+ | |
| |                                                       | |
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

### 6.2 AdmissionList (UPDATED)

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
| | Date       | Bed   | Ward   | MRN      | Status   |   | |
| +------------+-------+--------+----------+----------+---+ |
| | 2026-08-30 | B-12  | Pallia-| MRN-2026 | Active   |   | |
| |            |       | tive   | -0845    |          |   | |
| |            |       | Ward   |          |          |   | |
| | 2026-08-22 | A-05  | Medical| MRN-2026 | Dischar- |   | |
| |            |       | Ward   | -0820    | ged      |   | |
| +------------+-------+--------+----------+----------+---+ |
|                                                           |
|                          [Page 1] [Page 2] [Page 3]        |
+-----------------------------------------------------------+
```

---

### 6.3 AdmissionCard (UPDATED)

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
| | MRN: MRN-2026-0845                                    | |
| | Status: [Active]                                      | |
| | Physician: Dr. Kebede                                 | |
| | Care Team: Team A                                     | |
| | Diagnosis: Stage IV Breast Cancer                     | |
| |                                    [View Details]     | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

### 6.4 AdmissionDetail (UPDATED)

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

**Visual Design (UPDATED):**

```
+-----------------------------------------------------------+
| Admission Details                                          |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Admission Information                                  | |
| | Date: 2026-08-30   Status: [Active]                   | |
| | Bed: B-12   Ward: Palliative Care Ward                | |
| | MRN: MRN-2026-0845                                    | |
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

### 6.5 AdminAdmissionList (NEW)

**Purpose:** Display full admission list with edit capability for admin

**Props:**

```typescript
interface AdminAdmissionListProps {
  admissions: AdminAdmissionDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (admissionId: string) => void;
}
```

**Behavior:**
- Renders table of admissions with ALL fields displayed
- Each admission row shows: Date, Bed, Ward, MRN, Physician, Status, Actions
- "Edit" button for each admission (admin only)
- Expandable rows for full admission details

**Visual Design:**

```
+-----------------------------------------------------------+
| Admission History - Full Details                           |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date  | Bed   | Ward   | MRN         | Status | Action| |
| +-------+-------+--------+-------------+--------+-------+ |
| | 08-30 | B-12  | Pallia-| MRN-2026-   | Active | [Edit]| |
| |       |       | tive   | 0845        |        | [View]| |
| |       |       | Ward   |             |        |       | |
| | 08-22 | A-05  | Medical| MRN-2026-   | Dis-   | [View]| |
| |       |       | Ward   | 0820        | charged|       | |
| +-------+-------+--------+-------------+--------+-------+ |
|                                                           |
| Click [View] to see full admission record               |
| Click [Edit] to modify admission (admin only)           |
+-----------------------------------------------------------+
```

---

### 6.6 AdmissionEditModal (NEW)

**Purpose:** Modal for admin to edit admission records

**Props:**

```typescript
interface AdmissionEditModalProps {
  open: boolean;
  admissionId: string;
  patientName: string;
  admissionData: AdminAdmissionDetail;
  onClose: () => void;
  onSave: (data: UpdateAdminAdmissionRequest) => void;
  isSubmitting?: boolean;
  editHistory?: AdmissionEditHistoryEntry[];
}
```

**Behavior:**
- Opens when admin clicks "Edit" button on any admission
- Pre-filled with existing admission data
- Admin can modify any admission field
- Shows audit trail: "Last edited by [Admin Name] on [Date]"
- Shows field-by-field change history
- Validates input before saving
- After save, refreshes admission list and shows success message

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Edit Admission Record - Sarah Johnson                                     │
│ PAT-001  |  MRN: MRN-2026-0845                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ADMISSION INFORMATION                                                 │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Admission Date: [2026-08-30]                                         │ │
│  │  Bed Number:    [B-12]                                                │ │
│  │  Ward:          [Palliative Care Ward]                                │ │
│  │  Physician:     [Dr. Kebede]                                          │ │
│  │  Care Team:     [Team A]                                              │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ MEDICAL DIAGNOSIS                                                     │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Primary Diagnosis:   [Stage IV Breast Cancer]                        │ │
│  │  Secondary Diagnoses: [Metastatic to bone]                            │ │
│  │  Disease Stage:       [Advanced ▼]                                   │ │
│  │  Co-morbidities:      [Hypertension]                                  │ │
│  │  Estimated Prognosis: [Months ▼]                                     │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ PALLIATIVE ASSESSMENT                                                 │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  PPS Score:        [60]                                               │ │
│  │  Functional Status: [PartiallyDependent ▼]                           │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ PAIN & SYMPTOM ASSESSMENT                                             │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Pain Score:        [4]                                               │ │
│  │  Pain Type:         [Mixed ▼]                                        │ │
│  │  Symptoms Present:  [Fatigue, Anxiety]                                │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ PSYCHOSOCIAL & SPIRITUAL                                              │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Emotional Status:     [Anxious ▼]                                   │ │
│  │  Family Support:       [Moderate ▼]                                  │ │
│  │  Social Challenges:    [Financial constraints]                        │ │
│  │  Spiritual Concerns:   [No]                                           │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ CARE PLAN                                                             │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Pain Management Plan:    [Morphine 10mg every 6 hours]              │ │
│  │  Medication Plan:         [Continue current medications]             │ │
│  │  Nursing Care Plan:       [Daily monitoring and pain assessment]     │ │
│  │  Home-Based Care Required: [No]                                       │ │
│  │  Physiotherapy Required:   [No]                                       │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ STATUS                                                               │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  Status: [Active ▼]                                                  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ AUDIT TRAIL                                                           │ │
│  │ ───────────────────────────────────────────────────────────────────── │ │
│  │                                                                       │ │
│  │  ⚠️ Last edited by Admin User on 2026-09-01 at 10:30                 │ │
│  │                                                                       │ │
│  │  📝 Edit History: (2 edits)                                          │ │
│  │     ┌─────────────────────────────────────────────────────────────────┐ │
│  │     │ Admin User - 2026-09-01 10:30                                 │ │
│  │     │   bedNumber: B-10 → B-12                                      │ │
│  │     │   painScore: 5 → 4                                           │ │
│  │     │ Super Admin - 2026-08-31 14:20                               │ │
│  │     │   ppsScore: 55 → 60                                          │ │
│  │     └─────────────────────────────────────────────────────────────────┘ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                        [Cancel]              [Save Changes]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.7 DischargeModal (Updated - Admin Only)

**Purpose:** Modal for discharging a patient from admission (Admin Only)

**Props:**

```typescript
interface DischargeModalProps {
  open: boolean;
  admissionId: string;
  patientName: string;
  onClose: () => void;
  onConfirm: (data: UpdateAdmissionRequest) => void;
  isAdmin: boolean;
}
```

**Behavior:**
- Only visible to Admin users
- Staff users should not see this button (per FR-55c)
- Validates discharge date and reason before submitting

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

- `AdmissionForm` (updated with MRN field)

**States:**

| State | UI |
|---|---|
| Idle | Form enabled |
| Submitting | Form disabled with spinner |
| Error | Field-level and form-level errors |
| Success | Redirect to patient detail |

---

### 7.2 AdmissionListPage (Existing - kept as is)

**Purpose:** View all admissions for a patient

**Behavior:**

1. Uses `usePatientAdmissions(id)` hook
2. Displays admission list
3. Filter by status (Active/Discharged)
4. View details or discharge patient

---

### 7.3 AdmissionDetailPage (Updated - Discharge Button Admin Only)

**Route:** `/patients/:id/admissions/:admissionId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (staff)

**Purpose:** View admission details and discharge patient (Admin only)

**Behavior:**

1. Uses `useAdmissionDetail(id, admissionId)` hook
2. Displays complete admission information
3. **Discharge button only visible to Admin users** (per FR-55c)
4. Back button

**States:**

| State | UI |
|---|---|
| Loading | Skeleton details |
| Error | Error message with retry |
| Success | Full admission details |

---

### 7.4 AdminPatientDetailPage (With Admission Editing)

**Route:** `/admin/patients/:patientId`

**Layout:** `DashboardLayout`

**Guard:** `ProtectedRoute` (admin only)

**Purpose:** View patient details with full records and edit admissions

**Behavior:**

1. Uses `useAdminPatientFullDetail(patientId)` hook
2. Displays patient demographics, diagnosis, and KPS/PPS graph
3. Displays tabs with FULL DATA:
   - Visits: Full visit details with Edit button
   - Medications: Full medication details
   - Labs: Full lab test details
   - Referrals: Full referral details
   - **Admissions:** Full admission details with Edit button (NEW)
4. Each admission has an "Edit" button (admin only)
5. Click "Edit" opens AdmissionEditModal
6. After edit, admission data refreshes and shows audit trail

**Components:**

- `PatientDemographics`
- `PatientDiagnosis`
- `PatientProgressGraph`
- `AdminVisitList`
- `AdminMedicationList`
- `AdminLabList`
- `AdminReferralList`
- `AdminAdmissionList` (NEW)
- `AdmissionEditModal` (NEW)

---

## 8. Form Validation Schemas

```typescript
// src/schemas/admission.schema.ts

import { z } from 'zod';

export const createAdmissionSchema = z.object({
  referralId: z.string().min(1, 'Referral is required'),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  hospitalPatientId: z.string().optional(),
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

export const updateAdminAdmissionSchema = z.object({
  body: z.object({
    admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    bedNumber: z.string().optional(),
    ward: z.string().optional(),
    admittingPhysician: z.string().optional(),
    careTeam: z.string().optional(),
    primaryDiagnosis: z.string().optional(),
    secondaryDiagnoses: z.array(z.string()).optional(),
    diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']).optional(),
    comorbidities: z.array(z.string()).optional(),
    estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']).optional(),
    ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100').optional(),
    functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']).optional(),
    painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10').optional(),
    painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']).optional(),
    symptomsPresent: z.array(z.string()).optional(),
    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']).optional(),
    familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']).optional(),
    socialChallenges: z.string().optional(),
    spiritualConcerns: z.boolean().optional(),
    spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(),
    painManagementPlan: z.string().optional(),
    medicationPlan: z.string().optional(),
    nursingCarePlan: z.string().optional(),
    homeBasedCareRequired: z.boolean().optional(),
    psychosocialSupportPlan: z.string().optional(),
    physiotherapyRequired: z.boolean().optional(),
    status: z.enum(['Active', 'Discharged']).optional(),
    dischargeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
  }),
});

export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
export type UpdateAdminAdmissionFormData = z.infer<typeof updateAdminAdmissionSchema>;
```

---

## 9. Route Configuration

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

## 10. Flow Diagram (UPDATED)

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
|  |                    -> Fill form (includes MRN)       | |
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
|  |                    DISCHARGE FLOW (ADMIN ONLY)       | |
|  |                                                     | |
|  |  Admin -> /patients/:id/admissions/:admissionId     | |
|  |                    -> AdmissionDetailPage            | |
|  |                    -> Click Discharge (Admin only)   | |
|  |                    -> Open DischargeModal            | |
|  |                    -> Select reason & date           | |
|  |                    -> Confirm -> useUpdateAdmission()| |
|  |                    -> PUT /patients/:id/admissions   | |
|  |                    -> Refresh list and details       | |
|  |                                                     | |
|  |  Staff -> Same page - Discharge button hidden       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    ADMIN EDIT FLOW (NEW)             | |
|  |                                                     | |
|  |  Admin -> /admin/patients/:id -> AdminPatientDetailPage| |
|  |                    -> Admissions tab                 | |
|  |                    -> Identify admission with error  | |
|  |                    -> Click "Edit" button            | |
|  |                    -> Open AdmissionEditModal        | |
|  |                    -> Modify incorrect fields        | |
|  |                    -> Submit -> useUpdateAdminAdmission()| |
|  |                    -> PUT /admin/admissions/:admissionId| |
|  |                    -> Audit trail created            | |
|  |                    -> Success -> Refresh list        | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```