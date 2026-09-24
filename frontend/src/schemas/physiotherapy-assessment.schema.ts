import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// Utility
// ═════════════════════════════════════════════════════════════

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);

const optionalScore = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().int().min(0).max(5).optional(),
);

// ═════════════════════════════════════════════════════════════
// Child rows
// ═════════════════════════════════════════════════════════════

const physiotherapyAdlRowSchema = z.object({
  activity: z.enum([
    'BedMobility',
    'Feeding',
    'Bathing',
    'Dressing',
    'Toileting',
  ]),
  level: optionalEnum([
    'Independent',
    'Assisted',
    'Dependent',
  ] as const),
});

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════

export const createPhysiotherapyAssessmentSchema = z.object({
  assessmentType: z.enum([
    'Admission',
    'FollowUp',
    'Reassessment',
  ]),

  // Medical overview
  comorbidities: z
    .array(
      z.enum([
        'Hypertension',
        'DiabetesMellitus',
        'Stroke',
        'COPD',
        'HeartFailure',
        'Cancer',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  comorbidityOther: z.string().trim().optional(),
  generalCondition: optionalEnum([
    'Stable',
    'Deteriorating',
    'Bedbound',
    'TerminalPhase',
  ] as const),

  // Pain & symptom
  painLevel: optionalNumber,
  painTypes: z
    .array(
      z.enum([
        'Musculoskeletal',
        'Neuropathic',
        'CancerRelated',
        'Mixed',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  painTypeOther: z.string().trim().optional(),
  symptoms: z
    .array(
      z.enum([
        'Fatigue',
        'Dyspnea',
        'Weakness',
        'MuscleStiffness',
        'BalanceProblems',
        'Contractures',
      ]),
    )
    .optional()
    .default([]),

  // Mobility
  mobilityStatus: optionalEnum([
    'Independent',
    'RequiresAssistance',
    'WheelchairBound',
    'Bedridden',
  ] as const),
  transferAbility: optionalEnum([
    'Independent',
    'MinimalAssistance',
    'ModerateAssistance',
    'Dependent',
  ] as const),
  walkingAbility: optionalEnum([
    'Normal',
    'ReducedDistance',
    'WithAid',
    'UnableToWalk',
  ] as const),
  assistiveDevices: z
    .array(
      z.enum(['None', 'Cane', 'Walker', 'Wheelchair', 'Other']),
    )
    .optional()
    .default([]),
  assistiveDeviceOther: z.string().trim().optional(),

  // Musculoskeletal
  upperLimbStrength: optionalScore,
  lowerLimbStrength: optionalScore,
  rangeOfMotion: optionalEnum([
    'Full',
    'Reduced',
    'SeverelyLimited',
  ] as const),
  jointPainOrStiffness: optionalEnum(['None', 'Present'] as const),
  jointPainLocation: z.string().trim().optional(),

  // Neurological
  consciousness: optionalEnum([
    'Alert',
    'Drowsy',
    'Confused',
  ] as const),
  coordination: optionalEnum(['Normal', 'Impaired'] as const),
  sensoryDeficit: optionalEnum(['None', 'Present'] as const),
  balance: optionalEnum([
    'Stable',
    'Unstable',
    'HighFallRisk',
  ] as const),

  // Respiratory
  breathingPattern: optionalEnum([
    'Normal',
    'Shallow',
    'Labored',
  ] as const),
  breathlessnessLevel: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  chestExpansion: optionalEnum(['Normal', 'Reduced'] as const),
  respiratoryNeeds: z
    .array(
      z.enum([
        'BreathingExercises',
        'ChestPhysiotherapy',
        'PositioningSupport',
      ]),
    )
    .optional()
    .default([]),

  // Pressure injury
  pressureRisk: optionalEnum(['Low', 'Moderate', 'High'] as const),
  pressureAreas: z
    .array(
      z.enum(['None', 'Sacrum', 'Heels', 'Hips', 'Other']),
    )
    .optional()
    .default([]),
  pressureAreaOther: z.string().trim().optional(),
  pressurePreventions: z
    .array(
      z.enum([
        'Repositioning',
        'PressureMattress',
        'SkinCareEducation',
        'PassiveExercises',
      ]),
    )
    .optional()
    .default([]),

  // ADL
  adl: z.array(physiotherapyAdlRowSchema).optional().default([]),

  // Fall risk
  fallHistory: z.boolean().optional(),
  fallRiskLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),
  fallContributors: z
    .array(
      z.enum([
        'Weakness',
        'BalanceIssues',
        'SedativeMedication',
        'EnvironmentalHazards',
        'PosturalHypotension',
      ]),
    )
    .optional()
    .default([]),

  // Diagnosis
  diagnosis: z
    .array(
      z.enum([
        'DecreasedMobility',
        'MuscleWeakness',
        'ImpairedBalance',
        'ReducedEndurance',
        'JointStiffness',
        'RiskOfContractures',
        'ReducedFunctionalIndependence',
      ]),
    )
    .optional()
    .default([]),

  // Care plan
  goals: z.string().trim().optional(),
  interventions: z
    .array(
      z.enum([
        'PassiveRangeOfMotionExercises',
        'ActiveAssistedExercises',
        'BreathingExercises',
        'PositioningProgram',
        'PainReductionTechniques',
        'MobilityTraining',
        'SittingBalanceTraining',
        'WalkingAssistance',
        'FamilyCaregiverTraining',
      ]),
    )
    .optional()
    .default([]),
  frequency: z
    .array(
      z.enum([
        'Daily',
        'ThreeToFiveTimesPerWeek',
        'Weekly',
        'AsTolerated',
      ]),
    )
    .optional()
    .default([]),
  equipment: z
    .array(
      z.enum([
        'Wheelchair',
        'WalkingFrame',
        'Crutches',
        'PressureMattress',
        'BedRails',
        'TransferBoard',
        'None',
      ]),
    )
    .optional()
    .default([]),
  caregiverTrainings: z
    .array(
      z.enum([
        'PositioningTechniques',
        'SafeTransfers',
        'ExerciseAssistance',
        'FallPrevention',
        'PressureSorePrevention',
        'MobilitySupport',
      ]),
    )
    .optional()
    .default([]),

  // Summary
  outcome: z
    .array(
      z.enum([
        'FullyIndependent',
        'RehabilitationNotRequired',
        'RequiresSupportivePhysiotherapy',
        'RequiresIntensiveMobilitySupport',
        'HighRiskForFunctionalDecline',
        'PalliativeComfortFocusedPhysiotherapyRequired',
      ]),
    )
    .optional()
    .default([]),
  finalRecommendations: z
    .array(
      z.enum([
        'ComfortFocusedPhysiotherapy',
        'MobilityMaintenanceExercises',
        'PainReliefPositioningTherapy',
        'BreathingExercises',
        'CaregiverTraining',
        'MultidisciplinaryHospiceCarePlan',
      ]),
    )
    .optional()
    .default([]),
});

export type CreatePhysiotherapyAssessmentFormData = z.infer<
  typeof createPhysiotherapyAssessmentSchema
>;