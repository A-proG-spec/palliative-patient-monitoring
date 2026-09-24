import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// ENUM VALUES
// ═════════════════════════════════════════════════════════════

export const NUTRITION_ASSESSMENT_TYPE_VALUES = [
  'Admission',
  'FollowUp',
  'Reassessment',
] as const;

export const NUTRITION_STATUS_CLASSIFICATION_VALUES = [
  'Normal',
  'MildMalnutrition',
  'ModerateMalnutrition',
  'SevereMalnutrition',
] as const;

export const NUTRITION_SIGNIFICANT_WEIGHT_LOSS_VALUES = [
  'No',
  'YesOver5PercentIn1Month',
  'YesOver10PercentIn6Months',
] as const;

export const NUTRITION_APPETITE_VALUES = [
  'Good',
  'Fair',
  'Poor',
  'VeryPoor',
  'NoAppetite',
] as const;

export const NUTRITION_APPETITE_TREND_VALUES = [
  'Improved',
  'Unchanged',
  'Decreased',
] as const;

export const NUTRITION_APPETITE_CAUSE_VALUES = [
  'Pain',
  'Nausea',
  'Vomiting',
  'Depression',
  'Fatigue',
  'MedicationSideEffects',
  'DifficultySwallowing',
  'EarlySatiety',
  'Other',
] as const;

export const NUTRITION_MEALS_PER_DAY_VALUES = [
  'One',
  'Two',
  'Three',
  'MoreThanThree',
] as const;

export const NUTRITION_ORAL_INTAKE_VALUES = [
  'Adequate',
  'Reduced',
  'Minimal',
  'Nil',
] as const;

export const NUTRITION_FLUID_INTAKE_VALUES = [
  'Adequate',
  'Reduced',
  'Minimal',
  'Nil',
] as const;

export const NUTRITION_SPECIAL_DIET_VALUES = [
  'No',
  'Yes',
] as const;

export const NUTRITION_FEEDING_METHOD_VALUES = [
  'Oral',
  'NasogastricTube',
  'PEGTube',
  'Other',
] as const;

export const NUTRITION_FEEDING_ASSISTANCE_VALUES = [
  'No',
  'PartialAssistance',
  'FullAssistance',
] as const;

export const NUTRITION_SYMPTOM_SEVERITY_VALUES = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const;

export const NUTRITION_ENERGY_LEVEL_VALUES = [
  'Normal',
  'MildFatigue',
  'ModerateFatigue',
  'SevereFatigue',
] as const;

export const NUTRITION_MEAL_PREPARATION_VALUES = [
  'Independent',
  'RequiresAssistance',
  'Unable',
] as const;

export const NUTRITION_FEEDING_ABILITY_VALUES = [
  'Independent',
  'RequiresAssistance',
  'Dependent',
] as const;

export const NUTRITION_LAB_TEST_VALUES = [
  'Hemoglobin',
  'Albumin',
  'TotalProtein',
  'BloodGlucose',
  'Creatinine',
  'Other',
] as const;

export const NUTRITION_RISK_FACTOR_VALUES = [
  'SignificantWeightLoss',
  'PoorAppetite',
  'AdvancedDisease',
  'DifficultySwallowing',
  'RecurrentVomiting',
  'SevereFatigue',
  'ReducedFoodIntake',
  'LowBmi',
  'FoodInsecurity',
] as const;

export const NUTRITION_OVERALL_RISK_VALUES = [
  'Low',
  'Moderate',
  'High',
  'Critical',
] as const;

export const NUTRITION_DIAGNOSIS_VALUES = [
  'ProteinEnergyMalnutrition',
  'InadequateOralIntake',
  'CancerCachexia',
  'Dysphagia',
  'DehydrationRisk',
  'FoodInsecurity',
  'WeightLoss',
  'Other',
] as const;

export const NUTRITION_INTERVENTION_VALUES = [
  'HighCalorieDiet',
  'HighProteinDiet',
  'OralNutritionalSupplements',
  'SmallFrequentMeals',
  'AppetiteStimulationStrategies',
  'DysphagiaDietModification',
  'TubeFeedingSupport',
  'FamilyNutritionEducation',
  'SocialSupportReferral',
  'Other',
] as const;

export const NUTRITION_MONITORING_PLAN_VALUES = [
  'WeeklyWeightMonitoring',
  'DietaryIntakeMonitoring',
  'SymptomMonitoring',
  'MonthlyNutritionalReview',
  'Other',
] as const;

export const NUTRITION_ASSESSMENT_OUTCOME_VALUES = [
  'AdequateNutritionalStatus',
  'MildNutritionalRisk',
  'ModerateNutritionalRisk',
  'HighNutritionalRisk',
  'RequiresSpecializedNutritionalSupport',
  'RequiresSocialSupportForNutrition',
] as const;

export const NUTRITION_FINAL_RECOMMENDATION_VALUES = [
  'ContinueCurrentDiet',
  'ModifiedTherapeuticDiet',
  'OralNutritionalSupplements',
  'IntensiveNutritionalMonitoring',
  'HomeBasedNutritionFollowUp',
  'MultidisciplinaryReviewRequired',
] as const;

// ═════════════════════════════════════════════════════════════
// CHILD SCHEMAS
// ═════════════════════════════════════════════════════════════

const dietaryRecallRowSchema = z.object({
  mealType: z.string().trim().min(1, 'Meal type is required'),
  contents: z.string().trim().optional(),
});

const labResultRowSchema = z.object({
  test: z.enum(NUTRITION_LAB_TEST_VALUES),
  testOther: z.string().trim().optional(),
  result: z.string().trim().optional(),
});

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════

export const createNutritionalAssessmentSchema = z.object({
  body: z.object({
    // ── Header ──
    assessmentType: z.enum(NUTRITION_ASSESSMENT_TYPE_VALUES),

    // ── Anthropometric ──
    weightKg: z.number().positive().optional(),
    heightCm: z.number().positive().optional(),
    bmi: z.number().positive().optional(),
    muacCm: z.number().positive().optional(),
    recentWeightLossKg: z.number().optional(),
    weightLossPeriod: z.string().trim().optional(),

    nutritionalStatusClassification: z
      .enum(NUTRITION_STATUS_CLASSIFICATION_VALUES)
      .optional(),

    // ── Weight history ──
    weightSixMonthsAgoKg: z.number().positive().optional(),
    weightThreeMonthsAgoKg: z.number().positive().optional(),
    currentWeightKg: z.number().positive().optional(),
    percentageWeightLoss: z.number().optional(),
    significantWeightLoss: z
      .enum(NUTRITION_SIGNIFICANT_WEIGHT_LOSS_VALUES)
      .optional(),

    // ── Appetite ──
    currentAppetite: z.enum(NUTRITION_APPETITE_VALUES).optional(),
    appetiteTrend: z.enum(NUTRITION_APPETITE_TREND_VALUES).optional(),
    appetiteCauses: z
      .array(z.enum(NUTRITION_APPETITE_CAUSE_VALUES))
      .optional()
      .default([]),
    appetiteCauseOther: z.string().trim().optional(),

    // ── Dietary intake ──
    mealsPerDay: z.enum(NUTRITION_MEALS_PER_DAY_VALUES).optional(),
    oralIntake: z.enum(NUTRITION_ORAL_INTAKE_VALUES).optional(),
    fluidIntake: z.enum(NUTRITION_FLUID_INTAKE_VALUES).optional(),
    specialDiet: z.enum(NUTRITION_SPECIAL_DIET_VALUES).optional(),
    specialDietSpecify: z.string().trim().optional(),

    // ── Feeding ──
    feedingMethod: z.enum(NUTRITION_FEEDING_METHOD_VALUES).optional(),
    feedingMethodOther: z.string().trim().optional(),
    feedingAssistanceRequired: z
      .enum(NUTRITION_FEEDING_ASSISTANCE_VALUES)
      .optional(),
    difficultySwallowing: z.boolean().optional(),
    difficultySwallowingDetails: z.string().trim().optional(),

    // ── 24-hour dietary recall ──
    dietaryRecall: z.array(dietaryRecallRowSchema).optional().default([]),

    // ── GI symptoms ──
    nauseaSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    vomitingSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    constipationSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    diarrheaSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    abdominalPainSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    bloatingSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),
    mouthSoresSeverity: z
      .enum(NUTRITION_SYMPTOM_SEVERITY_VALUES)
      .optional(),

    // ── Functional impact ──
    energyLevel: z.enum(NUTRITION_ENERGY_LEVEL_VALUES).optional(),
    mealPreparation: z
      .enum(NUTRITION_MEAL_PREPARATION_VALUES)
      .optional(),
    feedingAbility: z.enum(NUTRITION_FEEDING_ABILITY_VALUES).optional(),

    // ── Biochemical ──
    labResults: z.array(labResultRowSchema).optional().default([]),

    // ── Risk screening ──
    riskFactors: z
      .array(z.enum(NUTRITION_RISK_FACTOR_VALUES))
      .optional()
      .default([]),
    overallNutritionalRisk: z
      .enum(NUTRITION_OVERALL_RISK_VALUES)
      .optional(),

    // ── Food security ──
    adequateFoodAccess: z.boolean().optional(),
    financialBarriersToNutrition: z.boolean().optional(),
    requiresNutritionalAssistance: z.boolean().optional(),

    // ── Diagnosis ──
    diagnoses: z
      .array(z.enum(NUTRITION_DIAGNOSIS_VALUES))
      .optional()
      .default([]),
    diagnosisOther: z.string().trim().optional(),

    // ── Care plan ──
    nutritionalGoals: z.string().trim().optional(),
    interventions: z
      .array(z.enum(NUTRITION_INTERVENTION_VALUES))
      .optional()
      .default([]),
    interventionOther: z.string().trim().optional(),

    monitoringPlans: z
      .array(z.enum(NUTRITION_MONITORING_PLAN_VALUES))
      .optional()
      .default([]),
    monitoringOther: z.string().trim().optional(),

    // ── Summary ──
    assessmentOutcome: z
      .array(z.enum(NUTRITION_ASSESSMENT_OUTCOME_VALUES))
      .optional()
      .default([]),
    finalRecommendations: z
      .array(z.enum(NUTRITION_FINAL_RECOMMENDATION_VALUES))
      .optional()
      .default([]),
  }),
});

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════

export const updateNutritionalAssessmentSchema = z.object({
  body: createNutritionalAssessmentSchema.shape.body.partial(),
});

// ═════════════════════════════════════════════════════════════
// QUERIES & PARAMS
// ═════════════════════════════════════════════════════════════

export const getNutritionalAssessmentParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const getNutritionalAssessmentPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export const getNutritionalAssessmentQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(NUTRITION_ASSESSMENT_TYPE_VALUES).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getAllNutritionalAssessmentsQuerySchema = z.object({
  query: z.object({
    assessmentType: z.enum(NUTRITION_ASSESSMENT_TYPE_VALUES).optional(),
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const deleteNutritionalAssessmentSchema = z.object({
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

export type CreateNutritionalAssessmentSchema = z.infer<
  typeof createNutritionalAssessmentSchema
>;
export type UpdateNutritionalAssessmentSchema = z.infer<
  typeof updateNutritionalAssessmentSchema
>;
export type GetNutritionalAssessmentParamsSchema = z.infer<
  typeof getNutritionalAssessmentParamsSchema
>;
export type GetNutritionalAssessmentQuerySchema = z.infer<
  typeof getNutritionalAssessmentQuerySchema
>;