import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAdmissionSchema,
  type CreateAdmissionFormData,
} from '@/schemas/admission.schema';
import { useRecordAdmission } from '@/hooks/useAdmissions';
import { usePatient } from '@/hooks/usePatients';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientVisits } from '@/hooks/useVisits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn, formatDate } from '@/lib/utils';

// ── Layout helper ─────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card padding="lg">
    <CardHeader>
      <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);
const toDateOnly = (value?: string | Date | null): string | undefined => {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
};
// ── Checkbox group ───────────────────────────────────────────────
const CheckboxGroup: React.FC<{
  options: { value: string; label: string }[];
  name: string;
  register: any;
  className?: string;
}> = ({ options, name, register, className }) => (
  <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', className)}>
    {options.map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
      >
        <input
          type="checkbox"
          value={option.value}
          {...register(name)}
          className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
        />
        {option.label}
      </label>
    ))}
  </div>
);

// ── Symptom enum (matches backend) ────────────────────────────────
const SYMPTOM_OPTIONS = [
  { value: 'Dyspnea', label: 'Dyspnea (Shortness of Breath)' },
  { value: 'Nausea', label: 'Nausea' },
  { value: 'Fatigue', label: 'Fatigue' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Depression', label: 'Depression' },
  { value: 'Insomnia', label: 'Insomnia' },
  { value: 'Other', label: 'Other' },
] as const;

const RecordAdmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data: refData } = usePatientReferrals(id!, { status: 'Accepted' });
  const { data: visitsData } = usePatientVisits(id!, { limit: 1 });
  const mutation = useRecordAdmission(id!);

  const latestVisit = visitsData?.items?.[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAdmissionFormData>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: {
      admissionDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced',
      estimatedPrognosis: 'Months',
      functionalStatus: 'PartiallyDependent',
      painScore: 5,
      painType: 'Mixed',
      emotionalStatus: 'Stable',
      familySupport: 'Moderate',
      spiritualConcerns: false,
      homeBasedCareRequired: false,
      physiotherapyRequired: false,
      admittedToHospiceUnit: true,
      symptomsPresent: [],
      secondaryDiagnoses: [],
      comorbidities: [],
    },
  });

  const spiritualConcerns = watch('spiritualConcerns');
  const symptomsPresent = watch('symptomsPresent') ?? [];

  // ── Auto-fill patient snapshot ──
  useEffect(() => {
    if (!patient) return;
    setValue('patientName', `${patient.firstName} ${patient.lastName}`);
    setValue('hospitalPatientId', patient.patientDisplayId ?? '');
    setValue('age', patient.age);
    setValue('sex', patient.sex);
    setValue('dateOfBirth', toDateOnly(patient.dateOfBirth));
    setValue('address', patient.address);
    setValue('phone', patient.phone);
    setValue('emergencyContactName', patient.emergencyContactName);
    setValue('emergencyContactPhone', patient.emergencyContactPhone);
  }, [patient, setValue]);

  // ── Auto-fill PPS/KPS from the latest home visit ──
  useEffect(() => {
    if (!latestVisit) return;
    setValue('ppsScore', latestVisit.ppsScore);
    setValue('kpsScore', latestVisit.kpsScore);
  }, [latestVisit, setValue]);

  const onSubmit = (data: CreateAdmissionFormData) => {
    // Strip empty optional fields
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === '' || v === undefined || v === null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      cleaned[k] = v;
    }

    mutation.mutate(cleaned as CreateAdmissionFormData, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (pLoading) return <PageLoader />;

  const acceptedReferrals = refData?.items ?? [];
  const hasPriorVisit = !!latestVisit;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            PATIENT ADMISSION FORM
          </h1>
          <p className="text-sm text-text-secondary">
            Yekatit 12 Hospital Medical College (Y12HMC)
          </p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} ·{' '}
              {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (errs) =>
          console.error('[Admission] validation failed:', errs),
        )}
        className="space-y-4"
        noValidate
      >
        {/* ═══════════════════════════════════════════════════════════
            Section 1: Patient Identification (display only — snapshot
            values are populated via setValue in useEffect above)
        ═══════════════════════════════════════════════════════════ */}
        <Section title="1. Patient Identification">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              value={
                patient ? `${patient.firstName} ${patient.lastName}` : '—'
              }
              disabled
            />
            <Input
              label="Hospital ID / MRN"
              value={patient?.patientDisplayId || '—'}
              disabled
            />
            <Input
              label="Age"
              value={patient?.age ? `${patient.age} years` : '—'}
              disabled
            />
            <Input label="Sex" value={patient?.sex || '—'} disabled />
            <Input
              label="Date of Birth"
              value={
                patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : '—'
              }
              disabled
            />
            <Input label="Phone" value={patient?.phone || '—'} disabled />
            <Input
              label="Address"
              value={patient?.address || '—'}
              disabled
              className="sm:col-span-2"
            />
            <Input
              label="Emergency Contact"
              value={patient?.emergencyContactName || '—'}
              disabled
            />
            <Input
              label="Emergency Phone"
              value={patient?.emergencyContactPhone || '—'}
              disabled
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 2: Referral Information
        ═══════════════════════════════════════════════════════════ */}
        <Section title="2. Referral Information">
          <Select
            label="Linked Referral *"
            options={acceptedReferrals.map((r) => ({
              value: r.id,
              label: `${r.referralType} · ${r.receivingFacility} · ${new Date(
                r.referralDate,
              ).toLocaleDateString()}`,
            }))}
            placeholder={
              acceptedReferrals.length === 0
                ? 'No accepted referrals — request one first'
                : 'Select accepted referral…'
            }
            error={errors.referralId?.message}
            disabled={acceptedReferrals.length === 0}
            {...register('referralId')}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Referred From"
              options={[
                { value: 'InternalWard', label: 'Internal Ward' },
                {
                  value: 'OutpatientDepartment',
                  label: 'Outpatient Department',
                },
                { value: 'ICU', label: 'ICU' },
                { value: 'ExternalHospital', label: 'External Hospital' },
                { value: 'Community', label: 'Community' },
                { value: 'Home', label: 'Home' },
                { value: 'Other', label: 'Other' },
              ]}
              placeholder="Select source…"
              error={errors.referredFrom?.message}
              {...register('referredFrom')}
            />
            <Input
              label="Referring Clinician"
              placeholder="Full name"
              error={errors.referringClinician?.message}
              {...register('referringClinician')}
            />
          </div>

          <Textarea
            label="Diagnosis at Referral"
            rows={2}
            error={errors.diagnosisAtReferral?.message}
            {...register('diagnosisAtReferral')}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Reason for Referral"
              options={[
                { value: 'PainManagement', label: 'Pain Management' },
                { value: 'EndOfLifeCare', label: 'End-of-Life Care' },
                { value: 'SymptomControl', label: 'Symptom Control' },
                { value: 'HomeBasedCare', label: 'Home-Based Care' },
                {
                  value: 'PsychosocialSupport',
                  label: 'Psychosocial Support',
                },
                { value: 'Other', label: 'Other' },
              ]}
              placeholder="Select reason…"
              error={errors.referralReason?.message}
              {...register('referralReason')}
            />
            <Input
              label="Reason (Other) — if applicable"
              placeholder="Specify…"
              error={errors.referralReasonOther?.message}
              {...register('referralReasonOther')}
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Admission Details
        ═══════════════════════════════════════════════════════════ */}
        <Section title="Admission Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Admission Date *"
              type="date"
              error={errors.admissionDate?.message}
              {...register('admissionDate')}
            />
            <Input
              label="Bed Number *"
              placeholder="e.g. PW-B-12"
              error={errors.bedNumber?.message}
              {...register('bedNumber')}
            />
            <Input
              label="Ward *"
              placeholder="e.g. Palliative Care Ward"
              error={errors.ward?.message}
              {...register('ward')}
            />
            <Input
              label="Admitting Physician *"
              placeholder="Full name"
              error={errors.admittingPhysician?.message}
              {...register('admittingPhysician')}
            />
            <Input
              label="Care Team *"
              placeholder="e.g. Palliative Team A"
              error={errors.careTeam?.message}
              {...register('careTeam')}
              className="sm:col-span-2"
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 3: Medical Diagnosis
        ═══════════════════════════════════════════════════════════ */}
        <Section title="3. Medical Diagnosis">
          <Input
            label="Primary Diagnosis *"
            error={errors.primaryDiagnosis?.message}
            {...register('primaryDiagnosis')}
          />

          <Textarea
            label="Secondary Diagnoses (one per line)"
            rows={3}
            placeholder={'e.g.\nCOPD\nHypertension'}
            onChange={(e) => {
              const vals = e.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);
              setValue('secondaryDiagnoses', vals);
            }}
            defaultValue={(watch('secondaryDiagnoses') ?? []).join('\n')}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Disease Stage *"
              options={[
                { value: 'Early', label: 'Early' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'Terminal', label: 'Terminal' },
              ]}
              error={errors.diseaseStage?.message}
              {...register('diseaseStage')}
            />
          </div>

          <Textarea
            label="Co-morbid Conditions (one per line)"
            rows={3}
            placeholder={'e.g.\nHypertension\nDiabetes'}
            onChange={(e) => {
              const vals = e.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);
              setValue('comorbidities', vals);
            }}
            defaultValue={(watch('comorbidities') ?? []).join('\n')}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 4: Palliative Care Eligibility
            PPS/KPS are inferred from the latest home visit.
        ═══════════════════════════════════════════════════════════ */}
        <Section title="4. Palliative Care Eligibility">
          {hasPriorVisit && (
            <div className="rounded-lg bg-primary/[0.04] border border-primary/20 px-4 py-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-primary">PPS</strong> and{' '}
                <strong className="text-primary">KPS</strong> scores are
                auto-filled from the latest home visit (
                {formatDate(latestVisit!.visitDate)}). They are read-only
                here — update them via a new home visit if needed.
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Estimated Prognosis *"
              options={[
                { value: 'Days', label: 'Days' },
                { value: 'Weeks', label: 'Weeks' },
                { value: 'Months', label: 'Months' },
                { value: 'Uncertain', label: 'Uncertain' },
              ]}
              error={errors.estimatedPrognosis?.message}
              {...register('estimatedPrognosis')}
            />
            <Input
              label="PPS Score (%) *"
              type="number"
              min={0}
              max={100}
              readOnly={hasPriorVisit}
              hint={
                hasPriorVisit
                  ? `From visit on ${formatDate(latestVisit!.visitDate)}`
                  : 'No prior home visit found'
              }
              error={errors.ppsScore?.message}
              {...register('ppsScore', { valueAsNumber: true })}
            />
            <Input
              label="KPS Score (/100)"
              type="number"
              min={0}
              max={100}
              readOnly={hasPriorVisit}
              hint={
                hasPriorVisit
                  ? `From visit on ${formatDate(latestVisit!.visitDate)}`
                  : 'No prior home visit found'
              }
              error={errors.kpsScore?.message}
              {...register('kpsScore', { valueAsNumber: true })}
            />
          </div>

          <Select
            label="Functional Status *"
            options={[
              { value: 'FullyIndependent', label: 'Fully Independent' },
              {
                value: 'PartiallyDependent',
                label: 'Partially Dependent',
              },
              { value: 'FullyDependent', label: 'Fully Dependent' },
            ]}
            error={errors.functionalStatus?.message}
            {...register('functionalStatus')}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 5: Pain & Symptom Assessment
        ═══════════════════════════════════════════════════════════ */}
        <Section title="5. Pain & Symptom Assessment (Initial)">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Pain Score (0–10) *"
              type="number"
              min={0}
              max={10}
              error={errors.painScore?.message}
              {...register('painScore', { valueAsNumber: true })}
            />
            <Select
              label="Pain Type *"
              options={[
                { value: 'Acute', label: 'Acute' },
                { value: 'Chronic', label: 'Chronic' },
                { value: 'Neuropathic', label: 'Neuropathic' },
                { value: 'Mixed', label: 'Mixed' },
              ]}
              error={errors.painType?.message}
              {...register('painType')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Symptoms Present
            </p>
            <CheckboxGroup
              options={SYMPTOM_OPTIONS as unknown as {
                value: string;
                label: string;
              }[]}
              name="symptomsPresent"
              register={register}
            />
          </div>

          {symptomsPresent.includes('Other') && (
            <Input
              label="Specify Other Symptom"
              placeholder="Describe…"
              error={errors.symptomsPresentOther?.message}
              {...register('symptomsPresentOther')}
            />
          )}
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 6: Psychosocial Assessment
        ═══════════════════════════════════════════════════════════ */}
        <Section title="6. Psychosocial Assessment">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Emotional Status *"
              options={[
                { value: 'Stable', label: 'Stable' },
                { value: 'Anxious', label: 'Anxious' },
                { value: 'Depressed', label: 'Depressed' },
                { value: 'Distressed', label: 'Distressed' },
              ]}
              error={errors.emotionalStatus?.message}
              {...register('emotionalStatus')}
            />
            <Select
              label="Family Support *"
              options={[
                { value: 'Strong', label: 'Strong' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Weak', label: 'Weak' },
                { value: 'None', label: 'None' },
              ]}
              error={errors.familySupport?.message}
              {...register('familySupport')}
            />
          </div>

          <Textarea
            label="Social Challenges"
            rows={2}
            placeholder="e.g. Limited financial resources, transportation issues"
            error={errors.socialChallenges?.message}
            {...register('socialChallenges')}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 7: Spiritual Care Needs
        ═══════════════════════════════════════════════════════════ */}
        <Section title="7. Spiritual Care Needs">
          <Checkbox
            label="Spiritual concerns identified"
            {...register('spiritualConcerns')}
          />

          {spiritualConcerns && (
            <>
              <Textarea
                label="If yes, describe spiritual needs"
                rows={2}
                error={errors.spiritualNeedsDescription?.message}
                {...register('spiritualNeedsDescription')}
              />
              <Select
                label="Preferred Spiritual Support"
                options={[
                  { value: 'ReligiousLeader', label: 'Religious Leader' },
                  { value: 'Counselor', label: 'Counselor' },
                  { value: 'Other', label: 'Other' },
                ]}
                placeholder="Select…"
                error={errors.spiritualSupportPreferred?.message}
                {...register('spiritualSupportPreferred')}
              />
            </>
          )}
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Section 8: Initial Care Plan
        ═══════════════════════════════════════════════════════════ */}
        <Section title="8. Initial Care Plan">
          <Textarea
            label="Pain Management Plan *"
            rows={2}
            placeholder="e.g. Fentanyl patch 25mcg/h every 72h; PRN morphine 2.5mg SC"
            error={errors.painManagementPlan?.message}
            {...register('painManagementPlan')}
          />
          <Textarea
            label="Medication Plan *"
            rows={2}
            error={errors.medicationPlan?.message}
            {...register('medicationPlan')}
          />
          <Textarea
            label="Nursing Care Plan *"
            rows={2}
            error={errors.nursingCarePlan?.message}
            {...register('nursingCarePlan')}
          />
          <Textarea
            label="Psychosocial Support Plan"
            rows={2}
            error={errors.psychosocialSupportPlan?.message}
            {...register('psychosocialSupportPlan')}
          />

          <div className="flex flex-wrap gap-6 pt-2">
            <Checkbox
              label="Home-Based Care Required"
              {...register('homeBasedCareRequired')}
            />
            <Checkbox
              label="Physiotherapy Required"
              {...register('physiotherapyRequired')}
            />
            <Checkbox
              label="Admitted to Hospice Unit"
              {...register('admittedToHospiceUnit')}
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════
            Submit
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex gap-3 justify-end pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/patients/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? 'Recording…' : 'Record Admission'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordAdmissionPage;