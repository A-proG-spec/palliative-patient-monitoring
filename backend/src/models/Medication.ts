import mongoose, { Schema, Document } from 'mongoose';
import { applySoftDeleteFilter } from '@middlewares/softDelete.middleware.js';

export interface IMedication extends Document {
  patientId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: mongoose.Types.ObjectId;
  administeredAt: 'Home' | 'Hospital';
  status: 'Ordered' | 'Given';
  createdAt: Date;
  updatedAt:Date|null;
  updatedBy: mongoose.Types.ObjectId | null;
  deletedAt: Date | null;
  deletedBy: mongoose.Types.ObjectId | null;
  deletionReason?: string | null;
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
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  deletionReason: { type: String, default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
}, {
  timestamps: true
});

// Indexes
MedicationSchema.index({ patientId: 1 });
MedicationSchema.index({ createdAt: -1 });
applySoftDeleteFilter(MedicationSchema);

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
export default Medication;