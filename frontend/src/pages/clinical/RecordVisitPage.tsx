import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  ChevronDown,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { createVisitSchema, type CreateVisitFormData } from '@/schemas/visit.schema';
import { useRecordVisit } from '@/hooks/useVisits';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import {
  PAIN_LOCATION_LABELS,
  SYMPTOM_LABELS,
  EDUCATION_LABELS,
  RED_FLAG_LABELS,
} from '@/constants';
import { SignatureSection } from '@/components/visits/SignatureSection';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/context/ToastContext';
import { usePermissionAccess } from '@/hooks/useRecordAccess';

// ── Collapsible section wrapper ─────────────────────────────────
const Section: React.FC<{
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, defaultOpen = true, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card padding="none">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-low transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">{title}</span>
          {badge && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'text-text-muted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </Card>
  );
};

// ── Checkbox group component ────────────────────────────────────
const CheckboxGroup: React.FC<{
  options: readonly string[];
  labels: Record<string, string>;
  name: string;
  register: any;
}> = ({ options, labels, name, register }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

// ── True/False/N-A radio group ──────────────────────────────────
const BooleanRadio: React.FC<{
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
  allowNull?: boolean;
  nullLabel?: string;
}> = ({ label, value, onChange, allowNull = false, nullLabel = 'N/A' }) => (
  <div>
    <p className="text-sm font-medium text-on-surface mb-2">{label}</p>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
          className="h-4 w-4 text-primary"
        />
        Yes
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
          className="h-4 w-4 text-primary"
        />
        No
      </label>
      {allowNull && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            checked={value === null}
            onChange={() => onChange(null)}
            className="h-4 w-4 text-primary"
          />
          {nullLabel}
        </label>
      )}
    </div>
  </div>
);

// ── Info banner for fields that live elsewhere ──────────────────
const RedirectBanner: React.FC<{
  patientId: string;
  target: 'hospice-nursing' | 'pain-assessment';
  children: React.ReactNode;
}> = ({ patientId, target, children }) => (
  <div className="rounded-lg bg-surface-low border border-border-base px-4 py-3 text-xs text-text-secondary leading-relaxed flex items-start gap-2">
    <ExternalLink size={14} className="mt-0.5 flex-shrink-0 text-text-muted" />
    <div>
      {children}
      <div className="mt-1">
        <Link
          to={`/patients/${patientId}/${target}`}
          className="text-primary font-medium hover:underline"
        >
          Open the {target === 'hospice-nursing' ? 'Hospice Nursing Assessment' : 'Pain Assessment'} form →
        </Link>
      </div>
    </div>
  </div>
);

const RecordVisitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const access = usePermissionAccess('canRecordVisit');

  const { data: patient, isLoading: patientLoading, error, refetch } = usePatient(id!);
  const recordMutation = useRecordVisit(id!);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    getValues,
  } = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      timeStarted: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeEnded: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      visitType: 'Routine',
      teamMembers: [],
      overallStatus: 'Stable',
      mobility: 'RequiresAssistance',
      painPresent: false,
      painScore: 0,
      painMedicationEffective: true,
      currentPainMedication: false,
      adl: {
        feeding: 'NeedsAssistance',
        bathing: 'NeedsAssistance',
        dressing: 'NeedsAssistance',
        toileting: 'NeedsAssistance',
        mobility: 'NeedsAssistance',
      },
      ppsScore: 50,
      kpsScore: 50,
      appetite: 'Fair',
      oralIntake: 'Reduced',
      hydrationStatus: 'Adequate',
      emotionalStatus: 'Stable',
      familySupport: 'Good',
      financialDifficulty: false,
      spiritualNeeds: false,
      religiousSupportRequested: false,
      medicationAvailable: true,
      medicationCorrectlyTaken: true,
      medicationSideEffects: false,
      medicationRefillNeeded: false,
      morphineAvailable: null,
      adherenceLevel: 'Good',
      currentMedications: [],
      caregiverBurden: 'Moderate',
      caregiverUnderstanding: 'Good',
      caregivingCapacity: 'Moderate',
      familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
      painLocation: [],
      painCharacteristics: [],
      symptoms: [],
      educationProvided: [],
      homeObservations: [],
      nursingCareGiven: [],
      redFlags: ['None'],
      referralsMade: [],
      additionalSupportNeeded: false,
      trainingNeeds: [],
    },
  });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({ control, name: 'teamMembers' });

  const {
    fields: medFields,
    append: appendMed,
    remove: removeMed,
  } = useFieldArray({ control, name: 'currentMedications' });

  // ═══════════════════════════════════════════════════════════════
  // AUTO-FILL
  //   • caregiver name (relationship/phone aren't in the visit
  //     schema, so we skip them)
  //   • team leader (auto-append once the patient + user are ready)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!patient) return;
    setValue('primaryCaregiver', patient.caregiverName ?? '');
  }, [patient, setValue]);

  useEffect(() => {
    if (!user?.name) return;
    if (teamFields.length > 0) return; // never re-append

    const role: 'Physician' | 'Nurse' =
      user.role === 'Physician' || user.role === 'Nurse'
        ? (user.role as 'Physician' | 'Nurse')
        : 'Nurse';

    appendTeam({
      role,
      name: user.name,
      isTeamLeader: true,
      staffId: user.id ? String(user.id) : undefined,
    });
    // We intentionally exclude teamFields.length so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.id, user?.role, appendTeam]);

  const onSubmit = (data: CreateVisitFormData) => {
    recordMutation.mutate(data as any, {
      onSuccess: (response) => {
        setCreatedVisitId(response.id);
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ?? 'Failed to save visit.';
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

  if (patientLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // ── Write gate ──
  if (!access.allowed || patient.status === 'Discharged') {
    return <Navigate to={`/patients/${id}`} replace />;
  }

  const adlOptions = [
    { value: 'Independent', label: 'Independent' },
    { value: 'NeedsAssistance', label: 'Needs Assistance' },
    { value: 'FullyDependent', label: 'Fully Dependent' },
  ];

  const isSubmitting = recordMutation.isPending;

  const displayId =
    patient?.hospitalPatientId ?? patient?.patientDisplayId ?? '—';
  const patientPath = `/patients/${id}`;

  // ── Saved state ──
  if (createdVisitId) {
    return (
      <div className="max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <BackButton to={patientPath} label="Patient" />
        </div>

        <div className="rounded-2xl border border-success/30 bg-success-bg/20 px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Home visit recorded successfully.
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              You are automatically signed as the Team Leader. Additional
              Physician and Nurse signatures are required to finalise this
              visit.
            </p>
          </div>
        </div>

        <SignatureSection
          patientId={id!}
          visitId={createdVisitId}
          teamMembers={getValues('teamMembers')}
          onAllSigned={() => {
            setTimeout(() => navigate(patientPath), 1200);
          }}
        />
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={patientPath} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            HOME VISIT CHECKLIST
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

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
        noValidate
      >
        {/* 1. PATIENT INFORMATION (read-only) */}
        <Section title="1. PATIENT INFORMATION">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Hospital ID / MRN" value={displayId} disabled />
            <Input
              label="Age"
              value={patient?.age ? `${patient.age} years` : '—'}
              disabled
            />
            <Input label="Sex" value={patient?.sex || '—'} disabled />
            <Input
              label="Address (Kebele/Sub-city)"
              value={patient?.address || '—'}
              disabled
            />
            <Input
              label="Phone Number"
              value={patient?.phone || '—'}
              disabled
            />
            <Input
              label="Primary Caregiver Name"
              value={patient?.caregiverName || '—'}
              disabled
            />
            <Input
              label="Relationship"
              value={patient?.caregiverRelation || '—'}
              disabled
            />
          </div>
        </Section>

        {/* 2. VISIT DETAILS */}
        <Section title="2. VISIT DETAILS">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Date of Visit"
              type="date"
              error={errors.visitDate?.message}
              {...register('visitDate')}
            />
            <Input
              label="Time Started"
              type="time"
              error={errors.timeStarted?.message}
              {...register('timeStarted')}
            />
            <Input
              label="Time Ended"
              type="time"
              error={errors.timeEnded?.message}
              {...register('timeEnded')}
            />
          </div>

          <Select
            label="Visit Type"
            options={[
              { value: 'Routine', label: 'Routine follow-up' },
              { value: 'Emergency', label: 'Emergency visit' },
              { value: 'FirstAssessment', label: 'First home assessment' },
              { value: 'PostDischarge', label: 'Post-discharge follow-up' },
              { value: 'EndOfLife', label: 'End-of-Life Visit' },
              { value: 'Bereavement', label: 'Bereavement Follow-Up' },
            ]}
            {...register('visitType')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-1">
              Visiting Team Members
            </p>
            <p className="text-xs text-text-muted mb-3">
              You are automatically recorded as the Team Leader. Add any other
              staff who accompanied you on this visit.
            </p>

            {teamFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 mb-2 items-start">
                <Select
                  options={[
                    { value: 'Physician', label: 'Physician' },
                    { value: 'Nurse', label: 'Nurse' },
                    { value: 'Pharmacist', label: 'Pharmacist' },
                    { value: 'Radiologist', label: 'Radiologist' },
                    { value: 'LaboratoryTechnician', label: 'Lab Technician' },
                    { value: 'Physiologist', label: 'Physiologist' },
                    { value: 'Psychiatrist', label: 'Psychiatrist' },
                    { value: 'Psychologist', label: 'Psychologist' },
                    { value: 'SocialWorker', label: 'Social Worker' },
                    { value: 'SpiritualPerson', label: 'Spiritual Person' },
                    { value: 'Nutritionist', label: 'Nutritionist' },
                  ]}
                  placeholder="Role"
                  {...register(`teamMembers.${i}.role`)}
                  className="w-40"
                />
                <Input
                  placeholder="Staff name"
                  error={errors.teamMembers?.[i]?.name?.message}
                  {...register(`teamMembers.${i}.name`)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => removeTeam(i)}
                  disabled={teamFields.length <= 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            {errors.teamMembers && (
              <p className="text-xs text-error">
                {(errors.teamMembers as any).message ??
                  'At least one team member is required.'}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => appendTeam({ role: 'Nurse', name: '' })}
            >
              Add Member
            </Button>
          </div>
        </Section>

        {/* 3. GENERAL CONDITION */}
        <Section title="3. PATIENT GENERAL CONDITION">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Overall Status"
              options={[
                { value: 'Stable', label: 'Stable' },
                { value: 'Deteriorating', label: 'Deteriorating' },
                { value: 'Critical', label: 'Critical' },
                { value: 'BedBound', label: 'Bed-bound' },
              ]}
              {...register('overallStatus')}
            />
            <Select
              label="Mobility"
              options={[
                { value: 'Ambulatory', label: 'Ambulatory' },
                { value: 'RequiresAssistance', label: 'Requires assistance' },
                { value: 'Bedridden', label: 'Bedridden' },
              ]}
              {...register('mobility')}
            />
          </div>
        </Section>

        {/* 4. VITAL SIGNS */}
        <Section title="4. VITAL SIGNS (IF AVAILABLE)" defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              {...register('vitals.temperature')}
            />
            <Input
              label="Pulse (bpm)"
              type="number"
              {...register('vitals.pulse')}
            />
            <Input
              label="Blood Pressure (mmHg)"
              placeholder="120/80"
              {...register('vitals.bloodPressure')}
            />
            <Input
              label="Respiration (/min)"
              type="number"
              {...register('vitals.respiration')}
            />
            <Input
              label="SpO₂ (%)"
              type="number"
              {...register('vitals.spO2')}
            />
          </div>
        </Section>

        {/* 5. PAIN ASSESSMENT */}
        <Section title="5. PAIN ASSESSMENT">
          <div className="grid sm:grid-cols-2 gap-4">
            <BooleanRadio
              label="Pain Present"
              value={watch('painPresent')}
              onChange={(v) =>
                setValue('painPresent', v as boolean, { shouldDirty: true })
              }
            />
            <Input
              label="Pain Score (0–10)"
              type="number"
              min={0}
              max={10}
              error={errors.painScore?.message}
              {...register('painScore', { valueAsNumber: true })}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Pain Location
            </p>
            <CheckboxGroup
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
              labels={PAIN_LOCATION_LABELS}
              name="painLocation"
              register={register}
            />
            <Input
              placeholder="Other: specify"
              className="mt-2"
              {...register('painLocationOther')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Pain Characteristics
            </p>
            <CheckboxGroup
              options={[
                'Sharp',
                'Dull',
                'Burning',
                'Cramping',
                'Intermittent',
                'Continuous',
              ]}
              labels={{
                Sharp: 'Sharp',
                Dull: 'Dull',
                Burning: 'Burning',
                Cramping: 'Cramping',
                Intermittent: 'Intermittent',
                Continuous: 'Continuous',
              }}
              name="painCharacteristics"
              register={register}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <BooleanRadio
              label="Current Pain Medication"
              value={watch('currentPainMedication')}
              onChange={(v) =>
                setValue('currentPainMedication', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
            <BooleanRadio
              label="Current Management Effective"
              value={watch('painMedicationEffective')}
              onChange={(v) =>
                setValue('painMedicationEffective', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
          </div>
          {watch('painMedicationEffective') === false && (
            <Textarea
              label="If No, explain:"
              rows={2}
              {...register('painManagementIneffectiveReason')}
            />
          )}

          <RedirectBanner patientId={id!} target="pain-assessment">
            Detailed pain characteristics (breakthrough, rescue effectiveness,
            non-pharmacological methods, barriers) belong to the dedicated
            Pain Assessment form.
          </RedirectBanner>
        </Section>

        {/* 6. SYMPTOMS */}
        <Section title="6. SYMPTOMS">
          <CheckboxGroup
            options={[
              'Dyspnea',
              'Nausea',
              'Constipation',
              'Anxiety',
              'Fatigue',
              'PoorAppetite',
              'PressureSores',
              'Other',
            ]}
            labels={SYMPTOM_LABELS}
            name="symptoms"
            register={register}
          />
          <Input
            placeholder="Other: specify"
            className="mt-2"
            {...register('symptomsOther')}
          />
        </Section>

        {/* 7. FUNCTIONAL STATUS */}
        <Section title="7. FUNCTIONAL STATUS ASSESSMENT">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="PPS Score (%)"
              type="number"
              min={0}
              max={100}
              {...register('ppsScore', { valueAsNumber: true })}
            />
            <Input
              label="KPS Score (/100)"
              type="number"
              min={0}
              max={100}
              {...register('kpsScore', { valueAsNumber: true })}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Activities of Daily Living (ADL)
            </p>
            <div className="space-y-2">
              {(
                [
                  'feeding',
                  'bathing',
                  'dressing',
                  'toileting',
                  'mobility',
                ] as const
              ).map((act) => (
                <div key={act} className="flex items-center gap-4">
                  <p className="text-sm w-24 capitalize flex-shrink-0">
                    {act}
                  </p>
                  <Select
                    options={adlOptions}
                    {...register(`adl.${act}`)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 8. NUTRITION */}
        <Section
          title="8. NUTRITION AND HYDRATION ASSESSMENT"
          defaultOpen={false}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Appetite"
              options={[
                { value: 'Good', label: 'Good' },
                { value: 'Fair', label: 'Fair' },
                { value: 'Poor', label: 'Poor' },
                { value: 'UnableToEat', label: 'Unable to Eat' },
              ]}
              {...register('appetite')}
            />
            <Select
              label="Oral Intake"
              options={[
                { value: 'Adequate', label: 'Adequate' },
                { value: 'Reduced', label: 'Reduced' },
                { value: 'Minimal', label: 'Minimal' },
              ]}
              {...register('oralIntake')}
            />
            <Select
              label="Hydration Status"
              options={[
                { value: 'Adequate', label: 'Adequate' },
                { value: 'MildDehydration', label: 'Mild Dehydration' },
                { value: 'SevereDehydration', label: 'Severe Dehydration' },
              ]}
              {...register('hydrationStatus')}
            />
          </div>
          <Textarea
            label="Comments"
            rows={2}
            {...register('nutritionComments')}
          />
        </Section>

        {/* 9. PSYCHOSOCIAL */}
        <Section title="9. PSYCHOSOCIAL ASSESSMENT" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Patient Emotional Status"
              options={[
                { value: 'Stable', label: 'Stable' },
                { value: 'Anxious', label: 'Anxious' },
                { value: 'Depressed', label: 'Depressed' },
                { value: 'Fearful', label: 'Fearful' },
                { value: 'Distressed', label: 'Distressed' },
              ]}
              {...register('emotionalStatus')}
            />
            <Select
              label="Family Support"
              options={[
                { value: 'Excellent', label: 'Excellent' },
                { value: 'Good', label: 'Good' },
                { value: 'Limited', label: 'Limited' },
                { value: 'None', label: 'None' },
              ]}
              {...register('familySupport')}
            />
          </div>
          <Textarea
            label="Comments"
            rows={2}
            {...register('emotionalComments')}
          />

          <BooleanRadio
            label="Financial Difficulty"
            value={watch('financialDifficulty')}
            onChange={(v) =>
              setValue('financialDifficulty', v as boolean, {
                shouldDirty: true,
              })
            }
          />
          <Textarea
            label="Comments"
            rows={2}
            {...register('financialComments')}
          />
        </Section>

        {/* 10. SPIRITUAL */}
        <Section title="10. SPIRITUAL ASSESSMENT" defaultOpen={false}>
          <BooleanRadio
            label="Spiritual Needs Identified"
            value={watch('spiritualNeeds')}
            onChange={(v) =>
              setValue('spiritualNeeds', v as boolean, { shouldDirty: true })
            }
          />
          {watch('spiritualNeeds') && (
            <Textarea
              label="If Yes, specify:"
              rows={2}
              {...register('spiritualNeedsDescription')}
            />
          )}

          <BooleanRadio
            label="Requested Religious Support"
            value={watch('religiousSupportRequested')}
            onChange={(v) =>
              setValue('religiousSupportRequested', v as boolean, {
                shouldDirty: true,
              })
            }
          />
          {watch('religiousSupportRequested') && (
            <Textarea
              label="Specify:"
              rows={2}
              {...register('religiousSupportSpecify')}
            />
          )}
        </Section>

        {/* 11. MEDICATION REVIEW */}
        <Section title="11. MEDICATION REVIEW" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-3">
            <BooleanRadio
              label="Medications available at home?"
              value={watch('medicationAvailable')}
              onChange={(v) =>
                setValue('medicationAvailable', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
            <BooleanRadio
              label="Taking medications correctly?"
              value={watch('medicationCorrectlyTaken')}
              onChange={(v) =>
                setValue('medicationCorrectlyTaken', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
            <BooleanRadio
              label="Any side effects?"
              value={watch('medicationSideEffects')}
              onChange={(v) =>
                setValue('medicationSideEffects', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
            <BooleanRadio
              label="Need medication refill?"
              value={watch('medicationRefillNeeded')}
              onChange={(v) =>
                setValue('medicationRefillNeeded', v as boolean, {
                  shouldDirty: true,
                })
              }
            />
            <BooleanRadio
              label="Morphine available?"
              value={watch('morphineAvailable')}
              onChange={(v) =>
                setValue('morphineAvailable', v, { shouldDirty: true })
              }
              allowNull
            />
          </div>

          <Select
            label="Adherence level"
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Partial', label: 'Partial' },
              { value: 'Poor', label: 'Poor' },
            ]}
            {...register('adherenceLevel')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Medications Currently Being Used
            </p>
            {medFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-4 gap-2 mb-2">
                <Input
                  placeholder="Name"
                  {...register(`currentMedications.${i}.name`)}
                />
                <Input
                  placeholder="Dosage"
                  {...register(`currentMedications.${i}.dosage`)}
                />
                <Input
                  placeholder="Frequency"
                  {...register(`currentMedications.${i}.frequency`)}
                />
                <div className="flex gap-1">
                  <Input
                    placeholder="Route"
                    {...register(`currentMedications.${i}.route`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 flex-shrink-0"
                    onClick={() => removeMed(i)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() =>
                appendMed({ name: '', dosage: '', frequency: '', route: '' })
              }
            >
              Add Medication
            </Button>
          </div>

          <Textarea
            label="Issues Identified:"
            rows={2}
            {...register('medicationIssues')}
          />
        </Section>

        {/* 12. CAREGIVER */}
        <Section title="12. CAREGIVER ASSESSMENT" defaultOpen={false}>
          <div className="rounded-lg bg-primary/[0.04] border border-primary/20 px-4 py-2.5">
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-primary">Auto-filled</strong> from the
              patient record. Edit below if the information has changed.
            </p>
          </div>
          <Input label="Primary Caregiver" {...register('primaryCaregiver')} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Caregiver Burden"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'High', label: 'High' },
              ]}
              {...register('caregiverBurden')}
            />
            <Select
              label="Caregiver Understanding of Care Plan"
              options={[
                { value: 'Good', label: 'Good' },
                { value: 'Fair', label: 'Fair' },
                { value: 'Poor', label: 'Poor' },
              ]}
              {...register('caregiverUnderstanding')}
            />
            <Select
              label="Caregiving Capacity"
              options={[
                { value: 'Strong', label: 'Strong' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Weak', label: 'Weak' },
              ]}
              {...register('caregivingCapacity')}
            />
            <Select
              label="Family emotional status"
              options={[
                { value: 'Stable', label: 'Stable' },
                { value: 'Stressed', label: 'Stressed' },
                { value: 'Overwhelmed', label: 'Overwhelmed' },
              ]}
              {...register('familyEmotionalStatus')}
            />
          </div>
        </Section>

        {/* 13. EDUCATION */}
        <Section title="13. EDUCATION PROVIDED" defaultOpen={false}>
          <p className="text-sm font-medium text-on-surface mb-2">
            Education Provided During Visit
          </p>
          <CheckboxGroup
            options={[
              'MedicationAdministration',
              'PainManagement',
              'NutritionSupport',
              'SkinCare',
              'PressureSorePrevention',
              'EndOfLifeCare',
              'EmergencySigns',
              'EmotionalSupport',
              'Other',
            ]}
            labels={EDUCATION_LABELS}
            name="educationProvided"
            register={register}
          />
          <Input
            placeholder="Other: specify"
            className="mt-2"
            {...register('educationProvidedOther')}
          />

          <div className="mt-4">
            <p className="text-sm font-medium text-on-surface mb-2">
              Training Needs Identified
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Medication administration',
                'Hygiene care',
                'Feeding assistance',
                'Pressure sore prevention',
                'Emotional support',
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={item}
                    {...register('trainingNeeds')}
                    className="h-4 w-4 rounded text-primary"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <BooleanRadio
            label="Additional Support Needed"
            value={watch('additionalSupportNeeded') as boolean | null}
            onChange={(v) =>
              setValue('additionalSupportNeeded', v as boolean, {
                shouldDirty: true,
              })
            }
          />
          {watch('additionalSupportNeeded') && (
            <Textarea
              label="Specify:"
              rows={2}
              {...register('additionalSupportSpecify')}
            />
          )}
        </Section>

        {/* 14. HOME ENVIRONMENT */}
        <Section title="14. HOME ENVIRONMENT ASSESSMENT" defaultOpen={false}>
          <Select
            label="Condition of Home"
            options={[
              { value: 'Clean', label: 'Clean' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
            ]}
            {...register('homeCondition')}
          />

          <p className="text-sm font-medium text-on-surface mb-2">
            Observations
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'AdequateLighting',
                'Ventilation',
                'SafeBed',
                'CleanWater',
                'SanitationIssues',
              ] as const
            ).map((o) => (
              <label
                key={o}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={o}
                  {...register('homeObservations')}
                  className="h-4 w-4 rounded text-primary"
                />
                {o.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            ))}
          </div>
          <Textarea
            label="Details:"
            rows={2}
            {...register('homeEnvironmentDetails')}
          />
        </Section>

        {/* 15. NURSING CARE */}
        <Section title="15. NURSING CARE PROVIDED" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'Hygiene',
                'WoundCare',
                'MedicationAdmin',
                'PositionChange',
                'FeedingAssistance',
                'Counseling',
              ] as const
            ).map((n) => (
              <label
                key={n}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={n}
                  {...register('nursingCareGiven')}
                  className="h-4 w-4 rounded text-primary"
                />
                {n.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            ))}
          </div>
          <Input
            placeholder="Other: specify"
            className="mt-2"
            {...register('nursingCareOther')}
          />
        </Section>

        {/* 16. RED FLAG */}
        <Section title="16. RED FLAG ASSESSMENT">
          <CheckboxGroup
            options={[
              'SevereUncontrolledPain',
              'SevereShortnessOfBreath',
              'MassiveBleeding',
              'UncontrolledSeizures',
              'AlteredMentalStatus',
              'SevereDehydration',
              'None',
            ]}
            labels={RED_FLAG_LABELS}
            name="redFlags"
            register={register}
          />
          <Textarea
            label="Action Taken:"
            rows={3}
            {...register('redFlagActions')}
          />
        </Section>

        {/* 17. REFERRALS MADE */}
        <Section title="17. REFERRALS MADE" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'PhysicianReview',
                'HospitalAdmission',
                'SocialWorker',
                'Psychologist',
                'SpiritualCare',
                'NutritionSupport',
              ] as const
            ).map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={r}
                  {...register('referralsMade')}
                  className="h-4 w-4 rounded text-primary"
                />
                {r.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            ))}
          </div>
        </Section>

        {/* 18. KEY ISSUES */}
        <Section title="18. KEY ISSUES IDENTIFIED">
          <Textarea
            rows={4}
            placeholder="List key issues identified during the visit..."
            {...register('keyIssues')}
          />
        </Section>

        {/* 19. ACTION PLAN */}
        <Section title="19. ACTION PLAN">
          <Textarea
            label="Immediate actions taken:"
            rows={3}
            {...register('immediateActions')}
          />
          <Textarea
            label="Follow-up plan:"
            rows={3}
            {...register('followUpPlan')}
          />
          <Input
            label="Next visit scheduled:"
            type="date"
            {...register('nextVisitDate')}
          />
        </Section>

        {/* 20. OUTCOME */}
        <Section title="20. OUTCOME OF VISIT">
          <Select
            label="Visit Outcome"
            options={[
              { value: 'Stable', label: 'Patient stable' },
              { value: 'SymptomsImproved', label: 'Symptoms improved' },
              { value: 'SymptomsUnchanged', label: 'Symptoms unchanged' },
              { value: 'SymptomsWorsened', label: 'Symptoms worsened' },
              { value: 'ReferredToFacility', label: 'Referred to facility' },
              { value: 'Deceased', label: 'Patient deceased' },
            ]}
            error={errors.outcome?.message}
            {...register('outcome')}
          />
          {watch('outcome') === 'Deceased' && (
            <Input
              label="Date of Death (if applicable):"
              type="date"
              {...register('dateOfDeath')}
            />
          )}
        </Section>

        {/* 21. TEAM SIGNATURES — placeholder */}
        <Section title="21. TEAM SIGNATURES">
          <div className="p-4 bg-surface-low rounded-lg text-center text-text-muted text-sm">
            <ClipboardList size={20} className="mx-auto mb-2 text-text-muted" />
            <p>Save the visit first to enable team signatures.</p>
            <p className="text-xs mt-2">
              You are auto-signed as Team Leader. Physician and Nurse must sign
              with email + password.
            </p>
          </div>
        </Section>

        <div className="flex gap-3 justify-end pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(patientPath)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Visit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordVisitPage;