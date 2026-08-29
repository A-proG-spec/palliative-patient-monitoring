// src/pages/staff/PatientRegistrationPage.tsx
// Route: /patients/new  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterPatient } from '@/hooks/usePatients';
import { createPatientSchema, type CreatePatientFormData } from '@/schemas/patient.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/utils';
import { ROUTES, SEX_OPTIONS, DISEASE_STAGE_OPTIONS, PROGNOSIS_OPTIONS } from '@/constants';

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterPatient();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      sex: 'Female',
      diseaseStage: 'Early',
      estimatedPrognosis: 'Months',
      secondaryDiagnoses: [],
      comorbidities: [],
      dateOfBirth: '',
    },
  });

  const {
    fields: secFields,
    append: secAppend,
    remove: secRemove,
  } = useFieldArray({ control, name: 'secondaryDiagnoses' as never });
  const {
    fields: coFields,
    append: coAppend,
    remove: coRemove,
  } = useFieldArray({ control, name: 'comorbidities' as never });

  const onSubmit = (data: CreatePatientFormData) => {
    setServerError('');
    registerMutation.mutate(data, {
      onSuccess: (patient) => navigate(ROUTES.PATIENT_DETAIL(patient.id)),
      onError: (err) => setServerError(getErrorMessage(err)),
    });
  };

  const field = (
    id: keyof CreatePatientFormData,
    label: string,
    type: string = 'text',
    required = true
  ) => (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input
        id={id}
        type={type}
        error={!!errors[id]}
        errorMessage={(errors[id] as { message?: string })?.message}
        {...register(id)}
      />
    </div>
  );

  return (
    <div className="max-w-container-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENTS)}>← Back</Button>
        <h1 className="text-heading-1 text-on-surface">Register New Patient</h1>
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('firstName', 'First Name')}
            {field('lastName', 'Last Name')}
            {field('age', 'Age', 'number')}
            <div>
              <Label htmlFor="sex" required>Sex</Label>
              <Select id="sex" options={SEX_OPTIONS} error={!!errors.sex} errorMessage={errors.sex?.message} {...register('sex')} />
            </div>
            {field('dateOfBirth', 'Date of Birth', 'date')}
            <div className="sm:col-span-2">{field('address', 'Address')}</div>
            {field('phone', 'Phone Number', 'tel')}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('emergencyContactName', 'Contact Name')}
            {field('emergencyContactPhone', 'Contact Phone', 'tel')}
          </CardContent>
        </Card>

        {/* Caregiver */}
        <Card>
          <CardHeader><CardTitle>Caregiver Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('caregiverName', 'Caregiver Name')}
            {field('caregiverPhone', 'Caregiver Phone', 'tel')}
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {field('primaryDiagnosis', 'Primary Diagnosis')}

            {/* Secondary Diagnoses */}
            <div>
              <Label>Secondary Diagnoses</Label>
              {(secFields as { id: string }[]).map((f, i) => (
                <div key={f.id} className="flex gap-2 mt-2">
                  <Input {...register(`secondaryDiagnoses.${i}` as const)} placeholder={`Secondary diagnosis ${i + 1}`} />
                  <Button type="button" variant="outline" size="sm" onClick={() => secRemove(i)}>✕</Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => secAppend('' as never)}>
                + Add Secondary Diagnosis
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="diseaseStage" required>Disease Stage</Label>
                <Select id="diseaseStage" options={DISEASE_STAGE_OPTIONS} error={!!errors.diseaseStage} errorMessage={errors.diseaseStage?.message} {...register('diseaseStage')} />
              </div>
              <div>
                <Label htmlFor="estimatedPrognosis" required>Estimated Prognosis</Label>
                <Select id="estimatedPrognosis" options={PROGNOSIS_OPTIONS} error={!!errors.estimatedPrognosis} errorMessage={errors.estimatedPrognosis?.message} {...register('estimatedPrognosis')} />
              </div>
            </div>

            {/* Comorbidities */}
            <div>
              <Label>Comorbidities</Label>
              {(coFields as { id: string }[]).map((f, i) => (
                <div key={f.id} className="flex gap-2 mt-2">
                  <Input {...register(`comorbidities.${i}` as const)} placeholder={`Comorbidity ${i + 1}`} />
                  <Button type="button" variant="outline" size="sm" onClick={() => coRemove(i)}>✕</Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => coAppend('' as never)}>
                + Add Comorbidity
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENTS)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={registerMutation.isPending}>
              Register Patient
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
