import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: mongoose.Types.ObjectId;
    referralId?: mongoose.Types.ObjectId;
    patientId?: mongoose.Types.ObjectId;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    enum: ['StaffApproval', 'ReferralApproval', 'CloseCase'],
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    staffId: Schema.Types.ObjectId,
    referralId: Schema.Types.ObjectId,
    patientId: Schema.Types.ObjectId,
    patientName: String,
    staffName: String
  },
  read: { 
    type: Boolean, 
    default: false 
  },
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;