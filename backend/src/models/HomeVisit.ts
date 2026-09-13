import mongoose, { Schema, Document } from 'mongoose';
import {applySoftDeleteFilter} from '@middlewares/softDelete.middleware'
// ─────────────────────────────────────────────────────────────
// Sub-document: Visit Signature
// ─────────────────────────────────────────────────────────────
export interface IVisitSignature {
  staffId: mongoose.Types.ObjectId;      // → Staff
  name: string;                          // snapshot for display
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────
export interface IHomeVisit extends Document {
  // ── Section 1: Patient Identification (auto-filled from patient) ──
  patientId: mongoose.Types.ObjectId;

  // ── Section 2: Visit Details ──
  visitDate: Date;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{
    staffId?: mongoose.Types.ObjectId;
    role: 'TeamLeader' | 'Physician' | 'Nurse';
    name: string;
  }>;

  // ── Section 3: Patient General Condition ──
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';

  // ── Section 4: Vital Signs ──
  vitals?: {
    temperature?: number;
    pulse?: number;
    bp?: string;
    respiration?: number;
    spo2?: number;
  };

  // ── Section 5: Pain Assessment ──
  painPresent?: boolean;
  painScore: number;
  painLocation: Array<'Head' | 'Neck' | 'Chest' | 'Abdomen' | 'Back' | 'Limbs' | 'Generalized' | 'Other'>;
  painLocationOther?: string;
  painCharacteristics: Array<'Sharp' | 'Dull' | 'Burning' | 'Cramping' | 'Intermittent' | 'Continuous'>;
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;

  // ── Section 6: Symptoms ──
  symptoms: Array<'Dyspnea' | 'Nausea' | 'Constipation' | 'Anxiety' | 'Fatigue' | 'PoorAppetite' | 'PressureSores' | 'Other'>;
  symptomsOther?: string;

  // ── Section 7: Functional Status Assessment ──
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;
  kpsScore: number;

  // ── Section 8: Nutrition and Hydration ──
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;

  // ── Section 9: Psychosocial Assessment ──
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;

  // ── Section 10: Spiritual Assessment ──
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;

  // ── Section 11: Medication Review ──
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean | null;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
  medicationIssues?: string;

  // ── Section 12: Caregiver Assessment ──
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';

  // ── Section 13: Education Provided ──
  educationProvided: Array<
    | 'MedicationAdministration'
    | 'PainManagement'
    | 'NutritionSupport'
    | 'SkinCare'
    | 'PressureSorePrevention'
    | 'EndOfLifeCare'
    | 'EmergencySigns'
    | 'EmotionalSupport'
    | 'Other'
  >;
  educationProvidedOther?: string;
  trainingNeeds: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;

  // ── Section 14: Home Environment Assessment ──
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: Array<
    'AdequateLighting' | 'Ventilation' | 'SafeBed' | 'CleanWater' | 'SanitationIssues'
  >;
  homeEnvironmentDetails?: string;

  // ── Section 15: Nursing Care Provided ──
  nursingCareGiven: Array<
    | 'Hygiene'
    | 'WoundCare'
    | 'MedicationAdmin'
    | 'PositionChange'
    | 'FeedingAssistance'
    | 'Counseling'
    | 'Other'
  >;
  nursingCareOther?: string;

  // ── Section 16: Red Flag Assessment ──
  redFlags: Array<
    | 'SevereUncontrolledPain'
    | 'SevereShortnessOfBreath'
    | 'MassiveBleeding'
    | 'UncontrolledSeizures'
    | 'AlteredMentalStatus'
    | 'SevereDehydration'
    | 'None'
  >;
  redFlagActions?: string;

  // ── Section 17: Referrals Made ──
  referralsMade: Array<
    | 'PhysicianReview'
    | 'HospitalAdmission'
    | 'SocialWorker'
    | 'Psychologist'
    | 'SpiritualCare'
    | 'NutritionSupport'
  >;

  // ── Section 18: Key Issues Identified ──
  keyIssues?: string;

  // ── Section 19: Action Plan ──
  immediateActions?: string;
  followUpPlan?: string;
  nextVisitDate?: Date;

  // ── Section 20: Outcome of Visit ──
  outcome:
    | 'Stable'
    | 'SymptomsImproved'
    | 'SymptomsUnchanged'
    | 'SymptomsWorsened'
    | 'ReferredToFacility'
    | 'Deceased';
  dateOfDeath?: Date;

  // ── Section 21: Team Signatures ──
  teamLeaderId: mongoose.Types.ObjectId;   // auto-signed at creation
  signatures: IVisitSignature[];           // everyone else who has signed

  // ── Meta ──
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt:Date|null;
  deletedAt: Date;
  deletedBy:mongoose.Types.ObjectId |null;
  deletionReason?:string |null;
  updatedBy:mongoose.Types.ObjectId |null;
}

// ─────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────
const VisitSignatureSchema = new Schema<IVisitSignature>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['TeamLeader', 'Physician', 'Nurse'],
      required: true,
    },
    signedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────
const HomeVisitSchema = new Schema<IHomeVisit>(
  {
    // ── Section 1 ──
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },

    // ── Section 2 ──
    visitDate: { type: Date, required: true },
    timeStarted: { type: String, required: true },
    timeEnded: { type: String, required: true },
    visitType: {
      type: String,
      enum: ['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement'],
      required: true,
    },
    teamMembers: [
      {
        staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
        role: { type: String, enum: ['TeamLeader', 'Physician', 'Nurse'] },
        name: { type: String },
      },
    ],

    // ── Section 3 ──
    overallStatus: {
      type: String,
      enum: ['Stable', 'Deteriorating', 'Critical', 'BedBound'],
      required: true,
    },
    mobility: {
      type: String,
      enum: ['Ambulatory', 'RequiresAssistance', 'Bedridden'],
      required: true,
    },

    // ── Section 4 ──
    vitals: {
      temperature: Number,
      pulse: Number,
      bp: String,
      respiration: Number,
      spo2: Number,
    },

    // ── Section 5 ──
    painPresent: Boolean,
    painScore: { type: Number, min: 0, max: 10, required: true },
    painLocation: [
      {
        type: String,
        enum: ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other'],
      },
    ],
    painLocationOther: String,
    painCharacteristics: [
      {
        type: String,
        enum: ['Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous'],
      },
    ],
    currentPainMedication: Boolean,
    painMedicationEffective: { type: Boolean, required: true },
    painManagementIneffectiveReason: String,

    // ── Section 6 ──
    symptoms: [
      {
        type: String,
        enum: ['Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other'],
      },
    ],
    symptomsOther: String,

    // ── Section 7 ──
    adl: {
      feeding: { type: String, enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] },
      bathing: { type: String, enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] },
      dressing: { type: String, enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] },
      toileting: { type: String, enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] },
      mobility: { type: String, enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] },
    },
    ppsScore: { type: Number, min: 0, max: 100, required: true },
    kpsScore: { type: Number, min: 0, max: 100, required: true },

    // ── Section 8 ──
    appetite: {
      type: String,
      enum: ['Good', 'Fair', 'Poor', 'UnableToEat'],
      required: true,
    },
    oralIntake: {
      type: String,
      enum: ['Adequate', 'Reduced', 'Minimal'],
      required: true,
    },
    hydrationStatus: {
      type: String,
      enum: ['Adequate', 'MildDehydration', 'SevereDehydration'],
      required: true,
    },
    nutritionComments: String,

    // ── Section 9 ──
    emotionalStatus: {
      type: String,
      enum: ['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed'],
      required: true,
    },
    emotionalComments: String,
    familySupport: {
      type: String,
      enum: ['Excellent', 'Good', 'Limited', 'None'],
      required: true,
    },
    financialDifficulty: { type: Boolean, required: true },
    financialComments: String,

    // ── Section 10 ──
    spiritualNeeds: { type: Boolean, required: true },
    spiritualNeedsDescription: String,
    religiousSupportRequested: { type: Boolean, required: true },
    religiousSupportSpecify: String,

    // ── Section 11 ──
    medicationAvailable: { type: Boolean, required: true },
    medicationCorrectlyTaken: { type: Boolean, required: true },
    medicationSideEffects: { type: Boolean, required: true },
    medicationRefillNeeded: { type: Boolean, required: true },
    morphineAvailable: { type: Boolean, default: true },
    adherenceLevel: {
      type: String,
      enum: ['Good', 'Partial', 'Poor'],
      required: true,
    },
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        route: String,
      },
    ],
    medicationIssues: String,

    // ── Section 12 ──
    primaryCaregiver: String,
    caregiverBurden: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      required: true,
    },
    caregiverUnderstanding: {
      type: String,
      enum: ['Good', 'Fair', 'Poor'],
      required: true,
    },
    caregivingCapacity: {
      type: String,
      enum: ['Strong', 'Moderate', 'Weak'],
      required: true,
    },
    familyEmotionalStatus: {
      type: String,
      enum: ['Stable', 'Stressed', 'Overwhelmed'],
      required: true,
    },

    // ── Section 13 ──
    educationProvided: [
      {
        type: String,
        enum: [
          'MedicationAdministration',
          'PainManagement',
          'NutritionSupport',
          'SkinCare',
          'PressureSorePrevention',
          'EndOfLifeCare',
          'EmergencySigns',
          'EmotionalSupport',
          'Other',
        ],
      },
    ],
    educationProvidedOther: String,
    trainingNeeds: [String],
    additionalSupportNeeded: Boolean,
    additionalSupportSpecify: String,

    // ── Section 14 ──
    homeCondition: {
      type: String,
      enum: ['Clean', 'Fair', 'Poor'],
      required: true,
    },
    homeObservations: [
      {
        type: String,
        enum: ['AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues'],
      },
    ],
    homeEnvironmentDetails: String,

    // ── Section 15 ──
    nursingCareGiven: [
      {
        type: String,
        enum: [
          'Hygiene',
          'WoundCare',
          'MedicationAdmin',
          'PositionChange',
          'FeedingAssistance',
          'Counseling',
          'Other',
        ],
      },
    ],
    nursingCareOther: String,

    // ── Section 16 ──
    redFlags: [
      {
        type: String,
        enum: [
          'SevereUncontrolledPain',
          'SevereShortnessOfBreath',
          'MassiveBleeding',
          'UncontrolledSeizures',
          'AlteredMentalStatus',
          'SevereDehydration',
          'None',
        ],
      },
    ],
    redFlagActions: String,

    // ── Section 17 ──
    referralsMade: [
      {
        type: String,
        enum: [
          'PhysicianReview',
          'HospitalAdmission',
          'SocialWorker',
          'Psychologist',
          'SpiritualCare',
          'NutritionSupport',
        ],
      },
    ],

    // ── Section 18 ──
    keyIssues: String,

    // ── Section 19 ──
    immediateActions: String,
    followUpPlan: String,
    nextVisitDate: Date,

    // ── Section 20 ──
    outcome: {
      type: String,
      enum: [
        'Stable',
        'SymptomsImproved',
        'SymptomsUnchanged',
        'SymptomsWorsened',
        'ReferredToFacility',
        'Deceased',
      ],
      required: true,
    },
    dateOfDeath: Date,

    // ── Section 21: Team Signatures ──
    teamLeaderId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    signatures: { type: [VisitSignatureSchema], default: [] },

    // ── Meta ──
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    updatedAt:{type:Date, default:null},
    deletedAt:{type:Date, default:null},
    deletedBy:{type:Schema.Types.ObjectId, ref:'Admin', default:null},
    deletionReason:{type:String},
    updatedBy:{type:Schema.Types.ObjectId, ref:'Admin', default:null},
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
HomeVisitSchema.index({ patientId: 1 });
HomeVisitSchema.index({ visitDate: -1 });
HomeVisitSchema.index({ outcome: 1 });
HomeVisitSchema.index({ redFlags: 1 });
HomeVisitSchema.index({ nextVisitDate: 1 });
HomeVisitSchema.index({ teamLeaderId: 1 });
HomeVisitSchema.index({ 'signatures.staffId': 1 });
applySoftDeleteFilter(HomeVisitSchema);
// ── Virtual: all required roles have signed ─────────────────────
// Required signers are: TeamLeader (always present) + Physician + Nurse.
HomeVisitSchema.virtual('allSigned').get(function (this: IHomeVisit) {
  const roles = new Set(this.signatures.map((s) => s.role));
  // teamLeaderId is always populated → TeamLeader role is guaranteed
  roles.add('TeamLeader');
  return roles.has('TeamLeader') && roles.has('Physician') && roles.has('Nurse');
});

HomeVisitSchema.set('toJSON', { virtuals: true });
HomeVisitSchema.set('toObject', { virtuals: true });
export const HomeVisit = mongoose.model<IHomeVisit>('HomeVisit', HomeVisitSchema);

export default HomeVisit;