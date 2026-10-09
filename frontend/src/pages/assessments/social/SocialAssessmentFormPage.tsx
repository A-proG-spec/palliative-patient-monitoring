import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreateSocialAssessment,
  useSocialAssessment,
  useUpdateSocialAssessment,
} from '@/hooks/useSocialAssessments';
import {
  createSocialAssessmentSchema,
  type CreateSocialAssessmentFormData,
} from '@/schemas/social-assessment.schema';

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

const UTILITY_KEYS = [
  { key: 'Electricity', label: 'Electricity' },
  { key: 'WaterSupply', label: 'Water supply' },
  { key: 'ToiletFacility', label: 'Toilet facility' },
  { key: 'TelephoneAccess', label: 'Telephone access' },
] as const;

type HouseholdMemberRow = {
  name: string;
  relationship: string;
  age: string;
  occupation: string;
};

const SocialAssessmentFormPage: React.FC = () => {
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

  const access = useRecordAccess('socialAssessment');

  const { data: patient, isLoading, error, refetch } = usePatient(id!);

  const createMutation = useCreateSocialAssessment(id!);
  const updateMutation = useUpdateSocialAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } = useSocialAssessment(
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
  } = useForm<CreateSocialAssessmentFormData>({
    resolver: zodResolver(createSocialAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      householdMembers: [],
      communitySupport: [],
      incomeSources: [],
      financialChallenges: [],
      transportAccess: [],
      transportChallenges: [],
      legalConcerns: [],
      majorSocialIssues: [],
      plannedInterventions: [],
      assessmentOutcome: [],
      utilitiesAccess: {},
    },
  });

  const [householdMembers, setHouseholdMembers] = useState<HouseholdMemberRow[]>([]);

  const addHouseholdMember = () =>
    setHouseholdMembers((prev) => [
      ...prev,
      { name: '', relationship: '', age: '', occupation: '' },
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

  // ═══════════════════════════════════════════════════════════
  // EDIT: hydrate form + household members from server record
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',
      householdSize: existing.householdSize ?? undefined,
      livingArrangement: existing.livingArrangement ?? undefined,
      livingArrangementOther: existing.livingArrangementOther ?? undefined,

      caregiverAvailability: existing.caregiverAvailability ?? undefined,
      caregiverHealth: existing.caregiverHealth ?? undefined,
      caregiverUnderstanding: existing.caregiverUnderstanding ?? undefined,
      caregiverStress: existing.caregiverStress ?? undefined,

      familySupport: existing.familySupport ?? undefined,
      communitySupport: existing.communitySupport ?? [],
      contactFrequency: existing.contactFrequency ?? undefined,
      isolationRisk: existing.isolationRisk ?? undefined,

      incomeSources: existing.incomeSources ?? [],
      incomeSourceOther: existing.incomeSourceOther ?? undefined,
      monthlyHouseholdIncome: existing.monthlyHouseholdIncome ?? undefined,
      financialRiskLevel: existing.financialRiskLevel ?? undefined,
      financialChallenges: existing.financialChallenges ?? [],
      financialChallengeOther: existing.financialChallengeOther ?? undefined,

      residenceType: existing.residenceType ?? undefined,
      residenceTypeOther: existing.residenceTypeOther ?? undefined,
      homeEnvironment: existing.homeEnvironment ?? undefined,
      utilitiesAccess: (existing as any).utilitiesAccess ?? {},
      homeBasedCareSuitability: existing.homeBasedCareSuitability ?? undefined,

      transportAccess: existing.transportAccess ?? [],
      distanceToHealthFacilityKm:
        existing.distanceToHealthFacilityKm ?? undefined,
      transportChallenges: existing.transportChallenges ?? [],
      transportChallengeOther: existing.transportChallengeOther ?? undefined,

      employmentStatus: existing.employmentStatus ?? undefined,
      educationLevel: existing.educationLevel ?? undefined,

      religiousAffiliation: existing.religiousAffiliation ?? undefined,
      religiousAffiliationOther:
        existing.religiousAffiliationOther ?? undefined,
      spiritualSupportAvailable:
        existing.spiritualSupportAvailable ?? undefined,
      culturalFactorsAffectingCare:
        existing.culturalFactorsAffectingCare ?? undefined,

      hasLegalRepresentative: existing.hasLegalRepresentative ?? undefined,
      advanceDirectivesAvailable:
        existing.advanceDirectivesAvailable ?? undefined,
      legalConcerns: existing.legalConcerns ?? [],
      legalConcernOther: existing.legalConcernOther ?? undefined,

      familyPreparedForPrognosis:
        existing.familyPreparedForPrognosis ?? undefined,
      anticipatoryGrief: existing.anticipatoryGrief ?? undefined,
      bereavementRisk: existing.bereavementRisk ?? undefined,
      familyRequiresSupport: existing.familyRequiresSupport ?? undefined,

      majorSocialIssues: existing.majorSocialIssues ?? [],
      majorSocialIssueOther: existing.majorSocialIssueOther ?? undefined,
      strengthsAndResources: existing.strengthsAndResources ?? undefined,
      areasRequiringIntervention:
        existing.areasRequiringIntervention ?? undefined,

      plannedInterventions: existing.plannedInterventions ?? [],
      plannedInterventionOther:
        existing.plannedInterventionOther ?? undefined,
      followUpPlan: existing.followUpPlan ?? undefined,
      assessmentOutcome: existing.assessmentOutcome ?? [],
    });

    // Hydrate the shadow household-members state from the server record
    const serverMembers = ((existing as any).householdMembers ?? []) as Array<{
      name?: string;
      relationship?: string;
      age?: number;
      occupation?: string;
    }>;

    setHouseholdMembers(
      serverMembers.map((m) => ({
        name: m.name ?? '',
        relationship: m.relationship ?? '',
        age: m.age != null ? String(m.age) : '',
        occupation: m.occupation ?? '',
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ═══════════════════════════════════════════════════════════
  // Submit — create OR update depending on mode
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreateSocialAssessmentFormData) => {
    const parsedHouseholdMembers = householdMembers
      .filter((m) => m.name.trim() || m.relationship.trim())
      .map((m) => {
        const parsedAge = m.age ? Number(m.age) : undefined;
        return {
          name: m.name.trim() || undefined,
          relationship: m.relationship.trim() || undefined,
          age: Number.isFinite(parsedAge) ? parsedAge : undefined,
          occupation: m.occupation.trim() || undefined,
        };
      });

    const payload: CreateSocialAssessmentFormData = {
      ...data,
      householdMembers: parsedHouseholdMembers as any,
    };

    const handleSuccess = () => navigate(basePath);

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message = 'Could not save the social assessment. Please try again.';

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
        { assessmentId, data: payload as any },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      createMutation.mutate(payload as any, {
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

  // ── Write gate — admin bypasses the record-role check ──
  if ((!isAdmin && !access.allowed) || patient.status === 'Discharged') {
    return <Navigate to={`${basePath}/social-assessment`} replace />;
  }

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  const utilities = (watch('utilitiesAccess') ?? {}) as Record<string, boolean>;
  const setUtility = (key: string, on: boolean) =>
    setValue(
      'utilitiesAccess',
      { ...utilities, [key]: on },
      { shouldDirty: true },
    );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Social Assessment"
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

      <Section title="2. Family Composition">
        <Input
          label="Household Size"
          type="number"
          min={1}
          error={errors.householdSize?.message}
          {...register('householdSize', { valueAsNumber: true })}
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
                  label="Relationship"
                  value={member.relationship}
                  onChange={(e) =>
                    updateHouseholdMember(
                      index,
                      'relationship',
                      e.target.value,
                    )
                  }
                  placeholder="e.g. Daughter"
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
                  label="Occupation"
                  value={member.occupation}
                  onChange={(e) =>
                    updateHouseholdMember(index, 'occupation', e.target.value)
                  }
                  placeholder="e.g. Teacher"
                />
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      <Section title="3. Living Arrangement">
        <Select
          label="Living Arrangement"
          options={[
            { value: 'LivesAlone', label: 'Lives alone' },
            { value: 'LivesWithSpouse', label: 'Lives with spouse' },
            { value: 'LivesWithChildren', label: 'Lives with children' },
            { value: 'ExtendedFamily', label: 'Extended family' },
            { value: 'CareInstitution', label: 'Care institution' },
            { value: 'Other', label: 'Other' },
          ]}
          placeholder="Select…"
          {...register('livingArrangement')}
        />
        {watch('livingArrangement') === 'Other' && (
          <Input
            label="Other living arrangement"
            {...register('livingArrangementOther')}
          />
        )}
      </Section>

      <Section title="4. Primary Caregiver">
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
            label="Caregiver Health"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
            ]}
            placeholder="Select…"
            {...register('caregiverHealth')}
          />
          <Select
            label="Caregiver Understanding"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Limited', label: 'Limited' },
              { value: 'None', label: 'None' },
            ]}
            placeholder="Select…"
            {...register('caregiverUnderstanding')}
          />
          <Select
            label="Caregiver Stress"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
              { value: 'Severe', label: 'Severe' },
            ]}
            placeholder="Select…"
            {...register('caregiverStress')}
          />
        </Grid>
      </Section>

      <Section title="5. Social Support">
        <Grid cols={2}>
          <Select
            label="Family Support"
            options={[
              { value: 'Strong', label: 'Strong' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Limited', label: 'Limited' },
              { value: 'None', label: 'None' },
            ]}
            placeholder="Select…"
            {...register('familySupport')}
          />
          <Select
            label="Contact Frequency"
            options={[
              { value: 'Daily', label: 'Daily' },
              { value: 'Weekly', label: 'Weekly' },
              { value: 'Monthly', label: 'Monthly' },
              { value: 'Rarely', label: 'Rarely' },
            ]}
            placeholder="Select…"
            {...register('contactFrequency')}
          />
        </Grid>
        <CheckboxGroup
          label="Community Support"
          values={watch('communitySupport') ?? []}
          options={[
            'ReligiousOrganization',
            'Neighbors',
            'CommunityVolunteers',
            'LocalNgos',
            'NoSupportAvailable',
          ]}
          onChange={(v) =>
            setValue('communitySupport', v as any, { shouldDirty: true })
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
          {...register('isolationRisk')}
        />
      </Section>

      <Section title="6. Financial Assessment">
        <CheckboxGroup
          label="Income Sources"
          values={watch('incomeSources') ?? []}
          options={[
            'Employment',
            'Pension',
            'FamilySupport',
            'SocialAssistance',
            'Savings',
            'None',
            'Other',
          ]}
          onChange={(v) =>
            setValue('incomeSources', v as any, { shouldDirty: true })
          }
        />
        {watch('incomeSources')?.includes('Other') && (
          <Input
            label="Other income source"
            {...register('incomeSourceOther')}
          />
        )}
        <Grid cols={2}>
          <Select
            label="Monthly Household Income"
            options={[
              { value: 'Below2000ETB', label: 'Below 2,000 ETB' },
              { value: 'Between2000And5000ETB', label: '2,000 – 5,000 ETB' },
              {
                value: 'Between5001And10000ETB',
                label: '5,001 – 10,000 ETB',
              },
              { value: 'Above10000ETB', label: 'Above 10,000 ETB' },
            ]}
            placeholder="Select…"
            {...register('monthlyHouseholdIncome')}
          />
          <Select
            label="Financial Risk Level"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
            ]}
            placeholder="Select…"
            {...register('financialRiskLevel')}
          />
        </Grid>
        <CheckboxGroup
          label="Financial Challenges"
          values={watch('financialChallenges') ?? []}
          options={[
            'MedicationCosts',
            'TransportationCosts',
            'FoodExpenses',
            'HousingCosts',
            'CaregiverIncomeLoss',
            'Other',
          ]}
          onChange={(v) =>
            setValue('financialChallenges', v as any, { shouldDirty: true })
          }
        />
        {watch('financialChallenges')?.includes('Other') && (
          <Input
            label="Other financial challenge"
            {...register('financialChallengeOther')}
          />
        )}
      </Section>

      <Section title="7. Housing & Environment">
        <Grid cols={2}>
          <Select
            label="Residence Type"
            options={[
              { value: 'OwnedHouse', label: 'Owned house' },
              { value: 'RentalHouse', label: 'Rental house' },
              { value: 'GovernmentHousing', label: 'Government housing' },
              { value: 'TemporaryShelter', label: 'Temporary shelter' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select…"
            {...register('residenceType')}
          />
          <Select
            label="Home Environment"
            options={[
              { value: 'Safe', label: 'Safe' },
              { value: 'RequiresModification', label: 'Requires modification' },
              { value: 'Unsafe', label: 'Unsafe' },
            ]}
            placeholder="Select…"
            {...register('homeEnvironment')}
          />
        </Grid>
        {watch('residenceType') === 'Other' && (
          <Input
            label="Other residence type"
            {...register('residenceTypeOther')}
          />
        )}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-on-surface">Utility Access</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {UTILITY_KEYS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={!!utilities[key]}
                  onChange={(e) => setUtility(key, e.target.checked)}
                  className="h-3.5 w-3.5 rounded text-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <Select
          label="Home-Based Care Suitability"
          options={[
            { value: 'Suitable', label: 'Suitable' },
            { value: 'PartiallySuitable', label: 'Partially suitable' },
            { value: 'NotSuitable', label: 'Not suitable' },
          ]}
          placeholder="Select…"
          {...register('homeBasedCareSuitability')}
        />
      </Section>

      <Section title="8. Transportation">
        <CheckboxGroup
          label="Transport Access"
          values={watch('transportAccess') ?? []}
          options={[
            'PrivateVehicle',
            'PublicTransport',
            'AmbulanceAccess',
            'NoReliableTransport',
          ]}
          onChange={(v) =>
            setValue('transportAccess', v as any, { shouldDirty: true })
          }
        />
        <Input
          label="Distance to Health Facility (km)"
          type="number"
          step="0.1"
          error={errors.distanceToHealthFacilityKm?.message}
          {...register('distanceToHealthFacilityKm', { valueAsNumber: true })}
        />
        <CheckboxGroup
          label="Transport Challenges"
          values={watch('transportChallenges') ?? []}
          options={[
            'None',
            'Financial',
            'PhysicalAccess',
            'Availability',
            'Other',
          ]}
          onChange={(v) =>
            setValue('transportChallenges', v as any, { shouldDirty: true })
          }
        />
        {watch('transportChallenges')?.includes('Other') && (
          <Input
            label="Other transport challenge"
            {...register('transportChallengeOther')}
          />
        )}
      </Section>

      <Section title="9. Employment & Education">
        <Grid cols={2}>
          <Select
            label="Employment Status"
            options={[
              { value: 'Employed', label: 'Employed' },
              { value: 'Unemployed', label: 'Unemployed' },
              { value: 'Retired', label: 'Retired' },
              { value: 'UnableToWork', label: 'Unable to work' },
            ]}
            placeholder="Select…"
            {...register('employmentStatus')}
          />
          <Select
            label="Education Level"
            options={[
              { value: 'NoFormalEducation', label: 'No formal education' },
              { value: 'PrimarySchool', label: 'Primary school' },
              { value: 'SecondarySchool', label: 'Secondary school' },
              { value: 'Diploma', label: 'Diploma' },
              { value: 'Degree', label: 'Degree' },
              { value: 'Postgraduate', label: 'Postgraduate' },
            ]}
            placeholder="Select…"
            {...register('educationLevel')}
          />
        </Grid>
      </Section>

      <Section title="10. Cultural & Spiritual Considerations">
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
        {watch('religiousAffiliation') === 'Other' && (
          <Input
            label="Other religious affiliation"
            {...register('religiousAffiliationOther')}
          />
        )}
        <YesNo
          label="Spiritual support available?"
          name="spiritualSupportAvailable"
          value={toYesNo(watch('spiritualSupportAvailable'))}
          onChange={(v) =>
            setValue('spiritualSupportAvailable', v === 'Yes', {
              shouldDirty: true,
            })
          }
        />
        <Textarea
          label="Cultural Factors Affecting Care"
          rows={2}
          {...register('culturalFactorsAffectingCare')}
        />
      </Section>

      <Section title="11. Legal & Advocacy">
        <Grid cols={2}>
          <YesNo
            label="Has legal representative?"
            name="hasLegalRepresentative"
            value={toYesNo(watch('hasLegalRepresentative'))}
            onChange={(v) =>
              setValue('hasLegalRepresentative', v === 'Yes', {
                shouldDirty: true,
              })
            }
          />
          <YesNo
            label="Advance directives available?"
            name="advanceDirectivesAvailable"
            value={toYesNo(watch('advanceDirectivesAvailable'))}
            onChange={(v) =>
              setValue('advanceDirectivesAvailable', v === 'Yes', {
                shouldDirty: true,
              })
            }
          />
        </Grid>
        <CheckboxGroup
          label="Legal Concerns"
          values={watch('legalConcerns') ?? []}
          options={[
            'PropertyIssues',
            'GuardianshipIssues',
            'InheritanceIssues',
            'None',
            'Other',
          ]}
          onChange={(v) =>
            setValue('legalConcerns', v as any, { shouldDirty: true })
          }
        />
        {watch('legalConcerns')?.includes('Other') && (
          <Input
            label="Other legal concern"
            {...register('legalConcernOther')}
          />
        )}
      </Section>

      <Section title="12. Bereavement Risk Assessment">
        <Grid cols={2}>
          <Select
            label="Family Prepared for Prognosis"
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Partially', label: 'Partially' },
            ]}
            placeholder="Select…"
            {...register('familyPreparedForPrognosis')}
          />
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
          <Select
            label="Bereavement Risk"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'High', label: 'High' },
            ]}
            placeholder="Select…"
            {...register('bereavementRisk')}
          />
          <YesNo
            label="Family requires support?"
            name="familyRequiresSupport"
            value={toYesNo(watch('familyRequiresSupport'))}
            onChange={(v) =>
              setValue('familyRequiresSupport', v === 'Yes', {
                shouldDirty: true,
              })
            }
          />
        </Grid>
      </Section>

      <Section title="13. Social Work Assessment">
        <CheckboxGroup
          label="Major Social Issues"
          values={watch('majorSocialIssues') ?? []}
          options={[
            'FinancialHardship',
            'CaregiverBurden',
            'SocialIsolation',
            'HousingProblems',
            'TransportationBarriers',
            'FoodInsecurity',
            'FamilyConflict',
            'LackOfSocialSupport',
            'Other',
          ]}
          onChange={(v) =>
            setValue('majorSocialIssues', v as any, { shouldDirty: true })
          }
        />
        {watch('majorSocialIssues')?.includes('Other') && (
          <Input
            label="Other social issue"
            {...register('majorSocialIssueOther')}
          />
        )}
        <Textarea
          label="Strengths & Resources"
          rows={3}
          {...register('strengthsAndResources')}
        />
        <Textarea
          label="Areas Requiring Intervention"
          rows={3}
          {...register('areasRequiringIntervention')}
        />
      </Section>

      <Section title="14. Social Care Plan">
        <CheckboxGroup
          label="Planned Interventions"
          values={watch('plannedInterventions') ?? []}
          options={[
            'FamilyCounseling',
            'FinancialAssistanceReferral',
            'CommunityResourceMobilization',
            'CaregiverSupport',
            'HomeCareAssessment',
            'SpiritualCareReferral',
            'BereavementSupport',
            'LegalSupportReferral',
            'Other',
          ]}
          onChange={(v) =>
            setValue('plannedInterventions', v as any, { shouldDirty: true })
          }
        />
        {watch('plannedInterventions')?.includes('Other') && (
          <Input
            label="Other planned intervention"
            {...register('plannedInterventionOther')}
          />
        )}
        <Textarea
          label="Follow-Up Plan"
          rows={3}
          {...register('followUpPlan')}
        />
      </Section>

      <Section title="15. Summary">
        <CheckboxGroup
          label="Assessment Outcome"
          values={watch('assessmentOutcome') ?? []}
          options={[
            'SuitableForInpatientHospiceCare',
            'SuitableForHomeBasedHospiceCare',
            'RequiresAdditionalSocialSupport',
            'RequiresCommunityResourceMobilization',
            'HighRiskSocialSituation',
            'FollowUpAssessmentRequired',
          ]}
          onChange={(v) =>
            setValue('assessmentOutcome', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default SocialAssessmentFormPage;