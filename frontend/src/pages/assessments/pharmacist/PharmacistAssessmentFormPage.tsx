import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatient } from '@/hooks/usePatients';
import {
  useCreatePharmacistAssessment,
  usePharmacistAssessment,
  useUpdatePharmacistAssessment,
} from '@/hooks/usePharmacistAssessments';
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

type MedicationRow = {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
};

const PharmacistAssessmentFormPage: React.FC = () => {
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

  const createMutation = useCreatePharmacistAssessment(id!);
  const updateMutation = useUpdatePharmacistAssessment(id!);

  // ── Fetch existing record only in edit mode ──
  const { data: existing, isLoading: existingLoading } =
    usePharmacistAssessment(id!, assessmentId ?? '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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

  const [medications, setMedications] = React.useState<MedicationRow[]>([]);

  const addMedication = () =>
    setMedications((prev) => [
      ...prev,
      { name: '', dose: '', route: '', frequency: '', indication: '' },
    ]);

  const updateMedication = (
    index: number,
    field: keyof MedicationRow,
    value: string,
  ) =>
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );

  const removeMedication = (index: number) =>
    setMedications((prev) => prev.filter((_, i) => i !== index));

  // ═══════════════════════════════════════════════════════════
  // EDIT: hydrate form + medications shadow state from server
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEditMode || !existing) return;

    reset({
      assessmentType: existing.assessmentType ?? 'Admission',
      weightKg: existing.weightKg ?? undefined,
      wardUnit: existing.wardUnit ?? undefined,
      allergies: existing.allergies ?? undefined,

      otcHerbalUsed: existing.otcHerbalUsed ?? false,
      otcHerbalDetails: existing.otcHerbalDetails ?? undefined,
      medicationHistoryAdherence:
        existing.medicationHistoryAdherence ?? undefined,
      hasAdrHistory: existing.hasAdrHistory ?? false,
      adrHistoryDetails: existing.adrHistoryDetails ?? undefined,

      analgesicNonOpioids: existing.analgesicNonOpioids ?? false,
      analgesicWeakOpioids: existing.analgesicWeakOpioids ?? false,
      analgesicStrongOpioids: existing.analgesicStrongOpioids ?? false,
      analgesicAdjuvants: existing.analgesicAdjuvants ?? false,
      analgesicOtherDetails: existing.analgesicOtherDetails ?? undefined,
      painControl: existing.painControl ?? undefined,
      breakthroughPain: existing.breakthroughPain ?? undefined,
      opioidSideEffects: existing.opioidSideEffects ?? [],

      drugDrugInteractions: existing.drugDrugInteractions ?? undefined,
      drugDrugInteractionDetails:
        existing.drugDrugInteractionDetails ?? undefined,
      drugDiseaseInteractions: existing.drugDiseaseInteractions ?? false,
      drugDiseaseInteractionDetails:
        existing.drugDiseaseInteractionDetails ?? undefined,
      highRiskMedications: existing.highRiskMedications ?? [],

      renalFunction: existing.renalFunction ?? undefined,
      creatinine: existing.creatinine ?? undefined,
      hepaticFunction: existing.hepaticFunction ?? undefined,
      lfts: existing.lfts ?? undefined,

      suspectedAdr: existing.suspectedAdr ?? false,
      suspectedAdrDrug: existing.suspectedAdrDrug ?? undefined,
      suspectedAdrReaction: existing.suspectedAdrReaction ?? undefined,
      adrSeverity: existing.adrSeverity ?? undefined,
      adrManagement: existing.adrManagement ?? [],

      bowelFunction: existing.bowelFunction ?? undefined,
      laxativeUse: existing.laxativeUse ?? false,
      laxativeDetails: existing.laxativeDetails ?? undefined,

      doseAdjustmentRequired: existing.doseAdjustmentRequired ?? false,
      doseAdjustmentReasons: existing.doseAdjustmentReasons ?? [],

      patientUnderstanding: existing.patientUnderstanding ?? undefined,
      counselingTopics: existing.counselingTopics ?? [],

      currentIssuesIdentified: existing.currentIssuesIdentified ?? undefined,
      medicationPlanActions: existing.medicationPlanActions ?? [],
      medicationPlanOther: existing.medicationPlanOther ?? undefined,

      medicationAvailability: existing.medicationAvailability ?? undefined,
      financialBarriers: existing.financialBarriers ?? false,
      pharmacyIntervention: existing.pharmacyIntervention ?? false,

      clinicalPharmacistName: existing.clinicalPharmacistName ?? undefined,
      pharmacistSummary: existing.pharmacistSummary ?? undefined,
      summaryFlags: existing.summaryFlags ?? [],
      finalRecommendations: existing.finalRecommendations ?? [],

      symptomMedicationEffectiveness:
        (existing as any).symptomMedicationEffectiveness ?? {},
    });

    // Hydrate the shadow medication list from the server record
    const serverMeds = ((existing as any).currentMedications ?? []) as Array<{
      name?: string;
      dose?: string;
      route?: string;
      frequency?: string;
      indication?: string;
    }>;

    setMedications(
      serverMeds.map((m) => ({
        name: m.name ?? '',
        dose: m.dose ?? '',
        route: m.route ?? '',
        frequency: m.frequency ?? '',
        indication: m.indication ?? '',
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existing?.id]);

  // ═══════════════════════════════════════════════════════════
  // Submit — create OR update depending on mode
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (data: CreatePharmacistAssessmentFormData) => {
    const parsedMedications = medications
      .filter((m) => m.name.trim() || m.dose.trim() || m.indication.trim())
      .map((m) => ({
        name: m.name.trim() || undefined,
        dose: m.dose.trim() || undefined,
        route: m.route.trim() || undefined,
        frequency: m.frequency.trim() || undefined,
        indication: m.indication.trim() || undefined,
      }));

    const payload = {
      ...data,
      currentMedications: parsedMedications,
    };

    const handleSuccess = () => navigate(basePath);

    const handleError = (err: any) => {
      const status = err?.response?.status;
      let message =
        'Could not save the pharmacist assessment. Please try again.';

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

  // ── Loading / error states ──
  if (isLoading || (isEditMode && existingLoading)) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AssessmentFormShell
      title="Pharmacist Assessment"
      patientLabel={patientLabel}
      backTo={basePath}
      mode={isEditMode ? 'edit' : 'create'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onCancel={() => navigate(basePath)}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface">
              Medication List
            </p>
            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <span aria-hidden>+</span> Add Medication
            </button>
          </div>

          {medications.length === 0 && (
            <p className="text-[11px] text-text-muted italic">
              No medications added yet. Click "Add Medication" to begin.
            </p>
          )}

          {medications.map((med, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-surface p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">
                  Medication #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>

              <Grid cols={2}>
                <Input
                  label="Name"
                  value={med.name}
                  onChange={(e) =>
                    updateMedication(index, 'name', e.target.value)
                  }
                  placeholder="e.g. Morphine"
                />
                <Input
                  label="Dose"
                  value={med.dose}
                  onChange={(e) =>
                    updateMedication(index, 'dose', e.target.value)
                  }
                  placeholder="e.g. 10mg"
                />
                <Input
                  label="Route"
                  value={med.route}
                  onChange={(e) =>
                    updateMedication(index, 'route', e.target.value)
                  }
                  placeholder="e.g. Oral"
                />
                <Input
                  label="Frequency"
                  value={med.frequency}
                  onChange={(e) =>
                    updateMedication(index, 'frequency', e.target.value)
                  }
                  placeholder="e.g. Every 6h"
                />
              </Grid>

              <Input
                label="Indication"
                value={med.indication}
                onChange={(e) =>
                  updateMedication(index, 'indication', e.target.value)
                }
                placeholder="e.g. Pain"
              />
            </div>
          ))}
        </div>
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