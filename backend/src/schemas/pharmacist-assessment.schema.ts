import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES — must mirror the Prisma enums exactly
// ═════════════════════════════════════════════════════════════

export const PHARMACIST_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'MedicationReview',
] as const;

export const PHARMACIST_WEIGHT_STATUS_VALUES = [
  'Good',
  'Fair',
  'Poor',
  'Unknown',
] as const;

export const PHARMACIST_PAIN_CONTROL_VALUES = [
  'WellControlled',
  'PartiallyControlled',
  'PoorlyControlled',
] as const;

export const PHARMACIST_BREAKTHROUGH_PAIN_VALUES = [
  'None',
  'Occasional',
  'Frequent',
] as const;

export const PHARMACIST_OPIOID_SIDE_EFFECT_VALUES = [
  'Constipation',
  'Nausea',
  'Sedation',
  'Confusion',
  'RespiratoryDepression',
  'None',
] as const;

export const PHARMACIST_INTERACTION_RISK_VALUES = [
  'None',
  'Possible',
  'Significant',
] as const;

export const PHARMACIST_HIGH_RISK_MEDICATION_VALUES = [
  'Opioids',
  'Benzodiazepines',
  'Anticoagulants',
  'Steroids',
  'Antiepileptics',
] as const;

export const PHARMACIST_ORGAN_FUNCTION_VALUES = [
  'Normal',
  'Impaired',
  'Unknown',
] as const;

export const PHARMACIST_EFFECTIVENESS_VALUES = [
  'Good',
  'Fair',
  'Poor',
] as const;

export const PHARMACIST_ADR_SEVERITY_VALUES = [
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const PHARMACIST_ADR_ACTION_VALUES = [
  'DoseAdjustment',
  'DrugDiscontinued',
  'SymptomaticTreatment',
  'ReportedToCommittee',
] as const;

export const PHARMACIST_BOWEL_FUNCTION_VALUES = [
  'Normal',
  'Constipated',
  'SevereConstipation',
] as const;

export const PHARMACIST_DOSE_ADJUSTMENT_REASON_VALUES = [
  'RenalImpairment',
  'HepaticImpairment',
  'ElderlyDosing',
  'WeightBasedAdjustment',
] as const;

export const PHARMACIST_PATIENT_UNDERSTANDING_VALUES = [
  'Good',
  'Moderate',
  'Poor',
] as const;

export const PHARMACIST_COUNSELING_TOPIC_VALUES = [
  'PainMedications',
  'OpioidSafety',
  'SideEffects',
  'Adherence',
  'ConstipationPrevention',
  'EndOfLifeMedications',
] as const;

export const PHARMACIST_MEDICATION_PLAN_ACTION_VALUES = [
  'OptimizeAnalgesicRegimen',
  'StartAdjustLaxatives',
  'ManageNauseaVomiting',
  'ReviewPolypharmacy',
  'ReduceUnnecessaryMedications',
  'InitiateAdjuvantTherapy',
  'MonitorSedationLevel',
  'Other',
] as const;

export const PHARMACIST_MEDICATION_AVAILABILITY_VALUES = [
  'AllAvailable',
  'PartiallyAvailable',
  'NotAvailable',
] as const;

export const PHARMACIST_SUMMARY_FLAG_VALUES = [
  'MedicationRegimenAppropriate',
  'RequiresOptimization',
  'RequiresUrgentIntervention',
  'HighRiskMedicationProfile',
  'DeprescribingRecommended',
  'OngoingMonitoringRequired',
] as const;

export const PHARMACIST_FINAL_RECOMMENDATION_VALUES = [
  'ContinueCurrentRegimen',
  'ModifyAnalgesicPlan',
  'InitiateSymptomControlMedications',
  'DeprescribeNonEssentialMedications',
  'EnhanceSafetyMonitoring',
  'MultidisciplinaryReviewRequired',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const pharmacistMedicationRowSchema = z.object({
  name: z.string().trim().optional(),
  dose: z.string().trim().optional(),
  route: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  indication: z.string().trim().optional(),
});

/**
 * The form sends `symptomMedicationEffectiveness` as a map of
 * symptom name → effectiveness rating, e.g.:
 *   { pain: 'Good', nausea: 'Fair', constipation: 'Poor' }
 *
 * Values must be one of the PharmacistEffectiveness enum values
 * or an empty string (which gets stripped before saving).
 */
const symptomEffectivenessSchema = z
  .record(
    z.string(),
    z.union([
      z.enum(PHARMACIST_EFFECTIVENESS_VALUES),
      z.literal(''),
    ]),
  )
  .optional()
  .default({});

// ═════════════════════════════════════════════════════════════
// CREATE — full body schema
// ═════════════════════════════════════════════════════════════

export const createClinicalPharmacistAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(PHARMACIST_ASSESSMENT_TYPE_VALUES),

    // ── Patient snapshot (visit-specific) ──
    weightKg: z.number().positive().optional(),
    allergies: z.string().trim().optional(),
    wardUnit: z.string().trim().optional(),

    // ── Medication history ──
    otcHerbalUsed: z.boolean().optional().default(false),
    otcHerbalDetails: z.string().trim().optional(),
    medicationHistoryAdherence: z
      .enum(PHARMACIST_WEIGHT_STATUS_VALUES)
      .optional(),

    hasAdrHistory: z.boolean().optional().default(false),
    adrHistoryDetails: z.string().trim().optional(),

    // ── Pain management review ──
    analgesicNonOpioids: z.boolean().optional().default(false),
    analgesicWeakOpioids: z.boolean().optional().default(false),
    analgesicStrongOpioids: z.boolean().optional().default(false),
    analgesicAdjuvants: z.boolean().optional().default(false),
    analgesicOtherDetails: z.string().trim().optional(),

    painControl: z.enum(PHARMACIST_PAIN_CONTROL_VALUES).optional(),
    breakthroughPain: z
      .enum(PHARMACIST_BREAKTHROUGH_PAIN_VALUES)
      .optional(),
    opioidSideEffects: z
      .array(z.enum(PHARMACIST_OPIOID_SIDE_EFFECT_VALUES))
      .optional()
      .default([]),

    // ── Medication safety ──
    drugDrugInteractions: z
      .enum(PHARMACIST_INTERACTION_RISK_VALUES)
      .optional(),
    drugDrugInteractionDetails: z.string().trim().optional(),
    drugDiseaseInteractions: z.boolean().optional().default(false),
    drugDiseaseInteractionDetails: z.string().trim().optional(),
    highRiskMedications: z
      .array(z.enum(PHARMACIST_HIGH_RISK_MEDICATION_VALUES))
      .optional()
      .default([]),

    // ── Renal & hepatic ──
    renalFunction: z.enum(PHARMACIST_ORGAN_FUNCTION_VALUES).optional(),
    creatinine: z.string().trim().optional(),
    hepaticFunction: z.enum(PHARMACIST_ORGAN_FUNCTION_VALUES).optional(),
    lfts: z.string().trim().optional(),

    // ── Symptom-related medication review ──
    symptomMedicationEffectiveness: symptomEffectivenessSchema,

    // ── ADR ──
    suspectedAdr: z.boolean().optional().default(false),
    suspectedAdrDrug: z.string().trim().optional(),
    suspectedAdrReaction: z.string().trim().optional(),
    adrSeverity: z.enum(PHARMACIST_ADR_SEVERITY_VALUES).optional(),
    adrManagement: z
      .array(z.enum(PHARMACIST_ADR_ACTION_VALUES))
      .optional()
      .default([]),

    // ── Constipation ──
    bowelFunction: z.enum(PHARMACIST_BOWEL_FUNCTION_VALUES).optional(),
    laxativeUse: z.boolean().optional().default(false),
    laxativeDetails: z.string().trim().optional(),

    // ── Dose adjustment ──
    doseAdjustmentRequired: z.boolean().optional().default(false),
    doseAdjustmentReasons: z
      .array(z.enum(PHARMACIST_DOSE_ADJUSTMENT_REASON_VALUES))
      .optional()
      .default([]),

    // ── Counselling ──
    patientUnderstanding: z
      .enum(PHARMACIST_PATIENT_UNDERSTANDING_VALUES)
      .optional(),
    counselingTopics: z
      .array(z.enum(PHARMACIST_COUNSELING_TOPIC_VALUES))
      .optional()
      .default([]),

    // ── Medication plan ──
    currentIssuesIdentified: z.string().trim().optional(),
    medicationPlanActions: z
      .array(z.enum(PHARMACIST_MEDICATION_PLAN_ACTION_VALUES))
      .optional()
      .default([]),
    medicationPlanOther: z.string().trim().optional(),

    // ── Access & supply ──
    medicationAvailability: z
      .enum(PHARMACIST_MEDICATION_AVAILABILITY_VALUES)
      .optional(),
    financialBarriers: z.boolean().optional().default(false),
    pharmacyIntervention: z.boolean().optional().default(false),

    // ── Summary ──
    pharmacistSummary: z.string().trim().optional(),
    summaryFlags: z
      .array(z.enum(PHARMACIST_SUMMARY_FLAG_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(PHARMACIST_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),

    // ── Sign-off ──
    clinicalPharmacistName: z.string().trim().optional(),

    // ── Current medications (child rows) ──
    currentMedications: z
      .array(pharmacistMedicationRowSchema)
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE — all body fields optional
// ═════════════════════════════════════════════════════════════

export const updateClinicalPharmacistAssessmentSchema = z.object({
  body: createClinicalPharmacistAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getPharmacistAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getPharmacistAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getPharmacistAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PHARMACIST_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllPharmacistAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PHARMACIST_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deletePharmacistAssessmentSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().max(500).optional(),
    })
    .optional()
    .default({}),
});

// ═════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════

export type CreateClinicalPharmacistAssessmentSchema = z.infer<
  typeof createClinicalPharmacistAssessmentSchema
>;
export type UpdateClinicalPharmacistAssessmentSchema = z.infer<
  typeof updateClinicalPharmacistAssessmentSchema
>;
export type GetPharmacistAssessmentParamsSchema = z.infer<
  typeof getPharmacistAssessmentParamsSchema
>;
export type GetPharmacistAssessmentQuerySchema = z.infer<
  typeof getPharmacistAssessmentQuerySchema
>;