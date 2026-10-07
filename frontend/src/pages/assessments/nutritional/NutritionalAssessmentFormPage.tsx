import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';

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
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { useToast } from '@/context/ToastContext';

// ── Helpers ─────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

// ═════════════════════════════════════════════════════════════
// Enum option lists
// ═════════════════════════════════════════════════════════════
const LAB_TEST_OPTIONS = [
  { value: 'Hemoglobin', label: 'Hemoglobin' },
  { value: 'Albumin', label: 'Albumin' },
  { value: 'TotalProtein', label: 'Total Protein' },
  { value: 'BloodGlucose', label: 'Blood Glucose' },
  { value: 'Creatinine', label: 'Creatinine' },
  { value: 'Other', label: 'Other (specify)' },
] as const;

const MEAL_TYPE_SUGGESTIONS = [
  'Breakfast',
  'Mid-Morning Snack',
  'Lunch',
  'Afternoon Snack',
  'Dinner',
  'Evening Snack',
  'Other',
];

const SEVERITY_OPTIONS = [
  { value: 'None', label: 'None' },
  { value: 'Mild', label: 'Mild' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Severe', label: 'Severe' },
] as const;

const NutritionalAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientPath = `/patients/${id}`;

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreateNutritionalAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
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

  const dietaryRecallArray = useFieldArray({
    control,
    name: 'dietaryRecall',
  });

  const labResultsArray = useFieldArray({
    control,
    name: 'labResults',
  });

  const dietaryRecall = watch('dietaryRecall') ?? [];
  const labResults = watch('labResults') ?? [];

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreateNutritionalAssessmentFormData) => {
    // ── Filter out empty dietary-recall rows before submit.
    //    The backend requires mealType.min(1); blank rows would 400. ──
    const cleanedDietaryRecall = (data.dietaryRecall ?? []).filter(
      (r) => (r.mealType ?? '').trim().length > 0,
    );

    // ── Strip testOther when test isn't 'Other' ──
    const cleanedLabResults = (data.labResults ?? []).map((r) => ({
      ...r,
      testOther: r.test === 'Other' ? r.testOther : undefined,
    }));

    const payload = {
      ...data,
      dietaryRecall: cleanedDietaryRecall,
      labResults: cleanedLabResults,
    };

    createMutation.mutate(payload as any, {
      onSuccess: () => navigate(patientPath),
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ?? 'Failed to save assessment.';
        const fieldErrors = err?.response?.data?.errors;
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          toast.error(
            `${message} — ${fieldErrors
              .slice(0, 3)
              .map((e: any) => e.message ?? e.field)
              .join(', ')}`,
          );
        } else {
          toast.error(message);
        }
      },
    });
  };

  const onInvalid = (formErrors: any) => {
    const flat: string[] = [];

    const walk = (obj: any, path = ''): void => {
      if (!obj || typeof obj !== 'object') return;
      if ('message' in obj && typeof obj.message === 'string') {
        flat.push(`${path || 'form'}: ${obj.message}`);
        return;
      }
      for (const [k, v] of Object.entries(obj)) {
        const next = path ? `${path}.${k}` : k;
        if (Array.isArray(v)) {
          v.forEach((item, i) => walk(item, `${next}[${i}]`));
        } else {
          walk(v, next);
        }
      }
    };

    walk(formErrors);

    if (flat.length > 0) {
      const shown = flat.slice(0, 3).join(' • ');
      const rest = flat.length > 3 ? ` (+${flat.length - 3} more)` : '';
      toast.error(`Save failed — ${shown}${rest}`);
    } else {
      toast.error('Save failed — please review the form.');
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  // ── Convenience for YesNo boolean bridging ──
  const boolToYesNo = (v: boolean | undefined | null): 'Yes' | 'No' | '' =>
    v === undefined || v === null ? '' : v ? 'Yes' : 'No';

  return (
    <AssessmentFormShell
      title="Nutritional Assessment"
      patientLabel={patientLabel}
      backTo={patientPath}
      mode="create"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(patientPath)}
    >
      {/* ── 1. Assessment info ── */}
      <Section title="1. Assessment Information">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'Reassessment', label: 'Reassessment' },
          ]}
          placeholder="Select…"
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
            error={errors.weightKg?.message}
            {...register('weightKg', { valueAsNumber: true })}
          />
          <Input
            label="Height (cm)"
            type="number"
            step="0.1"
            error={errors.heightCm?.message}
            {...register('heightCm', { valueAsNumber: true })}
          />
          <Input
            label="BMI"
            type="number"
            step="0.1"
            error={errors.bmi?.message}
            {...register('bmi', { valueAsNumber: true })}
          />
          <Input
            label="MUAC (cm)"
            type="number"
            step="0.1"
            error={errors.muacCm?.message}
            {...register('muacCm', { valueAsNumber: true })}
          />
          <Input
            label="Recent Weight Loss (kg)"
            type="number"
            step="0.1"
            error={errors.recentWeightLossKg?.message}
            {...register('recentWeightLossKg', { valueAsNumber: true })}
          />
          <Input
            label="Weight Loss Period"
            placeholder="e.g. 3 months"
            error={errors.weightLossPeriod?.message}
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
          error={errors.nutritionalStatusClassification?.message}
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
            error={errors.weightSixMonthsAgoKg?.message}
            {...register('weightSixMonthsAgoKg', { valueAsNumber: true })}
          />
          <Input
            label="Weight 3 months ago (kg)"
            type="number"
            step="0.1"
            error={errors.weightThreeMonthsAgoKg?.message}
            {...register('weightThreeMonthsAgoKg', { valueAsNumber: true })}
          />
          <Input
            label="Current Weight (kg)"
            type="number"
            step="0.1"
            error={errors.currentWeightKg?.message}
            {...register('currentWeightKg', { valueAsNumber: true })}
          />
          <Input
            label="% Weight Loss"
            type="number"
            step="0.1"
            error={errors.percentageWeightLoss?.message}
            {...register('percentageWeightLoss', { valueAsNumber: true })}
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
          error={errors.significantWeightLoss?.message}
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
            error={errors.currentAppetite?.message}
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
            error={errors.appetiteTrend?.message}
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
          onChange={(v) =>
            setValue('appetiteCauses', v as any, { shouldDirty: true })
          }
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
            error={errors.mealsPerDay?.message}
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
            error={errors.oralIntake?.message}
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
            error={errors.fluidIntake?.message}
            {...register('fluidIntake')}
          />
          <Select
            label="Special Diet"
            options={[
              { value: 'No', label: 'No' },
              { value: 'Yes', label: 'Yes' },
            ]}
            placeholder="Select…"
            error={errors.specialDiet?.message}
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
            error={errors.feedingMethod?.message}
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
            error={errors.feedingAssistanceRequired?.message}
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
          value={boolToYesNo(watch('difficultySwallowing'))}
          onChange={(v) =>
            setValue('difficultySwallowing', v === 'Yes', { shouldDirty: true })
          }
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
        {dietaryRecall.length === 0 ? (
          <p className="text-xs text-text-muted -mt-2">
            No meals recorded yet. Click <strong>Add Meal</strong> to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {dietaryRecallArray.fields.map((field, i) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2 items-start"
              >
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Meal Type
                  </label>
                  <input
                    type="text"
                    list="meal-type-suggestions"
                    placeholder="e.g. Breakfast"
                    className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register(`dietaryRecall.${i}.mealType`)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Contents
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Porridge, tea"
                    className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register(`dietaryRecall.${i}.contents`)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-transparent mb-1">
                    &nbsp;
                  </label>
                  <button
                    type="button"
                    onClick={() => dietaryRecallArray.remove(i)}
                    className="flex h-[38px] w-10 items-center justify-center rounded-lg border border-border-base text-text-muted hover:text-error hover:bg-error-bg transition-all"
                    aria-label="Remove meal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <datalist id="meal-type-suggestions">
          {MEAL_TYPE_SUGGESTIONS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() =>
            dietaryRecallArray.append({ mealType: '', contents: '' })
          }
        >
          Add Meal
        </Button>

        {Array.isArray(errors.dietaryRecall) &&
          (errors.dietaryRecall as any).map((err: any, i: number) =>
            err?.mealType?.message ? (
              <p key={i} className="text-xs text-error">
                Meal {i + 1}: {err.mealType.message}
              </p>
            ) : null,
          )}
      </Section>

      {/* ── 8. GI symptoms ── */}
      <Section title="8. Gastrointestinal Symptoms">
        <Grid cols={2}>
          <Select
            label="Nausea Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.nauseaSeverity?.message}
            {...register('nauseaSeverity')}
          />
          <Select
            label="Vomiting Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.vomitingSeverity?.message}
            {...register('vomitingSeverity')}
          />
          <Select
            label="Constipation Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.constipationSeverity?.message}
            {...register('constipationSeverity')}
          />
          <Select
            label="Diarrhea Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.diarrheaSeverity?.message}
            {...register('diarrheaSeverity')}
          />
          <Select
            label="Abdominal Pain Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.abdominalPainSeverity?.message}
            {...register('abdominalPainSeverity')}
          />
          <Select
            label="Bloating Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.bloatingSeverity?.message}
            {...register('bloatingSeverity')}
          />
          <Select
            label="Mouth Sores Severity"
            options={SEVERITY_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select…"
            error={errors.mouthSoresSeverity?.message}
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
            error={errors.energyLevel?.message}
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
            error={errors.mealPreparation?.message}
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
            error={errors.feedingAbility?.message}
            {...register('feedingAbility')}
          />
        </Grid>
      </Section>

      {/* ── 10. Lab results ── */}
      <Section title="10. Laboratory Results">
        {labResults.length === 0 ? (
          <p className="text-xs text-text-muted -mt-2">
            No lab results recorded yet. Click <strong>Add Lab Result</strong>{' '}
            to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {labResultsArray.fields.map((field, i) => {
              const selectedTest = labResults[i]?.test;
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-start"
                >
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Test
                    </label>
                    <Select
                      options={LAB_TEST_OPTIONS as unknown as { value: string; label: string }[]}
                      placeholder="Select test…"
                      {...register(`labResults.${i}.test`)}
                    />
                  </div>

                  {selectedTest === 'Other' ? (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Specify test
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Folate"
                        className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        {...register(`labResults.${i}.testOther`)}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        &nbsp;
                      </label>
                      <div className="h-[38px] rounded-lg border border-dashed border-border-base/50 bg-surface-low/30 flex items-center justify-center text-[11px] text-text-muted">
                        n/a
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Result
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9.5 g/dL"
                      className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      {...register(`labResults.${i}.result`)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-transparent mb-1">
                      &nbsp;
                    </label>
                    <button
                      type="button"
                      onClick={() => labResultsArray.remove(i)}
                      className="flex h-[38px] w-10 items-center justify-center rounded-lg border border-border-base text-text-muted hover:text-error hover:bg-error-bg transition-all"
                      aria-label="Remove lab result"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() =>
            labResultsArray.append({
              test: 'Hemoglobin',
              testOther: '',
              result: '',
            })
          }
        >
          Add Lab Result
        </Button>

        {Array.isArray(errors.labResults) &&
          (errors.labResults as any).map((err: any, i: number) =>
            err?.test?.message ? (
              <p key={i} className="text-xs text-error">
                Lab row {i + 1}: {err.test.message}
              </p>
            ) : null,
          )}
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
          onChange={(v) =>
            setValue('riskFactors', v as any, { shouldDirty: true })
          }
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
          error={errors.overallNutritionalRisk?.message}
          {...register('overallNutritionalRisk')}
        />
      </Section>

      {/* ── 12. Food security ── */}
      <Section title="12. Food Security">
        <Grid cols={2}>
          <YesNo
            label="Adequate food access?"
            name="adequateFoodAccess"
            value={boolToYesNo(watch('adequateFoodAccess'))}
            onChange={(v) =>
              setValue('adequateFoodAccess', v === 'Yes', { shouldDirty: true })
            }
          />
          <YesNo
            label="Financial barriers to nutrition?"
            name="financialBarriersToNutrition"
            value={boolToYesNo(watch('financialBarriersToNutrition'))}
            onChange={(v) =>
              setValue('financialBarriersToNutrition', v === 'Yes', {
                shouldDirty: true,
              })
            }
          />
          <YesNo
            label="Requires nutritional assistance?"
            name="requiresNutritionalAssistance"
            value={boolToYesNo(watch('requiresNutritionalAssistance'))}
            onChange={(v) =>
              setValue('requiresNutritionalAssistance', v === 'Yes', {
                shouldDirty: true,
              })
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
          onChange={(v) =>
            setValue('diagnoses', v as any, { shouldDirty: true })
          }
        />
        {watch('diagnoses')?.includes('Other') && (
          <Input label="Other diagnosis" {...register('diagnosisOther')} />
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
          onChange={(v) =>
            setValue('interventions', v as any, { shouldDirty: true })
          }
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
          onChange={(v) =>
            setValue('monitoringPlans', v as any, { shouldDirty: true })
          }
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
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
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
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default NutritionalAssessmentFormPage;