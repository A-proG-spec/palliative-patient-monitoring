import mongoose, { Schema, Document } from 'mongoose';
import { applySoftDeleteFilter } from '@middlewares/softDelete.middleware.js';

// ─────────────────────────────────────────────────────────────
// Test category identifiers — matches form Sections A–I
// ─────────────────────────────────────────────────────────────
export type LabCategory =
  | 'Hematology'           // A
  | 'Chemistry'            // B
  | 'Hormone'              // C
  | 'Urinalysis'           // D
  | 'Stool'                // E
  | 'Microbiology'         // F
  | 'Histopathology'       // G
  | 'Immunology'           // H
  | 'Cardiac';             // I

// ─────────────────────────────────────────────────────────────
// Main document — ONE test per document
// ─────────────────────────────────────────────────────────────
export interface ILaboratoryTest extends Document {
  // ── Header (Section 0 of the form) ──
  hospitalClinic: string;                          // performing facility
  departmentLaboratory: string;                    // e.g. "Clinical Laboratory"
  requestNo?: string;                              // LAB-2026-00001 (auto-generated)
  dateOfRequest: Date;                             // header date

  // ── Section 1: Patient (via reference only) ──
  // patientName / age / sex / dateOfBirth / medicalRecordNo come from
  // Patient via .populate('patientId').
  patientId: mongoose.Types.ObjectId;              // → Patient
  wardClinic?: string;                             // where patient currently is
  physicianRequester: string;                      // form "Physician/Requester"
  contactExtension?: string;                       // form "Contact/Extension"

  // ── Section 2: Laboratory Investigation Requested ──
  category: LabCategory;
  testName: string;
  otherText?: string;
  specimenType?: string;
  specimenSite?: string;

  // ── Section 3: Clinical History / Reason ──
  clinicalHistory?: string;

  // ── Section 4: Priority ──
  priority: 'Routine' | 'Urgent' | 'Emergency';

  // ── Section 5: Collection & Submission ──
  collectionDate?: Date;
  collectionTime?: string;
  receivedDate?: Date;
  receivedTime?: string;

  // ── Ordering timestamp ──
  dateOrdered: Date;

  // ── Location (home vs hospital) ──
  location: 'Home' | 'Hospital';

  // ── Workflow status ──
  status: 'Ordered' | 'Completed' | 'Cancelled';

  // ── Result ──
  datePerformed?: Date;
  result?: string;
  referenceRange?: string;
  abnormalFlag?: 'Low' | 'High' | 'Critical' | 'Normal';
  resultNotes?: string;
  performedBy?: string;

  // ── Encounter links ──
  admissionId?: mongoose.Types.ObjectId;           // → HospitalAdmission

  // ── Meta ──
  orderedBy: mongoose.Types.ObjectId;              // → Staff
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  deletedBy: mongoose.Types.ObjectId | null;
  deletionReason?: string | null;
  updatedBy: mongoose.Types.ObjectId | null;
}

// ─────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────
const LaboratoryTestSchema = new Schema<ILaboratoryTest>(
  {
    // ── Header ─────────────────────────────────────────────────
    hospitalClinic: {
      type: String,
      default: 'Yekatit 12 Hospital Medical College',
      trim: true,
    },
    departmentLaboratory: {
      type: String,
      default: 'Clinical Laboratory',
      trim: true,
    },
    requestNo: {
      type: String,
      trim: true,
      // unique index defined below (sparse)
    },
    dateOfRequest: {
      type: Date,
      default: Date.now,
    },

    // ── Section 1: Patient reference only ──────────────────────
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    wardClinic: {
      type: String,
      trim: true,
    },
    physicianRequester: {
      type: String,
      trim: true,
      required: true,
    },
    contactExtension: {
      type: String,
      trim: true,
    },

    // ── Section 2: Laboratory Investigation Requested ─────────
    category: {
      type: String,
      enum: [
        'Hematology',
        'Chemistry',
        'Hormone',
        'Urinalysis',
        'Stool',
        'Microbiology',
        'Histopathology',
        'Immunology',
        'Cardiac',
      ],
      default: 'Hematology',
      required: true,
    },
    testName: { type: String, required: true, trim: true },
    otherText: { type: String, trim: true },
    specimenType: { type: String, trim: true },
    specimenSite: { type: String, trim: true },

    // ── Section 3: Clinical History ────────────────────────────
    clinicalHistory: { type: String, trim: true },

    // ── Section 4: Priority ────────────────────────────────────
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
      required: true,
    },

    // ── Section 5: Collection & Submission ─────────────────────
    collectionDate: Date,
    collectionTime: String,
    receivedDate: Date,
    receivedTime: String,

    // ── Ordering timestamp ─────────────────────────────────────
    dateOrdered: { type: Date, required: true },

    // ── Location ───────────────────────────────────────────────
    location: {
      type: String,
      enum: ['Home', 'Hospital'],
      required: true,
    },

    // ── Status ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['Ordered', 'Completed', 'Cancelled'],
      default: 'Ordered',
    },

    // ── Result ─────────────────────────────────────────────────
    datePerformed: Date,
    result: String,
    referenceRange: String,
    abnormalFlag: {
      type: String,
      enum: ['Low', 'High', 'Critical', 'Normal'],
    },
    resultNotes: String,
    performedBy: String,

    // ── Encounter links ────────────────────────────────────────
    admissionId: {
      type: Schema.Types.ObjectId,
      ref: 'HospitalAdmission',
    },

    // ── Meta ───────────────────────────────────────────────────
    orderedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    updatedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    deletionReason: { type: String, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
LaboratoryTestSchema.index({ patientId: 1, dateOrdered: -1 });
LaboratoryTestSchema.index({ patientId: 1, status: 1 });
LaboratoryTestSchema.index({ status: 1 });
LaboratoryTestSchema.index({ priority: 1 });
LaboratoryTestSchema.index({ category: 1 });
LaboratoryTestSchema.index({ testName: 1 });
LaboratoryTestSchema.index({ requestNo: 1 }, { unique: true, sparse: true });
LaboratoryTestSchema.index({ dateOfRequest: -1 });

applySoftDeleteFilter(LaboratoryTestSchema);

// ─────────────────────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────────────────────
LaboratoryTestSchema.virtual('isCompleted').get(function (this: ILaboratoryTest) {
  return this.status === 'Completed';
});

LaboratoryTestSchema.virtual('isUrgent').get(function (this: ILaboratoryTest) {
  return this.priority === 'Urgent' || this.priority === 'Emergency';
});

LaboratoryTestSchema.set('toJSON', { virtuals: true });
LaboratoryTestSchema.set('toObject', { virtuals: true });

// ─────────────────────────────────────────────────────────────
// Pre-save hook — auto-generate requestNo if missing
// ─────────────────────────────────────────────────────────────
LaboratoryTestSchema.pre('save', async function () {
  if (!this.requestNo) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('LaboratoryTest').countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });
    this.requestNo = `LAB-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});
export const LaboratoryTest = mongoose.model<ILaboratoryTest>(
  'LaboratoryTest',
  LaboratoryTestSchema
);
export default LaboratoryTest;