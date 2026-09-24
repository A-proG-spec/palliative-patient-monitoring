import React from 'react';
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

const SocialAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const onSubmit = (data: CreateSocialAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${
    patient.patientDisplayId ?? patient.id
  }`;

  const utilities = watch('utilitiesAccess') ?? {};
  const setUtility = (key: string, on: boolean) =>
    setValue('utilitiesAccess', { ...utilities, [key]: on });

  return (
    <AssessmentFormShell
      title="Social Assessment"
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      mode="create"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(`/patients/${id}`)}
    >
      {/* ── 1. Assessment type ── */}
      <Section title="1. Assessment Type">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'Reassessment', label: 'Reassessment' },
          ]}
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
          {...register('householdSize')}
        />
        <Textarea
          label="Household Members"
          rows={5}
          placeholder="One per line as: Name | Relationship | Age | Occupation"
          onChange={(e) => {
            const rows = e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [name = '', relationship = '', age = '', occupation = ''] =
                  l.split('|');
                return {
                  name: name.trim(),
                  relationship: relationship.trim(),
                  age: age.trim() ? Number(age.trim()) : undefined,
                  occupation: occupation.trim(),
                };
              });
            setValue('householdMembers', rows as any);
          }}
        />
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
          onChange={(v) => setValue('communitySupport', v as any)}
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
          onChange={(v) => setValue('incomeSources', v as any)}
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
          onChange={(v) => setValue('financialChallenges', v as any)}
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
            {['Electricity', 'WaterSupply', 'ToiletFacility', 'TelephoneAccess'].map(
              (u) => (
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
              ),
            )}
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
          onChange={(v) => setValue('transportAccess', v as any)}
        />
        <Grid cols={2}>
          <Input
            label="Distance to Health Facility (km)"
            type="number"
            step="0.1"
            {...register('distanceToHealthFacilityKm')}
          />
        </Grid>
        <CheckboxGroup
          label="Transport Challenges"
          values={watch('transportChallenges') ?? []}
          options={['None', 'Financial', 'PhysicalAccess', 'Availability', 'Other']}
          onChange={(v) => setValue('transportChallenges', v as any)}
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
        </Grid>
        {watch('religiousAffiliation') === 'Other' && (
          <Input
            label="Other religious affiliation"
            {...register('religiousAffiliationOther')}
          />
        )}
        <YesNo
          label="Spiritual support available?"
          name="spiritualSupportAvailable"
          value={
            watch('spiritualSupportAvailable') === undefined
              ? ''
              : watch('spiritualSupportAvailable')
                ? 'Yes'
                : 'No'
          }
          onChange={(v) =>
            setValue('spiritualSupportAvailable', v === 'Yes')
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
            value={
              watch('hasLegalRepresentative') === undefined
                ? ''
                : watch('hasLegalRepresentative')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('hasLegalRepresentative', v === 'Yes')
            }
          />
          <YesNo
            label="Advance directives available?"
            name="advanceDirectivesAvailable"
            value={
              watch('advanceDirectivesAvailable') === undefined
                ? ''
                : watch('advanceDirectivesAvailable')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('advanceDirectivesAvailable', v === 'Yes')
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
          onChange={(v) => setValue('legalConcerns', v as any)}
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
            value={
              watch('familyRequiresSupport') === undefined
                ? ''
                : watch('familyRequiresSupport')
                  ? 'Yes'
                  : 'No'
            }
            onChange={(v) =>
              setValue('familyRequiresSupport', v === 'Yes')
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
          onChange={(v) => setValue('majorSocialIssues', v as any)}
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
          onChange={(v) => setValue('plannedInterventions', v as any)}
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
          onChange={(v) => setValue('assessmentOutcome', v as any)}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default SocialAssessmentFormPage;