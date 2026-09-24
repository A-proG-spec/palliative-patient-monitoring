import { z } from 'zod';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(values).optional(),
  );

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);

const optionalPositiveNumber = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().positive().optional(),
);

const dietaryRecallRowSchema = z.object({
  mealType: z.string().min(1, 'Meal type is required'),
  contents: z.string().default(''),
});

const labRowSchema = z.object({
  test: z.enum([
    'Hemoglobin',
    'Albumin',
    'TotalProtein',
    'BloodGlucose',
    'Creatinine',
    'Other',
  ]),
  testOther: z.string().default(''),
  result: z.string().default(''),
});

export const createNutritionalAssessmentSchema = z.object({
  assessmentType: z.enum(['Admission', 'FollowUp', 'Reassessment']),

  // Anthropometric
  weightKg: optionalPositiveNumber,
  heightCm: optionalPositiveNumber,
  bmi: optionalPositiveNumber,
  muacCm: optionalPositiveNumber,
  recentWeightLossKg: optionalNumber,
  weightLossPeriod: z.string().trim().optional(),
  nutritionalStatusClassification: optionalEnum([
    'Normal',
    'MildMalnutrition',
    'ModerateMalnutrition',
    'SevereMalnutrition',
  ] as const),

  // Weight history
  weightSixMonthsAgoKg: optionalPositiveNumber,
  weightThreeMonthsAgoKg: optionalPositiveNumber,
  currentWeightKg: optionalPositiveNumber,
  percentageWeightLoss: optionalNumber,
  significantWeightLoss: optionalEnum([
    'No',
    'YesOver5PercentIn1Month',
    'YesOver10PercentIn6Months',
  ] as const),

  // Appetite
  currentAppetite: optionalEnum([
    'Good',
    'Fair',
    'Poor',
    'VeryPoor',
    'NoAppetite',
  ] as const),
  appetiteTrend: optionalEnum([
    'Improved',
    'Unchanged',
    'Decreased',
  ] as const),
  appetiteCauses: z
    .array(
      z.enum([
        'Pain',
        'Nausea',
        'Vomiting',
        'Depression',
        'Fatigue',
        'MedicationSideEffects',
        'DifficultySwallowing',
        'EarlySatiety',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  appetiteCauseOther: z.string().trim().optional(),

  // Dietary intake
  mealsPerDay: optionalEnum([
    'One',
    'Two',
    'Three',
    'MoreThanThree',
  ] as const),
  oralIntake: optionalEnum([
    'Adequate',
    'Reduced',
    'Minimal',
    'Nil',
  ] as const),
  fluidIntake: optionalEnum([
    'Adequate',
    'Reduced',
    'Minimal',
    'Nil',
  ] as const),
  specialDiet: optionalEnum(['No', 'Yes'] as const),
  specialDietSpecify: z.string().trim().optional(),

  // Feeding
  feedingMethod: optionalEnum([
    'Oral',
    'NasogastricTube',
    'PEGTube',
    'Other',
  ] as const),
  feedingMethodOther: z.string().trim().optional(),
  feedingAssistanceRequired: optionalEnum([
    'No',
    'PartialAssistance',
    'FullAssistance',
  ] as const),
  difficultySwallowing: z.boolean().optional(),
  difficultySwallowingDetails: z.string().trim().optional(),

  // GI symptoms
  nauseaSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  vomitingSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  constipationSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  diarrheaSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  abdominalPainSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  bloatingSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),
  mouthSoresSeverity: optionalEnum([
    'None',
    'Mild',
    'Moderate',
    'Severe',
  ] as const),

  // Functional
  energyLevel: optionalEnum([
    'Normal',
    'MildFatigue',
    'ModerateFatigue',
    'SevereFatigue',
  ] as const),
  mealPreparation: optionalEnum([
    'Independent',
    'RequiresAssistance',
    'Unable',
  ] as const),
  feedingAbility: optionalEnum([
    'Independent',
    'RequiresAssistance',
    'Dependent',
  ] as const),

  // Children
  dietaryRecall: z.array(dietaryRecallRowSchema).optional().default([]),
  labResults: z.array(labRowSchema).optional().default([]),

  // Risk
  riskFactors: z
    .array(
      z.enum([
        'SignificantWeightLoss',
        'PoorAppetite',
        'AdvancedDisease',
        'DifficultySwallowing',
        'RecurrentVomiting',
        'SevereFatigue',
        'ReducedFoodIntake',
        'LowBmi',
        'FoodInsecurity',
      ]),
    )
    .optional()
    .default([]),
  overallNutritionalRisk: optionalEnum([
    'Low',
    'Moderate',
    'High',
    'Critical',
  ] as const),

  // Food security
  adequateFoodAccess: z.boolean().optional(),
  financialBarriersToNutrition: z.boolean().optional(),
  requiresNutritionalAssistance: z.boolean().optional(),

  // Diagnosis
  diagnoses: z
    .array(
      z.enum([
        'ProteinEnergyMalnutrition',
        'InadequateOralIntake',
        'CancerCachexia',
        'Dysphagia',
        'DehydrationRisk',
        'FoodInsecurity',
        'WeightLoss',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  diagnosisOther: z.string().trim().optional(),

  // Care plan
  nutritionalGoals: z.string().trim().optional(),
  interventions: z
    .array(
      z.enum([
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
      ]),
    )
    .optional()
    .default([]),
  interventionOther: z.string().trim().optional(),
  monitoringPlans: z
    .array(
      z.enum([
        'WeeklyWeightMonitoring',
        'DietaryIntakeMonitoring',
        'SymptomMonitoring',
        'MonthlyNutritionalReview',
        'Other',
      ]),
    )
    .optional()
    .default([]),
  monitoringOther: z.string().trim().optional(),

  // Summary
  assessmentOutcome: z
    .array(
      z.enum([
        'AdequateNutritionalStatus',
        'MildNutritionalRisk',
        'ModerateNutritionalRisk',
        'HighNutritionalRisk',
        'RequiresSpecializedNutritionalSupport',
        'RequiresSocialSupportForNutrition',
      ]),
    )
    .optional()
    .default([]),
  finalRecommendations: z
    .array(
      z.enum([
        'ContinueCurrentDiet',
        'ModifiedTherapeuticDiet',
        'OralNutritionalSupplements',
        'IntensiveNutritionalMonitoring',
        'HomeBasedNutritionFollowUp',
        'MultidisciplinaryReviewRequired',
      ]),
    )
    .optional()
    .default([]),
});

export type CreateNutritionalAssessmentFormData = z.infer<
  typeof createNutritionalAssessmentSchema
>;