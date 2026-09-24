// ═════════════════════════════════════════════════════════════
// ENUMS
// ═════════════════════════════════════════════════════════════

export type NutritionAssessmentType =
  | 'Admission'
  | 'FollowUp'
  | 'Reassessment';

export type NutritionStatusClassification =
  | 'Normal'
  | 'MildMalnutrition'
  | 'ModerateMalnutrition'
  | 'SevereMalnutrition';

export type NutritionSignificantWeightLoss =
  | 'No'
  | 'YesOver5PercentIn1Month'
  | 'YesOver10PercentIn6Months';

export type NutritionAppetite =
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'VeryPoor'
  | 'NoAppetite';

export type NutritionAppetiteTrend =
  | 'Improved'
  | 'Unchanged'
  | 'Decreased';

export type NutritionAppetiteCause =
  | 'Pain'
  | 'Nausea'
  | 'Vomiting'
  | 'Depression'
  | 'Fatigue'
  | 'MedicationSideEffects'
  | 'DifficultySwallowing'
  | 'EarlySatiety'
  | 'Other';

export type NutritionMealsPerDay =
  | 'One'
  | 'Two'
  | 'Three'
  | 'MoreThanThree';

export type NutritionOralIntake =
  | 'Adequate'
  | 'Reduced'
  | 'Minimal'
  | 'Nil';

export type NutritionFluidIntake =
  | 'Adequate'
  | 'Reduced'
  | 'Minimal'
  | 'Nil';

export type NutritionSpecialDiet =
  | 'No'
  | 'Yes';

export type NutritionFeedingMethod =
  | 'Oral'
  | 'NasogastricTube'
  | 'PEGTube'
  | 'Other';

export type NutritionFeedingAssistanceRequired =
  | 'No'
  | 'PartialAssistance'
  | 'FullAssistance';

export type NutritionSymptomSeverity =
  | 'None'
  | 'Mild'
  | 'Moderate'
  | 'Severe';

export type NutritionEnergyLevel =
  | 'Normal'
  | 'MildFatigue'
  | 'ModerateFatigue'
  | 'SevereFatigue';

export type NutritionMealPreparation =
  | 'Independent'
  | 'RequiresAssistance'
  | 'Unable';

export type NutritionFeedingAbility =
  | 'Independent'
  | 'RequiresAssistance'
  | 'Dependent';

export type NutritionLabTest =
  | 'Hemoglobin'
  | 'Albumin'
  | 'TotalProtein'
  | 'BloodGlucose'
  | 'Creatinine'
  | 'Other';

export type NutritionRiskFactor =
  | 'SignificantWeightLoss'
  | 'PoorAppetite'
  | 'AdvancedDisease'
  | 'DifficultySwallowing'
  | 'RecurrentVomiting'
  | 'SevereFatigue'
  | 'ReducedFoodIntake'
  | 'LowBmi'
  | 'FoodInsecurity';

export type NutritionOverallRisk =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Critical';

export type NutritionDiagnosis =
  | 'ProteinEnergyMalnutrition'
  | 'InadequateOralIntake'
  | 'CancerCachexia'
  | 'Dysphagia'
  | 'DehydrationRisk'
  | 'FoodInsecurity'
  | 'WeightLoss'
  | 'Other';

export type NutritionIntervention =
  | 'HighCalorieDiet'
  | 'HighProteinDiet'
  | 'OralNutritionalSupplements'
  | 'SmallFrequentMeals'
  | 'AppetiteStimulationStrategies'
  | 'DysphagiaDietModification'
  | 'TubeFeedingSupport'
  | 'FamilyNutritionEducation'
  | 'SocialSupportReferral'
  | 'Other';

export type NutritionMonitoringPlan =
  | 'WeeklyWeightMonitoring'
  | 'DietaryIntakeMonitoring'
  | 'SymptomMonitoring'
  | 'MonthlyNutritionalReview'
  | 'Other';

export type NutritionAssessmentOutcome =
  | 'AdequateNutritionalStatus'
  | 'MildNutritionalRisk'
  | 'ModerateNutritionalRisk'
  | 'HighNutritionalRisk'
  | 'RequiresSpecializedNutritionalSupport'
  | 'RequiresSocialSupportForNutrition';

export type NutritionFinalRecommendation =
  | 'ContinueCurrentDiet'
  | 'ModifiedTherapeuticDiet'
  | 'OralNutritionalSupplements'
  | 'IntensiveNutritionalMonitoring'
  | 'HomeBasedNutritionFollowUp'
  | 'MultidisciplinaryReviewRequired';

// ═════════════════════════════════════════════════════════════
// CHILD ROWS
// ═════════════════════════════════════════════════════════════

export interface NutritionalAssessmentDietaryRecallRow {
  id?: string;
  mealType: string;
  contents?: string;
}

export interface NutritionalAssessmentLabRow {
  id?: string;
  test: NutritionLabTest;
  testOther?: string;
  result?: string;
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCUMENT
// ═════════════════════════════════════════════════════════════

export interface NutritionalAssessment {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    hospitalPatientId: string | null;
  } | null;

  assessmentType: NutritionAssessmentType;

  // Anthropometric
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  muacCm?: number | null;
  recentWeightLossKg?: number | null;
  weightLossPeriod?: string | null;
  nutritionalStatusClassification?: NutritionStatusClassification | null;

  // Weight history
  weightSixMonthsAgoKg?: number | null;
  weightThreeMonthsAgoKg?: number | null;
  currentWeightKg?: number | null;
  percentageWeightLoss?: number | null;
  significantWeightLoss?: NutritionSignificantWeightLoss | null;

  // Appetite
  currentAppetite?: NutritionAppetite | null;
  appetiteTrend?: NutritionAppetiteTrend | null;
  appetiteCauses: NutritionAppetiteCause[];
  appetiteCauseOther?: string | null;

  // Dietary intake
  mealsPerDay?: NutritionMealsPerDay | null;
  oralIntake?: NutritionOralIntake | null;
  fluidIntake?: NutritionFluidIntake | null;
  specialDiet?: NutritionSpecialDiet | null;
  specialDietSpecify?: string | null;

  // Feeding
  feedingMethod?: NutritionFeedingMethod | null;
  feedingMethodOther?: string | null;
  feedingAssistanceRequired?: NutritionFeedingAssistanceRequired | null;
  difficultySwallowing?: boolean | null;
  difficultySwallowingDetails?: string | null;

  // GI symptoms
  nauseaSeverity?: NutritionSymptomSeverity | null;
  vomitingSeverity?: NutritionSymptomSeverity | null;
  constipationSeverity?: NutritionSymptomSeverity | null;
  diarrheaSeverity?: NutritionSymptomSeverity | null;
  abdominalPainSeverity?: NutritionSymptomSeverity | null;
  bloatingSeverity?: NutritionSymptomSeverity | null;
  mouthSoresSeverity?: NutritionSymptomSeverity | null;

  // Functional
  energyLevel?: NutritionEnergyLevel | null;
  mealPreparation?: NutritionMealPreparation | null;
  feedingAbility?: NutritionFeedingAbility | null;

  // Risk
  riskFactors: NutritionRiskFactor[];
  overallNutritionalRisk?: NutritionOverallRisk | null;

  // Food security
  adequateFoodAccess?: boolean | null;
  financialBarriersToNutrition?: boolean | null;
  requiresNutritionalAssistance?: boolean | null;

  // Diagnosis
  diagnoses: NutritionDiagnosis[];
  diagnosisOther?: string | null;

  // Plan
  nutritionalGoals?: string | null;
  interventions: NutritionIntervention[];
  interventionOther?: string | null;
  monitoringPlans: NutritionMonitoringPlan[];
  monitoringOther?: string | null;

  // Summary
  assessmentOutcome: NutritionAssessmentOutcome[];
  finalRecommendations: NutritionFinalRecommendation[];

