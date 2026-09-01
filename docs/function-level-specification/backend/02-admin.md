# function-level-specification/backend/02-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: ADMIN

## 1. Overview

This document defines the function-level specification for admin features including staff management, dashboard statistics, notifications, referral management, patient management (with full detail view), visit management (edit with audit trail), and print/export functionality.

**Files Covered:**
- `src/schemas/admin.schema.ts`
- `src/services/admin.service.ts`
- `src/controllers/admin.controller.ts`
- `src/routes/admin.routes.ts`

---

## 2. Schema Definitions

### src/schemas/admin.schema.ts

| Schema | Shape |
|---|---|
| approveStaffSchema | `z.object({ body: z.object({ role: z.enum(['TeamLeader', 'Physician', 'Nurse']) }) })` |
| closeCaseSchema | `z.object({ body: z.object({ reason: z.enum(['Improved', 'Deceased']) }) })` |
| getNotificationsQuerySchema | `z.object({ query: z.object({ limit: z.coerce.number().int().positive().optional().default(20), read: z.enum(['true', 'false']).optional() }) })` |
| getAdminPatientsQuerySchema | `z.object({ query: z.object({ page: z.coerce.number().int().positive().optional().default(1), limit: z.coerce.number().int().positive().max(100).optional().default(20), status: z.enum(['Active', 'Discharged']).optional(), search: z.string().optional() }) })` |
| getReportsQuerySchema | `z.object({ query: z.object({ startDate: z.string().date().optional(), endDate: z.string().date().optional() }) })` |
| updateVisitSchema | `z.object({ body: z.object({ visitDate: z.string().date().optional(), timeStarted: z.string().regex(/^\d{2}:\d{2}$/).optional(), timeEnded: z.string().regex(/^\d{2}:\d{2}$/).optional(), visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']).optional(), overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']).optional(), mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']).optional(), painScore: z.number().min(0).max(10).optional(), ppsScore: z.number().min(0).max(100).optional(), kpsScore: z.number().min(0).max(100).optional(), outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']).optional(), teamLeaderId: z.string().optional(), physicianId: z.string().optional(), nurseId: z.string().optional() }) })` |
| getVisitParamsSchema | `z.object({ params: z.object({ visitId: z.string().min(1, 'Visit ID is required') }) })` |

---

## 3. Service Functions

### src/services/admin.service.ts

#### getPendingStaff

| Field | Detail |
|---|---|
| Signature | `getPendingStaff(): Promise<PendingStaffDTO[]>` |
| Purpose | Get all pending staff registrations |
| Inputs | None |
| Output | Array of pending staff objects |
| Throws | None |
| Side Effects | Read-only |

---

#### approveStaff

| Field | Detail |
|---|---|
| Signature | `approveStaff(staffId: string, role: string, adminId: string): Promise<StaffDTO>` |
| Purpose | Approve staff registration and assign role |
| Inputs | staffId, role, adminId |
| Output | Updated staff object |
| Throws | `ApiError(404, "Staff member not found")` |
| Throws | `ApiError(400, "Invalid role specified")` |
| Side Effects | Updates staff status to Active, assigns role, creates notification |

---

#### rejectStaff

| Field | Detail |
|---|---|
| Signature | `rejectStaff(staffId: string): Promise<{ id: string; status: string }>` |
| Purpose | Reject staff registration |
| Inputs | staffId |
| Output | Staff id and updated status |
| Throws | `ApiError(404, "Staff member not found")` |
| Side Effects | Updates staff status to Rejected |

---

#### getDashboardStats

| Field | Detail |
|---|---|
| Signature | `getDashboardStats(): Promise<DashboardStatsDTO>` |
| Purpose | Get admin dashboard statistics with notifications |
| Inputs | None |
| Output | Dashboard statistics object |
| Throws | None |
| Side Effects | Read-only |

---

#### getNotifications

