import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES
// ═════════════════════════════════════════════════════════════

export const PHYSIOTHERAPY_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'Reassessment',
] as const;

export const PHYSIOTHERAPY_COMORBIDITY_VALUES = [
  'Hypertension',
  'DiabetesMellitus',
  'Stroke',
  'COPD',
  'HeartFailure',
  'Cancer',
  'Other',
] as const;

export const PHYSIOTHERAPY_GENERAL_CONDITION_VALUES = [
  'Stable',
  'Deteriorating',
  'Bedbound',
  'TerminalPhase',
] as const;

export const PHYSIOTHERAPY_PAIN_TYPE_VALUES = [
  'Musculoskeletal',
  'Neuropathic',
  'CancerRelated',
  'Mixed',
  'Other',
] as const;

export const PHYSIOTHERAPY_SYMPTOM_VALUES = [
  'Fatigue',
  'Dyspnea',
  'Weakness',
  'MuscleStiffness',
  'BalanceProblems',
  'Contractures',
] as const;

export const PHYSIOTHERAPY_MOBILITY_STATUS_VALUES = [
  'Independent',
  'RequiresAssistance',
  'WheelchairBound',
  'Bedridden',
] as const;

export const PHYSIOTHERAPY_TRANSFER_ABILITY_VALUES = [
  'Independent',
  'MinimalAssistance',
  'ModerateAssistance',
  'Dependent',
] as const;

export const PHYSIOTHERAPY_WALKING_ABILITY_VALUES = [
  'Normal',
  'ReducedDistance',
  'WithAid',
  'UnableToWalk',
] as const;

export const PHYSIOTHERAPY_ASSISTIVE_DEVICE_VALUES = [
  'None',
  'Cane',
  'Walker',
  'Wheelchair',
  'Other',
] as const;

export const PHYSIOTHERAPY_RANGE_OF_MOTION_VALUES = [
  'Full',
  'Reduced',
  'SeverelyLimited',
] as const;

export const PHYSIOTHERAPY_JOINT_FINDING_VALUES = [
  'None',
  'Present',
] as const;

export const PHYSIOTHERAPY_CONSCIOUSNESS_VALUES = [
  'Alert',
  'Drowsy',
  'Confused',
] as const;

export const PHYSIOTHERAPY_COORDINATION_VALUES = [
  'Normal',
  'Impaired',
] as const;

export const PHYSIOTHERAPY_SENSORY_DEFICIT_VALUES = [
  'None',
  'Present',
] as const;

export const PHYSIOTHERAPY_BALANCE_VALUES = [
  'Stable',
  'Unstable',
  'HighFallRisk',
] as const;

export const PHYSIOTHERAPY_BREATHING_PATTERN_VALUES = [
  'Normal',
  'Shallow',
  'Labored',
] as const;

export const PHYSIOTHERAPY_BREATHLESSNESS_LEVEL_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const PHYSIOTHERAPY_CHEST_EXPANSION_VALUES = [
  'Normal',
  'Reduced',
] as const;

export const PHYSIOTHERAPY_RESPIRATORY_NEED_VALUES = [
  'BreathingExercises',
  'ChestPhysiotherapy',
  'PositioningSupport',
] as const;

export const PHYSIOTHERAPY_PRESSURE_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const PHYSIOTHERAPY_PRESSURE_AREA_VALUES = [
  'None',
  'Sacrum',
  'Heels',
  'Hips',
  'Other',
] as const;

export const PHYSIOTHERAPY_PRESSURE_PREVENTION_VALUES = [
  'Repositioning',
  'PressureMattress',
  'SkinCareEducation',
  'PassiveExercises',
] as const;

export const PHYSIOTHERAPY_ADL_ACTIVITY_VALUES = [
  'BedMobility',
  'Feeding',
  'Bathing',
  'Dressing',
  'Toileting',
] as const;

export const PHYSIOTHERAPY_ADL_LEVEL_VALUES = [
  'Independent',
  'Assisted',
  'Dependent',
] as const;

export const PHYSIOTHERAPY_FALL_RISK_LEVEL_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const PHYSIOTHERAPY_FALL_CONTRIBUTOR_VALUES = [
  'Weakness',
  'BalanceIssues',
  'SedativeMedication',
  'EnvironmentalHazards',
  'PosturalHypotension',
] as const;

export const PHYSIOTHERAPY_DIAGNOSIS_VALUES = [
  'DecreasedMobility',
  'MuscleWeakness',
  'ImpairedBalance',
  'ReducedEndurance',
  'JointStiffness',
  'RiskOfContractures',
  'ReducedFunctionalIndependence',
] as const;

export const PHYSIOTHERAPY_INTERVENTION_VALUES = [
  'PassiveRangeOfMotionExercises',
  'ActiveAssistedExercises',
  'BreathingExercises',
  'PositioningProgram',
  'PainReductionTechniques',
  'MobilityTraining',
  'SittingBalanceTraining',
  'WalkingAssistance',
  'FamilyCaregiverTraining',
] as const;

export const PHYSIOTHERAPY_FREQUENCY_VALUES = [
  'Daily',
  'ThreeToFiveTimesPerWeek',
  'Weekly',
  'AsTolerated',
] as const;

export const PHYSIOTHERAPY_EQUIPMENT_VALUES = [
  'Wheelchair',
  'WalkingFrame',
  'Crutches',
  'PressureMattress',
  'BedRails',
  'TransferBoard',
  'None',
] as const;

export const PHYSIOTHERAPY_CAREGIVER_TRAINING_VALUES = [
  'PositioningTechniques',
  'SafeTransfers',
  'ExerciseAssistance',
  'FallPrevention',
  'PressureSorePrevention',
  'MobilitySupport',
] as const;

export const PHYSIOTHERAPY_OUTCOME_VALUES = [
  'FullyIndependent',
  'RehabilitationNotRequired',
  'RequiresSupportivePhysiotherapy',
  'RequiresIntensiveMobilitySupport',
  'HighRiskForFunctionalDecline',
  'PalliativeComfortFocusedPhysiotherapyRequired',
] as const;

export const PHYSIOTHERAPY_FINAL_RECOMMENDATION_VALUES = [
  'ComfortFocusedPhysiotherapy',
  'MobilityMaintenanceExercises',
  'PainReliefPositioningTherapy',
  'BreathingExercises',
  'CaregiverTraining',
  'MultidisciplinaryHospiceCarePlan',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const physiotherapyAdlRowSchema = z.object({
  activity: z.enum(PHYSIOTHERAPY_ADL_ACTIVITY_VALUES),
  level: z.enum(PHYSIOTHERAPY_ADL_LEVEL_VALUES).optional(),
});

// ═════════════════════════════════════════════════════════════
// CREATE — full body schema
// ═════════════════════════════════════════════════════════════

export const createPhysiotherapyAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(PHYSIOTHERAPY_ASSESSMENT_TYPE_VALUES),

    // ── Medical overview ──
    comorbidities: z
      .array(z.enum(PHYSIOTHERAPY_COMORBIDITY_VALUES))
      .optional()
      .default([]),
    comorbidityOther: z.string().trim().optional(),
    generalCondition: z
      .enum(PHYSIOTHERAPY_GENERAL_CONDITION_VALUES)
      .optional(),

    // ── Pain & symptom status ──
    painLevel: z.number().int().min(0).max(10).optional(),
    painTypes: z
      .array(z.enum(PHYSIOTHERAPY_PAIN_TYPE_VALUES))
      .optional()
      .default([]),
    painTypeOther: z.string().trim().optional(),
    symptoms: z
      .array(z.enum(PHYSIOTHERAPY_SYMPTOM_VALUES))
      .optional()
      .default([]),

    // ── Functional mobility ──
    mobilityStatus: z
      .enum(PHYSIOTHERAPY_MOBILITY_STATUS_VALUES)
      .optional(),
    transferAbility: z
      .enum(PHYSIOTHERAPY_TRANSFER_ABILITY_VALUES)
      .optional(),
    walkingAbility: z
      .enum(PHYSIOTHERAPY_WALKING_ABILITY_VALUES)
      .optional(),
    assistiveDevices: z
      .array(z.enum(PHYSIOTHERAPY_ASSISTIVE_DEVICE_VALUES))
      .optional()
      .default([]),
    assistiveDeviceOther: z.string().trim().optional(),

    // ── Musculoskeletal ──
    upperLimbStrength: z.number().int().min(0).max(5).optional(),
    lowerLimbStrength: z.number().int().min(0).max(5).optional(),
    rangeOfMotion: z
      .enum(PHYSIOTHERAPY_RANGE_OF_MOTION_VALUES)
      .optional(),
    jointPainOrStiffness: z
      .enum(PHYSIOTHERAPY_JOINT_FINDING_VALUES)
      .optional(),
    jointPainLocation: z.string().trim().optional(),

    // ── Neurological ──
    consciousness: z.enum(PHYSIOTHERAPY_CONSCIOUSNESS_VALUES).optional(),
    coordination: z.enum(PHYSIOTHERAPY_COORDINATION_VALUES).optional(),
    sensoryDeficit: z
      .enum(PHYSIOTHERAPY_SENSORY_DEFICIT_VALUES)
      .optional(),
    balance: z.enum(PHYSIOTHERAPY_BALANCE_VALUES).optional(),

    // ── Respiratory ──
    breathingPattern: z
      .enum(PHYSIOTHERAPY_BREATHING_PATTERN_VALUES)
      .optional(),
    breathlessnessLevel: z
      .enum(PHYSIOTHERAPY_BREATHLESSNESS_LEVEL_VALUES)
      .optional(),
    chestExpansion: z
      .enum(PHYSIOTHERAPY_CHEST_EXPANSION_VALUES)
      .optional(),
    respiratoryNeeds: z
      .array(z.enum(PHYSIOTHERAPY_RESPIRATORY_NEED_VALUES))
      .optional()
      .default([]),

    // ── Pressure injury risk ──
    pressureRisk: z.enum(PHYSIOTHERAPY_PRESSURE_RISK_VALUES).optional(),
    pressureAreas: z
      .array(z.enum(PHYSIOTHERAPY_PRESSURE_AREA_VALUES))
      .optional()
      .default([]),
    pressureAreaOther: z.string().trim().optional(),
    pressurePreventions: z
      .array(z.enum(PHYSIOTHERAPY_PRESSURE_PREVENTION_VALUES))
      .optional()
      .default([]),

    // ── ADL ──
    adl: z.array(physiotherapyAdlRowSchema).optional().default([]),

    // ── Fall risk ──
    fallHistory: z.boolean().optional(),
    fallRiskLevel: z
      .enum(PHYSIOTHERAPY_FALL_RISK_LEVEL_VALUES)
      .optional(),
    fallContributors: z
      .array(z.enum(PHYSIOTHERAPY_FALL_CONTRIBUTOR_VALUES))
      .optional()
      .default([]),

    // ── Diagnosis ──
    diagnosis: z
      .array(z.enum(PHYSIOTHERAPY_DIAGNOSIS_VALUES))
      .optional()
      .default([]),

    // ── Care plan ──
    goals: z.string().trim().optional(),
    interventions: z
      .array(z.enum(PHYSIOTHERAPY_INTERVENTION_VALUES))
      .optional()
      .default([]),
    frequency: z
      .array(z.enum(PHYSIOTHERAPY_FREQUENCY_VALUES))
      .optional()
      .default([]),

    // ── Equipment ──
    equipment: z
      .array(z.enum(PHYSIOTHERAPY_EQUIPMENT_VALUES))
      .optional()
      .default([]),

    // ── Caregiver training ──
    caregiverTrainings: z
      .array(z.enum(PHYSIOTHERAPY_CAREGIVER_TRAINING_VALUES))
      .optional()
      .default([]),

    // ── Summary ──
    outcome: z
      .array(z.enum(PHYSIOTHERAPY_OUTCOME_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(PHYSIOTHERAPY_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════

export const updatePhysiotherapyAssessmentSchema = z.object({
  body: createPhysiotherapyAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getPhysiotherapyAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getPhysiotherapyAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getPhysiotherapyAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PHYSIOTHERAPY_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllPhysiotherapyAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PHYSIOTHERAPY_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deletePhysiotherapyAssessmentSchema = z.object({
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

export type CreatePhysiotherapyAssessmentSchema = z.infer<
  typeof createPhysiotherapyAssessmentSchema
>;
export type UpdatePhysiotherapyAssessmentSchema = z.infer<
  typeof updatePhysiotherapyAssessmentSchema
>;
export type GetPhysiotherapyAssessmentParamsSchema = z.infer<
  typeof getPhysiotherapyAssessmentParamsSchema
>;
export type GetPhysiotherapyAssessmentQuerySchema = z.infer<
  typeof getPhysiotherapyAssessmentQuerySchema
>;