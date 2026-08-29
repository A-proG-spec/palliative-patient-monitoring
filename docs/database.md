# database.md

```markdown
# PALLIATIVE PATIENT MONITORING SYSTEM - DATABASE & DATA MODEL

## 1. Entity List

| Entity | Collection Name | Purpose |
|---|---|---|
| Admin | admins | System administrator with elevated permissions |
| Staff | staff | Healthcare workers (Team Leaders, Physicians, Nurses) |
| Patient | patients | Person receiving palliative care |
| HomeVisit | homevisits | Record of each home visit |
| Medication | medications | Medications ordered for patients |
| LaboratoryTest | labtests | Lab tests ordered for patients |
| Referral | referrals | Patient referral requests |
| HospitalAdmission | hospitaladmissions | Hospital admission records |
| Notification | notifications | Admin dashboard notifications |
| Counter | counters | Auto-increment counter for patient display IDs |

## 2. Mongoose Schema Definitions

### Admin Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
```

---

### Staff Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | null;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpires: Date | null;
  assignedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['TeamLeader', 'Physician', 'Nurse'], 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Rejected'], 
    default: 'Pending' 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String, 
    default: null 
  },
  emailVerificationTokenExpires: { 
    type: Date, 
    default: null 
  },
  assignedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
```

---

### Patient Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientDisplayId?: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: Date;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  registeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PatientSchema = new Schema<IPatient>({
  patientDisplayId: { 
    type: String 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  age: { 
    type: Number, 
    required: true 
  },
  sex: { 
    type: String, 
    enum: ['Male', 'Female'], 
    required: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  emergencyContactName: { 
    type: String, 
    required: true 
  },
  emergencyContactPhone: { 
    type: String, 
    required: true 
  },
  caregiverName: { 
    type: String, 
    required: true 
  },
  caregiverPhone: { 
    type: String, 
    required: true 
  },
  primaryDiagnosis: { 
    type: String, 
    required: true 
  },
  secondaryDiagnoses: { 
    type: [String] 
  },
  diseaseStage: { 
    type: String, 
    enum: ['Early', 'Advanced', 'EndStage'], 
    required: true 
  },
  comorbidities: { 
    type: [String] 
  },
  estimatedPrognosis: { 
    type: String, 
    enum: ['Days', 'Weeks', 'Months', 'Uncertain'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Discharged'], 
    default: 'Active' 
  },
  currentLocation: { 
    type: String, 
    enum: ['Home', 'ReferredHospital'], 
    default: 'Home' 
  },
  registeredBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
```

---

### Counter Schema (for Patient Display ID Generation)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  value: number;
}

const CounterSchema = new Schema<ICounter>({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: { 
    type: Number, 
    default: 0 
  }
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
```

---

### HomeVisit Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeVisit extends Document {
  patientId: mongoose.Types.ObjectId;
  visitDate: Date;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{ staffId: mongoose.Types.ObjectId; role: 'TeamLeader' | 'Physician' | 'Nurse'; name: string }>;
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
  painLocation: Array<'Head' | 'Neck' | 'Chest' | 'Abdomen' | 'Back' | 'Limbs' | 'Generalized' | 'Other'>;
  painCharacteristics: Array<'Sharp' | 'Dull' | 'Burning' | 'Cramping' | 'Intermittent' | 'Continuous'>;
  painMedicationEffective: boolean;
  symptoms: Array<'Dyspnea' | 'Nausea' | 'Constipation' | 'Anxiety' | 'Fatigue' | 'PoorAppetite' | 'PressureSores' | 'Other'>;
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
  educationProvided: Array<'MedicationAdministration' | 'PainManagement' | 'NutritionSupport' | 'SkinCare' | 'PressureSorePrevention' | 'EndOfLifeCare' | 'EmergencySigns' | 'EmotionalSupport' | 'Other'>;
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: Array<'AdequateLighting' | 'Ventilation' | 'SafeBed' | 'CleanWater' | 'SanitationIssues'>;
  nursingCareGiven: Array<'Hygiene' | 'WoundCare' | 'MedicationAdmin' | 'PositionChange' | 'FeedingAssistance' | 'Counseling' | 'Other'>;
  redFlags: Array<'SevereUncontrolledPain' | 'SevereShortnessOfBreath' | 'MassiveBleeding' | 'UncontrolledSeizures' | 'AlteredMentalStatus' | 'SevereDehydration' | 'None'>;
  redFlagActions?: string;
  referralsMade: Array<'PhysicianReview' | 'HospitalAdmission' | 'SocialWorker' | 'Psychologist' | 'SpiritualCare' | 'NutritionSupport'>;
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: Date;
  teamLeaderId: mongoose.Types.ObjectId;
  physicianId: mongoose.Types.ObjectId;
  nurseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const HomeVisitSchema = new Schema<IHomeVisit>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  visitDate: { 
    type: Date, 
    required: true 
  },
  timeStarted: { 
    type: String, 
    required: true 
  },
  timeEnded: { 
    type: String, 
    required: true 
  },
  visitType: { 
    type: String, 
    enum: ['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement'],
    required: true 
  },
  teamMembers: [{
    staffId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Staff' 
    },
    role: { 
      type: String, 
      enum: ['TeamLeader', 'Physician', 'Nurse'] 
    },
    name: { 
      type: String 
    }
  }],
  overallStatus: { 
    type: String, 
    enum: ['Stable', 'Deteriorating', 'Critical', 'BedBound'],
    required: true 
  },
  mobility: { 
    type: String, 
    enum: ['Ambulatory', 'RequiresAssistance', 'Bedridden'],
    required: true 
  },
  vitals: {
    temperature: Number,
    pulse: Number,
    bp: String,
    respiration: Number,
    spo2: Number
  },
  painScore: { 
    type: Number, 
    min: 0, 
    max: 10, 
    required: true 
  },
  painLocation: [{ 
    type: String, 
    enum: ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other'] 
  }],
  painCharacteristics: [{ 
    type: String, 
    enum: ['Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous'] 
  }],
  painMedicationEffective: { 
    type: Boolean, 
    required: true 
  },
  symptoms: [{ 
    type: String, 
    enum: ['Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other'] 
  }],
  adl: {
    feeding: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    bathing: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    dressing: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    toileting: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    mobility: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    }
  },
  ppsScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true 
  },
  kpsScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true 
  },
  appetite: { 
    type: String, 
    enum: ['Good', 'Fair', 'Poor', 'UnableToEat'],
    required: true 
  },
  oralIntake: { 
    type: String, 
    enum: ['Adequate', 'Reduced', 'Minimal'],
    required: true 
  },
  hydrationStatus: { 
    type: String, 
    enum: ['Adequate', 'MildDehydration', 'SevereDehydration'],
    required: true 
  },
  emotionalStatus: { 
    type: String, 
    enum: ['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed'],
    required: true 
  },
  familySupport: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Limited', 'None'],
    required: true 
  },
  financialDifficulty: { 
    type: Boolean, 
    required: true 
  },
  spiritualNeeds: { 
    type: Boolean, 
    required: true 
  },
  religiousSupportRequested: { 
    type: Boolean, 
    required: true 
  },
  medicationAvailable: { 
    type: Boolean, 
    required: true 
  },
  medicationCorrectlyTaken: { 
    type: Boolean, 
    required: true 
  },
  medicationSideEffects: { 
    type: Boolean, 
    required: true 
  },
  medicationRefillNeeded: { 
    type: Boolean, 
    required: true 
  },
  morphineAvailable: { 
    type: Boolean, 
    required: true 
  },
  adherenceLevel: { 
    type: String, 
    enum: ['Good', 'Partial', 'Poor'],
    required: true 
  },
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    route: String
  }],
  caregiverBurden: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High'],
    required: true 
  },
  caregiverUnderstanding: { 
    type: String, 
    enum: ['Good', 'Fair', 'Poor'],
    required: true 
  },
  caregivingCapacity: { 
    type: String, 
    enum: ['Strong', 'Moderate', 'Weak'],
    required: true 
  },
  familyEmotionalStatus: { 
    type: String, 
    enum: ['Stable', 'Stressed', 'Overwhelmed'],
    required: true 
  },
  educationProvided: [{ 
    type: String, 
    enum: ['MedicationAdministration', 'PainManagement', 'NutritionSupport', 'SkinCare', 'PressureSorePrevention', 'EndOfLifeCare', 'EmergencySigns', 'EmotionalSupport', 'Other'] 
  }],
  homeCondition: { 
    type: String, 
    enum: ['Clean', 'Fair', 'Poor'],
    required: true 
  },
  homeObservations: [{ 
    type: String, 
    enum: ['AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues'] 
  }],
  nursingCareGiven: [{ 
    type: String, 
    enum: ['Hygiene', 'WoundCare', 'MedicationAdmin', 'PositionChange', 'FeedingAssistance', 'Counseling', 'Other'] 
  }],
  redFlags: [{ 
    type: String, 
    enum: ['SevereUncontrolledPain', 'SevereShortnessOfBreath', 'MassiveBleeding', 'UncontrolledSeizures', 'AlteredMentalStatus', 'SevereDehydration', 'None'] 
  }],
  redFlagActions: String,
  referralsMade: [{ 
    type: String, 
    enum: ['PhysicianReview', 'HospitalAdmission', 'SocialWorker', 'Psychologist', 'SpiritualCare', 'NutritionSupport'] 
  }],
  outcome: { 
    type: String, 
    enum: ['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased'],
    required: true 
  },
  nextVisitDate: Date,
  teamLeaderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  physicianId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  nurseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const HomeVisit = mongoose.model<IHomeVisit>('HomeVisit', HomeVisitSchema);
```

---

### Medication Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  patientId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: mongoose.Types.ObjectId;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  visitId?: mongoose.Types.ObjectId;
  admissionId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  dosage: { 
    type: String, 
    required: true 
  },
  frequency: { 
    type: String, 
    required: true 
  },
  route: { 
    type: String, 
    required: true 
  },
  prescribedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  administeredAt: { 
    type: String, 
    enum: ['Home', 'Hospital'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Ordered', 'Given'],
    default: 'Ordered' 
  },
  visitId: { 
    type: Schema.Types.ObjectId, 
    ref: 'HomeVisit' 
  },
  admissionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'HospitalAdmission' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
```

---

### LaboratoryTest Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryTest extends Document {
  patientId: mongoose.Types.ObjectId;
  testName: string;
  orderedBy: mongoose.Types.ObjectId;
  dateOrdered: Date;
  datePerformed?: Date;
  result?: string;
  location: 'Home' | 'Hospital';
  visitId?: mongoose.Types.ObjectId;
  admissionId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LaboratoryTestSchema = new Schema<ILaboratoryTest>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  testName: { 
    type: String, 
    required: true 
  },
  orderedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  dateOrdered: { 
    type: Date, 
    required: true 
  },
  datePerformed: Date,
  result: String,
  location: { 
    type: String, 
    enum: ['Home', 'Hospital'],
    required: true 
  },
  visitId: { 
    type: Schema.Types.ObjectId, 
    ref: 'HomeVisit' 
  },
  admissionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'HospitalAdmission' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const LaboratoryTest = mongoose.model<ILaboratoryTest>('LaboratoryTest', LaboratoryTestSchema);
```

---

### Referral Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  patientId: mongoose.Types.ObjectId;
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
  reasons: Array<'PainManagement' | 'SymptomControl' | 'EndOfLifeCare' | 'HomeHospiceCare' | 'InpatientAdmission' | 'PsychologicalSupport' | 'SpiritualCare' | 'CaregiverSupport' | 'BereavementServices' | 'EmergencyCare' | 'DiagnosticEvaluation' | 'Other'>;
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  actionTaken: 'ReferralAccepted' | 'AppointmentScheduled' | 'AdditionalInfoRequested' | 'ReferralDeclined' | 'PatientAdmitted' | 'PatientTransferred' | null;
  outcome: string;
  followUpDate?: Date;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  referralType: { 
    type: String, 
    enum: ['Incoming', 'Outgoing'],
    required: true 
  },
  referralDate: { 
    type: Date, 
    required: true 
  },
  primaryDiagnosis: { 
    type: String, 
    required: true 
  },
  diseaseStage: { 
    type: String, 
    enum: ['Early', 'Advanced', 'EndStage'],
    required: true 
  },
  ppsScore: { 
    type: Number, 
    min: 0,
    max: 100,
    required: true 
  },
  kpsScore: { 
    type: Number, 
    min: 0,
    max: 100,
    required: true 
  },
  currentSymptoms: {
    pain: { 
      type: Number, 
      min: 0, 
      max: 10 
    },
    dyspnea: { 
      type: Number, 
      min: 0, 
      max: 10 
    },
    fatigue: { 
      type: Number, 
      min: 0, 
      max: 10 
    },
    anxiety: { 
      type: Number, 
      min: 0, 
      max: 10 
    },
    depression: { 
      type: Number, 
      min: 0, 
      max: 10 
    }
  },
  reasons: [{ 
    type: String, 
    enum: ['PainManagement', 'SymptomControl', 'EndOfLifeCare', 'HomeHospiceCare', 'InpatientAdmission', 'PsychologicalSupport', 'SpiritualCare', 'CaregiverSupport', 'BereavementServices', 'EmergencyCare', 'DiagnosticEvaluation', 'Other'] 
  }],
  otherReason: String,
  referringFacility: { 
    type: String, 
    required: true 
  },
  receivingFacility: { 
    type: String, 
    required: true 
  },
  contactPerson: { 
    type: String, 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested'],
    default: 'Pending' 
  },
  actionTaken: { 
    type: String, 
    enum: ['ReferralAccepted', 'AppointmentScheduled', 'AdditionalInfoRequested', 'ReferralDeclined', 'PatientAdmitted', 'PatientTransferred'],
    default: null 
  },
  outcome: { 
    type: String,
    default: ''
  },
  followUpDate: Date,
  followUpStatus: { 
    type: String, 
    enum: ['Completed', 'Pending', 'UnableToContact'] 
  },
  requestedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  preparedBy: { 
    type: String, 
    required: true 
  },
  preparedByDesignation: { 
    type: String, 
    required: true 
  },
  signature: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
```

---

### HospitalAdmission Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IHospitalAdmission extends Document {
  patientId: mongoose.Types.ObjectId;
  referralId: mongoose.Types.ObjectId;
  admissionDate: Date;
  dischargeDate?: Date;
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
  symptomsPresent: Array<'Dyspnea' | 'Nausea' | 'Fatigue' | 'Anxiety' | 'Depression' | 'Insomnia' | 'Other'>;
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
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalAdmissionSchema = new Schema<IHospitalAdmission>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  referralId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Referral', 
    required: true 
  },
  admissionDate: { 
    type: Date, 
    required: true 
  },
  dischargeDate: Date,
  bedNumber: { 
    type: String, 
    required: true 
  },
  ward: { 
    type: String, 
    required: true 
  },
  admittingPhysician: { 
    type: String, 
    required: true 
  },
  careTeam: { 
    type: String, 
    required: true 
  },
  primaryDiagnosis: { 
    type: String, 
    required: true 
  },
  secondaryDiagnoses: [String],
  diseaseStage: { 
    type: String, 
    enum: ['Early', 'Advanced', 'Terminal'],
    required: true 
  },
  comorbidities: [String],
  estimatedPrognosis: { 
    type: String, 
    enum: ['Days', 'Weeks', 'Months', 'Uncertain'],
    required: true 
  },
  ppsScore: { 
    type: Number, 
    min: 0,
    max: 100,
    required: true 
  },
  functionalStatus: { 
    type: String, 
    enum: ['FullyIndependent', 'PartiallyDependent', 'FullyDependent'],
    required: true 
  },
  painScore: { 
    type: Number, 
    min: 0, 
    max: 10, 
    required: true 
  },
  painType: { 
    type: String, 
    enum: ['Acute', 'Chronic', 'Neuropathic', 'Mixed'],
    required: true 
  },
  symptomsPresent: [{ 
    type: String, 
    enum: ['Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other'] 
  }],
  emotionalStatus: { 
    type: String, 
    enum: ['Stable', 'Anxious', 'Depressed', 'Distressed'],
    required: true 
  },
  familySupport: { 
    type: String, 
    enum: ['Strong', 'Moderate', 'Weak', 'None'],
    required: true 
  },
  socialChallenges: String,
  spiritualConcerns: { 
    type: Boolean, 
    required: true 
  },
  spiritualSupportPreferred: { 
    type: String, 
    enum: ['ReligiousLeader', 'Counselor', 'Other'] 
  },
  painManagementPlan: { 
    type: String, 
    required: true 
  },
  medicationPlan: { 
    type: String, 
    required: true 
  },
  nursingCarePlan: { 
    type: String, 
    required: true 
  },
  homeBasedCareRequired: { 
    type: Boolean, 
    required: true 
  },
  psychosocialSupportPlan: String,
  physiotherapyRequired: { 
    type: Boolean, 
    required: true 
  },
  dischargeReason: { 
    type: String, 
    enum: ['Improved', 'Deceased'] 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Discharged'],
    default: 'Active' 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const HospitalAdmission = mongoose.model<IHospitalAdmission>('HospitalAdmission', HospitalAdmissionSchema);
```

---

### Notification Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: mongoose.Types.ObjectId;
    referralId?: mongoose.Types.ObjectId;
    patientId?: mongoose.Types.ObjectId;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    enum: ['StaffApproval', 'ReferralApproval', 'CloseCase'],
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    staffId: Schema.Types.ObjectId,
    referralId: Schema.Types.ObjectId,
    patientId: Schema.Types.ObjectId,
    patientName: String,
    staffName: String
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
```

---

## 3. Database Indexes

```typescript
// Create indexes for performance optimization

// Staff indexes
StaffSchema.index({ email: 1 }, { unique: true });
StaffSchema.index({ status: 1 });
StaffSchema.index({ isEmailVerified: 1 });
StaffSchema.index({ emailVerificationToken: 1 });

// Patient indexes
PatientSchema.index({ status: 1 });
PatientSchema.index({ currentLocation: 1 });
PatientSchema.index({ registeredBy: 1 });
PatientSchema.index({ patientDisplayId: 1 });

// HomeVisit indexes
HomeVisitSchema.index({ patientId: 1 });
HomeVisitSchema.index({ visitDate: -1 });

// Medication indexes
MedicationSchema.index({ patientId: 1 });
MedicationSchema.index({ createdAt: -1 });

// LaboratoryTest indexes
LaboratoryTestSchema.index({ patientId: 1 });
LaboratoryTestSchema.index({ dateOrdered: -1 });

// Referral indexes
ReferralSchema.index({ patientId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });

// HospitalAdmission indexes
HospitalAdmissionSchema.index({ patientId: 1 });
HospitalAdmissionSchema.index({ status: 1 });

// Notification indexes
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ createdAt: -1 });

// Counter indexes
CounterSchema.index({ name: 1 }, { unique: true });
```

---

## 4. Database Connection

```typescript
// src/config/database.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/palliative-care';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## 5. Environment Variables

```env
# .env.example
MONGODB_URI=mongodb://localhost:27017/palliative-care
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=10
PORT=5000
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Admin Seed (for first-time setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword
ADMIN_NAME=Admin User
```

---

## 6. Seed Script

```typescript
//  scripts/seed-admin.ts

import { Admin } from '../src/models/Admin';
import { Counter } from '../src/models/Counter';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName) {
    console.error('Admin seed credentials missing in environment variables');
    process.exit(1);
  }

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin already exists. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await Admin.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
  });

  console.log('Admin user seeded successfully');

  // Initialize counter for patient display IDs
  await Counter.findOneAndUpdate(
    { name: 'patientId' },
    { $setOnInsert: { value: 0 } },
    { upsert: true }
  );
  console.log('Counter initialized for patient display IDs');
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  });
```

---

## 7. Data Relationships Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      ADMIN      │     │      STAFF      │     │    PATIENT      │
│                 │     │                 │     │                 │
│  _id            │────▶│  assignedBy     │     │  _id            │
│  name           │     │  _id            │     │  registeredBy   │◀──┐
│  email          │     │  name           │     │  patientDisplayId│  │
│  password       │     │  email          │     │  firstName      │  │
│  createdAt      │     │  phone          │     │  lastName       │  │
└─────────────────┘     │  password       │     │  status         │  │
                        │  role (nullable)│     │  currentLocation│  │
                        │  status         │     └─────────────────┘  │
                        │  isEmailVerified│              │           │
                        │  emailVerificationToken│      │           │
                        │  emailVerificationTokenExpires│           │
                        │  createdAt      │              │           │
                        │  updatedAt      │              │           │
                        └─────────────────┘              │           │
                              │     ▲                    │           │
                              │     │                    │           │
                              │     │                    │           │
                              ▼     │                    ▼           │
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  HOME_VISIT     │  │  MEDICATION     │  │  LABORATORY_TEST│    │
│  │                 │  │                 │  │                 │    │
│  │  _id            │  │  _id            │  │  _id            │    │
│  │  patientId      │──│  patientId      │──│  patientId      │    │
│  │  teamLeaderId   │  │  prescribedBy   │  │  orderedBy      │    │
│  │  physicianId    │  │  visitId        │  │  visitId        │    │
│  │  nurseId        │  │  admissionId    │  │  admissionId    │    │
│  │  teamMembers    │  │  name           │  │  testName       │    │
│  │  (staffId refs) │  │  status         │  │  result         │    │
│  │  visitDate      │  └─────────────────┘  └─────────────────┘    │
│  │  outcome        │                                              │
│  └─────────────────┘                                              │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   REFERRAL      │  │ HOSPITAL_       │  │  NOTIFICATION   │    │
│  │                 │  │ ADMISSION       │  │                 │    │
│  │  _id            │──│  _id            │  │  _id            │    │
│  │  patientId      │  │  patientId      │  │  type           │    │
│  │  requestedBy    │  │  referralId     │  │  message        │    │
│  │  approvedBy     │  │  createdBy      │  │  read           │    │
│  │  preparedBy     │  │  status         │  │  createdAt      │    │
│  │  signature      │  │  admissionDate  │  └─────────────────┘    │
│  │  status         │  └─────────────────┘                        │
│  │  createdAt      │                                              │
│  └─────────────────┘                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
