import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import type {
  DischargeSummary,
  DischargeErrors,
  DischargeSectionKey,
  DischargeMedRow,
} from '@/hooks/useDischargeFormState';

// ═══════════════════════════════════════════════════════════
// Auto-fill field list — unchanged from the original modal
// ═══════════════════════════════════════════════════════════

const AUTOFILLED_KEYS = new Set<keyof DischargeSummary>([
  'fullName',
  'dateOfBirth',
  'age',
  'sex',
  'address',
  'telephone',
  'primaryCaregiver',
  'caregiverTelephone',
  'primaryDiagnosis',
  'secondaryDiagnoses',
  'dateOfAdmission',
  'hospitalName',
  'palliativeCareUnit',
  'emergencyContactInfo',
]);

// ═══════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════

const FieldRow: React.FC<{ children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }> = ({
  children,
  cols = 2,
}) => (
  <div
    className={cn('grid gap-4', {
      'grid-cols-1': cols === 1,
      'grid-cols-1 sm:grid-cols-2': cols === 2,
      'grid-cols-1 sm:grid-cols-3': cols === 3,
      'grid-cols-2 sm:grid-cols-4': cols === 4,
    })}
  >
    {children}
  </div>
);

const AF: React.FC<{
  fieldKey: keyof DischargeSummary;
  label: string;
  children: React.ReactElement;
}> = ({ fieldKey, label, children }) => {
  const isAuto = AUTOFILLED_KEYS.has(fieldKey);
  const inputId = `af-${String(fieldKey)}`;

  const childWithoutLabel = React.cloneElement(children, {
    id: inputId,
    label: undefined,
  } as Record<string, unknown>);

  return (
    <div className={cn(isAuto && 'rounded-lg ring-1 ring-primary/20 bg-primary/[0.025] p-0.5 -m-0.5')}>
      <div className="flex items-center gap-1.5 mb-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-on-surface leading-none"
        >
          {label}
        </label>
        {isAuto && (
          <span className="text-[9px] font-semibold text-primary bg-primary/[0.08] border border-primary/20 px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">
            auto-filled
          </span>
        )}
      </div>
      {childWithoutLabel}
    </div>
  );
};

const RadioGroup: React.FC<{
  label?: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
}> = ({ label, name, value, options, onChange, required }) => (
  <div className="space-y-1.5">
    {label && (
      <p className="text-sm font-medium text-on-surface">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </p>
    )}
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-3.5 w-3.5 text-primary"
          />
          {o.label}
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup: React.FC<{
  label?: string;
  values: string[];
  options: string[];
  onChange: (vals: string[]) => void;
}> = ({ label, values, options, onChange }) => {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-on-surface">{label}</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
            <input
              type="checkbox"
              checked={values.includes(o)}
              onChange={() => toggle(o)}
              className="h-3.5 w-3.5 rounded text-primary"
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
};

const YesNo: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, name, value, onChange }) => (
  <RadioGroup
    label={label}
    name={name}
    value={value}
    options={[
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ]}
    onChange={onChange}
  />
);

// ═══════════════════════════════════════════════════════════
// Main body component
// ═══════════════════════════════════════════════════════════

interface DischargeSectionBodyProps {
  sectionKey: DischargeSectionKey;
  form: DischargeSummary;
  errors: DischargeErrors;
  set: <K extends keyof DischargeSummary>(key: K, value: DischargeSummary[K]) => void;
}

const SYMPTOM_KEYS = [
  'Pain',
  'Shortness of Breath',
  'Nausea',
  'Vomiting',
  'Constipation',
  'Fatigue',
  'Anxiety',
  'Delirium/Confusion',
  'Appetite Loss',
  'Other',
] as const;

const blankMedRow = (): DischargeMedRow => ({
  medication: '',
  dose: '',
  route: '',
  frequency: '',
  purpose: '',
  instructions: '',
});

export const DischargeSectionBody: React.FC<DischargeSectionBodyProps> = ({
  sectionKey,
  form,
  errors,
  set,
}) => {
  switch (sectionKey) {
    // ── A – Header ──
    case 'header':
      return (
        <div className="space-y-4">
          <FieldRow cols={2}>
            <AF fieldKey="hospitalName" label="Hospital / Facility Name">
              <Input label="" value={form.hospitalName} onChange={(e) => set('hospitalName', e.target.value)} />
            </AF>
            <AF fieldKey="palliativeCareUnit" label="Palliative Care Unit">
              <Input label="" value={form.palliativeCareUnit} onChange={(e) => set('palliativeCareUnit', e.target.value)} />
            </AF>
          </FieldRow>

          <FieldRow cols={3}>
            <AF fieldKey="dateOfAdmission" label="Date of Admission">
              <Input label="" type="date" value={form.dateOfAdmission} onChange={(e) => set('dateOfAdmission', e.target.value)} />
            </AF>
            <Input
              label="Date of Discharge *"
              type="date"
              value={form.dateOfDischarge}
              onChange={(e) => set('dateOfDischarge', e.target.value)}
              error={errors.dateOfDischarge}
            />
            <Input
              label="Time of Discharge *"
              type="time"
              value={form.timeOfDischarge}
              onChange={(e) => set('timeOfDischarge', e.target.value)}
              error={errors.timeOfDischarge}
            />
          </FieldRow>

          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">
              Discharge Type <span className="text-error">*</span>
            </p>
            {errors.dischargeType && <p className="text-xs text-error">{errors.dischargeType}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Planned Discharge',
                'Transfer',
                'Discharge to Home',
                'Discharge to Hospice',
                'Discharge to Long-Term Care Facility',
                'Transfer to Another Hospital/Facility',
                'Other',
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
                  <input
                    type="radio"
                    name="dischargeType"
                    value={opt}
                    checked={form.dischargeType === opt}
                    onChange={() => set('dischargeType', opt)}
                    className="h-3.5 w-3.5 text-primary"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {form.dischargeType === 'Other' && (
              <Input
                placeholder="Specify discharge type…"
                value={form.dischargeTypeOther}
                onChange={(e) => set('dischargeTypeOther', e.target.value)}
              />
            )}
          </div>
        </div>
      );

    // ── B – Patient ──
    case 'patient':
      return (
        <div className="space-y-4">
          <FieldRow cols={2}>
            <AF fieldKey="fullName" label="Full Name">
              <Input label="" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
            </AF>
            <AF fieldKey="dateOfBirth" label="Date of Birth">
              <Input label="" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </AF>
            <AF fieldKey="age" label="Age">
              <Input label="" value={form.age} onChange={(e) => set('age', e.target.value)} />
            </AF>
            <AF fieldKey="sex" label="Sex">
              <Select
                label=""
                value={form.sex}
                onChange={(e) => set('sex', e.target.value)}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                placeholder="Select…"
              />
            </AF>
          </FieldRow>

          <AF fieldKey="address" label="Address">
            <Input label="" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </AF>

          <AF fieldKey="telephone" label="Telephone / Mobile">
            <Input label="" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
          </AF>

          <FieldRow cols={3}>
            <AF fieldKey="primaryCaregiver" label="Primary Caregiver">
              <Input label="" value={form.primaryCaregiver} onChange={(e) => set('primaryCaregiver', e.target.value)} />
            </AF>
            <Input
              label="Relationship"
              value={form.caregiverRelationship}
              onChange={(e) => set('caregiverRelationship', e.target.value)}
            />
            <AF fieldKey="caregiverTelephone" label="Caregiver Telephone">
              <Input label="" value={form.caregiverTelephone} onChange={(e) => set('caregiverTelephone', e.target.value)} />
            </AF>
          </FieldRow>
        </div>
      );

    // ── C – Admission ──
    case 'admission':
      return (
        <div className="space-y-4">
          <AF fieldKey="primaryDiagnosis" label="Primary Diagnosis">
            <Input label="" value={form.primaryDiagnosis} onChange={(e) => set('primaryDiagnosis', e.target.value)} />
          </AF>
          <AF fieldKey="secondaryDiagnoses" label="Secondary Diagnoses / Comorbidities">
            <Textarea label="" rows={3} value={form.secondaryDiagnoses} onChange={(e) => set('secondaryDiagnoses', e.target.value)} />
          </AF>
          <Textarea
            label="Reason for Palliative Care Admission"
            rows={3}
            value={form.reasonForAdmission}
            onChange={(e) => set('reasonForAdmission', e.target.value)}
          />
          <Input
            label="Referring Physician / Facility"
            value={form.referringPhysicianFacility}
            onChange={(e) => set('referringPhysicianFacility', e.target.value)}
          />
        </div>
      );

    // ── D – Clinical summary ──
    case 'clinical':
      return (
        <div className="space-y-4">
          <Input
            label="Final / Discharge Diagnosis"
            value={form.finalDischargeDiagnosis}
            onChange={(e) => set('finalDischargeDiagnosis', e.target.value)}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">Important Clinical Problems Managed</p>
            {form.clinicalProblemsManaged.map((prob, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Problem ${i + 1}`}
                  value={prob}
                  onChange={(e) => {
                    const arr = [...form.clinicalProblemsManaged];
                    arr[i] = e.target.value;
                    set('clinicalProblemsManaged', arr);
                  }}
                />
                {form.clinicalProblemsManaged.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      set('clinicalProblemsManaged', form.clinicalProblemsManaged.filter((_, j) => j !== i))
                    }
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error-bg transition-all flex-shrink-0"
                    aria-label="Remove problem"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('clinicalProblemsManaged', [...form.clinicalProblemsManaged, ''])}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Plus size={13} /> Add Problem
            </button>
          </div>
          <Textarea label="Summary of Clinical Course" rows={4} value={form.summaryOfClinicalCourse} onChange={(e) => set('summaryOfClinicalCourse', e.target.value)} />
          <Textarea label="Important Investigations / Results" rows={3} value={form.importantInvestigations} onChange={(e) => set('importantInvestigations', e.target.value)} />
        </div>
      );

    // ── E – Condition ──
    case 'condition':
      return (
        <div className="space-y-4">
          <Select
            label="Overall Condition *"
            value={form.overallCondition}
            onChange={(e) => set('overallCondition', e.target.value)}
            error={errors.overallCondition}
            placeholder="Select…"
            options={[
              { value: 'Stable', label: 'Stable' },
              { value: 'Improved', label: 'Improved' },
              { value: 'Unchanged', label: 'Unchanged' },
              { value: 'Deteriorating', label: 'Deteriorating' },
              { value: 'RequiresOngoingPalliativeCare', label: 'Requires Ongoing Palliative/Hospice Care' },
            ]}
          />
          <FieldRow cols={2}>
            <Select
              label="Level of Consciousness"
              value={form.levelOfConsciousness}
              onChange={(e) => set('levelOfConsciousness', e.target.value)}
              placeholder="Select…"
              options={['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive'].map((v) => ({ value: v, label: v }))}
            />
            <Select
              label="Functional Status"
              value={form.functionalStatus}
              onChange={(e) => set('functionalStatus', e.target.value)}
              placeholder="Select…"
              options={['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent'].map((v) => ({ value: v, label: v }))}
            />
            <Select
              label="Mobility"
              value={form.mobility}
              onChange={(e) => set('mobility', e.target.value)}
              placeholder="Select…"
              options={['Independent', 'Assisted', 'Wheelchair', 'Bedbound'].map((v) => ({ value: v, label: v }))}
            />
            <Select
              label="Oral Intake"
              value={form.oralIntake}
              onChange={(e) => set('oralIntake', e.target.value)}
              placeholder="Select…"
              options={['Adequate', 'Reduced', 'Minimal', 'None'].map((v) => ({ value: v, label: v }))}
            />
          </FieldRow>
        </div>
      );

    // ── F – Vitals ──
    case 'vitals':
      return (
        <FieldRow cols={3}>
          <Input label="Temperature (°C)" placeholder="e.g. 37.2" value={form.temperature} onChange={(e) => set('temperature', e.target.value)} />
          <Input label="Pulse / Heart Rate (bpm)" placeholder="e.g. 88" value={form.pulse} onChange={(e) => set('pulse', e.target.value)} />
          <Input label="Respiratory Rate (/min)" placeholder="e.g. 18" value={form.respiratoryRate} onChange={(e) => set('respiratoryRate', e.target.value)} />
          <Input label="Blood Pressure (mmHg)" placeholder="e.g. 120/80" value={form.bloodPressure} onChange={(e) => set('bloodPressure', e.target.value)} />
          <Input label="O₂ Saturation (%)" placeholder="e.g. 96" value={form.oxygenSaturation} onChange={(e) => set('oxygenSaturation', e.target.value)} />
          <Input label="O₂ Requirement (L/min)" placeholder="e.g. 2" value={form.oxygenRequirement} onChange={(e) => set('oxygenRequirement', e.target.value)} />
        </FieldRow>
      );

    // ── G – Symptoms ──
    case 'symptoms':
      return (
        <div className="space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="pb-2 pr-3 font-medium w-36">Symptom</th>
                  {['None', 'Mild', 'Moderate', 'Severe'].map((s) => (
                    <th key={s} className="pb-2 pr-2 font-medium text-center w-16">{s}</th>
                  ))}
                  <th className="pb-2 font-medium">Management / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {SYMPTOM_KEYS.map((symptom) => {
                  const row = form.symptoms[symptom] ?? { severity: 'None' as const, notes: '' };
                  return (
                    <tr key={symptom} className="align-middle">
                      <td className="py-2 pr-3 text-on-surface font-medium text-xs">{symptom}</td>
                      {(['None', 'Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                        <td key={sev} className="py-2 pr-2 text-center">
                          <input
                            type="radio"
                            name={`symptom-${symptom}`}
                            checked={row.severity === sev}
                            onChange={() => set('symptoms', { ...form.symptoms, [symptom]: { ...row, severity: sev } })}
                            className="h-3.5 w-3.5 text-primary"
                          />
                        </td>
                      ))}
                      <td className="py-2">
                        <input
                          type="text"
                          placeholder="Notes…"
                          value={row.notes}
                          onChange={(e) => set('symptoms', { ...form.symptoms, [symptom]: { ...row, notes: e.target.value } })}
                          className="block w-full rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <FieldRow cols={2}>
            <Input label="Pain Score at Discharge (0–10)" type="number" min={0} max={10} value={form.painScore} onChange={(e) => set('painScore', e.target.value)} />
            <Select
              label="Pain Control"
              value={form.painControl}
              onChange={(e) => set('painControl', e.target.value)}
              placeholder="Select…"
              options={[
                { value: 'WellControlled', label: 'Well Controlled' },
                { value: 'PartiallyControlled', label: 'Partially Controlled' },
                { value: 'PoorlyControlled', label: 'Poorly Controlled' },
              ]}
            />
          </FieldRow>
        </div>
      );

    // ── H – Medications ──
    case 'medications':
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-muted">
                    {['Medication', 'Dose', 'Route', 'Frequency', 'Purpose', 'Instructions', ''].map((h, i) => (
                      <th key={i} className="pb-2 pr-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {form.dischargeMedications.map((row, i) => (
                    <tr key={i} className="align-top">
                      {(['medication', 'dose', 'route', 'frequency', 'purpose', 'instructions'] as (keyof DischargeMedRow)[]).map((field) => (
                        <td key={field} className="py-1.5 pr-2">
                          <input
                            type="text"
                            value={row[field]}
                            onChange={(e) => {
                              const arr = form.dischargeMedications.map((r, j) =>
                                j === i ? { ...r, [field]: e.target.value } : r,
                              );
                              set('dischargeMedications', arr);
                            }}
                            className="block w-full min-w-[80px] rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                      ))}
                      <td className="py-1.5">
                        {form.dischargeMedications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => set('dischargeMedications', form.dischargeMedications.filter((_, j) => j !== i))}
                            className="p-1 rounded text-text-muted hover:text-error hover:bg-error-bg transition-all"
                            aria-label="Remove row"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => set('dischargeMedications', [...form.dischargeMedications, blankMedRow()])}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Plus size={13} /> Add Medication
            </button>
          </div>

          <Textarea label="PRN / Breakthrough Medications" rows={2} value={form.prnMedications} onChange={(e) => set('prnMedications', e.target.value)} />
          <Textarea label="Medication Changes During Admission" rows={2} value={form.medicationChanges} onChange={(e) => set('medicationChanges', e.target.value)} />
          <YesNo label="Medication Reconciliation Completed" name="medicationReconciliation" value={form.medicationReconciliation} onChange={(v) => set('medicationReconciliation', v)} />
        </div>
      );

    // ── I – Symptom management ──
    case 'symptomMgmt':
      return (
        <div className="space-y-4">
          {[
            { key: 'painManagementInstructions' as const, label: 'Pain Management' },
            { key: 'breathlessnessManagement' as const, label: 'Breathlessness Management' },
            { key: 'nauseaVomitingManagement' as const, label: 'Nausea / Vomiting Management' },
            { key: 'constipationManagement' as const, label: 'Constipation Management' },
            { key: 'anxietyDeliriumManagement' as const, label: 'Anxiety / Agitation / Delirium Management' },
            { key: 'otherSymptomManagement' as const, label: 'Other Symptom Management' },
          ].map(({ key, label }) => (
            <Textarea
              key={key}
              label={label}
              rows={2}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          ))}
        </div>
      );

    // ── J – Nutrition ──
    case 'nutrition':
      return (
        <div className="space-y-4">
          <RadioGroup
            label="Diet"
            name="diet"
            value={form.diet}
            options={['Regular', 'Soft', 'Pureed', 'Modified', 'Other'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('diet', v)}
          />
          <RadioGroup
            label="Feeding Assistance"
            name="feedingAssistance"
            value={form.feedingAssistance}
            options={[
              { value: 'NotRequired', label: 'Not Required' },
              { value: 'Required', label: 'Required' },
            ]}
            onChange={(v) => set('feedingAssistance', v)}
          />
          <FieldRow cols={2}>
            <YesNo label="Enteral Feeding" name="enteralFeeding" value={form.enteralFeeding} onChange={(v) => set('enteralFeeding', v)} />
            <RadioGroup
              label="Feeding Tube"
              name="feedingTube"
              value={form.feedingTube}
              options={['None', 'NG', 'PEG', 'Other'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('feedingTube', v)}
            />
          </FieldRow>
          {form.feedingTube === 'Other' && (
            <Input placeholder="Specify feeding tube…" value={form.feedingTubeOther} onChange={(e) => set('feedingTubeOther', e.target.value)} />
          )}
          <Textarea label="Hydration Instructions" rows={2} value={form.hydrationInstructions} onChange={(e) => set('hydrationInstructions', e.target.value)} />
          <YesNo label="Nutrition / Dietitian Follow-Up" name="nutritionFollowUp" value={form.nutritionFollowUp} onChange={(v) => set('nutritionFollowUp', v)} />
        </div>
      );

    // ── K – Wound care ──
    case 'wound':
      return (
        <div className="space-y-4">
          <YesNo label="Wound / Pressure Injury Present" name="woundPresent" value={form.woundPresent} onChange={(v) => set('woundPresent', v)} />
          {form.woundPresent === 'Yes' && (
            <>
              <Input label="Location" value={form.woundLocation} onChange={(e) => set('woundLocation', e.target.value)} />
              <Textarea label="Care Instructions" rows={3} value={form.woundCareInstructions} onChange={(e) => set('woundCareInstructions', e.target.value)} />
              <Textarea label="Dressing Changes" rows={2} value={form.dressingChanges} onChange={(e) => set('dressingChanges', e.target.value)} />
            </>
          )}
          <Textarea label="Pressure-Injury Prevention Instructions" rows={2} value={form.pressureInjuryPrevention} onChange={(e) => set('pressureInjuryPrevention', e.target.value)} />
        </div>
      );

    // ── L – Equipment ──
    case 'equipment':
      return (
        <div className="space-y-4">
          <YesNo label="Oxygen Required at Discharge" name="oxygenRequired" value={form.oxygenRequired} onChange={(v) => set('oxygenRequired', v)} />
          {form.oxygenRequired === 'Yes' && (
            <FieldRow cols={3}>
              <RadioGroup
                label="Delivery Method"
                name="oxygenDeliveryMethod"
                value={form.oxygenDeliveryMethod}
                options={['NasalCannula', 'Mask', 'Other'].map((v) => ({ value: v, label: v }))}
                onChange={(v) => set('oxygenDeliveryMethod', v)}
              />
              <Input label="Flow Rate (L/min)" value={form.oxygenFlowRate} onChange={(e) => set('oxygenFlowRate', e.target.value)} />
              {form.oxygenDeliveryMethod === 'Other' && (
                <Input placeholder="Specify method…" value={form.oxygenDeliveryOther} onChange={(e) => set('oxygenDeliveryOther', e.target.value)} />
              )}
            </FieldRow>
          )}
          <CheckboxGroup
            label="Equipment Required"
            values={form.equipmentRequired}
            options={[
              'Hospital Bed',
              'Wheelchair',
              'Walker',
              'Commode',
              'Pressure-Relieving Mattress',
              'Oxygen Equipment',
              'Suction Equipment',
              'Other',
            ]}
            onChange={(v) => set('equipmentRequired', v)}
          />
          {form.equipmentRequired.includes('Other') && (
            <Input placeholder="Specify other equipment…" value={form.equipmentOther} onChange={(e) => set('equipmentOther', e.target.value)} />
          )}
          <YesNo label="Equipment Arranged" name="equipmentArranged" value={form.equipmentArranged} onChange={(v) => set('equipmentArranged', v)} />
        </div>
      );

    // ── M – Goals of care ──
    case 'goals':
      return (
        <div className="space-y-4">
          <CheckboxGroup
            label="Current Goals of Care"
            values={form.goalsOfCare}
            options={[
              'Comfort and Symptom Relief',
              'Quality of Life',
              'Functional Support',
              'Disease-Directed Treatment',
              'Hospice/End-of-Life Care',
              'Home-Based Palliative Care',
              'Other',
            ]}
            onChange={(v) => set('goalsOfCare', v)}
          />
          {form.goalsOfCare.includes('Other') && (
            <Input placeholder="Specify other goal…" value={form.goalsOfCareOther} onChange={(e) => set('goalsOfCareOther', e.target.value)} />
          )}
          <YesNo label="Goals of Care Reviewed" name="goalsOfCareReviewed" value={form.goalsOfCareReviewed} onChange={(v) => set('goalsOfCareReviewed', v)} />
          <Textarea label="Patient / Decision-Maker Preferences" rows={3} value={form.patientDecisionMakerPreferences} onChange={(e) => set('patientDecisionMakerPreferences', e.target.value)} />
          <RadioGroup
            label="Code Status / Resuscitation Preference"
            name="codeStatus"
            value={form.codeStatus}
            options={[
              { value: 'FullResuscitation', label: 'Full Resuscitation' },
              { value: 'DNAR', label: 'DNAR/DNR' },
              { value: 'Other', label: 'Other / Per Local Policy' },
            ]}
            onChange={(v) => set('codeStatus', v)}
          />
          {form.codeStatus === 'Other' && (
            <Input placeholder="Specify…" value={form.codeStatusOther} onChange={(e) => set('codeStatusOther', e.target.value)} />
          )}
          <RadioGroup
            label="Advance Care Plan / Advance Directive"
            name="advanceCarePlan"
            value={form.advanceCarePlan}
            options={['NotAvailable', 'Completed', 'Reviewed', 'Updated'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('advanceCarePlan', v)}
          />
        </div>
      );

    // ── N – Destination ──
    case 'destination':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">
              Discharged To <span className="text-error">*</span>
            </p>
            {errors.dischargedTo && <p className="text-xs text-error">{errors.dischargedTo}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Home',
                'Family/Caregiver Home',
                'Hospice',
                'Nursing/Long-Term Care Facility',
                'Another Hospital',
                'Other',
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
                  <input
                    type="radio"
                    name="dischargedTo"
                    value={opt}
                    checked={form.dischargedTo === opt}
                    onChange={() => set('dischargedTo', opt)}
                    className="h-3.5 w-3.5 text-primary"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {form.dischargedTo === 'Other' && (
              <Input placeholder="Specify destination…" value={form.dischargedToOther} onChange={(e) => set('dischargedToOther', e.target.value)} />
            )}
          </div>
          <Textarea label="Destination Address" rows={2} value={form.destinationAddress} onChange={(e) => set('destinationAddress', e.target.value)} />
          <RadioGroup
            label="Transport"
            name="transport"
            value={form.transport}
            options={[
              { value: 'FamilyPrivateTransport', label: 'Family / Private Transport' },
              { value: 'Ambulance', label: 'Ambulance' },
              { value: 'MedicalTransport', label: 'Medical Transport' },
              { value: 'Other', label: 'Other' },
            ]}
            onChange={(v) => set('transport', v)}
          />
          {form.transport === 'Other' && (
            <Input placeholder="Specify transport…" value={form.transportOther} onChange={(e) => set('transportOther', e.target.value)} />
          )}
          <Input label="Escort / Caregiver" value={form.escortCaregiver} onChange={(e) => set('escortCaregiver', e.target.value)} />
        </div>
      );

    // ── O – Home / hospice ──
    case 'homeCare':
      return (
        <div className="space-y-4">
          <FieldRow cols={2}>
            <YesNo label="Home Palliative Care Required" name="homePalliativeCareRequired" value={form.homePalliativeCareRequired} onChange={(v) => set('homePalliativeCareRequired', v)} />
            <RadioGroup
              label="Hospice Referral"
              name="hospiceReferral"
              value={form.hospiceReferral}
              options={['No', 'Yes', 'AlreadyEnrolled'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('hospiceReferral', v)}
            />
            <YesNo label="Community Nursing Required" name="communityNursingRequired" value={form.communityNursingRequired} onChange={(v) => set('communityNursingRequired', v)} />
            <YesNo label="Home Visits Required" name="homeVisitsRequired" value={form.homeVisitsRequired} onChange={(v) => set('homeVisitsRequired', v)} />
            <YesNo label="Caregiver Support Required" name="caregiverSupportRequired" value={form.caregiverSupportRequired} onChange={(v) => set('caregiverSupportRequired', v)} />
          </FieldRow>
          <Textarea label="Services Arranged" rows={2} value={form.servicesArranged} onChange={(e) => set('servicesArranged', e.target.value)} />
          <FieldRow cols={2}>
            <Input label="Responsible Home / Hospice Provider" value={form.responsibleProvider} onChange={(e) => set('responsibleProvider', e.target.value)} />
            <Input label="Telephone" value={form.responsibleProviderPhone} onChange={(e) => set('responsibleProviderPhone', e.target.value)} />
          </FieldRow>
        </div>
      );

    // ── P – Education ──
    case 'education':
      return (
        <div className="space-y-4">
          <CheckboxGroup
            label="Education Provided Regarding"
            values={form.educationTopics}
            options={[
              'Medication Administration',
              'Pain/Symptom Management',
              'Warning Signs',
              'Oxygen Safety',
              'Nutrition/Hydration',
              'Wound/Skin Care',
              'Positioning/Mobility',
              'Infection Prevention',
              'Emergency Contact Procedures',
              'End-of-Life Changes',
              'Advance Care Planning',
              'Hospice/Palliative Services',
              'Other',
            ]}
            onChange={(v) => set('educationTopics', v)}
          />
          {form.educationTopics.includes('Other') && (
            <Input placeholder="Specify other education topic…" value={form.educationOther} onChange={(e) => set('educationOther', e.target.value)} />
          )}
          <RadioGroup
            label="Patient / Caregiver Understanding"
            name="patientUnderstanding"
            value={form.patientUnderstanding}
            options={[
              { value: 'VerbalizedUnderstanding', label: 'Verbalized Understanding' },
              { value: 'DemonstratedUnderstanding', label: 'Demonstrated Understanding' },
              { value: 'RequiresFurtherEducation', label: 'Requires Further Education' },
            ]}
            onChange={(v) => set('patientUnderstanding', v)}
          />
          <Textarea label="Additional Education Required" rows={2} value={form.additionalEducationRequired} onChange={(e) => set('additionalEducationRequired', e.target.value)} />
        </div>
      );

    // ── Q – Warning signs ──
    case 'warnings':
      return (
        <div className="space-y-4">
          <CheckboxGroup
            label="Patient / Caregiver Instructed to Seek Help For"
            values={form.warningSigns}
            options={[
              'Uncontrolled or rapidly worsening pain',
              'Severe breathing difficulty',
              'Significant bleeding',
              'New or severe confusion',
              'Persistent vomiting',
              'Inability to take essential medication/fluids',
              'Sudden deterioration',
              'Other',
            ]}
            onChange={(v) => set('warningSigns', v)}
          />
          {form.warningSigns.includes('Other') && (
            <Input placeholder="Specify other warning sign…" value={form.warningSignsOther} onChange={(e) => set('warningSignsOther', e.target.value)} />
          )}
          <Textarea label="Specific Instructions" rows={3} value={form.warningSignsSpecificInstructions} onChange={(e) => set('warningSignsSpecificInstructions', e.target.value)} />
        </div>
      );

    // ── R – Follow-up ──
    case 'followUp':
      return (
        <div className="space-y-4">
          <YesNo label="Palliative Care Follow-Up" name="palliativeCareFollowUp" value={form.palliativeCareFollowUp} onChange={(v) => set('palliativeCareFollowUp', v)} />
          {form.palliativeCareFollowUp === 'Yes' && (
            <FieldRow cols={2}>
              <Input label="Date" type="date" value={form.palliativeCareFollowUpDate} onChange={(e) => set('palliativeCareFollowUpDate', e.target.value)} />
              <Input label="Time" type="time" value={form.palliativeCareFollowUpTime} onChange={(e) => set('palliativeCareFollowUpTime', e.target.value)} />
            </FieldRow>
          )}
          <Textarea label="Physician / Specialist Follow-Up" rows={2} value={form.physicianSpecialistFollowUp} onChange={(e) => set('physicianSpecialistFollowUp', e.target.value)} />
          <Textarea label="Primary Care Follow-Up" rows={2} value={form.primaryCareFollowUp} onChange={(e) => set('primaryCareFollowUp', e.target.value)} />
          <Textarea label="Hospice / Home Care Follow-Up" rows={2} value={form.hospiceHomeCareFollowUp} onChange={(e) => set('hospiceHomeCareFollowUp', e.target.value)} />
          <Textarea label="Other Appointments" rows={2} value={form.otherAppointments} onChange={(e) => set('otherAppointments', e.target.value)} />
        </div>
      );

    // ── S – Contacts ──
    case 'contacts':
      return (
        <FieldRow cols={2}>
          <AF fieldKey="palliativeCareUnitContact" label="Palliative Care Unit">
            <Input label="" value={form.palliativeCareUnitContact} onChange={(e) => set('palliativeCareUnitContact', e.target.value)} />
          </AF>
          <Input label="Telephone" value={form.palliativeCareUnitPhone} onChange={(e) => set('palliativeCareUnitPhone', e.target.value)} />
          <Input label="Attending / Responsible Clinician" value={form.attendingClinician} onChange={(e) => set('attendingClinician', e.target.value)} />
          <Input label="Telephone / Contact" value={form.attendingClinicianPhone} onChange={(e) => set('attendingClinicianPhone', e.target.value)} />
          <AF fieldKey="emergencyContactInfo" label="Emergency Contact">
            <Input label="" value={form.emergencyContactInfo} onChange={(e) => set('emergencyContactInfo', e.target.value)} />
          </AF>
          <Input label="Home / Hospice Service" value={form.homeHospiceService} onChange={(e) => set('homeHospiceService', e.target.value)} />
          <Input label="Hospice Service Telephone" value={form.homeHospiceServicePhone} onChange={(e) => set('homeHospiceServicePhone', e.target.value)} />
        </FieldRow>
      );

    // ── T – Notes ──
    case 'notes':
      return (
        <Textarea
          label="Additional Discharge Notes"
          rows={12}
          placeholder="Any additional clinical notes, instructions, or observations not covered above…"
          value={form.dischargeNotes}
          onChange={(e) => set('dischargeNotes', e.target.value)}
        />
      );
  }
};

export default DischargeSectionBody;