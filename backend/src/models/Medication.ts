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
}, {
  timestamps: true
});

// Indexes
MedicationSchema.index({ patientId: 1 });
MedicationSchema.index({ createdAt: -1 });

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
export default Medication;