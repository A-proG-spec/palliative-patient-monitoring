import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderLab } from '@/hooks/useLabs';
import { usePatient } from '@/hooks/usePatients';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  createLabSchema,
  type CreateLabFormData,
} from '@/schemas/lab.schema';

// ── Form Section ──────────────────────────────────────────────────
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
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

const OrderLabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const orderMutation = useOrderLab(id!);
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateLabFormData>({
    resolver: zodResolver(createLabSchema),
    defaultValues: {
      category: 'Hematology',
      priority: 'Routine',
      dateOrdered: new Date().toISOString().split('T')[0],
      collectionDate: new Date().toISOString().split('T')[0],
      collectionTime: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      location: 'Home',
      physicianRequester: user?.name || '',
      wardClinic: '',
      contactExtension: '',
      testName: '',
      otherText: '',
      specimenType: '',
      specimenSite: '',
      clinicalHistory: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedTestName = watch('testName');

  // ── Test options by category — matches backend categories ──
  const getTestOptions = (category: string) => {
    const options: Record<string, { value: string; label: string }[]> = {
      Hematology: [
        { value: 'CBC', label: 'Complete Blood Count (CBC)' },
        { value: 'Hemoglobin', label: 'Hemoglobin' },
        { value: 'Hematocrit', label: 'Hematocrit' },
        { value: 'ESR', label: 'ESR' },
        { value: 'Blood Film', label: 'Peripheral Blood Film' },
        { value: 'Reticulocyte', label: 'Reticulocyte Count' },
        { value: 'Blood Group', label: 'Blood Group & Rh' },
        { value: 'PT/INR', label: 'PT/INR' },
        { value: 'aPTT', label: 'aPTT' },
      ],
      Chemistry: [
        { value: 'Glucose', label: 'Blood Glucose' },
        { value: 'Urea', label: 'Urea' },
        { value: 'Creatinine', label: 'Creatinine' },
        { value: 'Electrolytes', label: 'Electrolytes' },
        { value: 'LFT', label: 'Liver Function Tests' },
        { value: 'Lipid Profile', label: 'Lipid Profile' },
        { value: 'Cardiac Enzymes', label: 'Cardiac Enzymes/Markers' },
        { value: 'Calcium', label: 'Calcium/Phosphate' },
        { value: 'Uric Acid', label: 'Uric Acid' },
        { value: 'Proteins', label: 'Proteins/Albumin' },
      ],
      Hormone: [
        { value: 'TSH', label: 'TSH' },
        { value: 'Free T3/T4', label: 'Free T3 / Free T4' },
        { value: 'FSH/LH', label: 'FSH / LH' },
        { value: 'Prolactin', label: 'Prolactin' },
        { value: 'Cortisol', label: 'Cortisol' },
        { value: 'Testosterone', label: 'Testosterone' },
        { value: 'Estradiol', label: 'Estradiol' },
        { value: 'Progesterone', label: 'Progesterone' },
        { value: 'β-hCG', label: 'β-hCG' },
      ],
      Urinalysis: [
        { value: 'Routine Urinalysis', label: 'Routine Urinalysis' },
        { value: 'Urine Microscopy', label: 'Urine Microscopy' },
        { value: 'Urine Pregnancy', label: 'Urine Pregnancy Test' },
        { value: 'Urine Culture', label: 'Urine Culture' },
        { value: '24-Hour Urine', label: '24-Hour Urine Test' },
      ],
      Stool: [
        { value: 'Routine Stool', label: 'Routine Stool Examination' },
        { value: 'Occult Blood', label: 'Occult Blood' },
        { value: 'Ova & Parasite', label: 'Ova & Parasite Examination' },
        { value: 'Stool Culture', label: 'Stool Culture' },
      ],
      Microbiology: [
        { value: 'Blood Culture', label: 'Blood Culture' },
        { value: 'Urine Culture', label: 'Urine Culture' },
        { value: 'Stool Culture', label: 'Stool Culture' },
        { value: 'Sputum Culture', label: 'Sputum Examination/Culture' },
        { value: 'Wound Culture', label: 'Wound/Swab Culture' },
        { value: 'Gram Stain', label: 'Gram Stain' },
        { value: 'AFB', label: 'AFB Examination' },
        { value: 'Fungal', label: 'Fungal Examination' },
        {
          value: 'Antimicrobial Susceptibility',
          label: 'Antimicrobial Susceptibility Testing',
        },
      ],
      Histopathology: [
        { value: 'Histopathology', label: 'Histopathological Examination' },
        { value: 'Biopsy', label: 'Biopsy Examination' },
        { value: 'FNAC', label: 'Fine-Needle Aspiration Cytology (FNAC)' },
        { value: 'Pap Smear', label: 'Pap Smear/Cervical Cytology' },
        { value: 'Body Fluid Cytology', label: 'Body Fluid Cytology' },
      ],
      Immunology: [
        { value: 'HIV', label: 'HIV Testing' },
        { value: 'Hepatitis B', label: 'Hepatitis B Testing' },
        { value: 'Hepatitis C', label: 'Hepatitis C Testing' },
        { value: 'Syphilis', label: 'Syphilis Testing' },
        { value: 'Pregnancy', label: 'Pregnancy Test' },
        { value: 'CRP', label: 'CRP' },
        { value: 'Rheumatoid Factor', label: 'Rheumatoid Factor' },
      ],
      Cardiac: [
        { value: 'Troponin I/T', label: 'Troponin I/T' },
        { value: 'CK-MB', label: 'CK-MB' },
        { value: 'BNP', label: 'BNP / NT-proBNP' },
      ],
    };
    return options[category] || [];
  };

  const onSubmit = (data: CreateLabFormData) => {
    const derivedLocation: 'Home' | 'Hospital' =
      patient?.currentLocation === 'ReferredHospital' ? 'Hospital' : 'Home';

    const payload = {
      ...data,
      location: derivedLocation,
      wardClinic:
        data.wardClinic?.trim() ||
        (derivedLocation === 'Hospital'
          ? 'Palliative Care Ward'
          : 'Home Care Unit'),
      testName:
        data.testName === 'Other' && data.otherText
          ? data.otherText.trim()
          : data.testName,
    };

    // Remove empty optional fields
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v === '' || v === undefined || v === null) continue;
      cleaned[k] = v;
    }

    orderMutation.mutate(cleaned as any, {
      onSuccess: () => {
        toast.success(
          'Lab test ordered successfully. You can record the result from the test detail page.',
        );
        navigate(`/patients/${id}`);
      },
    });
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            CLINICAL LABORATORY ORDER FORM
          </h1>
          <p className="text-sm text-text-secondary">
            Yekatit 12 Hospital Medical College (Y12HMC)
          </p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} ·{' '}
              {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* ── 1. Patient Information (Auto-filled) ── */}
        <FormSection title="1. Patient Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              value={
                patient ? `${patient.firstName} ${patient.lastName}` : '—'
              }
              disabled
            />
            <Input
              label="Age"
              value={patient?.age ? `${patient.age} years` : '—'}
              disabled
            />
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Sex</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={patient?.sex === 'Male'}
                    disabled
                    className="h-4 w-4"
                  />
                  Male
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={patient?.sex === 'Female'}
                    disabled
                    className="h-4 w-4"
                  />
                  Female
                </label>
              </div>
            </div>
            <Input
              label="Date of Birth"
              value={
                patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : '—'
              }
              disabled
            />
          </div>
        </FormSection>

        {/* ── 2. Order Details ── */}
        <FormSection title="2. Laboratory Investigations Requested">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Ward / Clinic"
              placeholder="e.g. Palliative Care Ward"
              error={errors.wardClinic?.message}
              {...register('wardClinic')}
            />
            <Input
              label="Physician / Requester *"
              placeholder="Full name"
              error={errors.physicianRequester?.message}
              {...register('physicianRequester')}
            />
            <Input
              label="Contact / Extension"
              placeholder="e.g. 1234"
              error={errors.contactExtension?.message}
              {...register('contactExtension')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Test Category
            </p>
            <Select
              options={[
                { value: 'Hematology', label: 'A. Hematology' },
                { value: 'Chemistry', label: 'B. Clinical Chemistry' },
                { value: 'Hormone', label: 'C. Hormone / Endocrine Tests' },
                { value: 'Urinalysis', label: 'D. Urinalysis' },
                { value: 'Stool', label: 'E. Stool Examination' },
                { value: 'Microbiology', label: 'F. Microbiology' },
                {
                  value: 'Histopathology',
                  label: 'G. Histopathology / Cytology',
                },
                { value: 'Immunology', label: 'H. Immunology / Serology' },
                { value: 'Cardiac', label: 'I. Cardiac Biomarkers' },
              ]}
              error={errors.category?.message}
              {...register('category')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Test Name
            </p>
            <Select
              options={[
                ...getTestOptions(selectedCategory),
                { value: 'Other', label: 'Other (specify below)' },
              ]}
              error={errors.testName?.message}
              {...register('testName')}
            />
          </div>

          {selectedTestName === 'Other' && (
            <Input
              label="Specify Other Test"
              placeholder="Enter test name"
              error={errors.otherText?.message}
              {...register('otherText')}
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Specimen Type"
              placeholder="e.g., Blood, Urine, Stool"
              error={errors.specimenType?.message}
              {...register('specimenType')}
            />
            <Input
              label="Specimen Site"
              placeholder="e.g., Venous, Finger stick"
              error={errors.specimenSite?.message}
              {...register('specimenSite')}
            />
          </div>

          <Textarea
            label="Clinical History / Reason for Test"
            rows={3}
            error={errors.clinicalHistory?.message}
            {...register('clinicalHistory')}
          />

          <Select
            label="Priority"
            options={[
              { value: 'Routine', label: 'Routine' },
              { value: 'Urgent', label: 'Urgent' },
              { value: 'Emergency', label: 'Emergency' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </FormSection>

        {/* ── 3. Collection Details ── */}
        <FormSection title="3. Collection & Submission">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Date Ordered"
              type="date"
              error={errors.dateOrdered?.message}
              {...register('dateOrdered')}
            />
            <Input
              label="Collection Date"
              type="date"
              error={errors.collectionDate?.message}
              {...register('collectionDate')}
            />
            <Input
              label="Collection Time"
              type="time"
              error={errors.collectionTime?.message}
              {...register('collectionTime')}
            />
          </div>
        </FormSection>

        {/* ── Submit ── */}
        <div className="flex gap-3 justify-end pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/patients/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={orderMutation.isPending}>
            {orderMutation.isPending ? 'Ordering…' : 'Order Lab Test'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderLabPage;