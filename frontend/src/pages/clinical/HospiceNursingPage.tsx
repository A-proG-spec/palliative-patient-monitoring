import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Plus, ChevronRight, ClipboardList } from 'lucide-react';

import { usePatient } from '@/hooks/usePatients';
import { useAuthStore } from '@/store/auth.store';
import {
  usePatientHospiceAssessments,
  useCreateHospiceAssessment,
} from '@/hooks/useHospiceNursing';
import {
  createHospiceNursingAssessmentSchema,
  type CreateHospiceNursingFormData,
} from '@/schemas/hospice-nursing.schema';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { patientPath } from '@/lib/clinicalPaths';

// ═════════════════════════════════════════════════════════════
// Layout primitives
// ═════════════════════════════════════════════════════════════

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

const RadioGroup: React.FC<{
  label: string;
  name: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-medium text-on-surface">{label}</p>
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-3.5 w-3.5 text-primary"
          />
          {o.label}
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup: React.FC<{
  label: string;
  values: string[];
  options: string[];
  labels?: Record<string, string>;
  onChange: (v: string[]) => void;
}> = ({ label, values, options, labels, onChange }) => {
  const toggle = (v: string) =>
    onChange(
      values.includes(v) ? values.filter((x) => x !== v) : [...values, v],
    );

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-on-surface">{label}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <label
            key={o}
            className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
          >
            <input
              type="checkbox"
              checked={values.includes(o)}
              onChange={() => toggle(o)}
              className="h-3.5 w-3.5 rounded text-primary"
            />
            {labels?.[o] ?? o}
          </label>
        ))}
      </div>
    </div>
  );
};

// ── Display helper ─────────────────────────────────────────────
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

// ═════════════════════════════════════════════════════════════
// Enum label maps
// ═════════════════════════════════════════════════════════════

const ORIENTATION_OPTIONS = [
  'OrientedToPerson',
  'OrientedToPlace',
  'OrientedToTime',
  'Disoriented',
] as const;

const ORIENTATION_LABELS: Record<string, string> = {
  OrientedToPerson: 'Oriented to Person',
  OrientedToPlace: 'Oriented to Place',
  OrientedToTime: 'Oriented to Time',
  Disoriented: 'Disoriented',
};

const GENERAL_APPEARANCE_OPTIONS = [
  'Comfortable',
  'MildDistress',
  'ModerateDistress',
  'SevereDistress',
  'Cachectic',
  'Bedridden',
  'WellGroomed',
  'PoorHygiene',
] as const;

const GENERAL_APPEARANCE_LABELS: Record<string, string> = {
  Comfortable: 'Comfortable',
  MildDistress: 'Mild Distress',
  ModerateDistress: 'Moderate Distress',
  SevereDistress: 'Severe Distress',
  Cachectic: 'Cachectic',
  Bedridden: 'Bedridden',
  WellGroomed: 'Well Groomed',
  PoorHygiene: 'Poor Hygiene',
};

const NURSING_DIAGNOSIS_OPTIONS = [
  'AcutePain',
  'ChronicPain',
  'ImpairedMobility',
  'RiskForFalls',
  'ImpairedSkinIntegrity',
  'ImbalancedNutrition',
  'Anxiety',
  'CaregiverStrain',
  'IneffectiveBreathingPattern',
  'Other',
] as const;

const NURSING_DIAGNOSIS_LABELS: Record<string, string> = {
  AcutePain: 'Acute Pain',
  ChronicPain: 'Chronic Pain',
  ImpairedMobility: 'Impaired Mobility',
  RiskForFalls: 'Risk for Falls',
  ImpairedSkinIntegrity: 'Impaired Skin Integrity',
  ImbalancedNutrition: 'Imbalanced Nutrition',
  Anxiety: 'Anxiety',
  CaregiverStrain: 'Caregiver Strain',
  IneffectiveBreathingPattern: 'Ineffective Breathing Pattern',
  Other: 'Other',
};

// ═════════════════════════════════════════════════════════════
// Main page
// ═════════════════════════════════════════════════════════════

const HospiceNursingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'list' | 'new'>('list');

  // ── Auth ──
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';
  const basePath = patientPath(isAdmin, id!);

  // ── Data ──
  const { data: patient, isLoading: patientLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientHospiceAssessments(id!);
  const createMutation = useCreateHospiceAssessment(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateHospiceNursingFormData>({
    resolver: zodResolver(createHospiceNursingAssessmentSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().split('T')[0],
      // assessedByStaffId is only meaningful for staff users.
      // Admins attribute via createdByAdminId on the backend.
      assessedByStaffId: !isAdmin && user?.id ? String(user.id) : undefined,
      orientation: [],
      generalAppearance: [],
      painLocation: [],
      painCharacteristics: [],
      painReliefMeasures: [],
      assistiveDevices: [],
      nursingDiagnoses: [],
    },
  });

  // Sync assessedByStaffId only when a staff user logs in
  useEffect(() => {
    if (isAdmin) return;
    if (user?.id) {
      setValue('assessedByStaffId', String(user.id), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [user?.id, isAdmin, setValue]);

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const onSubmit = (formData: CreateHospiceNursingFormData) => {
    // Strip empty strings / undefined / null / empty arrays
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(formData)) {
      if (v === '' || v === undefined || v === null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      cleaned[k] = v;
    }

    // Admins never send assessedByStaffId — backend uses createdByAdminId
    if (isAdmin) {
      delete cleaned.assessedByStaffId;
    }

    createMutation.mutate(cleaned as any, {
      onSuccess: () => {
        reset({
          assessmentDate: new Date().toISOString().split('T')[0],
          assessedByStaffId:
            !isAdmin && user?.id ? String(user.id) : undefined,
          orientation: [],
          generalAppearance: [],
          painLocation: [],
          painCharacteristics: [],
          painReliefMeasures: [],
          assistiveDevices: [],
          nursingDiagnoses: [],
        });
        setMode('list');
        refetch();
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ??
          'Failed to save hospice nursing assessment.';
        toast.error(message);
      },
    });
  };

  // ── Minimal, clean invalid handler ──
  const onInvalid = () => {
    toast.error('Please fix the highlighted fields before saving.');
  };

  if (patientLoading || isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const assessments = data?.items ?? [];

  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to={basePath} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Hospice Nursing Assessments
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              {patient.firstName} {patient.lastName} · {displayId(patient)}
            </p>
          </div>
        </div>
        {mode === 'list' && (
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setMode('new')}
          >
            New Assessment
          </Button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* List view                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      {mode === 'list' && (
        <Card padding="none">
          {assessments.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} />}
              title="No hospice nursing assessments"
              description="Record the first assessment for this patient."
              actionLabel="New Assessment"
              onAction={() => setMode('new')}
            />
          ) : (
            <div className="divide-y divide-border-base">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-low transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`${basePath}/hospice-nursing/${a.id}`)
                  }
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <ClipboardList size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">
                      {formatDate(a.assessmentDate)}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Assessed by {a.assessedBy?.name ?? '—'}
                    </p>
                  </div>
                  {a.painScore !== undefined && a.painScore !== null && (
                    <Badge variant={a.painScore >= 7 ? 'error' : 'warning'}>
                      Pain {a.painScore}/10
                    </Badge>
                  )}
                  <ChevronRight size={16} className="text-outline-variant" />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* New assessment form                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      {mode === 'new' && (
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
          noValidate
        >
          {/* ── General Observation ── */}
          <Section title="General Observation">
            <Input
              label="Assessment Date"
              type="date"
              error={errors.assessmentDate?.message}
              {...register('assessmentDate')}
            />
            <Select
              label="Level of Consciousness"
              options={[
                { value: '', label: 'Select…' },
                { value: 'Alert', label: 'Alert' },
                { value: 'Drowsy', label: 'Drowsy' },
                { value: 'Confused', label: 'Confused' },
                { value: 'Unresponsive', label: 'Unresponsive' },
                { value: 'Comatose', label: 'Comatose' },
              ]}
              {...register('levelOfConsciousness')}
            />
            <CheckboxGroup
              label="Orientation"
              values={watch('orientation') ?? []}
              options={[...ORIENTATION_OPTIONS]}
              labels={ORIENTATION_LABELS}
              onChange={(v) =>
                setValue('orientation', v, { shouldDirty: true })
              }
            />
            <CheckboxGroup
              label="General Appearance"
              values={watch('generalAppearance') ?? []}
              options={[...GENERAL_APPEARANCE_OPTIONS]}
              labels={GENERAL_APPEARANCE_LABELS}
              onChange={(v) =>
                setValue('generalAppearance', v, { shouldDirty: true })
              }
            />
          </Section>

          {/* ── Vital Signs ── */}
          <Section title="Vital Signs">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Blood Pressure"
                placeholder="120/80"
                {...register('bloodPressure')}
              />
              <Input
                label="Pulse Rate (bpm)"
                type="number"
                {...register('pulseRate', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
              <Input
                label="Respiratory Rate (/min)"
                type="number"
                {...register('respiratoryRate', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
              <Input
                label="Temperature (°C)"
                type="number"
                step="0.1"
                {...register('temperature', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
              <Input
                label="SpO₂ (%)"
                type="number"
                {...register('oxygenSaturation', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                {...register('weightKg', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
              <Input
                label="Height (cm)"
                type="number"
                step="0.1"
                {...register('heightCm', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined
                      ? undefined
                      : Number(v),
                })}
              />
            </div>
          </Section>

          {/* ── Pain Assessment ── */}
          <Section title="Pain Assessment">
            <RadioGroup
              label="Pain Present"
              name="painPresent"
              value={
                watch('painPresent') === true
                  ? 'true'
                  : watch('painPresent') === false
                    ? 'false'
                    : undefined
              }
              options={[
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              onChange={(v) => {
                const present = v === 'true';
                setValue('painPresent', present, { shouldDirty: true });
                if (!present) {
                  setValue('painScore', undefined, { shouldDirty: true });
                  setValue('painLocation', [], { shouldDirty: true });
                  setValue('painCharacteristics', [], { shouldDirty: true });
                  setValue('painLocationOther', '', { shouldDirty: true });
                }
              }}
            />
            {watch('painPresent') && (
              <>
                <Input
                  label="Pain Score (0–10)"
                  type="number"
                  min={0}
                  max={10}
                  {...register('painScore', {
                    setValueAs: (v) =>
                      v === '' || v === null || v === undefined
                        ? undefined
                        : Number(v),
                  })}
                />
                <CheckboxGroup
                  label="Location"
                  values={watch('painLocation') ?? []}
                  options={[
                    'Head',
                    'Neck',
                    'Chest',
                    'Abdomen',
                    'Back',
                    'Limbs',
                    'Generalized',
                    'Other',
                  ]}
                  onChange={(v) =>
                    setValue('painLocation', v, { shouldDirty: true })
                  }
                />
                <Input
                  label="Other Location"
                  placeholder="Specify…"
                  {...register('painLocationOther')}
                />
                <CheckboxGroup
                  label="Characteristics"
                  values={watch('painCharacteristics') ?? []}
                  options={[
                    'Sharp',
                    'Dull',
                    'Burning',
                    'Cramping',
                    'Intermittent',
                    'Continuous',
                  ]}
                  onChange={(v) =>
                    setValue('painCharacteristics', v, { shouldDirty: true })
                  }
                />
              </>
            )}
          </Section>

          {/* ── Respiratory ── */}
          <Section title="Respiratory">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Breathing Pattern"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Labored', label: 'Labored' },
                  { value: 'Shallow', label: 'Shallow' },
                  { value: 'Rapid', label: 'Rapid' },
                  { value: 'Slow', label: 'Slow' },
                ]}
                {...register('breathingPattern')}
              />
              <Select
                label="Dyspnea"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'None', label: 'None' },
                  { value: 'Mild', label: 'Mild' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Severe', label: 'Severe' },
                ]}
                {...register('dyspneaSeverity')}
              />
              <Select
                label="Cough"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'None', label: 'None' },
                  { value: 'Dry', label: 'Dry' },
                  { value: 'Productive', label: 'Productive' },
                ]}
                {...register('cough')}
              />
              <Select
                label="Sputum Color"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'None', label: 'None' },
                  { value: 'Clear', label: 'Clear' },
                  { value: 'Yellow', label: 'Yellow' },
                  { value: 'Green', label: 'Green' },
                  { value: 'Bloody', label: 'Bloody' },
                ]}
                {...register('sputumColor')}
              />
            </div>
            <Textarea
              label="Respiratory Notes"
              rows={2}
              {...register('respiratoryNotes')}
            />
          </Section>

          {/* ── Cardiovascular ── */}
          <Section title="Cardiovascular">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Pulse Rhythm"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Regular', label: 'Regular' },
                  { value: 'Irregular', label: 'Irregular' },
                ]}
                {...register('pulseRhythm')}
              />
              <Select
                label="Peripheral Edema"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'None', label: 'None' },
                  { value: 'Mild', label: 'Mild' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Severe', label: 'Severe' },
                ]}
                {...register('peripheralEdema')}
              />
              <Input label="Edema Location" {...register('edemaLocation')} />
              <Select
                label="Skin Color"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Pale', label: 'Pale' },
                  { value: 'Cyanotic', label: 'Cyanotic' },
                  { value: 'Jaundiced', label: 'Jaundiced' },
                ]}
                {...register('skinColor')}
              />
            </div>
          </Section>

          {/* ── Gastrointestinal ── */}
          <Section title="Gastrointestinal">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Appetite"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Fair', label: 'Fair' },
                  { value: 'Poor', label: 'Poor' },
                  { value: 'UnableToEat', label: 'Unable to Eat' },
                ]}
                {...register('appetite')}
              />
              <Select
                label="Nausea"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'None', label: 'None' },
                  { value: 'Mild', label: 'Mild' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Severe', label: 'Severe' },
                ]}
                {...register('nausea')}
              />
              <Select
                label="Bowel Function"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Constipation', label: 'Constipation' },
                  { value: 'Diarrhea', label: 'Diarrhea' },
                  { value: 'Incontinence', label: 'Incontinence' },
                ]}
                {...register('bowelFunction')}
              />
              <Input
                label="Last Bowel Movement"
                type="date"
                {...register('lastBowelMovement')}
              />
            </div>
          </Section>

          {/* ── Genitourinary ── */}
          <Section title="Genitourinary">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Urinary Function"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Frequency', label: 'Frequency' },
                  { value: 'Retention', label: 'Retention' },
                  { value: 'Incontinence', label: 'Incontinence' },
                  { value: 'Catheterized', label: 'Catheterized' },
                ]}
                {...register('urinaryFunction')}
              />
              <Select
                label="Urine Appearance"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Clear', label: 'Clear' },
                  { value: 'Cloudy', label: 'Cloudy' },
                  { value: 'Bloody', label: 'Bloody' },
                  { value: 'Dark', label: 'Dark' },
                ]}
                {...register('urineAppearance')}
              />
            </div>
          </Section>

          {/* ── Skin ── */}
          <Section title="Skin">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Skin Integrity"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Intact', label: 'Intact' },
                  { value: 'Dry', label: 'Dry' },
                  { value: 'Fragile', label: 'Fragile' },
                  { value: 'WoundPresent', label: 'Wound Present' },
                  { value: 'PressureUlcer', label: 'Pressure Ulcer' },
                ]}
                {...register('skinIntegrity')}
              />
              <Select
                label="Pressure Injury Risk"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'High', label: 'High' },
                ]}
                {...register('pressureInjuryRisk')}
              />
            </div>
            <RadioGroup
              label="Pressure Ulcer Present"
              name="pressureUlcerPresent"
              value={
                watch('pressureUlcerPresent') === true
                  ? 'true'
                  : watch('pressureUlcerPresent') === false
                    ? 'false'
                    : undefined
              }
              options={[
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              onChange={(v) => {
                const present = v === 'true';
                setValue('pressureUlcerPresent', present, {
                  shouldDirty: true,
                });
                if (!present) {
                  setValue('pressureUlcerLocation', '', {
                    shouldDirty: true,
                  });
                  setValue('pressureUlcerStage', undefined, {
                    shouldDirty: true,
                  });
                }
              }}
            />
            {watch('pressureUlcerPresent') && (
              <>
                <Input
                  label="Ulcer Location"
                  {...register('pressureUlcerLocation')}
                />
                <Select
                  label="Stage"
                  options={[
                    { value: '', label: 'Select…' },
                    { value: 'I', label: 'Stage I' },
                    { value: 'II', label: 'Stage II' },
                    { value: 'III', label: 'Stage III' },
                    { value: 'IV', label: 'Stage IV' },
                  ]}
                  {...register('pressureUlcerStage')}
                />
              </>
            )}
          </Section>

          {/* ── Mobility & ADL ── */}
          <Section title="Mobility & Activities of Daily Living">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Mobility Status"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Independent', label: 'Independent' },
                  { value: 'RequiresAssistance', label: 'Requires Assistance' },
                  {
                    value: 'WheelchairDependent',
                    label: 'Wheelchair Dependent',
                  },
                  { value: 'Bedridden', label: 'Bedridden' },
                ]}
                {...register('mobilityStatus')}
              />
              <Select
                label="Fall Risk"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'High', label: 'High' },
                ]}
                {...register('fallRisk')}
              />
            </div>
            <div className="grid sm:grid-cols-5 gap-3">
              {(
                ['feeding', 'bathing', 'dressing', 'toileting', 'mobility'] as const
              ).map((k) => (
                <Select
                  key={k}
                  label={k.charAt(0).toUpperCase() + k.slice(1)}
                  options={[
                    { value: '', label: 'Select…' },
                    { value: 'Independent', label: 'Independent' },
                    { value: 'NeedAssistance', label: 'Needs Help' },
                    { value: 'Dependent', label: 'Dependent' },
                  ]}
                  {...register(k)}
                />
              ))}
            </div>
          </Section>

          {/* ── Psychological ── */}
          <Section title="Psychological">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Emotional Status"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Stable', label: 'Stable' },
                  { value: 'Anxious', label: 'Anxious' },
                  { value: 'Depressed', label: 'Depressed' },
                  { value: 'Fearful', label: 'Fearful' },
                  { value: 'Agitated', label: 'Agitated' },
                  { value: 'Grieving', label: 'Grieving' },
                ]}
                {...register('emotionalStatus')}
              />
              <Select
                label="Communication"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Impaired', label: 'Impaired' },
                  { value: 'NonVerbal', label: 'Non-Verbal' },
                ]}
                {...register('communicationAbility')}
              />
              <Select
                label="Cognitive Status"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Intact', label: 'Intact' },
                  { value: 'MildImpairment', label: 'Mild Impairment' },
                  { value: 'SevereImpairment', label: 'Severe Impairment' },
                ]}
                {...register('cognitiveStatus')}
              />
            </div>
          </Section>

          {/* ── Family & Caregiver ── */}
          <Section title="Family & Caregiver">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Caregiver Name"
                {...register('primaryCaregiverName')}
              />
              <Input
                label="Relationship"
                {...register('primaryCaregiverRelationship')}
              />
              <Input
                label="Caregiver Phone"
                {...register('primaryCaregiverPhone')}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Family Support"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Strong', label: 'Strong' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Limited', label: 'Limited' },
                  { value: 'None', label: 'None' },
                ]}
                {...register('familySupport')}
              />
              <Select
                label="Caregiver Stress Level"
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'High', label: 'High' },
                ]}
                {...register('caregiverStressLevel')}
              />
            </div>
          </Section>

          {/* ── Spiritual / Cultural ── */}
          <Section title="Spiritual / Cultural">
            <RadioGroup
              label="Spiritual Support Requested"
              name="spiritualSupportRequested"
              value={
                watch('spiritualSupportRequested') === true
                  ? 'true'
                  : watch('spiritualSupportRequested') === false
                    ? 'false'
                    : undefined
              }
              options={[
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              onChange={(v) =>
                setValue('spiritualSupportRequested', v === 'true', {
                  shouldDirty: true,
                })
              }
            />
            <Select
              label="Religious Affiliation"
              options={[
                { value: '', label: 'Select…' },
                { value: 'Orthodox', label: 'Orthodox' },
                { value: 'Muslim', label: 'Muslim' },
                { value: 'Protestant', label: 'Protestant' },
                { value: 'Catholic', label: 'Catholic' },
                { value: 'Other', label: 'Other' },
              ]}
              {...register('religiousAffiliation')}
            />
            <Input
              label="Other Affiliation"
              {...register('religiousAffiliationOther')}
            />
            <Textarea
              label="Cultural Considerations"
              rows={2}
              {...register('culturalConsiderations')}
            />
          </Section>

          {/* ── Nursing Diagnoses & Summary ── */}
          <Section title="Nursing Diagnoses & Summary">
            <CheckboxGroup
              label="Nursing Diagnoses"
              values={watch('nursingDiagnoses') ?? []}
              options={[...NURSING_DIAGNOSIS_OPTIONS]}
              labels={NURSING_DIAGNOSIS_LABELS}
              onChange={(v) =>
                setValue('nursingDiagnoses', v, { shouldDirty: true })
              }
            />
            {watch('nursingDiagnoses')?.includes('Other') && (
              <Input
                label="Other Diagnosis"
                {...register('nursingDiagnosesOther')}
              />
            )}
            <Textarea
              label="Nurse's Summary"
              rows={4}
              {...register('nurseSummary')}
            />
          </Section>

          {/* ── Actions ── */}
          <div className="flex gap-3 justify-end pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setMode('list');
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Save Assessment'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HospiceNursingPage;