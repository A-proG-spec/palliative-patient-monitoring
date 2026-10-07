import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import { useCreateSocialAssessment } from '@/hooks/useSocialAssessments';
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

const SocialAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientPath = `/patients/${id}`;

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreateSocialAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  // ── Controlled text for the household members textarea ──
  const [householdText, setHouseholdText] = useState('');

  const parseHouseholdText = (text: string) => {
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|').map((s) => s.trim());
        const [name = '', relationship = '', age = '', occupation = ''] = parts;
        const parsedAge = age ? Number(age) : undefined;
        return {
          name,
          relationship,
          age: Number.isFinite(parsedAge) ? parsedAge : undefined,
          occupation,
        };
      });
  };

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreateSocialAssessmentFormData) => {
    const payload: CreateSocialAssessmentFormData = {
      ...data,
      householdMembers: parseHouseholdText(householdText) as any,
    };

    createMutation.mutate(payload as any, {
      onSuccess: () => navigate(patientPath),
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ?? 'Failed to save social assessment.';
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

  // ── Utilities JSON bridge ──
  const utilities = (watch('utilitiesAccess') ?? {}) as Record<string, boolean>;
  const setUtility = (key: string, on: boolean) =>
    setValue('utilitiesAccess', { ...utilities, [key]: on }, {
      shouldDirty: true,
    });

  return (
    <AssessmentFormShell
      title="Social Assessment"
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

      {/* ── 2. Family composition ── */}
      <Section title="2. Family Composition">
        <Input
          label="Household Size"
          type="number"
          min={1}
          error={errors.householdSize?.message}
          {...register('householdSize', { valueAsNumber: true })}
        />
        <div className="space-y-1.5">
          <Textarea
            label="Household Members"
            rows={5}
            value={householdText}
            onChange={(e) => setHouseholdText(e.target.value)}
            placeholder="One per line as: Name | Relationship | Age | Occupation"
          />
          <p className="text-[11px] text-text-muted">
            Format: <code>Name | Relationship | Age | Occupation</code> — one
            member per line. Age must be numeric; leave blank if unknown.
          </p>
        </div>
      </Section>

      {/* ── 3. Living arrangement ── */}
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

      {/* ── 4. Caregiver ── */}
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

      {/* ── 5. Social support ── */}
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

      {/* ── 6. Financial ── */}
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
              { value: 'Between5001And10000ETB', label: '5,001 – 10,000 ETB' },
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

      {/* ── 7. Housing ── */}
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

      {/* ── 8. Transportation ── */}
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
          options={['None', 'Financial', 'PhysicalAccess', 'Availability', 'Other']}
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

      {/* ── 9. Employment & education ── */}
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

      {/* ── 10. Cultural & spiritual ── */}
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

      {/* ── 11. Legal & advocacy ── */}
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

      {/* ── 12. Bereavement risk ── */}
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

      {/* ── 13. Social work assessment ── */}
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

      {/* ── 14. Care plan ── */}
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

      {/* ── 15. Summary ── */}
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