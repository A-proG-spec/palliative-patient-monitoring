```markdown
# frontend-specification/11-admin-edit-visit.md


# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND ADMIN EDIT VISIT SPECIFICATION

## 1. Overview

This document defines the frontend implementation for admin visit editing features. Admin users can edit visit records to correct errors, with full audit trail tracking who made changes, when, and what was changed.

**API Reference:** `api/11-admin-visits.md`

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
// ADMIN VISIT DETAIL TYPES
// ============================================

export interface AdminVisitDetail {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{ role: string; name: string }>;
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
    feeding: string;
    bathing: string;
    dressing: string;
    toileting: string;
    mobility: string;
  };
  ppsScore: number;
  kpsScore: number;
  appetite: string;
  oralIntake: string;
  hydrationStatus: string;
  emotionalStatus: string;
  familySupport: string;
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: string;
  currentMedications: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden: string;
  caregiverUnderstanding: string;
  caregivingCapacity: string;
  familyEmotionalStatus: string;
  educationProvided: string[];
  homeCondition: string;
  homeObservations: string[];
  nursingCareGiven: string[];
  redFlags: string[];
  redFlagActions?: string;
  referralsMade: string[];
  outcome: string;
  nextVisitDate?: string;
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
  teamLeader: { id: string; name: string };
  physician: { id: string; name: string };
  nurse: { id: string; name: string };
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
// ADMIN VISIT UPDATE TYPES
// ============================================

export interface UpdateVisitRequest {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  visitType?: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers?: Array<{ role: string; name: string; staffId?: string }>;
  overallStatus?: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility?: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;
    respiration?: number;
    spo2?: number;
  };
  painScore?: number;
  painLocation?: string[];
  painCharacteristics?: string[];
  painMedicationEffective?: boolean;
  symptoms?: string[];
  adl?: {
    feeding?: string;
    bathing?: string;
    dressing?: string;
    toileting?: string;
    mobility?: string;
  };
  ppsScore?: number;
  kpsScore?: number;
  appetite?: string;
  oralIntake?: string;
  hydrationStatus?: string;
  emotionalStatus?: string;
  familySupport?: string;
  financialDifficulty?: boolean;
  spiritualNeeds?: boolean;
  religiousSupportRequested?: boolean;
  medicationAvailable?: boolean;
  medicationCorrectlyTaken?: boolean;
  medicationSideEffects?: boolean;
  medicationRefillNeeded?: boolean;
  morphineAvailable?: boolean;
  adherenceLevel?: string;
  currentMedications?: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden?: string;
  caregiverUnderstanding?: string;
  caregivingCapacity?: string;
  familyEmotionalStatus?: string;
  educationProvided?: string[];
  homeCondition?: string;
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome?: string;
  nextVisitDate?: string;
  teamLeaderId?: string;
  physicianId?: string;
  nurseId?: string;
}

export interface UpdateVisitResponse {
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
  visit: {
    id: string;
    visitDate: string;
    painScore: number;
    outcome: string;
    overallStatus: string;
    ppsScore: number;
    kpsScore: number;
  };
}

export interface VisitEditHistoryEntry {
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
import { AdminVisitDetail, UpdateVisitRequest, UpdateVisitResponse, VisitEditHistoryEntry } from '@/types/admin.types';

export const adminApi = {
  // ... existing methods

  /**
   * Get visit details with edit history
   * GET /admin/visits/:visitId
   */
  getVisitById: (visitId: string): Promise<AdminVisitDetail> => {
    return api.get<AdminVisitDetail>(`/admin/visits/${visitId}`).then((res) => res.data);
  },

  /**
   * Update visit record (admin only)
   * PUT /admin/visits/:visitId
   */
  updateVisit: (visitId: string, data: UpdateVisitRequest): Promise<UpdateVisitResponse> => {
    return api.put<UpdateVisitResponse>(`/admin/visits/${visitId}`, data).then((res) => res.data);
  },

  /**
   * Get visit edit history
   * GET /admin/visits/:visitId/history
   */
  getVisitEditHistory: (visitId: string): Promise<VisitEditHistoryEntry[]> => {
    return api.get<VisitEditHistoryEntry[]>(`/admin/visits/${visitId}/history`).then((res) => res.data);
  },
};
```

