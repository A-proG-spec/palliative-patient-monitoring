import mongoose, { Schema, Document } from 'mongoose';
import { applySoftDeleteFilter } from '@middlewares/softDelete.middleware.js';

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | null;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  emailVerificationOtp: string | null;
  emailVerificationOtpExpires: Date | null;
  emailVerificationOtpAttempts: number;
  assignedBy: mongoose.Types.ObjectId;

  // ── Meta ──
  createdAt: Date;
  updatedAt: Date | null;

  // ── Soft delete ──
  deletedAt: Date | null;
  deletedBy: mongoose.Types.ObjectId | null;
  deletionReason?: string | null;
  updatedBy: mongoose.Types.ObjectId | null;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['TeamLeader', 'Physician', 'Nurse'],
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Rejected'],
      default: 'Pending',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String, default: null },
    emailVerificationOtpExpires: { type: Date, default: null },
    emailVerificationOtpAttempts: { type: Number, default: 0 },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

    // ── Soft delete ──
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    deletionReason: { type: String, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true },
);

// ── Indexes ──
StaffSchema.index({ status: 1 });
StaffSchema.index({ isEmailVerified: 1 });
StaffSchema.index({ emailVerificationOtpExpires: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ deletedAt: 1 });

// Soft-delete filter — everything by default excludes `deletedAt: { $ne: null }`
applySoftDeleteFilter(StaffSchema);

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
export default Staff;