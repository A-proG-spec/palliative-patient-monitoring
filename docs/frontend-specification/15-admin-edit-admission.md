# frontend-specification/15-admin-edit-admission.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMIN EDIT ADMISSION SPECIFICATION

## 1. Overview

This document defines the frontend implementation for admin admission editing features. Admin users can edit admission records to correct errors, with full audit trail tracking who made changes, when, and what was changed.

**API Reference:** `api/12-admin-admissions.md`

---

## 2. Routes

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/admin/patients/:patientId` | `AdminPatientDetailPage` | `DashboardLayout` | Admin |

---

## 3. Types

```typescript
// src/types/admin.types.ts

// ============================================
// ADMIN ADMISSION DETAIL TYPES
// ============================================

export interface AdminAdmissionDetail {
  id: string;
  patientId: string;
  patientName: string;
  patientDisplayId: string;
  hospitalPatientId?: string;
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
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: string;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
}

// ============================================
// ADMIN ADMISSION UPDATE TYPES
// ============================================

export interface UpdateAdmissionRequest {
  // Admission Details
  admissionDate?: string;
  bedNumber?: string;
  ward?: string;
  admittingPhysician?: string;
  careTeam?: string;
  
  // Medical Diagnosis
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  diseaseStage?: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis?: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  
  // Palliative Assessment
  ppsScore?: number;
  functionalStatus?: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  
  // Pain & Symptoms
  painScore?: number;
  painType?: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  
  // Psychosocial
  emotionalStatus?: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport?: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  
  // Spiritual
  spiritualConcerns?: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  
  // Care Plan
  painManagementPlan?: string;
  medicationPlan?: string;
  nursingCarePlan?: string;
  homeBasedCareRequired?: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired?: boolean;
  
  // Status (for discharge)
  status?: 'Active' | 'Discharged';
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
}

export interface UpdateAdmissionResponse {
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
// src/api/admin.ts

import api from './client';
import { 
  AdminAdmissionDetail,
  UpdateAdmissionRequest,
  UpdateAdmissionResponse,
  AdmissionEditHistoryEntry
} from '@/types/admin.types';

export const adminApi = {
  // ... existing methods

  /**
   * Get admission details with edit history
   * GET /admin/admissions/:admissionId
   */
  getAdmissionById: (admissionId: string): Promise<AdminAdmissionDetail> => {
    return api.get<AdminAdmissionDetail>(`/admin/admissions/${admissionId}`).then((res) => res.data);
  },

  /**
   * Update admission record (admin only)
   * PUT /admin/admissions/:admissionId
   */
  updateAdmission: (admissionId: string, data: UpdateAdmissionRequest): Promise<UpdateAdmissionResponse> => {
    return api.put<UpdateAdmissionResponse>(`/admin/admissions/${admissionId}`, data).then((res) => res.data);
  },

  /**
   * Get admission edit history
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
// src/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { UpdateAdmissionRequest } from '@/types/admin.types';

/**
 * Get admission details with edit history
 */
export function useAdmissionDetail(admissionId: string) {
  return useQuery({
    queryKey: ['admin', 'admissions', admissionId],
    queryFn: () => adminApi.getAdmissionById(admissionId),
    enabled: !!admissionId,
  });
}

/**
 * Update admission record (admin only)
 */
export function useUpdateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: string; data: UpdateAdmissionRequest }) =>
      adminApi.updateAdmission(admissionId, data),
    onSuccess: (_, variables) => {
      // Invalidate admission detail and history
      queryClient.invalidateQueries({ queryKey: ['admin', 'admissions', variables.admissionId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'admissions', variables.admissionId, 'history'] });
      // Invalidate patient full detail
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
    },
  });
}

/**
 * Get admission edit history
 */
