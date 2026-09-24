import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import { useCreatePharmacistAssessment } from '@/hooks/usePharmacistAssessments';
import {
  createPharmacistAssessmentSchema,
  type CreatePharmacistAssessmentFormData,
} from '@/schemas/pharmacist-assessment.schema';

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

const PharmacistAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreatePharmacistAssessment(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePharmacistAssessmentFormData>({
    resolver: zodResolver(createPharmacistAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      otcHerbalUsed: false,
      hasAdrHistory: false,
      analgesicNonOpioids: false,
      analgesicWeakOpioids: false,
      analgesicStrongOpioids: false,
      analgesicAdjuvants: false,
      opioidSideEffects: [],
      drugDiseaseInteractions: false,
      highRiskMedications: [],
      suspectedAdr: false,
      adrManagement: [],
      laxativeUse: false,
      doseAdjustmentRequired: false,
      doseAdjustmentReasons: [],
      counselingTopics: [],
      medicationPlanActions: [],
      financialBarriers: false,
      pharmacyIntervention: false,
      summaryFlags: [],
      finalRecommendations: [],
      currentMedications: [],
      symptomMedicationEffectiveness: {},
    },
  });

  const onSubmit = (data: CreatePharmacistAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${
    patient.patientDisplayId ?? patient.id
  }`;

  // Analgesic checkbox bridge (4 separate boolean fields → one visual group)
  const analgesicValues: string[] = [
    ...(watch('analgesicNonOpioids') ? ['Non-opioids'] : []),
    ...(watch('analgesicWeakOpioids') ? ['Weak opioids'] : []),
    ...(watch('analgesicStrongOpioids') ? ['Strong opioids'] : []),
    ...(watch('analgesicAdjuvants') ? ['Adjuvants'] : []),
  ];

  return (
    <AssessmentFormShell
      title="Pharmacist Assessment"
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
            { value: 'MedicationReview', label: 'Medication Review' },
          ]}
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      {/* ── 2. Patient context ── */}
      <Section title="2. Patient Context">
        <Grid cols={2}>
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            {...register('weightKg')}
          />
          <Input
            label="Ward / Unit"
            placeholder="e.g. Palliative Care Ward"
            {...register('wardUnit')}
          />
        </Grid>
        <Textarea
          label="Known Allergies"
          rows={2}
          placeholder="e.g. Penicillin, Sulfa drugs"
          {...register('allergies')}
        />
      </Section>

      {/* ── 3. Medication history ── */}
      <Section title="3. Medication History">
        <YesNo
          label="OTC / Herbal medicines used?"
          name="otcHerbalUsed"
          value={watch('otcHerbalUsed') ? 'Yes' : 'No'}
          onChange={(v) => setValue('otcHerbalUsed', v === 'Yes')}
        />
        {watch('otcHerbalUsed') && (
          <Input
            label="Details of OTC / herbal use"
            {...register('otcHerbalDetails')}
          />
        )}
        <Select
          label="Medication History Adherence"
          options={[
            { value: 'Good', label: 'Good' },
            { value: 'Fair', label: 'Fair' },
            { value: 'Poor', label: 'Poor' },
            { value: 'Unknown', label: 'Unknown' },
          ]}
          placeholder="Select…"
          {...register('medicationHistoryAdherence')}
        />
        <YesNo
          label="History of adverse drug reactions?"
          name="hasAdrHistory"
          value={watch('hasAdrHistory') ? 'Yes' : 'No'}
          onChange={(v) => setValue('hasAdrHistory', v === 'Yes')}
        />
        {watch('hasAdrHistory') && (
          <Textarea
            label="ADR history details"
            rows={2}
            {...register('adrHistoryDetails')}
          />
        )}
      </Section>

      {/* ── 4. Pain management review ── */}
      <Section title="4. Pain Management Review">
        <CheckboxGroup
          label="Analgesics Currently In Use"
          values={analgesicValues}
          options={['Non-opioids', 'Weak opioids', 'Strong opioids', 'Adjuvants']}
          onChange={(vals) => {
            setValue('analgesicNonOpioids', vals.includes('Non-opioids'));
            setValue('analgesicWeakOpioids', vals.includes('Weak opioids'));
            setValue('analgesicStrongOpioids', vals.includes('Strong opioids'));
            setValue('analgesicAdjuvants', vals.includes('Adjuvants'));
          }}
        />
        <Grid cols={2}>
          <Select
            label="Pain Control"
            options={[
              { value: 'WellControlled', label: 'Well controlled' },
              { value: 'PartiallyControlled', label: 'Partially controlled' },
              { value: 'PoorlyControlled', label: 'Poorly controlled' },
            ]}
            placeholder="Select…"
            {...register('painControl')}
          />
          <Select
            label="Breakthrough Pain"
            options={[
              { value: 'None', label: 'None' },
              { value: 'Occasional', label: 'Occasional' },
              { value: 'Frequent', label: 'Frequent' },
            ]}
            placeholder="Select…"
            {...register('breakthroughPain')}
          />
        </Grid>
        <CheckboxGroup
          label="Opioid Side Effects"
          values={watch('opioidSideEffects') ?? []}
          options={[
            'Constipation',
            'Nausea',
            'Sedation',
            'Confusion',
            'RespiratoryDepression',
            'None',
          ]}
          onChange={(v) => setValue('opioidSideEffects', v as any)}
        />
      </Section>

      {/* ── 5. Medication safety ── */}
      <Section title="5. Medication Safety">
        <Select
          label="Drug–Drug Interaction Risk"
          options={[
            { value: 'None', label: 'None' },
            { value: 'Possible', label: 'Possible' },
            { value: 'Significant', label: 'Significant' },
          ]}
          placeholder="Select…"
          {...register('drugDrugInteractions')}
        />
        <Textarea
          label="Interaction details"
          rows={2}
          {...register('drugDrugInteractionDetails')}
        />
        <YesNo
          label="Drug–Disease Interactions?"
          name="drugDiseaseInteractions"
          value={watch('drugDiseaseInteractions') ? 'Yes' : 'No'}
          onChange={(v) => setValue('drugDiseaseInteractions', v === 'Yes')}
        />
        {watch('drugDiseaseInteractions') && (
          <Textarea
            label="Details"
            rows={2}
            {...register('drugDiseaseInteractionDetails')}
          />
        )}
        <CheckboxGroup
          label="High-Risk Medications"
          values={watch('highRiskMedications') ?? []}
          options={[
            'Opioids',
            'Benzodiazepines',
            'Anticoagulants',
            'Steroids',
            'Antiepileptics',
          ]}
          onChange={(v) => setValue('highRiskMedications', v as any)}
        />
      </Section>

      {/* ── 6. Renal & hepatic ── */}
      <Section title="6. Renal & Hepatic Function">
        <Grid cols={2}>
          <Select
            label="Renal Function"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Impaired', label: 'Impaired' },
              { value: 'Unknown', label: 'Unknown' },
            ]}
            placeholder="Select…"
            {...register('renalFunction')}
          />
          <Input
            label="Creatinine"
            placeholder="e.g. 1.2 mg/dL"
            {...register('creatinine')}
          />
          <Select
            label="Hepatic Function"
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Impaired', label: 'Impaired' },
              { value: 'Unknown', label: 'Unknown' },
            ]}
            placeholder="Select…"
            {...register('hepaticFunction')}
          />
          <Input
            label="LFTs"
            placeholder="e.g. ALT 45, AST 52"
            {...register('lfts')}
          />
        </Grid>
      </Section>

      {/* ── 7. Current medications ── */}
      <Section title="7. Current Medications">
        <p className="text-xs text-text-muted -mt-2">
          Enter each medication on its own line as{' '}
          <code className="bg-surface-low px-1 rounded">
            Name | Dose | Route | Frequency | Indication
          </code>
        </p>
        <Textarea
          label="Medication list"
          rows={5}
          placeholder={
            'Morphine | 10mg | Oral | Every 6h | Pain\nLactulose | 15ml | Oral | Twice daily | Constipation'
          }
          onChange={(e) => {
            const rows = e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [name = '', dose = '', route = '', frequency = '', indication = ''] =
                  l.split('|');
                return {
                  name: name.trim(),
                  dose: dose.trim(),
                  route: route.trim(),
                  frequency: frequency.trim(),
                  indication: indication.trim(),
                };
              });
            setValue('currentMedications', rows);
          }}
        />
      </Section>

      {/* ── 8. Adverse drug reactions ── */}
      <Section title="8. Adverse Drug Reactions">
        <YesNo
          label="Suspected ADR?"
          name="suspectedAdr"
          value={watch('suspectedAdr') ? 'Yes' : 'No'}
          onChange={(v) => setValue('suspectedAdr', v === 'Yes')}
        />
        {watch('suspectedAdr') && (
          <>
            <Grid cols={2}>
              <Input label="Suspected Drug" {...register('suspectedAdrDrug')} />
              <Select
                label="Severity"
                options={[
                  { value: 'Mild', label: 'Mild' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Severe', label: 'Severe' },
                ]}
                placeholder="Select…"
                {...register('adrSeverity')}
              />
            </Grid>
            <Textarea
              label="Reaction description"
              rows={2}
              {...register('suspectedAdrReaction')}
            />
            <CheckboxGroup
              label="ADR Management"
              values={watch('adrManagement') ?? []}
              options={[
                'DoseAdjustment',
                'DrugDiscontinued',
                'SymptomaticTreatment',
                'ReportedToCommittee',
              ]}
              onChange={(v) => setValue('adrManagement', v as any)}
            />
          </>
        )}
      </Section>

      {/* ── 9. Bowel management ── */}
      <Section title="9. Bowel Management">
        <Select
          label="Bowel Function"
          options={[
            { value: 'Normal', label: 'Normal' },
            { value: 'Constipated', label: 'Constipated' },
            { value: 'SevereConstipation', label: 'Severe constipation' },
          ]}
          placeholder="Select…"
          {...register('bowelFunction')}
        />
        <YesNo
          label="On laxatives?"
          name="laxativeUse"
          value={watch('laxativeUse') ? 'Yes' : 'No'}
          onChange={(v) => setValue('laxativeUse', v === 'Yes')}
        />
        {watch('laxativeUse') && (
          <Input label="Laxative details" {...register('laxativeDetails')} />
        )}
      </Section>

      {/* ── 10. Dose adjustment ── */}
      <Section title="10. Dose Adjustment">
        <YesNo
          label="Dose adjustment required?"
          name="doseAdjustmentRequired"
          value={watch('doseAdjustmentRequired') ? 'Yes' : 'No'}
          onChange={(v) => setValue('doseAdjustmentRequired', v === 'Yes')}
        />
        {watch('doseAdjustmentRequired') && (
          <CheckboxGroup
            label="Reasons"
            values={watch('doseAdjustmentReasons') ?? []}
            options={[
              'RenalImpairment',
              'HepaticImpairment',
              'ElderlyDosing',
              'WeightBasedAdjustment',
            ]}
            onChange={(v) => setValue('doseAdjustmentReasons', v as any)}
          />
        )}
      </Section>

      {/* ── 11. Patient counselling ── */}
      <Section title="11. Patient Counselling">
        <Select
          label="Patient Understanding"
          options={[
            { value: 'Good', label: 'Good' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Poor', label: 'Poor' },
          ]}
          placeholder="Select…"
          {...register('patientUnderstanding')}
        />
        <CheckboxGroup
          label="Counselling Topics"
          values={watch('counselingTopics') ?? []}
          options={[
            'PainMedications',
            'OpioidSafety',
            'SideEffects',
            'Adherence',
            'ConstipationPrevention',
            'EndOfLifeMedications',
          ]}
          onChange={(v) => setValue('counselingTopics', v as any)}
        />
      </Section>

      {/* ── 12. Pharmaceutical care plan ── */}
      <Section title="12. Pharmaceutical Care Plan">
        <Textarea
          label="Current Issues Identified"
          rows={3}
          {...register('currentIssuesIdentified')}
        />
        <CheckboxGroup
          label="Plan Actions"
          values={watch('medicationPlanActions') ?? []}
          options={[
            'OptimizeAnalgesicRegimen',
            'StartAdjustLaxatives',
            'ManageNauseaVomiting',
            'ReviewPolypharmacy',
            'ReduceUnnecessaryMedications',
            'InitiateAdjuvantTherapy',
            'MonitorSedationLevel',
            'Other',
          ]}
          onChange={(v) => setValue('medicationPlanActions', v as any)}
        />
        {watch('medicationPlanActions')?.includes('Other') && (
          <Input
            label="Other action details"
            {...register('medicationPlanOther')}
          />
        )}
      </Section>

      {/* ── 13. Access & supply ── */}
      <Section title="13. Medication Access & Supply">
        <Select
          label="Medication Availability"
          options={[
            { value: 'AllAvailable', label: 'All available' },
            { value: 'PartiallyAvailable', label: 'Partially available' },
            { value: 'NotAvailable', label: 'Not available' },
          ]}
          placeholder="Select…"
          {...register('medicationAvailability')}
        />
        <Grid cols={2}>
          <YesNo
            label="Financial barriers?"
            name="financialBarriers"
            value={watch('financialBarriers') ? 'Yes' : 'No'}
            onChange={(v) => setValue('financialBarriers', v === 'Yes')}
          />
          <YesNo
            label="Pharmacy intervention?"
            name="pharmacyIntervention"
            value={watch('pharmacyIntervention') ? 'Yes' : 'No'}
            onChange={(v) => setValue('pharmacyIntervention', v === 'Yes')}
          />
        </Grid>
      </Section>

      {/* ── 14. Summary & recommendations ── */}
      <Section title="14. Summary & Recommendations">
        <Input
          label="Clinical Pharmacist Name"
          {...register('clinicalPharmacistName')}
        />
        <Textarea
          label="Pharmacist Summary"
          rows={4}
          {...register('pharmacistSummary')}
        />
        <CheckboxGroup
          label="Summary Flags"
          values={watch('summaryFlags') ?? []}
          options={[
            'MedicationRegimenAppropriate',
            'RequiresOptimization',
            'RequiresUrgentIntervention',
            'HighRiskMedicationProfile',
            'DeprescribingRecommended',
            'OngoingMonitoringRequired',
          ]}
          onChange={(v) => setValue('summaryFlags', v as any)}
        />
        <CheckboxGroup
          label="Final Recommendations"
          values={watch('finalRecommendations') ?? []}
          options={[
            'ContinueCurrentRegimen',
            'ModifyAnalgesicPlan',
            'InitiateSymptomControlMedications',
            'DeprescribeNonEssentialMedications',
            'EnhanceSafetyMonitoring',
            'MultidisciplinaryReviewRequired',
          ]}
          onChange={(v) => setValue('finalRecommendations', v as any)}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PharmacistAssessmentFormPage;