| Field | Detail |
|---|---|
| Signature | `getNotifications(limit?: number, read?: boolean): Promise<NotificationsResponseDTO>` |
| Purpose | Get admin notifications |
| Inputs | limit, read |
| Output | Notifications list with unread count |
| Throws | None |
| Side Effects | Read-only |

---

#### markNotificationRead

| Field | Detail |
|---|---|
| Signature | `markNotificationRead(notificationId: string): Promise<{ id: string; read: boolean }>` |
| Purpose | Mark notification as read |
| Inputs | notificationId |
| Output | Updated notification |
| Throws | `ApiError(404, "Notification not found")` |
| Side Effects | Updates notification read status |

---

#### getPatients

| Field | Detail |
|---|---|
| Signature | `getPatients(page?: number, limit?: number, status?: string, search?: string): Promise<{ items: AdminPatientDTO[]; total: number }>` |
| Purpose | Get all patients with pagination and filters |
| Inputs | page, limit, status, search |
| Output | Paginated patient list |
| Throws | None |
| Side Effects | Read-only |

---

#### getPatientDetail (Basic)

| Field | Detail |
|---|---|
| Signature | `getPatientDetail(patientId: string): Promise<AdminPatientDetailDTO>` |
| Purpose | Get basic patient information (summary view) |
| Inputs | patientId |
| Output | Basic patient detail object |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

---

#### getPatientFullDetail (NEW)

| Field | Detail |
|---|---|
| Signature | `getPatientFullDetail(patientId: string): Promise<AdminPatientFullDetailDTO>` |
| Purpose | Get detailed patient information including ALL records (like staff view) with full visit details, medications, labs, referrals, admissions, and KPS/PPS progress |
| Inputs | patientId |
| Output | Complete patient detail with all records |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

**Implementation Details:**

1. Find patient by ID with registeredBy populated
2. Get all visits with full details (including team members, vitals, pain scores, ADL, symptoms, red flags)
3. Get all medications with full details
4. Get all lab tests with full details
5. Get all referrals with full details (including preparedBy, signature, actionTaken)
6. Get all admissions with full details (including care plans)
7. Calculate KPS/PPS progress data from visits
8. Calculate trends (improving/stable/declining) for KPS and PPS
9. Return combined object with all data

---

#### closeCase

