import { z } from 'zod';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

export const createPsychiatryAssessmentSchema = z.object({
  assessmentType: z.enum([
    'Admission',
    'FollowUp',
    'EmergencyReview',
  ]),

  // Presenting problem
  reasonForReferral: z.string().trim().optional(),
  currentSymptoms: z
    .array(
      z.enum([
        'Anxiety',
        'Depression',
        'Insomnia',
        'Delirium',
        'Hallucinations',
        'Agitation',
        'SuicidalIdeation',
        'CognitiveDecline',
        'AdjustmentDisorder',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  symptomOther: z.string().trim().optional(),
  onsetAndDuration: z.string().trim().optional(),
  severity: optionalEnum([
    'Mild',
    'Moderate',
    'Severe',
    'Fluctuating',
  ] as const),

  // Mental state examination
  appearanceBehavior: z
    .array(
      z.enum([
        'Calm',
        'Restless',
        'Agitated',
        'Withdrawn',
        'PoorSelfCare',
      ]),
    )
    .optional()
    .default([]),
  speech: optionalEnum([
    'Normal',
    'Slow',
    'Pressured',
    'Minimal',
  ] as const),
  mood: optionalEnum([
    'Euthymic',
    'Depressed',
    'Anxious',
    'Irritable',
  ] as const),
  affect: optionalEnum([
    'Appropriate',
    'Blunted',
    'Flat',
    'Labile',
  ] as const),
  thoughtProcess: z
    .array(
      z.enum([
        'Logical',
        'Circumstantial',
        'Disorganized',
        'Tangential',
      ]),
    )
    .optional()
    .default([]),
  thoughtContent: z
    .array(
      z.enum([
        'NoDelusions',
        'Hopelessness',
        'Guilt',
        'SuicidalThoughts',
        'Paranoia',
        'SomaticPreoccupation',
      ]),
    )
    .optional()
    .default([]),
  perception: z
    .array(
      z.enum([
        'NoHallucinations',
        'AuditoryHallucinations',
        'VisualHallucinations',
      ]),
    )
    .optional()
    .default([]),
  cognition: z
    .array(
      z.enum([
        'OrientedX3',
        'Disoriented',
        'MemoryImpairment',
        'AttentionDeficits',
      ]),
    )
    .optional()
    .default([]),
  insightJudgment: optionalEnum([
    'Good',
    'Partial',
    'Poor',
  ] as const),

  // Suicide risk
  suicidalIdeation: optionalEnum([
    'None',
    'PassiveThoughts',
    'ActiveThoughts',
    'PlanPresent',
  ] as const),
  suicideRiskLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),
  protectiveFactors: z
    .array(
      z.enum([
        'FamilySupport',
        'ReligiousBeliefs',
        'FearOfDeath',
        'ResponsibilityForFamily',
        'SocialSupport',
      ]),
    )
    .optional()
    .default([]),

  // Organic
  organicCauses: z
    .array(
      z.enum([
        'Pain',
        'Hypoxia',
        'Infection',
        'MedicationSideEffects',
        'MetabolicImbalance',
        'Delirium',
        'CancerProgression',
      ]),
    )
    .optional()
    .default([]),
  medicationsAffectingMentalState: z.string().trim().optional(),

  // Sleep & appetite
  sleepPattern: optionalEnum([
    'Normal',
    'Insomnia',
    'FragmentedSleep',
    'ExcessiveSleepiness',
  ] as const),
  appetite: optionalEnum([
    'Normal',
    'Reduced',
    'Poor',
  ] as const),

  // Functional & social
  dailyFunctioning: optionalEnum([
    'Independent',
    'RequiresAssistance',
    'Dependent',
  ] as const),
  socialWithdrawal: optionalEnum([
    'None',
    'Mild',
    'Severe',
  ] as const),

  // Diagnosis
  diagnoses: z
    .array(
      z.enum([
        'MajorDepressiveDisorder',
        'AnxietyDisorder',
        'AdjustmentDisorder',
        'Delirium',
        'DepressionDueToMedicalCondition',
        'MixedAnxietyDepression',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  diagnosisOther: z.string().trim().optional(),

  // Plan
  immediateInterventions: z
    .array(
      z.enum([
        'CrisisManagement',
        'SuicidePrecautions',
        'EnvironmentalSafety',
        'SupportiveCounseling',
        'FamilyCounseling',
      ]),
    )
    .optional()
    .default([]),
  pharmacologicalPlan: z
    .array(
      z.enum([
        'Antidepressants',
        'Anxiolytics',
        'Antipsychotics',
        'SleepMedications',
        'DoseAdjustmentReview',
      ]),
    )
    .optional()
    .default([]),
  nonPharmacologicalPlan: z
    .array(
      z.enum([
        'Psychotherapy',
        'RelaxationTechniques',
        'SpiritualSupport',
        'MusicTherapy',
        'BehavioralActivation',
      ]),
    )
    .optional()
    .default([]),
  monitoringPlan: z
    .array(z.enum(['Daily', 'Weekly', 'AsNeeded']))
    .optional()
    .default([]),

  // Family
  familyDistressLevel: optionalEnum([
    'Low',
    'Moderate',
    'High',
  ] as const),
  caregiverBurnout: z.boolean().optional(),
  familyCounselingNeeded: z.boolean().optional(),

  // Summary
  assessmentOutcome: z
    .array(
      z.enum([
        'NoPsychiatricInterventionRequired',
        'RequiresSupportiveCounseling',
        'RequiresPharmacologicalTreatment',
        'RequiresCloseMonitoring',
        'HighRiskSafetyPrecautionsRequired',
      ]),
    )
    .optional()
    .default([]),
  finalRecommendations: z
    .array(
      z.enum([
        'ContinueHospicePsychologicalSupport',
        'InitiatePsychiatricMedication',
        'CrisisInterventionRequired',
        'FamilyCounselingRequired',
        'OngoingPsychiatricFollowUp',
      ]),
    )
    .optional()
    .default([]),
});

export type CreatePsychiatryAssessmentFormData = z.infer<
  typeof createPsychiatryAssessmentSchema
>;