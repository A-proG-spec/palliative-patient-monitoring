import mongoose, { Schema, Document } from 'mongoose';

export type ImagingModality =
  | 'XRay'             // A. X-Ray / Radiography
  | 'Ultrasound'       // B. Ultrasound
  | 'CT'               // C. CT Scan
  | 'MRI'              // D. MRI
  | 'Mammography'      // E. Other Imaging
  | 'Fluoroscopy'      // E. Other Imaging
  | 'Interventional'   // E. Other Imaging
  | 'NuclearMedicine'  // E. Other Imaging
  | 'Other';

export type ContrastDecision = 'No' | 'Yes' | 'ToBeDetermined' | 'NotApplicable';
export type PregnancyStatus = 'NotPregnant' | 'Pregnant' | 'PossiblyPregnant' | 'NotApplicable';
export type MetallicForeignBody = 'No' | 'Yes' | 'Unknown';
export type ImagingPriority = 'Routine' | 'Urgent' | 'Emergency';
export type Laterality = 'Right' | 'Left' | 'Bilateral' | 'NotApplicable';
export type ImageQuality = 'Diagnostic' | 'Limited' | 'NonDiagnostic' | 'RepeatRequired';


export interface IImagingOrder extends Document {
  // ── Section 1: Patient Information (auto-filled from Patient) ──
  patientId: mongoose.Types.ObjectId;
  patientName?: string;                     // denormalized snapshot
  medicalRecordNo?: string;                 // form "Medical Record No."
  wardClinic?: string;                      // form "Ward/Clinic"
  contactNo?: string;                       // form "Contact No."

  // ── Section 2: Clinical Information ────────────────────────
  provisionalDiagnosis?: string;
  presentingSymptoms?: string;
  medicalHistory?: string;
  previousImaging: boolean;                 // None / Yes radio
  previousImagingDetails?: string;          // Type / Findings (when yes)

  // ── Section 3: Imaging Examination Requested ───────────────
  modality: ImagingModality;
  modalityOtherText?: string;               // when modality === 'Other'
  bodyRegion: string;                       // e.g. "Chest", "Brain/Head"
  bodyRegionOtherText?: string;
  laterality: Laterality;

  // Contrast decision — form asks per-modality (CT & MRI) but we keep one
  // field on the document for simplicity; matches "Contrast: No/Yes/TBD"
  contrastRequested: ContrastDecision;

  // ── Section 4: Examination Details ──────────────────────────
  specificSite?: string;
  protocolViews?: string;                   // "Protocol / Views Requested"
  specialClinicalQuestion?: string;

  // ── Section 5: Contrast / Medication Information ────────────
  previousContrastReaction: boolean;
  previousContrastReactionDetails?: string;
  knownAllergies?: string;
  creatinine?: string;
  egfr?: string;
  otherRelevantMedicationOrCondition?: string;

  // ── Section 6: Safety Screening ─────────────────────────────
  pregnancyStatus: PregnancyStatus;
  implantedMedicalDevice: boolean;
  deviceImplantDetails?: string;
  metallicForeignBody: MetallicForeignBody;
  otherSafetyConsiderations?: string;

  // ── Section 7: Patient Preparation ──────────────────────────
  preparation: Array<
    | 'None'
    | 'Fasting'
    | 'FullBladder'
    | 'EmptyBladder'
    | 'SpecialMedicationPreparation'
    | 'Other'
  >;
  preparationInstructions?: string;

  // ── Section 8: Priority ─────────────────────────────────────
  priority: ImagingPriority;
  reasonForUrgency?: string;

  // ── Section 9: Referring Clinician ──────────────────────────
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianLicenseNo?: string;
  clinicianContact?: string;
  clinicianSignature?: string;             // typed name
  clinicianSignedAt?: Date;

  // ── Section 10: Imaging Department Use ──────────────────────
  examinationPerformed?: boolean;
  performedModality?: string;              // "X-Ray, US, CT, MRI, Other"
  performedProtocol?: string;
  performedContrast: 'None' | 'Administered' | 'NotAdministered';
  technologistName?: string;
  radiologistName?: string;
  performedAt?: Date;
  imageQuality?: ImageQuality;

  // ── Imaging Report ──────────────────────────────────────────
  report?: {
    reportNo?: string;
    findings: string;
    impression: string;                    // "Impression / Conclusion"
    recommendations?: string;
    reportingPhysician: string;
    signature?: string;                    // typed name
    reportDate?: Date;
    hospitalDepartmentStamp?: string;
  };

  // ── Workflow status ─────────────────────────────────────────
  status: 'Ordered' | 'Completed' | 'Cancelled';

  // ── Meta ────────────────────────────────────────────────────
  orderedBy: mongoose.Types.ObjectId;      // → Staff
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Sub-schema: Imaging Report
// ─────────────────────────────────────────────────────────────
const ImagingReportSchema = new Schema(
  {
    reportNo: String,
    findings: { type: String, required: true },
    impression: { type: String, required: true },
    recommendations: String,
    reportingPhysician: { type: String, required: true },
    signature: String,
    reportDate: Date,
    hospitalDepartmentStamp: String,
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────
const ImagingOrderSchema = new Schema<IImagingOrder>(
  {
    // ── Section 1 ──
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: String,
    medicalRecordNo: String,
    wardClinic: String,
    contactNo: String,

    // ── Section 2 ──
    provisionalDiagnosis: String,
    presentingSymptoms: String,
    medicalHistory: String,
    previousImaging: { type: Boolean, default: false },
    previousImagingDetails: String,

    // ── Section 3 ──
    modality: {
      type: String,
      enum: [
        'XRay',
        'Ultrasound',
        'CT',
        'MRI',
        'Mammography',
        'Fluoroscopy',
        'Interventional',
        'NuclearMedicine',
        'Other',
      ],
      required: true,
    },
    modalityOtherText: String,
    bodyRegion: { type: String, required: true },
    bodyRegionOtherText: String,
    laterality: {
      type: String,
      enum: ['Right', 'Left', 'Bilateral', 'NotApplicable'],
      default: 'NotApplicable',
    },
    contrastRequested: {
      type: String,
      enum: ['No', 'Yes', 'ToBeDetermined', 'NotApplicable'],
      default: 'No',
    },

    // ── Section 4 ──
    specificSite: String,
    protocolViews: String,
    specialClinicalQuestion: String,

    // ── Section 5 ──
    previousContrastReaction: { type: Boolean, default: false },
    previousContrastReactionDetails: String,
    knownAllergies: String,
    creatinine: String,
    egfr: String,
    otherRelevantMedicationOrCondition: String,

    // ── Section 6 ──
    pregnancyStatus: {
      type: String,
      enum: ['NotPregnant', 'Pregnant', 'PossiblyPregnant', 'NotApplicable'],
      default: 'NotApplicable',
    },
    implantedMedicalDevice: { type: Boolean, default: false },
    deviceImplantDetails: String,
    metallicForeignBody: {
      type: String,
      enum: ['No', 'Yes', 'Unknown'],
      default: 'No',
    },
    otherSafetyConsiderations: String,

    // ── Section 7 ──
    preparation: [
      {
        type: String,
        enum: [
          'None',
          'Fasting',
          'FullBladder',
          'EmptyBladder',
          'SpecialMedicationPreparation',
          'Other',
        ],
      },
    ],
    preparationInstructions: String,

    // ── Section 8 ──
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
      required: true,
    },
    reasonForUrgency: String,

    // ── Section 9 ──
    clinicianName: String,
    clinicianDepartment: String,
    clinicianLicenseNo: String,
    clinicianContact: String,
    clinicianSignature: String,
    clinicianSignedAt: Date,

    // ── Section 10 ──
    examinationPerformed: { type: Boolean, default: false },
    performedModality: String,
    performedProtocol: String,
    performedContrast: {
      type: String,
      enum: ['None', 'Administered', 'NotAdministered'],
      default: 'None',
    },
    technologistName: String,
    radiologistName: String,
    performedAt: Date,
    imageQuality: {
      type: String,
      enum: ['Diagnostic', 'Limited', 'NonDiagnostic', 'RepeatRequired'],
    },

    // ── Imaging Report ──
    report: ImagingReportSchema,

    // ── Workflow ──
    status: {
      type: String,
      enum: ['Ordered', 'Completed', 'Cancelled'],
      default: 'Ordered',
    },

    // ── Meta ──
    orderedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
ImagingOrderSchema.index({ patientId: 1 });
ImagingOrderSchema.index({ status: 1 });
ImagingOrderSchema.index({ modality: 1 });
ImagingOrderSchema.index({ priority: 1 });
ImagingOrderSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────────────────────
ImagingOrderSchema.virtual('isCompleted').get(function (this: IImagingOrder) {
  return this.status === 'Completed';
});

ImagingOrderSchema.virtual('hasReport').get(function (this: IImagingOrder) {
  return !!(this.report && this.report.findings && this.report.impression);
});

ImagingOrderSchema.set('toJSON', { virtuals: true });
ImagingOrderSchema.set('toObject', { virtuals: true });

export const ImagingOrder = mongoose.model<IImagingOrder>(
  'ImagingOrder',
  ImagingOrderSchema
);
export default ImagingOrder;