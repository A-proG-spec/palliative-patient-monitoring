// ═════════════════════════════════════════════════════════════
// ENUMS — mirror backend Prisma enums exactly
// ═════════════════════════════════════════════════════════════

export type ImagingModality =
  | 'XRay'
  | 'Ultrasound'
  | 'CT'
  | 'MRI'
  | 'Mammography'
  | 'Fluoroscopy'
  | 'Interventional'
  | 'NuclearMedicine'
  | 'Other';

export type ImagingContrastDecision =
  | 'No'
  | 'Yes'
  | 'ToBeDetermined'
  | 'NotApplicable';

export type ImagingPregnancyStatus =
  | 'NotPregnant'
  | 'Pregnant'
  | 'PossiblyPregnant'
  | 'NotApplicable';

export type ImagingMetallicForeignBody =
  | 'No'
  | 'Yes'
  | 'Unknown';

export type ImagingPriority =
  | 'Routine'
  | 'Urgent'
  | 'Emergency';

export type ImagingLaterality =
  | 'Right'
  | 'Left'
  | 'Bilateral'
  | 'NotApplicable';

export type ImagingImageQuality =
  | 'Diagnostic'
  | 'Limited'
  | 'NonDiagnostic'
  | 'RepeatRequired';

export type ImagingPreparation =
  | 'None'
  | 'Fasting'
  | 'FullBladder'
  | 'EmptyBladder'
  | 'SpecialMedicationPreparation'
  | 'Other';

export type ImagingPerformedContrast =
  | 'None'
  | 'Administered'
  | 'NotAdministered';

export type ImagingStatus =
  | 'Ordered'
  | 'Completed'
  | 'Cancelled';

// ═════════════════════════════════════════════════════════════
// REPORT — embedded on the ImagingOrder row (flat columns)
// ═════════════════════════════════════════════════════════════

export interface ImagingOrderReport {
  findings: string;
  impression: string;
  recommendation?: string | null;
  reportDate?: string | null;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT — full shape returned by GET one
// ═════════════════════════════════════════════════════════════

export interface ImagingOrder {
  id: string;
  patientId: string;

  // Patient snapshot
  patientName?: string | null;
  medicalRecordNo?: string | null;
  age?: number | null;
  sex?: 'Male' | 'Female' | null;
  dateOfBirth?: string | null;

  // Header
  hospital?: string | null;
  department?: string | null;
  wardClinic?: string | null;
  contactNo?: string | null;

  // §2 Clinical Information
  provisionalDiagnosis?: string | null;
  presentingSymptoms?: string | null;
  medicalHistory?: string | null;
  previousImaging: boolean;
  previousImagingDetails?: string | null;

  // §3 Imaging Examination Requested
  modality: ImagingModality;
  modalityOtherText?: string | null;
  bodyRegion: string;
  bodyRegionOtherText?: string | null;
  laterality: ImagingLaterality;
  contrastRequested: ImagingContrastDecision;

  // §4 Examination Details
  specificSite?: string | null;
  protocolViews?: string | null;
  specialClinicalQuestion?: string | null;

  // §5 Contrast / Medication
  previousContrastReaction: boolean;
  previousContrastReactionDetails?: string | null;
  knownAllergies?: string | null;
  creatinine?: string | null;
  egfr?: string | null;
  otherRelevantMedicationOrCondition?: string | null;

  // §6 Safety Screening
  pregnancyStatus: ImagingPregnancyStatus;
  implantedMedicalDevice: boolean;
  deviceImplantDetails?: string | null;
  metallicForeignBody: ImagingMetallicForeignBody;
  otherSafetyConsiderations?: string | null;

  // §7 Patient Preparation
  preparation: ImagingPreparation[];
  preparationInstructions?: string | null;

  // §8 Priority
  priority: ImagingPriority;
  reasonForUrgency?: string | null;

  // §9 Referring Clinician
  clinicianName?: string | null;
  clinicianDepartment?: string | null;
  clinicianLicenseNo?: string | null;
  clinicianContact?: string | null;

  // §10 Imaging Department Use
  examinationPerformed: boolean;
  performedModality?: string | null;
  performedProtocol?: string | null;
  performedContrast: ImagingPerformedContrast;
  technologistName?: string | null;
  radiologistName?: string | null;
  performedAt?: string | null;
  imageQuality?: ImagingImageQuality | null;

  // Report (flat columns)
  findings?: string | null;
  impression?: string | null;
  recommendation?: string | null;
  reportDate?: string | null;

  // Status
  status: ImagingStatus;

  // Meta
  orderedBy?: {
    id: string;
    name: string;
    role?: string;
    email?: string;
  } | null;

  createdAt: string;
  updatedAt?: string | null;

  // Soft delete
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// LIST DTO — lighter shape returned by list endpoints
// ═════════════════════════════════════════════════════════════

export interface ImagingOrderListItem {
  id: string;
  patientId: string;
  modality: ImagingModality;
  bodyRegion: string;
  specificSite?: string | null;
  laterality: ImagingLaterality;
  priority: ImagingPriority;
  status: ImagingStatus;
  hasReport: boolean;
  dateOrdered: string;
  performedAt?: string | null;
  orderedBy?: { id: string; name: string } | null;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateImagingRequest {
  // §2 Clinical
  provisionalDiagnosis?: string;
  presentingSymptoms?: string;
  medicalHistory?: string;
  previousImaging?: boolean;
  previousImagingDetails?: string;

  // §3 Examination requested
  modality: ImagingModality;
  modalityOtherText?: string;
  bodyRegion: string;
  bodyRegionOtherText?: string;
  laterality?: ImagingLaterality;
  contrastRequested?: ImagingContrastDecision;

  // §4 Details
  specificSite?: string;
  protocolViews?: string;
  specialClinicalQuestion?: string;

  // §5 Contrast / meds
  previousContrastReaction?: boolean;
  previousContrastReactionDetails?: string;
  knownAllergies?: string;
  creatinine?: string;
  egfr?: string;
  otherRelevantMedicationOrCondition?: string;

  // §6 Safety
  pregnancyStatus?: ImagingPregnancyStatus;
  implantedMedicalDevice?: boolean;
  deviceImplantDetails?: string;
  metallicForeignBody?: ImagingMetallicForeignBody;
  otherSafetyConsiderations?: string;

  // §7 Preparation
  preparation?: ImagingPreparation[];
  preparationInstructions?: string;

  // §8 Priority
  priority?: ImagingPriority;
  reasonForUrgency?: string;

  // §9 Clinician
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianLicenseNo?: string;
  clinicianContact?: string;

  // Optional patient snapshot (server fills from Patient when omitted)
  patientName?: string;
  medicalRecordNo?: string;
  wardClinic?: string;
  contactNo?: string;
}

export interface UpdateImagingReportRequest {
  findings: string;
  impression: string;
  recommendation?: string;
  reportDate?: string;
}

export interface RecordImagingPerformedRequest {
  performedModality?: string;
  performedProtocol?: string;
  performedContrast?: ImagingPerformedContrast;
  technologistName?: string;
  radiologistName?: string;
  performedAt?: string;
  imageQuality?: ImagingImageQuality;
}

export interface UpdateImagingStatusRequest {
  status: ImagingStatus;
}

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface ImagingListResponse {
  items: ImagingOrderListItem[];
  page: number;
  limit: number;
  total: number;
}

// ═════════════════════════════════════════════════════════════
// RADIOLOGIST QUEUE DTOs
//
// These come from the top-level `/imaging/*` endpoints — they are
// NOT patient-scoped, so the shapes are slightly different from
// the patient-scoped list above.
// ═════════════════════════════════════════════════════════════

export interface PendingImagingOrder {
  id: number;
  patientId: number;
  patientName: string;
  patientDisplayId?: string | null;

  modality: string;
  bodyRegion: string;
  specificSite?: string | null;
  provisionalDiagnosis?: string | null;
  specialClinicalQuestion?: string | null;

  requestingClinician: string;
  orderedById: number;

  priority: ImagingPriority;
  dateOrdered: string;
  status: ImagingStatus;
}

export interface ImagingOrderDetail extends PendingImagingOrder {
  age?: number;
  sex?: string;
  laterality?: string;
  presentingSymptoms?: string | null;
  findings?: string | null;
  impression?: string | null;
  recommendation?: string | null;
  reportDate?: string | null;
}

export interface ImagingQueueListResponse {
  items: PendingImagingOrder[];
  page: number;
  limit: number;
  total: number;
}

export interface SubmitImagingReportRequest {
  findings: string;
  impression: string;
  recommendation?: string;
}

export interface SubmitImagingReportResponse {
  id: number;
  status: 'Completed';
  findings: string;
  impression: string;
  recommendation?: string | null;
  reportDate: string;
}