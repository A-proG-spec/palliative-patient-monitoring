import { z } from 'zod';

export const createImagingSchema = z.object({
  body: z.object({
    // Section 2: Clinical Information
    provisionalDiagnosis: z.string().optional(),
    presentingSymptoms: z.string().optional(),
    medicalHistory: z.string().optional(),
    previousImaging: z.boolean().default(false),
    previousImagingDetails: z.string().optional(),

    // Section 3: Imaging Examination Requested
    modality: z.enum([
      'XRay', 'Ultrasound', 'CT', 'MRI',
      'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine', 'Other',
    ]),
    modalityOtherText: z.string().optional(),
    bodyRegion: z.string().min(1, 'Body region is required'),
    bodyRegionOtherText: z.string().optional(),
    laterality: z.enum(['Right', 'Left', 'Bilateral', 'NotApplicable']).default('NotApplicable'),
    contrastRequested: z.enum(['No', 'Yes', 'ToBeDetermined', 'NotApplicable']).default('No'),

    // Section 4: Examination Details
    specificSite: z.string().optional(),
    protocolViews: z.string().optional(),
    specialClinicalQuestion: z.string().optional(),

    // Section 5: Contrast / Medication
    previousContrastReaction: z.boolean().default(false),
    previousContrastReactionDetails: z.string().optional(),
    knownAllergies: z.string().optional(),
    creatinine: z.string().optional(),
    egfr: z.string().optional(),
    otherRelevantMedicationOrCondition: z.string().optional(),

    // Section 6: Safety Screening
    pregnancyStatus: z.enum(['NotPregnant', 'Pregnant', 'PossiblyPregnant', 'NotApplicable']).default('NotApplicable'),
    implantedMedicalDevice: z.boolean().default(false),
    deviceImplantDetails: z.string().optional(),
    metallicForeignBody: z.enum(['No', 'Yes', 'Unknown']).default('No'),
    otherSafetyConsiderations: z.string().optional(),

    // Section 7: Patient Preparation
    preparation: z.array(z.enum([
      'None', 'Fasting', 'FullBladder', 'EmptyBladder', 'SpecialMedicationPreparation', 'Other',
    ])).optional().default([]),
    preparationInstructions: z.string().optional(),

    // Section 8: Priority
    priority: z.enum(['Routine', 'Urgent', 'Emergency']).default('Routine'),
    reasonForUrgency: z.string().optional(),

    // Section 9: Referring Clinician
    clinicianName: z.string().optional(),
    clinicianDepartment: z.string().optional(),
    clinicianLicenseNo: z.string().optional(),
    clinicianContact: z.string().optional(),
    clinicianSignature: z.string().optional(),
    clinicianSignedAt: z.string().datetime().optional(),

    // Meta from patient snapshot (optional — server fills from Patient)
    patientName: z.string().optional(),
    medicalRecordNo: z.string().optional(),
    wardClinic: z.string().optional(),
    contactNo: z.string().optional(),
  }),
});

export const updateImagingReportSchema = z.object({
  body: z.object({
    reportNo: z.string().optional(),
    findings: z.string().min(1, 'Findings are required'),
    impression: z.string().min(1, 'Impression is required'),
    recommendations: z.string().optional(),
    reportingPhysician: z.string().min(1, 'Reporting physician is required'),
    signature: z.string().optional(),
    reportDate: z.string().datetime().optional(),
    hospitalDepartmentStamp: z.string().optional(),
  }),
});

export const recordImagingPerformedSchema = z.object({
  body: z.object({
    performedModality: z.string().optional(),
    performedProtocol: z.string().optional(),
    performedContrast: z.enum(['None', 'Administered', 'NotAdministered']).default('None'),
    technologistName: z.string().optional(),
    radiologistName: z.string().optional(),
    performedAt: z.string().datetime().optional(),
    imageQuality: z.enum(['Diagnostic', 'Limited', 'NonDiagnostic', 'RepeatRequired']).optional(),
  }),
});

export const updateImagingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Ordered', 'Completed', 'Cancelled']),
  }),
});

export const getImagingQuerySchema = z.object({
  query: z.object({
    status: z.enum(['Ordered', 'Completed', 'Cancelled']).optional(),
    modality: z.enum([
      'XRay', 'Ultrasound', 'CT', 'MRI',
      'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine', 'Other',
    ]).optional(),
    priority: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export type CreateImagingSchema = z.infer<typeof createImagingSchema>;
export type UpdateImagingReportSchema = z.infer<typeof updateImagingReportSchema>;
export type RecordImagingPerformedSchema = z.infer<typeof recordImagingPerformedSchema>;
export type UpdateImagingStatusSchema = z.infer<typeof updateImagingStatusSchema>;
export type GetImagingQuerySchema = z.infer<typeof getImagingQuerySchema>;