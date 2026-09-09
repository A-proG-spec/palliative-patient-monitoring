# api/08-referrals.md


# PALLIATIVE PATIENT MONITORING SYSTEM - REFERRALS API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /patients/:patientId/referrals | Staff | Request referral |
| GET | /patients/:patientId/referrals | Staff | Get patient referrals |
| GET | /patients/:patientId/referrals/:referralId | Staff | Get referral details |

## 2. Endpoint Details

### POST /patients/:patientId/referrals

**Purpose:** Request patient referral

**Auth:** Staff

**Request Body:**

```json
{
  "referralType": "Outgoing",
  "referralDate": "2026-08-29",
  "primaryDiagnosis": "Stage IV Breast Cancer",
  "diseaseStage": "Advanced",
  "ppsScore": 60,
  "kpsScore": 60,
  "currentSymptoms": {
    "pain": 3,
    "dyspnea": 2,
    "fatigue": 5,
    "anxiety": 2,
    "depression": 1
  },
  "reasons": ["SymptomControl", "PainManagement"],
  "referringFacility": "Home Care Unit",
  "receivingFacility": "Yekatit 12 Hospital",
  "contactPerson": "Dr. Alem",
  "contactNumber": "+251944444444",
  "preparedBy": "Dr. Smith",
  "preparedByDesignation": "Physician",
  "signature": "Dr. Smith"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| referralType | Required, Incoming or Outgoing |
| referralDate | Required, valid date |
| primaryDiagnosis | Required |
| diseaseStage | Required, Early, Advanced, or EndStage |
| ppsScore | Required, 0-100 |
| kpsScore | Required, 0-100 |
| currentSymptoms | Required, all fields 0-10 |
| reasons | Required, at least one |
| referringFacility | Required |
| receivingFacility | Required |
| contactPerson | Required |
| contactNumber | Required |
| preparedBy | Required |
| preparedByDesignation | Required |
| signature | Required |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Referral requested successfully",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "patientId": "507f1f77bcf86cd799439012",
    "referralType": "Outgoing",
    "referralDate": "2026-08-29T00:00:00Z",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "status": "Pending",
    "reasons": ["SymptomControl", "PainManagement"],
    "receivingFacility": "Yekatit 12 Hospital",
    "requestedBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "preparedBy": "Dr. Smith",
    "preparedByDesignation": "Physician",
    "signature": "Dr. Smith",
    "actionTaken": null,
    "outcome": null,
    "followUpDate": null,
    "followUpStatus": null,
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Validation error | Field-specific errors |
| 400 | Missing required fields | "preparedBy, preparedByDesignation, and signature are required" |

---

### GET /patients/:patientId/referrals

**Purpose:** Get all referrals for a patient

**Auth:** Staff, Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| status | string | undefined | Filter by status (Pending, Accepted, Declined, Admitted, InfoRequested) |
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
        "id": "507f1f77bcf86cd799439016",
        "referralType": "Outgoing",
        "referralDate": "2026-08-29T00:00:00Z",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "status": "Pending",
        "reasons": ["SymptomControl", "PainManagement"],
        "receivingFacility": "Yekatit 12 Hospital",
        "requestedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "preparedBy": "Dr. Smith",
        "actionTaken": null,
        "followUpDate": null,
        "followUpStatus": null,
        "createdAt": "2026-08-29T10:00:00Z"
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

---

### GET /patients/:patientId/referrals/:referralId

**Purpose:** Get detailed referral information

**Auth:** Staff, Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "patientId": "507f1f77bcf86cd799439012",
    "referralType": "Outgoing",
    "referralDate": "2026-08-29T00:00:00Z",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "diseaseStage": "Advanced",
    "ppsScore": 60,
    "kpsScore": 60,
    "currentSymptoms": {
      "pain": 3,
      "dyspnea": 2,
      "fatigue": 5,
      "anxiety": 2,
      "depression": 1
    },
    "reasons": ["SymptomControl", "PainManagement"],
    "otherReason": null,
    "referringFacility": "Home Care Unit",
    "receivingFacility": "Yekatit 12 Hospital",
    "contactPerson": "Dr. Alem",
    "contactNumber": "+251944444444",
    "status": "Pending",
    "actionTaken": null,
    "outcome": null,
    "followUpDate": null,
    "followUpStatus": null,
    "requestedBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "approvedBy": null,
    "preparedBy": "Dr. Smith",
    "preparedByDesignation": "Physician",
    "signature": "Dr. Smith",
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Referral not found | "Referral not found" |
| 404 | Patient not found | "Patient not found" |

## 3. Type Definitions

```typescript
// src/types/referral.types.ts

export interface Referral {
  id: string;
  patientId: string;
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
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
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  actionTaken?: 'ReferralAccepted' | 'AppointmentScheduled' | 'AdditionalInfoRequested' | 'ReferralDeclined' | 'PatientAdmitted' | 'PatientTransferred' | null;
  outcome?: string | null;
  followUpDate?: string | null;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact' | null;
  requestedBy: string;
  approvedBy?: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralRequest {
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
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
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
}

export interface ReferralListResponse {
  items: Referral[];
  page: number;
  limit: number;
  total: number;
}
```

## 4. Field Reference Table

| Field | Type | Description | Source (Form Section) |
|---|---|---|---|
| referralType | Enum | Incoming or Outgoing | Referral Information |
| referralDate | Date | Date of referral | Referral Information |
| primaryDiagnosis | String | Primary diagnosis | Clinical Information |
| diseaseStage | Enum | Early, Advanced, EndStage | Clinical Information |
| ppsScore | Number | Palliative Performance Scale (0-100) | Clinical Information |
| kpsScore | Number | Karnofsky Performance Scale (0-100) | Clinical Information |
| currentSymptoms | Object | Pain, Dyspnea, Fatigue, Anxiety, Depression (0-10) | Clinical Information |
| reasons | Array | Reasons for referral | Reason for Referral |
| otherReason | String | Custom reason if "Other" selected | Reason for Referral |
| referringFacility | String | Referring facility/service | Referral Details |
| receivingFacility | String | Receiving facility/service | Referral Details |
| contactPerson | String | Contact person | Referral Details |
| contactNumber | String | Contact number | Referral Details |
| status | Enum | Pending, Accepted, Declined, Admitted, InfoRequested | System managed |
| actionTaken | Enum | ReferralAccepted, AppointmentScheduled, AdditionalInfoRequested, ReferralDeclined, PatientAdmitted, PatientTransferred | Action Taken |
| outcome | String | Outcome description | Outcome |
| followUpDate | Date | Follow-up date | Follow-Up |
| followUpStatus | Enum | Completed, Pending, UnableToContact | Follow-Up |
| requestedBy | ObjectId | Staff who requested referral | System managed |
| approvedBy | ObjectId | Admin who approved referral | System managed |
| preparedBy | String | Name of staff preparing referral | Staff Documentation |
| preparedByDesignation | String | Designation of staff | Staff Documentation |
| signature | String | Signature of staff | Staff Documentation |

## 5. Summary of Changes

| Change | Before | After |
|---|---|---|
| preparedBy field | Missing | Added (required) |
| preparedByDesignation field | Missing | Added (required) |
| signature field | Missing | Added (required) |
| actionTaken field | Inconsistent | Fully documented with all enum values |
| followUpDate field | Inconsistent | Fully documented |
| followUpStatus field | Inconsistent | Fully documented |
| Validation rules | Missing preparedBy fields | Added validation for preparedBy, preparedByDesignation, signature |
| Error response | Missing field validation | Added "preparedBy, preparedByDesignation, and signature are required" error |
| Response data | Missing fields | Added all fields in response |
| Field reference table | Not present | Added comprehensive field reference table |
