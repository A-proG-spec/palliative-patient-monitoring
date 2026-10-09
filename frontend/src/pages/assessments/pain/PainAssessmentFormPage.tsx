import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreatePainAssessment,
  usePainAssessment,
  useUpdatePainAssessment,
} from '@/hooks/usePainAssessments';
import {
  createPainAssessmentSchema,
  type CreatePainAssessmentFormData,
} from '@/schemas/pain-assessment.schema';

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

import { useRecordAccess } from '@/hooks/useRecordAccess';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/context/ToastContext';

// ── Helpers ─────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

const toYesNo = (v: boolean | null | undefined): 'Yes' | 'No' | '' =>
  v === undefined || v === null ? '' : v ? 'Yes' : 'No';

const PainAssessmentFormPage: React.FC = () => {
  const { id, assessmentId } = useParams<{
    id: string;
    assessmentId?: string;
  }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();

  // ── Mode detection ──
  const isEditMode = Boolean(assessmentId);

  // ── Auth + route-aware base path ──
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const access = useRecordAccess('painAssessment');

  // ── Data ──
  const { data: patient, isLoading: patientLoading, error: patientError, refetch: refetchPatient } =
    usePatient(id!);

  const { data: existing, isLoading: existingLoading } = usePainAssessment(
    id!,
    assessmentId ?? '',
  );

  const createMutation = useCreatePainAssessment(id!);
  const updateMutation = useUpdatePainAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePainAssessmentFormData>({
    resolver: zodResolver(createPainAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      painLocations: [],
      painDescriptions: [],
      painType: [],
      painPattern: [],
      aggravatingFactors: [],
      relievingFactors: [],
      adjuvantDrugs: [],
      associatedSymptoms: [],
      patientBehaviors: [],
      managementBarriers: [],
      diagnosis: [],
      interventions: [],
      nonPharmacologicalMethods: [],
      monitoringPlan: [],
      assessmentOutcome: [],
      finalRecommendations: [],
      impacts: [],
    },
  });

  // ═══════════════════════════════════════════════════════════
  // Hydrate form in EDIT mode
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEditMode || !existing) return;

    // Map the server record back into the form shape.
    // Array fields may arrive as null from the backend — coerce to [].
    reset({
      assessmentType: existing.assessmentType ?? 'Admission',
      primaryPainComplaint: existing.primaryPainComplaint ?? undefined,
      painOnset: existing.painOnset ?? undefined,
      painDuration: existing.painDuration ?? undefined,
      painLocations: existing.painLocations ?? [],
      painLocationOther: existing.painLocationOther ?? undefined,
      painDescriptions: existing.painDescriptions ?? [],
      currentPainScore: existing.currentPainScore ?? undefined,
      worstPainLast24h: existing.worstPainLast24h ?? undefined,
      leastPainLast24h: existing.leastPainLast24h ?? undefined,
      painType: existing.painType ?? [],
      painPattern: existing.painPattern ?? [],
      aggravatingFactors: existing.aggravatingFactors ?? [],
      relievingFactors: existing.relievingFactors ?? [],
      relievingOther: existing.relievingOther ?? undefined,
      opioidUse: existing.opioidUse ?? undefined,
      adjuvantDrugs: existing.adjuvantDrugs ?? [],
      breakthroughFrequency: existing.breakthroughFrequency ?? undefined,
      rescueMedicationUsed: existing.rescueMedicationUsed ?? undefined,
      rescueEffectiveness: existing.rescueEffectiveness ?? undefined,
      associatedSymptoms: existing.associatedSymptoms ?? [],
      patientBehaviors: existing.patientBehaviors ?? [],
      managementBarriers: existing.managementBarriers ?? [],
      managementBarrierOther: existing.managementBarrierOther ?? undefined,
      diagnosis: existing.diagnosis ?? [],
      managementGoals: existing.managementGoals ?? undefined,
      interventions: existing.interventions ?? [],
      nonPharmacologicalMethods: existing.nonPharmacologicalMethods ?? [],
      monitoringPlan: existing.monitoringPlan ?? [],
      assessmentOutcome: existing.assessmentOutcome ?? [],
      finalRecommendations: existing.finalRecommendations ?? [],
      impacts: (existing.impacts ?? []) as any,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ═══════════════════════════════════════════════════════════
  // Submit — create OR update depending on mode
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreatePainAssessmentFormData) => {
    const handleSuccess = () => navigate(basePath);

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message = 'Could not save the pain assessment. Please try again.';

      if (status === 400) {
        message =
          'Some fields are missing or invalid. Please review the highlighted fields.';
      } else if (status === 403) {
        message = 'You do not have permission to save this assessment.';
      } else if (status === 404) {
        message = 'Patient or assessment not found. Please refresh and try again.';
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
  if (patientLoading || (isEditMode && existingLoading)) return <PageLoader />;
  if (patientError || !patient) return <ErrorState onRetry={refetchPatient} />;

  // ── Write gate — admin bypasses the record-role check ──
  if ((!isAdmin && !access.allowed) || patient.status === 'Discharged') {
    return <Navigate to={`${basePath}/pain`} replace />;
  }

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Pain Assessment"
      patientLabel={patientLabel}
      backTo={basePath}
      mode={isEditMode ? 'edit' : 'create'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(basePath)}
    >
      {/* ═══════════════════════════════════════════════════════
          1. Assessment Information
      ═══════════════════════════════════════════════════════ */}
      <Section title="1. Assessment Information">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'EmergencyPainReview', label: 'Emergency pain review' },
          ]}
          placeholder="Select…"
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          2. Pain History
      ═══════════════════════════════════════════════════════ */}
      <Section title="2. Pain History">
        <Textarea
          label="Primary Pain Complaint"
          rows={2}
          placeholder="e.g. Constant lower back pain radiating to left leg"
          {...register('primaryPainComplaint')}
        />

        <Grid cols={2}>
          <Select
            label="Onset"
            options={[
              { value: 'Acute', label: 'Acute' },
              { value: 'Chronic', label: 'Chronic' },
              { value: 'Progressive', label: 'Progressive' },
            ]}
            placeholder="Select…"
            error={errors.painOnset?.message}
            {...register('painOnset')}
          />
          <Input
            label="Duration"
            placeholder="e.g. 3 weeks"
            {...register('painDuration')}
          />
        </Grid>

        <CheckboxGroup
          label="Pain Locations"
          values={watch('painLocations') ?? []}
          options={[
            'Head',
            'Chest',
            'Abdomen',
            'Back',
            'Pelvis',
            'Limbs',
            'MultipleSites',
            'Other',
          ]}
          onChange={(v) =>
            setValue('painLocations', v as any, { shouldDirty: true })
          }
        />
        {watch('painLocations')?.includes('Other') && (
          <Input
            label="Other pain location"
            {...register('painLocationOther')}
          />
        )}

        <CheckboxGroup
          label="Pain Descriptions"
          values={watch('painDescriptions') ?? []}
          options={[
            'Sharp',
            'Dull',
            'Burning',
            'Throbbing',
            'Cramping',
            'Shooting',
            'PressureLike',
          ]}
          onChange={(v) =>
            setValue('painDescriptions', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          3. Severity (0–10 NRS)
      ═══════════════════════════════════════════════════════ */}
      <Section title="3. Pain Severity (0–10 NRS)">
        <Grid cols={3}>
          <Input
            label="Current Pain"
            type="number"
            min={0}
            max={10}
            error={errors.currentPainScore?.message}
            {...register('currentPainScore', { valueAsNumber: true })}
          />
          <Input
            label="Worst (last 24h)"
            type="number"
            min={0}
            max={10}
            error={errors.worstPainLast24h?.message}
            {...register('worstPainLast24h', { valueAsNumber: true })}
          />
          <Input
            label="Least (last 24h)"
            type="number"
            min={0}
            max={10}
            error={errors.leastPainLast24h?.message}
            {...register('leastPainLast24h', { valueAsNumber: true })}
          />
        </Grid>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          4. Type & Pattern
      ═══════════════════════════════════════════════════════ */}
      <Section title="4. Pain Type & Pattern">
        <CheckboxGroup
          label="Pain Type"
          values={watch('painType') ?? []}
          options={[
            'NociceptiveSomatic',
            'Visceral',
            'Neuropathic',
            'Mixed',
            'BreakthroughPain',
          ]}
          onChange={(v) =>
            setValue('painType', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Pain Pattern"
          values={watch('painPattern') ?? []}
          options={[
            'Continuous',
            'Intermittent',
            'BreakthroughEpisodes',
            'WorseAtNight',
            'MovementRelated',
          ]}
          onChange={(v) =>
            setValue('painPattern', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          5. Aggravating & Relieving Factors
      ═══════════════════════════════════════════════════════ */}
      <Section title="5. Aggravating & Relieving Factors">
        <CheckboxGroup
          label="Aggravating Factors"
          values={watch('aggravatingFactors') ?? []}
          options={[
            'Movement',
            'Coughing',
            'Eating',
            'Stress',
            'Positioning',
            'Unknown',
          ]}
          onChange={(v) =>
            setValue('aggravatingFactors', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Relieving Factors"
          values={watch('relievingFactors') ?? []}
          options={[
            'Rest',
            'Medication',
            'PositionChange',
            'HeatColdTherapy',
            'Massage',
            'Other',
          ]}
          onChange={(v) =>
            setValue('relievingFactors', v as any, { shouldDirty: true })
          }
        />
        {watch('relievingFactors')?.includes('Other') && (
          <Input
            label="Other relieving factor"
            {...register('relievingOther')}
          />
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════
          6. Current Pain Management
      ═══════════════════════════════════════════════════════ */}
      <Section title="6. Current Pain Management">
        <Select
          label="Opioid Use"
          options={[
            { value: 'None', label: 'None' },
            { value: 'WeakOpioid', label: 'Weak opioid' },
            { value: 'StrongOpioid', label: 'Strong opioid' },
          ]}
          placeholder="Select…"
          error={errors.opioidUse?.message}
          {...register('opioidUse')}
        />
        <CheckboxGroup
          label="Adjuvant Drugs"
          values={watch('adjuvantDrugs') ?? []}
          options={[
            'Antidepressants',
            'Anticonvulsants',
            'Steroids',
            'MuscleRelaxants',
          ]}
          onChange={(v) =>
            setValue('adjuvantDrugs', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          7. Breakthrough Pain
      ═══════════════════════════════════════════════════════ */}
      <Section title="7. Breakthrough Pain">
        <Select
          label="Breakthrough Frequency"
          options={[
            { value: 'None', label: 'None' },
            { value: 'OneToTwoPerDay', label: '1–2 per day' },
            { value: 'ThreeToFivePerDay', label: '3–5 per day' },
            { value: 'Frequent', label: 'Frequent' },
          ]}
          placeholder="Select…"
          error={errors.breakthroughFrequency?.message}
          {...register('breakthroughFrequency')}
        />
        <YesNo
          label="Rescue medication used?"
          name="rescueMedicationUsed"
          value={toYesNo(watch('rescueMedicationUsed'))}
          onChange={(v) =>
            setValue('rescueMedicationUsed', v === 'Yes', {
              shouldDirty: true,
            })
          }
        />
        {watch('rescueMedicationUsed') === true && (
          <Select
            label="Rescue Effectiveness"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Partial', label: 'Partial' },
              { value: 'Poor', label: 'Poor' },
            ]}
            placeholder="Select…"
            error={errors.rescueEffectiveness?.message}
            {...register('rescueEffectiveness')}
          />
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════
          8. Associated Symptoms & Patient Behaviors
      ═══════════════════════════════════════════════════════ */}
      <Section title="8. Associated Symptoms & Patient Behaviors">
        <CheckboxGroup
          label="Associated Symptoms"
          values={watch('associatedSymptoms') ?? []}
          options={[
            'Nausea',
            'Vomiting',
            'Constipation',
            'Fatigue',
            'Anxiety',
            'Depression',
            'Dyspnea',
          ]}
          onChange={(v) =>
            setValue('associatedSymptoms', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Patient Behaviors"
          values={watch('patientBehaviors') ?? []}
          options={[
            'Comfortable',
            'Grimacing',
            'GuardingArea',
            'Restless',
            'Crying',
          ]}
          onChange={(v) =>
            setValue('patientBehaviors', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          9. Barriers
      ═══════════════════════════════════════════════════════ */}
      <Section title="9. Barriers to Pain Management">
        <CheckboxGroup
          label="Barriers"
          values={watch('managementBarriers') ?? []}
          options={[
            'FearOfAddiction',
            'MedicationSideEffects',
            'PoorAdherence',
            'FinancialConstraints',
            'PoorAccessToOpioids',
            'CulturalBeliefs',
            'Other',
          ]}
          onChange={(v) =>
            setValue('managementBarriers', v as any, { shouldDirty: true })
          }
        />
        {watch('managementBarriers')?.includes('Other') && (
          <Input
            label="Other barrier"
            {...register('managementBarrierOther')}
          />
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════
          10. Diagnosis
      ═══════════════════════════════════════════════════════ */}
      <Section title="10. Pain Diagnosis">
        <CheckboxGroup
          label="Diagnosis"
          values={watch('diagnosis') ?? []}
          options={[
            'ControlledPain',
            'PartiallyControlledPain',
            'UncontrolledPain',
            'ComplexPainSyndrome',
            'BreakthroughPainSyndrome',
          ]}
          onChange={(v) =>
            setValue('diagnosis', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          11. Management Plan
      ═══════════════════════════════════════════════════════ */}
      <Section title="11. Management Plan">
        <Textarea
          label="Management Goals"
          rows={2}
          placeholder="e.g. Reduce NRS to ≤3, improve sleep, restore mobility"
          {...register('managementGoals')}
        />
        <CheckboxGroup
          label="Interventions"
          values={watch('interventions') ?? []}
          options={[
            'OptimizeOpioidTherapy',
            'AddAdjuvantAnalgesics',
            'AdjustDosingSchedule',
            'BreakthroughPainProtocol',
            'NonPharmacologicalTherapy',
            'PhysiotherapyReferral',
            'PsychologicalSupport',
          ]}
          onChange={(v) =>
            setValue('interventions', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Non-Pharmacological Methods"
          values={watch('nonPharmacologicalMethods') ?? []}
          options={[
            'Positioning',
            'RelaxationTechniques',
            'Massage',
            'HeatColdTherapy',
            'SpiritualSupport',
          ]}
          onChange={(v) =>
            setValue('nonPharmacologicalMethods', v as any, {
              shouldDirty: true,
            })
          }
        />
        <CheckboxGroup
          label="Monitoring Plan"
          values={watch('monitoringPlan') ?? []}
          options={['Daily', 'EveryShift', 'Weekly']}
          onChange={(v) =>
            setValue('monitoringPlan', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          12. Summary & Recommendations
      ═══════════════════════════════════════════════════════ */}
      <Section title="12. Summary & Recommendations">
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'PainWellControlled',
            'RequiresAdjustment',
            'RequiresUrgentIntervention',
            'ComplexPainManagementRequired',
            'MultidisciplinaryReviewNeeded',
          ]}
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ContinueCurrentRegimen',
            'IncreaseOpioidDose',
            'AddAdjuvantTherapy',
            'ManageBreakthroughPain',
            'IntegratePsychosocialSupport',
            'FullHospicePainProtocolActivation',
          ]}
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PainAssessmentFormPage;