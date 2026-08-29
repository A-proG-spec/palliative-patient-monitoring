// src/pages/staff/RequestReferralPage.tsx
// Route: /patients/:patientId/referrals  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useRequestReferral } from '@/hooks/useReferrals';
import { useAuthStore } from '@/store/auth.store';
import { createReferralSchema, type CreateReferralFormData } from '@/schemas/referral.schema';
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
  ROUTES, REFERRAL_TYPE_OPTIONS, DISEASE_STAGE_OPTIONS,
  REFERRAL_REASON_OPTIONS,
} from '@/constants';

export const RequestReferralPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(patientId!);
  const requestMutation = useRequestReferral(patientId!);

  const {
    register, handleSubmit, control,
    formState: { errors }, setError,
  } = useForm<CreateReferralFormData>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      referralType: 'Outgoing',
      referralDate: todayISO(),
      diseaseStage: 'Advanced',
      currentSymptoms: { pain: 0, dyspnea: 0, fatigue: 0, anxiety: 0, depression: 0 },
      reasons: [],
      preparedBy: user?.name ?? '',
      preparedByDesignation: user?.role ?? '',
      signature: user?.name ?? '',
    },
  });

  if (pLoading) return <PageLoader />;
  if (pError || !patient) return <ErrorState />;

  const onSubmit = (data: CreateReferralFormData) => {
    requestMutation.mutate(data, {
      onSuccess: () => navigate(ROUTES.PATIENT_DETAIL(patientId!)),
      onError: (err) => setError('root', { message: getErrorMessage(err) }),
    });
  };

  const symptomField = (name: keyof CreateReferralFormData['currentSymptoms'], label: string) => (
    <div key={name}>
      <Label htmlFor={`cs_${name}`}>{label} (0–10)</Label>
      <Input
        id={`cs_${name}`}
        type="number"
        min={0}
        max={10}
        {...register(`currentSymptoms.${name}` as const, { valueAsNumber: true })}
      />
    </div>
  );

  return (
    <div className="max-w-container-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>← Back</Button>
        <h1 className="text-heading-1 text-on-surface">
          Request Referral — {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root && (
          <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{errors.root.message}</div>
        )}

        {/* Referral Information */}
        <Card>
          <CardHeader><CardTitle>Referral Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referralType" required>Referral Type</Label>
              <Select id="referralType" options={REFERRAL_TYPE_OPTIONS} {...register('referralType')} />
            </div>
            <div>
              <Label htmlFor="referralDate" required>Referral Date</Label>
              <Input id="referralDate" type="date" error={!!errors.referralDate} errorMessage={errors.referralDate?.message} {...register('referralDate')} />
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader><CardTitle>Clinical Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryDiagnosis" required>Primary Diagnosis</Label>
              <Input id="primaryDiagnosis" error={!!errors.primaryDiagnosis} errorMessage={errors.primaryDiagnosis?.message} {...register('primaryDiagnosis')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="diseaseStage" required>Disease Stage</Label>
                <Select id="diseaseStage" options={DISEASE_STAGE_OPTIONS} error={!!errors.diseaseStage} errorMessage={errors.diseaseStage?.message} {...register('diseaseStage')} />
              </div>
              <div>
                <Label htmlFor="ppsScore" required>PPS Score (0–100)</Label>
                <Input id="ppsScore" type="number" min={0} max={100} error={!!errors.ppsScore} errorMessage={errors.ppsScore?.message} {...register('ppsScore', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="kpsScore" required>KPS Score (0–100)</Label>
                <Input id="kpsScore" type="number" min={0} max={100} error={!!errors.kpsScore} errorMessage={errors.kpsScore?.message} {...register('kpsScore', { valueAsNumber: true })} />
              </div>
            </div>
            <p className="text-body-sm font-semibold text-on-surface">Current Symptom Scores</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['pain', 'dyspnea', 'fatigue', 'anxiety', 'depression'] as const).map((s) =>
                symptomField(s, s.charAt(0).toUpperCase() + s.slice(1))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Reasons for Referral</CardTitle>
            {errors.reasons && <p className="text-body-sm text-error mt-1">{errors.reasons.message}</p>}
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="reasons"
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REFERRAL_REASON_OPTIONS.map((opt) => (
                    <Checkbox
                      key={opt.value}
                      id={`reason_${opt.value}`}
                      label={opt.label}
                      checked={field.value.includes(opt.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...field.value, opt.value]
                          : field.value.filter((v) => v !== opt.value);
                        field.onChange(next);
                      }}
                    />
                  ))}
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Referral Details */}
        <Card>
          <CardHeader><CardTitle>Referral Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['referringFacility', 'Referring Facility'],
              ['receivingFacility', 'Receiving Facility'],
              ['contactPerson', 'Contact Person'],
              ['contactNumber', 'Contact Number'],
            ].map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={name} required>{label}</Label>
                <Input id={name} error={!!(errors as Record<string, unknown>)[name]} errorMessage={((errors as Record<string, {message?: string}>)[name])?.message} {...register(name as keyof CreateReferralFormData)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Staff Documentation */}
        <Card>
          <CardHeader><CardTitle>Staff Documentation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preparedBy" required>Prepared By</Label>
              <Input id="preparedBy" error={!!errors.preparedBy} errorMessage={errors.preparedBy?.message} {...register('preparedBy')} />
            </div>
            <div>
              <Label htmlFor="preparedByDesignation" required>Designation</Label>
              <Input id="preparedByDesignation" error={!!errors.preparedByDesignation} errorMessage={errors.preparedByDesignation?.message} {...register('preparedByDesignation')} />
            </div>
            <div>
              <Label htmlFor="signature" required>Signature</Label>
              <Input id="signature" error={!!errors.signature} errorMessage={errors.signature?.message} {...register('signature')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>Cancel</Button>
            <Button type="submit" variant="primary" loading={requestMutation.isPending}>Submit Referral</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
