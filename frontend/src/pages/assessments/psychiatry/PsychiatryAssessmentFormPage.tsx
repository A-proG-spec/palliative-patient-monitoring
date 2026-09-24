import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';

import { usePatient } from '@/hooks/usePatients';
import { useCreatePsychiatryAssessment } from '@/hooks/usePsychiatryAssessments';
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

const PsychiatryAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreatePsychiatryAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const onSubmit = (data: CreatePsychiatryAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${
    patient.patientDisplayId ?? patient.id
  }`;

  const suicideRiskLevel = watch('suicideRiskLevel');
  const isHighRisk = suicideRiskLevel === 'High';

  return (
    <AssessmentFormShell
      title="Psychiatry Assessment"
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      mode="create"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(`/patients/${id}`)}
    >
      {/* ── Safety banner ── */}
      {isHighRisk && (
        <div className="rounded-xl border border-error/30 bg-error-bg px-4 py-3 flex items-start gap-3">
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

      {/* ── 1. Assessment type ── */}
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

      {/* ── 2. Presenting problem ── */}
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
          onChange={(v) => setValue('currentSymptoms', v as any)}
        />
        {watch('currentSymptoms')?.includes('Other') && (
          <Input
            label="Other symptom"
            {...register('symptomOther')}
          />
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

      {/* ── 3. Mental state examination ── */}
      <Section title="3. Mental State Examination">
        <CheckboxGroup
          label="Appearance & Behavior"
          values={watch('appearanceBehavior') ?? []}
          options={['Calm', 'Restless', 'Agitated', 'Withdrawn', 'PoorSelfCare']}
          onChange={(v) => setValue('appearanceBehavior', v as any)}
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
          onChange={(v) => setValue('thoughtProcess', v as any)}
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
          onChange={(v) => setValue('thoughtContent', v as any)}
        />
        <CheckboxGroup
          label="Perception"
          values={watch('perception') ?? []}
          options={[
            'NoHallucinations',
            'AuditoryHallucinations',
            'VisualHallucinations',
          ]}
          onChange={(v) => setValue('perception', v as any)}
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
          onChange={(v) => setValue('cognition', v as any)}
        />
      </Section>

      {/* ── 4. Suicide risk assessment (safety-critical) ── */}
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
          onChange={(v) => setValue('protectiveFactors', v as any)}
        />
      </Section>

      {/* ── 5. Organic causes ── */}
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
          onChange={(v) => setValue('organicCauses', v as any)}
        />
        <Textarea
          label="Medications Affecting Mental State"
          rows={2}
          {...register('medicationsAffectingMentalState')}
        />
      </Section>

      {/* ── 6. Sleep & appetite ── */}
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

      {/* ── 7. Functional & social ── */}
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

      {/* ── 8. Diagnosis ── */}
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
          onChange={(v) => setValue('diagnoses', v as any)}
        />
        {watch('diagnoses')?.includes('Other') && (
          <Input
            label="Other diagnosis"
            {...register('diagnosisOther')}
          />
        )}
      </Section>

      {/* ── 9. Care plan ── */}
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
          onChange={(v) => setValue('immediateInterventions', v as any)}
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
          onChange={(v) => setValue('pharmacologicalPlan', v as any)}
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
          onChange={(v) => setValue('nonPharmacologicalPlan', v as any)}
        />
        <CheckboxGroup
          label="Monitoring Plan"
          values={watch('monitoringPlan') ?? []}
          options={['Daily', 'Weekly', 'AsNeeded']}
          onChange={(v) => setValue('monitoringPlan', v as any)}
        />
      </Section>

      {/* ── 10. Family ── */}
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
            value={
              watch('caregiverBurnout') === undefined
                ? ''
                : watch('caregiverBurnout')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) => setValue('caregiverBurnout', v === 'Yes')}
          />
          <YesNo
            label="Family counseling needed?"
            name="familyCounselingNeeded"
            value={
              watch('familyCounselingNeeded') === undefined
                ? ''
                : watch('familyCounselingNeeded')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('familyCounselingNeeded', v === 'Yes')
            }
          />
        </Grid>
      </Section>

      {/* ── 11. Summary ── */}
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
          onChange={(v) => setValue('assessmentOutcome', v as any)}
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
          onChange={(v) => setValue('finalRecommendations', v as any)}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PsychiatryAssessmentFormPage;