import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ChevronDown, ClipboardList, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createVisitSchema, type CreateVisitFormData } from '@/schemas/visit.schema';
import { useRecordVisit } from '@/hooks/useVisits';
import { usePatient } from '@/hooks/usePatients';
import { useVisitSignatures } from '@/hooks/useSignatures';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { PAIN_LOCATION_LABELS, SYMPTOM_LABELS, EDUCATION_LABELS, RED_FLAG_LABELS } from '@/constants';
import { SignatureSection } from '@/components/visits/SignatureSection';
import { useAuthStore } from '@/store/auth.store';

// ── Collapsible section wrapper ─────────────────────────────────
const Section: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title, defaultOpen = true, children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card padding="none">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-low transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-on-surface">{title}</span>
        <ChevronDown size={16} className={cn('text-text-muted transition-transform', open && 'rotate-180')} />
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
      <label key={value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
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

const RecordVisitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: patientLoading } = usePatient(id!);
  const recordMutation = useRecordVisit(id!);
  const user = useAuthStore((s) => s.user);

  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      timeStarted: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      timeEnded: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      visitType: 'Routine',
      teamMembers: [{ role: 'TeamLeader', name: user?.name || '' }],
      overallStatus: 'Stable',
      mobility: 'RequiresAssistance',
      painScore: 0,
      painMedicationEffective: true,
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
      morphineAvailable: true,
      adherenceLevel: 'Good',
      currentMedications: [],
      caregiverBurden: 'Moderate',
      caregiverUnderstanding: 'Good',
      caregivingCapacity: 'Moderate',
      familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
      teamLeaderId: user?.id || '',
      painLocation: [],
      painCharacteristics: [],
      symptoms: [],
      educationProvided: [],
      homeObservations: [],
      nursingCareGiven: [],
      redFlags: ['None'],
      referralsMade: [],
    },
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control,
    name: 'teamMembers',
  });
  const { fields: medFields, append: appendMed, remove: removeMed } = useFieldArray({
    control,
    name: 'currentMedications',
  });

  const onSubmit = (data: CreateVisitFormData) => {
    recordMutation.mutate(data, {
      onSuccess: (response) => {
        setCreatedVisitId(response.id);
      },
    });
  };

  if (patientLoading) return <PageLoader />;

  const adlOptions = [
    { value: 'Independent', label: 'Independent' },
    { value: 'NeedsAssistance', label: 'Needs Assistance' },
    { value: 'FullyDependent', label: 'Fully Dependent' },
  ];

  const isSubmitting = recordMutation.isPending;

  // ── Saved state — show signature section ──
  if (createdVisitId) {
    return (
      <div className="max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
        </div>

        <div className="rounded-2xl border border-success/30 bg-success-bg/20 px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Home visit recorded successfully.
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              The visit is now in the patient's record. Additional signatures can be
              added below — Physician and Nurse signatures are required to finalise.
            </p>
          </div>
        </div>

        <SignatureSection
          patientId={id!}
          visitId={createdVisitId}
          teamMembers={watch('teamMembers')}
          onAllSigned={() => {
            // Auto-navigate when all required roles have signed.
            setTimeout(() => navigate(`/patients/${id}`), 1200);
          }}
        />

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(`/patients/${id}`)}
          >
            Back to Patient
          </Button>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">HOME VISIT CHECKLIST</h1>
          <p className="text-sm text-text-secondary">Yekatit 12 Hospital Medical College (Y12HMC)</p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errs)=>console.error('[RecordVisit] validation failed:', errs))} className="space-y-4" noValidate>
        {/* 1. PATIENT IDENTIFICATION */}
        <Section title="1. PATIENT IDENTIFICATION">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Patient Name" value={patient ? `${patient.firstName} ${patient.lastName}` : '—'} disabled />
            <Input label="Hospital ID / MRN" value={patient?.patientDisplayId || '—'} disabled />
            <Input label="Age" value={patient?.age ? `${patient.age} years` : '—'} disabled />
            <Input label="Sex" value={patient?.sex || '—'} disabled />
            <Input label="Address (Kebele/Sub-city)" value={patient?.address || '—'} disabled className="md:col-span-2" />
            <Input label="Phone Number" value={patient?.phone || '—'} disabled />
            <Input label="Primary Caregiver Name" value={patient?.caregiverName || '—'} disabled />
            <Input label="Relationship" value="—" disabled />
          </div>
        </Section>

        {/* 2. VISIT DETAILS */}
        <Section title="2. VISIT DETAILS">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Date of Visit" type="date" error={errors.visitDate?.message} {...register('visitDate')} />
            <Input label="Time Started" type="time" error={errors.timeStarted?.message} {...register('timeStarted')} />
            <Input label="Time Ended" type="time" error={errors.timeEnded?.message} {...register('timeEnded')} />
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
            <p className="text-sm font-medium text-on-surface mb-2">Visiting Team Members</p>
            {teamFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 mb-2 items-start">
                <Select
                  options={[
                    { value: 'TeamLeader', label: 'Team Leader' },
                    { value: 'Physician', label: 'Physician' },
                    { value: 'Nurse', label: 'Nurse' },
                  ]}
                  placeholder="Role"
                  {...register(`teamMembers.${i}.role`)}
                  className="w-36"
                />
                <Input placeholder="Staff name" {...register(`teamMembers.${i}.name`)} className="flex-1" />
                {teamFields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => removeTeam(i)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => appendTeam({ role: 'Nurse', name: '' })}>
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

        {/* A. GENERAL OBSERVATION */}
        <Section title="A. GENERAL OBSERVATION">
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>

          <Select
            label="Level of Consciousness"
            options={[
              { value: 'Alert', label: 'Alert' },
              { value: 'Drowsy', label: 'Drowsy' },
              { value: 'Confused', label: 'Confused' },
              { value: 'Unresponsive', label: 'Unresponsive' },
              { value: 'Comatose', label: 'Comatose' },
            ]}
            placeholder="Select…"
            {...register('generalObservation.levelOfConsciousness')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Orientation</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Person', 'Place', 'Time', 'Disoriented'] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    value={opt}
                    {...register('generalObservation.orientation')}
                    className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
                  />
                  {opt === 'Person' ? 'Oriented to Person'
                    : opt === 'Place' ? 'Oriented to Place'
                    : opt === 'Time' ? 'Oriented to Time'
                    : 'Disoriented'}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">General Appearance</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {([
                'Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress',
                'Cachectic', 'Bedridden', 'WellGroomed', 'PoorHygiene',
              ] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    value={opt}
                    {...register('generalObservation.generalAppearance')}
                    className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
                  />
                  {opt === 'Comfortable' ? 'Comfortable'
                    : opt === 'MildDistress' ? 'Mild Distress'
                    : opt === 'ModerateDistress' ? 'Moderate Distress'
                    : opt === 'SevereDistress' ? 'Severe Distress'
                    : opt === 'Cachectic' ? 'Cachectic'
                    : opt === 'Bedridden' ? 'Bedridden'
                    : opt === 'WellGroomed' ? 'Well Groomed'
                    : 'Poor Hygiene'}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* 4. VITAL SIGNS */}
        <Section title="4. VITAL SIGNS (IF AVAILABLE)" defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Temperature (°C)" type="number" step="0.1" {...register('vitals.temperature')} />
            <Input label="Pulse (bpm)" type="number" {...register('vitals.pulse')} />
            <Input label="Blood Pressure (mmHg)" placeholder="120/80" {...register('vitals.bp')} />
            <Input label="Respiration (/min)" type="number" {...register('vitals.respiration')} />
            <Input label="SpO₂ (%)" type="number" {...register('vitals.spo2')} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Input label="Weight (kg)" type="number" step="0.1" {...register('vitals.weight')} />
            </div>
            <div>
              <Input label="Height (cm)" type="number" step="0.1" {...register('vitals.height')} />
            </div>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Weight and Height are not yet saved — pending backend support.
          </p>
        </Section>

        {/* 5. PAIN ASSESSMENT */}
        <Section title="5. PAIN ASSESSMENT">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Pain Present</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="true" {...register('painPresent')} className="h-4 w-4 text-primary" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="false" {...register('painPresent')} className="h-4 w-4 text-primary" />
                  No
                </label>
              </div>
            </div>
            <Input label="Pain Score (0–10)" type="number" min={0} max={10} error={errors.painScore?.message} {...register('painScore')} />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Pain Location</p>
            <CheckboxGroup
              options={['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other']}
              labels={PAIN_LOCATION_LABELS}
              name="painLocation"
              register={register}
            />
            <Input placeholder="Other: specify" className="mt-2" {...register('painLocationOther')} />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Pain Characteristics</p>
            <CheckboxGroup
              options={['Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous']}
              labels={{
                Sharp: 'Sharp', Dull: 'Dull', Burning: 'Burning',
                Cramping: 'Cramping', Intermittent: 'Intermittent', Continuous: 'Continuous',
              }}
              name="painCharacteristics"
              register={register}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Current Pain Medication</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="true" {...register('currentPainMedication')} className="h-4 w-4 text-primary" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="false" {...register('currentPainMedication')} className="h-4 w-4 text-primary" />
                  No
                </label>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Current Management Effective</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="true" {...register('painMedicationEffective')} className="h-4 w-4 text-primary" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="false" {...register('painMedicationEffective')} className="h-4 w-4 text-primary" />
                  No
                </label>
              </div>
            </div>
          </div>
          {!watch('painMedicationEffective') && (
            <Textarea label="If No, explain:" rows={2} {...register('painManagementIneffectiveReason')} />
          )}

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Pain Relief Measures</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Analgesics', 'Positioning', 'Massage', 'RelaxationTherapy', 'Other'] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    value={opt}
                    {...register('painReliefMeasures')}
                    className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
                  />
                  {opt === 'RelaxationTherapy' ? 'Relaxation Therapy' : opt}
                </label>
              ))}
            </div>
            <Input placeholder="Other: specify" className="mt-2" {...register('painReliefMeasuresOther')} />
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Pain Relief Measures are not yet saved — pending backend support.
            </p>
          </div>
        </Section>

        {/* B1. RESPIRATORY ASSESSMENT */}
        <Section title="B1. RESPIRATORY ASSESSMENT" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Breathing Pattern"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Labored', label: 'Labored' },
                { value: 'Shallow', label: 'Shallow' },
                { value: 'Rapid', label: 'Rapid' },
                { value: 'Slow', label: 'Slow' },
              ]}
              placeholder="Select…"
              {...register('respiratory.breathingPattern')}
            />
            <Select
              label="Dyspnea"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Mild', label: 'Mild' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Severe', label: 'Severe' },
              ]}
              placeholder="Select…"
              {...register('respiratory.dyspnea')}
            />
            <Select
              label="Cough"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Dry', label: 'Dry' },
                { value: 'Productive', label: 'Productive' },
              ]}
              placeholder="Select…"
              {...register('respiratory.cough')}
            />
            <Select
              label="Sputum"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Clear', label: 'Clear' },
                { value: 'Yellow', label: 'Yellow' },
                { value: 'Green', label: 'Green' },
                { value: 'Bloody', label: 'Bloody' },
              ]}
              placeholder="Select…"
              {...register('respiratory.sputum')}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Oxygen Therapy</p>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('respiratory.oxygenTherapy')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('respiratory.oxygenTherapy')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
            {watch('respiratory.oxygenTherapy' as any) === true && (
              <Input label="Flow Rate (L/min)" placeholder="e.g. 2" {...register('respiratory.oxygenFlowRate')} />
            )}
          </div>
        </Section>

        {/* B2. CARDIOVASCULAR ASSESSMENT */}
        <Section title="B2. CARDIOVASCULAR ASSESSMENT" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Pulse"
              options={[
                { value: 'Regular', label: 'Regular' },
                { value: 'Irregular', label: 'Irregular' },
              ]}
              placeholder="Select…"
              {...register('cardiovascular.pulseRhythm')}
            />
            <Select
              label="Skin Color"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Pale', label: 'Pale' },
                { value: 'Cyanotic', label: 'Cyanotic' },
                { value: 'Jaundiced', label: 'Jaundiced' },
              ]}
              placeholder="Select…"
              {...register('cardiovascular.skinColor')}
            />
            <Select
              label="Peripheral Edema"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Mild', label: 'Mild' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Severe', label: 'Severe' },
              ]}
              placeholder="Select…"
              {...register('cardiovascular.peripheralEdema')}
            />
            <Input
              label="Edema Location"
              placeholder="e.g. bilateral ankles"
              {...register('cardiovascular.peripheralEdemaLocation')}
            />
          </div>
        </Section>

        {/* 6. SYMPTOMS */}
        <Section title="6. SYMPTOMS">
          <CheckboxGroup
            options={['Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other']}
            labels={SYMPTOM_LABELS}
            name="symptoms"
            register={register}
          />
          <Input placeholder="Other: specify" className="mt-2" {...register('symptomsOther')} />
        </Section>

        {/* 7. FUNCTIONAL STATUS */}
        <Section title="7. FUNCTIONAL STATUS ASSESSMENT">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="PPS Score (%)" type="number" min={0} max={100} {...register('ppsScore')} />
            <Input label="KPS Score (/100)" type="number" min={0} max={100} {...register('kpsScore')} />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Activities of Daily Living (ADL)</p>
            <div className="space-y-2">
              {(['feeding', 'bathing', 'dressing', 'toileting', 'mobility'] as const).map((act) => (
                <div key={act} className="flex items-center gap-4">
                  <p className="text-sm w-24 capitalize flex-shrink-0">{act}</p>
                  <Select options={adlOptions} {...register(`adl.${act}`)} className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 8. NUTRITION */}
        <Section title="8. NUTRITION AND HYDRATION ASSESSMENT" defaultOpen={false}>
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
          <Textarea label="Comments" rows={2} {...register('nutritionComments')} />

          {/* GI additions — pending backend support */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border-base">
            <Select
              label="Nausea"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Mild', label: 'Mild' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Severe', label: 'Severe' },
              ]}
              placeholder="Select…"
              {...register('nausea')}
            />
            <Select
              label="Bowel Function"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Constipation', label: 'Constipation' },
                { value: 'Diarrhea', label: 'Diarrhea' },
                { value: 'Incontinence', label: 'Incontinence' },
              ]}
              placeholder="Select…"
              {...register('bowelFunction')}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Vomiting</p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="true" {...register('vomiting')} className="h-4 w-4 text-primary" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="false" {...register('vomiting')} className="h-4 w-4 text-primary" />
                  No
                </label>
              </div>
              {watch('vomiting' as any) === true && (
                <Input label="Frequency" placeholder="e.g. 3×/day" {...register('vomitingFrequency')} />
              )}
            </div>
            <Input label="Last Bowel Movement" type="date" {...register('lastBowelMovement')} />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Nausea, Vomiting, Bowel Function, and Last Bowel Movement are not yet saved — pending backend support.
          </p>
        </Section>

        {/* C1. GENITOURINARY ASSESSMENT */}
        <Section title="C1. GENITOURINARY ASSESSMENT" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Urinary Function"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Frequency', label: 'Frequency' },
                { value: 'Retention', label: 'Retention' },
                { value: 'Incontinence', label: 'Incontinence' },
                { value: 'Catheterized', label: 'Catheterized' },
              ]}
              placeholder="Select…"
              {...register('genitourinary.urinaryFunction')}
            />
            <Select
              label="Urine Appearance"
              options={[
                { value: 'Clear', label: 'Clear' },
                { value: 'Cloudy', label: 'Cloudy' },
                { value: 'Bloody', label: 'Bloody' },
                { value: 'Dark', label: 'Dark' },
              ]}
              placeholder="Select…"
              {...register('genitourinary.urineAppearance')}
            />
          </div>
        </Section>

        {/* C2. SKIN ASSESSMENT */}
        <Section title="C2. SKIN ASSESSMENT" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Skin Integrity"
              options={[
                { value: 'Intact', label: 'Intact' },
                { value: 'Dry', label: 'Dry' },
                { value: 'Fragile', label: 'Fragile' },
                { value: 'WoundPresent', label: 'Wound Present' },
                { value: 'PressureUlcer', label: 'Pressure Ulcer' },
              ]}
              placeholder="Select…"
              {...register('skin.skinIntegrity')}
            />
            <Select
              label="Pressure Injury Risk"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'High', label: 'High' },
              ]}
              placeholder="Select…"
              {...register('skin.pressureInjuryRisk')}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Existing Pressure Ulcer</p>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('skin.pressureUlcerPresent')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('skin.pressureUlcerPresent')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
            {watch('skin.pressureUlcerPresent' as any) === true && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Location" placeholder="e.g. sacrum" {...register('skin.pressureUlcerLocation')} />
                <Select
                  label="Stage"
                  options={[
                    { value: 'I', label: 'Stage I' },
                    { value: 'II', label: 'Stage II' },
                    { value: 'III', label: 'Stage III' },
                    { value: 'IV', label: 'Stage IV' },
                  ]}
                  placeholder="Select stage…"
                  {...register('skin.pressureUlcerStage')}
                />
              </div>
            )}
          </div>
        </Section>

        {/* C3. MOBILITY ASSESSMENT */}
        <Section title="C3. MOBILITY ASSESSMENT" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Mobility Status"
              options={[
                { value: 'Independent', label: 'Independent' },
                { value: 'RequiresAssistance', label: 'Requires Assistance' },
                { value: 'WheelchairDependent', label: 'Wheelchair Dependent' },
                { value: 'Bedridden', label: 'Bedridden' },
              ]}
              placeholder="Select…"
              {...register('mobilityAssessment.mobilityStatus')}
            />
            <Select
              label="Fall Risk"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'High', label: 'High' },
              ]}
              placeholder="Select…"
              {...register('mobilityAssessment.fallRisk')}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Assistive Devices</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['None', 'Cane', 'Walker', 'Wheelchair', 'Other'] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    value={opt}
                    {...register('mobilityAssessment.assistiveDevices')}
                    className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
                  />
                  {opt}
                </label>
              ))}
            </div>
            <Input placeholder="Other: specify" className="mt-2" {...register('mobilityAssessment.assistiveDevicesOther')} />
          </div>
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
          <Textarea label="Comments" rows={2} {...register('emotionalComments')} />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Financial Difficulty</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('financialDifficulty')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('financialDifficulty')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
          </div>
          <Textarea label="Comments" rows={2} {...register('financialComments')} />

          {/* Psychological additions — pending backend support */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border-base">
            <Select
              label="Communication Ability"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Impaired', label: 'Impaired' },
                { value: 'NonVerbal', label: 'Non-Verbal' },
              ]}
              placeholder="Select…"
              {...register('communicationAbility')}
            />
            <Select
              label="Cognitive Status"
              options={[
                { value: 'Intact', label: 'Intact' },
                { value: 'MildImpairment', label: 'Mild Impairment' },
                { value: 'SevereImpairment', label: 'Severe Impairment' },
              ]}
              placeholder="Select…"
              {...register('cognitiveStatus')}
            />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Communication Ability and Cognitive Status are not yet saved — pending backend support.
          </p>
        </Section>

        {/* 10. SPIRITUAL */}
        <Section title="10. SPIRITUAL ASSESSMENT" defaultOpen={false}>
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Spiritual Needs Identified</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('spiritualNeeds')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('spiritualNeeds')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
          </div>
          {watch('spiritualNeeds') && (
            <Textarea label="If Yes, specify:" rows={2} {...register('spiritualNeedsDescription')} />
          )}

          <div className="mt-4">
            <p className="text-sm font-medium text-on-surface mb-2">Requested Religious Support</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('religiousSupportRequested')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('religiousSupportRequested')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
          </div>
          {watch('religiousSupportRequested') && (
            <Textarea label="Specify:" rows={2} {...register('religiousSupportSpecify')} />
          )}

          {/* Spiritual additions — pending backend support */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border-base">
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
            <Input
              label="Other (specify)"
              placeholder="If Other selected above"
              {...register('religiousAffiliationOther')}
            />
          </div>
          <Textarea
            label="Cultural Considerations"
            rows={2}
            placeholder="Note any cultural beliefs or practices relevant to care…"
            {...register('culturalConsiderations')}
          />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Religious Affiliation and Cultural Considerations are not yet saved — pending backend support.
          </p>
        </Section>

        {/* 11. MEDICATION REVIEW */}
        <Section title="11. MEDICATION REVIEW" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-3">
            <YesNoField label="Medications available at home?" name="medicationAvailable" register={register} />
            <YesNoField label="Taking medications correctly?" name="medicationCorrectlyTaken" register={register} />
            <YesNoField label="Any side effects?" name="medicationSideEffects" register={register} />
            <YesNoField label="Need medication refill?" name="medicationRefillNeeded" register={register} />

            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Morphine available?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="morphineAvailable"
                    checked={watch('morphineAvailable') === true}
                    onChange={() => setValue('morphineAvailable', true)}
                    className="h-4 w-4 text-primary"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="morphineAvailable"
                    checked={watch('morphineAvailable') === false}
                    onChange={() => setValue('morphineAvailable', false)}
                    className="h-4 w-4 text-primary"
                  />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="morphineAvailable"
                    checked={watch('morphineAvailable') === null}
                    onChange={() => setValue('morphineAvailable', null)}
                    className="h-4 w-4 text-primary"
                  />
                  N/A
                </label>
              </div>
            </div>
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
            <p className="text-sm font-medium text-on-surface mb-2">Medications Currently Being Used</p>
            {medFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-4 gap-2 mb-2">
                <Input placeholder="Name" {...register(`currentMedications.${i}.name`)} />
                <Input placeholder="Dosage" {...register(`currentMedications.${i}.dosage`)} />
                <Input placeholder="Frequency" {...register(`currentMedications.${i}.frequency`)} />
                <div className="flex gap-1">
                  <Input placeholder="Route" {...register(`currentMedications.${i}.route`)} />
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => removeMed(i)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => appendMed({ name: '', dosage: '', frequency: '', route: '' })}>
              Add Medication
            </Button>
          </div>

          <Textarea label="Issues Identified:" rows={2} {...register('medicationIssues')} />
        </Section>

        {/* 12. CAREGIVER */}
        <Section title="12. CAREGIVER ASSESSMENT" defaultOpen={false}>
          <Input label="Primary Caregiver" {...register('primaryCaregiver')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Relationship"
              placeholder="e.g. Spouse, Child"
              {...register('caregiverRelationship')}
            />
            <Input
              label="Phone"
              placeholder="Contact number"
              {...register('caregiverPhone')}
            />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 -mt-2">
            Relationship and Phone are not yet saved — pending backend support.
          </p>
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
          <p className="text-sm font-medium text-on-surface mb-2">Education Provided During Visit</p>
          <CheckboxGroup
            options={['MedicationAdministration', 'PainManagement', 'NutritionSupport', 'SkinCare', 'PressureSorePrevention', 'EndOfLifeCare', 'EmergencySigns', 'EmotionalSupport', 'Other']}
            labels={EDUCATION_LABELS}
            name="educationProvided"
            register={register}
          />
          <Input placeholder="Other: specify" className="mt-2" {...register('educationProvidedOther')} />

          <div className="mt-4">
            <p className="text-sm font-medium text-on-surface mb-2">Training Needs Identified</p>
            <div className="grid grid-cols-2 gap-2">
              {['Medication administration', 'Hygiene care', 'Feeding assistance', 'Pressure sore prevention', 'Emotional support'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={item} {...register('trainingNeeds')} className="h-4 w-4 rounded text-primary" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-on-surface mb-2">Additional Support Needed</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('additionalSupportNeeded')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('additionalSupportNeeded')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
          </div>
          {watch('additionalSupportNeeded') && (
            <Textarea label="Specify:" rows={2} {...register('additionalSupportSpecify')} />
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

          <p className="text-sm font-medium text-on-surface mb-2">Observations</p>
          <div className="grid grid-cols-2 gap-2">
            {(['AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues'] as const).map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={o} {...register('homeObservations')} className="h-4 w-4 rounded text-primary" />
                {o === 'AdequateLighting' ? 'Adequate lighting'
                  : o === 'Ventilation' ? 'Ventilation adequate'
                  : o === 'SafeBed' ? 'Safe bed arrangement'
                  : o === 'CleanWater' ? 'Clean water available'
                  : 'Sanitation issues'}
              </label>
            ))}
          </div>
          <Textarea label="Details:" rows={2} {...register('homeEnvironmentDetails')} />
        </Section>

        {/* 15. NURSING CARE */}
        <Section title="15. NURSING CARE PROVIDED" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(['Hygiene', 'WoundCare', 'MedicationAdmin', 'PositionChange', 'FeedingAssistance', 'Counseling'] as const).map((n) => (
              <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={n} {...register('nursingCareGiven')} className="h-4 w-4 rounded text-primary" />
                {n === 'Hygiene' ? 'Patient hygiene care'
                  : n === 'WoundCare' ? 'Wound care'
                  : n === 'MedicationAdmin' ? 'Medication administration'
                  : n === 'PositionChange' ? 'Position change'
                  : n === 'FeedingAssistance' ? 'Feeding assistance'
                  : 'Counseling provided'}
              </label>
            ))}
          </div>
          <Input placeholder="Other: specify" className="mt-2" {...register('nursingCareOther')} />
        </Section>

        {/* 16. RED FLAG */}
        <Section title="16. RED FLAG ASSESSMENT">
          <CheckboxGroup
            options={['SevereUncontrolledPain', 'SevereShortnessOfBreath', 'MassiveBleeding', 'UncontrolledSeizures', 'AlteredMentalStatus', 'SevereDehydration', 'None']}
            labels={RED_FLAG_LABELS}
            name="redFlags"
            register={register}
          />
          <Textarea label="Action Taken:" rows={3} {...register('redFlagActions')} />
        </Section>

        {/* 17. REFERRALS MADE */}
        <Section title="17. REFERRALS MADE" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(['PhysicianReview', 'HospitalAdmission', 'SocialWorker', 'Psychologist', 'SpiritualCare', 'NutritionSupport'] as const).map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={r} {...register('referralsMade')} className="h-4 w-4 rounded text-primary" />
                {r === 'PhysicianReview' ? 'Physician review'
                  : r === 'HospitalAdmission' ? 'Hospital admission'
                  : r === 'SocialWorker' ? 'Social worker follow-up'
                  : r === 'Psychologist' ? 'Psychologist referral'
                  : r === 'SpiritualCare' ? 'Spiritual care support'
                  : 'Nutrition support'}
              </label>
            ))}
          </div>
        </Section>

        {/* 18. KEY ISSUES */}
        <Section title="18. KEY ISSUES IDENTIFIED">
          <Textarea rows={4} placeholder="List key issues identified during the visit..." {...register('keyIssues')} />
        </Section>

        {/* E1. NURSING DIAGNOSES */}
        <Section title="E1. NURSING DIAGNOSES" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              'AcutePain', 'ChronicPain', 'ImpairedMobility', 'RiskForFalls',
              'ImpairedSkinIntegrity', 'ImbalancedNutrition', 'Anxiety',
              'CaregiverStrain', 'IneffectiveBreathingPattern', 'Other',
            ] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  value={opt}
                  {...register('nursingDiagnoses')}
                  className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
                />
                {opt === 'AcutePain' ? 'Acute Pain'
                  : opt === 'ChronicPain' ? 'Chronic Pain'
                  : opt === 'ImpairedMobility' ? 'Impaired Mobility'
                  : opt === 'RiskForFalls' ? 'Risk for Falls'
                  : opt === 'ImpairedSkinIntegrity' ? 'Impaired Skin Integrity'
                  : opt === 'ImbalancedNutrition' ? 'Imbalanced Nutrition'
                  : opt === 'Anxiety' ? 'Anxiety'
                  : opt === 'CaregiverStrain' ? 'Caregiver Strain'
                  : opt === 'IneffectiveBreathingPattern' ? 'Ineffective Breathing Pattern'
                  : 'Other'}
              </label>
            ))}
          </div>
          <Input placeholder="Other: specify" className="mt-2" {...register('nursingDiagnosesOther')} />
        </Section>

        {/* E2. NURSING CARE PLAN */}
        <Section title="E2. NURSING CARE PLAN" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Fields in this section are not yet saved — pending backend support.
          </p>
          <Textarea label="Nursing Problems Identified" rows={3} placeholder="List the nursing problems identified…" {...register('nursingCarePlan.problemsIdentified')} />
          <Textarea label="Planned Interventions" rows={3} placeholder="Describe planned nursing interventions…" {...register('nursingCarePlan.plannedInterventions')} />
          <Textarea label="Expected Outcomes" rows={3} placeholder="State the expected outcomes…" {...register('nursingCarePlan.expectedOutcomes')} />
        </Section>

        {/* E3. NURSE'S SUMMARY */}
        <Section title="E3. NURSE'S SUMMARY" defaultOpen={false}>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            This field is not yet saved — pending backend support.
          </p>
          <Textarea
            label="Nurse's Summary"
            rows={5}
            placeholder="Provide an overall nursing summary of this visit…"
            {...register('nursesSummary')}
          />
        </Section>

        {/* 19. ACTION PLAN */}
        <Section title="19. ACTION PLAN">
          <Textarea label="Immediate actions taken:" rows={3} {...register('immediateActions')} />
          <Textarea label="Follow-up plan:" rows={3} {...register('followUpPlan')} />
          <Input label="Next visit scheduled:" type="date" {...register('nextVisitDate')} />
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
            <Input label="Date of Death (if applicable):" type="date" {...register('dateOfDeath')} />
          )}
        </Section>

        {/* 21. TEAM SIGNATURES — placeholder */}
        <Section title="21. TEAM SIGNATURES">
          <div className="p-4 bg-surface-low rounded-lg text-center text-text-muted text-sm">
            <ClipboardList size={20} className="mx-auto mb-2 text-text-muted" />
            <p>Save the visit first to enable team signatures.</p>
            <p className="text-xs mt-2">
              Team Leader is auto-signed. Physician and Nurse must sign with email + password.
            </p>
          </div>
        </Section>

        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
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

// Small helper for the medication review Yes/No radios
const YesNoField: React.FC<{ label: string; name: any; register: any }> = ({ label, name, register }) => (
  <div>
    <p className="text-sm font-medium text-on-surface mb-2">{label}</p>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="radio" value="true" {...register(name)} className="h-4 w-4 text-primary" />
        Yes
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="radio" value="false" {...register(name)} className="h-4 w-4 text-primary" />
        No
      </label>
    </div>
  </div>
);

export default RecordVisitPage;