  // Children
  dietaryRecall: NutritionalAssessmentDietaryRecallRow[];
  labResults: NutritionalAssessmentLabRow[];

  // Audit
  createdBy: string;
  createdByStaff?: { id: string; name: string } | null;
  updatedBy?: string | null;
  updatedByAdmin?: { id: string; name: string } | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ═════════════════════════════════════════════════════════════
// LIST DTO
// ═════════════════════════════════════════════════════════════

export interface NutritionalAssessmentListItem {
  id: string;
  patientId: string;
  assessmentType: NutritionAssessmentType;
  bmi?: number | null;
  nutritionalStatusClassification?: NutritionStatusClassification | null;
  overallNutritionalRisk?: NutritionOverallRisk | null;
  currentAppetite?: NutritionAppetite | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ═════════════════════════════════════════════════════════════
// REQUEST PAYLOADS
// ═════════════════════════════════════════════════════════════

export interface CreateNutritionalAssessmentRequest {
  assessmentType: NutritionAssessmentType;

  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  muacCm?: number;
  recentWeightLossKg?: number;
  weightLossPeriod?: string;
  nutritionalStatusClassification?: NutritionStatusClassification;

  weightSixMonthsAgoKg?: number;
  weightThreeMonthsAgoKg?: number;
  currentWeightKg?: number;
  percentageWeightLoss?: number;
  significantWeightLoss?: NutritionSignificantWeightLoss;

  currentAppetite?: NutritionAppetite;
  appetiteTrend?: NutritionAppetiteTrend;
  appetiteCauses?: NutritionAppetiteCause[];
  appetiteCauseOther?: string;

  mealsPerDay?: NutritionMealsPerDay;
  oralIntake?: NutritionOralIntake;
  fluidIntake?: NutritionFluidIntake;
  specialDiet?: NutritionSpecialDiet;
  specialDietSpecify?: string;

  feedingMethod?: NutritionFeedingMethod;
  feedingMethodOther?: string;
  feedingAssistanceRequired?: NutritionFeedingAssistanceRequired;
  difficultySwallowing?: boolean;
  difficultySwallowingDetails?: string;

  nauseaSeverity?: NutritionSymptomSeverity;
  vomitingSeverity?: NutritionSymptomSeverity;
  constipationSeverity?: NutritionSymptomSeverity;
  diarrheaSeverity?: NutritionSymptomSeverity;
  abdominalPainSeverity?: NutritionSymptomSeverity;
  bloatingSeverity?: NutritionSymptomSeverity;
  mouthSoresSeverity?: NutritionSymptomSeverity;

  energyLevel?: NutritionEnergyLevel;
  mealPreparation?: NutritionMealPreparation;
  feedingAbility?: NutritionFeedingAbility;

  riskFactors?: NutritionRiskFactor[];
  overallNutritionalRisk?: NutritionOverallRisk;

  adequateFoodAccess?: boolean;
  financialBarriersToNutrition?: boolean;
  requiresNutritionalAssistance?: boolean;

  diagnoses?: NutritionDiagnosis[];
  diagnosisOther?: string;

  nutritionalGoals?: string;
  interventions?: NutritionIntervention[];
  interventionOther?: string;
  monitoringPlans?: NutritionMonitoringPlan[];
  monitoringOther?: string;

  assessmentOutcome?: NutritionAssessmentOutcome[];
  finalRecommendations?: NutritionFinalRecommendation[];

  dietaryRecall?: Omit<NutritionalAssessmentDietaryRecallRow, 'id'>[];
  labResults?: Omit<NutritionalAssessmentLabRow, 'id'>[];
}

export type UpdateNutritionalAssessmentRequest =
  Partial<CreateNutritionalAssessmentRequest>;

// ═════════════════════════════════════════════════════════════
// LIST ENVELOPE
// ═════════════════════════════════════════════════════════════

export interface NutritionalAssessmentListResponse {
  items: NutritionalAssessmentListItem[];
  page: number;
  limit: number;
  total: number;
}