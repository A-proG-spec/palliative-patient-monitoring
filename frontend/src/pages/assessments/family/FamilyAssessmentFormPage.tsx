import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import { useCreateFamilyAssessment } from '@/hooks/useFamilyAssessments';
import {
  createFamilyAssessmentSchema,
  type CreateFamilyAssessmentFormData,
} from '@/schemas/family-assessment.schema';

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

const FamilyAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreateFamilyAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const onSubmit = (data: CreateFamilyAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${
    patient.patientDisplayId ?? patient.id
  }`;

  // Utilities access — JSON map bridging
  const utilities = watch('utilitiesAccess') ?? {};
  const setUtility = (key: string, on: boolean) =>
    setValue('utilitiesAccess', { ...utilities, [key]: on });

  return (
    <AssessmentFormShell
      title="Family Assessment"
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
            { value: 'CrisisReview', label: 'Crisis Review' },
          ]}
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      {/* ── 2. Family composition ── */}
      <Section title="2. Family Composition">
        <Grid cols={2}>
          <Input
            label="Household Size"
            type="number"
            min={1}
            {...register('householdSize')}
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
        <Textarea
          label="Household Members"
          rows={5}
          placeholder={`One per line as: Name | Age | Relationship | Occupation | Contact`}
          onChange={(e) => {
            const rows = e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [name = '', age = '', relationship = '', occupation = '', contact = ''] =
                  l.split('|');
                return {
                  name: name.trim(),
                  age: age.trim() ? Number(age.trim()) : undefined,
                  relationship: relationship.trim(),
                  occupation: occupation.trim(),
                  contact: contact.trim(),
                };
              });
            setValue('householdMembers', rows as any);
          }}
        />
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
            label="Age"
            type="number"
            {...register('primaryCaregiverAge')}
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
          onChange={(v) => setValue('externalSupport', v as any)}
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
          onChange={(v) => setValue('incomeSources', v as any)}
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
          onChange={(v) => setValue('financialChallenges', v as any)}
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
          onChange={(v) => setValue('burdenFactors', v as any)}
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
          onChange={(v) => setValue('needs', v as any)}
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
          onChange={(v) => setValue('strengths', v as any)}
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
          onChange={(v) => setValue('supportServices', v as any)}
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
        <Input
          label="Assessor Name"
          {...register('assessorName')}
        />
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
          onChange={(v) => setValue('assessmentOutcome', v as any)}
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
          onChange={(v) => setValue('finalRecommendations', v as any)}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default FamilyAssessmentFormPage;