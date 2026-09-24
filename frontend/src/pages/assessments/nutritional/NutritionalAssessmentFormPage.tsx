import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import { useCreateNutritionalAssessment } from '@/hooks/useNutritionalAssessments';
import {
  createNutritionalAssessmentSchema,
  type CreateNutritionalAssessmentFormData,
} from '@/schemas/nutritional-assessment.schema';

import { AssessmentFormShell } from '@/components/assessments/AssessmentFormShell';
import {
  Section,
  Grid,
  YesNo,
  CheckboxGroup,
} from '@/components/assessments/FormPrimitives';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

const NutritionalAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreateNutritionalAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateNutritionalAssessmentFormData>({
    resolver: zodResolver(createNutritionalAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      appetiteCauses: [],
      riskFactors: [],
      diagnoses: [],
      interventions: [],
      monitoringPlans: [],
      assessmentOutcome: [],
      finalRecommendations: [],
      dietaryRecall: [],
      labResults: [],
    },
  });

  const onSubmit = (data: CreateNutritionalAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${
    patient.patientDisplayId ?? patient.id
  }`;

  return (
    <AssessmentFormShell
      title="Nutritional Assessment"
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      mode="create"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(`/patients/${id}`)}
    >
      {/* ── 1. Assessment type ── */}
      <Section title="1. Assessment Type">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'Reassessment', label: 'Reassessment' },
          ]}
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      {/* ── 2. Anthropometric ── */}
      <Section title="2. Anthropometric Measurements">
        <Grid cols={3}>
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            {...register('weightKg')}
          />
          <Input
            label="Height (cm)"
            type="number"
            step="0.1"
            {...register('heightCm')}
          />
          <Input
            label="BMI"
            type="number"
            step="0.1"
            {...register('bmi')}
          />
          <Input
            label="MUAC (cm)"
            type="number"
            step="0.1"
            {...register('muacCm')}
          />
          <Input
            label="Recent Weight Loss (kg)"
            type="number"
            step="0.1"
            {...register('recentWeightLossKg')}
          />
          <Input
            label="Weight Loss Period"
            placeholder="e.g. 3 months"
            {...register('weightLossPeriod')}
          />
        </Grid>
        <Select
          label="Nutritional Status Classification"
          options={[
            { value: 'Normal', label: 'Normal' },
            { value: 'MildMalnutrition', label: 'Mild malnutrition' },
            { value: 'ModerateMalnutrition', label: 'Moderate malnutrition' },
            { value: 'SevereMalnutrition', label: 'Severe malnutrition' },
          ]}
          placeholder="Select…"
          {...register('nutritionalStatusClassification')}
        />
      </Section>

      {/* ── 3. Weight history ── */}
      <Section title="3. Weight History">
        <Grid cols={2}>
          <Input
            label="Weight 6 months ago (kg)"
            type="number"
            step="0.1"
            {...register('weightSixMonthsAgoKg')}
          />
          <Input
            label="Weight 3 months ago (kg)"
            type="number"
            step="0.1"
            {...register('weightThreeMonthsAgoKg')}
          />
          <Input
            label="Current Weight (kg)"
            type="number"
            step="0.1"
            {...register('currentWeightKg')}
          />
          <Input
            label="% Weight Loss"
            type="number"
            step="0.1"
            {...register('percentageWeightLoss')}
          />
        </Grid>
        <Select
          label="Significant Weight Loss"
          options={[
            { value: 'No', label: 'No' },
            { value: 'YesOver5PercentIn1Month', label: 'Yes — >5% in 1 month' },
            { value: 'YesOver10PercentIn6Months', label: 'Yes — >10% in 6 months' },
          ]}
          placeholder="Select…"
          {...register('significantWeightLoss')}
        />
      </Section>

      {/* ── 4. Appetite ── */}
      <Section title="4. Appetite Assessment">
        <Grid cols={2}>
          <Select
            label="Current Appetite"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
              { value: 'VeryPoor', label: 'Very poor' },
              { value: 'NoAppetite', label: 'No appetite' },
            ]}
            placeholder="Select…"
            {...register('currentAppetite')}
          />
          <Select
            label="Appetite Trend"
            options={[
              { value: 'Improved', label: 'Improved' },
              { value: 'Unchanged', label: 'Unchanged' },
              { value: 'Decreased', label: 'Decreased' },
            ]}
            placeholder="Select…"
            {...register('appetiteTrend')}
          />
        </Grid>
        <CheckboxGroup
          label="Appetite Causes"
          values={watch('appetiteCauses') ?? []}
          options={[
            'Pain',
            'Nausea',
            'Vomiting',
            'Depression',
            'Fatigue',
            'MedicationSideEffects',
            'DifficultySwallowing',
            'EarlySatiety',
            'Other',
          ]}
          onChange={(v) => setValue('appetiteCauses', v as any)}
        />
        {watch('appetiteCauses')?.includes('Other') && (
          <Input
            label="Other appetite cause"
            {...register('appetiteCauseOther')}
          />
        )}
      </Section>

      {/* ── 5. Dietary intake ── */}
      <Section title="5. Dietary Intake">
        <Grid cols={2}>
          <Select
            label="Meals Per Day"
            options={[
              { value: 'One', label: 'One' },
              { value: 'Two', label: 'Two' },
              { value: 'Three', label: 'Three' },
              { value: 'MoreThanThree', label: 'More than three' },
            ]}
            placeholder="Select…"
            {...register('mealsPerDay')}
          />
          <Select
            label="Oral Intake"
            options={[
              { value: 'Adequate', label: 'Adequate' },
              { value: 'Reduced', label: 'Reduced' },
              { value: 'Minimal', label: 'Minimal' },
              { value: 'Nil', label: 'Nil' },
            ]}
            placeholder="Select…"
            {...register('oralIntake')}
          />
          <Select
            label="Fluid Intake"
            options={[
              { value: 'Adequate', label: 'Adequate' },
              { value: 'Reduced', label: 'Reduced' },
              { value: 'Minimal', label: 'Minimal' },
              { value: 'Nil', label: 'Nil' },
            ]}
            placeholder="Select…"
            {...register('fluidIntake')}
          />
          <Select
            label="Special Diet"
            options={[
              { value: 'No', label: 'No' },
              { value: 'Yes', label: 'Yes' },
            ]}
            placeholder="Select…"
            {...register('specialDiet')}
          />
        </Grid>
        {watch('specialDiet') === 'Yes' && (
          <Input
            label="Special Diet — Specify"
            {...register('specialDietSpecify')}
          />
        )}
      </Section>

      {/* ── 6. Feeding ── */}
      <Section title="6. Feeding Method & Assistance">
        <Grid cols={2}>
          <Select
            label="Feeding Method"
            options={[
              { value: 'Oral', label: 'Oral' },
              { value: 'NasogastricTube', label: 'Nasogastric tube' },
              { value: 'PEGTube', label: 'PEG tube' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('feedingMethod')}
          />
          <Select
            label="Feeding Assistance Required"
            options={[
              { value: 'No', label: 'No' },
              { value: 'PartialAssistance', label: 'Partial assistance' },
              { value: 'FullAssistance', label: 'Full assistance' },
            ]}
            placeholder="Select…"
            {...register('feedingAssistanceRequired')}
          />
        </Grid>
        {watch('feedingMethod') === 'Other' && (
          <Input
            label="Other feeding method"
            {...register('feedingMethodOther')}
          />
        )}
        <YesNo
          label="Difficulty Swallowing?"
          name="difficultySwallowing"
          value={
            watch('difficultySwallowing') === undefined
              ? ''
              : watch('difficultySwallowing')
                ? 'Yes'
                : 'No'
          }
          onChange={(v) => setValue('difficultySwallowing', v === 'Yes')}
        />
        {watch('difficultySwallowing') && (
          <Textarea
            label="Difficulty Swallowing Details"
            rows={2}
            {...register('difficultySwallowingDetails')}
          />
        )}
      </Section>

      {/* ── 7. 24-hour dietary recall ── */}
      <Section title="7. 24-Hour Dietary Recall">
        <p className="text-xs text-text-muted -mt-2">
          Enter each meal on its own line as{' '}
          <code className="bg-surface-low px-1 rounded">
            Meal Type | Contents
          </code>
        </p>
        <Textarea
          label="Dietary Recall"
          rows={5}
          placeholder={'Breakfast | Porridge, tea\nLunch | Rice, vegetables\nDinner | Bread, soup'}
          onChange={(e) => {
            const rows = e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [mealType = '', contents = ''] = l.split('|');
                return {
                  mealType: mealType.trim(),
                  contents: contents.trim(),
                };
              });
            setValue('dietaryRecall', rows);
          }}
        />
      </Section>

      {/* ── 8. GI symptoms ── */}
      <Section title="8. Gastrointestinal Symptoms">
        <Grid cols={2}>
          <Select
            label="Nausea Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('nauseaSeverity')}
          />
          <Select
            label="Vomiting Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('vomitingSeverity')}
          />
          <Select
            label="Constipation Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('constipationSeverity')}
          />
          <Select
            label="Diarrhea Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('diarrheaSeverity')}
          />
          <Select
            label="Abdominal Pain Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('abdominalPainSeverity')}
          />
          <Select
            label="Bloating Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('bloatingSeverity')}
          />
          <Select
            label="Mouth Sores Severity"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('mouthSoresSeverity')}
          />
        </Grid>
      </Section>

      {/* ── 9. Functional impact ── */}
      <Section title="9. Functional Impact">
        <Grid cols={3}>
          <Select
            label="Energy Level"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'MildFatigue', label: 'Mild fatigue' },
              { value: 'ModerateFatigue', label: 'Moderate fatigue' },
              { value: 'SevereFatigue', label: 'Severe fatigue' },
            ]}
            placeholder="Select…"
            {...register('energyLevel')}
          />
          <Select
            label="Meal Preparation"
            options={[
              { value: 'Independent', label: 'Independent' },
              { value: 'RequiresAssistance', label: 'Requires assistance' },
              { value: 'Unable', label: 'Unable' },
            ]}
            placeholder="Select…"
            {...register('mealPreparation')}
          />
          <Select
            label="Feeding Ability"
            options={[
              { value: 'Independent', label: 'Independent' },
              { value: 'RequiresAssistance', label: 'Requires assistance' },
              { value: 'Dependent', label: 'Dependent' },
            ]}
            placeholder="Select…"
            {...register('feedingAbility')}
          />
        </Grid>
      </Section>

      {/* ── 10. Lab results ── */}
      <Section title="10. Laboratory Results">
        <p className="text-xs text-text-muted -mt-2">
          Enter each test on its own line as{' '}
          <code className="bg-surface-low px-1 rounded">
            Test | Other | Result
          </code>{' '}
          (leave Other blank unless Test = Other)
        </p>
        <Textarea
          label="Lab Results"
          rows={4}
          placeholder={
            'Hemoglobin | | 9.5 g/dL\nAlbumin | | 28 g/L\nBloodGlucose | | 110 mg/dL'
          }
          onChange={(e) => {
            const rows = e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [test = '', testOther = '', result = ''] = l.split('|');
                return {
                  test: test.trim() as any,
                  testOther: testOther.trim(),
                  result: result.trim(),
                };
              });
            setValue('labResults', rows);
          }}
        />
      </Section>

      {/* ── 11. Risk screening ── */}
      <Section title="11. Nutritional Risk Screening">
        <CheckboxGroup
          label="Risk Factors"
          values={watch('riskFactors') ?? []}
          options={[
            'SignificantWeightLoss',
            'PoorAppetite',
            'AdvancedDisease',
            'DifficultySwallowing',
            'RecurrentVomiting',
            'SevereFatigue',
            'ReducedFoodIntake',
            'LowBmi',
            'FoodInsecurity',
          ]}
          onChange={(v) => setValue('riskFactors', v as any)}
        />
        <Select
          label="Overall Nutritional Risk"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
          placeholder="Select…"
          {...register('overallNutritionalRisk')}
        />
      </Section>

      {/* ── 12. Food security ── */}
      <Section title="12. Food Security">
        <Grid cols={2}>
          <YesNo
            label="Adequate food access?"
            name="adequateFoodAccess"
            value={
              watch('adequateFoodAccess') === undefined
                ? ''
                : watch('adequateFoodAccess')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) => setValue('adequateFoodAccess', v === 'Yes')}
          />
          <YesNo
            label="Financial barriers to nutrition?"
            name="financialBarriersToNutrition"
            value={
              watch('financialBarriersToNutrition') === undefined
                ? ''
                : watch('financialBarriersToNutrition')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('financialBarriersToNutrition', v === 'Yes')
            }
          />
          <YesNo
            label="Requires nutritional assistance?"
            name="requiresNutritionalAssistance"
            value={
              watch('requiresNutritionalAssistance') === undefined
                ? ''
                : watch('requiresNutritionalAssistance')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('requiresNutritionalAssistance', v === 'Yes')
            }
          />
        </Grid>
      </Section>

      {/* ── 13. Diagnosis ── */}
      <Section title="13. Nutritional Diagnosis">
        <CheckboxGroup
          label="Diagnoses"
          values={watch('diagnoses') ?? []}
          options={[
            'ProteinEnergyMalnutrition',
            'InadequateOralIntake',
            'CancerCachexia',
            'Dysphagia',
            'DehydrationRisk',
            'FoodInsecurity',
            'WeightLoss',
            'Other',
          ]}
          onChange={(v) => setValue('diagnoses', v as any)}
        />
        {watch('diagnoses')?.includes('Other') && (
          <Input
            label="Other diagnosis"
            {...register('diagnosisOther')}
          />
        )}
      </Section>

      {/* ── 14. Care plan ── */}
      <Section title="14. Nutritional Care Plan">
        <Textarea
          label="Nutritional Goals"
          rows={3}
          {...register('nutritionalGoals')}
        />
        <CheckboxGroup
          label="Interventions"
          values={watch('interventions') ?? []}
          options={[
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
          ]}
          onChange={(v) => setValue('interventions', v as any)}
        />
        {watch('interventions')?.includes('Other') && (
          <Input
            label="Other intervention"
            {...register('interventionOther')}
          />
        )}
        <CheckboxGroup
          label="Monitoring Plans"
          values={watch('monitoringPlans') ?? []}
          options={[
            'WeeklyWeightMonitoring',
            'DietaryIntakeMonitoring',
            'SymptomMonitoring',
            'MonthlyNutritionalReview',
            'Other',
          ]}
          onChange={(v) => setValue('monitoringPlans', v as any)}
        />
        {watch('monitoringPlans')?.includes('Other') && (
          <Input
            label="Other monitoring plan"
            {...register('monitoringOther')}
          />
        )}
      </Section>

      {/* ── 15. Summary ── */}
      <Section title="15. Summary & Recommendations">
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'AdequateNutritionalStatus',
            'MildNutritionalRisk',
            'ModerateNutritionalRisk',
            'HighNutritionalRisk',
            'RequiresSpecializedNutritionalSupport',
            'RequiresSocialSupportForNutrition',
          ]}
          onChange={(v) => setValue('assessmentOutcome', v as any)}
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ContinueCurrentDiet',
            'ModifiedTherapeuticDiet',
            'OralNutritionalSupplements',
            'IntensiveNutritionalMonitoring',
            'HomeBasedNutritionFollowUp',
            'MultidisciplinaryReviewRequired',
          ]}
          onChange={(v) => setValue('finalRecommendations', v as any)}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default NutritionalAssessmentFormPage;