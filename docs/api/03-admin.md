# api/03-admin.md


# PALLIATIVE PATIENT MONITORING SYSTEM - ADMIN API SPECIFICATION

## 1. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/staff/pending | Admin | Get pending staff registrations |
| PUT | /admin/staff/:staffId/approve | Admin | Approve staff |
| PUT | /admin/staff/:staffId/reject | Admin | Reject staff |
| GET | /admin/dashboard/stats | Admin | Get dashboard statistics |
| GET | /admin/dashboard/notifications | Admin | Get admin notifications |
| PUT | /admin/dashboard/notifications/:notificationId/read | Admin | Mark notification as read |
| GET | /admin/patients | Admin | Get all patients |
| GET | /admin/patients/:patientId | Admin | Get patient details (basic) |
| GET | /admin/patients/:patientId/full | Admin | Get patient details with full records (like staff view) |
| PUT | /admin/patients/:patientId/close-case | Admin | Close patient case (discharge) |
| GET | /admin/patients/:patientId/print | Admin | Get patient data formatted for print |
| GET | /admin/patients/:patientId/export | Admin | Export patient history as PDF |
| GET | /admin/referrals/pending | Admin | Get pending referrals |
| PUT | /admin/referrals/:referralId/approve | Admin | Approve referral |
| PUT | /admin/referrals/:referralId/decline | Admin | Decline referral |
| GET | /admin/visits/:visitId | Admin | Get visit details with edit history |
| PUT | /admin/visits/:visitId | Admin | Update visit record (admin only) |
| GET | /admin/visits/:visitId/history | Admin | Get visit edit history |
| GET | /admin/reports | Admin | Get system reports |
| GET | /admin/reports/export | Admin | Export report (PDF/Excel) |

## 2. Endpoint Details

### GET /admin/staff/pending

**Purpose:** Get all pending staff registrations

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+251911111111",
      "role": null,
      "status": "Pending",
      "createdAt": "2026-08-29T10:00:00Z"
    }
  ]
}
```

---

### PUT /admin/staff/:staffId/approve

**Purpose:** Approve staff registration and assign role

**Auth:** Admin

**Request Body:**

```json
{
  "role": "Nurse"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| role | Required, must be TeamLeader, Physician, or Nurse |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Staff approved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911111111",
    "role": "Nurse",
    "status": "Active",
    "assignedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "updatedAt": "2026-08-29T10:05:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Staff not found | "Staff member not found" |
| 400 | Invalid role | "Invalid role specified" |
| 400 | Staff already approved | "Staff member is already approved" |

---

### PUT /admin/staff/:staffId/reject

**Purpose:** Reject staff registration

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Staff registration rejected",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "Rejected"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Staff not found | "Staff member not found" |
| 400 | Staff already approved | "Staff member is already approved" |

---

### GET /admin/dashboard/stats

**Purpose:** Get admin dashboard statistics with notifications

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 234,
    "activePatients": 156,
    "hospitalizedPatients": 45,
    "dischargedPatients": 33,
    "pendingReferrals": 12,
    "pendingStaff": 5,
    "notifications": {
      "staffApprovals": 3,
      "pendingReferrals": 12,
      "recentCloseCases": 5
    },
    "patientsByStatus": [
      { "status": "Active", "count": 156 },
      { "status": "Discharged", "count": 33 },
      { "status": "ReferredHospital", "count": 45 }
    ],
    "recentReferrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "patientName": "Sarah Johnson",
        "date": "2026-08-29T09:30:00Z",
        "status": "Pending"
      }
    ],
    "recentVisits": [
      {
        "patientName": "Sarah Johnson",
        "date": "2026-08-29T08:00:00Z",
        "staff": "Jane Doe"
      }
    ]
  }
}
```

---

### GET /admin/dashboard/notifications

**Purpose:** Get admin notifications

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| limit | number | 20 | Number of notifications to return |
| read | boolean | undefined | Filter by read status |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "notifications": [
      {
        "id": "507f1f77bcf86cd799439020",
        "type": "StaffApproval",
        "message": "New staff registration pending: John Doe",
        "data": {
          "staffId": "507f1f77bcf86cd799439011",
          "staffName": "John Doe"
        },
        "read": false,
        "createdAt": "2026-08-29T10:00:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439021",
        "type": "ReferralApproval",
        "message": "New referral request: Sarah Johnson",
        "data": {
          "referralId": "507f1f77bcf86cd799439016",
          "patientId": "507f1f77bcf86cd799439012",
          "patientName": "Sarah Johnson"
        },
        "read": false,
        "createdAt": "2026-08-29T09:30:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "type": "CloseCase",
        "message": "Patient case closed: Michael Brown",
        "data": {
          "patientId": "507f1f77bcf86cd799439013",
          "patientName": "Michael Brown",
          "reason": "Improved"
        },
        "read": true,
        "createdAt": "2026-08-28T16:00:00Z"
      }
    ],
    "unreadCount": 15,
    "totalCount": 25
  }
}
```

---

### PUT /admin/dashboard/notifications/:notificationId/read

**Purpose:** Mark notification as read

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "read": true
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Notification not found | "Notification not found" |

---

### GET /admin/patients

**Purpose:** Get all patients with pagination and filters

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | undefined | Filter by status (Active, Discharged) |
| search | string | undefined | Search by name or ID |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439012",
        "patientDisplayId": "PAT-001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "age": 65,
        "sex": "Female",
        "status": "Active",
        "currentLocation": "Home",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "registeredAt": "2026-08-29T10:00:00Z",
        "registeredBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        }
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

### GET /admin/patients/:patientId

**Purpose:** Get basic patient information (summary view)

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "age": 65,
    "sex": "Female",
    "dateOfBirth": "1961-08-15",
    "address": "Bole, Addis Ababa",
    "phone": "+251922222222",
    "emergencyContactName": "Michael Johnson",
    "emergencyContactPhone": "+251933333333",
    "caregiverName": "Michael Johnson",
    "caregiverPhone": "+251933333333",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### GET /admin/patients/:patientId/full (NEW)

**Purpose:** Get detailed patient information including ALL records (like staff view) with full visit details, medications, labs, referrals, admissions, and KPS/PPS progress

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "patientDisplayId": "PAT-001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "age": 65,
    "sex": "Female",
    "dateOfBirth": "1961-08-15",
    "address": "Bole, Addis Ababa",
    "phone": "+251922222222",
    "emergencyContactName": "Michael Johnson",
    "emergencyContactPhone": "+251933333333",
    "caregiverName": "Michael Johnson",
    "caregiverPhone": "+251933333333",
    "primaryDiagnosis": "Stage IV Breast Cancer",
    "secondaryDiagnoses": ["Metastatic to bone"],
    "diseaseStage": "Advanced",
    "comorbidities": ["Hypertension"],
    "estimatedPrognosis": "Months",
    "status": "Active",
    "currentLocation": "Home",
    "registeredBy": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
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
        "outcome": "Stable",
        "nextVisitDate": "2026-09-05T00:00:00Z",
        "teamLeader": { "id": "507f1f77bcf86cd799439010", "name": "Dr. Smith" },
        "physician": { "id": "507f1f77bcf86cd799439009", "name": "Dr. Kebede" },
        "nurse": { "id": "507f1f77bcf86cd799439008", "name": "Jane Doe" },
        "createdAt": "2026-08-29T10:30:00Z",
        "updatedAt": "2026-08-29T10:30:00Z",
        "canEdit": true,
        "editHistory": [
          {
            "editedBy": { "id": "507f1f77bcf86cd799439001", "name": "Admin User" },
            "editedAt": "2026-09-01T10:30:00Z",
            "changes": [
              { "field": "painScore", "from": 5, "to": 3 },
              { "field": "outcome", "from": "SymptomsWorsened", "to": "Stable" }
            ]
          }
        ]
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "frequency": "Every 6 hours",
        "route": "Oral",
        "administeredAt": "Home",
        "status": "Given",
        "prescribedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "visitId": null,
        "admissionId": null,
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "labTests": [
      {
        "id": "507f1f77bcf86cd799439015",
        "testName": "Complete Blood Count",
        "dateOrdered": "2026-08-29T00:00:00Z",
        "datePerformed": "2026-08-30T00:00:00Z",
        "result": "Normal - WBC: 6.5, RBC: 4.2, HGB: 13.5, PLT: 250",
        "location": "Home",
        "status": "Completed",
        "orderedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "visitId": null,
        "admissionId": null,
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "referrals": [
      {
        "id": "507f1f77bcf86cd799439016",
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
        "status": "Accepted",
        "actionTaken": "ReferralAccepted",
        "outcome": "Patient transferred for inpatient care",
        "followUpDate": "2026-09-05T00:00:00Z",
        "followUpStatus": "Pending",
        "requestedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "John Doe"
        },
        "approvedBy": {
          "id": "507f1f77bcf86cd799439001",
          "name": "Admin User"
        },
        "preparedBy": "Dr. Smith",
        "preparedByDesignation": "Physician",
        "signature": "Dr. Smith",
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "admissions": [
      {
        "id": "507f1f77bcf86cd799439017",
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
          "name": "John Doe"
        },
        "createdAt": "2026-08-30T10:00:00Z"
      }
    ],
    "progress": {
      "data": [
        { "visitId": "507f1f77bcf86cd799439013", "visitDate": "2026-08-29T08:00:00Z", "kpsScore": 60, "ppsScore": 60 },
        { "visitId": "507f1f77bcf86cd799439018", "visitDate": "2026-08-22T08:00:00Z", "kpsScore": 45, "ppsScore": 50 },
        { "visitId": "507f1f77bcf86cd799439019", "visitDate": "2026-08-15T08:00:00Z", "kpsScore": 30, "ppsScore": 35 }
      ],
      "trends": {
        "kps": {
          "trend": "declining",
          "percentageChange": -25,
          "firstScore": 60,
          "lastScore": 45
        },
        "pps": {
          "trend": "declining",
          "percentageChange": -20,
          "firstScore": 60,
          "lastScore": 48
        }
      }
    },
    "createdAt": "2026-08-29T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |

---

### PUT /admin/patients/:patientId/close-case

**Purpose:** Close patient case (formerly "discharge patient")

**Auth:** Admin

**Request Body:**

```json
{
  "reason": "Improved"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| reason | Required, must be Improved or Deceased |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Patient case closed successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "Discharged",
    "closeReason": "Improved",
    "closeDate": "2026-08-29T10:15:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Patient not found | "Patient not found" |
| 400 | Invalid reason | "Invalid close reason" |
| 400 | Already closed | "Patient case is already closed" |

---

### GET /admin/patients/:patientId/print (NEW)

**Purpose:** Get patient data formatted for print/export with ALL records and FULL details

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439012",
      "patientDisplayId": "PAT-001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "age": 65,
      "sex": "Female",
      "dateOfBirth": "1961-08-15",
      "address": "Bole, Addis Ababa",
      "phone": "+251922222222",
      "emergencyContactName": "Michael Johnson",
      "emergencyContactPhone": "+251933333333",
      "caregiverName": "Michael Johnson",
      "caregiverPhone": "+251933333333",
      "status": "Active",
      "currentLocation": "Home",
      "primaryDiagnosis": "Stage IV Breast Cancer",
      "secondaryDiagnoses": ["Metastatic to bone"],
      "diseaseStage": "Advanced",
      "comorbidities": ["Hypertension"],
      "estimatedPrognosis": "Months",
      "registeredBy": { "id": "507f1f77bcf86cd799439011", "name": "John Doe" },
      "createdAt": "2026-08-29T10:00:00Z"
    },
    "progress": {
      "data": [
        { "visitId": "v1", "visitDate": "2026-08-29T08:00:00Z", "kpsScore": 60, "ppsScore": 60 },
        { "visitId": "v2", "visitDate": "2026-08-22T08:00:00Z", "kpsScore": 45, "ppsScore": 50 }
      ],
      "trends": {
        "kps": { "trend": "declining", "percentageChange": -25, "firstScore": 60, "lastScore": 45 },
        "pps": { "trend": "declining", "percentageChange": -20, "firstScore": 60, "lastScore": 48 }
      }
    },
    "visits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "visitDate": "2026-08-29T08:00:00Z",
        "timeStarted": "09:00",
        "timeEnded": "10:30",
        "visitType": "Routine",
        "teamMembers": [{ "role": "TeamLeader", "name": "Dr. Smith" }],
        "overallStatus": "Stable",
        "mobility": "RequiresAssistance",
        "vitals": { "temperature": 36.8, "pulse": 78, "bp": "120/80", "respiration": 18, "spo2": 97 },
        "painScore": 3,
        "painLocation": ["Back"],
        "painCharacteristics": ["Dull"],
        "painMedicationEffective": true,
        "symptoms": ["Fatigue"],
        "adl": { "feeding": "NeedsAssistance", "bathing": "NeedsAssistance", "dressing": "Independent", "toileting": "NeedsAssistance", "mobility": "NeedsAssistance" },
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
        "educationProvided": ["PainManagement"],
        "homeCondition": "Clean",
        "homeObservations": ["AdequateLighting"],
        "nursingCareGiven": ["MedicationAdmin"],
        "redFlags": ["None"],
        "outcome": "Stable",
        "nextVisitDate": "2026-09-05T00:00:00Z",
        "teamLeader": { "id": "id1", "name": "Dr. Smith" },
        "physician": { "id": "id2", "name": "Dr. Kebede" },
        "nurse": { "id": "id3", "name": "Jane Doe" }
      }
    ],
    "medications": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Morphine",
        "dosage": "10mg",
        "frequency": "Every 6 hours",
        "route": "Oral",
        "administeredAt": "Home",
        "status": "Given",
        "prescribedBy": { "id": "id", "name": "John Doe" },
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "labTests": [
      {
        "id": "507f1f77bcf86cd799439015",
        "testName": "Complete Blood Count",
        "dateOrdered": "2026-08-29T00:00:00Z",
        "datePerformed": "2026-08-30T00:00:00Z",
        "result": "Normal",
        "location": "Home",
        "status": "Completed",
        "orderedBy": { "id": "id", "name": "John Doe" }
      }
    ],
    "referrals": [
      {
        "id": "507f1f77bcf86cd799439016",
        "referralType": "Outgoing",
        "referralDate": "2026-08-29T00:00:00Z",
        "primaryDiagnosis": "Stage IV Breast Cancer",
        "diseaseStage": "Advanced",
        "ppsScore": 60,
        "kpsScore": 60,
        "currentSymptoms": { "pain": 3, "dyspnea": 2, "fatigue": 5, "anxiety": 2, "depression": 1 },
        "reasons": ["SymptomControl", "PainManagement"],
        "referringFacility": "Home Care Unit",
        "receivingFacility": "Yekatit 12 Hospital",
        "contactPerson": "Dr. Alem",
        "contactNumber": "+251944444444",
        "status": "Accepted",
        "actionTaken": "ReferralAccepted",
        "outcome": "Patient transferred",
        "followUpDate": "2026-09-05T00:00:00Z",
        "followUpStatus": "Pending",
        "requestedBy": { "id": "id", "name": "John Doe" },
        "approvedBy": { "id": "id", "name": "Admin User" },
        "preparedBy": "Dr. Smith",
        "preparedByDesignation": "Physician",
        "signature": "Dr. Smith",
        "createdAt": "2026-08-29T10:00:00Z"
      }
    ],
    "admissions": [
      {
        "id": "507f1f77bcf86cd799439017",
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
        "spiritualConcerns": false,
        "painManagementPlan": "Morphine 10mg every 6 hours",
        "medicationPlan": "Continue current medications",
        "nursingCarePlan": "Daily monitoring and pain assessment",
        "homeBasedCareRequired": false,
        "physiotherapyRequired": false,
        "dischargeReason": null,
        "status": "Active",
        "createdBy": { "id": "id", "name": "John Doe" }
      }
    ],
    "generatedAt": "2026-09-01T10:30:00Z",
    "generatedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

---

### GET /admin/patients/:patientId/export (NEW)

**Purpose:** Export patient history as PDF with ALL records and FULL details

**Auth:** Admin

**Success Response (200):**

Returns a PDF file blob.

**Response Headers:**

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=patient-history-PAT-001.pdf`

---

### GET /admin/referrals/pending

**Purpose:** Get pending referral requests

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "507f1f77bcf86cd799439016",
      "patientId": "507f1f77bcf86cd799439012",
      "patientName": "Sarah Johnson",
      "referralDate": "2026-08-29T09:30:00Z",
      "primaryDiagnosis": "Stage IV Breast Cancer",
      "status": "Pending",
      "reasons": ["SymptomControl", "PainManagement"],
      "receivingFacility": "Yekatit 12 Hospital"
    }
  ]
}
```

---

### PUT /admin/referrals/:referralId/approve

**Purpose:** Approve referral request

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Referral approved",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "status": "Accepted",
    "approvedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "updatedAt": "2026-08-29T10:10:00Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Referral not found | "Referral not found" |
| 400 | Referral already processed | "Referral has already been processed" |

---

### PUT /admin/referrals/:referralId/decline

**Purpose:** Decline referral request

**Auth:** Admin

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Referral declined",
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "status": "Declined"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Referral not found | "Referral not found" |
| 400 | Referral already processed | "Referral has already been processed" |

---

### GET /admin/visits/:visitId (NEW)

**Purpose:** Get visit details with edit history

**Auth:** Admin

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
    "outcome": "Stable",
    "nextVisitDate": "2026-09-05T00:00:00Z",
    "teamLeaderId": "507f1f77bcf86cd799439010",
    "physicianId": "507f1f77bcf86cd799439009",
    "nurseId": "507f1f77bcf86cd799439008",
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-09-01T10:30:00Z",
    "editHistory": [
      {
        "editedBy": { "id": "507f1f77bcf86cd799439001", "name": "Admin User" },
        "editedAt": "2026-09-01T10:30:00Z",
        "changes": [
          { "field": "painScore", "from": 5, "to": 3 },
          { "field": "outcome", "from": "SymptomsWorsened", "to": "Stable" }
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

---

### PUT /admin/visits/:visitId (NEW)

**Purpose:** Update visit record (admin only) with audit trail

**Auth:** Admin

**Request Body:**

```json
{
  "painScore": 3,
  "outcome": "Stable",
  "overallStatus": "Stable",
  "ppsScore": 60,
  "kpsScore": 60
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| visitDate | Optional, valid date |
| timeStarted | Optional, valid time |
| timeEnded | Optional, valid time |
| visitType | Optional, valid enum |
| overallStatus | Optional, valid enum |
| painScore | Optional, 0-10 |
| ppsScore | Optional, 0-100 |
| kpsScore | Optional, 0-100 |
| outcome | Optional, valid enum |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Visit updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "updatedAt": "2026-09-01T10:30:00Z",
    "updatedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    },
    "changes": [
      { "field": "painScore", "from": 5, "to": 3 },
      { "field": "outcome", "from": "SymptomsWorsened", "to": "Stable" }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |
| 403 | Not admin | "Only admin can edit visits" |
| 400 | Validation error | Field-specific errors |

---

### GET /admin/visits/:visitId/history (NEW)

**Purpose:** Get visit edit history

**Auth:** Admin

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
        { "field": "painScore", "from": 5, "to": 3 },
        { "field": "outcome", "from": "SymptomsWorsened", "to": "Stable" }
      ]
    },
    {
      "editedBy": {
        "id": "507f1f77bcf86cd799439005",
        "name": "Super Admin"
      },
      "editedAt": "2026-08-31T14:20:00Z",
      "changes": [
        { "field": "ppsScore", "from": 55, "to": 60 }
      ]
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |

---

### GET /admin/reports

**Purpose:** Get system reports and analytics

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| startDate | string | undefined | Start date for report (ISO date) |
| endDate | string | undefined | End date for report (ISO date) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 234,
    "activePatients": 156,
    "dischargedPatients": 33,
    "hospitalizedPatients": 45,
    "referralsByStatus": [
      { "status": "Pending", "count": 12 },
      { "status": "Accepted", "count": 25 },
      { "status": "Declined", "count": 8 },
      { "status": "Admitted", "count": 10 }
    ],
    "patientsByLocation": [
      { "location": "Home", "count": 156 },
      { "location": "ReferredHospital", "count": 45 }
    ],
    "patientsByStage": [
      { "stage": "Early", "count": 30 },
      { "stage": "Advanced", "count": 120 },
      { "stage": "EndStage", "count": 84 }
    ],
    "closeCasesByReason": [
      { "reason": "Improved", "count": 20 },
      { "reason": "Deceased", "count": 13 }
    ],
    "visitsByMonth": [
      { "month": "2026-08", "count": 45 },
      { "month": "2026-07", "count": 38 }
    ]
  }
}
```

---

### GET /admin/reports/export

**Purpose:** Export system report in PDF or Excel format

**Auth:** Admin

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| format | string | Required | Export format: 'pdf' or 'excel' |
| startDate | string | undefined | Start date for report (ISO date) |
| endDate | string | undefined | End date for report (ISO date) |

**Success Response (200):**

Returns a file blob.

**Response Headers:**

- **For PDF:** `Content-Type: application/pdf`, `Content-Disposition: attachment; filename=report.pdf`
- **For Excel:** `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename=report.xlsx`

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid format | "Invalid export format. Must be 'pdf' or 'excel'" |

---

## 3. Type Definitions

```typescript
// src/types/admin.types.ts

export interface PendingStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: string;
}

export interface ApproveStaffRequest {
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface ApprovedStaffResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Active';
  assignedBy: {
    id: string;
    name: string;
  };
  updatedAt: string;
}

export interface DashboardStats {
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
    date: string;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: string;
    staff: string;
  }>;
}

export interface Notification {
  id: string;
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: string;
    referralId?: string;
    patientId?: string;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: string;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: string;
}

export interface AdminPatient {
  id: string;
  patientDisplayId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  primaryDiagnosis: string;
  registeredAt: string;
  registeredBy: {
    id: string;
    name: string;
  };
}

// ============================================
// FULL ADMIN PATIENT DETAIL (NEW)
// ============================================

export interface AdminVisitFullDetail {
  id: string;
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
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
  nextVisitDate?: string;
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

export interface AdminMedicationFullDetail {
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
  createdAt: string;
}

export interface AdminLabFullDetail {
  id: string;
  testName: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  orderedBy: { id: string; name: string };
  visitId?: string;
  admissionId?: string;
  createdAt: string;
}

export interface AdminReferralFullDetail {
  id: string;
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
  status: string;
  actionTaken?: string;
  outcome?: string;
  followUpDate?: string;
  followUpStatus?: string;
  requestedBy: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: string;
}

export interface AdminAdmissionFullDetail {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
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
  createdAt: string;
}

export interface AdminPatientFullDetail extends AdminPatient {
  dateOfBirth: string;
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
  visits: AdminVisitFullDetail[];
  medications: AdminMedicationFullDetail[];
  labTests: AdminLabFullDetail[];
  referrals: AdminReferralFullDetail[];
  admissions: AdminAdmissionFullDetail[];
  progress: {
    data: Array<{ visitId: string; visitDate: string; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  createdAt: string;
}

// ============================================
// ADMIN VISIT UPDATE TYPES (NEW)
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
}

export interface VisitEditHistoryEntry {
  editedBy: { id: string; name: string };
  editedAt: string;
  changes: Array<{ field: string; from: any; to: any }>;
}

// ============================================
// ADMIN PRINT TYPES (NEW)
// ============================================

export interface AdminPrintData {
  patient: {
    id: string;
    patientDisplayId: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: string;
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
    createdAt: string;
  };
  progress: {
    data: Array<{ visitId: string; visitDate: string; kpsScore: number; ppsScore: number }>;
    trends: {
      kps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
      pps: { trend: string; percentageChange: number; firstScore: number; lastScore: number };
    };
  } | null;
  visits: AdminVisitFullDetail[];
  medications: AdminMedicationFullDetail[];
  labTests: AdminLabFullDetail[];
  referrals: AdminReferralFullDetail[];
  admissions: AdminAdmissionFullDetail[];
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ReportData {
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

export interface ExportReportRequest {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
}
```
