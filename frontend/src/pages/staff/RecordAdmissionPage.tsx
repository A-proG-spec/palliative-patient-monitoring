import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdmissionSchema, type CreateAdmissionFormData } from '@/schemas/admission.schema';
import { useRecordAdmission } from '@/hooks/useAdmissions';
import { usePatient } from '@/hooks/usePatients';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { SYMPTOM_LABELS } from '@/constants';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card padding="lg">
    <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const RecordAdmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data: refData } = usePatientReferrals(id!, { status: 'Accepted' });
  const mutation = useRecordAdmission(id!);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateAdmissionFormData>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: {
      admissionDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced', estimatedPrognosis: 'Months',
      functionalStatus: 'PartiallyDependent', painScore: 5, painType: 'Mixed',
      emotionalStatus: 'Stable', familySupport: 'Moderate',
      spiritualConcerns: false, homeBasedCareRequired: false, physiotherapyRequired: false,
      symptomsPresent: [], secondaryDiagnoses: [], comorbidities: [],
    },
  });

  const onSubmit = (data: CreateAdmissionFormData) => {
    mutation.mutate(data, { onSuccess: () => navigate(`/patients/${id}`) });
  };

  if (pLoading) return <PageLoader />;

  const acceptedReferrals = refData?.items || [];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Record Hospital Admission</h1>
          {patient && <p className="text-sm text-text-secondary">{patient.firstName} {patient.lastName}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Section title="Referral & Admission Details">
          <Select label="Linked Referral" options={acceptedReferrals.map((r) => ({ value: r.id, label: `${r.referralType} · ${r.referringFacility} · ${new Date(r.referralDate).toLocaleDateString()}` }))} placeholder="Select accepted referral…" error={errors.referralId?.message} {...register('referralId')} />
          <Input label="Admission Date" type="date" error={errors.admissionDate?.message} {...register('admissionDate')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Bed Number" error={errors.bedNumber?.message} {...register('bedNumber')} />
            <Input label="Ward" error={errors.ward?.message} {...register('ward')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Admitting Physician" error={errors.admittingPhysician?.message} {...register('admittingPhysician')} />
            <Input label="Care Team" error={errors.careTeam?.message} {...register('careTeam')} />
          </div>
        </Section>

        <Section title="Medical Diagnosis">
          <Input label="Primary Diagnosis" error={errors.primaryDiagnosis?.message} {...register('primaryDiagnosis')} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Disease Stage" options={[{ value: 'Early', label: 'Early' }, { value: 'Advanced', label: 'Advanced' }, { value: 'Terminal', label: 'Terminal' }]} {...register('diseaseStage')} />
            <Select label="Prognosis" options={[{ value: 'Days', label: 'Days' }, { value: 'Weeks', label: 'Weeks' }, { value: 'Months', label: 'Months' }, { value: 'Uncertain', label: 'Uncertain' }]} {...register('estimatedPrognosis')} />
            <Input label="PPS Score (%)" type="number" min={0} max={100} {...register('ppsScore')} />
          </div>
          <Select label="Functional Status" options={[{ value: 'FullyIndependent', label: 'Fully Independent' }, { value: 'PartiallyDependent', label: 'Partially Dependent' }, { value: 'FullyDependent', label: 'Fully Dependent' }]} {...register('functionalStatus')} />
        </Section>

        <Section title="Pain & Symptoms">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Pain Score (0–10)" type="number" min={0} max={10} {...register('painScore')} />
            <Select label="Pain Type" options={[{ value: 'Acute', label: 'Acute' }, { value: 'Chronic', label: 'Chronic' }, { value: 'Neuropathic', label: 'Neuropathic' }, { value: 'Mixed', label: 'Mixed' }]} {...register('painType')} />
          </div>
          <p className="text-sm font-medium text-on-surface">Symptoms Present</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['Dyspnea','Nausea','Fatigue','Anxiety','Depression','Insomnia'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={s} {...register('symptomsPresent')} className="h-4 w-4 rounded text-primary" />
                {s}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Psychosocial & Spiritual">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Emotional Status" options={[{ value: 'Stable', label: 'Stable' }, { value: 'Anxious', label: 'Anxious' }, { value: 'Depressed', label: 'Depressed' }, { value: 'Distressed', label: 'Distressed' }]} {...register('emotionalStatus')} />
            <Select label="Family Support" options={[{ value: 'Strong', label: 'Strong' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Weak', label: 'Weak' }, { value: 'None', label: 'None' }]} {...register('familySupport')} />
          </div>
          <Textarea label="Social Challenges" rows={2} {...register('socialChallenges')} />
          <Checkbox label="Spiritual Concerns Identified" {...register('spiritualConcerns')} />
        </Section>

        <Section title="Initial Care Plan">
          <Textarea label="Pain Management Plan" rows={2} error={errors.painManagementPlan?.message} {...register('painManagementPlan')} />
          <Textarea label="Medication Plan" rows={2} error={errors.medicationPlan?.message} {...register('medicationPlan')} />
          <Textarea label="Nursing Care Plan" rows={2} error={errors.nursingCarePlan?.message} {...register('nursingCarePlan')} />
          <Textarea label="Psychosocial Support Plan" rows={2} {...register('psychosocialSupportPlan')} />
          <div className="flex gap-4">
            <Checkbox label="Home-Based Care Required" {...register('homeBasedCareRequired')} />
            <Checkbox label="Physiotherapy Required" {...register('physiotherapyRequired')} />
          </div>
        </Section>

        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Record Admission</Button>
        </div>
      </form>
    </div>
  );
};

export default RecordAdmissionPage;
