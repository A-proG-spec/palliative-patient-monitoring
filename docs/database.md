## `docs/database.md`

---

# Database Schema — Palliative Patient Monitoring System

## 1.0 Overview

### 1.1 Database Technology

| Property | Value |
|----------|-------|
| **Database** | MongoDB |
| **ODM** | Mongoose |
| **Version** | 6.0+ |
| **Hosting** | Production: MongoDB Atlas / Self-hosted |

### 1.2 Naming Conventions

| Convention | Rule |
|------------|------|
| **Collection Names** | Plural, PascalCase (e.g., `Patients`, `HomeVisits`) |
| **Field Names** | camelCase |
| **Primary Key** | `_id` (MongoDB ObjectId) |
| **Foreign Keys** | `{entity}Id` (e.g., `patientId`, `staffId`) |
| **Timestamps** | `createdAt`, `updatedAt` (ISO strings) |

---

## 2.0 Core Collections

### 2.1 Staff

**Collection:** `Staff`

**Description:** Healthcare staff members who provide palliative care services.

```typescript
{
  _id: ObjectId;
  name: string;                 // Full name
  email: string;                // Unique, indexed
  phone: string;
  password: string;             // Hashed with bcrypt
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  approvedBy?: ObjectId;        // Reference to Admin
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `email` (unique)
- `status`

---

### 2.2 Admin

**Collection:** `Admin`

**Description:** System administrators with full access.

```typescript
{
  _id: ObjectId;
  name: string;
  email: string;                // Unique, indexed
  password: string;             // Hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `email` (unique)

---

### 2.3 Patients

**Collection:** `Patients`

**Description:** Palliative care patients receiving services.

```typescript
{
  _id: ObjectId;
  patientDisplayId: string;     // PAT-001, PAT-002, etc. (unique)
  
  // Personal Information
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;          // YYYY-MM-DD
  address: string;
  phone: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Caregiver Information
  caregiverName: string;
  caregiverPhone: string;
  
  // Medical Information
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  
  // Status
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  
  // Meta
  registeredBy: ObjectId;       // Reference to Staff
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientDisplayId` (unique)
- `status`
- `currentLocation`
- `firstName`, `lastName` (text search)

---

### 2.4 HomeVisits

**Collection:** `HomeVisits`

**Description:** Recorded home visits with comprehensive clinical checklists.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  // ── Visit Details ──
  visitDate: string;            // YYYY-MM-DD
  timeStarted: string;          // HH:mm
  timeEnded: string;            // HH:mm
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: {
    role: 'TeamLeader' | 'Physician' | 'Nurse';
    name: string;
  }[];
  
  // ── General Condition ──
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  
  // ── Vital Signs ──
  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;                // e.g., "120/80"
    respiration?: number;
    spo2?: number;
  };
  
  // ── Pain Assessment ──
  painScore: number;            // 0-10
  painLocation: string[];       // Head, Neck, Chest, etc.
  painCharacteristics: string[]; // Sharp, Dull, Burning, etc.
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;
  
  // ── Symptoms ──
  symptoms: string[];           // Dyspnea, Nausea, Constipation, etc.
  symptomsOther?: string;
  
  // ── Functional Status ──
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;             // 0-100
  kpsScore: number;             // 0-100
  
  // ── Nutrition ──
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;
  
  // ── Psychosocial ──
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;
  
  // ── Spiritual ──
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;
  
  // ── Medication Review ──
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }[];
  medicationIssues?: string;
  
  // ── Caregiver Assessment ──
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  
  // ── Education ──
  educationProvided: string[];
  educationProvidedOther?: string;
  trainingNeeds: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;
  
  // ── Home Environment ──
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: string[];   // AdequateLighting, Ventilation, etc.
  homeEnvironmentDetails?: string;
  
  // ── Nursing Care ──
  nursingCareGiven: string[];
  nursingCareOther?: string;
  
  // ── Red Flags ──
  redFlags: string[];
  redFlagActions?: string;
  
  // ── Referrals ──
  referralsMade: string[];
  
  // ── Issues and Plan ──
  keyIssues?: string;
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: string;       // YYYY-MM-DD
  
  // ── Outcome ──
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  dateOfDeath?: string;         // YYYY-MM-DD
  
  // ── Signatures ──
  teamLeaderId: string;
  physicianId: string;
  nurseId: string;
  
  // ── Meta ──
  createdBy: ObjectId;          // Reference to Staff
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `visitDate`
- `outcome`
- `teamLeaderId`, `physicianId`, `nurseId`

---

### 2.5 Medications

**Collection:** `Medications`

**Description:** Medication orders for patients.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  
  prescribedBy: ObjectId;       // Reference to Staff
  visitId?: ObjectId;           // Reference to HomeVisit (if ordered during visit)
  admissionId?: ObjectId;       // Reference to HospitalAdmission (if ordered during admission)
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `status`
- `prescribedBy`

---

### 2.6 LaboratoryTests

**Collection:** `LaboratoryTests`

**Description:** Laboratory test orders and results.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  testName: string;
  testCategory?: 'Hematology' | 'Chemistry' | 'Hormone' | 'Urinalysis' | 'Stool' | 'Microbiology' | 'Histopathology' | 'Immunology' | 'Cardiac';
  specimenType?: string;
  specimenSite?: string;
  clinicalHistory?: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  
  orderedBy: ObjectId;          // Reference to Staff
  dateOrdered: string;          // YYYY-MM-DD
  
  // Result fields
  datePerformed?: string;       // YYYY-MM-DD
  result?: string;
  performedBy?: string;
  notes?: string;
  
  visitId?: ObjectId;           // Reference to HomeVisit
  admissionId?: ObjectId;       // Reference to HospitalAdmission
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `status`
- `orderedBy`

---

### 2.7 ImagingOrders

**Collection:** `ImagingOrders`

**Description:** Imaging examination orders and reports.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  // ── Clinical Information ──
  clinicalDiagnosis?: string;
  presentingSymptoms?: string;
  relevantHistory?: string;
  previousImaging: 'None' | 'Yes';
  previousImagingDetails?: string;
  clinicalQuestion?: string;
  
  // ── Imaging Request ──
  modality: 'XRay' | 'Ultrasound' | 'CT' | 'MRI' | 'Mammography' | 'Fluoroscopy' | 'Interventional' | 'NuclearMedicine' | 'Other';
  bodyRegion: string;
  specificSite?: string;
  laterality: 'Right' | 'Left' | 'Bilateral' | 'NotApplicable';
  protocol?: string;
  contrast: 'No' | 'Yes' | 'ToBeDetermined';
  
  // ── Contrast Info ──
  previousContrastReaction?: 'No' | 'Yes';
  previousContrastReactionDetails?: string;
  allergies?: string;
  creatinine?: string;
  egfr?: string;
  otherRelevantMedication?: string;
  
  // ── Safety Screening ──
  pregnancyStatus: 'NotPregnant' | 'Pregnant' | 'PossiblyPregnant' | 'NotApplicable';
  implantedDevice: boolean;
  deviceDetails?: string;
  metallicForeignBody: 'No' | 'Yes' | 'Unknown';
  otherSafetyConsiderations?: string;
  
  // ── Preparation ──
  preparation: string[];        // None, Fasting, FullBladder, etc.
  preparationInstructions?: string;
  
  // ── Priority ──
  priority: 'Routine' | 'Urgent' | 'Emergency';
  reasonForUrgency?: string;
  
  // ── Clinician ──
  clinicianName: string;
  clinicianDepartment?: string;
  clinicianLicenseNo?: string;
  clinicianContact?: string;
  
  // ── Status ──
  status: 'Ordered' | 'Completed';
  orderedBy: ObjectId;          // Reference to Staff
  dateOrdered: string;          // YYYY-MM-DD
  
  // ── Imaging Department ──
  examinationPerformed?: string;
  modalityPerformed?: string;
  technologist?: string;
  radiologist?: string;
  datePerformed?: string;
  imageQuality?: 'Diagnostic' | 'Limited' | 'NonDiagnostic' | 'RepeatRequired';
  
  // ── Report ──
  findings?: string;
  impression?: string;
  recommendations?: string;
  reportNumber?: string;
  reportingPhysician?: string;
  reportDate?: string;
  reportNotes?: string;
  
  visitId?: ObjectId;           // Reference to HomeVisit
  admissionId?: ObjectId;       // Reference to HospitalAdmission
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `status`
- `modality`
- `orderedBy`

---

### 2.8 Referrals

**Collection:** `Referrals`

**Description:** Patient referral requests between facilities.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;         // YYYY-MM-DD
  
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;             // 0-100
  kpsScore: number;             // 0-100
  
  currentSymptoms: {
    pain: number;               // 0-10
    dyspnea: number;            // 0-10
    fatigue: number;            // 0-10
    anxiety: number;            // 0-10
    depression: number;         // 0-10
  };
  
  reasons: string[];            // PainManagement, SymptomControl, etc.
  otherReason?: string;
  
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  actionTaken?: 'ReferralAccepted' | 'AppointmentScheduled' | 'AdditionalInfoRequested' | 'ReferralDeclined' | 'PatientAdmitted' | 'PatientTransferred';
  outcome?: string;
  
  followUpDate?: string;        // YYYY-MM-DD
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact';
  
  requestedBy: ObjectId;        // Reference to Staff
  approvedBy?: ObjectId;        // Reference to Admin
  
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `status`
- `requestedBy`

---

### 2.9 HospitalAdmissions

**Collection:** `HospitalAdmissions`

**Description:** Patient hospital admissions.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  referralId: ObjectId;         // Reference to Referral (accepted)
  
  admissionDate: string;        // YYYY-MM-DD
  dischargeDate?: string;       // YYYY-MM-DD
  
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  
  ppsScore: number;             // 0-100
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  
  painScore: number;            // 0-10
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent: string[];    // Dyspnea, Nausea, Fatigue, etc.
  
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
  
  createdBy: ObjectId;          // Reference to Staff
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `referralId`
- `status`

---

### 2.10 ProgressNotes

**Collection:** `ProgressNotes`

**Description:** Patient progress notes (clinical documentation).

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  // ── Header ──
  hospitalName: string;
  palliativeCareUnit: string;
  patientName: string;
  patientMRN: string;
  date: string;                 // YYYY-MM-DD
  time: string;                 // HH:mm
  dayOfAdmission: string;
  attendingClinician: string;
  
  // ── 1. Current Clinical Status ──
  generalCondition: 'Stable' | 'Improving' | 'Deteriorating' | 'Critical' | 'ActivelyDying';
  levelOfConsciousness: 'Alert' | 'Drowsy' | 'Confused' | 'Delirious' | 'Unresponsive';
  orientation: 'Oriented' | 'PartiallyOriented' | 'Disoriented' | 'UnableToAssess';
  functionalStatus: 'Independent' | 'RequiresAssistance' | 'Bedbound' | 'FullyDependent';
  changesSincePreviousReview: string;
  
  // ── 2. Vital Signs ──
  vitals: {
    temperature: { current: string; previous: string };
    pulse: { current: string; previous: string };
    respiratoryRate: { current: string; previous: string };
    bloodPressure: { current: string; previous: string };
    spo2: { current: string; previous: string };
    oxygenFlow: { current: string; previous: string };
  };
  otherRelevantObservations: string;
  
  // ── 3. Symptom Assessment ──
  symptoms: {
    [symptom: string]: {
      severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
      notes: string;
    };
  };
  painScore: string;
  painLocation: string;
  painCharacter: string;
  currentPainManagement: string;
  responseToTreatment: 'Good' | 'Partial' | 'Poor' | 'NotApplicable';
  breakthroughPainEpisodes: 'Yes' | 'No';
  breakthroughPainFrequency: string;
  
  // ── 4. Respiratory Status ──
  breathing: 'Comfortable' | 'MildDistress' | 'ModerateDistress' | 'SevereDistress';
  oxygenTherapy: 'Yes' | 'No';
  oxygenDelivery: 'NasalCannula' | 'Mask' | 'Other';
  oxygenDeliveryOther?: string;
  respiratorySecretions: 'None' | 'Mild' | 'Moderate' | 'Excessive';
  cough: 'Yes' | 'No';
  otherRespiratoryFindings: string;
  
  // ── 5. Nutrition and Hydration ──
  oralIntake: 'Good' | 'Reduced' | 'Minimal' | 'None';
  diet: string;
  fluidIntake: string;
  feedingAssistance: 'Yes' | 'No';
  enteralFeeding: 'Yes' | 'No';
  ivFluids: 'Yes' | 'No';
  nauseaVomitingAffectingIntake: 'Yes' | 'No';
  nutritionHydrationConcerns: string;
  
  // ── 6. Elimination ──
  urineOutput: 'Normal' | 'Reduced' | 'Minimal' | 'UnableToAssess';
  urinaryCatheter: 'Yes' | 'No';
  bowelMovement: 'Normal' | 'Constipated' | 'Diarrhea' | 'NoRecentBM';
  lastBowelMovement: string;
  otherEliminationConcerns: string;
  
  // ── 7. Skin and Wound ──
  skin: 'Intact' | 'Dry' | 'Fragile' | 'Edematous' | 'Other';
  skinOther?: string;
  pressureInjury: 'Yes' | 'No';
  pressureInjuryLocationStage: string;
  woundCareProvided: 'Yes' | 'No';
  woundChanges: string;
  
  // ── 8. Psychological ──
  moodBehavior: ('Calm' | 'Anxious' | 'Fearful' | 'Sad' | 'Depressed' | 'Agitated' | 'Withdrawn')[];
  psychologicalDistress: 'None' | 'Mild' | 'Moderate' | 'Severe';
  patientMainConcerns: string;
  counselingProvided: 'Yes' | 'No';
  
  // ── 9. Spiritual ──
  spiritualDistress: 'Yes' | 'No';
  spiritualCulturalConcerns: string;
  spiritualCareProvided: 'Yes' | 'No';
  spiritualReferralRequired: 'Yes' | 'No';
  spiritualNotes: string;
  
  // ── 10. Family/Caregiver ──
  familyCaregiverPresent: 'Yes' | 'No';
  familyCaregiverConcerns: string;
  educationSupportProvided: string;
  familyMeetingHeld: 'Yes' | 'No';
  familyMeetingParticipants: string;
  
  // ── 11. Goals of Care ──
  currentGoalsOfCare: string[];
  currentGoalsOfCareOther?: string;
  goalsReviewedToday: 'Yes' | 'No';
  changeInGoals: 'Yes' | 'No';
  patientDecisionMakerPreferences: string;
  codeStatus: 'FullResuscitation' | 'DNAR/DNR' | 'Other';
  codeStatusOther?: string;
  advanceCarePlanReviewed: 'Yes' | 'No';
  
  // ── 12. Medication Review ──
  medicationRegimenReviewed: 'Yes' | 'No';
  medicationChangesMade: 'Yes' | 'No';
  prnMedicationUsed: 'Yes' | 'No';
  prnEffectiveness: 'Effective' | 'PartiallyEffective' | 'Ineffective';
  medicationSideEffects: 'None' | 'Yes';
  medicationSideEffectsDetail: string;
  medications: {
    medicationTreatment: string;
    dose: string;
    route: string;
    frequency: string;
    reasonResponse: string;
  }[];
  
  // ── 13. Nursing Care ──
  nursingCareProvided: string[];
  nursingCareOther?: string;
  responseToSupportiveCare: string;
  
  // ── 14. Investigations ──
  investigationsPerformed: string[];
  investigationsOther?: string;
  significantResults: string;
  clinicalSignificanceAction: string;
  
  // ── 15. MDT Review ──
  mdtReview: {
    discipline: string;
    reviewIntervention: string;
    followUpRequired: 'Yes' | 'No';
  }[];
  
  // ── 16. Clinical Assessment ──
  overallAssessment: string;
  problemsIdentifiedToday: string;
  
  // ── 17. Plan ──
  symptomManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  investigationsMonitoring: string;
  familyCaregiverPlan: string;
  referralsConsultations: string;
  dischargeTransferHospicePlanning: string;
  
  // ── 18. SOAP ──
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;
  
  // ── 19. Additional Notes ──
  additionalNotes: {
    id: string;
    date: string;
    time: string;
    note: string;
    clinicianName: string;
    signature: string;
  }[];
  
  // ── 20. Authorization ──
  responsibleClinician: string;
  responsibleClinicianSignature: string;
  responsibleClinicianDateTime: string;
  palliativeCareNurse: string;
  palliativeCareNurseSignature: string;
  palliativeCareNurseDateTime: string;
  reviewedBy: string;
  reviewedBySignature: string;
  reviewedByDateTime: string;
  facilityStamp: string;
  
  // ── Meta ──
  createdBy: ObjectId;          // Reference to Staff
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `date`
- `attendingClinician`

---

### 2.11 DischargeSummaries

**Collection:** `DischargeSummaries`

**Description:** Patient discharge summaries.

```typescript
{
  _id: ObjectId;
  patientId: ObjectId;          // Reference to Patient
  
  // ── Header ──
  hospitalName: string;
  palliativeCareUnit: string;
  dateOfAdmission: string;      // YYYY-MM-DD
  dateOfDischarge: string;      // YYYY-MM-DD
  timeOfDischarge: string;      // HH:mm
  dischargeType: string;
  dischargeTypeOther?: string;
  
  // ── A. Patient Identification ──
  fullName: string;
  dateOfBirth: string;          // YYYY-MM-DD
  age: string;
  sex: string;
  address: string;
  telephone: string;
  primaryCaregiver: string;
  caregiverRelationship: string;
  caregiverTelephone: string;
  
  // ── B. Admission Information ──
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  reasonForAdmission: string;
  referringPhysicianFacility: string;
  
  // ── C. Discharge Diagnosis ──
  finalDischargeDiagnosis: string;
  clinicalProblemsManaged: string[];
  summaryOfClinicalCourse: string;
  importantInvestigations: string;
  
  // ── D. Condition at Discharge ──
  overallCondition: string;
  levelOfConsciousness: string;
  functionalStatus: string;
  mobility: string;
  oralIntake: string;
  
  // ── E. Vital Signs ──
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressure: string;
  oxygenSaturation: string;
  oxygenRequirement: string;
  
  // ── F. Symptom Status ──
  symptoms: {
    [symptom: string]: {
      severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
      notes: string;
    };
  };
  painScore: string;
  painControl: string;
  
  // ── G. Medications ──
  dischargeMedications: {
    medication: string;
    dose: string;
    route: string;
    frequency: string;
    purpose: string;
    instructions: string;
  }[];
  prnMedications: string;
  medicationChanges: string;
  medicationReconciliation: string;
  
  // ── H. Symptom Management ──
  painManagementInstructions: string;
  breathlessnessManagement: string;
  nauseaVomitingManagement: string;
  constipationManagement: string;
  anxietyDeliriumManagement: string;
  otherSymptomManagement: string;
  
  // ── I. Nutrition ──
  diet: string;
  feedingAssistance: string;
  enteralFeeding: string;
  feedingTube: string;
  feedingTubeOther?: string;
  hydrationInstructions: string;
  nutritionFollowUp: string;
  
  // ── J. Wound/Skin ──
  woundPresent: string;
  woundLocation: string;
  woundCareInstructions: string;
  dressingChanges: string;
  pressureInjuryPrevention: string;
  
  // ── K. Equipment ──
  oxygenRequired: string;
  oxygenDeliveryMethod: string;
  oxygenDeliveryOther?: string;
  oxygenFlowRate: string;
  equipmentRequired: string[];
  equipmentOther?: string;
  equipmentArranged: string;
  
  // ── L. Goals of Care ──
  goalsOfCare: string[];
  goalsOfCareOther?: string;
  goalsOfCareReviewed: string;
  patientDecisionMakerPreferences: string;
  codeStatus: string;
  codeStatusOther?: string;
  advanceCarePlan: string;
  
  // ── M. Destination ──
  dischargedTo: string;
  dischargedToOther?: string;
  destinationAddress: string;
  transport: string;
  transportOther?: string;
  escortCaregiver: string;
  
  // ── N. Home/Hospice ──
  homePalliativeCareRequired: string;
  hospiceReferral: string;
  communityNursingRequired: string;
  homeVisitsRequired: string;
  caregiverSupportRequired: string;
  servicesArranged: string;
  responsibleProvider: string;
  responsibleProviderPhone: string;
  
  // ── O. Education ──
  educationTopics: string[];
  educationOther?: string;
  patientUnderstanding: string;
  additionalEducationRequired: string;
  
  // ── P. Warning Signs ──
  warningSigns: string[];
  warningSignsOther?: string;
  warningSignsSpecificInstructions: string;
  
  // ── Q. Follow-Up ──
  palliativeCareFollowUp: string;
  palliativeCareFollowUpDate: string;
  palliativeCareFollowUpTime: string;
  physicianSpecialistFollowUp: string;
  primaryCareFollowUp: string;
  hospiceHomeCareFollowUp: string;
  otherAppointments: string;
  
  // ── R. Contacts ──
  palliativeCareUnitContact: string;
  palliativeCareUnitPhone: string;
  attendingClinician: string;
  attendingClinicianPhone: string;
  emergencyContactInfo: string;
  homeHospiceService: string;
  homeHospiceServicePhone: string;
  
  // ── S. Notes ──
  dischargeNotes: string;
  
  // ── Meta ──
  submittedBy: string;
  submittedAt: string;
  createdBy: ObjectId;          // Reference to Staff/Admin
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `patientId`
- `dateOfDischarge`

---

### 2.12 Notifications

**Collection:** `Notifications`

**Description:** System notifications for admin and staff.

```typescript
{
  _id: ObjectId;
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
  userId: ObjectId;             // Reference to Admin or Staff
  createdAt: Date;
}
```

**Indexes:**
- `userId`
- `read`
- `createdAt`

---

### 2.13 Signatures

**Collection:** `Signatures`

**Description:** Digital signatures for visit records.

```typescript
{
  _id: ObjectId;
  visitId: ObjectId;            // Reference to HomeVisit
  staffId: ObjectId;            // Reference to Staff
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: Date;
  autoSigned: boolean;          // Team Leader only
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

**Indexes:**
- `visitId`
- `staffId`

---

## 3.0 Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin                                   │
│  (System administrators with full access)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ approves
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Staff                                   │
│  (Team Leader, Physician, Nurse)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ registers
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Patient                                  │
│  (Palliative care patient)                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  HomeVisit    │    │  Medication   │    │LaboratoryTest │
│  (Visit record│    │  (Med orders) │    │  (Lab orders) │
│   with        │    │               │    │               │
│   signatures) │    └───────────────┘    └───────────────┘
└───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Signature    │    │               │    │  ImagingOrder │
│  (Digital     │    │               │    │  (Imaging     │
│   signatures) │    │               │    │   orders)     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Referral     │    │   Admission   │    │ProgressNote   │
│  (Referral    │    │  (Hospital    │    │  (Clinical    │
│   requests)   │    │   admission)  │    │   notes)      │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│DischargeSumm  │    │ Notification  │    │               │
│  (Discharge   │    │  (System      │    │               │
│   summaries)  │    │   alerts)     │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 4.0 Collection Sizes & Growth Projections

| Collection | Estimated Size (per 100 patients) | Growth Rate |
|------------|----------------------------------|-------------|
| Patients | 100 documents | +1 per week |
| Staff | 10-20 documents | +1 per month |
| Admin | 1-3 documents | Rare |
| HomeVisits | 500-1,000 documents | +5-10 per week |
| Medications | 300-500 documents | +3-5 per week |
| LaboratoryTests | 200-400 documents | +2-4 per week |
| ImagingOrders | 100-200 documents | +1-2 per week |
| Referrals | 100-200 documents | +1-2 per week |
| HospitalAdmissions | 100-200 documents | +1-2 per week |
| ProgressNotes | 500-1,000 documents | +5-10 per week |
| DischargeSummaries | 50-100 documents | +1 per week |
| Notifications | 500+ documents | +10 per week |
| Signatures | 1,500-3,000 documents | +15-30 per week |

---

## 5.0 Validation Rules

### 5.1 Patient Validation

```typescript
// patientDisplayId: Must be unique, format PAT-XXX
// age: Must be > 0 and < 150
// phone: Must be valid phone number format
// dateOfBirth: Must be in the past
// status: Must be 'Active' or 'Discharged'
// currentLocation: Must be 'Home' or 'ReferredHospital'
// diseaseStage: Must be 'Early', 'Advanced', or 'EndStage'
// estimatedPrognosis: Must be 'Days', 'Weeks', 'Months', or 'Uncertain'
```

### 5.2 Visit Validation

```typescript
// visitDate: Must be valid date (YYYY-MM-DD)
// timeStarted: Must be valid time (HH:mm)
// timeEnded: Must be valid time (HH:mm), after timeStarted
// painScore: 0-10
// ppsScore: 0-100
// kpsScore: 0-100
// outcome: Must be one of enum values
```

### 5.3 Medication Validation

```typescript
// name: Required, non-empty
// dosage: Required, non-empty
// frequency: Required, non-empty
// route: Required, non-empty
// status: 'Ordered' or 'Given'
```

### 5.4 Referral Validation

```typescript
// ppsScore: 0-100
// kpsScore: 0-100
// currentSymptoms: Each symptom score 0-10
// status: Pending, Accepted, Declined, Admitted, InfoRequested
```

---
