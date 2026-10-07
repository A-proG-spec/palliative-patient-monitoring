import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createReferralSchema,
  type CreateReferralFormData,
} from '@/schemas/referral.schema';
import { useRequestReferral } from '@/hooks/useReferrals';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn, formatDate } from '@/lib/utils';
import { REFERRAL_REASON_LABELS, DISEASE_STAGE_LABELS } from '@/constants';

// ── Form Section ──────────────────────────────────────────────────
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
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

// ── Checkbox group ───────────────────────────────────────────────
const CheckboxGroup: React.FC<{
  options: string[];
  labels: Record<string, string>;
  name: string;
  register: any;
  className?: string;
}> = ({ options, labels, name, register, className }) => (
  <div className={cn('grid grid-cols-2 gap-2', className)}>
    {options.map((value) => (
      <label
        key={value}
        className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
      >
        <input
          type="checkbox"
          value={value}
          {...register(name)}
          className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
        />
        {labels[value] || value}
      </label>
    ))}
  </div>
);

// ── Display helpers ─────────────────────────────────────────────
function getPatientDisplayId(patient: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string {
  return (
    patient.hospitalPatientId ??
    `PAT-${String(patient.id).padStart(4, '0')}`
  );
}

// ── Symptom options (strings, not numbers) ──────────────────────
const SYMPTOM_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: String(i),
  label: String(i),
}));

const RequestReferralPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, isSuccess } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!, { limit: 1 });
  const latestVisit = visitsData?.items?.[0];
  const mutation = useRequestReferral(id!);
  const user = useAuthStore((s) => s.user);

  const latestPPS = latestVisit?.ppsScore ?? 0;
  const latestKPS = latestVisit?.kpsScore ?? 0;

  const patientPath = `/patients/${id}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateReferralFormData>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      referralType: 'Outgoing',
      referralDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced',
      ppsScore: latestPPS,
      kpsScore: latestKPS,
      currentSymptoms: {
        pain: 0,
        dyspnea: 0,
        fatigue: 0,
        anxiety: 0,
        depression: 0,
      },
      reasons: [],
      referringFacility: 'Y12HMC Home Care Unit',
      receivingFacility: '',
      contactPerson: '',
      contactNumber: '',
      otherReason: '',
    },
  });

  // ═══════════════════════════════════════════════════════════════
  // AUTO-FILL — patient snapshot + latest PPS/KPS
  //
  // Split into TWO effects:
  //   1. Patient snapshot — runs once when the patient loads
  //   2. Visit scores    — runs whenever the latest visit changes
  //
  // Combining them into one effect with a single `hasHydrated`
  // guard meant the visit scores were skipped if the visit query
  // resolved *after* the patient query.
  // ═══════════════════════════════════════════════════════════════
  const patientHydrated = useRef(false);

  useEffect(() => {
    if (!isSuccess || !patient || patientHydrated.current) return;
    patientHydrated.current = true;
    // Patient snapshot is rendered directly from `patient` — no
    // setValue needed for fields the backend doesn't accept.
  }, [isSuccess, patient]);

  const visitsHydrated = useRef(false);

  useEffect(() => {
    if (!latestVisit || visitsHydrated.current) return;
    visitsHydrated.current = true;

    setValue('ppsScore', latestPPS, { shouldDirty: false, shouldValidate: false });
    setValue('kpsScore', latestKPS, { shouldDirty: false, shouldValidate: false });
  }, [latestVisit, latestPPS, latestKPS, setValue]);

  const onSubmit = (data: CreateReferralFormData) => {
    // ── Coerce every numeric field to Number ──
    // Defends against selects that emit string values even when
    // `valueAsNumber` is set.
    const safePayload: CreateReferralFormData = {
      ...data,
      ppsScore: Number(data.ppsScore),
      kpsScore: Number(data.kpsScore),
      currentSymptoms: {
        pain:       Number(data.currentSymptoms?.pain       ?? 0),
        dyspnea:    Number(data.currentSymptoms?.dyspnea    ?? 0),
        fatigue:    Number(data.currentSymptoms?.fatigue    ?? 0),
        anxiety:    Number(data.currentSymptoms?.anxiety    ?? 0),
        depression: Number(data.currentSymptoms?.depression ?? 0),
      },
    };

    mutation.mutate(safePayload, {
      onSuccess: () => navigate(patientPath),
    });
  };

  if (pLoading) return <PageLoader />;

  const isSubmitting = mutation.isPending;

  const displayId = patient
    ? getPatientDisplayId({
        id: patient.id,
        hospitalPatientId: patient.hospitalPatientId,
      })
    : '—';
  const hospitalId = patient?.hospitalPatientId ?? null;

  // Live reads for the referral-date field so the picker stays in sync
  const referralDate = watch('referralDate');

  return (
    <div className="max-w-3xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <BackButton to={patientPath} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            PALLIATIVE PATIENT REFERRAL FORM
          </h1>
          <p className="text-sm text-text-secondary">
            Yekatit 12 Hospital Medical College (Y12HMC)
          </p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {displayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* ── Referral Information ── */}
        <FormSection title="Referral Information">
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Referral Type
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="Incoming"
                  {...register('referralType')}
                  className="h-4 w-4 text-primary"
                />
                Incoming Referral
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="Outgoing"
                  {...register('referralType')}
                  className="h-4 w-4 text-primary"
                />
                Outgoing Referral
              </label>
            </div>
          </div>

          <Input
            label="Referral Date"
            type="date"
            error={errors.referralDate?.message}
            {...register('referralDate')}
          />
        </FormSection>

        {/* ── Patient Information (auto-filled, read-only) ── */}
        <FormSection title="Patient Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={
                patient ? `${patient.firstName} ${patient.lastName}` : '—'
              }
              disabled
              readOnly
            />

            <Input
              label="Patient ID"
              value={displayId}
              disabled
              readOnly
              hint={!hospitalId ? 'System-generated ID' : undefined}
            />

            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Sex</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={patient?.sex === 'Male'}
                    disabled
                    readOnly
                    className="h-4 w-4"
                  />
                  Male
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={patient?.sex === 'Female'}
                    disabled
                    readOnly
                    className="h-4 w-4"
                  />
                  Female
                </label>
              </div>
            </div>

            <Input
              label="Age"
              value={patient?.age ? `${patient.age} years` : '—'}
              disabled
              readOnly
            />

            <div className="sm:col-span-2 space-y-1">
              <Input
                label="Medical Record No."
                value={hospitalId ?? displayId}
                disabled
                readOnly
              />
              <div className="flex items-center gap-1.5 pl-1">
                <Badge
                  variant={hospitalId ? 'primary' : 'secondary'}
                  className="text-[10px] px-1.5 py-0.5 leading-none"
                >
                  {hospitalId ? 'Hospital MRN' : 'System ID'}
                </Badge>
                {!hospitalId && (
                  <span className="text-[11px] text-text-muted">
                    No hospital MRN on file — using system ID
                  </span>
                )}
                {patient?.currentLocation === 'ReferredHospital' && (
                  <Badge
                    variant="warning"
                    className="text-[10px] px-1.5 py-0.5 leading-none"
                  >
                    Hospitalised
                  </Badge>
                )}
              </div>
            </div>

            <Input
              label="Ward / Clinic"
              value={
                patient?.currentLocation === 'ReferredHospital'
                  ? 'Palliative Care Ward'
                  : 'Home Care Unit'
              }
              disabled
              readOnly
              hint={
                patient?.currentLocation === 'ReferredHospital'
                  ? 'Patient is in the hospital'
                  : 'Patient is at home'
              }
            />

            <Input
              label="Contact No."
              value={patient?.phone || '—'}
              disabled
              readOnly
            />

            <Input
              label="Address"
              value={patient?.address || '—'}
              disabled
              readOnly
              className="sm:col-span-2"
            />

            <Input
              label="Caregiver Name"
              value={patient?.caregiverName || '—'}
              disabled
              readOnly
            />

            <Input
              label="Caregiver Phone"
              value={patient?.caregiverPhone || '—'}
              disabled
              readOnly
            />

            {patient?.caregiverRelation && (
              <Input
                label="Caregiver Relationship"
                value={patient.caregiverRelation}
                disabled
                readOnly
                className="sm:col-span-2"
              />
            )}
          </div>
        </FormSection>

        {/* ── Clinical Information ── */}
        <FormSection title="Clinical Information">
          <Input
            label="Primary Diagnosis"
            placeholder="e.g., Stage IV Breast Cancer"
            error={errors.primaryDiagnosis?.message}
            {...register('primaryDiagnosis')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Disease Stage
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['Early', 'Advanced', 'EndStage'] as const).map((stage) => (
                <label
                  key={stage}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    value={stage}
                    {...register('diseaseStage')}
                    className="h-4 w-4 text-primary"
                  />
                  {DISEASE_STAGE_LABELS[stage] || stage}
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="PPS Score (%)"
              type="number"
              min={0}
              max={100}
              readOnly={!!latestVisit}
              hint={
                latestVisit
                  ? `From last visit: ${formatDate(latestVisit.visitDate)}`
                  : 'No previous visit found'
              }
              error={errors.ppsScore?.message}
              {...register('ppsScore', { valueAsNumber: true })}
            />
            <Input
              label="KPS Score (/100)"
              type="number"
              min={0}
              max={100}
              readOnly={!!latestVisit}
              hint={
                latestVisit
                  ? `From last visit: ${formatDate(latestVisit.visitDate)}`
                  : 'No previous visit found'
              }
              error={errors.kpsScore?.message}
              {...register('kpsScore', { valueAsNumber: true })}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Current Symptoms (Score 0–10)
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {(
                ['pain', 'dyspnea', 'fatigue', 'anxiety', 'depression'] as const
              ).map((symptom) => (
                <Select
                  key={symptom}
                  label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                  options={SYMPTOM_OPTIONS}
                  error={(errors.currentSymptoms as any)?.[symptom]?.message}
                  {...register(`currentSymptoms.${symptom}`, {
                    valueAsNumber: true,
                  })}
                />
              ))}
            </div>
          </div>
        </FormSection>

        {/* ── Reason for Referral ── */}
        <FormSection title="Reason for Referral">
          <p className="text-sm text-text-muted">Check all applicable:</p>
          <CheckboxGroup
            options={Object.keys(REFERRAL_REASON_LABELS)}
            labels={REFERRAL_REASON_LABELS}
            name="reasons"
            register={register}
          />
          {errors.reasons && (
            <p className="text-xs text-error mt-1">
              {Array.isArray(errors.reasons)
                ? errors.reasons[0]?.message
                : (errors.reasons as any)?.message}
            </p>
          )}
          <div className="mt-2">
            <Input
              label="Other (please specify)"
              placeholder="Specify other reason..."
              error={errors.otherReason?.message}
              {...register('otherReason')}
            />
          </div>
        </FormSection>

        {/* ── Referral Details ── */}
        <FormSection title="Referral Details">
          <Input
            label="Referring Facility/Service"
            placeholder="e.g., Y12HMC Home Care Unit"
            error={errors.referringFacility?.message}
            {...register('referringFacility')}
          />
          <Input
            label="Receiving Facility/Service"
            placeholder="e.g., Yekatit 12 Hospital Medical College"
            error={errors.receivingFacility?.message}
            {...register('receivingFacility')}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              placeholder="Contact person name"
              error={errors.contactPerson?.message}
              {...register('contactPerson')}
            />
            <Input
              label="Contact Number"
              placeholder="+251 XXX XXX XXX"
              error={errors.contactNumber?.message}
              {...register('contactNumber')}
            />
          </div>
        </FormSection>

        {/* ── Submit ── */}
        <div className="flex gap-3 justify-end pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(patientPath)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Referral'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestReferralPage;