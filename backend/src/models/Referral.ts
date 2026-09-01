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
}, {
  timestamps: true
});

// Indexes
ReferralSchema.index({ patientId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
export default Referral;