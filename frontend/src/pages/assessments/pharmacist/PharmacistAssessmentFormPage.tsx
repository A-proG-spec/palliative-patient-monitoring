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
import { useToast } from '@/context/ToastContext';

// ── Helpers ─────────────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

const toYesNo = (v: boolean | null | undefined): 'Yes' | 'No' | '' =>
  v === undefined || v === null ? '' : v ? 'Yes' : 'No';

const PharmacistAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientPath = `/patients/${id}`;

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

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreatePharmacistAssessmentFormData) => {
    createMutation.mutate(data as any, {
      onSuccess: () => navigate(patientPath),
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ??
          'Failed to save pharmacist assessment.';
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

  // ── Controlled text state for the medications textarea ──
  // Prevents the row list from being lost on re-render.
  const [medicationsText, setMedicationsText] = React.useState('');

  // ── Analgesic bridge: derive array from 4 booleans ──
  const analgesicValues: string[] = [
    ...(watch('analgesicNonOpioids') ? ['Non-opioids'] : []),
    ...(watch('analgesicWeakOpioids') ? ['Weak opioids'] : []),
    ...(watch('analgesicStrongOpioids') ? ['Strong opioids'] : []),
    ...(watch('analgesicAdjuvants') ? ['Adjuvants'] : []),
  ];

  const setAnalgesic = (vals: string[]) => {
    setValue('analgesicNonOpioids', vals.includes('Non-opioids'), {
      shouldDirty: true,
    });
    setValue('analgesicWeakOpioids', vals.includes('Weak opioids'), {
      shouldDirty: true,
    });
    setValue('analgesicStrongOpioids', vals.includes('Strong opioids'), {
      shouldDirty: true,
    });
    setValue('analgesicAdjuvants', vals.includes('Adjuvants'), {
      shouldDirty: true,
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  return (
    <AssessmentFormShell
      title="Pharmacist Assessment"
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
            { value: 'MedicationReview', label: 'Medication review' },
          ]}
          placeholder="Select…"
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
            error={errors.weightKg?.message}
            {...register('weightKg', { valueAsNumber: true })}
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
          value={toYesNo(watch('otcHerbalUsed'))}
          onChange={(v) =>
            setValue('otcHerbalUsed', v === 'Yes', { shouldDirty: true })
          }
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
          value={toYesNo(watch('hasAdrHistory'))}
          onChange={(v) =>
            setValue('hasAdrHistory', v === 'Yes', { shouldDirty: true })
          }
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
          onChange={setAnalgesic}
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
          onChange={(v) =>
            setValue('opioidSideEffects', v as any, { shouldDirty: true })
          }
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
          value={toYesNo(watch('drugDiseaseInteractions'))}
          onChange={(v) =>
            setValue('drugDiseaseInteractions', v === 'Yes', {
              shouldDirty: true,
            })
          }
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
          onChange={(v) =>
            setValue('highRiskMedications', v as any, { shouldDirty: true })
          }
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
          value={medicationsText}
          onChange={(e) => {
            const raw = e.target.value;
            setMedicationsText(raw);

            const rows = raw
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

            setValue('currentMedications', rows, { shouldDirty: true });
          }}
          placeholder={
            'Morphine | 10mg | Oral | Every 6h | Pain\nLactulose | 15ml | Oral | Twice daily | Constipation'
          }
        />
      </Section>

      {/* ── 8. Adverse drug reactions ── */}
      <Section title="8. Adverse Drug Reactions">
        <YesNo
          label="Suspected ADR?"
          name="suspectedAdr"
          value={toYesNo(watch('suspectedAdr'))}
          onChange={(v) =>
            setValue('suspectedAdr', v === 'Yes', { shouldDirty: true })
          }
        />
        {watch('suspectedAdr') && (
          <>
            <Grid cols={2}>
              <Input
                label="Suspected Drug"
                {...register('suspectedAdrDrug')}
              />
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
              onChange={(v) =>
                setValue('adrManagement', v as any, { shouldDirty: true })
              }
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
          value={toYesNo(watch('laxativeUse'))}
          onChange={(v) =>
            setValue('laxativeUse', v === 'Yes', { shouldDirty: true })
          }
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
          value={toYesNo(watch('doseAdjustmentRequired'))}
          onChange={(v) =>
            setValue('doseAdjustmentRequired', v === 'Yes', {
              shouldDirty: true,
            })
          }
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
            onChange={(v) =>
              setValue('doseAdjustmentReasons', v as any, {
                shouldDirty: true,
              })
            }
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
          onChange={(v) =>
            setValue('counselingTopics', v as any, { shouldDirty: true })
          }
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
          onChange={(v) =>
            setValue('medicationPlanActions', v as any, { shouldDirty: true })
          }
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
            value={toYesNo(watch('financialBarriers'))}
            onChange={(v) =>
              setValue('financialBarriers', v === 'Yes', { shouldDirty: true })
            }
          />
          <YesNo
            label="Pharmacy intervention?"
            name="pharmacyIntervention"
            value={toYesNo(watch('pharmacyIntervention'))}
            onChange={(v) =>
              setValue('pharmacyIntervention', v === 'Yes', {
                shouldDirty: true,
              })
            }
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
          onChange={(v) =>
            setValue('summaryFlags', v as any, { shouldDirty: true })
          }
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
          onChange={(v) =>
            setValue('finalRecommendations', v as any, { shouldDirty: true })
          }
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PharmacistAssessmentFormPage;