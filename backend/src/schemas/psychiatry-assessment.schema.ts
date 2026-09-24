import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES — must mirror the Prisma enums exactly
// ═════════════════════════════════════════════════════════════

export const PSYCHIATRY_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'EmergencyReview',
] as const;

export const PSYCHIATRY_SYMPTOM_VALUES = [
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
] as const;

export const PSYCHIATRY_SEVERITY_VALUES = [
  'Mild',
  'Moderate',
  'Severe',
  'Fluctuating',
] as const;

export const PSYCHIATRY_APPEARANCE_BEHAVIOR_VALUES = [
  'Calm',
  'Restless',
  'Agitated',
  'Withdrawn',
  'PoorSelfCare',
] as const;

export const PSYCHIATRY_SPEECH_VALUES = [
  'Normal',
  'Slow',
  'Pressured',
  'Minimal',
] as const;

export const PSYCHIATRY_MOOD_VALUES = [
  'Euthymic',
  'Depressed',
  'Anxious',
  'Irritable',
] as const;

export const PSYCHIATRY_AFFECT_VALUES = [
  'Appropriate',
  'Blunted',
  'Flat',
  'Labile',
] as const;

export const PSYCHIATRY_THOUGHT_PROCESS_VALUES = [
  'Logical',
  'Circumstantial',
  'Disorganized',
  'Tangential',
] as const;

export const PSYCHIATRY_THOUGHT_CONTENT_VALUES = [
  'NoDelusions',
  'Hopelessness',
  'Guilt',
  'SuicidalThoughts',
  'Paranoia',
  'SomaticPreoccupation',
] as const;

export const PSYCHIATRY_PERCEPTION_VALUES = [
  'NoHallucinations',
  'AuditoryHallucinations',
  'VisualHallucinations',
] as const;

export const PSYCHIATRY_COGNITION_VALUES = [
  'OrientedX3',
  'Disoriented',
  'MemoryImpairment',
  'AttentionDeficits',
] as const;

export const PSYCHIATRY_INSIGHT_JUDGMENT_VALUES = [
  'Good',
  'Partial',
  'Poor',
] as const;

export const PSYCHIATRY_SUICIDAL_IDEATION_VALUES = [
  'None',
  'PassiveThoughts',
  'ActiveThoughts',
  'PlanPresent',
] as const;

export const PSYCHIATRY_SUICIDE_RISK_LEVEL_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const PSYCHIATRY_PROTECTIVE_FACTOR_VALUES = [
  'FamilySupport',
  'ReligiousBeliefs',
  'FearOfDeath',
  'ResponsibilityForFamily',
  'SocialSupport',
] as const;

export const PSYCHIATRY_ORGANIC_CAUSE_VALUES = [
  'Pain',
  'Hypoxia',
  'Infection',
  'MedicationSideEffects',
  'MetabolicImbalance',
  'Delirium',
  'CancerProgression',
] as const;

export const PSYCHIATRY_SLEEP_PATTERN_VALUES = [
  'Normal',
  'Insomnia',
  'FragmentedSleep',
  'ExcessiveSleepiness',
] as const;

export const PSYCHIATRY_APPETITE_VALUES = [
  'Normal',
  'Reduced',
  'Poor',
] as const;

export const PSYCHIATRY_DAILY_FUNCTIONING_VALUES = [
  'Independent',
  'RequiresAssistance',
  'Dependent',
] as const;

export const PSYCHIATRY_SOCIAL_WITHDRAWAL_VALUES = [
  'None',
  'Mild',
  'Severe',
] as const;

export const PSYCHIATRY_DIAGNOSIS_VALUES = [
  'MajorDepressiveDisorder',
  'AnxietyDisorder',
  'AdjustmentDisorder',
  'Delirium',
  'DepressionDueToMedicalCondition',
  'MixedAnxietyDepression',
  'Other',
] as const;

export const PSYCHIATRY_IMMEDIATE_INTERVENTION_VALUES = [
  'CrisisManagement',
  'SuicidePrecautions',
  'EnvironmentalSafety',
  'SupportiveCounseling',
  'FamilyCounseling',
] as const;

export const PSYCHIATRY_PHARMACOLOGICAL_PLAN_VALUES = [
  'Antidepressants',
  'Anxiolytics',
  'Antipsychotics',
  'SleepMedications',
  'DoseAdjustmentReview',
] as const;

export const PSYCHIATRY_NON_PHARMACOLOGICAL_PLAN_VALUES = [
  'Psychotherapy',
  'RelaxationTechniques',
  'SpiritualSupport',
  'MusicTherapy',
  'BehavioralActivation',
] as const;

export const PSYCHIATRY_MONITORING_PLAN_VALUES = [
  'Daily',
  'Weekly',
  'AsNeeded',
] as const;

export const PSYCHIATRY_FAMILY_DISTRESS_LEVEL_VALUES = [
  'Low',
  'Moderate',
  'High',
] as const;

export const PSYCHIATRY_ASSESSMENT_OUTCOME_VALUES = [
  'NoPsychiatricInterventionRequired',
  'RequiresSupportiveCounseling',
  'RequiresPharmacologicalTreatment',
  'RequiresCloseMonitoring',
  'HighRiskSafetyPrecautionsRequired',
] as const;

export const PSYCHIATRY_FINAL_RECOMMENDATION_VALUES = [
  'ContinueHospicePsychologicalSupport',
  'InitiatePsychiatricMedication',
  'CrisisInterventionRequired',
  'FamilyCounselingRequired',
  'OngoingPsychiatricFollowUp',
] as const;

// ═════════════════════════════════════════════════════════════
// CREATE — full body schema
// ═════════════════════════════════════════════════════════════

export const createPsychiatryAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(PSYCHIATRY_ASSESSMENT_TYPE_VALUES),

    // ── Presenting problem ──
    reasonForReferral: z.string().trim().optional(),
    currentSymptoms: z
      .array(z.enum(PSYCHIATRY_SYMPTOM_VALUES))
      .optional()
      .default([]),
    symptomOther: z.string().trim().optional(),
    onsetAndDuration: z.string().trim().optional(),
    severity: z.enum(PSYCHIATRY_SEVERITY_VALUES).optional(),

    // ── Mental state examination ──
    appearanceBehavior: z
      .array(z.enum(PSYCHIATRY_APPEARANCE_BEHAVIOR_VALUES))
      .optional()
      .default([]),
    speech: z.enum(PSYCHIATRY_SPEECH_VALUES).optional(),
    mood: z.enum(PSYCHIATRY_MOOD_VALUES).optional(),
    affect: z.enum(PSYCHIATRY_AFFECT_VALUES).optional(),
    thoughtProcess: z
      .array(z.enum(PSYCHIATRY_THOUGHT_PROCESS_VALUES))
      .optional()
      .default([]),
    thoughtContent: z
      .array(z.enum(PSYCHIATRY_THOUGHT_CONTENT_VALUES))
      .optional()
      .default([]),
    perception: z
      .array(z.enum(PSYCHIATRY_PERCEPTION_VALUES))
      .optional()
      .default([]),
    cognition: z
      .array(z.enum(PSYCHIATRY_COGNITION_VALUES))
      .optional()
      .default([]),
    insightJudgment: z
      .enum(PSYCHIATRY_INSIGHT_JUDGMENT_VALUES)
      .optional(),

    // ── Suicide risk assessment ──
    suicidalIdeation: z
      .enum(PSYCHIATRY_SUICIDAL_IDEATION_VALUES)
      .optional(),
    suicideRiskLevel: z
      .enum(PSYCHIATRY_SUICIDE_RISK_LEVEL_VALUES)
      .optional(),
    protectiveFactors: z
      .array(z.enum(PSYCHIATRY_PROTECTIVE_FACTOR_VALUES))
      .optional()
      .default([]),

    // ── Organic causes to rule out ──
    organicCauses: z
      .array(z.enum(PSYCHIATRY_ORGANIC_CAUSE_VALUES))
      .optional()
      .default([]),
    medicationsAffectingMentalState: z.string().trim().optional(),

    // ── Sleep & appetite ──
    sleepPattern: z.enum(PSYCHIATRY_SLEEP_PATTERN_VALUES).optional(),
    appetite: z.enum(PSYCHIATRY_APPETITE_VALUES).optional(),

    // ── Functional & social ──
    dailyFunctioning: z
      .enum(PSYCHIATRY_DAILY_FUNCTIONING_VALUES)
      .optional(),
    socialWithdrawal: z
      .enum(PSYCHIATRY_SOCIAL_WITHDRAWAL_VALUES)
      .optional(),

    // ── Diagnosis ──
    diagnoses: z
      .array(z.enum(PSYCHIATRY_DIAGNOSIS_VALUES))
      .optional()
      .default([]),
    diagnosisOther: z.string().trim().optional(),

    // ── Management plan ──
    immediateInterventions: z
      .array(z.enum(PSYCHIATRY_IMMEDIATE_INTERVENTION_VALUES))
      .optional()
      .default([]),
    pharmacologicalPlan: z
      .array(z.enum(PSYCHIATRY_PHARMACOLOGICAL_PLAN_VALUES))
      .optional()
      .default([]),
    nonPharmacologicalPlan: z
      .array(z.enum(PSYCHIATRY_NON_PHARMACOLOGICAL_PLAN_VALUES))
      .optional()
      .default([]),
    monitoringPlan: z
      .array(z.enum(PSYCHIATRY_MONITORING_PLAN_VALUES))
      .optional()
      .default([]),

    // ── Family & caregiver ──
    familyDistressLevel: z
      .enum(PSYCHIATRY_FAMILY_DISTRESS_LEVEL_VALUES)
      .optional(),
    caregiverBurnout: z.boolean().optional(),
    familyCounselingNeeded: z.boolean().optional(),

    // ── Summary ──
    assessmentOutcome: z
      .array(z.enum(PSYCHIATRY_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(PSYCHIATRY_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE — all body fields optional
// ═════════════════════════════════════════════════════════════

export const updatePsychiatryAssessmentSchema = z.object({
  body: createPsychiatryAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getPsychiatryAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getPsychiatryAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getPsychiatryAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PSYCHIATRY_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllPsychiatryAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(PSYCHIATRY_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deletePsychiatryAssessmentSchema = z.object({
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

export type CreatePsychiatryAssessmentSchema = z.infer<
  typeof createPsychiatryAssessmentSchema
>;
export type UpdatePsychiatryAssessmentSchema = z.infer<
  typeof updatePsychiatryAssessmentSchema
>;
export type GetPsychiatryAssessmentParamsSchema = z.infer<
  typeof getPsychiatryAssessmentParamsSchema
>;
export type GetPsychiatryAssessmentQuerySchema = z.infer<
  typeof getPsychiatryAssessmentQuerySchema
>;