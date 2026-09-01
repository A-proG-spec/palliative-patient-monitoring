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
}, {
  timestamps: true
});

// Indexes
HospitalAdmissionSchema.index({ patientId: 1 });
HospitalAdmissionSchema.index({ status: 1 });

export const HospitalAdmission = mongoose.model<IHospitalAdmission>('HospitalAdmission', HospitalAdmissionSchema);
export default HospitalAdmission;