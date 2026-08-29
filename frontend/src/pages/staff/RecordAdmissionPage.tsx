// src/pages/staff/RecordAdmissionPage.tsx
// Route: /patients/:patientId/admissions  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)
// Requires an accepted referral per spec (referralId is required).

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { useRecordAdmission } from '@/hooks/useAdmissions';
import { createAdmissionSchema, type CreateAdmissionFormData } from '@/schemas/admission.schema';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { getErrorMessage, todayISO, formatDate } from '@/lib/utils';
import {
  ROUTES,
  DISEASE_STAGE_ADMISSION_OPTIONS, PROGNOSIS_OPTIONS,
  FUNCTIONAL_STATUS_OPTIONS, PAIN_TYPE_OPTIONS,
  ADMISSION_EMOTIONAL_STATUS_OPTIONS, ADMISSION_FAMILY_SUPPORT_OPTIONS,
  SPIRITUAL_SUPPORT_OPTIONS, ADMISSION_SYMPTOMS_OPTIONS,
} from '@/constants';

export const RecordAdmissionPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(patientId!);
  const { data: referralsData } = usePatientReferrals(patientId!);
  const recordMutation = useRecordAdmission(patientId!);

  const acceptedReferrals = (referralsData?.items ?? []).filter((r) => r.status === 'Accepted');

  const {
    register, handleSubmit, control,
    formState: { errors }, setError,
  } = useForm<CreateAdmissionFormData>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: {
      admissionDate: todayISO(),
      diseaseStage: 'Advanced',
      estimatedPrognosis: 'Months',
      functionalStatus: 'PartiallyDependent',
      painType: 'Mixed',
      emotionalStatus: 'Stable',
      familySupport: 'Moderate',
      spiritualConcerns: false,
      homeBasedCareRequired: false,
      physiotherapyRequired: false,
      symptomsPresent: [],
      comorbidities: [],
      secondaryDiagnoses: [],
    },
  });

  if (pLoading) return <PageLoader />;
  if (pError || !patient) return <ErrorState />;

  const onSubmit = (data: CreateAdmissionFormData) => {
    recordMutation.mutate(data, {
      onSuccess: () => navigate(ROUTES.PATIENT_DETAIL(patientId!)),
      onError: (err) => setError('root', { message: getErrorMessage(err) }),
    });
  };

  const referralOptions = acceptedReferrals.map((r) => ({
    value: r.id,
    label: `${formatDate(r.referralDate)} — ${r.receivingFacility}`,
  }));

  return (
    <div className="max-w-container-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>← Back</Button>
        <h1 className="text-heading-1 text-on-surface">
          Record Hospital Admission — {patient.firstName} {patient.lastName}
        </h1>
      </div>

      {acceptedReferrals.length === 0 && (
        <div className="p-4 rounded-lg bg-warning-bg text-warning text-body-sm font-semibold">
          No accepted referrals found for this patient. A referral must be approved before recording an admission.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root && (
          <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{errors.root.message}</div>
        )}

        {/* Referral + Admission Date */}
        <Card>
          <CardHeader><CardTitle>Referral Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referralId" required>Referral</Label>
              <Select id="referralId" options={referralOptions} placeholder="Select accepted referral" error={!!errors.referralId} errorMessage={errors.referralId?.message} {...register('referralId')} />
            </div>
            <div>
              <Label htmlFor="admissionDate" required>Admission Date</Label>
              <Input id="admissionDate" type="date" error={!!errors.admissionDate} errorMessage={errors.admissionDate?.message} {...register('admissionDate')} />
            </div>
          </CardContent>
        </Card>

        {/* Bed & Ward */}
        <Card>
          <CardHeader><CardTitle>Bed & Ward Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['bedNumber', 'Bed Number'],
              ['ward', 'Ward'],
              ['admittingPhysician', 'Admitting Physician'],
              ['careTeam', 'Care Team'],
            ].map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={name} required>{label}</Label>
                <Input id={name} error={!!(errors as Record<string, unknown>)[name]} errorMessage={((errors as Record<string, {message?: string}>)[name])?.message} {...register(name as keyof CreateAdmissionFormData)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryDiagnosis" required>Primary Diagnosis</Label>
              <Input id="primaryDiagnosis" error={!!errors.primaryDiagnosis} errorMessage={errors.primaryDiagnosis?.message} {...register('primaryDiagnosis')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="diseaseStage" required>Disease Stage</Label>
                <Select id="diseaseStage" options={DISEASE_STAGE_ADMISSION_OPTIONS} {...register('diseaseStage')} />
              </div>
              <div>
                <Label htmlFor="estimatedPrognosis" required>Estimated Prognosis</Label>
                <Select id="estimatedPrognosis" options={PROGNOSIS_OPTIONS} {...register('estimatedPrognosis')} />
              </div>
              <div>
                <Label htmlFor="ppsScore" required>PPS Score (0–100)</Label>
                <Input id="ppsScore" type="number" min={0} max={100} error={!!errors.ppsScore} errorMessage={errors.ppsScore?.message} {...register('ppsScore', { valueAsNumber: true })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pain & Symptoms */}
        <Card>
          <CardHeader><CardTitle>Pain & Symptom Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="painScore" required>Pain Score (0–10)</Label>
                <Input id="painScore" type="number" min={0} max={10} error={!!errors.painScore} errorMessage={errors.painScore?.message} {...register('painScore', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="painType" required>Pain Type</Label>
                <Select id="painType" options={PAIN_TYPE_OPTIONS} {...register('painType')} />
              </div>
              <div>
                <Label htmlFor="functionalStatus" required>Functional Status</Label>
                <Select id="functionalStatus" options={FUNCTIONAL_STATUS_OPTIONS} {...register('functionalStatus')} />
              </div>
            </div>
            <div>
              <Label>Symptoms Present</Label>
              <Controller
                control={control}
                name="symptomsPresent"
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {ADMISSION_SYMPTOMS_OPTIONS.map((opt) => (
                      <Checkbox
                        key={opt.value}
                        id={`sym_${opt.value}`}
                        label={opt.label}
                        checked={(field.value ?? []).includes(opt.value)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(field.value ?? []), opt.value]
                            : (field.value ?? []).filter((v) => v !== opt.value);
                          field.onChange(next);
                        }}
                      />
                    ))}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Psychosocial & Spiritual */}
        <Card>
          <CardHeader><CardTitle>Psychosocial & Spiritual Assessment</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emotionalStatus" required>Emotional Status</Label>
              <Select id="emotionalStatus" options={ADMISSION_EMOTIONAL_STATUS_OPTIONS} {...register('emotionalStatus')} />
            </div>
            <div>
              <Label htmlFor="familySupport" required>Family Support</Label>
              <Select id="familySupport" options={ADMISSION_FAMILY_SUPPORT_OPTIONS} {...register('familySupport')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="socialChallenges">Social Challenges</Label>
              <Textarea id="socialChallenges" rows={2} {...register('socialChallenges')} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Checkbox id="spiritualConcerns" label="Spiritual Concerns Present" {...register('spiritualConcerns')} />
              <div>
                <Label htmlFor="spiritualSupportPreferred">Spiritual Support Preferred</Label>
                <Select id="spiritualSupportPreferred" options={SPIRITUAL_SUPPORT_OPTIONS} placeholder="Select if applicable" {...register('spiritualSupportPreferred')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initial Care Plan */}
        <Card>
          <CardHeader><CardTitle>Initial Care Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['painManagementPlan', 'Pain Management Plan'],
              ['medicationPlan', 'Medication Plan'],
              ['nursingCarePlan', 'Nursing Care Plan'],
              ['psychosocialSupportPlan', 'Psychosocial Support Plan'],
            ].map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={name} required={name !== 'psychosocialSupportPlan'}>{label}</Label>
                <Textarea id={name} rows={2} error={!!(errors as Record<string, unknown>)[name]} errorMessage={((errors as Record<string, {message?: string}>)[name])?.message} {...register(name as keyof CreateAdmissionFormData)} />
              </div>
            ))}
            <div className="flex gap-6">
              <Checkbox id="homeBasedCareRequired" label="Home-Based Care Required" {...register('homeBasedCareRequired')} />
              <Checkbox id="physiotherapyRequired" label="Physiotherapy Required" {...register('physiotherapyRequired')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>Cancel</Button>
            <Button type="submit" variant="primary" loading={recordMutation.isPending} disabled={acceptedReferrals.length === 0}>
              Record Admission
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
