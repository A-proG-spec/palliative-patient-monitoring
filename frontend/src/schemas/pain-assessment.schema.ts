import { z } from 'zod';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const optionalScore = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().int().min(0).max(10).optional(),
);

const impactRowSchema = z.object({
  area: z.enum([
    'Mobility',
    'Sleep',
    'Appetite',
    'Mood',
    'DailyActivities',
  ]),
  severity: optionalEnum([
    'NoImpact',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
});

export const createPainAssessmentSchema = z.object({
  assessmentType: z.enum([
    'Admission',
    'FollowUp',
    'EmergencyPainReview',
  ]),

  // Pain history
  primaryPainComplaint: z.string().trim().optional(),
  painOnset: optionalEnum([
    'Acute',
    'Chronic',
    'Progressive',
  ] as const),
  painDuration: z.string().trim().optional(),
  painLocations: z
    .array(
      z.enum([
        'Head',
        'Chest',
        'Abdomen',
        'Back',
        'Pelvis',
        'Limbs',
        'MultipleSites',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  painLocationOther: z.string().trim().optional(),
  painDescriptions: z
    .array(
      z.enum([
        'Sharp',
        'Dull',
        'Burning',
        'Throbbing',
        'Cramping',
        'Shooting',
        'PressureLike',
      ]),
    )
    .optional()
    .default([]),

  // Severity
  currentPainScore: optionalScore,
  worstPainLast24h: optionalScore,
  leastPainLast24h: optionalScore,

  // Type & pattern
  painType: z
    .array(
      z.enum([
        'NociceptiveSomatic',
        'Visceral',
        'Neuropathic',
        'Mixed',
        'BreakthroughPain',
      ]),
    )
    .optional()
    .default([]),
  painPattern: z
    .array(
      z.enum([
        'Continuous',
        'Intermittent',
        'BreakthroughEpisodes',
        'WorseAtNight',
        'MovementRelated',
      ]),
    )
    .optional()
    .default([]),

  // Aggravating & relieving
  aggravatingFactors: z
    .array(
      z.enum([
        'Movement',
        'Coughing',
        'Eating',
        'Stress',
        'Positioning',
        'Unknown',
      ]),
    )
    .optional()
    .default([]),
  relievingFactors: z
    .array(
      z.enum([
        'Rest',
        'Medication',
        'PositionChange',
        'HeatColdTherapy',
        'Massage',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  relievingOther: z.string().trim().optional(),

  // Opioid use
  opioidUse: optionalEnum([
    'None',
    'WeakOpioid',
    'StrongOpioid',
  ] as const),

  // Adjuvant drugs
  adjuvantDrugs: z
    .array(
      z.enum([
        'Antidepressants',
        'Anticonvulsants',
        'Steroids',
        'MuscleRelaxants',
      ]),
    )
    .optional()
    .default([]),

  // Breakthrough
  breakthroughFrequency: optionalEnum([
    'None',
    'OneToTwoPerDay',
    'ThreeToFivePerDay',
    'Frequent',
  ] as const),
  rescueMedicationUsed: z.boolean().optional(),
  rescueEffectiveness: optionalEnum([
    'Good',
    'Partial',
    'Poor',
  ] as const),

  // Associated
  associatedSymptoms: z
    .array(
      z.enum([
        'Nausea',
        'Vomiting',
        'Constipation',
        'Fatigue',
        'Anxiety',
        'Depression',
        'Dyspnea',
      ]),
    )
    .optional()
    .default([]),
  patientBehaviors: z
    .array(
      z.enum([
        'Comfortable',
        'Grimacing',
        'GuardingArea',
        'Restless',
        'Crying',
      ]),
    )
    .optional()
    .default([]),

  // Barriers
  managementBarriers: z
    .array(
      z.enum([
        'FearOfAddiction',
        'MedicationSideEffects',
        'PoorAdherence',
        'FinancialConstraints',
        'PoorAccessToOpioids',
        'CulturalBeliefs',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  managementBarrierOther: z.string().trim().optional(),

  // Diagnosis
  diagnosis: z
    .array(
      z.enum([
        'ControlledPain',
        'PartiallyControlledPain',
        'UncontrolledPain',
        'ComplexPainSyndrome',
        'BreakthroughPainSyndrome',
      ]),
    )
    .optional()
    .default([]),

  // Plan
  managementGoals: z.string().trim().optional(),
  interventions: z
    .array(
      z.enum([
        'OptimizeOpioidTherapy',
        'AddAdjuvantAnalgesics',
        'AdjustDosingSchedule',
        'BreakthroughPainProtocol',
        'NonPharmacologicalTherapy',
        'PhysiotherapyReferral',
        'PsychologicalSupport',
      ]),
    )
    .optional()
    .default([]),
  nonPharmacologicalMethods: z
    .array(
      z.enum([
        'Positioning',
        'RelaxationTechniques',
        'Massage',
        'HeatColdTherapy',
        'SpiritualSupport',
      ]),
    )
    .optional()
    .default([]),
  monitoringPlan: z
    .array(z.enum(['Daily', 'EveryShift', 'Weekly']))
    .optional()
    .default([]),

  // Summary
  assessmentOutcome: z
    .array(
      z.enum([
        'PainWellControlled',
        'RequiresAdjustment',
        'RequiresUrgentIntervention',
        'ComplexPainManagementRequired',
        'MultidisciplinaryReviewNeeded',
      ]),
    )
    .optional()
    .default([]),
  finalRecommendations: z
    .array(
      z.enum([
        'ContinueCurrentRegimen',
        'IncreaseOpioidDose',
        'AddAdjuvantTherapy',
        'ManageBreakthroughPain',
        'IntegratePsychosocialSupport',
        'FullHospicePainProtocolActivation',
      ]),
    )
    .optional()
    .default([]),

  // Children
  impacts: z.array(impactRowSchema).optional().default([]),
});

export type CreatePainAssessmentFormData = z.infer<
  typeof createPainAssessmentSchema
>;