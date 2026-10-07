import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import { useCreateSpiritualAssessment } from '@/hooks/useSpiritualAssessments';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientPath = `/patients/${id}`;

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreateSpiritualAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreateSpiritualAssessmentFormData) => {
    createMutation.mutate(data as any, {
      onSuccess: () => navigate(patientPath),
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ??
          'Failed to save spiritual assessment.';
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

  // ── Distress concerns: preserve all rows (both present and absent) ──
  const currentDistress = watch('distressConcerns') ?? [];
  const distressSet = new Set(
    currentDistress.filter((r) => r.present).map((r) => r.concern),
  );

  const toggleDistress = (concern: string) => {
    const next = DISTRESS_CONCERNS.map((c) => ({
      concern: c,
      present: c === concern ? !distressSet.has(c as any) : distressSet.has(c as any),
    })).filter((row) => row.present); // send only the ones marked present

    setValue('distressConcerns', next as any, { shouldDirty: true });
  };

  return (
    <AssessmentFormShell
      title="Spiritual Assessment"
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

      {/* ── 2. Religious background ── */}
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

      {/* ── 3. Spiritual support system ── */}
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

      {/* ── 4. Beliefs & values ── */}
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

      {/* ── 5. Distress assessment ── */}
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

      {/* ── 6. Hope & coping ── */}
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

      {/* ── 7. Family & spiritual ── */}
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

      {/* ── 8. End-of-life preferences ── */}
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

      {/* ── 9. Spiritual strengths ── */}
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

      {/* ── 10. Spiritual care plan ── */}
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

      {/* ── 11. Provider summary ── */}
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