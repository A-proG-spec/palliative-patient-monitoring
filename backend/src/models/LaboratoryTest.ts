import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryTest extends Document {
  patientId: mongoose.Types.ObjectId;
  testName: string;
  orderedBy: mongoose.Types.ObjectId;
  dateOrdered: Date;
  datePerformed?: Date;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';  // ✅ Added - was missing
  visitId?: mongoose.Types.ObjectId;
  admissionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;  // ✅ Added - was missing
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
  status: { 
    type: String, 
    enum: ['Ordered', 'Completed'],
    default: 'Ordered'  // ✅ Added default
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
  timestamps: true  // ✅ This automatically adds createdAt and updatedAt
});

// Indexes
LaboratoryTestSchema.index({ patientId: 1 });
LaboratoryTestSchema.index({ dateOrdered: -1 });

export const LaboratoryTest = mongoose.model<ILaboratoryTest>('LaboratoryTest', LaboratoryTestSchema);
export default LaboratoryTest;