---

## 5. Hooks

```typescript
// src/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { UpdateVisitRequest } from '@/types/admin.types';

/**
 * Get visit details with edit history
 */
export function useVisitDetail(visitId: string) {
  return useQuery({
    queryKey: ['admin', 'visits', visitId],
    queryFn: () => adminApi.getVisitById(visitId),
    enabled: !!visitId,
  });
}

/**
 * Update visit record (admin only)
 */
export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: UpdateVisitRequest }) =>
      adminApi.updateVisit(visitId, data),
    onSuccess: (_, variables) => {
      // Invalidate visit detail and history
      queryClient.invalidateQueries({ queryKey: ['admin', 'visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'visits', variables.visitId, 'history'] });
      // Invalidate patient full detail
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
    },
  });
}

/**
 * Get visit edit history
 */
export function useVisitEditHistory(visitId: string) {
  return useQuery({
    queryKey: ['admin', 'visits', visitId, 'history'],
    queryFn: () => adminApi.getVisitEditHistory(visitId),
    enabled: !!visitId,
  });
}
```

---

## 6. Components

### 6.1 VisitEditModal

**Purpose:** Modal for admin to edit visit records

**Props:**

```typescript
interface VisitEditModalProps {
  open: boolean;
  visitId: string;
  patientName: string;
  visitData: AdminVisitDetail;
  onClose: () => void;
  onSave: (data: UpdateVisitRequest) => void;
  isSubmitting?: boolean;
  editHistory?: VisitEditHistoryEntry[];
}
```

**Behavior:**
- Opens when admin clicks "Edit" button on any visit
- Pre-filled with existing visit data
- Admin can modify any visit field
- Shows audit trail: "Last edited by [Admin Name] on [Date]"
- Shows field-by-field change history
- Validates input before saving
- After save, refreshes visit list and shows success message

**Visual Design:**

```
+-----------------------------------------------------------+
| Edit Visit Record - Sarah Johnson                          |
| Visit Date: 2026-08-29                                     |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Visit Details                                          | |
| | Date: [2026-08-29]  Start: [09:00]  End: [10:30]    | |
| | Type: [Routine ▼]                                     | |
| |                                                       | |
| | Team Members                                          | |
| | Role: [TeamLeader ▼] Name: [Dr. Smith]              | |
| | Role: [Nurse ▼] Name: [Jane Doe]                    | |
| | [+ Add Member]                                       | |
| |                                                       | |
| | General Condition                                     | |
| | Status: [Stable ▼]   Mobility: [Requires Assistance ▼]| |
| |                                                       | |
| | Vital Signs                                           | |
| | Temp: [36.8]  Pulse: [78]  BP: [120/80]             | |
| | Resp: [18]  SpO2: [97]                               | |
| |                                                       | |
| | Pain Assessment                                       | |
| | Pain Score: [3]   Medication Effective: [Yes]        | |
| | Location: [Back]   Characteristics: [Dull]           | |
| |                                                       | |
| | Functional Status                                     | |
| | PPS: [60]   KPS: [60]                                | |
| |                                                       | |
| | Outcome                                               | |
| | [Stable ▼]                                            | |
| |                                                       | |
| |                        [Cancel] [Save Changes]        | |
| +-------------------------------------------------------+ |
|                                                           |
| ⚠️ Last edited by Admin User on 2026-09-01 at 10:30     |
|                                                           |
| 📝 Edit History: (2 edits)                               |
|    ┌─────────────────────────────────────────────────────┐ |
|    │ Admin User - 2026-09-01 10:30                     │ |
|    │   painScore: 5 → 3                                │ |
|    │   outcome: SymptomsWorsened → Stable              │ |
|    │ Super Admin - 2026-08-31 14:20                   │ |
|    │   ppsScore: 55 → 60                              │ |
|    └─────────────────────────────────────────────────────┘ |
+-----------------------------------------------------------+
```

**Implementation:**

```typescript
// src/components/admin/VisitEditModal.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminVisitDetail, UpdateVisitRequest, VisitEditHistoryEntry } from '@/types/admin.types';
import { updateVisitSchema, UpdateVisitFormData } from '@/schemas/admin.schema';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface VisitEditModalProps {
  open: boolean;
  visitId: string;
  patientName: string;
  visitData: AdminVisitDetail;
  onClose: () => void;
  onSave: (data: UpdateVisitRequest) => void;
  isSubmitting?: boolean;
  editHistory?: VisitEditHistoryEntry[];
}

export const VisitEditModal: React.FC<VisitEditModalProps> = ({
  open,
  visitId,
  patientName,
  visitData,
  onClose,
  onSave,
  isSubmitting,
  editHistory,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<UpdateVisitFormData>({
    resolver: zodResolver(updateVisitSchema),
    defaultValues: {
      visitDate: visitData.visitDate ? format(new Date(visitData.visitDate), 'yyyy-MM-dd') : '',
      timeStarted: visitData.timeStarted || '',
      timeEnded: visitData.timeEnded || '',
      visitType: visitData.visitType,
      overallStatus: visitData.overallStatus,
      mobility: visitData.mobility,
      painScore: visitData.painScore,
      painMedicationEffective: visitData.painMedicationEffective,
      ppsScore: visitData.ppsScore,
      kpsScore: visitData.kpsScore,
      outcome: visitData.outcome,
    },
  });

  // Reset form when visitData changes
  useEffect(() => {
    if (visitData) {
      form.reset({
        visitDate: visitData.visitDate ? format(new Date(visitData.visitDate), 'yyyy-MM-dd') : '',
        timeStarted: visitData.timeStarted || '',
        timeEnded: visitData.timeEnded || '',
        visitType: visitData.visitType,
        overallStatus: visitData.overallStatus,
        mobility: visitData.mobility,
        painScore: visitData.painScore,
        painMedicationEffective: visitData.painMedicationEffective,
        ppsScore: visitData.ppsScore,
        kpsScore: visitData.kpsScore,
        outcome: visitData.outcome,
      });
    }
  }, [visitData, form]);

  const onSubmit = (data: UpdateVisitFormData) => {
    onSave(data);
  };

  const lastEdit = editHistory && editHistory.length > 0 ? editHistory[0] : null;

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-3xl">
        <ModalHeader>
          <ModalTitle>
            Edit Visit Record - {patientName}
          </ModalTitle>
          <p className="text-sm text-muted-foreground">
            Visit Date: {format(new Date(visitData.visitDate), 'MMM dd, yyyy')}
          </p>
        </ModalHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Visit Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Visit Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  {...form.register('visitDate')}
                  className={form.formState.errors.visitDate ? 'border-red-500' : ''}
                />
                {form.formState.errors.visitDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.visitDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type</Label>
                <Select
                  id="visitType"
                  {...form.register('visitType')}
                  options={[
                    { value: 'Routine', label: 'Routine' },
                    { value: 'Emergency', label: 'Emergency' },
                    { value: 'FirstAssessment', label: 'First Assessment' },
                    { value: 'PostDischarge', label: 'Post Discharge' },
                    { value: 'EndOfLife', label: 'End of Life' },
                    { value: 'Bereavement', label: 'Bereavement' },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeStarted">Start Time</Label>
                <Input
                  id="timeStarted"
                  type="time"
                  {...form.register('timeStarted')}
                  className={form.formState.errors.timeStarted ? 'border-red-500' : ''}
                />
                {form.formState.errors.timeStarted && (
                  <p className="text-sm text-red-500">{form.formState.errors.timeStarted.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeEnded">End Time</Label>
                <Input
                  id="timeEnded"
                  type="time"
                  {...form.register('timeEnded')}
                  className={form.formState.errors.timeEnded ? 'border-red-500' : ''}
                />
                {form.formState.errors.timeEnded && (
                  <p className="text-sm text-red-500">{form.formState.errors.timeEnded.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* General Condition Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">General Condition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overallStatus">Overall Status</Label>
                <Select
                  id="overallStatus"
                  {...form.register('overallStatus')}
                  options={[
                    { value: 'Stable', label: 'Stable' },
                    { value: 'Deteriorating', label: 'Deteriorating' },
                    { value: 'Critical', label: 'Critical' },
                    { value: 'BedBound', label: 'Bed Bound' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobility">Mobility</Label>
                <Select
                  id="mobility"
                  {...form.register('mobility')}
                  options={[
                    { value: 'Ambulatory', label: 'Ambulatory' },
                    { value: 'RequiresAssistance', label: 'Requires Assistance' },
                    { value: 'Bedridden', label: 'Bedridden' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Pain Assessment Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Pain Assessment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="painScore">Pain Score (0-10)</Label>
                <Input
                  id="painScore"
                  type="number"
                  min="0"
                  max="10"
                  {...form.register('painScore', { valueAsNumber: true })}
                  className={form.formState.errors.painScore ? 'border-red-500' : ''}
                />
                {form.formState.errors.painScore && (
                  <p className="text-sm text-red-500">{form.formState.errors.painScore.message}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="painMedicationEffective">Medication Effective</Label>
                <Select
                  id="painMedicationEffective"
                  {...form.register('painMedicationEffective')}
                  options={[
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Functional Status Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Functional Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ppsScore">PPS Score (0-100)</Label>
                <Input
                  id="ppsScore"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('ppsScore', { valueAsNumber: true })}
                  className={form.formState.errors.ppsScore ? 'border-red-500' : ''}
                />
                {form.formState.errors.ppsScore && (
                  <p className="text-sm text-red-500">{form.formState.errors.ppsScore.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpsScore">KPS Score (0-100)</Label>
                <Input
                  id="kpsScore"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('kpsScore', { valueAsNumber: true })}
                  className={form.formState.errors.kpsScore ? 'border-red-500' : ''}
                />
                {form.formState.errors.kpsScore && (
                  <p className="text-sm text-red-500">{form.formState.errors.kpsScore.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Outcome Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Outcome</h3>
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                id="outcome"
                {...form.register('outcome')}
                options={[
                  { value: 'Stable', label: 'Stable' },
                  { value: 'SymptomsImproved', label: 'Symptoms Improved' },
                  { value: 'SymptomsUnchanged', label: 'Symptoms Unchanged' },
                  { value: 'SymptomsWorsened', label: 'Symptoms Worsened' },
                  { value: 'ReferredToFacility', label: 'Referred to Facility' },
                  { value: 'Deceased', label: 'Deceased' },
                ]}
              />
            </div>
          </div>

          {/* Audit Trail */}
          <div className="border-t pt-4">
            {lastEdit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>⚠️ Last edited by</span>
                <span className="font-medium text-foreground">{lastEdit.editedBy.name}</span>
                <span>on</span>
                <span className="font-medium text-foreground">
                  {format(new Date(lastEdit.editedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            )}

            {editHistory && editHistory.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show'} Edit History ({editHistory.length} edits)
                </button>

                {showHistory && (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto bg-muted/50 rounded-lg p-3">
                    {editHistory.map((entry, index) => (
                      <div key={index} className="text-sm border-b border-border/50 pb-2 last:border-0">
                        <div className="flex justify-between">
                          <span className="font-medium">{entry.editedBy.name}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(entry.editedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {entry.changes.map((change, changeIndex) => (
                            <div key={changeIndex}>
                              {change.field}: <span className="line-through">{String(change.from)}</span> → <span className="font-medium text-foreground">{String(change.to)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
```

