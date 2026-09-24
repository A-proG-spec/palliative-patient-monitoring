import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES
// ═════════════════════════════════════════════════════════════

export const PAIN_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'EmergencyPainReview',
] as const;

export const PAIN_ONSET_VALUES = [
  'Acute',
  'Chronic',
  'Progressive',
] as const;

export const PAIN_LOCATION_VALUES = [
  'Head',
  'Chest',
  'Abdomen',
  'Back',
  'Pelvis',
  'Limbs',
  'MultipleSites',
  'Other',
] as const;

export const PAIN_DESCRIPTION_VALUES = [
  'Sharp',
  'Dull',
  'Burning',
  'Throbbing',
  'Cramping',
  'Shooting',
  'PressureLike',
] as const;

export const PAIN_TYPE_VALUES = [
  'NociceptiveSomatic',
  'Visceral',
  'Neuropathic',
  'Mixed',
  'BreakthroughPain',
] as const;

export const PAIN_PATTERN_VALUES = [
  'Continuous',
  'Intermittent',
  'BreakthroughEpisodes',
  'WorseAtNight',
  'MovementRelated',
] as const;

export const PAIN_AGGRAVATING_FACTOR_VALUES = [
  'Movement',
  'Coughing',
  'Eating',
  'Stress',
  'Positioning',
  'Unknown',
] as const;

export const PAIN_RELIEVING_FACTOR_VALUES = [
  'Rest',
  'Medication',
  'PositionChange',
  'HeatColdTherapy',
  'Massage',
  'Other',
] as const;

export const PAIN_OPIOID_USE_VALUES = [
  'None',
  'WeakOpioid',
  'StrongOpioid',
] as const;

export const PAIN_ADJUVANT_DRUG_VALUES = [
  'Antidepressants',
  'Anticonvulsants',
  'Steroids',
  'MuscleRelaxants',
] as const;

export const PAIN_BREAKTHROUGH_FREQUENCY_VALUES = [
  'None',
  'OneToTwoPerDay',
  'ThreeToFivePerDay',
  'Frequent',
] as const;

export const PAIN_RESCUE_EFFECTIVENESS_VALUES = [
  'Good',
  'Partial',
  'Poor',
] as const;

export const PAIN_IMPACT_AREA_VALUES = [
  'Mobility',
  'Sleep',
  'Appetite',
  'Mood',
  'DailyActivities',
] as const;

export const PAIN_IMPACT_SEVERITY_VALUES = [
  'NoImpact',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const PAIN_ASSOCIATED_SYMPTOM_VALUES = [
  'Nausea',
  'Vomiting',
  'Constipation',
  'Fatigue',
  'Anxiety',
  'Depression',
  'Dyspnea',
] as const;

export const PAIN_PATIENT_BEHAVIOR_VALUES = [
  'Comfortable',
  'Grimacing',
  'GuardingArea',
  'Restless',
  'Crying',
] as const;

export const PAIN_MANAGEMENT_BARRIER_VALUES = [
  'FearOfAddiction',
  'MedicationSideEffects',
  'PoorAdherence',
  'FinancialConstraints',
  'PoorAccessToOpioids',
  'CulturalBeliefs',
  'Other',
] as const;

export const PAIN_DIAGNOSIS_VALUES = [
  'ControlledPain',
  'PartiallyControlledPain',
  'UncontrolledPain',
  'ComplexPainSyndrome',
  'BreakthroughPainSyndrome',
] as const;

export const PAIN_INTERVENTION_VALUES = [
  'OptimizeOpioidTherapy',
  'AddAdjuvantAnalgesics',
  'AdjustDosingSchedule',
  'BreakthroughPainProtocol',
  'NonPharmacologicalTherapy',
  'PhysiotherapyReferral',
  'PsychologicalSupport',
] as const;

export const PAIN_NON_PHARMACOLOGICAL_METHOD_VALUES = [
  'Positioning',
  'RelaxationTechniques',
  'Massage',
  'HeatColdTherapy',
  'SpiritualSupport',
] as const;

export const PAIN_MONITORING_PLAN_VALUES = [
  'Daily',
  'EveryShift',
  'Weekly',
] as const;

export const PAIN_ASSESSMENT_OUTCOME_VALUES = [
  'PainWellControlled',
  'RequiresAdjustment',
  'RequiresUrgentIntervention',
  'ComplexPainManagementRequired',
  'MultidisciplinaryReviewNeeded',
] as const;

export const PAIN_FINAL_RECOMMENDATION_VALUES = [
  'ContinueCurrentRegimen',
  'IncreaseOpioidDose',
  'AddAdjuvantTherapy',
  'ManageBreakthroughPain',
  'IntegratePsychosocialSupport',
  'FullHospicePainProtocolActivation',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const painImpactRowSchema = z.object({
  area: z.enum(PAIN_IMPACT_AREA_VALUES),
  severity: z.enum(PAIN_IMPACT_SEVERITY_VALUES).optional(),
});

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════

export const createPainAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(PAIN_ASSESSMENT_TYPE_VALUES),

    // ── Pain history ──
    primaryPainComplaint: z.string().trim().optional(),
    painOnset: z.enum(PAIN_ONSET_VALUES).optional(),
    painDuration: z.string().trim().optional(),

    painLocations: z
      .array(z.enum(PAIN_LOCATION_VALUES))
      .optional()
      .default([]),
    painLocationOther: z.string().trim().optional(),
    painDescriptions: z
      .array(z.enum(PAIN_DESCRIPTION_VALUES))
      .optional()
      .default([]),

    // ── Severity (0–10 NRS) ──
    currentPainScore: z.number().int().min(0).max(10).optional(),
    worstPainLast24h: z.number().int().min(0).max(10).optional(),
    leastPainLast24h: z.number().int().min(0).max(10).optional(),

    // ── Type & pattern ──
    painType: z.array(z.enum(PAIN_TYPE_VALUES)).optional().default([]),
    painPattern: z.array(z.enum(PAIN_PATTERN_VALUES)).optional().default([]),

    // ── Aggravating & relieving factors ──
    aggravatingFactors: z
      .array(z.enum(PAIN_AGGRAVATING_FACTOR_VALUES))
      .optional()
      .default([]),
    relievingFactors: z
      .array(z.enum(PAIN_RELIEVING_FACTOR_VALUES))
      .optional()
      .default([]),
    relievingOther: z.string().trim().optional(),

    // ── Opioid use ──
    opioidUse: z.enum(PAIN_OPIOID_USE_VALUES).optional(),

    // ── Adjuvant drugs ──
    adjuvantDrugs: z
      .array(z.enum(PAIN_ADJUVANT_DRUG_VALUES))
      .optional()
      .default([]),

    // ── Breakthrough pain ──
    breakthroughFrequency: z
      .enum(PAIN_BREAKTHROUGH_FREQUENCY_VALUES)
      .optional(),
    rescueMedicationUsed: z.boolean().optional(),
    rescueEffectiveness: z
      .enum(PAIN_RESCUE_EFFECTIVENESS_VALUES)
      .optional(),

    // ── Associated symptoms ──
    associatedSymptoms: z
      .array(z.enum(PAIN_ASSOCIATED_SYMPTOM_VALUES))
      .optional()
      .default([]),

    // ── Clinical observation ──
    patientBehaviors: z
      .array(z.enum(PAIN_PATIENT_BEHAVIOR_VALUES))
      .optional()
      .default([]),

    // ── Barriers ──
    managementBarriers: z
      .array(z.enum(PAIN_MANAGEMENT_BARRIER_VALUES))
      .optional()
      .default([]),
    managementBarrierOther: z.string().trim().optional(),

    // ── Diagnosis ──
    diagnosis: z
      .array(z.enum(PAIN_DIAGNOSIS_VALUES))
      .optional()
      .default([]),

    // ── Management plan ──
    managementGoals: z.string().trim().optional(),
    interventions: z
      .array(z.enum(PAIN_INTERVENTION_VALUES))
      .optional()
      .default([]),
    nonPharmacologicalMethods: z
      .array(z.enum(PAIN_NON_PHARMACOLOGICAL_METHOD_VALUES))
      .optional()
      .default([]),
    monitoringPlan: z
      .array(z.enum(PAIN_MONITORING_PLAN_VALUES))
      .optional()
      .default([]),

    // ── Summary ──
    assessmentOutcome: z
      .array(z.enum(PAIN_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(PAIN_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),

    // ── Children ──
    impacts: z.array(painImpactRowSchema).optional().default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════

export const updatePainAssessmentSchema = z.object({
  body: createPainAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getPainAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getPainAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getPainAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PAIN_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllPainAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PAIN_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deletePainAssessmentSchema = z.object({
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

export type CreatePainAssessmentSchema = z.infer<
  typeof createPainAssessmentSchema
>;
export type UpdatePainAssessmentSchema = z.infer<
  typeof updatePainAssessmentSchema
>;
export type GetPainAssessmentParamsSchema = z.infer<
  typeof getPainAssessmentParamsSchema
>;
export type GetPainAssessmentQuerySchema = z.infer<
  typeof getPainAssessmentQuerySchema
>;