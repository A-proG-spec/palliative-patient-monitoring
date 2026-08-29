# api/04-visits.md


# PALLIATIVE PATIENT MONITORING SYSTEM - VISITS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/visits | Staff | Record home visit |
| GET | /patients/:patientId/visits | Staff | Get patient visits |
| GET | /patients/:patientId/visits/:visitId | Staff | Get visit details |

## 2. Endpoint Details

### POST /patients/:patientId/visits

**Purpose:** Record home visit

**Auth:** Staff

**Request Body:**

```json
{
  "visitDate": "2026-08-29",
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
  "outcome": "Stable",
  "nextVisitDate": "2026-09-05",
  "teamLeaderId": "507f1f77bcf86cd799439010",
  "physicianId": "507f1f77bcf86cd799439009",
  "nurseId": "507f1f77bcf86cd799439008"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| visitDate | Required, valid date |
| timeStarted | Required |
| timeEnded | Required |
| visitType | Required, valid enum |
| teamMembers | Required, at least one |
| overallStatus | Required, valid enum |
| mobility | Required, valid enum |
| painScore | Required, 0-10 |
| painMedicationEffective | Required, boolean |
| ppsScore | Required, 0-100 |
| kpsScore | Required, 0-100 |
| appetite | Required, valid enum |
| oralIntake | Required, valid enum |
| hydrationStatus | Required, valid enum |
| emotionalStatus | Required, valid enum |
| familySupport | Required, valid enum |
| financialDifficulty | Required, boolean |
| spiritualNeeds | Required, boolean |
| religiousSupportRequested | Required, boolean |
| medicationAvailable | Required, boolean |
| medicationCorrectlyTaken | Required, boolean |
| medicationSideEffects | Required, boolean |
| medicationRefillNeeded | Required, boolean |
| morphineAvailable | Required, boolean |
| adherenceLevel | Required, valid enum |
| caregiverBurden | Required, valid enum |
| caregiverUnderstanding | Required, valid enum |
| caregivingCapacity | Required, valid enum |
| familyEmotionalStatus | Required, valid enum |
| homeCondition | Required, valid enum |
| outcome | Required, valid enum |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Home visit recorded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "patientId": "507f1f77bcf86cd799439012",
    "visitDate": "2026-08-29T00:00:00Z",
    "outcome": "Stable",
    "createdAt": "2026-08-29T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Validation error | Field-specific errors |

### GET /patients/:patientId/visits

**Purpose:** Get all visits for a patient

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439013",
        "visitDate": "2026-08-29T00:00:00Z",
        "visitType": "Routine",
        "overallStatus": "Stable",
        "outcome": "Stable",
        "teamMembers": [
          { "role": "TeamLeader", "name": "Dr. Smith" },
          { "role": "Nurse", "name": "Jane Doe" }
        ],
        "createdAt": "2026-08-29T10:30:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

### GET /patients/:patientId/visits/:visitId

**Purpose:** Get detailed visit information

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "patientId": "507f1f77bcf86cd799439012",
    "visitDate": "2026-08-29T00:00:00Z",
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
    "outcome": "Stable",
    "nextVisitDate": "2026-09-05T00:00:00Z",
    "teamLeaderId": "507f1f77bcf86cd799439010",
    "physicianId": "507f1f77bcf86cd799439009",
    "nurseId": "507f1f77bcf86cd799439008",
    "createdAt": "2026-08-29T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |
| 404 | Patient not found | "Patient not found" |

## 3. Type Definitions

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