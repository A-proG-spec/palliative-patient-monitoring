import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderImaging } from '@/hooks/useImaging';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';

// ── Layout helpers ──────────────────────────────────────────────

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title, children,
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

const CheckboxGroup: React.FC<{
  options: { value: string; label: string }[];
  name: string;
  register: any;
  className?: string;
}> = ({ options, name, register, className }) => (
  <div className={cn('grid grid-cols-2 gap-2', className)}>
    {options.map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
      >
        <input
          type="checkbox"
          value={option.value}
          {...register(name)}
          className="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
        />
        {option.label}
      </label>
    ))}
  </div>
);

// ── Zod schema — matches backend `createImagingSchema` ──────────

const orderImagingSchema = z.object({
  // §2 Clinical
  provisionalDiagnosis: z.string().optional(),
  presentingSymptoms: z.string().optional(),
  medicalHistory: z.string().optional(),
  previousImaging: z.boolean().default(false),
  previousImagingDetails: z.string().optional(),

  // §3 Imaging examination requested
  modality: z.enum([
    'XRay', 'Ultrasound', 'CT', 'MRI',
    'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine', 'Other',
  ]),
  modalityOtherText: z.string().optional(),
  bodyRegion: z.string().min(1, 'Body region is required'),
  bodyRegionOtherText: z.string().optional(),
  laterality: z.enum(['Right', 'Left', 'Bilateral', 'NotApplicable']).default('NotApplicable'),
  contrastRequested: z.enum(['No', 'Yes', 'ToBeDetermined', 'NotApplicable']).default('No'),

  // §4 Exam details
  specificSite: z.string().optional(),
  protocolViews: z.string().optional(),
  specialClinicalQuestion: z.string().optional(),

  // §5 Contrast / medication
  previousContrastReaction: z.boolean().default(false),
  previousContrastReactionDetails: z.string().optional(),
  knownAllergies: z.string().optional(),
  creatinine: z.string().optional(),
  egfr: z.string().optional(),
  otherRelevantMedicationOrCondition: z.string().optional(),

  // §6 Safety screening
  pregnancyStatus: z.enum(['NotPregnant', 'Pregnant', 'PossiblyPregnant', 'NotApplicable']).default('NotApplicable'),
  implantedMedicalDevice: z.boolean().default(false),
  deviceImplantDetails: z.string().optional(),
  metallicForeignBody: z.enum(['No', 'Yes', 'Unknown']).default('No'),
  otherSafetyConsiderations: z.string().optional(),

  // §7 Preparation
  preparation: z.array(z.string()).optional().default([]),
  preparationInstructions: z.string().optional(),

  // §8 Priority
  priority: z.enum(['Routine', 'Urgent', 'Emergency']).default('Routine'),
  reasonForUrgency: z.string().optional(),

  // §9 Referring clinician
  clinicianName: z.string().optional(),
  clinicianDepartment: z.string().optional(),
  clinicianLicenseNo: z.string().optional(),
  clinicianContact: z.string().optional(),
  clinicianSignature: z.string().optional(),
});

type OrderImagingFormData = z.infer<typeof orderImagingSchema>;

// ── Component ───────────────────────────────────────────────────

const OrderImagingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const orderMutation = useOrderImaging(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrderImagingFormData>({
    resolver: zodResolver(orderImagingSchema),
    defaultValues: {
      modality: 'XRay',
      contrastRequested: 'No',
      priority: 'Routine',
      laterality: 'NotApplicable',
      pregnancyStatus: 'NotApplicable',
      implantedMedicalDevice: false,
      metallicForeignBody: 'No',
      previousImaging: false,
      previousContrastReaction: false,
      preparation: [],
    },
  });

  const selectedModality = watch('modality');
  const contrastRequested = watch('contrastRequested');
  const priority = watch('priority');
  const pregnancyStatus = watch('pregnancyStatus');

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

  // ── Body region options per modality ──
  const getRegionOptions = (modality: string) => {
    const map: Record<string, { value: string; label: string }[]> = {
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
      Mammography: [{ value: 'Breast', label: 'Breast' }],
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
      Other: [{ value: 'Other', label: 'Other (specify)' }],
    };
    return map[modality] || [];
  };

  // ── Preparation options ──
  const preparationOptions = [
    { value: 'None', label: 'No preparation' },
    { value: 'Fasting', label: 'Fasting' },
    { value: 'FullBladder', label: 'Full bladder' },
    { value: 'EmptyBladder', label: 'Empty bladder' },
    { value: 'SpecialMedicationPreparation', label: 'Special medication preparation' },
    { value: 'Other', label: 'Other' },
  ];

  // ── Submit ──
  const onSubmit = (data: OrderImagingFormData) => {
    // Strip empty-string modalityOtherText so backend gets undefined, not ""
    const payload: any = { ...data };
    if (!payload.modalityOtherText) delete payload.modalityOtherText;
    if (!payload.bodyRegionOtherText) delete payload.bodyRegionOtherText;

    orderMutation.mutate(payload, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            Clinical Imaging Examination Order Form
          </h1>
          <p className="text-sm text-text-secondary">
            Yekatit 12 Hospital Medical College (Y12HMC)
          </p>
          {patient && (
            <p className="text-sm text-text-muted mt-1">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* §1 — Patient Information */}
        <FormSection title="1. Patient Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              value={patient ? `${patient.firstName} ${patient.lastName}` : '—'}
              disabled
            />
            <Input label="Patient ID" value={patient?.patientDisplayId || '—'} disabled />
            <Input label="Age" value={patient?.age ? `${patient.age} years` : '—'} disabled />
            <Input label="Sex" value={patient?.sex || '—'} disabled />
            <Input
              label="Medical Record No."
              value={patient?.patientDisplayId || '—'}
              disabled
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        {/* §2 — Clinical Information */}
        <FormSection title="2. Clinical Information">
          <Input
            label="Provisional / Clinical Diagnosis"
            placeholder="Enter diagnosis…"
            {...register('provisionalDiagnosis')}
          />
          <Textarea
            label="Presenting Symptoms / Signs"
            rows={3}
            placeholder="Describe symptoms…"
            {...register('presentingSymptoms')}
          />
          <Textarea
            label="Relevant Medical / Surgical History"
            rows={2}
            {...register('medicalHistory')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Previous Imaging
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  checked={!watch('previousImaging')}
                  onChange={() => register('previousImaging').onChange({ target: { value: false } })}
                  className="h-4 w-4 text-primary"
                />
                None
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  checked={!!watch('previousImaging')}
                  onChange={() => register('previousImaging').onChange({ target: { value: true } })}
                  className="h-4 w-4 text-primary"
                />
                Yes
              </label>
            </div>
          </div>
          {watch('previousImaging') && (
            <Textarea
              label="Previous Imaging Type / Findings"
              rows={2}
              {...register('previousImagingDetails')}
            />
          )}

          <Textarea
            label="Clinical Question / Reason for Examination"
            rows={2}
            {...register('specialClinicalQuestion')}
          />
        </FormSection>

        {/* §3 — Imaging Examination Requested */}
        <FormSection title="3. Imaging Examination Requested">
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Modality</p>
            <Select options={modalityOptions} {...register('modality')} />
          </div>

          {selectedModality === 'Other' && (
            <Input
              label="Specify Modality"
              placeholder="Enter modality…"
              {...register('modalityOtherText')}
            />
          )}

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

          <Input
            label="Specific Site"
            placeholder="e.g., L4-L5, Right knee"
            {...register('specificSite')}
          />
          <Input
            label="Protocol / Views Requested"
            placeholder="e.g., AP, Lateral, Oblique"
            {...register('protocolViews')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Contrast</p>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'No', label: 'No' },
                { value: 'Yes', label: 'Yes' },
                { value: 'ToBeDetermined', label: 'To be determined' },
                { value: 'NotApplicable', label: 'Not applicable' },
              ].map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value={o.value}
                    {...register('contrastRequested')}
                    className="h-4 w-4 text-primary"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </FormSection>

        {/* §5 — Contrast / Medication Information */}
        <FormSection title="5. Contrast / Medication Information">
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Previous Contrast Reaction
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  checked={!watch('previousContrastReaction')}
                  onChange={() => register('previousContrastReaction').onChange({ target: { value: false } })}
                  className="h-4 w-4 text-primary"
                />
                No
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  checked={!!watch('previousContrastReaction')}
                  onChange={() => register('previousContrastReaction').onChange({ target: { value: true } })}
                  className="h-4 w-4 text-primary"
                />
                Yes
              </label>
            </div>
          </div>
          {watch('previousContrastReaction') && (
            <Input
              label="Details"
              {...register('previousContrastReactionDetails')}
            />
          )}

          <Input label="Known Allergies" placeholder="e.g., Contrast media, Latex" {...register('knownAllergies')} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Creatinine" placeholder="e.g., 1.2 mg/dL" {...register('creatinine')} />
            <Input label="eGFR" placeholder="e.g., 60 mL/min" {...register('egfr')} />
          </div>

          <Textarea
            label="Other Relevant Medication / Condition"
            rows={2}
            {...register('otherRelevantMedicationOrCondition')}
          />
        </FormSection>

        {/* §6 — Safety Screening */}
        <FormSection title="6. Safety Screening">
          <Select
            label="Pregnancy Status (where applicable)"
            options={[
              { value: 'NotPregnant', label: 'Not pregnant' },
              { value: 'Pregnant', label: 'Pregnant' },
              { value: 'PossiblyPregnant', label: 'Possibly pregnant' },
              { value: 'NotApplicable', label: 'Not applicable' },
            ]}
            {...register('pregnancyStatus')}
          />

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">
              Implanted Medical Device
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  checked={!watch('implantedMedicalDevice')}
                  onChange={() => register('implantedMedicalDevice').onChange({ target: { value: false } })}
                  className="h-4 w-4 text-primary"
                />
                No
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  checked={!!watch('implantedMedicalDevice')}
                  onChange={() => register('implantedMedicalDevice').onChange({ target: { value: true } })}
                  className="h-4 w-4 text-primary"
                />
                Yes
              </label>
            </div>
          </div>
          {watch('implantedMedicalDevice') && (
            <Input label="Device / Implant Details" {...register('deviceImplantDetails')} />
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

          <Textarea
            label="Other Safety Considerations"
            rows={2}
            {...register('otherSafetyConsiderations')}
          />

          {contrastRequested === 'Yes' && (
            <div className="p-3 bg-warning-bg border border-warning/20 rounded-lg">
              <p className="text-sm text-warning font-medium">
                ⚠️ Contrast will be used. Please ensure renal function is reviewed.
              </p>
            </div>
          )}
        </FormSection>

        {/* §7 — Patient Preparation */}
        <FormSection title="7. Patient Preparation">
          <CheckboxGroup
            options={preparationOptions}
            name="preparation"
            register={register}
          />
          <Textarea
            label="Preparation Instructions"
            rows={2}
            {...register('preparationInstructions')}
          />
        </FormSection>

        {/* §8 — Priority */}
        <FormSection title="8. Priority">
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
            {priority !== 'Routine' && (
              <Input label="Reason for Urgency" {...register('reasonForUrgency')} />
            )}
          </div>
        </FormSection>

        {/* §9 — Referring Clinician */}
        <FormSection title="9. Referring Clinician">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Clinician Name" {...register('clinicianName')} />
            <Input label="Department" {...register('clinicianDepartment')} />
            <Input label="License / Registration No." {...register('clinicianLicenseNo')} />
            <Input label="Contact / Extension" {...register('clinicianContact')} />
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={orderMutation.isPending}>
            {orderMutation.isPending ? 'Ordering…' : 'Submit Imaging Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderImagingPage;