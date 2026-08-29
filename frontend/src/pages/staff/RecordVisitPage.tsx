// src/pages/staff/RecordVisitPage.tsx
// Route: /patients/:patientId/visits  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)
// Comprehensive home visit form — all sections per spec.

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useRecordVisit } from '@/hooks/useVisits';
import { createVisitSchema, type CreateVisitFormData } from '@/schemas/visit.schema';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { getErrorMessage, todayISO } from '@/lib/utils';
import {
  ROUTES,
  VISIT_TYPE_OPTIONS, OVERALL_STATUS_OPTIONS, MOBILITY_OPTIONS,
  ADL_OPTIONS, APPETITE_OPTIONS, ORAL_INTAKE_OPTIONS, HYDRATION_OPTIONS,
  EMOTIONAL_STATUS_OPTIONS, FAMILY_SUPPORT_OPTIONS, ADHERENCE_OPTIONS,
  CAREGIVER_BURDEN_OPTIONS, CAREGIVER_UNDERSTANDING_OPTIONS,
  CAREGIVING_CAPACITY_OPTIONS, FAMILY_EMOTIONAL_STATUS_OPTIONS,
  HOME_CONDITION_OPTIONS, VISIT_OUTCOME_OPTIONS,
  PAIN_LOCATION_OPTIONS, PAIN_CHARACTERISTICS_OPTIONS,
  SYMPTOMS_OPTIONS, HOME_OBSERVATIONS_OPTIONS,
  NURSING_CARE_OPTIONS, RED_FLAG_OPTIONS, REFERRALS_MADE_OPTIONS,
  EDUCATION_PROVIDED_OPTIONS,
} from '@/constants';

// Helper to render a multi-checkbox group
function CheckboxGroup({
  control, name, options,
}: {
  control: ReturnType<typeof useForm<CreateVisitFormData>>['control'];
  name: keyof CreateVisitFormData;
  options: { value: string; label: string }[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {options.map((opt) => (
            <Checkbox
              key={opt.value}
              id={`${String(name)}_${opt.value}`}
              label={opt.label}
              checked={Array.isArray(field.value) && (field.value as string[]).includes(opt.value)}
              onChange={(e) => {
                const current = Array.isArray(field.value) ? (field.value as string[]) : [];
                const next = e.target.checked
                  ? [...current, opt.value]
                  : current.filter((v) => v !== opt.value);
                field.onChange(next);
              }}
            />
          ))}
        </div>
      )}
    />
  );
}

export const RecordVisitPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(patientId!);
  const recordMutation = useRecordVisit(patientId!);

  const {
    register, handleSubmit, control,
    formState: { errors }, setError,
  } = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: todayISO(),
      visitType: 'Routine',
      overallStatus: 'Stable',
      mobility: 'Ambulatory',
      painScore: 0,
      painMedicationEffective: true,
      adl: {
        feeding: 'Independent', bathing: 'Independent',
        dressing: 'Independent', toileting: 'Independent', mobility: 'Independent',
      },
      ppsScore: 70, kpsScore: 70,
      appetite: 'Good', oralIntake: 'Adequate', hydrationStatus: 'Adequate',
      emotionalStatus: 'Stable', familySupport: 'Good',
      financialDifficulty: false, spiritualNeeds: false, religiousSupportRequested: false,
      medicationAvailable: true, medicationCorrectlyTaken: true,
      medicationSideEffects: false, medicationRefillNeeded: false, morphineAvailable: false,
      adherenceLevel: 'Good',
      caregiverBurden: 'Low', caregiverUnderstanding: 'Good',
      caregivingCapacity: 'Strong', familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
      teamMembers: [{ role: 'TeamLeader', name: '' }],
      teamLeaderId: '', physicianId: '', nurseId: '',
      painLocation: [], painCharacteristics: [], symptoms: [],
      homeObservations: [], nursingCareGiven: [], redFlags: ['None'],
      educationProvided: [], referralsMade: [], currentMedications: [],
    },
  });

  const { fields: tmFields, append: tmAppend, remove: tmRemove } = useFieldArray({ control, name: 'teamMembers' });
  const { fields: medFields, append: medAppend, remove: medRemove } = useFieldArray({ control, name: 'currentMedications' });

  if (pLoading) return <PageLoader />;
  if (pError || !patient) return <ErrorState />;

  const onSubmit = (data: CreateVisitFormData) => {
    // Cast vitals: schema allows optional sub-fields; API type requires them.
    // Only include vitals if at least one field is populated.
    const payload = {
      ...data,
      vitals:
        data.vitals &&
        (data.vitals.temperature || data.vitals.pulse || data.vitals.bp ||
          data.vitals.respiration || data.vitals.spo2)
          ? {
              temperature: data.vitals.temperature ?? 0,
              pulse: data.vitals.pulse ?? 0,
              bp: data.vitals.bp ?? '',
              respiration: data.vitals.respiration ?? 0,
              spo2: data.vitals.spo2 ?? 0,
            }
          : undefined,
    } as import('@/types/visit.types').CreateVisitRequest;

    recordMutation.mutate(payload, {
      onSuccess: () => navigate(ROUTES.PATIENT_DETAIL(patientId!)),
      onError: (err) => setError('root', { message: getErrorMessage(err) }),
    });
  };

  const adlFields = ['feeding', 'bathing', 'dressing', 'toileting', 'mobility'] as const;

  return (
    <div className="max-w-container-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>← Back</Button>
        <h1 className="text-heading-1 text-on-surface">
          Record Home Visit — {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root && (
          <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{errors.root.message}</div>
        )}

        {/* Visit Details */}
        <Card>
          <CardHeader><CardTitle>Visit Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="visitDate" required>Date</Label>
              <Input id="visitDate" type="date" error={!!errors.visitDate} errorMessage={errors.visitDate?.message} {...register('visitDate')} />
            </div>
            <div>
              <Label htmlFor="timeStarted" required>Time Started</Label>
              <Input id="timeStarted" type="time" error={!!errors.timeStarted} errorMessage={errors.timeStarted?.message} {...register('timeStarted')} />
            </div>
            <div>
              <Label htmlFor="timeEnded" required>Time Ended</Label>
              <Input id="timeEnded" type="time" error={!!errors.timeEnded} errorMessage={errors.timeEnded?.message} {...register('timeEnded')} />
            </div>
            <div>
              <Label htmlFor="visitType" required>Visit Type</Label>
              <Select id="visitType" options={VISIT_TYPE_OPTIONS} {...register('visitType')} />
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(tmFields as { id: string }[]).map((f, i) => (
              <div key={f.id} className="flex gap-2 items-start">
                <div className="w-40">
                  <Label htmlFor={`tm_role_${i}`}>Role</Label>
                  <Select id={`tm_role_${i}`} options={[
                    { value: 'TeamLeader', label: 'Team Leader' },
                    { value: 'Physician', label: 'Physician' },
                    { value: 'Nurse', label: 'Nurse' },
                  ]} {...register(`teamMembers.${i}.role`)} />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`tm_name_${i}`}>Name</Label>
                  <Input id={`tm_name_${i}`} placeholder="Staff name" {...register(`teamMembers.${i}.name`)} />
                </div>
                {tmFields.length > 1 && (
                  <Button type="button" variant="outline" size="sm" className="mt-6" onClick={() => tmRemove(i)}>✕</Button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => tmAppend({ role: 'Nurse', name: '' })}>
              + Add Team Member
            </Button>
          </CardContent>
        </Card>

        {/* Team Staff IDs */}
        <Card>
          <CardHeader><CardTitle>Team Staff IDs</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['teamLeaderId', 'Team Leader ID'], ['physicianId', 'Physician ID'], ['nurseId', 'Nurse ID']].map(([n, l]) => (
              <div key={n}>
                <Label htmlFor={n} required>{l}</Label>
                <Input id={n} error={!!(errors as Record<string, unknown>)[n]} errorMessage={((errors as Record<string, {message?: string}>)[n])?.message} {...register(n as keyof CreateVisitFormData)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* General Condition */}
        <Card>
          <CardHeader><CardTitle>Patient General Condition</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overallStatus" required>Overall Status</Label>
              <Select id="overallStatus" options={OVERALL_STATUS_OPTIONS} {...register('overallStatus')} />
            </div>
            <div>
              <Label htmlFor="mobility" required>Mobility</Label>
              <Select id="mobility" options={MOBILITY_OPTIONS} {...register('mobility')} />
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader><CardTitle>Vital Signs</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              ['vitals.temperature', 'Temperature (°C)', 'number'],
              ['vitals.pulse', 'Pulse (bpm)', 'number'],
              ['vitals.bp', 'BP (mmHg)', 'text'],
              ['vitals.respiration', 'Respiration', 'number'],
              ['vitals.spo2', 'SpO2 (%)', 'number'],
            ].map(([name, label, type]) => (
              <div key={String(name)}>
                <Label htmlFor={String(name)}>{String(label)}</Label>
                <Input id={String(name)} type={String(type)} step="0.1" placeholder="—" {...register(name as keyof CreateVisitFormData, type === 'number' ? { valueAsNumber: true } : {})} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pain Assessment */}
        <Card>
          <CardHeader><CardTitle>Pain Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="painScore" required>Pain Score (0–10)</Label>
                <Input id="painScore" type="number" min={0} max={10} error={!!errors.painScore} errorMessage={errors.painScore?.message} {...register('painScore', { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Checkbox id="painMedicationEffective" label="Pain Medication Effective" {...register('painMedicationEffective')} />
              </div>
            </div>
            <div>
              <Label>Pain Location</Label>
              <CheckboxGroup control={control} name="painLocation" options={PAIN_LOCATION_OPTIONS} />
            </div>
            <div>
              <Label>Pain Characteristics</Label>
              <CheckboxGroup control={control} name="painCharacteristics" options={PAIN_CHARACTERISTICS_OPTIONS} />
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader><CardTitle>Symptoms</CardTitle></CardHeader>
          <CardContent>
            <CheckboxGroup control={control} name="symptoms" options={SYMPTOMS_OPTIONS} />
          </CardContent>
        </Card>

        {/* Functional Status */}
        <Card>
          <CardHeader><CardTitle>Functional Status (ADL, PPS, KPS)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {adlFields.map((f) => (
                <div key={f}>
                  <Label htmlFor={`adl_${f}`} className="capitalize">{f}</Label>
                  <Select id={`adl_${f}`} options={ADL_OPTIONS} {...register(`adl.${f}`)} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ppsScore" required>PPS Score (0–100)</Label>
                <Input id="ppsScore" type="number" min={0} max={100} error={!!errors.ppsScore} errorMessage={errors.ppsScore?.message} {...register('ppsScore', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="kpsScore" required>KPS Score (0–100)</Label>
                <Input id="kpsScore" type="number" min={0} max={100} error={!!errors.kpsScore} errorMessage={errors.kpsScore?.message} {...register('kpsScore', { valueAsNumber: true })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition & Hydration */}
        <Card>
          <CardHeader><CardTitle>Nutrition & Hydration</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="appetite" required>Appetite</Label>
              <Select id="appetite" options={APPETITE_OPTIONS} {...register('appetite')} />
            </div>
            <div>
              <Label htmlFor="oralIntake" required>Oral Intake</Label>
              <Select id="oralIntake" options={ORAL_INTAKE_OPTIONS} {...register('oralIntake')} />
            </div>
            <div>
              <Label htmlFor="hydrationStatus" required>Hydration Status</Label>
              <Select id="hydrationStatus" options={HYDRATION_OPTIONS} {...register('hydrationStatus')} />
            </div>
          </CardContent>
        </Card>

        {/* Psychosocial & Spiritual */}
        <Card>
          <CardHeader><CardTitle>Psychosocial & Spiritual Assessment</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emotionalStatus" required>Emotional Status</Label>
              <Select id="emotionalStatus" options={EMOTIONAL_STATUS_OPTIONS} {...register('emotionalStatus')} />
            </div>
            <div>
              <Label htmlFor="familySupport" required>Family Support</Label>
              <Select id="familySupport" options={FAMILY_SUPPORT_OPTIONS} {...register('familySupport')} />
            </div>
            <div className="flex gap-6">
              <Checkbox id="financialDifficulty" label="Financial Difficulty" {...register('financialDifficulty')} />
              <Checkbox id="spiritualNeeds" label="Spiritual Needs" {...register('spiritualNeeds')} />
              <Checkbox id="religiousSupportRequested" label="Religious Support Requested" {...register('religiousSupportRequested')} />
            </div>
          </CardContent>
        </Card>

        {/* Medication Review */}
        <Card>
          <CardHeader><CardTitle>Medication Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Checkbox id="medicationAvailable" label="Available" {...register('medicationAvailable')} />
              <Checkbox id="medicationCorrectlyTaken" label="Correctly Taken" {...register('medicationCorrectlyTaken')} />
              <Checkbox id="medicationSideEffects" label="Side Effects" {...register('medicationSideEffects')} />
              <Checkbox id="medicationRefillNeeded" label="Refill Needed" {...register('medicationRefillNeeded')} />
              <Checkbox id="morphineAvailable" label="Morphine Available" {...register('morphineAvailable')} />
            </div>
            <div>
              <Label htmlFor="adherenceLevel" required>Adherence Level</Label>
              <Select id="adherenceLevel" options={ADHERENCE_OPTIONS} className="w-48" {...register('adherenceLevel')} />
            </div>
            <div>
              <Label>Current Medications</Label>
              {(medFields as { id: string }[]).map((f, i) => (
                <div key={f.id} className="grid grid-cols-4 gap-2 mt-2">
                  <Input placeholder="Name" {...register(`currentMedications.${i}.name`)} />
                  <Input placeholder="Dosage" {...register(`currentMedications.${i}.dosage`)} />
                  <Input placeholder="Frequency" {...register(`currentMedications.${i}.frequency`)} />
                  <div className="flex gap-1">
                    <Input placeholder="Route" {...register(`currentMedications.${i}.route`)} />
                    <Button type="button" variant="outline" size="sm" onClick={() => medRemove(i)}>✕</Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => medAppend({ name: '', dosage: '', frequency: '', route: '' })}>
                + Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Caregiver Assessment */}
        <Card>
          <CardHeader><CardTitle>Caregiver Assessment</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="caregiverBurden" required>Caregiver Burden</Label>
              <Select id="caregiverBurden" options={CAREGIVER_BURDEN_OPTIONS} {...register('caregiverBurden')} />
            </div>
            <div>
              <Label htmlFor="caregiverUnderstanding" required>Caregiver Understanding</Label>
              <Select id="caregiverUnderstanding" options={CAREGIVER_UNDERSTANDING_OPTIONS} {...register('caregiverUnderstanding')} />
            </div>
            <div>
              <Label htmlFor="caregivingCapacity" required>Caregiving Capacity</Label>
              <Select id="caregivingCapacity" options={CAREGIVING_CAPACITY_OPTIONS} {...register('caregivingCapacity')} />
            </div>
            <div>
              <Label htmlFor="familyEmotionalStatus" required>Family Emotional Status</Label>
              <Select id="familyEmotionalStatus" options={FAMILY_EMOTIONAL_STATUS_OPTIONS} {...register('familyEmotionalStatus')} />
            </div>
          </CardContent>
        </Card>

        {/* Education Provided */}
        <Card>
          <CardHeader><CardTitle>Education Provided</CardTitle></CardHeader>
          <CardContent>
            <CheckboxGroup control={control} name="educationProvided" options={EDUCATION_PROVIDED_OPTIONS} />
          </CardContent>
        </Card>

        {/* Home Environment */}
        <Card>
          <CardHeader><CardTitle>Home Environment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="homeCondition" required>Home Condition</Label>
              <Select id="homeCondition" options={HOME_CONDITION_OPTIONS} className="w-48" {...register('homeCondition')} />
            </div>
            <div>
              <Label>Home Observations</Label>
              <CheckboxGroup control={control} name="homeObservations" options={HOME_OBSERVATIONS_OPTIONS} />
            </div>
          </CardContent>
        </Card>

        {/* Nursing Care Provided */}
        <Card>
          <CardHeader><CardTitle>Nursing Care Provided</CardTitle></CardHeader>
          <CardContent>
            <CheckboxGroup control={control} name="nursingCareGiven" options={NURSING_CARE_OPTIONS} />
          </CardContent>
        </Card>

        {/* Red Flags */}
        <Card>
          <CardHeader><CardTitle>Red Flag Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <CheckboxGroup control={control} name="redFlags" options={RED_FLAG_OPTIONS} />
            <div>
              <Label htmlFor="redFlagActions">Action Taken (if red flags present)</Label>
              <Input id="redFlagActions" placeholder="Describe actions taken" {...register('redFlagActions')} />
            </div>
          </CardContent>
        </Card>

        {/* Referrals Made */}
        <Card>
          <CardHeader><CardTitle>Referrals Made</CardTitle></CardHeader>
          <CardContent>
            <CheckboxGroup control={control} name="referralsMade" options={REFERRALS_MADE_OPTIONS} />
          </CardContent>
        </Card>

        {/* Outcome & Follow-up */}
        <Card>
          <CardHeader><CardTitle>Outcome & Follow-up</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outcome" required>Outcome</Label>
              <Select id="outcome" options={VISIT_OUTCOME_OPTIONS} error={!!errors.outcome} errorMessage={errors.outcome?.message} {...register('outcome')} />
            </div>
            <div>
              <Label htmlFor="nextVisitDate">Next Visit Date</Label>
              <Input id="nextVisitDate" type="date" {...register('nextVisitDate')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>Cancel</Button>
            <Button type="submit" variant="primary" loading={recordMutation.isPending}>Save Visit</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