---

### 6.2 AdminVisitList

**Purpose:** Display full visit list with edit capability

**Props:**

```typescript
interface AdminVisitListProps {
  visits: AdminVisitDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (visitId: string) => void;
}
```

**Behavior:**
- Renders table of visits with ALL fields displayed
- Each visit row shows: Date, Time, Type, Status, Outcome, PPS, KPS, Team, Actions
- "Edit" button for each visit (admin only)
- Expandable rows for full visit details

**Visual Design:**

```
+-----------------------------------------------------------+
| Visit History - Full Details                               |
+-----------------------------------------------------------+
| +-------------------------------------------------------+ |
| | Date  | Time   | Type   | Status | Outcome | PPS | KPS | |
| +-------+--------+--------+--------+---------+-----+-----+ |
| | 08-29 | 09:00- | Routin | Stable | Stable  | 60  | 60  | |
| |       | 10:30  | e      |        |         |     |     | |
| |       |        |        |        |         |     |     | |
| | 08-22 | 08:00- | Emerg. | Critic | Referre | 40  | 35  | |
| |       | 09:30  |        | al     | d to    |     |     | |
| |       |        |        |        | Facil   |     |     | |
| +-------+--------+--------+--------+---------+-----+-----+ |
|                                                           |
| Click [View Details] to see full visit record            |
| Click [Edit] to modify visit (admin only)               |
+-----------------------------------------------------------+
```

