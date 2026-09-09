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
import { ImagingResultEntry } from '@/components/imaging/ImagingResultEntry';

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
const orderImagingSchema = z.object({
  // Patient Info (auto-filled)
  // Order Details
  modality: z.enum(['XRay', 'Ultrasound', 'CT', 'MRI', 'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine', 'Other']),
  bodyRegion: z.string().min(1, 'Body region is required'),
  specificSite: z.string().optional(),
  laterality: z.enum(['Right', 'Left', 'Bilateral', 'NotApplicable']),
  protocol: z.string().optional(),
  clinicalQuestion: z.string().optional(),
  contrast: z.enum(['No', 'Yes', 'ToBeDetermined']),
  priority: z.enum(['Routine', 'Urgent', 'Emergency']),
  reasonForUrgency: z.string().optional(),
  // Safety Screening
  pregnancyStatus: z.enum(['NotPregnant', 'Pregnant', 'PossiblyPregnant', 'NotApplicable']),
  implantedDevice: z.boolean(),
  deviceDetails: z.string().optional(),
  metallicForeignBody: z.enum(['No', 'Yes', 'Unknown']),
  allergies: z.string().optional(),
  renalFunction: z.string().optional(),
  creatinine: z.string().optional(),
  egfr: z.string().optional(),
  // Patient Preparation
  preparation: z.array(z.string()).optional().default([]),
  preparationInstructions: z.string().optional(),
  // Results (left empty initially)
  findings: z.string().optional(),
  impression: z.string().optional(),
  recommendations: z.string().optional(),
  reportDate: z.string().optional(),
  reportingPhysician: z.string().optional(),
  imageQuality: z.enum(['Diagnostic', 'Limited', 'NonDiagnostic', 'RepeatRequired']).optional(),
});

type OrderImagingFormData = z.infer<typeof orderImagingSchema>;

const OrderImagingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const orderMutation = useOrderLab(id!);
  const { toast } = useToast();

  const [savedImagingId, setSavedImagingId] = useState<string | null>(null);
  const [showResultEntry, setShowResultEntry] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<OrderImagingFormData>({
    resolver: zodResolver(orderImagingSchema),
    defaultValues: {
      modality: 'XRay',
      contrast: 'No',
      priority: 'Routine',
      laterality: 'NotApplicable',
      pregnancyStatus: 'NotApplicable',
      implantedDevice: false,
      metallicForeignBody: 'No',
      preparation: [],
    },
  });

  const selectedModality = watch('modality');
  const contrast = watch('contrast');
  const priority = watch('priority');

  // ── Modality options ──
  const modalityOptions = [
    { value: 'XRay', label: 'A. X-Ray / Radiography' },
    { value: 'Ultrasound', label: 'B. Ultrasound' },
    { value: 'CT', label: 'C. CT Scan' },
    { value: 'MRI', label: 'D. MRI' },
    { value: 'Mammography', label: 'E. Mammography' },
    { value: 'Fluoroscopy', label: 'F. Fluoroscopy' },
    { value: 'Interventional', label: 'G. Interventional Imaging' },
    { value: 'NuclearMedicine', label: 'H. Nuclear Medicine' },
    { value: 'Other', label: 'I. Other' },
  ];

  // ── Body region options based on modality ──
  const getRegionOptions = (modality: string) => {
    const options: Record<string, { value: string; label: string }[]> = {
      XRay: [
        { value: 'Chest', label: 'Chest' },
        { value: 'Abdomen', label: 'Abdomen' },
        { value: 'Skull', label: 'Skull/Facial Bones' },
        { value: 'Spine', label: 'Spine' },
        { value: 'Pelvis', label: 'Pelvis/Hip' },
        { value: 'UpperLimb', label: 'Upper Limb' },
        { value: 'LowerLimb', label: 'Lower Limb' },
      ],
      Ultrasound: [
        { value: 'Abdomen', label: 'Abdomen' },
        { value: 'Pelvis', label: 'Pelvis' },
        { value: 'Obstetric', label: 'Obstetric' },
        { value: 'Renal', label: 'Renal/Urinary Tract' },
        { value: 'Thyroid', label: 'Thyroid/Neck' },
        { value: 'Breast', label: 'Breast' },
        { value: 'Scrotal', label: 'Scrotal/Testicular' },
        { value: 'Doppler', label: 'Doppler' },
        { value: 'Echocardiography', label: 'Echocardiography' },
      ],
      CT: [
        { value: 'Brain', label: 'Brain/Head' },
        { value: 'Chest', label: 'Chest' },
        { value: 'Abdomen', label: 'Abdomen' },
        { value: 'Pelvis', label: 'Pelvis' },
        { value: 'Spine', label: 'Spine' },
        { value: 'Musculoskeletal', label: 'Musculoskeletal' },
        { value: 'CTAngiography', label: 'CT Angiography' },
      ],
      MRI: [
        { value: 'Brain', label: 'Brain' },
        { value: 'Spine', label: 'Spine' },
        { value: 'Musculoskeletal', label: 'Musculoskeletal' },
        { value: 'Abdomen', label: 'Abdomen' },
        { value: 'Pelvis', label: 'Pelvis' },
        { value: 'Cardiac', label: 'Cardiac' },
        { value: 'MRA', label: 'MRA/MRV' },
      ],
      Mammography: [
        { value: 'Breast', label: 'Breast' },
      ],
      Fluoroscopy: [
        { value: 'BariumSwallow', label: 'Barium Swallow' },
        { value: 'BariumEnema', label: 'Barium Enema' },
        { value: 'IVP', label: 'IVP' },
        { value: 'HSG', label: 'HSG' },
      ],
      Interventional: [
        { value: 'Angiography', label: 'Angiography' },
        { value: 'Biopsy', label: 'Biopsy' },
        { value: 'Drainage', label: 'Drainage' },
        { value: 'Stenting', label: 'Stenting' },
      ],
      NuclearMedicine: [
        { value: 'BoneScan', label: 'Bone Scan' },
        { value: 'PETCT', label: 'PET/CT' },
        { value: 'ThyroidScan', label: 'Thyroid Scan' },
        { value: 'MyocardialPerfusion', label: 'Myocardial Perfusion' },
      ],
      Other: [
        { value: 'Other', label: 'Other (specify)' },
      ],
    };
    return options[modality] || [];
  };

  // ── Preparation options ──
  const preparationOptions = [
    { value: 'None', label: 'No preparation' },
    { value: 'Fasting', label: 'Fasting' },
    { value: 'FullBladder', label: 'Full bladder' },
    { value: 'EmptyBladder', label: 'Empty bladder' },
    { value: 'MedicationPrep', label: 'Special medication preparation' },
    { value: 'Other', label: 'Other' },
  ];

  const onSubmit = (data: OrderImagingFormData) => {
    // Map to lab test format (reuse lab API)
    const testName = `${data.modality} - ${data.bodyRegion}`;
    
    orderMutation.mutate(
      {
        testName: testName,
        dateOrdered: new Date().toISOString().split('T')[0],
        location: 'Hospital',
        // Store all imaging data as additional fields
        imagingData: {
          modality: data.modality,
          bodyRegion: data.bodyRegion,
          specificSite: data.specificSite,
          laterality: data.laterality,
          protocol: data.protocol,
          clinicalQuestion: data.clinicalQuestion,
          contrast: data.contrast,
          priority: data.priority,
          reasonForUrgency: data.reasonForUrgency,
          pregnancyStatus: data.pregnancyStatus,
          implantedDevice: data.implantedDevice,
          deviceDetails: data.deviceDetails,
          metallicForeignBody: data.metallicForeignBody,
          allergies: data.allergies,
          renalFunction: data.renalFunction,
          creatinine: data.creatinine,
          egfr: data.egfr,
          preparation: data.preparation,
          preparationInstructions: data.preparationInstructions,
        },
      } as any,
      {
        onSuccess: (response) => {
          setSavedImagingId(response.id);
          toast.success('Imaging order submitted successfully. Enter results when available.');
        },
      }
    );
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">CLINICAL IMAGING EXAMINATION ORDER FORM</h1>
          <p className="text-sm text-text-secondary">Yekatit 12 Hospital Medical College (Y12HMC)</p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* ── 1. Patient Information ── */}
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

        {/* ── 2. Clinical Information ── */}
        <FormSection title="2. Clinical Information">
          <Input label="Provisional/Clinical Diagnosis" placeholder="Enter diagnosis..." {...register('clinicalDiagnosis')} />
          <Textarea label="Presenting Symptoms / Signs" rows={3} placeholder="Describe symptoms..." {...register('presentingSymptoms')} />
          <Textarea label="Relevant Medical/Surgical History" rows={2} {...register('medicalHistory')} />
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Previous Imaging</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="none" {...register('previousImaging')} className="h-4 w-4 text-primary" />
                None
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="yes" {...register('previousImaging')} className="h-4 w-4 text-primary" />
                Yes
              </label>
            </div>
          </div>
          <Textarea label="Previous Imaging Type/Findings" rows={2} {...register('previousImagingDetails')} />
          <Textarea label="Clinical Question / Reason for Examination" rows={2} {...register('clinicalQuestion')} />
        </FormSection>

        {/* ── 3. Imaging Examination Requested ── */}
        <FormSection title="3. Imaging Examination Requested">
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Modality</p>
            <Select
              options={modalityOptions}
              {...register('modality')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Body Region"
              options={getRegionOptions(selectedModality)}
              {...register('bodyRegion')}
              error={errors.bodyRegion?.message}
            />
            <Select
              label="Laterality"
              options={[
                { value: 'Right', label: 'Right' },
                { value: 'Left', label: 'Left' },
                { value: 'Bilateral', label: 'Bilateral' },
                { value: 'NotApplicable', label: 'Not applicable' },
              ]}
              {...register('laterality')}
            />
          </div>

          <Input label="Specific Site" placeholder="e.g., L4-L5, Right knee" {...register('specificSite')} />
          <Input label="Protocol / Views Requested" placeholder="e.g., AP, Lateral, Oblique" {...register('protocol')} />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Contrast</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="No" {...register('contrast')} className="h-4 w-4 text-primary" />
                No
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="Yes" {...register('contrast')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="ToBeDetermined" {...register('contrast')} className="h-4 w-4 text-primary" />
                To be determined
              </label>
            </div>
          </div>
        </FormSection>

        {/* ── 4. Safety Screening ── */}
        <FormSection title="4. Safety Screening">
          <Select
            label="Pregnancy Status"
            options={[
              { value: 'NotPregnant', label: 'Not pregnant' },
              { value: 'Pregnant', label: 'Pregnant' },
              { value: 'PossiblyPregnant', label: 'Possibly pregnant' },
              { value: 'NotApplicable', label: 'Not applicable' },
            ]}
            {...register('pregnancyStatus')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Implanted Medical Device</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="true" {...register('implantedDevice')} className="h-4 w-4 text-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="false" {...register('implantedDevice')} className="h-4 w-4 text-primary" />
                No
              </label>
            </div>
          </div>

          {watch('implantedDevice') && (
            <Input label="Device/Implant Details" {...register('deviceDetails')} />
          )}

          <Select
            label="Metallic Foreign Body"
            options={[
              { value: 'No', label: 'No' },
              { value: 'Yes', label: 'Yes' },
              { value: 'Unknown', label: 'Unknown' },
            ]}
            {...register('metallicForeignBody')}
          />

          <Input label="Known Allergies" placeholder="e.g., Contrast media, Latex, Iodine" {...register('allergies')} />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Renal Function</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Creatinine" placeholder="e.g., 1.2 mg/dL" {...register('creatinine')} />
              <Input label="eGFR" placeholder="e.g., 60 mL/min" {...register('egfr')} />
            </div>
          </div>

          {watch('contrast') === 'Yes' && (
            <div className="p-3 bg-warning-bg border border-warning/20 rounded-lg">
              <p className="text-sm text-warning font-medium">⚠️ Contrast will be used. Please ensure renal function is reviewed.</p>
            </div>
          )}
        </FormSection>

        {/* ── 5. Patient Preparation ── */}
        <FormSection title="5. Patient Preparation">
          <div className="grid grid-cols-2 gap-2">
            {preparationOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={option.value} {...register('preparation')} className="h-4 w-4 rounded text-primary" />
                {option.label}
              </label>
            ))}
          </div>
          <Textarea label="Preparation Instructions" rows={2} {...register('preparationInstructions')} />
        </FormSection>

        {/* ── 6. Priority ── */}
        <FormSection title="6. Priority">
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
            {watch('priority') !== 'Routine' && (
              <Input label="Reason for Urgency" {...register('reasonForUrgency')} />
            )}
          </div>
        </FormSection>

        {/* ── 7. Referring Clinician ── */}
        <FormSection title="7. Referring Clinician">
          <Input label="Clinician Name" {...register('clinicianName')} />
          <Input label="Department" {...register('clinicianDepartment')} />
          <Input label="Contact/Extension" {...register('clinicianContact')} />
        </FormSection>

        {/* ── Submit ── */}
        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={orderMutation.isPending}>
            {orderMutation.isPending ? 'Ordering...' : 'Submit Imaging Order'}
          </Button>
        </div>
      </form>

      {/* ── 8. Result Entry (Shows after ordering) ── */}
      {savedImagingId && (
        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-success">Imaging Order Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              The imaging order has been submitted. Enter the report findings below when available.
            </p>
            <ImagingResultEntry
              imagingId={savedImagingId}
              patientId={id!}
              onResultSaved={() => {
                toast.success('Imaging report saved successfully');
                setTimeout(() => navigate(`/patients/${id}`), 1500);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderImagingPage;