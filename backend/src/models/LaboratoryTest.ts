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
  | 'Cardiac';             // I (cardiac biomarkers)

// ─────────────────────────────────────────────────────────────
// Main document — ONE test per document
// ─────────────────────────────────────────────────────────────
export interface ILaboratoryTest extends Document {
  // ── Patient reference ──
  patientId: mongoose.Types.ObjectId;              // → Patient
  patientName?: string;                            // denormalized snapshot
  medicalRecordNo?: string;                        // form "Medical Record No."
  wardClinic?: string;                             // form "Ward/Clinic"
  physicianRequester?: string;                     // form "Physician/Requester"
  contactExtension?: string;                       // form "Contact/Extension"

  // ── Section 3: Laboratory Investigation Requested (single test) ──
  category: LabCategory;                           // which section A–I
  testName: string;                                // e.g. "Complete Blood Count (CBC)"
  otherText?: string;                              // when testName === 'Other'

  // ── Section 5: Priority ──
  priority: 'Routine' | 'Urgent' | 'Emergency';

  // ── Specimen / Site ──
  specimenType?: string;                           // e.g. Blood, Urine
  specimenSite?: string;                           // e.g. Left forearm

  // ── Ordering & collection timestamps ──
  dateOrdered: Date;                               // when the order was placed (required)
  collectionDate?: Date;
  collectionTime?: string;                         // "HH:mm"
  receivedDate?: Date;
  receivedTime?: string;                           // "HH:mm"

  // ── Clinical context ──
  clinicalHistory?: string;                        // reason for ordering

  // ── Location (home vs hospital) ──
  location: 'Home' | 'Hospital';

  // ── Workflow status ──
  status: 'Ordered' | 'Completed' | 'Cancelled';

  // ── Result (single test, populated when completed) ──
  datePerformed?: Date;
  result?: string;                                 // free-text result
  referenceRange?: string;
  abnormalFlag?: 'Low' | 'High' | 'Critical' | 'Normal';
  resultNotes?: string;
  performedBy?: string;                            // technologist name

  // ── Links to source encounters ──// → HomeVisit
  admissionId?: mongoose.Types.ObjectId;           // → HospitalAdmission

  // ── Meta ──
  orderedBy: mongoose.Types.ObjectId;              // → Staff (who placed the order)
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
    // ── Patient reference ──────────────────────────────────────
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: String,
    medicalRecordNo: String,
    wardClinic: String,
    physicianRequester: String,
    contactExtension: String,

    // ── Section 3: single test ─────────────────────────────────
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
    testName: { type: String, required: true },
    otherText: String,

    // ── Priority ───────────────────────────────────────────────
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
      required: true,
    },

    // ── Specimen ───────────────────────────────────────────────
    specimenType: String,
    specimenSite: String,

    // ── Timestamps ─────────────────────────────────────────────
    dateOrdered: { type: Date, required: true },
    collectionDate: Date,
    collectionTime: String,
    receivedDate: Date,
    receivedTime: String,

    // ── Context ────────────────────────────────────────────────
    clinicalHistory: String,

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

    // ── Result (single) ────────────────────────────────────────
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
LaboratoryTestSchema.index({ status: 1 });
LaboratoryTestSchema.index({ priority: 1 });
LaboratoryTestSchema.index({ category: 1 });
LaboratoryTestSchema.index({ testName: 1 });
applySoftDeleteFilter(LaboratoryTestSchema)
// ─────────────────────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────────────────────
LaboratoryTestSchema.virtual('isCompleted').get(function (this: ILaboratoryTest) {
  return this.status === 'Completed';
});

LaboratoryTestSchema.set('toJSON', { virtuals: true });
LaboratoryTestSchema.set('toObject', { virtuals: true });

export const LaboratoryTest = mongoose.model<ILaboratoryTest>(
  'LaboratoryTest',
  LaboratoryTestSchema
);
export default LaboratoryTest;