**Implementation:**

```typescript
// src/components/admin/AdminVisitList.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { AdminVisitDetail } from '@/types/admin.types';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, Edit, Eye } from 'lucide-react';

interface AdminVisitListProps {
  visits: AdminVisitDetail[];
  patientId: string;
  loading?: boolean;
  onEdit?: (visitId: string) => void;
}

export const AdminVisitList: React.FC<AdminVisitListProps> = ({
  visits,
  patientId,
  loading,
  onEdit,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (loading) {
    return <div className="animate-pulse">Loading visits...</div>;
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No visits recorded for this patient.
      </div>
    );
  }

  const getOutcomeBadge = (outcome: string) => {
    const colors: Record<string, string> = {
      Stable: 'bg-green-100 text-green-800',
      SymptomsImproved: 'bg-blue-100 text-blue-800',
      SymptomsUnchanged: 'bg-yellow-100 text-yellow-800',
      SymptomsWorsened: 'bg-red-100 text-red-800',
      ReferredToFacility: 'bg-purple-100 text-purple-800',
      Deceased: 'bg-gray-100 text-gray-800',
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Stable: 'bg-green-100 text-green-800',
      Deteriorating: 'bg-yellow-100 text-yellow-800',
      Critical: 'bg-red-100 text-red-800',
      BedBound: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const toggleExpand = (visitId: string) => {
    setExpandedRow(expandedRow === visitId ? null : visitId);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>PPS</TableHead>
            <TableHead>KPS</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <React.Fragment key={visit.id}>
              <TableRow>
                <TableCell>
                  <button
                    onClick={() => toggleExpand(visit.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {expandedRow === visit.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell>{format(new Date(visit.visitDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {visit.timeStarted} - {visit.timeEnded}
                </TableCell>
                <TableCell>{visit.visitType}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(visit.overallStatus)}>
                    {visit.overallStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getOutcomeBadge(visit.outcome)}>
                    {visit.outcome}
                  </Badge>
                </TableCell>
                <TableCell>{visit.ppsScore}</TableCell>
                <TableCell>{visit.kpsScore}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(visit.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {visit.canEdit && onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(visit.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {/* Expanded Row - Full Details */}
              {expandedRow === visit.id && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                          <p className="text-sm">
                            {visit.teamMembers.map(m => `${m.role}: ${m.name}`).join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Mobility</p>
                          <p className="text-sm">{visit.mobility}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pain Score</p>
                          <p className="text-sm">{visit.painScore}/10</p>
                        </div>
                      </div>
                      {visit.vitals && (
                        <div className="grid grid-cols-5 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Temp</p>
                            <p className="text-sm">{visit.vitals.temperature}°C</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Pulse</p>
                            <p className="text-sm">{visit.vitals.pulse} bpm</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">BP</p>
                            <p className="text-sm">{visit.vitals.bp}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Respiration</p>
                            <p className="text-sm">{visit.vitals.respiration}/min</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">SpO2</p>
                            <p className="text-sm">{visit.vitals.spo2}%</p>
                          </div>
                        </div>
                      )}
                      {visit.symptoms && visit.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
                          <p className="text-sm">{visit.symptoms.join(', ')}</p>
                        </div>
                      )}
                      {visit.redFlags && visit.redFlags.length > 0 && visit.redFlags[0] !== 'None' && (
                        <div>
                          <p className="text-sm font-medium text-red-500">Red Flags</p>
                          <p className="text-sm text-red-600">{visit.redFlags.join(', ')}</p>
                        </div>
                      )}
                      {visit.nextVisitDate && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Next Visit</p>
                          <p className="text-sm">{format(new Date(visit.nextVisitDate), 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                      {visit.editHistory && visit.editHistory.length > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            Last edited by {visit.editHistory[0].editedBy.name} on{' '}
                            {format(new Date(visit.editHistory[0].editedAt), 'MMM dd, yyyy HH:mm')}
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

### 6.3 AdminPatientDetailPage (With Visit Editing)

**Purpose:** View patient details with full records and edit visits

**Behavior:**

1. Uses `useAdminPatientFullDetail(patientId)` hook
2. Displays patient demographics, diagnosis, and KPS/PPS graph
3. Displays tabs with FULL DATA:
   - Visits: Full visit details with Edit button
   - Medications, Labs, Referrals, Admissions: Full details
4. Each visit has an "Edit" button (admin only)
5. Click "Edit" opens VisitEditModal
6. After edit, visit data refreshes

**Components:**

- `PatientDemographics`
- `PatientDiagnosis`
- `PatientProgressGraph`
- `AdminVisitList` (with Edit)
- `AdminMedicationList`
- `AdminLabList`
- `AdminReferralList`
- `AdminAdmissionList`
- `VisitEditModal`

---

## 7. Validation Schema

```typescript
// src/schemas/admin.schema.ts

import { z } from 'zod';

export const updateVisitSchema = z.object({
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']).optional(),
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']).optional(),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']).optional(),
  painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10').optional(),
  painMedicationEffective: z.boolean().optional(),
  ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100').optional(),
  kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100').optional(),
  outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']).optional(),
  teamLeaderId: z.string().optional(),
  physicianId: z.string().optional(),
  nurseId: z.string().optional(),
});

export type UpdateVisitFormData = z.infer<typeof updateVisitSchema>;
```

---

## 8. Flow Diagram

```
+-----------------------------------------------------------+
|              ADMIN EDIT VISIT FLOW (FRONTEND)              |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    IDENTIFY ERROR                    | |
|  |                                                     | |
|  |  Admin navigates to patient detail page             | |
|  |  Admin views the Visits tab                         | |
|  |  Admin sees a visit with incorrect data             | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    OPEN EDIT MODAL                   | |
|  |                                                     | |
|  |  Admin clicks "Edit" button on the visit            | |
|  |  System opens VisitEditModal                        | |
|  |  Modal is pre-filled with existing visit data       | |
|  |  Admin can see edit history (audit trail)           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    EDIT VISIT                        | |
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
|  |  useUpdateVisit() mutation triggered                | |
|  |  PUT /admin/visits/:visitId                         | |
|  |  Backend tracks changes and creates audit trail     | |
|  |  Success response with change log                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REFRESH DATA                      | |
|  |                                                     | |
|  |  Visit list refreshes                               | |
|  |  Updated visit shows "Edited by [Admin]"            | |
|  |  Edit history updated                               | |
|  |  Success message displayed                          | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