| Field | Detail |
|---|---|
| Signature | `closeCase(patientId: string, reason: string, adminId: string): Promise<CloseCaseResponseDTO>` |
| Purpose | Close patient case |
| Inputs | patientId, reason, adminId |
| Output | Patient close response |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(400, "Patient is already closed")` |
| Side Effects | Updates patient status to Discharged, creates notification |

---

#### getPendingReferrals

| Field | Detail |
|---|---|
| Signature | `getPendingReferrals(): Promise<ReferralDTO[]>` |
| Purpose | Get all pending referral requests |
| Inputs | None |
| Output | Array of pending referrals |
| Throws | None |
| Side Effects | Read-only |

---

#### approveReferral

| Field | Detail |
|---|---|
| Signature | `approveReferral(referralId: string, adminId: string): Promise<ReferralDTO>` |
| Purpose | Approve referral request |
| Inputs | referralId, adminId |
| Output | Updated referral object |
| Throws | `ApiError(404, "Referral not found")` |
| Side Effects | Updates referral status to Accepted, updates patient location to ReferredHospital, creates notification |

---

#### declineReferral

| Field | Detail |
|---|---|
| Signature | `declineReferral(referralId: string): Promise<ReferralDTO>` |
| Purpose | Decline referral request |
| Inputs | referralId |
| Output | Updated referral object |
| Throws | `ApiError(404, "Referral not found")` |
| Side Effects | Updates referral status to Declined |

---

#### getVisitById (NEW)

| Field | Detail |
|---|---|
| Signature | `getVisitById(visitId: string): Promise<AdminVisitFullDetailDTO>` |
| Purpose | Get visit details with edit history |
| Inputs | visitId |
| Output | Full visit detail with edit history |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

---

#### updateVisit (NEW)

| Field | Detail |
|---|---|
| Signature | `updateVisit(visitId: string, data: UpdateVisitInput, adminId: string): Promise<UpdateVisitResponseDTO>` |
| Purpose | Update visit record (admin only) with audit trail |
| Inputs | visitId, data, adminId |
| Output | Updated visit response with audit trail |
| Throws | `ApiError(404, "Visit not found")` |
| Throws | `ApiError(403, "Only admin can edit visits")` |
| Side Effects | Updates visit record, logs changes in edit history |

**Implementation Details:**

1. Find visit by ID
2. Track changes by comparing each field
3. Record changes with before/after values
4. Update visit with new data
5. Append edit history entry with admin ID, timestamp, and changes
6. Return updated visit with audit trail

---

#### getVisitEditHistory (NEW)

| Field | Detail |
|---|---|
| Signature | `getVisitEditHistory(visitId: string): Promise<VisitEditHistoryEntry[]>` |
| Purpose | Get visit edit history |
| Inputs | visitId |
| Output | Array of edit history entries |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

---

#### getPatientPrintData (NEW)

| Field | Detail |
|---|---|
| Signature | `getPatientPrintData(patientId: string, adminId: string): Promise<AdminPrintDataDTO>` |
| Purpose | Get patient data formatted for print/export with ALL records and FULL details |
| Inputs | patientId, adminId |
| Output | Print-formatted patient data |
| Throws | `ApiError(404, "Patient not found")` |
| Side Effects | Read-only |

**Implementation Details:**

1. Get patient with all demographics
2. Get KPS/PPS progress data with trends
3. Get all visits with FULL details (vitals, pain scores, ADL, symptoms, red flags, team members)
4. Get all medications with FULL details
5. Get all lab tests with FULL details
6. Get all referrals with FULL details (preparedBy, signature, actionTaken, outcome, follow-up)
7. Get all admissions with FULL details (care plans, pain management, medication plan, nursing care plan)
8. Add generation timestamp and admin info
9. Return combined object

---

#### exportPatientPDF (NEW)

| Field | Detail |
|---|---|
| Signature | `exportPatientPDF(patientId: string, adminId: string): Promise<Buffer>` |
| Purpose | Export patient history as PDF with ALL records and FULL details |
| Inputs | patientId, adminId |
| Output | PDF buffer |
| Throws | `ApiError(404, "Patient not found")` |
| Throws | `ApiError(500, "Failed to generate PDF")` |
| Side Effects | Generates PDF file |

---

#### getReports

| Field | Detail |
|---|---|
| Signature | `getReports(startDate?: string, endDate?: string): Promise<ReportDataDTO>` |
| Purpose | Get system reports and analytics |
| Inputs | startDate, endDate |
| Output | Report data object |
| Throws | None |
| Side Effects | Read-only |

---

#### exportReport

| Field | Detail |
|---|---|
| Signature | `exportReport(format: 'pdf' | 'excel', startDate?: string, endDate?: string): Promise<Buffer>` |
| Purpose | Export system report in PDF or Excel format |
| Inputs | format, startDate, endDate |
| Output | File buffer |
| Throws | `ApiError(400, "Invalid export format")` |
| Side Effects | Generates report file |

---

## 4. Controller Functions

### src/controllers/admin.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getPendingStaff | `adminService.getPendingStaff()` | 200, `SuccessResponse(200, "OK", result)` |
| approveStaff | `adminService.approveStaff(req.params.staffId, req.body.role, req.user.id)` | 200, `SuccessResponse(200, "Staff approved successfully", result)` |
| rejectStaff | `adminService.rejectStaff(req.params.staffId)` | 200, `SuccessResponse(200, "Staff registration rejected", result)` |
| getDashboardStats | `adminService.getDashboardStats()` | 200, `SuccessResponse(200, "OK", result)` |
| getNotifications | `adminService.getNotifications(req.query.limit, req.query.read)` | 200, `SuccessResponse(200, "OK", result)` |
| markNotificationRead | `adminService.markNotificationRead(req.params.notificationId)` | 200, `SuccessResponse(200, "Notification marked as read", result)` |
| getPatients | `adminService.getPatients(req.query.page, req.query.limit, req.query.status, req.query.search)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientDetail | `adminService.getPatientDetail(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientFullDetail | `adminService.getPatientFullDetail(req.params.patientId)` | 200, `SuccessResponse(200, "OK", result)` |
| closeCase | `adminService.closeCase(req.params.patientId, req.body.reason, req.user.id)` | 200, `SuccessResponse(200, "Patient case closed successfully", result)` |
| getPendingReferrals | `adminService.getPendingReferrals()` | 200, `SuccessResponse(200, "OK", result)` |
| approveReferral | `adminService.approveReferral(req.params.referralId, req.user.id)` | 200, `SuccessResponse(200, "Referral approved", result)` |
| declineReferral | `adminService.declineReferral(req.params.referralId)` | 200, `SuccessResponse(200, "Referral declined", result)` |
| getVisitById | `adminService.getVisitById(req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateVisit | `adminService.updateVisit(req.params.visitId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Visit updated successfully", result)` |
| getVisitEditHistory | `adminService.getVisitEditHistory(req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |
| getPatientPrintData | `adminService.getPatientPrintData(req.params.patientId, req.user.id)` | 200, `SuccessResponse(200, "OK", result)` |
| exportPatientPDF | `adminService.exportPatientPDF(req.params.patientId, req.user.id)` | 200, Returns PDF file blob |
| getReports | `adminService.getReports(req.query.startDate, req.query.endDate)` | 200, `SuccessResponse(200, "OK", result)` |
| exportReport | `adminService.exportReport(req.query.format, req.query.startDate, req.query.endDate)` | 200, Returns file blob |

---

## 5. Route Definitions

### src/routes/admin.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /staff/pending | `authMiddleware, roleMiddleware(['admin'])` | getPendingStaff |
| PUT | /staff/:staffId/approve | `authMiddleware, roleMiddleware(['admin']), validate(approveStaffSchema)` | approveStaff |
| PUT | /staff/:staffId/reject | `authMiddleware, roleMiddleware(['admin'])` | rejectStaff |
| GET | /dashboard/stats | `authMiddleware, roleMiddleware(['admin'])` | getDashboardStats |
| GET | /dashboard/notifications | `authMiddleware, roleMiddleware(['admin']), validate(getNotificationsQuerySchema)` | getNotifications |
| PUT | /dashboard/notifications/:notificationId/read | `authMiddleware, roleMiddleware(['admin'])` | markNotificationRead |
| GET | /patients | `authMiddleware, roleMiddleware(['admin']), validate(getAdminPatientsQuerySchema)` | getPatients |
| GET | /patients/:patientId | `authMiddleware, roleMiddleware(['admin'])` | getPatientDetail |
| GET | /patients/:patientId/full | `authMiddleware, roleMiddleware(['admin'])` | getPatientFullDetail |
| PUT | /patients/:patientId/close-case | `authMiddleware, roleMiddleware(['admin']), validate(closeCaseSchema)` | closeCase |
| GET | /patients/:patientId/print | `authMiddleware, roleMiddleware(['admin'])` | getPatientPrintData |
| GET | /patients/:patientId/export | `authMiddleware, roleMiddleware(['admin'])` | exportPatientPDF |
| GET | /referrals/pending | `authMiddleware, roleMiddleware(['admin'])` | getPendingReferrals |
| PUT | /referrals/:referralId/approve | `authMiddleware, roleMiddleware(['admin'])` | approveReferral |
| PUT | /referrals/:referralId/decline | `authMiddleware, roleMiddleware(['admin'])` | declineReferral |
| GET | /visits/:visitId | `authMiddleware, roleMiddleware(['admin'])` | getVisitById |
| PUT | /visits/:visitId | `authMiddleware, roleMiddleware(['admin']), validate(updateVisitSchema)` | updateVisit |
| GET | /visits/:visitId/history | `authMiddleware, roleMiddleware(['admin'])` | getVisitEditHistory |
| GET | /reports | `authMiddleware, roleMiddleware(['admin']), validate(getReportsQuerySchema)` | getReports |
| GET | /reports/export | `authMiddleware, roleMiddleware(['admin'])` | exportReport |

Mounted at: `/api/v1/admin`

---

## 6. Implementation Notes

### Role Middleware

```typescript
// src/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.type === 'admin' && allowedRoles.includes('admin')) {
      return next();
    }

    if (req.user.type === 'staff' && req.user.role && allowedRoles.includes(req.user.role)) {
      return next();
    }

    throw new ApiError(403, 'Forbidden');
  };
};
```

### Notification Creation

```typescript
// src/services/admin.service.ts (internal function)

const createNotification = async (type: string, message: string, data: any) => {
  await Notification.create({
    type,
    message,
    data,
    read: false,
  });
};
```

### Audit Trail for Visit Edits (NEW)

```typescript
// src/services/admin.service.ts (internal function)

const trackVisitChanges = (original: any, updated: any): Array<{ field: string; from: any; to: any }> => {
  const changes: Array<{ field: string; from: any; to: any }> = [];
  const fieldsToTrack = [
    'visitDate', 'timeStarted', 'timeEnded', 'visitType',
    'overallStatus', 'mobility', 'painScore', 'ppsScore', 'kpsScore',
    'outcome', 'teamLeaderId', 'physicianId', 'nurseId'
  ];

  for (const field of fieldsToTrack) {
    if (updated[field] !== undefined && original[field] !== updated[field]) {
      changes.push({
        field,
        from: original[field],
        to: updated[field]
      });
    }
  }

  return changes;
};

const addEditHistoryEntry = async (visitId: string, adminId: string, changes: any[]) => {
  // Append to visit's editHistory array
  await HomeVisit.findByIdAndUpdate(visitId, {
    $push: {
      editHistory: {
        editedBy: adminId,
        editedAt: new Date(),
        changes
      }
    }
  });
};
```

### DTO Types

```typescript
// src/types/admin.types.ts

export interface PendingStaffDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: Date;
}

export interface DashboardStatsDTO {
  totalPatients: number;
  activePatients: number;
  hospitalizedPatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  notifications: {
    staffApprovals: number;
    pendingReferrals: number;
    recentCloseCases: number;
  };
  patientsByStatus: Array<{ status: string; count: number }>;
  recentReferrals: Array<{
    id: string;
    patientName: string;
    date: Date;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: Date;
    staff: string;
  }>;
}

export interface AdminPatientDTO {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: Date;
  registeredBy: {
    id: string;
    name: string;
  };
}

export interface AdminPatientDetailDTO extends AdminPatientDTO {
  dateOfBirth: Date;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
}

// ============================================
// FULL ADMIN PATIENT DETAIL DTO (NEW)
// ============================================

export interface AdminVisitFullDetailDTO {
  id: string;
  visitDate: Date;
  timeStarted: string;
  timeEnded: string;
  visitType: string;
  teamMembers: Array<{ role: string; name: string }>;
  overallStatus: string;
  mobility: string;
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
  nextVisitDate?: Date;
  teamLeader: { id: string; name: string };
  physician: { id: string; name: string };
  nurse: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
  canEdit: boolean;
  editHistory?: Array<{
    editedBy: { id: string; name: string };
    editedAt: Date;
    changes: Array<{ field: string; from: any; to: any }>;
  }>;
}

export interface AdminMedicationFullDetailDTO {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  prescribedBy: { id: string; name: string };
  visitId?: string;
  admissionId?: string;
  createdAt: Date;
}

export interface AdminLabFullDetailDTO {
  id: string;
  testName: string;
  dateOrdered: Date;
  datePerformed?: Date;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: { id: string; name: string };
  visitId?: string;
  admissionId?: string;
  createdAt: Date;
}

export interface AdminReferralFullDetailDTO {
  id: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: Date;
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
  status: string;
  actionTaken?: string;
  outcome?: string;
  followUpDate?: Date;
  followUpStatus?: string;
  requestedBy: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: Date;
}

