import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreatePhysiotherapyAssessment,
  usePhysiotherapyAssessment,
  useUpdatePhysiotherapyAssessment,
} from '@/hooks/usePhysiotherapyAssessments';
import {
  createPhysiotherapyAssessmentSchema,
  type CreatePhysiotherapyAssessmentFormData,
} from '@/schemas/physiotherapy-assessment.schema';

import { AssessmentFormShell } from '@/components/assessments/AssessmentFormShell';
import {
  Section,
  Grid,
  CheckboxGroup,
} from '@/components/assessments/FormPrimitives';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

import { useRecordAccess } from '@/hooks/useRecordAccess';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/context/ToastContext';

// ── Helpers ─────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

const ADL_ACTIVITIES = [
  { value: 'BedMobility', label: 'Bed Mobility' },
  { value: 'Feeding', label: 'Feeding' },
  { value: 'Bathing', label: 'Bathing' },
  { value: 'Dressing', label: 'Dressing' },
  { value: 'Toileting', label: 'Toileting' },
] as const;

const ADL_LEVELS = [
  { value: 'Independent', label: 'Independent' },
  { value: 'Assisted', label: 'Assisted' },
  { value: 'Dependent', label: 'Dependent' },
] as const;

const PhysiotherapyAssessmentFormPage: React.FC = () => {
  const { id, assessmentId } = useParams<{
    id: string;
    assessmentId?: string;
  }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();

  // ── Mode detection ──
  const isEditMode = Boolean(assessmentId);

  // ── Route-aware base path ──
  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  const access = useRecordAccess('physiotherapyAssessment');

  const { data: patient, isLoading, error, refetch } = usePatient(id!);

  const createMutation = useCreatePhysiotherapyAssessment(id!);
  const updateMutation = useUpdatePhysiotherapyAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } =
    usePhysiotherapyAssessment(id!, assessmentId ?? '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePhysiotherapyAssessmentFormData>({
    resolver: zodResolver(createPhysiotherapyAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      comorbidities: [],
      painTypes: [],
      symptoms: [],
      assistiveDevices: [],
      respiratoryNeeds: [],
      pressureAreas: [],
      pressurePreventions: [],
      fallContributors: [],
      diagnosis: [],
      interventions: [],
      frequency: [],
      equipment: [],
      caregiverTrainings: [],
      outcome: [],
      finalRecommendations: [],
      adl: [],
    },
  });

  // ═══════════════════════════════════════════════════════════
  // EDIT: hydrate form from server record
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',

      comorbidities: existing.comorbidities ?? [],
      comorbidityOther: existing.comorbidityOther ?? undefined,
      generalCondition: existing.generalCondition ?? undefined,

      painLevel: existing.painLevel ?? undefined,
      painTypes: existing.painTypes ?? [],
      painTypeOther: existing.painTypeOther ?? undefined,
      symptoms: existing.symptoms ?? [],

      mobilityStatus: existing.mobilityStatus ?? undefined,
      transferAbility: existing.transferAbility ?? undefined,
      walkingAbility: existing.walkingAbility ?? undefined,
      assistiveDevices: existing.assistiveDevices ?? [],
      assistiveDeviceOther: existing.assistiveDeviceOther ?? undefined,

      upperLimbStrength: existing.upperLimbStrength ?? undefined,
      lowerLimbStrength: existing.lowerLimbStrength ?? undefined,
      rangeOfMotion: existing.rangeOfMotion ?? undefined,
      jointPainOrStiffness: existing.jointPainOrStiffness ?? undefined,
      jointPainLocation: existing.jointPainLocation ?? undefined,

      consciousness: existing.consciousness ?? undefined,
      coordination: existing.coordination ?? undefined,
      sensoryDeficit: existing.sensoryDeficit ?? undefined,
      balance: existing.balance ?? undefined,

      breathingPattern: existing.breathingPattern ?? undefined,
      breathlessnessLevel: existing.breathlessnessLevel ?? undefined,
      chestExpansion: existing.chestExpansion ?? undefined,
      respiratoryNeeds: existing.respiratoryNeeds ?? [],

      pressureRisk: existing.pressureRisk ?? undefined,
      pressureAreas: existing.pressureAreas ?? [],
      pressureAreaOther: existing.pressureAreaOther ?? undefined,
      pressurePreventions: existing.pressurePreventions ?? [],

      adl: (existing.adl ?? []) as any,

      fallHistory: existing.fallHistory ?? undefined,
      fallRiskLevel: existing.fallRiskLevel ?? undefined,
      fallContributors: existing.fallContributors ?? [],

      diagnosis: existing.diagnosis ?? [],
      goals: existing.goals ?? undefined,
      interventions: existing.interventions ?? [],
      frequency: existing.frequency ?? [],
      equipment: existing.equipment ?? [],
      caregiverTrainings: existing.caregiverTrainings ?? [],

      outcome: existing.outcome ?? [],
      finalRecommendations: existing.finalRecommendations ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ═══════════════════════════════════════════════════════════
  // Submit — create OR update depending on mode
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreatePhysiotherapyAssessmentFormData) => {
    const handleSuccess = () => navigate(basePath);

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message =
        'Could not save the physiotherapy assessment. Please try again.';

      if (status === 400) {
        message =
          'Some fields are missing or invalid. Please review the highlighted fields.';
      } else if (status === 403) {
        message = 'You do not have permission to save this assessment.';
      } else if (status === 404) {
        message =
          'Patient or assessment not found. Please refresh and try again.';
      } else if (status >= 500) {
        message = 'Server error. Please try again in a moment.';
      } else if (!err?.response) {
        message = 'Network error. Please check your connection and try again.';
      }

      toast.error(message);
    };

    if (isEditMode && assessmentId) {
      updateMutation.mutate(
        { assessmentId, data: data as any },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      createMutation.mutate(data as any, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  };

  // ── Surface validation errors as a single clean toast ──
  const onInvalid = (formErrors: any) => {
    const count = Object.keys(formErrors ?? {}).length;

    if (count === 0) {
      toast.error('Please review the form and try again.');
      return;
    }

    toast.error(
      count === 1
        ? 'Please fix the highlighted field and try again.'
        : `Please fix the ${count} highlighted fields and try again.`,
    );
  };

  // ── ADL row editor ──
  const currentAdl = watch('adl') ?? [];

  const getAdlLevel = (activity: string): string =>
    currentAdl.find((r) => r.activity === activity)?.level ?? '';

  const setAdlLevel = (activity: string, level: string) => {
    const rest = currentAdl.filter((r) => r.activity !== activity);
    const next = level ? [...rest, { activity, level } as any] : rest;
    setValue('adl', next, { shouldDirty: true, shouldValidate: true });
  };

  // ── Loading / error states ──
  if (isLoading || (isEditMode && existingLoading)) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // ── Write gate — admin bypasses the record-role check ──
  if ((!isAdmin && !access.allowed) || patient.status === 'Discharged') {
    return <Navigate to={`${basePath}/physiotherapy-assessment`} replace />;
  }

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Physiotherapy Assessment"
      patientLabel={patientLabel}
      backTo={basePath}
      mode={isEditMode ? 'edit' : 'create'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(basePath)}
    >
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

      <Section title="2. Medical Overview">
        <CheckboxGroup
          label="Comorbidities"
          values={watch('comorbidities') ?? []}
          options={[
            'Hypertension',
            'DiabetesMellitus',
            'Stroke',
            'COPD',
            'HeartFailure',
            'Cancer',
            'Other',
          ]}
          onChange={(v) =>
            setValue('comorbidities', v as any, { shouldDirty: true })
          }
        />
        {watch('comorbidities')?.includes('Other') && (
          <Input
            label="Other comorbidities"
            {...register('comorbidityOther')}
          />
        )}
        <Select
          label="General Condition"
          options={[
            { value: 'Stable', label: 'Stable' },
            { value: 'Deteriorating', label: 'Deteriorating' },
            { value: 'Bedbound', label: 'Bed-bound' },
            { value: 'TerminalPhase', label: 'Terminal phase' },
          ]}
          placeholder="Select…"
          {...register('generalCondition')}
        />
      </Section>

      <Section title="3. Pain & Symptoms">
        <Input
          label="Pain Level (0–10)"
          type="number"
          min={0}
          max={10}
          error={errors.painLevel?.message}
          {...register('painLevel', { valueAsNumber: true })}
        />
        <CheckboxGroup
          label="Pain Types"
          values={watch('painTypes') ?? []}
          options={[
            'Musculoskeletal',
            'Neuropathic',
            'CancerRelated',
            'Mixed',
            'Other',
          ]}
          onChange={(v) =>
            setValue('painTypes', v as any, { shouldDirty: true })
          }
        />
        {watch('painTypes')?.includes('Other') && (
          <Input label="Other pain type" {...register('painTypeOther')} />
        )}
        <CheckboxGroup
          label="Symptoms"
          values={watch('symptoms') ?? []}
          options={[
            'Fatigue',
            'Dyspnea',
            'Weakness',
            'MuscleStiffness',
            'BalanceProblems',
            'Contractures',
          ]}
          onChange={(v) =>
            setValue('symptoms', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="4. Functional Mobility">
        <Grid cols={2}>
          <Select
            label="Mobility Status"
            options={[
              { value: 'Independent', label: 'Independent' },
              { value: 'RequiresAssistance', label: 'Requires assistance' },
              { value: 'WheelchairBound', label: 'Wheelchair-bound' },
              { value: 'Bedridden', label: 'Bedridden' },
            ]}
            placeholder="Select…"
            {...register('mobilityStatus')}
          />
          <Select
            label="Transfer Ability"
            options={[
              { value: 'Independent', label: 'Independent' },
              { value: 'MinimalAssistance', label: 'Minimal assistance' },
              { value: 'ModerateAssistance', label: 'Moderate assistance' },
              { value: 'Dependent', label: 'Dependent' },
            ]}
            placeholder="Select…"
            {...register('transferAbility')}
          />
          <Select
            label="Walking Ability"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'ReducedDistance', label: 'Reduced distance' },
              { value: 'WithAid', label: 'With aid' },
              { value: 'UnableToWalk', label: 'Unable to walk' },
            ]}
            placeholder="Select…"
            {...register('walkingAbility')}
          />
        </Grid>
        <CheckboxGroup
          label="Assistive Devices"
          values={watch('assistiveDevices') ?? []}
          options={['None', 'Cane', 'Walker', 'Wheelchair', 'Other']}
          onChange={(v) =>
            setValue('assistiveDevices', v as any, { shouldDirty: true })
          }
        />
        {watch('assistiveDevices')?.includes('Other') && (
          <Input
            label="Other assistive device"
            {...register('assistiveDeviceOther')}
          />
        )}
      </Section>

      <Section title="5. Musculoskeletal Assessment">
        <Grid cols={2}>
          <Input
            label="Upper Limb Strength (0–5)"
            type="number"
            min={0}
            max={5}
            error={errors.upperLimbStrength?.message}
            {...register('upperLimbStrength', { valueAsNumber: true })}
          />
          <Input
            label="Lower Limb Strength (0–5)"
            type="number"
            min={0}
            max={5}
            error={errors.lowerLimbStrength?.message}
            {...register('lowerLimbStrength', { valueAsNumber: true })}
          />
          <Select
            label="Range of Motion"
            options={[
              { value: 'Full', label: 'Full' },
              { value: 'Reduced', label: 'Reduced' },
              { value: 'SeverelyLimited', label: 'Severely limited' },
            ]}
            placeholder="Select…"
            {...register('rangeOfMotion')}
          />
          <Select
            label="Joint Pain / Stiffness"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Present', label: 'Present' },
            ]}
            placeholder="Select…"
            {...register('jointPainOrStiffness')}
          />
        </Grid>
        <Input
          label="Joint Pain Location"
          {...register('jointPainLocation')}
        />
      </Section>

      <Section title="6. Neurological Assessment">
        <Grid cols={2}>
          <Select
            label="Consciousness"
            options={[
              { value: 'Alert', label: 'Alert' },
              { value: 'Drowsy', label: 'Drowsy' },
              { value: 'Confused', label: 'Confused' },
            ]}
            placeholder="Select…"
            {...register('consciousness')}
          />
          <Select
            label="Coordination"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Impaired', label: 'Impaired' },
            ]}
            placeholder="Select…"
            {...register('coordination')}
          />
          <Select
            label="Sensory Deficit"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Present', label: 'Present' },
            ]}
            placeholder="Select…"
            {...register('sensoryDeficit')}
          />
          <Select
            label="Balance"
            options={[
              { value: 'Stable', label: 'Stable' },
              { value: 'Unstable', label: 'Unstable' },
              { value: 'HighFallRisk', label: 'High fall risk' },
            ]}
            placeholder="Select…"
            {...register('balance')}
          />
        </Grid>
      </Section>

      <Section title="7. Respiratory Assessment">
        <Grid cols={2}>
          <Select
            label="Breathing Pattern"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Shallow', label: 'Shallow' },
              { value: 'Labored', label: 'Labored' },
            ]}
            placeholder="Select…"
            {...register('breathingPattern')}
          />
          <Select
            label="Breathlessness"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('breathlessnessLevel')}
          />
          <Select
            label="Chest Expansion"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Reduced', label: 'Reduced' },
            ]}
            placeholder="Select…"
            {...register('chestExpansion')}
          />
        </Grid>
        <CheckboxGroup
          label="Respiratory Needs"
          values={watch('respiratoryNeeds') ?? []}
          options={[
            'BreathingExercises',
            'ChestPhysiotherapy',
            'PositioningSupport',
          ]}
          onChange={(v) =>
            setValue('respiratoryNeeds', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="8. Pressure Injury Risk">
        <Select
          label="Pressure Risk"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
          ]}
          placeholder="Select…"
          {...register('pressureRisk')}
        />
        <CheckboxGroup
          label="Pressure Areas"
          values={watch('pressureAreas') ?? []}
          options={['None', 'Sacrum', 'Heels', 'Hips', 'Other']}
          onChange={(v) =>
            setValue('pressureAreas', v as any, { shouldDirty: true })
          }
        />
        {watch('pressureAreas')?.includes('Other') && (
          <Input
            label="Other pressure area"
            {...register('pressureAreaOther')}
          />
        )}
        <CheckboxGroup
          label="Prevention Strategies"
          values={watch('pressurePreventions') ?? []}
          options={[
            'Repositioning',
            'PressureMattress',
            'SkinCareEducation',
            'PassiveExercises',
          ]}
          onChange={(v) =>
            setValue('pressurePreventions', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="9. Activities of Daily Living">
        <p className="text-xs text-text-muted -mt-2">
          Rate each activity — leave blank if not assessed.
        </p>
        <Grid cols={2}>
          {ADL_ACTIVITIES.map(({ value: activity, label }) => (
            <div key={activity}>
              <label className="block text-sm font-medium text-on-surface mb-1">
                {label}
              </label>
              <Select
                options={
                  ADL_LEVELS as unknown as { value: string; label: string }[]
                }
                placeholder="Select…"
                value={getAdlLevel(activity)}
                onChange={(e) => setAdlLevel(activity, e.target.value)}
              />
            </div>
          ))}
        </Grid>
      </Section>

      <Section title="10. Fall Risk">
        <Grid cols={2}>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Fall History
            </label>
            <Select
              options={[
                { value: '', label: 'Not recorded' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              placeholder="Select…"
              value={
                watch('fallHistory') === undefined
                  ? ''
                  : watch('fallHistory')
                    ? 'true'
                    : 'false'
              }
              onChange={(e) => {
                const v = e.target.value;
                setValue(
                  'fallHistory',
                  v === '' ? undefined : v === 'true',
                  { shouldDirty: true },
                );
              }}
            />
          </div>
          <Select
            label="Fall Risk Level"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
            ]}
            placeholder="Select…"
            {...register('fallRiskLevel')}
          />
        </Grid>
        <CheckboxGroup
          label="Fall Contributors"
          values={watch('fallContributors') ?? []}
          options={[
            'Weakness',
            'BalanceIssues',
            'SedativeMedication',
            'EnvironmentalHazards',
            'PosturalHypotension',
          ]}
          onChange={(v) =>
            setValue('fallContributors', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="11. Physiotherapy Diagnosis">
        <CheckboxGroup
          label="Diagnoses"
          values={watch('diagnosis') ?? []}
          options={[
            'DecreasedMobility',
            'MuscleWeakness',
            'ImpairedBalance',
            'ReducedEndurance',
            'JointStiffness',
            'RiskOfContractures',
            'ReducedFunctionalIndependence',
          ]}
          onChange={(v) =>
            setValue('diagnosis', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="12. Physiotherapy Care Plan">
        <Textarea label="Goals" rows={3} {...register('goals')} />
        <CheckboxGroup
          label="Interventions"
          values={watch('interventions') ?? []}
          options={[
            'PassiveRangeOfMotionExercises',
            'ActiveAssistedExercises',
            'BreathingExercises',
            'PositioningProgram',
            'PainReductionTechniques',
            'MobilityTraining',
            'SittingBalanceTraining',
            'WalkingAssistance',
            'FamilyCaregiverTraining',
          ]}
          onChange={(v) =>
            setValue('interventions', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Frequency"
          values={watch('frequency') ?? []}
          options={[
            'Daily',
            'ThreeToFiveTimesPerWeek',
            'Weekly',
            'AsTolerated',
          ]}
          onChange={(v) =>
            setValue('frequency', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="13. Equipment Needs">
        <CheckboxGroup
          label="Equipment"
          values={watch('equipment') ?? []}
          options={[
            'Wheelchair',
            'WalkingFrame',
            'Crutches',
            'PressureMattress',
            'BedRails',
            'TransferBoard',
            'None',
          ]}
          onChange={(v) =>
            setValue('equipment', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="14. Caregiver Training Needs">
        <CheckboxGroup
          label="Training Topics"
          values={watch('caregiverTrainings') ?? []}
          options={[
            'PositioningTechniques',
            'SafeTransfers',
            'ExerciseAssistance',
            'FallPrevention',
            'PressureSorePrevention',
            'MobilitySupport',
          ]}
          onChange={(v) =>
            setValue('caregiverTrainings', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="15. Summary & Recommendations">
        <CheckboxGroup
          label="Outcome"
          values={watch('outcome') ?? []}
          options={[
            'FullyIndependent',
            'RehabilitationNotRequired',
            'RequiresSupportivePhysiotherapy',
            'RequiresIntensiveMobilitySupport',
            'HighRiskForFunctionalDecline',
            'PalliativeComfortFocusedPhysiotherapyRequired',
          ]}
          onChange={(v) =>
            setValue('outcome', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ComfortFocusedPhysiotherapy',
            'MobilityMaintenanceExercises',
            'PainReliefPositioningTherapy',
            'BreathingExercises',
            'CaregiverTraining',
            'MultidisciplinaryHospiceCarePlan',
          ]}
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PhysiotherapyAssessmentFormPage;