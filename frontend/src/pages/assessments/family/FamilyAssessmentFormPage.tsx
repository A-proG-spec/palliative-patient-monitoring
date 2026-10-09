import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreateFamilyAssessment,
  useFamilyAssessment,
  useUpdateFamilyAssessment,
} from '@/hooks/useFamilyAssessments';
import { useAuthStore } from '@/store/auth.store';
import {
  createFamilyAssessmentSchema,
  type CreateFamilyAssessmentFormData,
} from '@/schemas/family-assessment.schema';

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
import { useToast } from '@/context/ToastContext';

// ── Helpers ──────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

type HouseholdMemberRow = {
  name: string;
  age: string;
  relationship: string;
  occupation: string;
  contact: string;
};

const FamilyAssessmentFormPage: React.FC = () => {
  const { id, assessmentId } = useParams<{
    id: string;
    assessmentId?: string;
  }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();

  // ── Mode detection ──
  const isEditMode = Boolean(assessmentId);

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const { user } = useAuthStore();

  const createMutation = useCreateFamilyAssessment(id!);
  const updateMutation = useUpdateFamilyAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } = useFamilyAssessment(
    id!,
    assessmentId ?? '',
  );

  // ── Route-aware base path ──
  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFamilyAssessmentFormData>({
    resolver: zodResolver(createFamilyAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      householdMembers: [],
      externalSupport: [],
      incomeSources: [],
      financialChallenges: [],
      burdenFactors: [],
      needs: [],
      strengths: [],
      supportServices: [],
      assessmentOutcome: [],
      finalRecommendations: [],
      utilitiesAccess: {},
    },
  });

  const [householdMembers, setHouseholdMembers] = useState<HouseholdMemberRow[]>([]);

  const addHouseholdMember = () =>
    setHouseholdMembers((prev) => [
      ...prev,
      { name: '', age: '', relationship: '', occupation: '', contact: '' },
    ]);

  const updateHouseholdMember = (
    index: number,
    field: keyof HouseholdMemberRow,
    value: string,
  ) =>
    setHouseholdMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );

  const removeHouseholdMember = (index: number) =>
    setHouseholdMembers((prev) => prev.filter((_, i) => i !== index));

  // ── EDIT: hydrate form + household members from server ──
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',
      householdSize: existing.householdSize ?? undefined,
      primaryDecisionMaker: existing.primaryDecisionMaker ?? undefined,
      primaryDecisionMakerName: existing.primaryDecisionMakerName ?? undefined,
      primaryCaregiverName: existing.primaryCaregiverName ?? undefined,
      primaryCaregiverRelationship:
        existing.primaryCaregiverRelationship ?? undefined,
      primaryCaregiverAge: existing.primaryCaregiverAge ?? undefined,
      primaryCaregiverPhone: existing.primaryCaregiverPhone ?? undefined,
      secondaryCaregiverName: existing.secondaryCaregiverName ?? undefined,
      secondaryCaregiverRelationship:
        existing.secondaryCaregiverRelationship ?? undefined,
      secondaryCaregiverPhone: existing.secondaryCaregiverPhone ?? undefined,
      caregiverAvailability: existing.caregiverAvailability ?? undefined,
      physicalAbility: existing.physicalAbility ?? undefined,
      emotionalReadiness: existing.emotionalReadiness ?? undefined,
      knowledgeOfIllness: existing.knowledgeOfIllness ?? undefined,
      internalSupport: existing.internalSupport ?? undefined,
      externalSupport: existing.externalSupport ?? [],
      socialIsolationRisk: existing.socialIsolationRisk ?? undefined,
      incomeSources: existing.incomeSources ?? [],
      monthlyIncomeLevel: existing.monthlyIncomeLevel ?? undefined,
      financialBurden: existing.financialBurden ?? undefined,
      financialChallenges: existing.financialChallenges ?? [],
      housingType: existing.housingType ?? undefined,
      housingTypeOther: existing.housingTypeOther ?? undefined,
      homeEnvironment: existing.homeEnvironment ?? undefined,
      utilitiesAccess: (existing as any).utilitiesAccess ?? {},
      copingAbility: existing.copingAbility ?? undefined,
      familyEmotionalStatus: existing.familyEmotionalStatus ?? undefined,
      anticipatoryGrief: existing.anticipatoryGrief ?? undefined,
      religiousAffiliation: existing.religiousAffiliation ?? undefined,
      religiousAffiliationOther: existing.religiousAffiliationOther ?? undefined,
      palliativeCareAcceptance: existing.palliativeCareAcceptance ?? undefined,
      culturalBeliefsAffectingCare:
        existing.culturalBeliefsAffectingCare ?? undefined,
      burdenLevel: existing.burdenLevel ?? undefined,
      burdenFactors: existing.burdenFactors ?? [],
      needs: existing.needs ?? [],
      strengths: existing.strengths ?? [],
      plannedInterventions: existing.plannedInterventions ?? undefined,
      supportServices: existing.supportServices ?? [],
      followUpPlan: existing.followUpPlan ?? undefined,
      assessorName: existing.assessorName ?? undefined,
      assessmentOutcome: existing.assessmentOutcome ?? [],
      finalRecommendations: existing.finalRecommendations ?? [],
    });

    // Hydrate the shadow household-members state from the server record.
    const serverMembers = ((existing as any).householdMembers ?? []) as Array<{
      name?: string;
      age?: number;
      relationship?: string;
      occupation?: string;
      contact?: string;
    }>;

    setHouseholdMembers(
      serverMembers.map((m) => ({
        name: m.name ?? '',
        age: m.age != null ? String(m.age) : '',
        relationship: m.relationship ?? '',
        occupation: m.occupation ?? '',
        contact: m.contact ?? '',
      })),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ── Autofill: Assessor ← current user · Primary Caregiver ← patient ──
  // Only run on CREATE. In edit mode we must not clobber saved values.
  useEffect(() => {
    if (isEditMode) return;
    if (!patient) return;

    const autofill: Partial<CreateFamilyAssessmentFormData> = {};

    if (user?.name) {
      autofill.assessorName = user.name;
    }
    if (patient.caregiverName) {
      autofill.primaryCaregiverName = patient.caregiverName;
    }
    if (patient.caregiverRelation) {
      autofill.primaryCaregiverRelationship = patient.caregiverRelation;
    }
    if (patient.caregiverPhone) {
      autofill.primaryCaregiverPhone = patient.caregiverPhone;
    }

    if (Object.keys(autofill).length > 0) {
      reset((prev) => ({ ...prev, ...autofill }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id, user?.id, isEditMode]);

  // ── Submit ──
  const onSubmit = (data: CreateFamilyAssessmentFormData) => {
    const parsedHouseholdMembers = householdMembers
      .filter((m) => m.name.trim() || m.relationship.trim())
      .map((m) => {
        const parsedAge = m.age ? Number(m.age) : undefined;
        return {
          name: m.name.trim() || undefined,
          age: Number.isFinite(parsedAge) ? parsedAge : undefined,
          relationship: m.relationship.trim() || undefined,
          occupation: m.occupation.trim() || undefined,
          contact: m.contact.trim() || undefined,
        };
      });

    const payload: CreateFamilyAssessmentFormData = {
      ...data,
      householdMembers: parsedHouseholdMembers as any,
    };

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message =
        'Could not save the family assessment. Please try again.';

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
        { assessmentId, data: payload as any },
        {
          onSuccess: () => navigate(basePath),
          onError: handleError,
        },
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => navigate(basePath),
        onError: handleError,
      });
    }
  };

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

  const utilities = (watch('utilitiesAccess') ?? {}) as Record<string, boolean>;
  const setUtility = (key: string, on: boolean) =>
    setValue('utilitiesAccess', { ...utilities, [key]: on }, { shouldDirty: true });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Family Assessment"
      patientLabel={patientLabel}
      backTo={basePath}
      mode={isEditMode ? 'edit' : 'create'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(basePath)}
    >
      {/* ── 1. Assessment Info ── */}
      <Section title="1. Assessment Information">
        <Grid cols={2}>
          <Select
            label="Assessment Type"
            options={[
              { value: 'Admission', label: 'Admission' },
              { value: 'FollowUp', label: 'Follow-up' },
              { value: 'CrisisReview', label: 'Crisis review' },
            ]}
            placeholder="Select…"
            error={errors.assessmentType?.message}
            {...register('assessmentType')}
          />
        </Grid>
      </Section>

      {/* ── 2. Family composition ── */}
      <Section title="2. Family Composition">
        <Grid cols={2}>
          <Input
            label="Household Size"
            type="number"
            min={1}
            error={errors.householdSize?.message}
            {...register('householdSize', { valueAsNumber: true })}
          />
          <Select
            label="Primary Decision Maker"
            options={[
              { value: 'Patient', label: 'Patient' },
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Child', label: 'Child' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('primaryDecisionMaker')}
          />
        </Grid>
        <Input
          label="Decision Maker Name"
          {...register('primaryDecisionMakerName')}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface">
              Household Members
            </p>
            <button
              type="button"
              onClick={addHouseholdMember}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <span aria-hidden>+</span> Add Member
            </button>
          </div>

          {householdMembers.length === 0 && (
            <p className="text-[11px] text-text-muted italic">
              No household members added yet. Click "Add Member" to begin.
            </p>
          )}

          {householdMembers.map((member, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-surface p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">
                  Member #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeHouseholdMember(index)}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>

              <Grid cols={2}>
                <Input
                  label="Name"
                  value={member.name}
                  onChange={(e) =>
                    updateHouseholdMember(index, 'name', e.target.value)
                  }
                  placeholder="e.g. Almaz Tesfaye"
                />
                <Input
                  label="Age"
                  type="number"
                  min={0}
                  max={150}
                  value={member.age}
                  onChange={(e) =>
                    updateHouseholdMember(index, 'age', e.target.value)
                  }
                  placeholder="e.g. 34"
                />
                <Input
                  label="Relationship"
                  value={member.relationship}
                  onChange={(e) =>
                    updateHouseholdMember(index, 'relationship', e.target.value)
                  }
                  placeholder="e.g. Daughter"
                />
                <Input
                  label="Occupation"
                  value={member.occupation}
                  onChange={(e) =>
                    updateHouseholdMember(index, 'occupation', e.target.value)
                  }
                  placeholder="e.g. Teacher"
                />
              </Grid>

              <Input
                label="Contact"
                type="tel"
                value={member.contact}
                onChange={(e) =>
                  updateHouseholdMember(index, 'contact', e.target.value)
                }
                placeholder="e.g. +251911234567"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Primary caregiver ── */}
      <Section title="3. Primary Caregiver">
        <Grid cols={2}>
          <Input
            label="Caregiver Name"
            {...register('primaryCaregiverName')}
          />
          <Input
            label="Relationship"
            placeholder="e.g. Daughter, Spouse"
            {...register('primaryCaregiverRelationship')}
          />
          <Input
            label="Phone"
            type="tel"
            {...register('primaryCaregiverPhone')}
          />
        </Grid>
      </Section>

      {/* ── 4. Secondary caregiver ── */}
      <Section title="4. Secondary Caregiver (optional)">
        <Grid cols={2}>
          <Input
            label="Caregiver Name"
            {...register('secondaryCaregiverName')}
          />
          <Input
            label="Relationship"
            {...register('secondaryCaregiverRelationship')}
          />
          <Input
            label="Phone"
            type="tel"
            {...register('secondaryCaregiverPhone')}
          />
        </Grid>
      </Section>

      {/* ── 5. Caregiver capacity ── */}
      <Section title="5. Caregiver Capacity">
        <Grid cols={2}>
          <Select
            label="Caregiver Availability"
            options={[
              { value: 'FullTime', label: 'Full-time' },
              { value: 'PartTime', label: 'Part-time' },
              { value: 'Occasional', label: 'Occasional' },
              { value: 'NotAvailable', label: 'Not available' },
            ]}
            placeholder="Select…"
            {...register('caregiverAvailability')}
          />
          <Select
            label="Physical Ability"
            options={[
              { value: 'Strong', label: 'Strong' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Limited', label: 'Limited' },
              { value: 'Unable', label: 'Unable' },
            ]}
            placeholder="Select…"
            {...register('physicalAbility')}
          />
          <Select
            label="Emotional Readiness"
            options={[
              { value: 'Ready', label: 'Ready' },
              { value: 'SomewhatReady', label: 'Somewhat ready' },
              { value: 'Overwhelmed', label: 'Overwhelmed' },
              { value: 'NotReady', label: 'Not ready' },
            ]}
            placeholder="Select…"
            {...register('emotionalReadiness')}
          />
          <Select
            label="Knowledge of Illness"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Poor', label: 'Poor' },
              { value: 'None', label: 'None' },
            ]}
            placeholder="Select…"
            {...register('knowledgeOfIllness')}
          />
        </Grid>
      </Section>

      {/* ── 6. Support system ── */}
      <Section title="6. Family Support System">
        <Select
          label="Internal Support"
          options={[
            { value: 'StrongFamilyUnity', label: 'Strong family unity' },
            { value: 'ModerateSupport', label: 'Moderate support' },
            { value: 'ConflictPresent', label: 'Conflict present' },
            { value: 'NoSupport', label: 'No support' },
          ]}
          placeholder="Select…"
          {...register('internalSupport')}
        />
        <CheckboxGroup
          label="External Support"
          values={watch('externalSupport') ?? []}
          options={['Community', 'ReligiousInstitution', 'NgoSupport', 'None']}
          onChange={(v) =>
            setValue('externalSupport', v as any, { shouldDirty: true })
          }
        />
        <Select
          label="Social Isolation Risk"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
          ]}
          placeholder="Select…"
          {...register('socialIsolationRisk')}
        />
      </Section>

      {/* ── 7. Financial status ── */}
      <Section title="7. Financial Status">
        <CheckboxGroup
          label="Income Sources"
          values={watch('incomeSources') ?? []}
          options={[
            'Employment',
            'Farming',
            'Pension',
            'FamilySupport',
            'NoStableIncome',
          ]}
          onChange={(v) =>
            setValue('incomeSources', v as any, { shouldDirty: true })
          }
        />
        <Grid cols={2}>
          <Select
            label="Monthly Income Level"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
              { value: 'Unknown', label: 'Unknown' },
            ]}
            placeholder="Select…"
            {...register('monthlyIncomeLevel')}
          />
          <Select
            label="Financial Burden"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Mild', label: 'Mild' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('financialBurden')}
          />
        </Grid>
        <CheckboxGroup
          label="Financial Challenges"
          values={watch('financialChallenges') ?? []}
          options={[
            'MedicationCosts',
            'Transportation',
            'FoodInsecurity',
            'LossOfIncome',
            'CaregiverBurden',
          ]}
          onChange={(v) =>
            setValue('financialChallenges', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ── 8. Living conditions ── */}
      <Section title="8. Living Conditions">
        <Grid cols={2}>
          <Select
            label="Housing Type"
            options={[
              { value: 'Owned', label: 'Owned' },
              { value: 'Rented', label: 'Rented' },
              { value: 'TemporaryShelter', label: 'Temporary shelter' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('housingType')}
          />
          <Select
            label="Home Environment"
            options={[
              { value: 'Safe', label: 'Safe' },
              { value: 'PartiallySafe', label: 'Partially safe' },
              { value: 'Unsafe', label: 'Unsafe' },
            ]}
            placeholder="Select…"
            {...register('homeEnvironment')}
          />
        </Grid>
        {watch('housingType') === 'Other' && (
          <Input label="Other housing type" {...register('housingTypeOther')} />
        )}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-on-surface">Utility Access</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['Water', 'Electricity', 'Sanitation'].map((u) => (
              <label
                key={u}
                className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={!!utilities[u]}
                  onChange={(e) => setUtility(u, e.target.checked)}
                  className="h-3.5 w-3.5 rounded text-primary"
                />
                {u}
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 9. Family coping ── */}
      <Section title="9. Family Coping & Psychosocial">
        <Grid cols={2}>
          <Select
            label="Coping Ability"
            options={[
              { value: 'Strong', label: 'Strong' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Poor', label: 'Poor' },
            ]}
            placeholder="Select…"
            {...register('copingAbility')}
          />
          <Select
            label="Family Emotional Status"
            options={[
              { value: 'Calm', label: 'Calm' },
              { value: 'Anxious', label: 'Anxious' },
              { value: 'Distressed', label: 'Distressed' },
              { value: 'Overwhelmed', label: 'Overwhelmed' },
            ]}
            placeholder="Select…"
            {...register('familyEmotionalStatus')}
          />
        </Grid>
        <Select
          label="Anticipatory Grief"
          options={[
            { value: 'None', label: 'None' },
            { value: 'Mild', label: 'Mild' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Severe', label: 'Severe' },
          ]}
          placeholder="Select…"
          {...register('anticipatoryGrief')}
        />
      </Section>

      {/* ── 10. Cultural & religious ── */}
      <Section title="10. Cultural & Religious Factors">
        <Grid cols={2}>
          <Select
            label="Religious Affiliation"
            options={[
              { value: 'Orthodox', label: 'Orthodox' },
              { value: 'Muslim', label: 'Muslim' },
              { value: 'Protestant', label: 'Protestant' },
              { value: 'Catholic', label: 'Catholic' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('religiousAffiliation')}
          />
          <Select
            label="Palliative Care Acceptance"
            options={[
              { value: 'FullyAccepting', label: 'Fully accepting' },
              { value: 'PartiallyAccepting', label: 'Partially accepting' },
              { value: 'Resistant', label: 'Resistant' },
              { value: 'NotInformed', label: 'Not informed' },
            ]}
            placeholder="Select…"
            {...register('palliativeCareAcceptance')}
          />
        </Grid>
        {watch('religiousAffiliation') === 'Other' && (
          <Input
            label="Other religious affiliation"
            {...register('religiousAffiliationOther')}
          />
        )}
        <Textarea
          label="Cultural Beliefs Affecting Care"
          rows={2}
          {...register('culturalBeliefsAffectingCare')}
        />
      </Section>

      {/* ── 11. Caregiver burden ── */}
      <Section title="11. Caregiver Burden">
        <Select
          label="Burden Level"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
            { value: 'Severe', label: 'Severe' },
          ]}
          placeholder="Select…"
          {...register('burdenLevel')}
        />
        <CheckboxGroup
          label="Burden Factors"
          values={watch('burdenFactors') ?? []}
          options={[
            'PhysicalExhaustion',
            'EmotionalStress',
            'FinancialStrain',
            'LackOfSupport',
            'LackOfKnowledge',
          ]}
          onChange={(v) =>
            setValue('burdenFactors', v as any, { shouldDirty: true })
          }
        />
      </Section>

      {/* ── 12. Needs & strengths ── */}
      <Section title="12. Family Needs & Strengths">
        <CheckboxGroup
          label="Identified Needs"
          values={watch('needs') ?? []}
          options={[
            'EducationOnDiseaseProcess',
            'CaregiverTraining',
            'FinancialAssistance',
            'PsychologicalCounseling',
            'SpiritualSupport',
            'RespiteCare',
            'BereavementPreparation',
          ]}
          onChange={(v) => setValue('needs', v as any, { shouldDirty: true })}
        />
        <CheckboxGroup
          label="Family Strengths"
          values={watch('strengths') ?? []}
          options={[
            'StrongBonding',
            'WillingCaregiver',
            'ReligiousSupport',
            'StableHousing',
            'CommunitySupport',
            'GoodCommunication',
          ]}
          onChange={(v) => setValue('strengths', v as any, { shouldDirty: true })}
        />
      </Section>

      {/* ── 13. Care plan ── */}
      <Section title="13. Family Care Plan">
        <Textarea
          label="Planned Interventions"
          rows={3}
          {...register('plannedInterventions')}
        />
        <CheckboxGroup
          label="Support Services"
          values={watch('supportServices') ?? []}
          options={[
            'SocialWork',
            'PsychologyPsychiatry',
            'SpiritualCare',
            'FinancialAssistancePrograms',
            'CommunityVolunteers',
          ]}
          onChange={(v) =>
            setValue('supportServices', v as any, { shouldDirty: true })
          }
        />
        <Select
          label="Follow-Up Plan"
          options={[
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
            { value: 'Monthly', label: 'Monthly' },
            { value: 'AsNeeded', label: 'As needed' },
          ]}
          placeholder="Select…"
          {...register('followUpPlan')}
        />
      </Section>

      {/* ── 14. Summary ── */}
      <Section title="14. Summary & Recommendations">
        <Input label="Assessor Name" {...register('assessorName')} />
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'StrongFamilySupport',
            'AdequateSupportWithInterventionNeeded',
            'HighCaregiverBurden',
            'AtRiskFamilySystem',
            'RequiresIntensivePsychosocialSupport',
          ]}
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ContinueFamilyInvolvement',
            'ProvideCaregiverTraining',
            'InitiateFinancialSocialSupport',
            'PsychologicalCounselingRequired',
            'BereavementPreparationNeeded',
            'MultidisciplinaryFamilyIntervention',
          ]}
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default FamilyAssessmentFormPage;