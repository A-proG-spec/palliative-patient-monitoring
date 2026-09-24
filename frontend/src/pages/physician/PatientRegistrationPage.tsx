import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPatientSchema, type CreatePatientFormData } from '@/schemas/patient.schema';
import { useRegisterPatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';

// ─────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card padding="lg">
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const mutation = useRegisterPatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      sex: 'Female',
      diseaseStage: 'Advanced',
      estimatedPrognosis: 'Months',
      secondaryDiagnoses: [],
      comorbidities: [],
    },
  });

  // ── Live reads for the two array fields, so the textarea stays in
  //    sync with form state after any programmatic change.
  const secondaryDiagnosesValue = (watch('secondaryDiagnoses') ?? []).join(', ');
  const comorbiditiesValue = (watch('comorbidities') ?? []).join(', ');

  const onSubmit = (data: CreatePatientFormData) => {
    mutation.mutate(data, {
      onSuccess: (patient) => navigate(`/patients/${patient.id}`),
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Registration failed.';
        setError('root', { message: msg });
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton to="/patients" label="Patients" />
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Register New Patient</h1>
          <p className="text-sm text-text-secondary">
            Fill in all required information. Fields marked{' '}
            <span className="text-error">*</span> are required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && (
          <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error">
            {errors.root.message}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            Personal Information
        ═══════════════════════════════════════════════════════ */}
        <Section title="Personal Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name *"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Age *"
              type="number"
              error={errors.age?.message}
              {...register('age')}
            />
            <Select
              label="Sex *"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              error={errors.sex?.message}
              {...register('sex')}
            />
            <Input
              label="Date of Birth *"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
          </div>

          <Input
            label="Address (Kebele/Sub-city) *"
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="+251911234567"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* ── Hospital Patient ID (optional) ── */}
          <Input
            label="Hospital Patient ID / MRN"
            placeholder="e.g. Y12-12345"
            hint="Optional. Only set if the patient already has a hospital record number."
            error={errors.hospitalPatientId?.message}
            {...register('hospitalPatientId')}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            Emergency Contact
        ═══════════════════════════════════════════════════════ */}
        <Section title="Emergency Contact">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Contact Name *"
              error={errors.emergencyContactName?.message}
              {...register('emergencyContactName')}
            />
            <Input
              label="Contact Phone *"
              type="tel"
              error={errors.emergencyContactPhone?.message}
              {...register('emergencyContactPhone')}
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════
            Caregiver Information
        ═══════════════════════════════════════════════════════ */}
        <Section title="Caregiver Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Caregiver Name *"
              error={errors.caregiverName?.message}
              {...register('caregiverName')}
            />
            <Input
              label="Caregiver Phone *"
              type="tel"
              error={errors.caregiverPhone?.message}
              {...register('caregiverPhone')}
            />
          </div>
          <Input
            label="Caregiver Relation"
            placeholder="e.g. Daughter, Spouse, Sister"
            error={errors.caregiverRelation?.message}
            {...register('caregiverRelation')}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            Medical Information
        ═══════════════════════════════════════════════════════ */}
        <Section title="Medical Information">
          <Input
            label="Primary Diagnosis *"
            placeholder="e.g. Stage IV Breast Cancer"
            error={errors.primaryDiagnosis?.message}
            {...register('primaryDiagnosis')}
          />

          {/* ── Secondary diagnoses — actually writes back to form state ── */}
          <Input
            label="Secondary Diagnoses"
            placeholder="e.g. Anaemia, Hypertension"
            hint="Separate multiple diagnoses with commas. Leave blank if none."
            value={secondaryDiagnosesValue}
            onChange={(e) => {
              const vals = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              setValue('secondaryDiagnoses', vals, {
                shouldDirty: true,
                shouldValidate: false,
              });
            }}
            error={errors.secondaryDiagnoses?.message}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Disease Stage *"
              options={[
                { value: 'Early', label: 'Early' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'EndStage', label: 'End Stage' },
              ]}
              error={errors.diseaseStage?.message}
              {...register('diseaseStage')}
            />
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
          </div>

          {/* ── Comorbidities — actually writes back to form state ── */}
          <Input
            label="Comorbidities"
            placeholder="e.g. Hypertension, Diabetes"
            hint="Separate with commas. Leave blank if none."
            value={comorbiditiesValue}
            onChange={(e) => {
              const vals = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              setValue('comorbidities', vals, {
                shouldDirty: true,
                shouldValidate: false,
              });
            }}
            error={errors.comorbidities?.message}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            Actions
        ═══════════════════════════════════════════════════════ */}
        <div className="flex gap-3 justify-end pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/patients')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Register Patient
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationPage;