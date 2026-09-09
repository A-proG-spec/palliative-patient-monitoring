import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReferralSchema, type CreateReferralFormData } from '@/schemas/referral.schema';
import { useRequestReferral } from '@/hooks/useReferrals';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';  // <-- ADD THIS LINE
import { REFERRAL_REASON_LABELS, DISEASE_STAGE_LABELS } from '@/constants';
// ── Form Section ──────────────────────────────────────────────────
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card padding="lg">
    <CardHeader>
      <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</CardTitle>
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
      <label key={value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
        <input type="checkbox" value={value} {...register(name)} className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary" />
        {labels[value] || value}
      </label>
    ))}
  </div>
);

const RequestReferralPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!, { limit: 1 });
  const latestVisit = visitsData?.items?.[0];
  const mutation = useRequestReferral(id!);
  const user = useAuthStore((s) => s.user);
  const latestPPS = latestVisit?.ppsScore || 0;
  const latestKPS = latestVisit?.kpsScore || 0;

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateReferralFormData>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      referralType: 'Outgoing',
      referralDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced',
      ppsScore: latestPPS,
      kpsScore: latestKPS,
      currentSymptoms: { pain: 0, dyspnea: 0, fatigue: 0, anxiety: 0, depression: 0 },
      reasons: [],
      referringFacility: 'Y12HMC Home Care Unit',
      preparedBy: user?.name || '',
      preparedByDesignation: user?.role || '',
      signature: user?.name || '',
    },
  });

  const onSubmit = (data: CreateReferralFormData) => {
    mutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (pLoading) return <PageLoader />;

  const isSubmitting = mutation.isPending;

  // Symptom score options (0-10)
  const symptomOptions = Array.from({ length: 11 }, (_, i) => ({
    value: String(i),
    label: String(i),
  }));

  return (
    <div className="max-w-3xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">PALLIATIVE PATIENT REFERRAL FORM</h1>
          <p className="text-sm text-text-secondary">Yekatit 12 Hospital Medical College (Y12HMC)</p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* ── Referral Information ── */}
        <FormSection title="Referral Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Date of Referral"
              type="date"
              error={errors.referralDate?.message}
              {...register('referralDate')}
            />
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Referral Type</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="Incoming" {...register('referralType')} className="h-4 w-4 text-primary" />
                  Incoming Referral
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="Outgoing" {...register('referralType')} className="h-4 w-4 text-primary" />
                  Outgoing Referral
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        {/* ── Patient Information ── */}
        <FormSection title="Patient Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Patient ID" value={patient?.patientDisplayId || '—'} disabled />
            <Input label="Full Name" value={patient ? `${patient.firstName} ${patient.lastName}` : '—'} disabled />
            <Input label="Age" value={patient?.age ? `${patient.age} years` : '—'} disabled />
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Sex</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={patient?.sex === 'Male'} disabled className="h-4 w-4" />
                  Male
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={patient?.sex === 'Female'} disabled className="h-4 w-4" />
                  Female
                </label>
              </div>
            </div>
            <Input label="Address" value={patient?.address || '—'} disabled className="sm:col-span-2" />
            <Input label="Phone" value={patient?.phone || '—'} disabled />
            <Input label="Caregiver Name" value={patient?.caregiverName || '—'} disabled />
            <Input label="Caregiver Phone" value={patient?.caregiverPhone || '—'} disabled />
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
            <p className="text-sm font-medium text-on-surface mb-2">Disease Stage</p>
            <div className="grid grid-cols-3 gap-2">
              {['Early', 'Advanced', 'EndStage'].map((stage) => (
                <label key={stage} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value={stage} {...register('diseaseStage')} className="h-4 w-4 text-primary" />
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
              value={latestPPS || ''}
              disabled={!!latestVisit}
              hint={latestVisit ? `From last visit: ${formatDate(latestVisit.visitDate)}` : 'No previous visit found'}
              {...register('ppsScore')}
            />
            <Input
              label="KPS Score (/100)"
              type="number"
              min={0}
              max={100}
              value={latestKPS || ''}
              disabled={!!latestVisit}
              hint={latestVisit ? `From last visit: ${formatDate(latestVisit.visitDate)}` : 'No previous visit found'}
              {...register('kpsScore')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Current Symptoms (Score 0–10)</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {(['pain', 'dyspnea', 'fatigue', 'anxiety', 'depression'] as const).map((symptom) => (
                <Select
                  key={symptom}
                  label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                  options={symptomOptions}
                  {...register(`currentSymptoms.${symptom}`)}
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
            <p className="text-xs text-error mt-1">{errors.reasons.message}</p>
          )}
          <div className="mt-2">
            <Input
              label="Other (please specify)"
              placeholder="Specify other reason..."
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

        {/* ── Staff Documentation ── */}
        <FormSection title="Staff Documentation">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Prepared By"
              placeholder="Full name"
              error={errors.preparedBy?.message}
              {...register('preparedBy')}
            />
            <Input
              label="Designation"
              placeholder="e.g., Physician, Nurse"
              error={errors.preparedByDesignation?.message}
              {...register('preparedByDesignation')}
            />
            <Input
              label="Signature"
              placeholder="Full name"
              error={errors.signature?.message}
              {...register('signature')}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={new Date().toISOString().split('T')[0]}
            disabled
          />
        </FormSection>

        {/* ── Submit Buttons ── */}
        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestReferralPage;