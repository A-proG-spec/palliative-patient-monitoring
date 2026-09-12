import mongoose, { Schema, Document } from 'mongoose';
import {applySoftDeleteFilter} from '@middlewares/softDelete.middleware'

export interface IHospitalAdmission extends Document {
  // ── Patient Reference ──────────────────────────────────────────
  patientId: mongoose.Types.ObjectId;              // → Patient model
  patientName?: string;                            // denormalized snapshot for list views
  hospitalPatientId?: string;                      // hospital-assigned MRN / ward ID (form Section 1)

  // ── Admission-time Emergency Contact (may differ from Patient.emergencyContact) ──
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // ── Section 2: Referral Information ────────────────────────────
  referralId?: mongoose.Types.ObjectId;            // optional — direct admissions don't require it
  referredFrom?:
  | 'InternalWard'
  | 'OutpatientDepartment'
  | 'ICU'
  | 'ExternalHospital'
  | 'Community'
  | 'Home'
  | 'Other';
  referredFromOther?: string;
  referringClinician?: string;
  diagnosisAtReferral?: string;
  referralReason?:
  | 'PainManagement'
  | 'EndOfLifeCare'
  | 'SymptomControl'
  | 'HomeBasedCare'
  | 'PsychosocialSupport'
  | 'Other';
  referralReasonOther?: string;

  // ── Admission Details ──────────────────────────────────────────
  admissionDate: Date;
  dischargeDate?: Date;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;

  // ── Section 3: Medical Diagnosis ───────────────────────────────
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities: string[];

  // ── Section 4: Palliative Care Eligibility ─────────────────────
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  kpsScore?: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';

  // ── Section 5: Pain & Symptom Assessment (Initial) ─────────────
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent: Array<
    'Dyspnea' | 'Nausea' | 'Fatigue' | 'Anxiety' | 'Depression' | 'Insomnia' | 'Other'
  >;
  symptomsPresentOther?: string;

  // ── Section 6: Psychosocial Assessment ─────────────────────────
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;

  // ── Section 7: Spiritual Care Needs ────────────────────────────
  spiritualConcerns: boolean;
  spiritualNeedsDescription?: string;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  spiritualSupportPreferredOther?: string;

  // ── Section 8: Initial Care Plan ───────────────────────────────
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;

  // ── Section 10: Admission Decision ─────────────────────────────
  admittedToHospiceUnit?: boolean;

  // ── Discharge / Lifecycle ──────────────────────────────────────
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';

  // ── Meta ───────────────────────────────────────────────────────
  createdBy: mongoose.Types.ObjectId;              // Staff who recorded the admission
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: mongoose.Types.ObjectId | null;
  deletionReason?: string | null;
  updatedBy: mongoose.Types.ObjectId | null;
  updatedAt:Date|null;
}

const HospitalAdmissionSchema = new Schema<IHospitalAdmission>(
  {
    // ── Patient Reference ────────────────────────────────────────
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: String,              // denormalized for list performance
    hospitalPatientId: String,        // hospital-issued MRN / ward ID

    // ── Admission-time Emergency Contact ─────────────────────────
    emergencyContactName: String,
    emergencyContactRelationship: String,
    emergencyContactPhone: String,

    // ── Section 2: Referral Information ──────────────────────────
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral',
      // optional — direct admissions don't require a linked referral
    },
    referredFrom: {
      type: String,
      enum: [
        'InternalWard',
        'OutpatientDepartment',
        'ICU',
        'ExternalHospital',
        'Community',
        'Home',
        'Other',
      ],
    },
    referredFromOther: String,
    referringClinician: String,
    diagnosisAtReferral: String,
    referralReason: {
      type: String,
      enum: [
        'PainManagement',
        'EndOfLifeCare',
        'SymptomControl',
        'HomeBasedCare',
        'PsychosocialSupport',
        'Other',
      ],
    },
    referralReasonOther: String,

    // ── Admission Details ────────────────────────────────────────
    admissionDate: { type: Date, required: true },
    dischargeDate: Date,
    bedNumber: { type: String, required: true },
    ward: { type: String, required: true },
    admittingPhysician: { type: String, required: true },
    careTeam: { type: String, required: true },

    // ── Section 3: Medical Diagnosis ─────────────────────────────
    primaryDiagnosis: { type: String, required: true },
    secondaryDiagnoses: [String],
    diseaseStage: {
      type: String,
      enum: ['Early', 'Advanced', 'Terminal'],
      required: true,
    },
    comorbidities: [String],

    // ── Section 4: Palliative Care Eligibility ───────────────────
    estimatedPrognosis: {
      type: String,
      enum: ['Days', 'Weeks', 'Months', 'Uncertain'],
      required: true,
    },
    ppsScore: { type: Number, min: 0, max: 100, required: true },
    kpsScore: { type: Number, min: 0, max: 100 },
    functionalStatus: {
      type: String,
      enum: ['FullyIndependent', 'PartiallyDependent', 'FullyDependent'],
      required: true,
    },

    // ── Section 5: Pain & Symptom Assessment ─────────────────────
    painScore: { type: Number, min: 0, max: 10, required: true },
    painType: {
      type: String,
      enum: ['Acute', 'Chronic', 'Neuropathic', 'Mixed'],
      required: true,
    },
    symptomsPresent: [
      {
        type: String,
        enum: ['Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other'],
      },
    ],
    symptomsPresentOther: String,

    // ── Section 6: Psychosocial Assessment ───────────────────────
    emotionalStatus: {
      type: String,
      enum: ['Stable', 'Anxious', 'Depressed', 'Distressed'],
      required: true,
    },
    familySupport: {
      type: String,
      enum: ['Strong', 'Moderate', 'Weak', 'None'],
      required: true,
    },
    socialChallenges: String,

    // ── Section 7: Spiritual Care Needs ──────────────────────────
    spiritualConcerns: { type: Boolean, required: true },
    spiritualNeedsDescription: String,
    spiritualSupportPreferred: {
      type: String,
      enum: ['ReligiousLeader', 'Counselor', 'Other'],
    },
    spiritualSupportPreferredOther: String,

    // ── Section 8: Initial Care Plan ─────────────────────────────
    painManagementPlan: { type: String, required: true },
    medicationPlan: { type: String, required: true },
    nursingCarePlan: { type: String, required: true },
    homeBasedCareRequired: { type: Boolean, required: true },
    psychosocialSupportPlan: String,
    physiotherapyRequired: { type: Boolean, required: true },

    // ── Section 10: Admission Decision ───────────────────────────
    admittedToHospiceUnit: { type: Boolean, default: true },

    // ── Discharge / Lifecycle ────────────────────────────────────
    dischargeReason: {
      type: String,
      enum: ['Improved', 'Deceased'],
    },
    status: {
      type: String,
      enum: ['Active', 'Discharged'],
      default: 'Active',
    },

    // ── Meta ─────────────────────────────────────────────────────
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    updatedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    deletionReason: { type: String, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
HospitalAdmissionSchema.index({ patientId: 1 });
HospitalAdmissionSchema.index({ status: 1 });
HospitalAdmissionSchema.index({ admissionDate: -1 });
HospitalAdmissionSchema.index({ referralId: 1 });
HospitalAdmissionSchema.index({ bedNumber: 1, status: 1 });   // bed-occupancy lookup
applySoftDeleteFilter(HospitalAdmissionSchema)
// ── Virtual: currently admitted ──────────────────────────────────
HospitalAdmissionSchema.virtual('isActive').get(function (this: IHospitalAdmission) {
  return this.status === 'Active';
});

// ── Virtual: length of stay in days ──────────────────────────────
HospitalAdmissionSchema.virtual('lengthOfStayDays').get(function (this: IHospitalAdmission) {
  const end = this.dischargeDate ?? new Date();
  return Math.floor((end.getTime() - this.admissionDate.getTime()) / (1000 * 60 * 60 * 24));
});

// ── Ensure virtuals are serialized ───────────────────────────────
HospitalAdmissionSchema.set('toJSON', { virtuals: true });
HospitalAdmissionSchema.set('toObject', { virtuals: true });

export const HospitalAdmission = mongoose.model<IHospitalAdmission>(
  'HospitalAdmission',
  HospitalAdmissionSchema
);
export default HospitalAdmission;