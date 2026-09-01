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
}, {
  timestamps: true
});

// Indexes
PatientSchema.index({ status: 1 });
PatientSchema.index({ currentLocation: 1 });
PatientSchema.index({ registeredBy: 1 });
PatientSchema.index({ patientDisplayId: 1 });

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;