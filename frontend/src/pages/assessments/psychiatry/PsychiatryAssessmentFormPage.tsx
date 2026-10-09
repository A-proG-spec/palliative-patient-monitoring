import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreatePsychiatryAssessment,
  usePsychiatryAssessment,
  useUpdatePsychiatryAssessment,
} from '@/hooks/usePsychiatryAssessments';
import {
  createPsychiatryAssessmentSchema,
  type CreatePsychiatryAssessmentFormData,
} from '@/schemas/psychiatry-assessment.schema';

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
import { useToast } from '@/context/ToastContext';

// ── Helpers ─────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

const toYesNo = (v: boolean | null | undefined): 'Yes' | 'No' | '' =>
  v === undefined || v === null ? '' : v ? 'Yes' : 'No';

const PsychiatryAssessmentFormPage: React.FC = () => {
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

  const { data: patient, isLoading, error, refetch } = usePatient(id!);

  const createMutation = useCreatePsychiatryAssessment(id!);
  const updateMutation = useUpdatePsychiatryAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } = usePsychiatryAssessment(
    id!,
    assessmentId ?? '',
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePsychiatryAssessmentFormData>({
    resolver: zodResolver(createPsychiatryAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      currentSymptoms: [],
      appearanceBehavior: [],
      thoughtProcess: [],
      thoughtContent: [],
      perception: [],
      cognition: [],
      protectiveFactors: [],
      organicCauses: [],
      diagnoses: [],
      immediateInterventions: [],
      pharmacologicalPlan: [],
      nonPharmacologicalPlan: [],
      monitoringPlan: [],
      assessmentOutcome: [],
      finalRecommendations: [],
    },
  });

  // ═══════════════════════════════════════════════════════════
  // EDIT: hydrate form from server record
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',

      reasonForReferral: existing.reasonForReferral ?? undefined,
      currentSymptoms: existing.currentSymptoms ?? [],
      symptomOther: existing.symptomOther ?? undefined,
      onsetAndDuration: existing.onsetAndDuration ?? undefined,
      severity: existing.severity ?? undefined,

      appearanceBehavior: existing.appearanceBehavior ?? [],
      speech: existing.speech ?? undefined,
      mood: existing.mood ?? undefined,
      affect: existing.affect ?? undefined,
      thoughtProcess: existing.thoughtProcess ?? [],
      thoughtContent: existing.thoughtContent ?? [],
      perception: existing.perception ?? [],
      cognition: existing.cognition ?? [],
      insightJudgment: existing.insightJudgment ?? undefined,

      suicidalIdeation: existing.suicidalIdeation ?? undefined,
      suicideRiskLevel: existing.suicideRiskLevel ?? undefined,
      protectiveFactors: existing.protectiveFactors ?? [],

      organicCauses: existing.organicCauses ?? [],
      medicationsAffectingMentalState:
        existing.medicationsAffectingMentalState ?? undefined,

      sleepPattern: existing.sleepPattern ?? undefined,
      appetite: existing.appetite ?? undefined,
      dailyFunctioning: existing.dailyFunctioning ?? undefined,
      socialWithdrawal: existing.socialWithdrawal ?? undefined,

      diagnoses: existing.diagnoses ?? [],
      diagnosisOther: existing.diagnosisOther ?? undefined,

      immediateInterventions: existing.immediateInterventions ?? [],
      pharmacologicalPlan: existing.pharmacologicalPlan ?? [],
      nonPharmacologicalPlan: existing.nonPharmacologicalPlan ?? [],
      monitoringPlan: existing.monitoringPlan ?? [],

      familyDistressLevel: existing.familyDistressLevel ?? undefined,
      caregiverBurnout: existing.caregiverBurnout ?? undefined,
      familyCounselingNeeded: existing.familyCounselingNeeded ?? undefined,

      assessmentOutcome: existing.assessmentOutcome ?? [],
      finalRecommendations: existing.finalRecommendations ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ═══════════════════════════════════════════════════════════
  // Submit — create OR update depending on mode
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreatePsychiatryAssessmentFormData) => {
    const handleSuccess = () => {
      // Notify on high suicide risk — only when creating,
      // so we don't re-alert on every edit save.
      if (!isEditMode && data.suicideRiskLevel === 'High') {
        toast.success(
          'High-risk assessment saved — administrators have been notified.',
        );
      }
      navigate(basePath);
    };

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message =
        'Could not save the psychiatry assessment. Please try again.';

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

  // ── Loading / error states ──
  if (isLoading || (isEditMode && existingLoading)) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  const suicideRiskLevel = watch('suicideRiskLevel');
  const isHighRisk = suicideRiskLevel === 'High';

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Psychiatry Assessment"
      patientLabel={patientLabel}
      backTo={basePath}
      mode={isEditMode ? 'edit' : 'create'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(basePath)}
    >
      {/* ── High-risk safety banner ── */}
      {isHighRisk && (
        <div className="rounded-lg border border-error/30 bg-error-bg/40 px-4 py-3 flex items-start gap-3">
          <AlertTriangle
            size={18}
            className="text-error flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              High suicide risk recorded
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Saving this assessment will notify administrators automatically.
              Ensure crisis precautions and safety planning are documented in
              the intervention sections below.
            </p>
          </div>
        </div>
      )}

      <Section title="1. Assessment Type">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'EmergencyReview', label: 'Emergency Review' },
          ]}
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      <Section title="2. Presenting Problem">
        <Textarea
          label="Reason for Referral"
          rows={3}
          {...register('reasonForReferral')}
        />
        <CheckboxGroup
          label="Current Symptoms"
          values={watch('currentSymptoms') ?? []}
          options={[
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
          ]}
          onChange={(v) =>
            setValue('currentSymptoms', v as any, { shouldDirty: true })
          }
        />
        {watch('currentSymptoms')?.includes('Other') && (
          <Input label="Other symptom" {...register('symptomOther')} />
        )}
        <Grid cols={2}>
          <Input
            label="Onset & Duration"
            placeholder="e.g. 3 weeks, worsening"
            {...register('onsetAndDuration')}
          />
          <Select
            label="Overall Severity"
            options={[
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
              { value: 'Fluctuating', label: 'Fluctuating' },
            ]}
            placeholder="Select…"
            {...register('severity')}
          />
        </Grid>
      </Section>

      <Section title="3. Mental State Examination">
        <CheckboxGroup
          label="Appearance & Behavior"
          values={watch('appearanceBehavior') ?? []}
          options={['Calm', 'Restless', 'Agitated', 'Withdrawn', 'PoorSelfCare']}
          onChange={(v) =>
            setValue('appearanceBehavior', v as any, { shouldDirty: true })
          }
        />
        <Grid cols={2}>
          <Select
            label="Speech"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Slow', label: 'Slow' },
              { value: 'Pressured', label: 'Pressured' },
              { value: 'Minimal', label: 'Minimal' },
            ]}
            placeholder="Select…"
            {...register('speech')}
          />
          <Select
            label="Mood"
            options={[
              { value: 'Euthymic', label: 'Euthymic' },
              { value: 'Depressed', label: 'Depressed' },
              { value: 'Anxious', label: 'Anxious' },
              { value: 'Irritable', label: 'Irritable' },
            ]}
            placeholder="Select…"
            {...register('mood')}
          />
          <Select
            label="Affect"
            options={[
              { value: 'Appropriate', label: 'Appropriate' },
              { value: 'Blunted', label: 'Blunted' },
              { value: 'Flat', label: 'Flat' },
              { value: 'Labile', label: 'Labile' },
            ]}
            placeholder="Select…"
            {...register('affect')}
          />
          <Select
            label="Insight & Judgment"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Partial', label: 'Partial' },
              { value: 'Poor', label: 'Poor' },
            ]}
            placeholder="Select…"
            {...register('insightJudgment')}
          />
        </Grid>
        <CheckboxGroup
          label="Thought Process"
          values={watch('thoughtProcess') ?? []}
          options={['Logical', 'Circumstantial', 'Disorganized', 'Tangential']}
          onChange={(v) =>
            setValue('thoughtProcess', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Thought Content"
          values={watch('thoughtContent') ?? []}
          options={[
            'NoDelusions',
            'Hopelessness',
            'Guilt',
            'SuicidalThoughts',
            'Paranoia',
            'SomaticPreoccupation',
          ]}
          onChange={(v) =>
            setValue('thoughtContent', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Perception"
          values={watch('perception') ?? []}
          options={[
            'NoHallucinations',
            'AuditoryHallucinations',
            'VisualHallucinations',
          ]}
          onChange={(v) =>
            setValue('perception', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Cognition"
          values={watch('cognition') ?? []}
          options={[
            'OrientedX3',
            'Disoriented',
            'MemoryImpairment',
            'AttentionDeficits',
          ]}
          onChange={(v) =>
            setValue('cognition', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="4. Suicide Risk Assessment">
        <Grid cols={2}>
          <Select
            label="Suicidal Ideation"
            options={[
              { value: 'None', label: 'None' },
              { value: 'PassiveThoughts', label: 'Passive thoughts' },
              { value: 'ActiveThoughts', label: 'Active thoughts' },
              { value: 'PlanPresent', label: 'Plan present' },
            ]}
            placeholder="Select…"
            {...register('suicidalIdeation')}
          />
          <Select
            label="Suicide Risk Level"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
            ]}
            placeholder="Select…"
            {...register('suicideRiskLevel')}
          />
        </Grid>
        <CheckboxGroup
          label="Protective Factors"
          values={watch('protectiveFactors') ?? []}
          options={[
            'FamilySupport',
            'ReligiousBeliefs',
            'FearOfDeath',
            'ResponsibilityForFamily',
            'SocialSupport',
          ]}
          onChange={(v) =>
            setValue('protectiveFactors', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="5. Organic Causes to Rule Out">
        <CheckboxGroup
          label="Organic Causes"
          values={watch('organicCauses') ?? []}
          options={[
            'Pain',
            'Hypoxia',
            'Infection',
            'MedicationSideEffects',
            'MetabolicImbalance',
            'Delirium',
            'CancerProgression',
          ]}
          onChange={(v) =>
            setValue('organicCauses', v as any, { shouldDirty: true })
          }
        />
        <Textarea
          label="Medications Affecting Mental State"
          rows={2}
          {...register('medicationsAffectingMentalState')}
        />
      </Section>

      <Section title="6. Sleep & Appetite">
        <Grid cols={2}>
          <Select
            label="Sleep Pattern"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Insomnia', label: 'Insomnia' },
              { value: 'FragmentedSleep', label: 'Fragmented sleep' },
              { value: 'ExcessiveSleepiness', label: 'Excessive sleepiness' },
            ]}
            placeholder="Select…"
            {...register('sleepPattern')}
          />
          <Select
            label="Appetite"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Reduced', label: 'Reduced' },
              { value: 'Poor', label: 'Poor' },
            ]}
            placeholder="Select…"
            {...register('appetite')}
          />
        </Grid>
      </Section>

      <Section title="7. Functional & Social Status">
        <Grid cols={2}>
          <Select
            label="Daily Functioning"
            options={[
              { value: 'Independent', label: 'Independent' },
              { value: 'RequiresAssistance', label: 'Requires assistance' },
              { value: 'Dependent', label: 'Dependent' },
            ]}
            placeholder="Select…"
            {...register('dailyFunctioning')}
          />
          <Select
            label="Social Withdrawal"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('socialWithdrawal')}
          />
        </Grid>
      </Section>

      <Section title="8. Psychiatric Diagnosis">
        <CheckboxGroup
          label="Diagnoses"
          values={watch('diagnoses') ?? []}
          options={[
            'MajorDepressiveDisorder',
            'AnxietyDisorder',
            'AdjustmentDisorder',
            'Delirium',
            'DepressionDueToMedicalCondition',
            'MixedAnxietyDepression',
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

      <Section title="9. Psychiatric Care Plan">
        <CheckboxGroup
          label="Immediate Interventions"
          values={watch('immediateInterventions') ?? []}
          options={[
            'CrisisManagement',
            'SuicidePrecautions',
            'EnvironmentalSafety',
            'SupportiveCounseling',
            'FamilyCounseling',
          ]}
          onChange={(v) =>
            setValue('immediateInterventions', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Pharmacological Plan"
          values={watch('pharmacologicalPlan') ?? []}
          options={[
            'Antidepressants',
            'Anxiolytics',
            'Antipsychotics',
            'SleepMedications',
            'DoseAdjustmentReview',
          ]}
          onChange={(v) =>
            setValue('pharmacologicalPlan', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Non-Pharmacological Plan"
          values={watch('nonPharmacologicalPlan') ?? []}
          options={[
            'Psychotherapy',
            'RelaxationTechniques',
            'SpiritualSupport',
            'MusicTherapy',
            'BehavioralActivation',
          ]}
          onChange={(v) =>
            setValue('nonPharmacologicalPlan', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Monitoring Plan"
          values={watch('monitoringPlan') ?? []}
          options={['Daily', 'Weekly', 'AsNeeded']}
          onChange={(v) =>
            setValue('monitoringPlan', v as any, { shouldDirty: true })
          }
        />
      </Section>

      <Section title="10. Family & Caregiver">
        <Select
          label="Family Distress Level"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
          ]}
          placeholder="Select…"
          {...register('familyDistressLevel')}
        />
        <Grid cols={2}>
          <YesNo
            label="Caregiver burnout?"
            name="caregiverBurnout"
            value={toYesNo(watch('caregiverBurnout'))}
            onChange={(v) =>
              setValue('caregiverBurnout', v === 'Yes', { shouldDirty: true })
            }
          />
          <YesNo
            label="Family counseling needed?"
            name="familyCounselingNeeded"
            value={toYesNo(watch('familyCounselingNeeded'))}
            onChange={(v) =>
              setValue('familyCounselingNeeded', v === 'Yes', {
                shouldDirty: true,
              })
            }
          />
        </Grid>
      </Section>

      <Section title="11. Summary & Recommendations">
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'NoPsychiatricInterventionRequired',
            'RequiresSupportiveCounseling',
            'RequiresPharmacologicalTreatment',
            'RequiresCloseMonitoring',
            'HighRiskSafetyPrecautionsRequired',
          ]}
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ContinueHospicePsychologicalSupport',
            'InitiatePsychiatricMedication',
            'CrisisInterventionRequired',
            'FamilyCounselingRequired',
            'OngoingPsychiatricFollowUp',
          ]}
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PsychiatryAssessmentFormPage;