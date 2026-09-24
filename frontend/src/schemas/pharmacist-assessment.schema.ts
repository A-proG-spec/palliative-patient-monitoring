import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM helpers
// ═════════════════════════════════════════════════════════════

const pharmacistAssessmentTypeEnum = z.enum([
  'Admission',
  'FollowUp',
  'MedicationReview',
]);

const pharmacistWeightStatusEnum = z.enum([
  'Good',
  'Fair',
  'Poor',
  'Unknown',
]);

const pharmacistPainControlEnum = z.enum([
  'WellControlled',
  'PartiallyControlled',
  'PoorlyControlled',
]);

const pharmacistBreakthroughPainEnum = z.enum([
  'None',
  'Occasional',
  'Frequent',
]);

const pharmacistOpioidSideEffectEnum = z.enum([
  'Constipation',
  'Nausea',
  'Sedation',
  'Confusion',
  'RespiratoryDepression',
  'None',
]);

const pharmacistInteractionRiskEnum = z.enum([
  'None',
  'Possible',
  'Significant',
]);

const pharmacistHighRiskMedicationEnum = z.enum([
  'Opioids',
  'Benzodiazepines',
  'Anticoagulants',
  'Steroids',
  'Antiepileptics',
]);

const pharmacistOrganFunctionEnum = z.enum([
  'Normal',
  'Impaired',
  'Unknown',
]);

const pharmacistEffectivenessEnum = z.enum([
  'Good',
  'Fair',
  'Poor',
]);

const pharmacistADRSeverityEnum = z.enum([
  'Mild',
  'Moderate',
  'Severe',
]);

const pharmacistADRActionEnum = z.enum([
  'DoseAdjustment',
  'DrugDiscontinued',
  'SymptomaticTreatment',
  'ReportedToCommittee',
]);

const pharmacistBowelFunctionEnum = z.enum([
  'Normal',
  'Constipated',
  'SevereConstipation',
]);

const pharmacistDoseAdjustmentReasonEnum = z.enum([
  'RenalImpairment',
  'HepaticImpairment',
  'ElderlyDosing',
  'WeightBasedAdjustment',
]);

const pharmacistPatientUnderstandingEnum = z.enum([
  'Good',
  'Moderate',
  'Poor',
]);

const pharmacistCounselingTopicEnum = z.enum([
  'PainMedications',
  'OpioidSafety',
  'SideEffects',
  'Adherence',
  'ConstipationPrevention',
  'EndOfLifeMedications',
]);

const pharmacistMedicationPlanActionEnum = z.enum([
  'OptimizeAnalgesicRegimen',
  'StartAdjustLaxatives',
  'ManageNauseaVomiting',
  'ReviewPolypharmacy',
  'ReduceUnnecessaryMedications',
  'InitiateAdjuvantTherapy',
  'MonitorSedationLevel',
  'Other',
]);

const pharmacistMedicationAvailabilityEnum = z.enum([
  'AllAvailable',
  'PartiallyAvailable',
  'NotAvailable',
]);

const pharmacistSummaryFlagEnum = z.enum([
  'MedicationRegimenAppropriate',
  'RequiresOptimization',
  'RequiresUrgentIntervention',
  'HighRiskMedicationProfile',
  'DeprescribingRecommended',
  'OngoingMonitoringRequired',
]);

const pharmacistFinalRecommendationEnum = z.enum([
  'ContinueCurrentRegimen',
  'ModifyAnalgesicPlan',
  'InitiateSymptomControlMedications',
  'DeprescribeNonEssentialMedications',
  'EnhanceSafetyMonitoring',
  'MultidisciplinaryReviewRequired',
]);

// ═════════════════════════════════════════════════════════════
// Utility
// ═════════════════════════════════════════════════════════════

/**
 * Optional enum that tolerates the empty-string Select placeholder.
 */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);

// ═════════════════════════════════════════════════════════════
// Child rows
// ═════════════════════════════════════════════════════════════

const pharmacistMedicationRowSchema = z.object({
  name: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  indication: z.string().default(''),
});

// ═════════════════════════════════════════════════════════════
// CREATE — full form schema
// ═════════════════════════════════════════════════════════════

export const createPharmacistAssessmentSchema = z.object({
  // Header
  assessmentType: pharmacistAssessmentTypeEnum,

  // Patient snapshot
  weightKg: optionalNumber,
  allergies: z.string().trim().optional(),
  wardUnit: z.string().trim().optional(),

  // Medication history
  otcHerbalUsed: z.boolean().default(false),
  otcHerbalDetails: z.string().trim().optional(),
  medicationHistoryAdherence: optionalEnum([
    'Good',
    'Fair',
    'Poor',
    'Unknown',
  ] as const),

  hasAdrHistory: z.boolean().default(false),
  adrHistoryDetails: z.string().trim().optional(),

  // Pain management review
  analgesicNonOpioids: z.boolean().default(false),
  analgesicWeakOpioids: z.boolean().default(false),
  analgesicStrongOpioids: z.boolean().default(false),
  analgesicAdjuvants: z.boolean().default(false),
  analgesicOtherDetails: z.string().trim().optional(),

  painControl: optionalEnum([
    'WellControlled',
    'PartiallyControlled',
    'PoorlyControlled',
  ] as const),
  breakthroughPain: optionalEnum([
    'None',
    'Occasional',
    'Frequent',
  ] as const),
  opioidSideEffects: z
    .array(pharmacistOpioidSideEffectEnum)
    .optional()
    .default([]),

  // Medication safety
  drugDrugInteractions: optionalEnum([
    'None',
    'Possible',
    'Significant',
  ] as const),
  drugDrugInteractionDetails: z.string().trim().optional(),
  drugDiseaseInteractions: z.boolean().default(false),
  drugDiseaseInteractionDetails: z.string().trim().optional(),
  highRiskMedications: z
    .array(pharmacistHighRiskMedicationEnum)
    .optional()
    .default([]),

  // Renal & hepatic
  renalFunction: optionalEnum([
    'Normal',
    'Impaired',
    'Unknown',
  ] as const),
  creatinine: z.string().trim().optional(),
  hepaticFunction: optionalEnum([
    'Normal',
    'Impaired',
    'Unknown',
  ] as const),
  lfts: z.string().trim().optional(),

  // Symptom effectiveness — map of symptom → effectiveness
  symptomMedicationEffectiveness: z
    .record(
      z.string(),
      z.union([pharmacistEffectivenessEnum, z.literal('')]),
    )
    .optional()
    .default({}),

  // ADR
  suspectedAdr: z.boolean().default(false),
  suspectedAdrDrug: z.string().trim().optional(),
  suspectedAdrReaction: z.string().trim().optional(),
  adrSeverity: optionalEnum(['Mild', 'Moderate', 'Severe'] as const),
  adrManagement: z
    .array(pharmacistADRActionEnum)
    .optional()
    .default([]),

  // Constipation
  bowelFunction: optionalEnum([
    'Normal',
    'Constipated',
    'SevereConstipation',
  ] as const),
  laxativeUse: z.boolean().default(false),
  laxativeDetails: z.string().trim().optional(),

  // Dose adjustment
  doseAdjustmentRequired: z.boolean().default(false),
  doseAdjustmentReasons: z
    .array(pharmacistDoseAdjustmentReasonEnum)
    .optional()
    .default([]),

  // Counselling
  patientUnderstanding: optionalEnum([
    'Good',
    'Moderate',
    'Poor',
  ] as const),
  counselingTopics: z
    .array(pharmacistCounselingTopicEnum)
    .optional()
    .default([]),

  // Plan
  currentIssuesIdentified: z.string().trim().optional(),
  medicationPlanActions: z
    .array(pharmacistMedicationPlanActionEnum)
    .optional()
    .default([]),
  medicationPlanOther: z.string().trim().optional(),

  // Access & supply
  medicationAvailability: optionalEnum([
    'AllAvailable',
    'PartiallyAvailable',
    'NotAvailable',
  ] as const),
  financialBarriers: z.boolean().default(false),
  pharmacyIntervention: z.boolean().default(false),

  // Summary
  pharmacistSummary: z.string().trim().optional(),
  summaryFlags: z
    .array(pharmacistSummaryFlagEnum)
    .optional()
    .default([]),
  finalRecommendations: z
    .array(pharmacistFinalRecommendationEnum)
    .optional()
    .default([]),
  clinicalPharmacistName: z.string().trim().optional(),

  // Children
  currentMedications: z
    .array(pharmacistMedicationRowSchema)
    .optional()
    .default([]),
});

export type CreatePharmacistAssessmentFormData = z.infer<
  typeof createPharmacistAssessmentSchema
>;