export interface AdminAdmissionFullDetailDTO {
  id: string;
  admissionDate: Date;
  dischargeDate?: Date;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: string;
  comorbidities: string[];
  estimatedPrognosis: string;
  ppsScore: number;
  functionalStatus: string;
  painScore: number;
  painType: string;
  symptomsPresent: string[];
  emotionalStatus: string;
  familySupport: string;
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: string;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: string;
  status: string;
  createdBy: { id: string; name: string };
  createdAt: Date;
}

export interface AdminPatientFullDetailDTO extends AdminPatientDTO {
  dateOfBirth: Date;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  visits: AdminVisitFullDetailDTO[];
  medications: AdminMedicationFullDetailDTO[];
  labTests: AdminLabFullDetailDTO[];
  referrals: AdminReferralFullDetailDTO[];
  admissions: AdminAdmissionFullDetailDTO[];
  progress: {
    data: Array<{ visitId: string; visitDate: Date; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  createdAt: Date;
}

// ============================================
// ADMIN VISIT UPDATE TYPES (NEW)
// ============================================

export interface UpdateVisitInput {
  visitDate?: string;
  timeStarted?: string;
  timeEnded?: string;
  visitType?: string;
  teamMembers?: Array<{ role: string; name: string; staffId?: string }>;
  overallStatus?: string;
  mobility?: string;
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

export interface UpdateVisitResponseDTO {
  id: string;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string;
  };
  changes: Array<{
    field: string;
    from: any;
    to: any;
  }>;
}

export interface VisitEditHistoryEntry {
  editedBy: { id: string; name: string };
  editedAt: Date;
  changes: Array<{ field: string; from: any; to: any }>;
}

export interface CloseCaseResponseDTO {
  id: string;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: Date;
}

// ============================================
// ADMIN PRINT TYPES (NEW)
// ============================================

export interface AdminPrintDataDTO {
  patient: {
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: Date;
    address: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    caregiverName: string;
    caregiverPhone: string;
    status: string;
    currentLocation: string;
    primaryDiagnosis: string;
    secondaryDiagnoses: string[];
    diseaseStage: string;
    comorbidities: string[];
    estimatedPrognosis: string;
    registeredBy: { id: string; name: string };
    createdAt: Date;
  };
  progress: {
    data: Array<{ visitId: string; visitDate: Date; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  visits: AdminVisitFullDetailDTO[];
  medications: AdminMedicationFullDetailDTO[];
  labTests: AdminLabFullDetailDTO[];
  referrals: AdminReferralFullDetailDTO[];
  admissions: AdminAdmissionFullDetailDTO[];
  generatedAt: Date;
  generatedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ReportDataDTO {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  hospitalizedPatients: number;
  referralsByStatus: Array<{ status: string; count: number }>;
  patientsByLocation: Array<{ location: string; count: number }>;
  patientsByStage: Array<{ stage: string; count: number }>;
  closeCasesByReason: Array<{ reason: string; count: number }>;
  visitsByMonth: Array<{ month: string; count: number }>;
}
```

---

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/admin.schema.ts` | `tests/schemas/admin.schema.test.ts` | Unit |
| `src/services/admin.service.ts` | `tests/services/admin.service.test.ts` | Unit |
| `src/controllers/admin.controller.ts` | `tests/controllers/admin.controller.test.ts` | Unit |
| `src/routes/admin.routes.ts` | `tests/routes/admin.routes.test.ts` | Integration |

---

## 8. Test Cases

### admin.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| approveStaffSchema accepts valid role | parse `{ body: { role: "Nurse" } }` | Passes |
| approveStaffSchema rejects invalid role | parse `{ body: { role: "Invalid" } }` | Validation fails |
| closeCaseSchema accepts valid reason | parse `{ body: { reason: "Improved" } }` | Passes |
| closeCaseSchema rejects invalid reason | parse `{ body: { reason: "Invalid" } }` | Validation fails |
| getAdminPatientsQuerySchema default values | parse `{ query: {} }` | page=1, limit=20 |
| getAdminPatientsQuerySchema accepts valid status | parse `{ query: { status: "Active" } }` | Passes |
| getAdminPatientsQuerySchema rejects invalid status | parse `{ query: { status: "Invalid" } }` | Validation fails |
| updateVisitSchema accepts valid data | parse `{ body: { painScore: 3, outcome: "Stable" } }` | Passes |
| updateVisitSchema rejects invalid painScore | parse `{ body: { painScore: 15 } }` | Validation fails |

### admin.service.test.ts

#### approveStaff

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Staff exists and pending | Mock staff found with status Pending | call `approveStaff(staffId, role, adminId)` | Resolves with updated staff, status Active |
| Staff not found | Mock staff not found | call `approveStaff(staffId, role, adminId)` | Throws ApiError(404, "Staff member not found") |
| Invalid role | Mock staff found | call `approveStaff(staffId, "Invalid", adminId)` | Throws ApiError(400, "Invalid role specified") |

#### closeCase

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists and active | Mock patient found with status Active | call `closeCase(patientId, reason, adminId)` | Resolves with updated patient, status Discharged |
| Patient not found | Mock patient not found | call `closeCase(patientId, reason, adminId)` | Throws ApiError(404, "Patient not found") |
| Patient already closed | Mock patient found with status Discharged | call `closeCase(patientId, reason, adminId)` | Throws ApiError(400, "Patient is already closed") |

#### approveReferral

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Referral exists and pending | Mock referral found with status Pending | call `approveReferral(referralId, adminId)` | Resolves with updated referral, status Accepted |
| Referral not found | Mock referral not found | call `approveReferral(referralId, adminId)` | Throws ApiError(404, "Referral not found") |

#### updateVisit (NEW)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Visit exists and admin | Mock visit found, admin authenticated | call `updateVisit(visitId, data, adminId)` | Resolves with updated visit, audit trail created |
| Visit not found | Mock visit not found | call `updateVisit(visitId, data, adminId)` | Throws ApiError(404, "Visit not found") |
| Non-admin user | Mock visit found, staff authenticated | call `updateVisit(visitId, data, staffId)` | Throws ApiError(403, "Only admin can edit visits") |
| No changes | Mock visit found, data same as original | call `updateVisit(visitId, {}, adminId)` | Resolves with no changes, no audit entry |

#### getPatientFullDetail (NEW)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists with all records | Mock patient found with visits, medications, labs, referrals, admissions | call `getPatientFullDetail(patientId)` | Resolves with complete patient detail including KPS/PPS trends |
| Patient not found | Mock patient not found | call `getPatientFullDetail(patientId)` | Throws ApiError(404, "Patient not found") |
| Patient with no visits | Mock patient found with no visits | call `getPatientFullDetail(patientId)` | Resolves with patient detail, progress null, empty arrays |

#### getPatientPrintData (NEW)

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Patient exists | Mock patient found with all records | call `getPatientPrintData(patientId, adminId)` | Resolves with print-formatted data including ALL fields |
| Patient not found | Mock patient not found | call `getPatientPrintData(patientId, adminId)` | Throws ApiError(404, "Patient not found") |

---

## 9. Flow Diagram (UPDATED)

```
+-----------------------------------------------------------+
|                    ADMIN FLOW (BACKEND)                    |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    STAFF APPROVAL FLOW               | |
|  |                                                     | |
|  |  GET /admin/staff/pending                           | |
|  |         -> adminService.getPendingStaff()           | |
|  |         -> Return pending staff list                | |
|  |                                                     | |
|  |  PUT /admin/staff/:staffId/approve                  | |
|  |         -> adminService.approveStaff()              | |
|  |         -> Check staff exists                       | |
|  |         -> Check staff is pending                   | |
|  |         -> Assign role                              | |
|  |         -> Update status to Active                  | |
|  |         -> Create notification                      | |
|  |         -> Return updated staff                     | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    DASHBOARD FLOW                    | |
|  |                                                     | |
|  |  GET /admin/dashboard/stats                         | |
|  |         -> adminService.getDashboardStats()         | |
|  |         -> Count patients by status                 | |
|  |         -> Count pending staff                      | |
|  |         -> Count pending referrals                  | |
|  |         -> Get recent referrals and visits          | |
|  |         -> Return statistics                        | |
|  |                                                     | |
|  |  GET /admin/dashboard/notifications                 | |
|  |         -> adminService.getNotifications()          | |
|  |         -> Return notifications with unread count   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PATIENT MANAGEMENT FLOW (UPDATED) | |
|  |                                                     | |
|  |  GET /admin/patients                                | |
|  |         -> adminService.getPatients()               | |
|  |         -> Apply filters and pagination             | |
|  |         -> Return patient list                      | |
|  |                                                     | |
|  |  GET /admin/patients/:patientId                     | |
|  |         -> adminService.getPatientDetail()          | |
|  |         -> Get basic patient info                   | |
|  |         -> Return patient detail                    | |
|  |                                                     | |
|  |  GET /admin/patients/:patientId/full (NEW)          | |
|  |         -> adminService.getPatientFullDetail()      | |
|  |         -> Get patient with ALL records             | |
|  |         -> Calculate KPS/PPS trends                 | |
|  |         -> Return full patient detail               | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    VISIT MANAGEMENT (NEW)            | |
|  |                                                     | |
|  |  GET /admin/visits/:visitId                         | |
|  |         -> adminService.getVisitById()              | |
|  |         -> Return visit with edit history           | |
|  |                                                     | |
|  |  PUT /admin/visits/:visitId                         | |
|  |         -> adminService.updateVisit()               | |
|  |         -> Check admin role                         | |
|  |         -> Track changes                            | |
|  |         -> Update visit                             | |
|  |         -> Add audit trail entry                    | |
|  |         -> Return updated visit                     | |
|  |                                                     | |
|  |  GET /admin/visits/:visitId/history                 | |
|  |         -> adminService.getVisitEditHistory()       | |
|  |         -> Return edit history                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REFERRAL MANAGEMENT FLOW          | |
|  |                                                     | |
|  |  GET /admin/referrals/pending                       | |
|  |         -> adminService.getPendingReferrals()       | |
|  |         -> Return pending referrals                 | |
|  |                                                     | |
|  |  PUT /admin/referrals/:referralId/approve           | |
|  |         -> adminService.approveReferral()           | |
|  |         -> Check referral exists                    | |
|  |         -> Update status to Accepted                | |
|  |         -> Update patient location to ReferredHospital| |
|  |         -> Create notification                      | |
|  |         -> Return updated referral                  | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    CLOSE CASE FLOW                   | |
|  |                                                     | |
|  |  PUT /admin/patients/:patientId/close-case          | |
|  |         -> adminService.closeCase()                 | |
|  |         -> Check patient exists                     | |
|  |         -> Check patient is active                  | |
|  |         -> Update status to Discharged              | |
|  |         -> Record close reason and date             | |
|  |         -> Create notification                      | |
|  |         -> Return close response                    | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    PRINT/EXPORT FLOW (NEW)           | |
|  |                                                     | |
|  |  GET /admin/patients/:patientId/print               | |
|  |         -> adminService.getPatientPrintData()       | |
|  |         -> Get patient with ALL records             | |
|  |         -> Format for print                         | |
|  |         -> Return print data                        | |
|  |                                                     | |
|  |  GET /admin/patients/:patientId/export              | |
|  |         -> adminService.exportPatientPDF()          | |
|  |         -> Generate PDF with ALL data               | |
|  |         -> Return PDF file                          | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REPORTS FLOW                      | |
|  |                                                     | |
|  |  GET /admin/reports                                 | |
|  |         -> adminService.getReports()                | |
|  |         -> Aggregate patient data                   | |
|  |         -> Aggregate referral data                  | |
|  |         -> Aggregate visit data                     | |
|  |         -> Return report data                       | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
