import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderLab } from '@/hooks/useLabs';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { LabResultEntry } from '@/components/labs/LabResultEntry';

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
  options: { value: string; label: string }[];
  name: string;
  register: any;
  className?: string;
}> = ({ options, name, register, className }) => (
  <div className={cn('grid grid-cols-2 gap-2', className)}>
    {options.map((option) => (
      <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
        <input type="checkbox" value={option.value} {...register(name)} className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary" />
        {option.label}
      </label>
    ))}
  </div>
);

// ── Schema ────────────────────────────────────────────────────────
const orderLabSchema = z.object({
  // Patient Info (auto-filled)
  // Order Details
  testCategory: z.enum(['Hematology', 'Chemistry', 'Hormone', 'Urinalysis', 'Stool', 'Microbiology', 'Histopathology', 'Immunology', 'Cardiac']),
  testName: z.string().min(1, 'Test name is required'),
  otherTestName: z.string().optional(),
  specimenType: z.string().optional(),
  specimenSite: z.string().optional(),
  clinicalHistory: z.string().optional(),
  priority: z.enum(['Routine', 'Urgent', 'Emergency']),
  collectionDate: z.string().optional(),
  collectionTime: z.string().optional(),
  // Lab Use (left empty initially)
  result: z.string().optional(),
  resultDate: z.string().optional(),
  performedBy: z.string().optional(),
  notes: z.string().optional(),
});

type OrderLabFormData = z.infer<typeof orderLabSchema>;

const OrderLabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const orderMutation = useOrderLab(id!);
  const { toast } = useToast();

  // State to show result entry after saving
  const [savedLabId, setSavedLabId] = useState<string | null>(null);
  const [showResultEntry, setShowResultEntry] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<OrderLabFormData>({
    resolver: zodResolver(orderLabSchema),
    defaultValues: {
      testCategory: 'Hematology',
      priority: 'Routine',
      collectionDate: new Date().toISOString().split('T')[0],
      collectionTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    },
  });

  const selectedCategory = watch('testCategory');

  // ── Test options by category ──
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
        { value: 'Antimicrobial Susceptibility', label: 'Antimicrobial Susceptibility Testing' },
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

  const onSubmit = (data: OrderLabFormData) => {
    orderMutation.mutate(
      {
        testName: data.testName === 'Other' ? data.otherTestName || '' : data.testName,
        dateOrdered: data.collectionDate || new Date().toISOString().split('T')[0],
        location: 'Home',
        // Store additional data for later
        specimenType: data.specimenType,
        specimenSite: data.specimenSite,
        clinicalHistory: data.clinicalHistory,
        priority: data.priority,
      } as any,
      {
        onSuccess: (response) => {
          setSavedLabId(response.id);
          toast.success('Lab test ordered successfully. Enter results when available.');
        },
      }
    );
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">CLINICAL LABORATORY ORDER FORM</h1>
          <p className="text-sm text-text-secondary">Yekatit 12 Hospital Medical College (Y12HMC)</p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* ── 1. Patient Information (Auto-filled) ── */}
        <FormSection title="1. Patient Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Patient Name" value={patient ? `${patient.firstName} ${patient.lastName}` : '—'} disabled />
            <Input label="Patient ID" value={patient?.patientDisplayId || '—'} disabled />
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
            <Input label="Date of Birth" value={patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'} disabled />
            <Input label="Medical Record No." value={patient?.patientDisplayId || '—'} disabled className="sm:col-span-2" />
            <Input label="Ward/Clinic" value="Palliative Care Unit" disabled className="sm:col-span-2" />
          </div>
        </FormSection>

        {/* ── 2. Order Details ── */}
        <FormSection title="2. Laboratory Investigations Requested">
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Test Category</p>
            <Select
              options={[
                { value: 'Hematology', label: 'A. Hematology' },
                { value: 'Chemistry', label: 'B. Clinical Chemistry' },
                { value: 'Hormone', label: 'C. Hormone / Endocrine Tests' },
                { value: 'Urinalysis', label: 'D. Urinalysis' },
                { value: 'Stool', label: 'E. Stool Examination' },
                { value: 'Microbiology', label: 'F. Microbiology' },
                { value: 'Histopathology', label: 'G. Histopathology / Cytology' },
                { value: 'Immunology', label: 'H. Immunology / Serology' },
                { value: 'Cardiac', label: 'I. Cardiac Biomarkers' },
              ]}
              {...register('testCategory')}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Test Name</p>
            <Select
              options={[
                ...getTestOptions(selectedCategory),
                { value: 'Other', label: 'Other (specify below)' },
              ]}
              {...register('testName')}
              error={errors.testName?.message}
            />
          </div>

          {watch('testName') === 'Other' && (
            <Input label="Specify Other Test" {...register('otherTestName')} />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Specimen Type" placeholder="e.g., Blood, Urine, Stool" {...register('specimenType')} />
            <Input label="Specimen Site" placeholder="e.g., Venous, Finger stick" {...register('specimenSite')} />
          </div>

          <Textarea label="Clinical History / Reason for Test" rows={3} {...register('clinicalHistory')} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={[
                { value: 'Routine', label: 'Routine' },
                { value: 'Urgent', label: 'Urgent' },
                { value: 'Emergency', label: 'Emergency' },
              ]}
              {...register('priority')}
            />
          </div>
        </FormSection>

        {/* ── 3. Collection Details ── */}
        <FormSection title="3. Collection & Submission">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Collection Date" type="date" {...register('collectionDate')} />
            <Input label="Collection Time" type="time" {...register('collectionTime')} />
          </div>
        </FormSection>

        {/* ── 4. Submit ── */}
        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={orderMutation.isPending}>
            {orderMutation.isPending ? 'Ordering...' : 'Order Lab Test'}
          </Button>
        </div>
      </form>

      {/* ── 5. Result Entry (Shows after ordering) ── */}
      {savedLabId && (
        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-success">Lab Test Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              The lab test has been ordered. Enter the results below when available.
            </p>
            <LabResultEntry
              labId={savedLabId}
              patientId={id!}
              onResultSaved={() => {
                toast.success('Lab results saved successfully');
                setTimeout(() => navigate(`/patients/${id}`), 1500);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderLabPage;