import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Fragments — mirror backend `imaging.schema.ts`
// ─────────────────────────────────────────────────────────────
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)');

const dateTimeString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime());

/**
 * Coerces the string "true" / "false" (what RHF sends from radio
 * inputs) into a real boolean. Passes real booleans through.
 */
const booleanFromRadio = z.preprocess(
  (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean(),
);

/**
 * Optional string that coerces '' → undefined.
 */
const optionalString = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional(),
);

// ─────────────────────────────────────────────────────────────
// Shared enums
// ─────────────────────────────────────────────────────────────
export const IMAGING_MODALITY_VALUES = [
  'XRay',
  'Ultrasound',
  'CT',
  'MRI',
  'Mammography',
  'Fluoroscopy',
  'Interventional',
  'NuclearMedicine',
  'Other',
] as const;

export const IMAGING_LATERALITY_VALUES = [
  'Right',
  'Left',
  'Bilateral',
  'NotApplicable',
] as const;

export const IMAGING_CONTRAST_DECISION_VALUES = [
  'No',
  'Yes',
  'ToBeDetermined',
  'NotApplicable',
] as const;

export const IMAGING_PREGNANCY_STATUS_VALUES = [
  'NotPregnant',
  'Pregnant',
  'PossiblyPregnant',
  'NotApplicable',
] as const;

export const IMAGING_METALLIC_FOREIGN_BODY_VALUES = [
  'No',
  'Yes',
  'Unknown',
] as const;

export const IMAGING_PRIORITY_VALUES = [
  'Routine',
  'Urgent',
  'Emergency',
] as const;

export const IMAGING_PREPARATION_VALUES = [
  'None',
  'Fasting',
  'FullBladder',
  'EmptyBladder',
  'SpecialMedicationPreparation',
  'Other',
] as const;

export const IMAGING_IMAGE_QUALITY_VALUES = [
  'Diagnostic',
  'Limited',
  'NonDiagnostic',
  'RepeatRequired',
] as const;

export const IMAGING_STATUS_VALUES = [
  'Ordered',
  'Completed',
  'Cancelled',
] as const;

export const IMAGING_PERFORMED_CONTRAST_VALUES = [
  'None',
  'Administered',
  'NotAdministered',
] as const;

// ─────────────────────────────────────────────────────────────
// Create Imaging Order — matches backend `createImagingSchema.body`
// ─────────────────────────────────────────────────────────────
export const createImagingSchema = z.object({
  // §2 Clinical Information
  provisionalDiagnosis: optionalString,
  presentingSymptoms: optionalString,
  medicalHistory: optionalString,
  previousImaging: booleanFromRadio.default(false),
  previousImagingDetails: optionalString,

  // §3 Imaging Examination Requested
  modality: z.enum(IMAGING_MODALITY_VALUES),
  modalityOtherText: optionalString,
  bodyRegion: z.string().min(1, 'Body region is required'),
  bodyRegionOtherText: optionalString,
  laterality: z.enum(IMAGING_LATERALITY_VALUES).default('NotApplicable'),
  contrastRequested: z
    .enum(IMAGING_CONTRAST_DECISION_VALUES)
    .default('No'),

  // §4 Examination Details
  specificSite: optionalString,
  protocolViews: optionalString,
  specialClinicalQuestion: optionalString,

  // §5 Contrast / Medication
  previousContrastReaction: booleanFromRadio.default(false),
  previousContrastReactionDetails: optionalString,
  knownAllergies: optionalString,
  creatinine: optionalString,
  egfr: optionalString,
  otherRelevantMedicationOrCondition: optionalString,

  // §6 Safety Screening
  pregnancyStatus: z
    .enum(IMAGING_PREGNANCY_STATUS_VALUES)
    .default('NotApplicable'),
  implantedMedicalDevice: booleanFromRadio.default(false),
  deviceImplantDetails: optionalString,
  metallicForeignBody: z
    .enum(IMAGING_METALLIC_FOREIGN_BODY_VALUES)
    .default('No'),
  otherSafetyConsiderations: optionalString,

  // §7 Patient Preparation
  preparation: z.array(z.enum(IMAGING_PREPARATION_VALUES)).optional().default([]),
  preparationInstructions: optionalString,

  // §8 Priority
  priority: z.enum(IMAGING_PRIORITY_VALUES).default('Routine'),
  reasonForUrgency: optionalString,

  // §9 Referring Clinician
  clinicianName: optionalString,
  clinicianDepartment: optionalString,
  clinicianLicenseNo: optionalString,
  clinicianContact: optionalString,

  // Meta from patient snapshot (server fills from Patient when omitted)
  patientName: optionalString,
  medicalRecordNo: optionalString,
  wardClinic: optionalString,
  contactNo: optionalString,
});

// ─────────────────────────────────────────────────────────────
// Update Imaging Report — matches backend `updateImagingReportSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateImagingReportSchema = z.object({
  findings: z.string().min(1, 'Findings are required'),
  impression: z.string().min(1, 'Impression is required'),
  recommendation: optionalString,
  reportDate: dateTimeString.optional(),
});

// ─────────────────────────────────────────────────────────────
// Record Imaging Performed — matches backend
// `recordImagingPerformedSchema.body`
// ─────────────────────────────────────────────────────────────
export const recordImagingPerformedSchema = z.object({
  performedModality: optionalString,
  performedProtocol: optionalString,
  performedContrast: z
    .enum(IMAGING_PERFORMED_CONTRAST_VALUES)
    .default('None'),
  technologistName: optionalString,
  radiologistName: optionalString,
  performedAt: dateTimeString.optional(),
  imageQuality: z.enum(IMAGING_IMAGE_QUALITY_VALUES).optional(),
});

// ─────────────────────────────────────────────────────────────
// Update Imaging Status — matches backend `updateImagingStatusSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateImagingStatusSchema = z.object({
  status: z.enum(IMAGING_STATUS_VALUES),
});

// ─────────────────────────────────────────────────────────────
// Query — matches backend `getImagingQuerySchema.query`
// ─────────────────────────────────────────────────────────────
export const getImagingQuerySchema = z.object({
  status: z.enum(IMAGING_STATUS_VALUES).optional(),
  modality: z.enum(IMAGING_MODALITY_VALUES).optional(),
  priority: z.enum(IMAGING_PRIORITY_VALUES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateImagingFormData = z.infer<typeof createImagingSchema>;
export type UpdateImagingReportFormData = z.infer<
  typeof updateImagingReportSchema
>;
export type RecordImagingPerformedFormData = z.infer<
  typeof recordImagingPerformedSchema
>;
export type UpdateImagingStatusFormData = z.infer<
  typeof updateImagingStatusSchema
>;
export type GetImagingQueryFormData = z.infer<typeof getImagingQuerySchema>;

export type ImagingModality = (typeof IMAGING_MODALITY_VALUES)[number];
export type ImagingLaterality = (typeof IMAGING_LATERALITY_VALUES)[number];
export type ImagingContrastDecision =
  (typeof IMAGING_CONTRAST_DECISION_VALUES)[number];
export type ImagingPregnancyStatus =
  (typeof IMAGING_PREGNANCY_STATUS_VALUES)[number];
export type ImagingPriority = (typeof IMAGING_PRIORITY_VALUES)[number];