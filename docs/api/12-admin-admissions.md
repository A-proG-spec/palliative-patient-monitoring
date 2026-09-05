# api/12-admin-admissions.md


# PALLIATIVE PATIENT MONITORING SYSTEM - ADMIN ADMISSIONS API SPECIFICATION

## 1. Overview

This document defines the API endpoints for admin admission management features including viewing admission details with edit history, updating admission records (admin only), and retrieving admission edit history with audit trail.

**Base Path:** `/api/v1/admin`

**Auth:** All endpoints require Admin authentication (Bearer JWT with admin role)

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admissions/:admissionId | Admin | Get admission details with edit history |
| PUT | /admissions/:admissionId | Admin | Update admission record (admin only) |
| GET | /admissions/:admissionId/history | Admin | Get admission edit history |

---

## 3. Endpoint Details

### GET /admin/admissions/:admissionId

**Purpose:** Get admission details with edit history (audit trail)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "patientId": "507f1f77bcf86cd799439012",
    "patientName": "Sarah Johnson",
    "patientDisplayId": "PAT-001",
    "hospitalPatientId": "MRN-2026-0845",
    "referralId": "507f1f77bcf86cd799439016",
    "admissionDate": "2026-08-30T00:00:00Z",
    "dischargeDate": null,
    "bedNumber": "B-12",
    "ward": "Palliative Care Ward",
    "admittingPhysician": "Dr. Kebede",
    "careTeam": "Team A",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "ppsScore": 60,
    "functionalStatus": "PartiallyDependent",
    "painScore": 4,
    "painType": "Mixed",
    "symptomsPresent": ["Fatigue", "Anxiety"],
    "emotionalStatus": "Anxious",
    "familySupport": "Moderate",
    "socialChallenges": "Financial constraints for medications",
    "spiritualConcerns": false,
    "spiritualSupportPreferred": null,
    "painManagementPlan": "Morphine 10mg every 6 hours",
    "medicationPlan": "Continue current medications",
    "nursingCarePlan": "Daily monitoring and pain assessment",
    "homeBasedCareRequired": false,
    "psychosocialSupportPlan": "Counseling referral made",
    "physiotherapyRequired": false,
    "dischargeReason": null,
    "status": "Active",
    "createdBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "Nurse"
    },
    "createdAt": "2026-08-30T10:00:00Z",
    "updatedAt": "2026-09-01T10:30:00Z",
    "canEdit": true,
    "editHistory": [
      {
        "editedBy": {
          "id": "507f1f77bcf86cd799439001",
          "name": "Admin User"
        },
        "editedAt": "2026-09-01T10:30:00Z",
        "changes": [
          {
            "field": "bedNumber",
            "from": "B-10",
            "to": "B-12"
          },
          {
            "field": "painScore",
            "from": 5,
            "to": 4
          }
        ]
      },
      {
        "editedBy": {
          "id": "507f1f77bcf86cd799439005",
          "name": "Super Admin"
        },
        "editedAt": "2026-08-31T14:20:00Z",
        "changes": [
          {
            "field": "ppsScore",
            "from": 55,
            "to": 60
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 403 | Non-admin user | "Forbidden" |
| 401 | Missing or invalid token | "Unauthorized" |

---

### PUT /admin/admissions/:admissionId

**Purpose:** Update admission record (admin only) with audit trail

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Request Body:**

```json
{
  "bedNumber": "B-12",
  "painScore": 4,
  "ppsScore": 60,
  "careTeam": "Team A",
  "functionalStatus": "PartiallyDependent"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| admissionDate | Optional, valid ISO date |
| bedNumber | Optional, string |
| ward | Optional, string |
| admittingPhysician | Optional, string |
| careTeam | Optional, string |
| primaryDiagnosis | Optional, string |
| secondaryDiagnoses | Optional, array of strings |
| diseaseStage | Optional, valid enum (Early, Advanced, Terminal) |
| comorbidities | Optional, array of strings |
| estimatedPrognosis | Optional, valid enum (Days, Weeks, Months, Uncertain) |
| ppsScore | Optional, number between 0-100 |
| functionalStatus | Optional, valid enum (FullyIndependent, PartiallyDependent, FullyDependent) |
| painScore | Optional, number between 0-10 |
| painType | Optional, valid enum (Acute, Chronic, Neuropathic, Mixed) |
| symptomsPresent | Optional, array of strings |
| emotionalStatus | Optional, valid enum (Stable, Anxious, Depressed, Distressed) |
| familySupport | Optional, valid enum (Strong, Moderate, Weak, None) |
| socialChallenges | Optional, string |
| spiritualConcerns | Optional, boolean |
| spiritualSupportPreferred | Optional, valid enum (ReligiousLeader, Counselor, Other) |
| painManagementPlan | Optional, string |
| medicationPlan | Optional, string |
| nursingCarePlan | Optional, string |
| homeBasedCareRequired | Optional, boolean |
| psychosocialSupportPlan | Optional, string |
| physiotherapyRequired | Optional, boolean |
| status | Optional, valid enum (Active, Discharged) |
| dischargeDate | Optional, valid ISO date (required if discharging) |
| dischargeReason | Optional, valid enum (Improved, Deceased) (required if discharging) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admission updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "updatedAt": "2026-09-01T10:35:00Z",
    "updatedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "changes": [
      {
        "field": "bedNumber",
        "from": "B-10",
        "to": "B-12"
      },
      {
        "field": "painScore",
        "from": 5,
        "to": 4
      }
    ],
    "admission": {
      "id": "507f1f77bcf86cd799439017",
      "admissionDate": "2026-08-30T00:00:00Z",
      "bedNumber": "B-12",
      "painScore": 4,
      "status": "Active"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 403 | Not admin | "Only admin can edit admissions" |
| 400 | Validation error | Field-specific errors |
| 400 | Missing discharge fields | "Discharge date and reason required for discharge" |
| 401 | Missing or invalid token | "Unauthorized" |

**Error Response Example (Validation Error):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "painScore",
      "message": "Pain score must be between 0 and 10"
    }
  ]
}
```

**Error Response Example (Not Admin):**

```json
{
  "statusCode": 403,
  "success": false,
  "message": "Only admin can edit admissions",
  "errors": []
}
```

**Error Response Example (Discharging Without Required Fields):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Discharge date and reason required for discharge",
  "errors": []
}
```

---

### GET /admin/admissions/:admissionId/history

**Purpose:** Get admission edit history (audit trail)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| admissionId | string | Admission ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "editedBy": {
        "id": "507f1f77bcf86cd799439001",
        "name": "Admin User"
      },
      "editedAt": "2026-09-01T10:30:00Z",
      "changes": [
        {
          "field": "bedNumber",
          "from": "B-10",
          "to": "B-12"
        },
        {
          "field": "painScore",
          "from": 5,
          "to": 4"
        }
      ]
    },
    {
      "editedBy": {
        "id": "507f1f77bcf86cd799439005",
        "name": "Super Admin"
      },
      "editedAt": "2026-08-31T14:20:00Z",
      "changes": [
        {
          "field": "ppsScore",
          "from": 55,
          "to": 60
        }
      ]
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Admission not found | "Admission not found" |
| 401 | Missing or invalid token | "Unauthorized" |
| 403 | Non-admin user | "Forbidden" |

---

## 4. Type Definitions

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

## 5. Validation Schemas

```typescript
// src/schemas/admin.schema.ts

export const updateAdmissionSchema = z.object({
  body: z.object({
    // Admission Details
    admissionDate: z.string().date().optional(),
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
    dischargeDate: z.string().date().optional(),
    dischargeReason: z.enum(['Improved', 'Deceased']).optional(),
  }),
});

export const getAdmissionParamsSchema = z.object({
  params: z.object({
    admissionId: z.string().min(1, 'Admission ID is required'),
  }),
});
```

---

## 6. Service Functions

### src/services/admin.service.ts

#### getAdmissionById

| Field | Detail |
|---|---|
| Signature | `getAdmissionById(admissionId: string): Promise<AdminAdmissionDetail>` |
| Purpose | Get admission details with edit history |
| Inputs | admissionId |
| Output | Full admission detail with edit history |
| Throws | `ApiError(404, "Admission not found")` |
| Side Effects | Read-only |

#### updateAdmission

| Field | Detail |
|---|---|
| Signature | `updateAdmission(admissionId: string, data: UpdateAdmissionInput, adminId: string): Promise<UpdateAdmissionResponse>` |
| Purpose | Update admission record with audit trail |
| Inputs | admissionId, data, adminId |
| Output | Updated admission response with audit trail |
| Throws | `ApiError(404, "Admission not found")` |
| Throws | `ApiError(403, "Only admin can edit admissions")` |
| Throws | `ApiError(400, "Validation error")` |
| Throws | `ApiError(400, "Discharge date and reason required for discharge")` |
| Side Effects | Updates admission record, logs changes in edit history |

**Implementation Details:**

1. Find admission by ID
2. Verify admin role
3. Track changes by comparing each field
4. If discharging (status = "Discharged"), validate dischargeDate and dischargeReason
5. Record changes with before/after values
6. Update admission with new data
7. Append edit history entry with admin ID, timestamp, and changes
8. Return updated admission with audit trail

#### getAdmissionEditHistory

| Field | Detail |
|---|---|
| Signature | `getAdmissionEditHistory(admissionId: string): Promise<AdmissionEditHistoryEntry[]>` |
| Purpose | Get admission edit history |
| Inputs | admissionId |
| Output | Array of edit history entries |
| Throws | `ApiError(404, "Admission not found")` |
| Side Effects | Read-only |

---

## 7. Controller Functions

### src/controllers/admin.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getAdmissionById | `adminService.getAdmissionById(req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateAdmission | `adminService.updateAdmission(req.params.admissionId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Admission updated successfully", result)` |
| getAdmissionEditHistory | `adminService.getAdmissionEditHistory(req.params.admissionId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 8. Route Definitions

### src/routes/admin.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /admissions/:admissionId | `authMiddleware, roleMiddleware(['admin'])` | getAdmissionById |
| PUT | /admissions/:admissionId | `authMiddleware, roleMiddleware(['admin']), validate(updateAdmissionSchema)` | updateAdmission |
| GET | /admissions/:admissionId/history | `authMiddleware, roleMiddleware(['admin'])` | getAdmissionEditHistory |

---

## 9. Audit Trail Implementation

### HospitalAdmission Model with Edit History

```typescript
// src/models/HospitalAdmission.ts

export interface IHospitalAdmission extends Document {
  // ... existing fields
  editHistory?: Array<{
    editedBy: mongoose.Types.ObjectId;
    editedAt: Date;
    changes: Array<{
      field: string;
      from: any;
      to: any;
    }>;
  }>;
  // ... rest of schema
}

const HospitalAdmissionSchema = new Schema<IHospitalAdmission>({
  // ... existing fields
  editHistory: [{
    editedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    editedAt: { type: Date, default: Date.now },
    changes: [{
      field: String,
      from: Schema.Types.Mixed,
      to: Schema.Types.Mixed
    }]
  }]
}, {
  timestamps: true
});
```

### Change Tracking Function

```typescript
// src/services/admin.service.ts (internal function)

const trackAdmissionChanges = (original: any, updated: any): Array<{ field: string; from: any; to: any }> => {
  const changes: Array<{ field: string; from: any; to: any }> = [];
  const fieldsToTrack = [
    'admissionDate', 'bedNumber', 'ward', 'admittingPhysician', 'careTeam',
    'primaryDiagnosis', 'diseaseStage', 'estimatedPrognosis', 'ppsScore',
    'functionalStatus', 'painScore', 'painType', 'emotionalStatus',
    'familySupport', 'spiritualConcerns', 'painManagementPlan',
    'medicationPlan', 'nursingCarePlan', 'homeBasedCareRequired',
    'physiotherapyRequired', 'status', 'dischargeDate', 'dischargeReason'
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

  // Handle arrays
  if (updated.secondaryDiagnoses && original.secondaryDiagnoses) {
    if (JSON.stringify(updated.secondaryDiagnoses) !== JSON.stringify(original.secondaryDiagnoses)) {
      changes.push({
        field: 'secondaryDiagnoses',
        from: original.secondaryDiagnoses,
        to: updated.secondaryDiagnoses
      });
    }
  }

  if (updated.comorbidities && original.comorbidities) {
    if (JSON.stringify(updated.comorbidities) !== JSON.stringify(original.comorbidities)) {
      changes.push({
        field: 'comorbidities',
        from: original.comorbidities,
        to: updated.comorbidities
      });
    }
  }

  if (updated.symptomsPresent && original.symptomsPresent) {
    if (JSON.stringify(updated.symptomsPresent) !== JSON.stringify(original.symptomsPresent)) {
      changes.push({
        field: 'symptomsPresent',
        from: original.symptomsPresent,
        to: updated.symptomsPresent
      });
    }
  }

  return changes;
};
```

---

## 10. Test Cases

### GET /admin/admissions/:admissionId

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Admission exists | Mock admission found | GET /admin/admissions/:admissionId | 200, returns admission with edit history |
| Admission not found | Mock admission not found | GET /admin/admissions/:admissionId | 404, "Admission not found" |
| Non-admin user | Mock staff authenticated | GET /admin/admissions/:admissionId | 403, "Forbidden" |

### PUT /admin/admissions/:admissionId

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid update | Mock admission found, admin authenticated | PUT /admin/admissions/:admissionId with valid data | 200, admission updated, audit trail created |
| Admission not found | Mock admission not found | PUT /admin/admissions/:admissionId | 404, "Admission not found" |
| Non-admin user | Mock staff authenticated | PUT /admin/admissions/:admissionId | 403, "Only admin can edit admissions" |
| Invalid data | Mock admission found, admin authenticated | PUT /admin/admissions/:admissionId with invalid painScore | 400, Validation error |
| No changes | Mock admission found, admin authenticated | PUT /admin/admissions/:admissionId with empty body | 200, no changes, no audit entry |
| Discharge without required fields | Mock admission found, admin authenticated | PUT /admin/admissions/:admissionId with status "Discharged" only | 400, "Discharge date and reason required for discharge" |

### GET /admin/admissions/:admissionId/history

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Admission with history | Mock admission found with edit history | GET /admin/admissions/:admissionId/history | 200, returns edit history array |
| Admission with no history | Mock admission found with empty editHistory | GET /admin/admissions/:admissionId/history | 200, returns empty array |
| Admission not found | Mock admission not found | GET /admin/admissions/:admissionId/history | 404, "Admission not found" |

---

## 11. Flow Diagram

```
+-----------------------------------------------------------+
|              ADMIN ADMISSIONS FLOW (BACKEND)               |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    GET ADMISSION DETAILS             | |
|  |                                                     | |
|  |  GET /admin/admissions/:admissionId                 | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getAdmissionById         | |
|  |         -> adminService.getAdmissionById            | |
|  |         -> Find admission by ID                     | |
|  |         -> Populate createdBy                       | |
|  |         -> Return admission with edit history       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE ADMISSION                  | |
|  |                                                     | |
|  |  PUT /admin/admissions/:admissionId                 | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> validate(updateAdmissionSchema)          | |
|  |         -> adminController.updateAdmission          | |
|  |         -> adminService.updateAdmission             | |
|  |         -> Check admission exists                   | |
|  |         -> Verify admin role                        | |
|  |         -> Track changes (before/after)             | |
|  |         -> Update admission fields                  | |
|  |         -> Append edit history entry                | |
|  |         -> Return updated admission with audit trail| |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET EDIT HISTORY                  | |
|  |                                                     | |
|  |  GET /admin/admissions/:admissionId/history         | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getAdmissionEditHistory  | |
|  |         -> adminService.getAdmissionEditHistory     | |
|  |         -> Find admission by ID                     | |
|  |         -> Extract editHistory array                | |
|  |         -> Return edit history entries              | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
`