# api/11-admin-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - ADMIN VISITS API SPECIFICATION

## 1. Overview

This document defines the API endpoints for admin visit management features including viewing visit details with edit history, updating visit records (admin only), and retrieving visit edit history with audit trail.

**Base Path:** `/api/v1/admin`

**Auth:** All endpoints require Admin authentication (Bearer JWT with admin role)

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /visits/:visitId | Admin | Get visit details with edit history |
| PUT | /visits/:visitId | Admin | Update visit record (admin only) |
| GET | /visits/:visitId/history | Admin | Get visit edit history |

---

## 3. Endpoint Details

### GET /admin/visits/:visitId

**Purpose:** Get visit details with edit history (audit trail)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "patientId": "507f1f77bcf86cd799439012",
    "patientName": "Sarah Johnson",
    "visitDate": "2026-08-29T08:00:00Z",
    "timeStarted": "09:00",
    "timeEnded": "10:30",
    "visitType": "Routine",
    "teamMembers": [
      { "role": "TeamLeader", "name": "Dr. Smith" },
      { "role": "Nurse", "name": "Jane Doe" }
    ],
    "overallStatus": "Stable",
    "mobility": "RequiresAssistance",
    "vitals": {
      "temperature": 36.8,
      "pulse": 78,
      "bp": "120/80",
      "respiration": 18,
      "spo2": 97
    },
    "painScore": 3,
    "painLocation": ["Back"],
    "painCharacteristics": ["Dull"],
    "painMedicationEffective": true,
    "symptoms": ["Fatigue"],
    "adl": {
      "feeding": "NeedsAssistance",
      "bathing": "NeedsAssistance",
      "dressing": "Independent",
      "toileting": "NeedsAssistance",
      "mobility": "NeedsAssistance"
    },
    "ppsScore": 60,
    "kpsScore": 60,
    "appetite": "Fair",
    "oralIntake": "Reduced",
    "hydrationStatus": "Adequate",
    "emotionalStatus": "Stable",
    "familySupport": "Good",
    "financialDifficulty": false,
    "spiritualNeeds": false,
    "religiousSupportRequested": false,
    "medicationAvailable": true,
    "medicationCorrectlyTaken": true,
    "medicationSideEffects": false,
    "medicationRefillNeeded": false,
    "morphineAvailable": true,
    "adherenceLevel": "Good",
    "currentMedications": [],
    "caregiverBurden": "Moderate",
    "caregiverUnderstanding": "Good",
    "caregivingCapacity": "Moderate",
    "familyEmotionalStatus": "Stable",
    "educationProvided": ["PainManagement", "MedicationAdministration"],
    "homeCondition": "Clean",
    "homeObservations": ["AdequateLighting", "Ventilation"],
    "nursingCareGiven": ["MedicationAdmin", "Counseling"],
    "redFlags": ["None"],
    "redFlagActions": null,
    "referralsMade": [],
    "outcome": "Stable",
    "nextVisitDate": "2026-09-05T00:00:00Z",
    "teamLeaderId": "507f1f77bcf86cd799439010",
    "physicianId": "507f1f77bcf86cd799439009",
    "nurseId": "507f1f77bcf86cd799439008",
    "teamLeader": {
      "id": "507f1f77bcf86cd799439010",
      "name": "Dr. Smith"
    },
    "physician": {
      "id": "507f1f77bcf86cd799439009",
      "name": "Dr. Kebede"
    },
    "nurse": {
      "id": "507f1f77bcf86cd799439008",
      "name": "Jane Doe"
    },
    "createdAt": "2026-08-29T10:30:00Z",
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
            "field": "painScore",
            "from": 5,
            "to": 3
          },
          {
            "field": "outcome",
            "from": "SymptomsWorsened",
            "to": "Stable"
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
| 404 | Visit not found | "Visit not found" |
| 403 | Non-admin user | "Forbidden" |
| 401 | Missing or invalid token | "Unauthorized" |

---

### PUT /admin/visits/:visitId

**Purpose:** Update visit record (admin only) with audit trail

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |

**Request Body:**

```json
{
  "painScore": 3,
  "outcome": "Stable",
  "overallStatus": "Stable",
  "ppsScore": 60,
  "kpsScore": 60,
  "timeStarted": "09:00",
  "timeEnded": "10:30"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| visitDate | Optional, valid ISO date |
| timeStarted | Optional, valid time format (HH:MM) |
| timeEnded | Optional, valid time format (HH:MM) |
| visitType | Optional, valid enum (Routine, Emergency, FirstAssessment, PostDischarge, EndOfLife, Bereavement) |
| overallStatus | Optional, valid enum (Stable, Deteriorating, Critical, BedBound) |
| mobility | Optional, valid enum (Ambulatory, RequiresAssistance, Bedridden) |
| painScore | Optional, number between 0-10 |
| ppsScore | Optional, number between 0-100 |
| kpsScore | Optional, number between 0-100 |
| outcome | Optional, valid enum (Stable, SymptomsImproved, SymptomsUnchanged, SymptomsWorsened, ReferredToFacility, Deceased) |
| teamLeaderId | Optional, valid ObjectId |
| physicianId | Optional, valid ObjectId |
| nurseId | Optional, valid ObjectId |
| teamMembers | Optional, array of { role, name, staffId? } |
| vitals | Optional, object with temperature, pulse, bp, respiration, spo2 |
| painLocation | Optional, array of strings |
| painCharacteristics | Optional, array of strings |
| painMedicationEffective | Optional, boolean |
| symptoms | Optional, array of strings |
| adl | Optional, object with feeding, bathing, dressing, toileting, mobility |
| appetite | Optional, valid enum |
| oralIntake | Optional, valid enum |
| hydrationStatus | Optional, valid enum |
| emotionalStatus | Optional, valid enum |
| familySupport | Optional, valid enum |
| financialDifficulty | Optional, boolean |
| spiritualNeeds | Optional, boolean |
| religiousSupportRequested | Optional, boolean |
| medicationAvailable | Optional, boolean |
| medicationCorrectlyTaken | Optional, boolean |
| medicationSideEffects | Optional, boolean |
| medicationRefillNeeded | Optional, boolean |
| morphineAvailable | Optional, boolean |
| adherenceLevel | Optional, valid enum |
| currentMedications | Optional, array of { name, dosage, frequency, route } |
| caregiverBurden | Optional, valid enum |
| caregiverUnderstanding | Optional, valid enum |
| caregivingCapacity | Optional, valid enum |
| familyEmotionalStatus | Optional, valid enum |
| educationProvided | Optional, array of strings |
| homeCondition | Optional, valid enum |
| homeObservations | Optional, array of strings |
| nursingCareGiven | Optional, array of strings |
| redFlags | Optional, array of strings |
| redFlagActions | Optional, string |
| referralsMade | Optional, array of strings |
| nextVisitDate | Optional, valid ISO date |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Visit updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "updatedAt": "2026-09-01T10:35:00Z",
    "updatedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "changes": [
      {
        "field": "painScore",
        "from": 5,
        "to": 3
      },
      {
        "field": "outcome",
        "from": "SymptomsWorsened",
        "to": "Stable"
      }
    ],
    "visit": {
      "id": "507f1f77bcf86cd799439013",
      "visitDate": "2026-08-29T08:00:00Z",
      "painScore": 3,
      "outcome": "Stable",
      "overallStatus": "Stable",
      "ppsScore": 60,
      "kpsScore": 60
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |
| 403 | Not admin | "Only admin can edit visits" |
| 400 | Validation error | Field-specific errors |
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
  "message": "Only admin can edit visits",
  "errors": []
}
```

---

### GET /admin/visits/:visitId/history

**Purpose:** Get visit edit history (audit trail)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |

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
          "field": "painScore",
          "from": 5,
          "to": 3
        },
        {
          "field": "outcome",
          "from": "SymptomsWorsened",
          "to": "Stable"
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
| 404 | Visit not found | "Visit not found" |
| 401 | Missing or invalid token | "Unauthorized" |
| 403 | Non-admin user | "Forbidden" |

---

## 4. Type Definitions

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
  currentMedications: Array<{ name: string; dosage: string; frequency: string; route: string }>;
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
    feeding?: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing?: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing?: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting?: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility?: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore?: number;
  kpsScore?: number;
  appetite?: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake?: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus?: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  emotionalStatus?: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport?: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty?: boolean;
  spiritualNeeds?: boolean;
  religiousSupportRequested?: boolean;
  medicationAvailable?: boolean;
  medicationCorrectlyTaken?: boolean;
  medicationSideEffects?: boolean;
  medicationRefillNeeded?: boolean;
  morphineAvailable?: boolean;
  adherenceLevel?: 'Good' | 'Partial' | 'Poor';
  currentMedications?: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden?: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding?: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity?: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus?: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  homeCondition?: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  nursingCareGiven?: string[];
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  outcome?: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
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

## 5. Validation Schemas

```typescript
// src/schemas/admin.schema.ts

export const updateVisitSchema = z.object({
  body: z.object({
    visitDate: z.string().date().optional(),
    timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
    timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
    visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']).optional(),
    overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']).optional(),
    mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']).optional(),
    painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10').optional(),
    ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100').optional(),
    kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100').optional(),
    outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']).optional(),
    teamLeaderId: z.string().optional(),
    physicianId: z.string().optional(),
    nurseId: z.string().optional(),
  }),
});

export const getVisitParamsSchema = z.object({
  params: z.object({
    visitId: z.string().min(1, 'Visit ID is required'),
  }),
});
```

---

## 6. Service Functions

### src/services/admin.service.ts

#### getVisitById

| Field | Detail |
|---|---|
| Signature | `getVisitById(visitId: string): Promise<AdminVisitDetail>` |
| Purpose | Get visit details with edit history |
| Inputs | visitId |
| Output | Full visit detail with edit history |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

#### updateVisit

| Field | Detail |
|---|---|
| Signature | `updateVisit(visitId: string, data: UpdateVisitInput, adminId: string): Promise<UpdateVisitResponse>` |
| Purpose | Update visit record with audit trail |
| Inputs | visitId, data, adminId |
| Output | Updated visit response with audit trail |
| Throws | `ApiError(404, "Visit not found")` |
| Throws | `ApiError(403, "Only admin can edit visits")` |
| Throws | `ApiError(400, "Validation error")` |
| Side Effects | Updates visit record, logs changes in edit history |

**Implementation Details:**

1. Find visit by ID
2. Verify admin role
3. Track changes by comparing each field
4. Record changes with before/after values
5. Update visit with new data
6. Append edit history entry with admin ID, timestamp, and changes
7. Return updated visit with audit trail

#### getVisitEditHistory

| Field | Detail |
|---|---|
| Signature | `getVisitEditHistory(visitId: string): Promise<VisitEditHistoryEntry[]>` |
| Purpose | Get visit edit history |
| Inputs | visitId |
| Output | Array of edit history entries |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

---

## 7. Controller Functions

### src/controllers/admin.controller.ts

| Handler | Calls | Response |
|---|---|---|
| getVisitById | `adminService.getVisitById(req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |
| updateVisit | `adminService.updateVisit(req.params.visitId, req.body, req.user.id)` | 200, `SuccessResponse(200, "Visit updated successfully", result)` |
| getVisitEditHistory | `adminService.getVisitEditHistory(req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |

---

## 8. Route Definitions

### src/routes/admin.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| GET | /visits/:visitId | `authMiddleware, roleMiddleware(['admin'])` | getVisitById |
| PUT | /visits/:visitId | `authMiddleware, roleMiddleware(['admin']), validate(updateVisitSchema)` | updateVisit |
| GET | /visits/:visitId/history | `authMiddleware, roleMiddleware(['admin'])` | getVisitEditHistory |

---

## 9. Audit Trail Implementation

### HomeVisit Model with Edit History

```typescript
// src/models/HomeVisit.ts

export interface IHomeVisit extends Document {
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

const HomeVisitSchema = new Schema<IHomeVisit>({
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

const trackVisitChanges = (original: any, updated: any): Array<{ field: string; from: any; to: any }> => {
  const changes: Array<{ field: string; from: any; to: any }> = [];
  const fieldsToTrack = [
    'visitDate', 'timeStarted', 'timeEnded', 'visitType',
    'overallStatus', 'mobility', 'painScore', 'ppsScore', 'kpsScore',
    'outcome', 'teamLeaderId', 'physicianId', 'nurseId',
    'painMedicationEffective', 'financialDifficulty', 'spiritualNeeds',
    'religiousSupportRequested', 'medicationAvailable', 'medicationCorrectlyTaken',
    'medicationSideEffects', 'medicationRefillNeeded', 'morphineAvailable'
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

  // Handle nested objects
  if (updated.vitals && original.vitals) {
    for (const key of ['temperature', 'pulse', 'bp', 'respiration', 'spo2']) {
      if (updated.vitals[key] !== undefined && original.vitals[key] !== updated.vitals[key]) {
        changes.push({
          field: `vitals.${key}`,
          from: original.vitals[key],
          to: updated.vitals[key]
        });
      }
    }
  }

  if (updated.adl && original.adl) {
    for (const key of ['feeding', 'bathing', 'dressing', 'toileting', 'mobility']) {
      if (updated.adl[key] !== undefined && original.adl[key] !== updated.adl[key]) {
        changes.push({
          field: `adl.${key}`,
          from: original.adl[key],
          to: updated.adl[key]
        });
      }
    }
  }

  // Handle arrays (teamMembers, currentMedications, etc.)
  // For simplicity, track as full replacement if changed
  if (updated.teamMembers && original.teamMembers) {
    if (JSON.stringify(updated.teamMembers) !== JSON.stringify(original.teamMembers)) {
      changes.push({
        field: 'teamMembers',
        from: original.teamMembers,
        to: updated.teamMembers
      });
    }
  }

  return changes;
};
```

---

## 10. Test Cases

### GET /admin/visits/:visitId

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Visit exists | Mock visit found | GET /admin/visits/:visitId | 200, returns visit with edit history |
| Visit not found | Mock visit not found | GET /admin/visits/:visitId | 404, "Visit not found" |
| Non-admin user | Mock staff authenticated | GET /admin/visits/:visitId | 403, "Forbidden" |

### PUT /admin/visits/:visitId

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid update | Mock visit found, admin authenticated | PUT /admin/visits/:visitId with valid data | 200, visit updated, audit trail created |
| Visit not found | Mock visit not found | PUT /admin/visits/:visitId | 404, "Visit not found" |
| Non-admin user | Mock staff authenticated | PUT /admin/visits/:visitId | 403, "Only admin can edit visits" |
| Invalid data | Mock visit found, admin authenticated | PUT /admin/visits/:visitId with invalid painScore | 400, Validation error |
| No changes | Mock visit found, admin authenticated | PUT /admin/visits/:visitId with empty body | 200, no changes, no audit entry |

### GET /admin/visits/:visitId/history

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Visit with history | Mock visit found with edit history | GET /admin/visits/:visitId/history | 200, returns edit history array |
| Visit with no history | Mock visit found with empty editHistory | GET /admin/visits/:visitId/history | 200, returns empty array |
| Visit not found | Mock visit not found | GET /admin/visits/:visitId/history | 404, "Visit not found" |

---

## 11. Flow Diagram

```
+-----------------------------------------------------------+
|              ADMIN VISITS FLOW (BACKEND)                   |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    GET VISIT DETAILS                 | |
|  |                                                     | |
|  |  GET /admin/visits/:visitId                         | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getVisitById             | |
|  |         -> adminService.getVisitById                | |
|  |         -> Find visit by ID                         | |
|  |         -> Populate team members                    | |
|  |         -> Return visit with edit history           | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    UPDATE VISIT                      | |
|  |                                                     | |
|  |  PUT /admin/visits/:visitId                         | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> validate(updateVisitSchema)              | |
|  |         -> adminController.updateVisit              | |
|  |         -> adminService.updateVisit                 | |
|  |         -> Check visit exists                       | |
|  |         -> Verify admin role                        | |
|  |         -> Track changes (before/after)             | |
|  |         -> Update visit fields                      | |
|  |         -> Append edit history entry                | |
|  |         -> Return updated visit with audit trail   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET EDIT HISTORY                  | |
|  |                                                     | |
|  |  GET /admin/visits/:visitId/history                 | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> adminController.getVisitEditHistory      | |
|  |         -> adminService.getVisitEditHistory         | |
|  |         -> Find visit by ID                         | |
|  |         -> Extract editHistory array                | |
|  |         -> Return edit history entries              | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
