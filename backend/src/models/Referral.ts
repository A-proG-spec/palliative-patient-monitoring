import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  // ── Core ────────────────────────────────────────────────────
  patientId: mongoose.Types.ObjectId;

  // ── Referral Information ────────────────────────────────────
  referralType: 'Incoming' | 'Outgoing';
  referralDate: Date;

  // ── Clinical Information ────────────────────────────────────
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

  // ── Reason for Referral ─────────────────────────────────────
  reasons: Array<
    | 'PainManagement'
    | 'SymptomControl'
    | 'EndOfLifeCare'
    | 'HomeHospiceCare'
    | 'InpatientAdmission'
    | 'PsychologicalSupport'
    | 'SpiritualCare'
    | 'CaregiverSupport'
    | 'BereavementServices'
    | 'EmergencyCare'
    | 'DiagnosticEvaluation'
    | 'Other'
  >;
  otherReason?: string;

  // ── Referral Details ────────────────────────────────────────
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;

  // ── Workflow ────────────────────────────────────────────────
  status: 'Pending' | 'Accepted' | 'Declined' | 'Admitted' | 'InfoRequested';
  actionTaken:
    | 'ReferralAccepted'
    | 'AppointmentScheduled'
    | 'AdditionalInfoRequested'
    | 'ReferralDeclined'
    | 'PatientAdmitted'
    | 'PatientTransferred'
    | null;
  outcome: string;

  // ── Follow-up ───────────────────────────────────────────────
  followUpDate?: Date;
  followUpStatus?: 'Completed' | 'Pending' | 'UnableToContact';

  // ── Staff ───────────────────────────────────────────────────
  requestedBy: mongoose.Types.ObjectId;       // → Staff (auto from req.user.id)
  approvedBy?: mongoose.Types.ObjectId;       // → Admin (set on approval)

  // ── Meta ────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    // ── Core ──────────────────────────────────────────────────
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },

    // ── Referral Information ──────────────────────────────────
    referralType: {
      type: String,
      enum: ['Incoming', 'Outgoing'],
      required: true,
    },
    referralDate: {
      type: Date,
      required: true,
    },

    // ── Clinical Information ──────────────────────────────────
    primaryDiagnosis: {
      type: String,
      required: true,
    },
    diseaseStage: {
      type: String,
      enum: ['Early', 'Advanced', 'EndStage'],
      required: true,
    },
    ppsScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    kpsScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    currentSymptoms: {
      pain: { type: Number, min: 0, max: 10 },
      dyspnea: { type: Number, min: 0, max: 10 },
      fatigue: { type: Number, min: 0, max: 10 },
      anxiety: { type: Number, min: 0, max: 10 },
      depression: { type: Number, min: 0, max: 10 },
    },

    // ── Reason for Referral ───────────────────────────────────
    reasons: [
      {
        type: String,
        enum: [
          'PainManagement',
          'SymptomControl',
          'EndOfLifeCare',
          'HomeHospiceCare',
          'InpatientAdmission',
          'PsychologicalSupport',
          'SpiritualCare',
          'CaregiverSupport',
          'BereavementServices',
          'EmergencyCare',
          'DiagnosticEvaluation',
          'Other',
        ],
      },
    ],
    otherReason: String,

    // ── Referral Details ──────────────────────────────────────
    referringFacility: {
      type: String,
      required: true,
    },
    receivingFacility: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },

    // ── Workflow ──────────────────────────────────────────────
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested'],
      default: 'Pending',
    },
    actionTaken: {
      type: String,
      enum: [
        'ReferralAccepted',
        'AppointmentScheduled',
        'AdditionalInfoRequested',
        'ReferralDeclined',
        'PatientAdmitted',
        'PatientTransferred',
      ],
      default: null,
    },
    outcome: {
      type: String,
      default: '',
    },

    // ── Follow-up ─────────────────────────────────────────────
    followUpDate: Date,
    followUpStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'UnableToContact'],
    },

    // ── Staff ─────────────────────────────────────────────────
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────
ReferralSchema.index({ patientId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });
ReferralSchema.index({ requestedBy: 1 });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
export default Referral;