export function useAdmissionEditHistory(admissionId: string) {
  return useQuery({
    queryKey: ['admin', 'admissions', admissionId, 'history'],
    queryFn: () => adminApi.getAdmissionEditHistory(admissionId),
    enabled: !!admissionId,
  });
}
```

---

## 6. Components

### 6.1 AdmissionEditModal

**Purpose:** Modal for admin to edit admission records

**Props:**

```typescript
interface AdmissionEditModalProps {
  open: boolean;
  admissionId: string;
  patientName: string;
  admissionData: AdminAdmissionDetail;
  onClose: () => void;
  onSave: (data: UpdateAdmissionRequest) => void;
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

### 6.2 AdminAdmissionList

**Purpose:** Display full admission list with edit capability

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
- Each admission row shows: Date, Bed, Ward, Physician, Status, Actions
- "Edit" button for each admission (admin only)
- Expandable rows for full admission details

**Visual Design:**

```
+-----------------------------------------------------------+
| Admission History - Full Details                           |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date  | Bed   | Ward   | Physician | Status | Actions | |
| +-------+-------+--------+-----------+--------+---------+ |
| | 08-30 | B-12  | Pallia-| Dr.       | Active | [Edit]  | |
| |       |       | tive   | Kebede    |        | [View]  | |
| |       |       | Ward   |           |        |         | |
| | 08-22 | A-05  | Medical| Dr.       | Dis-   | [View]  | |
| |       |       | Ward   | Alemu     | charged|         | |
| +-------+-------+--------+-----------+--------+---------+ |
|                                                           |
| Click [View] to see full admission record               |
| Click [Edit] to modify admission (admin only)           |
+-----------------------------------------------------------+
```

**Implementation:**

```typescript
// src/components/admin/AdminAdmissionList.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { AdminAdmissionDetail } from '@/types/admin.types';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, Edit, Eye } from 'lucide-react';

interface AdminAdmissionListProps {
  admissions: AdminAdmissionDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (admissionId: string) => void;
}

export const AdminAdmissionList: React.FC<AdminAdmissionListProps> = ({
  admissions,
  patientId,
  loading,
  onEdit,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (loading) {
    return <div className="animate-pulse">Loading admissions...</div>;
  }

  if (admissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No admissions recorded for this patient.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const toggleExpand = (admissionId: string) => {
    setExpandedRow(expandedRow === admissionId ? null : admissionId);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Bed</TableHead>
            <TableHead>Ward</TableHead>
            <TableHead>Physician</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admissions.map((admission) => (
            <React.Fragment key={admission.id}>
              <TableRow>
                <TableCell>
                  <button
                    onClick={() => toggleExpand(admission.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {expandedRow === admission.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{admission.bedNumber}</TableCell>
                <TableCell>{admission.ward}</TableCell>
                <TableCell>{admission.admittingPhysician}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(admission.status)}>
                    {admission.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(admission.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {admission.canEdit && onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(admission.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {/* Expanded Row - Full Details */}
              {expandedRow === admission.id && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Primary Diagnosis</p>
                          <p className="text-sm">{admission.primaryDiagnosis}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Stage</p>
                          <p className="text-sm">{admission.diseaseStage}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">PPS</p>
                          <p className="text-sm">{admission.ppsScore}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pain Score</p>
                          <p className="text-sm">{admission.painScore}/10</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Functional Status</p>
                          <p className="text-sm">{admission.functionalStatus}</p>
                        </div>
                      </div>
                      {admission.symptomsPresent && admission.symptomsPresent.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
                          <p className="text-sm">{admission.symptomsPresent.join(', ')}</p>
                        </div>
                      )}
                      {admission.socialChallenges && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Social Challenges</p>
                          <p className="text-sm">{admission.socialChallenges}</p>
                        </div>
                      )}
                      {admission.editHistory && admission.editHistory.length > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            Last edited by {admission.editHistory[0].editedBy.name} on{' '}
                            {format(new Date(admission.editHistory[0].editedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

## 7. Page Implementation

### AdminPatientDetailPage (With Admission Editing)

```typescript
// src/pages/admin/AdminPatientDetailPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminPatientFullDetail, useUpdateAdmission, useCloseCase } from '@/hooks/useAdmin';
import { PatientDemographics } from '@/components/patients/PatientDemographics';
import { PatientDiagnosis } from '@/components/patients/PatientDiagnosis';
import { PatientProgressGraph } from '@/components/patients/PatientProgressGraph';
import { AdminVisitList } from '@/components/admin/AdminVisitList';
import { AdminMedicationList } from '@/components/admin/AdminMedicationList';
import { AdminLabList } from '@/components/admin/AdminLabList';
import { AdminReferralList } from '@/components/admin/AdminReferralList';
import { AdminAdmissionList } from '@/components/admin/AdminAdmissionList';
import { AdmissionEditModal } from '@/components/admin/AdmissionEditModal';
import { CloseCaseModal } from '@/components/admin/CloseCaseModal';
import { PrintButton } from '@/components/common/PrintButton';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { toastUtils } from '@/lib/toast';

export const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visits');
  const [editingAdmission, setEditingAdmission] = useState<string | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useAdminPatientFullDetail(patientId!);
  const updateAdmissionMutation = useUpdateAdmission();
  const closeCaseMutation = useCloseCase();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorState onRetry={refetch} />;
  }

  const handleEditAdmission = (admissionId: string) => {
    setEditingAdmission(admissionId);
  };

  const handleSaveAdmission = (admissionId: string, updatedData: any) => {
    updateAdmissionMutation.mutate(
      { admissionId, data: updatedData },
      {
        onSuccess: () => {
          setEditingAdmission(null);
          toastUtils.success('Admission updated successfully', 'The admission record has been updated.');
          refetch();
        },
        onError: (error: any) => {
          toastUtils.error('Update failed', error.response?.data?.message || 'Failed to update admission.');
        },
      }
    );
  };

  const handleCloseCase = (reason: 'Improved' | 'Deceased') => {
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason } },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          toastUtils.success('Case closed successfully', `Patient case has been closed. Reason: ${reason}`);
          refetch();
        },
        onError: (error: any) => {
          toastUtils.error('Failed to close case', error.response?.data?.message);
        },
      }
    );
  };

  const currentAdmission = editingAdmission
    ? data.admissions.find(a => a.id === editingAdmission)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {data.firstName} {data.lastName}
          </h1>
          <p className="text-muted-foreground">
            {data.patientDisplayId} · {data.status}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton 
            patientId={patientId!} 
            patientName={`${data.firstName} ${data.lastName}`}
          />
          {data.status === 'Active' && (
            <Button 
              variant="destructive" 
              onClick={() => setIsCloseModalOpen(true)}
            >
              Close Case
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/patients')}>
            Back
          </Button>
        </div>
      </div>

      {/* Patient Demographics */}
      <PatientDemographics patient={data} />

      {/* Diagnosis */}
      <PatientDiagnosis diagnosis={data} />

      {/* KPS/PPS Progress Graph */}
      {data.progress && data.progress.data.length > 0 && (
        <PatientProgressGraph
          patientName={`${data.firstName} ${data.lastName}`}
          data={data.progress.data}
          trends={data.progress.trends}
        />
      )}

      {/* Tabs with Full Data */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visits">Visits ({data.visits.length})</TabsTrigger>
          <TabsTrigger value="medications">Medications ({data.medications.length})</TabsTrigger>
          <TabsTrigger value="labs">Lab Tests ({data.labTests.length})</TabsTrigger>
          <TabsTrigger value="referrals">Referrals ({data.referrals.length})</TabsTrigger>
          <TabsTrigger value="admissions">Admissions ({data.admissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          <AdminVisitList
            visits={data.visits}
            patientId={patientId!}
            onEdit={(visitId) => console.log('Edit visit:', visitId)}
          />
        </TabsContent>

        <TabsContent value="medications">
          <AdminMedicationList medications={data.medications} />
        </TabsContent>

        <TabsContent value="labs">
          <AdminLabList labTests={data.labTests} />
        </TabsContent>

        <TabsContent value="referrals">
          <AdminReferralList referrals={data.referrals} />
        </TabsContent>

        <TabsContent value="admissions">
          <AdminAdmissionList
            admissions={data.admissions}
            patientId={patientId!}
            onEdit={handleEditAdmission}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Admission Modal */}
      {currentAdmission && (
        <AdmissionEditModal
          open={!!editingAdmission}
          admissionId={editingAdmission!}
          patientName={`${data.firstName} ${data.lastName}`}
          admissionData={currentAdmission}
          onClose={() => setEditingAdmission(null)}
          onSave={(data) => handleSaveAdmission(editingAdmission!, data)}
          isSubmitting={updateAdmissionMutation.isPending}
          editHistory={currentAdmission.editHistory}
        />
      )}

      {/* Close Case Modal */}
      <CloseCaseModal
        open={isCloseModalOpen}
        patientId={patientId!}
        patientName={`${data.firstName} ${data.lastName}`}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseCase}
      />
    </div>
  );
};
```

---

## 8. Validation Schema

```typescript
// src/schemas/admin.schema.ts

import { z } from 'zod';

export const updateAdmissionSchema = z.object({
  body: z.object({
    // Admission Details
    admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    bedNumber: z.string().optional(),
    ward: z.string().optional(),
    admittingPhysician: z.string().optional(),
    careTeam: z.string().optional(),
    
    // Medical Diagnosis
    primaryDiagnosis: z.string().optional(),
    secondaryDiagnoses: z.array(z.string()).optional(),
    diseaseStage: z.enum(['Early', 'Advanced', 'Terminal']).optional(),
    comorbidities: z.array(z.string()).optional(),
    estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']).optional(),
    
    // Palliative Assessment
    ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100').optional(),
    functionalStatus: z.enum(['FullyIndependent', 'PartiallyDependent', 'FullyDependent']).optional(),
    
    // Pain & Symptoms
    painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10').optional(),
    painType: z.enum(['Acute', 'Chronic', 'Neuropathic', 'Mixed']).optional(),
    symptomsPresent: z.array(z.string()).optional(),
    
    // Psychosocial
    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Distressed']).optional(),
    familySupport: z.enum(['Strong', 'Moderate', 'Weak', 'None']).optional(),
    socialChallenges: z.string().optional(),
    
    // Spiritual
    spiritualConcerns: z.boolean().optional(),
    spiritualSupportPreferred: z.enum(['ReligiousLeader', 'Counselor', 'Other']).optional(),
    
    // Care Plan
    painManagementPlan: z.string().optional(),
    medicationPlan: z.string().optional(),
    nursingCarePlan: z.string().optional(),
    homeBasedCareRequired: z.boolean().optional(),
    psychosocialSupportPlan: z.string().optional(),
    physiotherapyRequired: z.boolean().optional(),
    
    // Status
    status: z.enum(['Active', 'Discharged']).optional(),
    dischargeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
  }),
});

export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;
```

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|              ADMIN EDIT ADMISSION FLOW (FRONTEND)          |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    IDENTIFY ERROR                    | |
|  |                                                     | |
|  |  Admin navigates to patient detail page             | |
|  |  Admin views the Admissions tab                     | |
|  |  Admin sees an admission with incorrect data        | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    OPEN EDIT MODAL                   | |
|  |                                                     | |
|  |  Admin clicks "Edit" button on the admission        | |
|  |  System opens AdmissionEditModal                    | |
|  |  Modal is pre-filled with existing admission data   | |
|  |  Admin can see edit history (audit trail)           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    EDIT ADMISSION                    | |
|  |                                                     | |
|  |  Admin modifies the incorrect fields                | |
|  |  Admin submits changes                              | |
|  |  Form validation runs                               | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    SAVE CHANGES                      | |
|  |                                                     | |
|  |  useUpdateAdmission() mutation triggered            | |
|  |  PUT /admin/admissions/:admissionId                 | |
|  |  Backend tracks changes and creates audit trail     | |
|  |  Success response with change log                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REFRESH DATA                      | |
|  |                                                     | |
|  |  Admission list refreshes                           | |
|  |  Updated admission shows "Edited by [Admin]"        | |
|  |  Edit history updated                               | |
|  |  Success message displayed                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```

---

## 10. Summary of Changes

| Change | Before | After |
|---|---|---|
| Admin edit admissions | Not available | Full edit capability with modal |
| Admission edit modal | Not available | `AdmissionEditModal` component |
| Full admission list | Basic summary | `AdminAdmissionList` with expandable details |
| Edit history display | Not available | Audit trail shown in modal |
| Admission update API call | Not available | `adminApi.updateAdmission()` |
| Update admission hook | Not available | `useUpdateAdmission()` |
| Admission detail hook | Not available | `useAdmissionDetail()` |
| Admission edit history hook | Not available | `useAdmissionEditHistory()` |
| Update validation schema | Not available | `updateAdmissionSchema` |
| Admin admission detail type | Not available | `AdminAdmissionDetail`, `UpdateAdmissionRequest` |
```