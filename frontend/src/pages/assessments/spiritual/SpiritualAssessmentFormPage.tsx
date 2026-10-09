import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreateSpiritualAssessment,
  useSpiritualAssessment,
  useUpdateSpiritualAssessment,
} from '@/hooks/useSpiritualAssessments';
import {
  createSpiritualAssessmentSchema,
  type CreateSpiritualAssessmentFormData,
} from '@/schemas/spiritual-assessment.schema';

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

const DISTRESS_CONCERNS = [
  'MeaningOfIllness',
  'FearOfDeath',
  'FearOfSuffering',
  'UnfinishedBusiness',
  'Forgiveness',
  'RelationshipConflicts',
  'LossOfHope',
  'AngerTowardGodHigherPower',
  'SpiritualIsolation',
] as const;

const SpiritualAssessmentFormPage: React.FC = () => {
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

  const createMutation = useCreateSpiritualAssessment(id!);
  const updateMutation = useUpdateSpiritualAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } = useSpiritualAssessment(
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
  } = useForm<CreateSpiritualAssessmentFormData>({
    resolver: zodResolver(createSpiritualAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      supportSources: [],
      distressConcerns: [],
      copingMethods: [],
      preferredEndOfLifeCare: [],
      patientStrengths: [],
      identifiedNeeds: [],
      recommendedServices: [],
      assessmentOutcome: [],
    },
  });

  // ── EDIT: hydrate form from server record ──
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',
      religiousAffiliation: existing.religiousAffiliation ?? undefined,
      religiousAffiliationOther:
        existing.religiousAffiliationOther ?? undefined,
      faithImportance: existing.faithImportance ?? undefined,
      activityParticipation: existing.activityParticipation ?? undefined,
      placeOfWorship: existing.placeOfWorship ?? undefined,
      supportSources: existing.supportSources ?? [],
      religiousLeaderName: existing.religiousLeaderName ?? undefined,
      religiousLeaderOrganization:
        existing.religiousLeaderOrganization ?? undefined,
      religiousLeaderPhone: existing.religiousLeaderPhone ?? undefined,
      lifeMeaningAndPurpose: existing.lifeMeaningAndPurpose ?? undefined,
      sourcesOfStrength: existing.sourcesOfStrength ?? undefined,
      practicesToContinue: existing.practicesToContinue ?? undefined,
      practicesToContinueDetails:
        existing.practicesToContinueDetails ?? undefined,
      ritualsToRespect: existing.ritualsToRespect ?? undefined,
      ritualsToRespectDetails: existing.ritualsToRespectDetails ?? undefined,
      distressConcerns: (existing.distressConcerns ?? []) as any,
      spiritualDistressLevel: existing.spiritualDistressLevel ?? undefined,
      spiritualConcernsDescription:
        existing.spiritualConcernsDescription ?? undefined,
      currentHopes: existing.currentHopes ?? undefined,
      copingMethods: existing.copingMethods ?? [],
      copingMethodOther: existing.copingMethodOther ?? undefined,
      feelsAtPeace: existing.feelsAtPeace ?? undefined,
      familySharesBeliefs: existing.familySharesBeliefs ?? undefined,
      familyBenefitFromSupport:
        existing.familyBenefitFromSupport ?? undefined,
      familySpiritualConcerns: existing.familySpiritualConcerns ?? undefined,
      preferredEndOfLifeCare: existing.preferredEndOfLifeCare ?? [],
      preferredEndOfLifeCareOther:
        existing.preferredEndOfLifeCareOther ?? undefined,
      preferredPlaceOfCare: existing.preferredPlaceOfCare ?? undefined,
      preferredPlaceOfCareOther:
        existing.preferredPlaceOfCareOther ?? undefined,
      preferredPlaceOfDeath: existing.preferredPlaceOfDeath ?? undefined,
      religiousPracticesAfterDeath:
        existing.religiousPracticesAfterDeath ?? undefined,
      patientStrengths: existing.patientStrengths ?? [],
      patientStrengthOther: existing.patientStrengthOther ?? undefined,
      additionalStrengths: existing.additionalStrengths ?? undefined,
      identifiedNeeds: existing.identifiedNeeds ?? [],
      identifiedNeedOther: existing.identifiedNeedOther ?? undefined,
      plannedInterventions: existing.plannedInterventions ?? undefined,
      followUpSchedule: existing.followUpSchedule ?? undefined,
      summaryOfAssessment: existing.summaryOfAssessment ?? undefined,
      providerDistressLevel: existing.providerDistressLevel ?? undefined,
      recommendedServices: existing.recommendedServices ?? [],
      assessmentOutcome: existing.assessmentOutcome ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ── Submit — create OR update depending on mode ──
  const onSubmit = (data: CreateSpiritualAssessmentFormData) => {
    const handleSuccess = () => navigate(basePath);

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message =
        'Could not save the spiritual assessment. Please try again.';

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

  const currentDistress = watch('distressConcerns') ?? [];
  const distressSet = new Set(
    currentDistress.filter((r) => r.present).map((r) => r.concern),
  );

  const toggleDistress = (concern: string) => {
    const next = DISTRESS_CONCERNS.map((c) => ({
      concern: c,
      present:
        c === concern ? !distressSet.has(c as any) : distressSet.has(c as any),
    })).filter((row) => row.present);

    setValue('distressConcerns', next as any, { shouldDirty: true });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Spiritual Assessment"
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

      <Section title="2. Religious Background">
        <Grid cols={2}>
          <Select
            label="Religious Affiliation"
            options={[
              {
                value: 'EthiopianOrthodoxChristian',
                label: 'Ethiopian Orthodox Christian',
              },
              { value: 'Muslim', label: 'Muslim' },
              { value: 'Protestant', label: 'Protestant' },
              { value: 'Catholic', label: 'Catholic' },
              { value: 'TraditionalBelief', label: 'Traditional belief' },
              { value: 'Other', label: 'Other' },
              {
                value: 'NoReligiousAffiliation',
                label: 'No religious affiliation',
              },
            ]}
            placeholder="Select…"
            {...register('religiousAffiliation')}
          />
          <Select
            label="Faith Importance"
            options={[
              { value: 'VeryImportant', label: 'Very important' },
              { value: 'Important', label: 'Important' },
              { value: 'SomewhatImportant', label: 'Somewhat important' },
              { value: 'NotImportant', label: 'Not important' },
            ]}
            placeholder="Select…"
            {...register('faithImportance')}
          />
        </Grid>
        {watch('religiousAffiliation') === 'Other' && (
          <Input
            label="Other religious affiliation"
            {...register('religiousAffiliationOther')}
          />
        )}
        <Grid cols={2}>
          <Select
            label="Activity Participation"
            options={[
              { value: 'Regularly', label: 'Regularly' },
              { value: 'Occasionally', label: 'Occasionally' },
              { value: 'Rarely', label: 'Rarely' },
              { value: 'Never', label: 'Never' },
            ]}
            placeholder="Select…"
            {...register('activityParticipation')}
          />
          <Input label="Place of Worship" {...register('placeOfWorship')} />
        </Grid>
      </Section>

      <Section title="3. Spiritual Support System">
        <CheckboxGroup
          label="Support Sources"
          values={watch('supportSources') ?? []}
          options={[
            'FamilyMembers',
            'ReligiousLeaderClergy',
            'Friends',
            'FaithCommunity',
            'HospiceChaplain',
            'CommunityMembers',
            'NoSpiritualSupport',
          ]}
          onChange={(v) =>
            setValue('supportSources', v as any, { shouldDirty: true })
          }
        />
        <Grid cols={3}>
          <Input
            label="Religious Leader Name"
            {...register('religiousLeaderName')}
          />
          <Input
            label="Organization"
            {...register('religiousLeaderOrganization')}
          />
          <Input
            label="Phone"
            type="tel"
            {...register('religiousLeaderPhone')}
          />
        </Grid>
      </Section>

      <Section title="4. Spiritual Beliefs & Values">
        <Textarea
          label="Life Meaning & Purpose"
          rows={3}
          {...register('lifeMeaningAndPurpose')}
        />
        <Textarea
          label="Sources of Strength"
          rows={2}
          {...register('sourcesOfStrength')}
        />
        <YesNo
          label="Practices to continue?"
          name="practicesToContinue"
          value={toYesNo(watch('practicesToContinue'))}
          onChange={(v) =>
            setValue('practicesToContinue', v === 'Yes', { shouldDirty: true })
          }
        />
        {watch('practicesToContinue') && (
          <Textarea
            label="Practices details"
            rows={2}
            {...register('practicesToContinueDetails')}
          />
        )}
        <YesNo
          label="Rituals to respect?"
          name="ritualsToRespect"
          value={toYesNo(watch('ritualsToRespect'))}
          onChange={(v) =>
            setValue('ritualsToRespect', v === 'Yes', { shouldDirty: true })
          }
        />
        {watch('ritualsToRespect') && (
          <Textarea
            label="Rituals details"
            rows={2}
            {...register('ritualsToRespectDetails')}
          />
        )}
      </Section>

      <Section title="5. Spiritual Distress Assessment">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-on-surface">
            Spiritual Distress Concerns
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DISTRESS_CONCERNS.map((concern) => (
              <label
                key={concern}
                className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={distressSet.has(concern)}
                  onChange={() => toggleDistress(concern)}
                  className="h-3.5 w-3.5 rounded text-primary"
                />
                {concern}
              </label>
            ))}
          </div>
        </div>
        <Select
          label="Spiritual Distress Level"
          options={[
            { value: 'None', label: 'None' },
            { value: 'Mild', label: 'Mild' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Severe', label: 'Severe' },
          ]}
          placeholder="Select…"
          {...register('spiritualDistressLevel')}
        />
        <Textarea
          label="Spiritual Concerns Description"
          rows={3}
          {...register('spiritualConcernsDescription')}
        />
      </Section>

      <Section title="6. Hope & Coping">
        <Textarea
          label="Current Hopes"
          rows={2}
          {...register('currentHopes')}
        />
        <CheckboxGroup
          label="Coping Methods"
          values={watch('copingMethods') ?? []}
          options={[
            'Prayer',
            'ReligiousReadings',
            'FamilySupport',
            'Counseling',
            'Meditation',
            'Music',
            'Other',
          ]}
          onChange={(v) =>
            setValue('copingMethods', v as any, { shouldDirty: true })
          }
        />
        {watch('copingMethods')?.includes('Other') && (
          <Input
            label="Other coping method"
            {...register('copingMethodOther')}
          />
        )}
        <Select
          label="Feels at Peace"
          options={[
            { value: 'Yes', label: 'Yes' },
            { value: 'Partially', label: 'Partially' },
            { value: 'No', label: 'No' },
          ]}
          placeholder="Select…"
          {...register('feelsAtPeace')}
        />
      </Section>

      <Section title="7. Family & Spiritual Needs">
        <Select
          label="Family Shares Beliefs"
          options={[
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
            { value: 'Partially', label: 'Partially' },
          ]}
          placeholder="Select…"
          {...register('familySharesBeliefs')}
        />
        <YesNo
          label="Family benefits from spiritual support?"
          name="familyBenefitFromSupport"
          value={toYesNo(watch('familyBenefitFromSupport'))}
          onChange={(v) =>
            setValue('familyBenefitFromSupport', v === 'Yes', {
              shouldDirty: true,
            })
          }
        />
        <Textarea
          label="Family Spiritual Concerns"
          rows={2}
          {...register('familySpiritualConcerns')}
        />
      </Section>

      <Section title="8. End-of-Life Preferences">
        <CheckboxGroup
          label="Preferred End-of-Life Care"
          values={watch('preferredEndOfLifeCare') ?? []}
          options={[
            'Prayer',
            'ReligiousReadings',
            'SacramentsHolyCommunion',
            'ClergyVisit',
            'FamilyPresence',
            'ReligiousMusic',
            'Other',
          ]}
          onChange={(v) =>
            setValue('preferredEndOfLifeCare', v as any, { shouldDirty: true })
          }
        />
        {watch('preferredEndOfLifeCare')?.includes('Other') && (
          <Input
            label="Other end-of-life care preference"
            {...register('preferredEndOfLifeCareOther')}
          />
        )}
        <Grid cols={2}>
          <Select
            label="Preferred Place of Care"
            options={[
              { value: 'Home', label: 'Home' },
              { value: 'HospiceFacility', label: 'Hospice facility' },
              { value: 'Hospital', label: 'Hospital' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('preferredPlaceOfCare')}
          />
          <Select
            label="Preferred Place of Death"
            options={[
              { value: 'Home', label: 'Home' },
              { value: 'HospiceFacility', label: 'Hospice facility' },
              { value: 'Hospital', label: 'Hospital' },
              { value: 'NoPreference', label: 'No preference' },
            ]}
            placeholder="Select…"
            {...register('preferredPlaceOfDeath')}
          />
        </Grid>
        {watch('preferredPlaceOfCare') === 'Other' && (
          <Input
            label="Other preferred place of care"
            {...register('preferredPlaceOfCareOther')}
          />
        )}
        <Textarea
          label="Religious Practices After Death"
          rows={2}
          {...register('religiousPracticesAfterDeath')}
        />
      </Section>

      <Section title="9. Spiritual Strengths">
        <CheckboxGroup
          label="Patient Strengths"
          values={watch('patientStrengths') ?? []}
          options={[
            'StrongFaith',
            'PositiveOutlook',
            'FamilySupport',
            'CommunitySupport',
            'ReligiousInvolvement',
            'AcceptanceOfIllness',
            'Other',
          ]}
          onChange={(v) =>
            setValue('patientStrengths', v as any, { shouldDirty: true })
          }
        />
        {watch('patientStrengths')?.includes('Other') && (
          <Input
            label="Other patient strength"
            {...register('patientStrengthOther')}
          />
        )}
        <Textarea
          label="Additional Strengths"
          rows={2}
          {...register('additionalStrengths')}
        />
      </Section>

      <Section title="10. Spiritual Care Plan">
        <CheckboxGroup
          label="Identified Needs"
          values={watch('identifiedNeeds') ?? []}
          options={[
            'PrayerSupport',
            'ReligiousCounseling',
            'ClergyVisits',
            'FamilySpiritualSupport',
            'EndOfLifePlanning',
            'GriefCounseling',
            'ReconciliationSupport',
            'Other',
          ]}
          onChange={(v) =>
            setValue('identifiedNeeds', v as any, { shouldDirty: true })
          }
        />
        {watch('identifiedNeeds')?.includes('Other') && (
          <Input
            label="Other identified need"
            {...register('identifiedNeedOther')}
          />
        )}
        <Textarea
          label="Planned Interventions"
          rows={3}
          {...register('plannedInterventions')}
        />
        <Select
          label="Follow-Up Schedule"
          options={[
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
            { value: 'Monthly', label: 'Monthly' },
            { value: 'AsNeeded', label: 'As needed' },
          ]}
          placeholder="Select…"
          {...register('followUpSchedule')}
        />
      </Section>

      <Section title="11. Provider Summary">
        <Textarea
          label="Summary of Assessment"
          rows={4}
          {...register('summaryOfAssessment')}
        />
        <Select
          label="Provider Distress Level"
          options={[
            { value: 'None', label: 'None' },
            { value: 'Mild', label: 'Mild' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Severe', label: 'Severe' },
          ]}
          placeholder="Select…"
          {...register('providerDistressLevel')}
        />
        <CheckboxGroup
          label="Recommended Services"
          values={watch('recommendedServices') ?? []}
          options={[
            'ChaplainServices',
            'ReligiousLeaderReferral',
            'FamilyCounseling',
            'BereavementSupport',
            'AdvanceCarePlanning',
            'OngoingSpiritualCare',
          ]}
          onChange={(v) =>
            setValue('recommendedServices', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'NoSpiritualConcernsIdentified',
            'RoutineSpiritualFollowUp',
            'ModerateSpiritualSupportRequired',
            'IntensiveSpiritualCareRequired',
            'FamilySpiritualSupportRequired',
            'BereavementFollowUpRecommended',
          ]}
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default SpiritualAssessmentFormPage;