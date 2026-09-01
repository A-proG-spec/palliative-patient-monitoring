import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | null;
  status: 'Pending' | 'Active' | 'Rejected';
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpires: Date | null;
  assignedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['TeamLeader', 'Physician', 'Nurse'], 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Rejected'], 
    default: 'Pending' 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String, 
    default: null 
  },
  emailVerificationTokenExpires: { 
    type: Date, 
    default: null 
  },
  assignedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
}, {
  timestamps: true
});

// Indexes

StaffSchema.index({ status: 1 });
StaffSchema.index({ isEmailVerified: 1 });
StaffSchema.index({ emailVerificationToken: 1 });

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
export default Staff;