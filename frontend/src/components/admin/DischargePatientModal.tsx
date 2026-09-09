import React, { useState, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn, formatDate } from '@/lib/utils';
import type { AdminPatientDetail } from '@/types/admin.types';

// ── Local-only discharge summary type (no backend schema needed) ─
export interface DischargeMedRow {
  medication: string; dose: string; route: string;
  frequency: string; purpose: string; instructions: string;
}
export interface DischargeSymptomRow {
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe'; notes: string;
}
export interface DischargeSummary {
  // A
  hospitalName: string; palliativeCareUnit: string;
  dateOfAdmission: string; dateOfDischarge: string;
  timeOfDischarge: string; dischargeType: string; dischargeTypeOther: string;
  // B
  fullName: string; dateOfBirth: string; age: string; sex: string;
  address: string; telephone: string; primaryCaregiver: string;
  caregiverRelationship: string; caregiverTelephone: string;
  // C
  primaryDiagnosis: string; secondaryDiagnoses: string;
  reasonForAdmission: string; referringPhysicianFacility: string;
  // D
  finalDischargeDiagnosis: string; clinicalProblemsManaged: string[];
  summaryOfClinicalCourse: string; importantInvestigations: string;
  // E
  overallCondition: string; levelOfConsciousness: string;
  functionalStatus: string; mobility: string; oralIntake: string;
  // F
  temperature: string; pulse: string; respiratoryRate: string;
  bloodPressure: string; oxygenSaturation: string; oxygenRequirement: string;
  // G
  symptoms: Record<string, DischargeSymptomRow>;
  painScore: string; painControl: string;
  // H
  dischargeMedications: DischargeMedRow[];
  prnMedications: string; medicationChanges: string; medicationReconciliation: string;
  // I
  painManagementInstructions: string; breathlessnessManagement: string;
  nauseaVomitingManagement: string; constipationManagement: string;
  anxietyDeliriumManagement: string; otherSymptomManagement: string;
  // J
  diet: string; feedingAssistance: string; enteralFeeding: string;
  feedingTube: string; feedingTubeOther: string;
  hydrationInstructions: string; nutritionFollowUp: string;
  // K
  woundPresent: string; woundLocation: string; woundCareInstructions: string;
  dressingChanges: string; pressureInjuryPrevention: string;
  // L
  oxygenRequired: string; oxygenDeliveryMethod: string; oxygenDeliveryOther: string;
  oxygenFlowRate: string; equipmentRequired: string[]; equipmentOther: string;
  equipmentArranged: string;
  // M
  goalsOfCare: string[]; goalsOfCareOther: string; goalsOfCareReviewed: string;
  patientDecisionMakerPreferences: string;
  codeStatus: string; codeStatusOther: string; advanceCarePlan: string;
  // N
  dischargedTo: string; dischargedToOther: string; destinationAddress: string;
  transport: string; transportOther: string; escortCaregiver: string;
  // O
  homePalliativeCareRequired: string; hospiceReferral: string;
  communityNursingRequired: string; homeVisitsRequired: string;
  caregiverSupportRequired: string; servicesArranged: string;
  responsibleProvider: string; responsibleProviderPhone: string;
  // P
  educationTopics: string[]; educationOther: string;
  patientUnderstanding: string; additionalEducationRequired: string;
  // Q
  warningSigns: string[]; warningSignsOther: string;
  warningSignsSpecificInstructions: string;
  // R
  palliativeCareFollowUp: string; palliativeCareFollowUpDate: string;
  palliativeCareFollowUpTime: string; physicianSpecialistFollowUp: string;
  primaryCareFollowUp: string; hospiceHomeCareFollowUp: string; otherAppointments: string;
  // S
  palliativeCareUnitContact: string; palliativeCareUnitPhone: string;
  attendingClinician: string; attendingClinicianPhone: string;
  emergencyContactInfo: string; homeHospiceService: string; homeHospiceServicePhone: string;
  // T
  dischargeNotes: string;
  // Meta
  submittedBy: string; submittedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const SYMPTOM_KEYS = [
  'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting',
  'Constipation', 'Fatigue', 'Anxiety', 'Delirium/Confusion',
  'Appetite Loss', 'Other',
];

const blankMedRow = (): DischargeMedRow => ({
  medication: '', dose: '', route: '', frequency: '', purpose: '', instructions: '',
});

const blankSymptoms = (): Record<string, DischargeSymptomRow> =>
  Object.fromEntries(SYMPTOM_KEYS.map((k) => [k, { severity: 'None', notes: '' }]));

export function buildInitialDischargeSummary(patient: AdminPatientDetail): DischargeSummary {
  const secDx = [
    ...(patient.secondaryDiagnoses ?? []),
    ...(patient.comorbidities ?? []),
  ].join(', ');
  return {
    hospitalName: 'Yekatit 12 Hospital Medical College',
    palliativeCareUnit: 'Palliative Care Unit',
    dateOfAdmission: patient.createdAt ? patient.createdAt.slice(0, 10) : '',
    dateOfDischarge: today(),
    timeOfDischarge: nowTime(),
    dischargeType: '', dischargeTypeOther: '',
    fullName: `${patient.firstName} ${patient.lastName}`,
    dateOfBirth: patient.dateOfBirth ?? '',
    age: String(patient.age ?? ''),
    sex: patient.sex ?? '',
    address: patient.address ?? '',
    telephone: patient.phone ?? '',
    primaryCaregiver: patient.caregiverName ?? '',
    caregiverRelationship: '',
    caregiverTelephone: patient.caregiverPhone ?? '',
    primaryDiagnosis: patient.primaryDiagnosis ?? '',
    secondaryDiagnoses: secDx,
    reasonForAdmission: '', referringPhysicianFacility: '',
    finalDischargeDiagnosis: '',
    clinicalProblemsManaged: [''],
    summaryOfClinicalCourse: '', importantInvestigations: '',
    overallCondition: '', levelOfConsciousness: '',
    functionalStatus: '', mobility: '', oralIntake: '',
    temperature: '', pulse: '', respiratoryRate: '',
    bloodPressure: '', oxygenSaturation: '', oxygenRequirement: '',
    symptoms: blankSymptoms(),
    painScore: '', painControl: '',
    dischargeMedications: [blankMedRow()],
    prnMedications: '', medicationChanges: '', medicationReconciliation: '',
    painManagementInstructions: '', breathlessnessManagement: '',
    nauseaVomitingManagement: '', constipationManagement: '',
    anxietyDeliriumManagement: '', otherSymptomManagement: '',
    diet: '', feedingAssistance: '', enteralFeeding: '',
    feedingTube: '', feedingTubeOther: '',
    hydrationInstructions: '', nutritionFollowUp: '',
    woundPresent: '', woundLocation: '', woundCareInstructions: '',
    dressingChanges: '', pressureInjuryPrevention: '',
    oxygenRequired: '', oxygenDeliveryMethod: '', oxygenDeliveryOther: '',
    oxygenFlowRate: '', equipmentRequired: [], equipmentOther: '', equipmentArranged: '',
    goalsOfCare: [], goalsOfCareOther: '', goalsOfCareReviewed: '',
    patientDecisionMakerPreferences: '',
    codeStatus: '', codeStatusOther: '', advanceCarePlan: '',
    dischargedTo: '', dischargedToOther: '', destinationAddress: '',
    transport: '', transportOther: '', escortCaregiver: '',
    homePalliativeCareRequired: '', hospiceReferral: '',
    communityNursingRequired: '', homeVisitsRequired: '',
    caregiverSupportRequired: '', servicesArranged: '',
    responsibleProvider: '', responsibleProviderPhone: '',
    educationTopics: [], educationOther: '',
    patientUnderstanding: '', additionalEducationRequired: '',
    warningSigns: [], warningSignsOther: '',
    warningSignsSpecificInstructions: '',
    palliativeCareFollowUp: '', palliativeCareFollowUpDate: '',
    palliativeCareFollowUpTime: '', physicianSpecialistFollowUp: '',
    primaryCareFollowUp: '', hospiceHomeCareFollowUp: '', otherAppointments: '',
    palliativeCareUnitContact: 'Palliative Care Unit', palliativeCareUnitPhone: '',
    attendingClinician: '', attendingClinicianPhone: '',
    emergencyContactInfo: `${patient.emergencyContactName ?? ''} · ${patient.emergencyContactPhone ?? ''}`,
    homeHospiceService: '', homeHospiceServicePhone: '',
    dischargeNotes: '',
    submittedBy: 'Admin', submittedAt: '',
  };
}

// Fields autofilled from patient record
const AUTOFILLED_KEYS = new Set([
  'fullName', 'dateOfBirth', 'age', 'sex', 'address', 'telephone',
  'primaryCaregiver', 'caregiverTelephone', 'primaryDiagnosis',
  'secondaryDiagnoses', 'dateOfAdmission', 'hospitalName',
  'palliativeCareUnit', 'emergencyContactInfo',
]);

// ── Small reusable sub-components ────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide pb-2 border-b border-border-base mb-4">
    {children}
  </h3>
);

const FieldRow: React.FC<{ children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }> = ({
  children, cols = 2,
}) => (
  <div className={cn('grid gap-4', {
    'grid-cols-1': cols === 1,
    'grid-cols-1 sm:grid-cols-2': cols === 2,
    'grid-cols-1 sm:grid-cols-3': cols === 3,
    'grid-cols-2 sm:grid-cols-4': cols === 4,
  })}>
    {children}
  </div>
);

/**
 * FIX — Auto-filled badge.
 *
 * Root cause of the crash: the previous approach used React.cloneElement to
 * replace the child's `label` prop with a JSX element. But Input/Select/Textarea
 * all call `label.toLowerCase()` to auto-derive an HTML id, which throws when
 * label is a React node instead of a string.
 *
 * Solution: keep the child's `label` prop as a plain string (unchanged). Instead,
 * AF renders its own label row above the input — a <div> with the label text and
 * the inline badge side-by-side — while passing an empty-string label to the child
 * so the child skips its own label render but still derives an id from the `id`
 * prop we inject. We also pass an explicit `id` derived from the fieldKey so
 * the child's for/id association stays correct.
 */
const AF: React.FC<{ fieldKey: string; label: string; children: React.ReactElement }> = ({
  fieldKey, label, children,
}) => {
  const isAuto = AUTOFILLED_KEYS.has(fieldKey);
  const inputId = `af-${fieldKey}`;

  // Inject id into the child so it still gets a stable HTML id,
  // and clear its label so it doesn't render a duplicate label element.
  const childWithoutLabel = React.cloneElement(children, {
    id: inputId,
    label: undefined,
  } as Record<string, unknown>);

  return (
    <div className={cn(isAuto && 'rounded-lg ring-1 ring-primary/20 bg-primary/[0.025] p-0.5 -m-0.5')}>
      {/* Our own label row — always a plain DOM element, never passed to Input */}
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

/** Radio-button group */
const RadioGroup: React.FC<{
  label?: string; name: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void; required?: boolean;
}> = ({ label, name, value, options, onChange, required }) => (
  <div className="space-y-1">
    {label && (
      <p className="text-sm font-medium text-on-surface">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </p>
    )}
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
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

/** Checkbox group */
const CheckboxGroup: React.FC<{
  label?: string; values: string[];
  options: string[];
  onChange: (vals: string[]) => void;
}> = ({ label, values, options, onChange }) => {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="space-y-1">
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

/** Yes/No radio shorthand */
const YesNo: React.FC<{
  label: string; name: string; value: string; onChange: (v: string) => void;
}> = ({ label, name, value, onChange }) => (
  <RadioGroup
    label={label}
    name={name}
    value={value}
    options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
    onChange={onChange}
  />
);

// ── Tab definitions ───────────────────────────────────────────────

const TABS = [
  { id: 'A', label: 'Header' },
  { id: 'B', label: 'Patient ID' },
  { id: 'C', label: 'Admission' },
  { id: 'D', label: 'Clinical Summary' },
  { id: 'E', label: 'Condition' },
  { id: 'F', label: 'Vital Signs' },
  { id: 'G', label: 'Symptoms' },
  { id: 'H', label: 'Medications' },
  { id: 'I', label: 'Symptom Mgmt' },
  { id: 'J', label: 'Nutrition' },
  { id: 'K', label: 'Wound Care' },
  { id: 'L', label: 'Equipment' },
  { id: 'M', label: 'Goals of Care' },
  { id: 'N', label: 'Destination' },
  { id: 'O', label: 'Home/Hospice' },
  { id: 'P', label: 'Education' },
  { id: 'Q', label: 'Warning Signs' },
  { id: 'R', label: 'Follow-up' },
  { id: 'S', label: 'Contacts' },
  { id: 'T', label: 'Notes' },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Validation ────────────────────────────────────────────────────

function validate(form: DischargeSummary): Partial<Record<keyof DischargeSummary, string>> {
  const errors: Partial<Record<keyof DischargeSummary, string>> = {};
  if (!form.dateOfDischarge) errors.dateOfDischarge = 'Date of discharge is required.';
  if (!form.timeOfDischarge) errors.timeOfDischarge = 'Time of discharge is required.';
  if (!form.dischargeType) errors.dischargeType = 'Discharge type is required.';
  if (!form.overallCondition) errors.overallCondition = 'Overall condition is required.';
  if (!form.dischargedTo) errors.dischargedTo = 'Discharge destination is required.';
  return errors;
}

// ── Props ─────────────────────────────────────────────────────────

export interface DischargePatientModalProps {
  patient: AdminPatientDetail;
  onDischarge: (summary: DischargeSummary) => void;
  onClose: () => void;
}

// ── Main component (now renders as page content, not a modal) ─────

export const DischargePatientModal: React.FC<DischargePatientModalProps> = ({
  patient,
  onDischarge,
  onClose,
}) => {
  const [form, setForm] = useState<DischargeSummary>(() => buildInitialDischargeSummary(patient));
  const [activeTab, setActiveTab] = useState<TabId>('A');
  const [errors, setErrors] = useState<Partial<Record<keyof DischargeSummary, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const set = useCallback(<K extends keyof DischargeSummary>(key: K, value: DischargeSummary[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }, [errors]);

  const handleClose = () => {
    if (isDirty) { setShowDiscard(true); } else { onClose(); }
  };

  const handleSubmitClick = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const errKey = Object.keys(errs)[0] as keyof DischargeSummary;
      const tabMap: Partial<Record<keyof DischargeSummary, TabId>> = {
        dateOfDischarge: 'A', timeOfDischarge: 'A', dischargeType: 'A',
        overallCondition: 'E', dischargedTo: 'N',
      };
      const tab = tabMap[errKey];
      if (tab) setActiveTab(tab);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmDischarge = () => {
    onDischarge({ ...form, submittedAt: new Date().toISOString() });
  };

  const tabIdx = TABS.findIndex((t) => t.id === activeTab);
  const canGoPrev = tabIdx > 0;
  const canGoNext = tabIdx < TABS.length - 1;

  const tabHasError = (id: TabId) => {
    const tabFields: Partial<Record<TabId, (keyof DischargeSummary)[]>> = {
      A: ['dateOfDischarge', 'timeOfDischarge', 'dischargeType'],
      E: ['overallCondition'],
      N: ['dischargedTo'],
    };
    return (tabFields[id] ?? []).some((k) => !!errors[k]);
  };

  return (
    <>
      {/* ── Page-level form shell (no modal backdrop) ── */}
      <div className="space-y-0">

        {/* Tab strip */}
        <div className="flex border-b border-border-base overflow-x-auto bg-surface-low/40 rounded-t-xl">
          {TABS.map((tab) => {
            const hasErr = tabHasError(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0',
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-surface-lowest'
                    : 'border-transparent text-text-secondary hover:text-on-surface hover:bg-surface-low',
                  hasErr && 'text-error border-error'
                )}
              >
                <span className="font-mono text-[10px] opacity-60">{tab.id}</span>
                {tab.label}
                {hasErr && <span className="h-1.5 w-1.5 rounded-full bg-error flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="bg-surface-lowest border-x border-border-base px-6 py-6 min-h-[480px]">
          <TabContent tabId={activeTab} form={form} set={set} errors={errors} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border border-border-base rounded-b-xl bg-surface-low/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={!canGoPrev}
              onClick={() => setActiveTab(TABS[tabIdx - 1].id)}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              disabled={!canGoNext}
              onClick={() => setActiveTab(TABS[tabIdx + 1].id)}
            >
              Next
            </Button>
            <span className="text-xs text-text-muted ml-1">
              {tabIdx + 1} / {TABS.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSubmitClick}>
              Discharge Patient
            </Button>
          </div>
        </div>
      </div>

      {/* ── Confirmation dialog (stays as modal overlay) ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-error-bg flex items-center justify-center">
                <AlertTriangle size={18} className="text-error" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-on-surface">
                  Discharge {patient.firstName} {patient.lastName}?
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{patient.patientDisplayId}</p>
              </div>
            </div>
            <div className="bg-surface-low rounded-lg px-4 py-3 mb-4 space-y-1 text-sm">
              <p><span className="text-text-muted">Discharge date:</span>{' '}
                <strong>{form.dateOfDischarge ? formatDate(form.dateOfDischarge) : '—'}</strong>
              </p>
              <p><span className="text-text-muted">Discharge type:</span>{' '}
                <strong>
                  {form.dischargeType === 'Other' && form.dischargeTypeOther
                    ? form.dischargeTypeOther
                    : form.dischargeType || '—'}
                </strong>
              </p>
              <p><span className="text-text-muted">Discharged to:</span>{' '}
                <strong>
                  {form.dischargedTo === 'Other' && form.dischargedToOther
                    ? form.dischargedToOther
                    : form.dischargedTo || '—'}
                </strong>
              </p>
            </div>
            <p className="text-sm text-text-secondary mb-5">
              This will mark the patient's status as{' '}
              <strong className="text-on-surface">Discharged</strong> and cannot be easily undone.
              Are you sure you want to discharge this patient?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleConfirmDischarge}>
                Yes, Discharge Patient
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discard-changes dialog ── */}
      {showDiscard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h3 className="text-base font-semibold text-on-surface mb-2">Discard changes?</h3>
            <p className="text-sm text-text-secondary mb-5">
              You have unsaved changes in the discharge form. If you go back now, all entered data will be lost.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDiscard(false)}>
                Keep Editing
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onClose}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Tab content renderer ──────────────────────────────────────────

interface TabContentProps {
  tabId: TabId;
  form: DischargeSummary;
  set: <K extends keyof DischargeSummary>(key: K, value: DischargeSummary[K]) => void;
  errors: Partial<Record<keyof DischargeSummary, string>>;
}

const TabContent: React.FC<TabContentProps> = ({ tabId, form, set, errors }) => {
  switch (tabId) {

    // ── A – Header info ──────────────────────────────────────────
    case 'A': return (
      <div className="space-y-4">
        <SectionTitle>A — Header Information</SectionTitle>
        <FieldRow cols={2}>
          <AF fieldKey="hospitalName" label="Hospital / Facility Name">
            <Input label="" value={form.hospitalName}
              onChange={(e) => set('hospitalName', e.target.value)} />
          </AF>
          <AF fieldKey="palliativeCareUnit" label="Palliative Care Unit">
            <Input label="" value={form.palliativeCareUnit}
              onChange={(e) => set('palliativeCareUnit', e.target.value)} />
          </AF>
        </FieldRow>
        <FieldRow cols={3}>
          <AF fieldKey="dateOfAdmission" label="Date of Admission">
            <Input label="" type="date" value={form.dateOfAdmission}
              onChange={(e) => set('dateOfAdmission', e.target.value)} />
          </AF>
          <Input label="Date of Discharge *" type="date" value={form.dateOfDischarge}
            onChange={(e) => set('dateOfDischarge', e.target.value)}
            error={errors.dateOfDischarge} />
          <Input label="Time of Discharge *" type="time" value={form.timeOfDischarge}
            onChange={(e) => set('timeOfDischarge', e.target.value)}
            error={errors.timeOfDischarge} />
        </FieldRow>
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">
            Discharge Type <span className="text-error">*</span>
          </p>
          {errors.dischargeType && (
            <p className="text-xs text-error">{errors.dischargeType}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Planned Discharge', 'Transfer', 'Discharge to Home',
              'Discharge to Hospice', 'Discharge to Long-Term Care Facility',
              'Transfer to Another Hospital/Facility', 'Other',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
                <input type="radio" name="dischargeType" value={opt}
                  checked={form.dischargeType === opt}
                  onChange={() => set('dischargeType', opt)}
                  className="h-3.5 w-3.5 text-primary" />
                {opt}
              </label>
            ))}
          </div>
          {form.dischargeType === 'Other' && (
            <Input placeholder="Specify discharge type…" value={form.dischargeTypeOther}
              onChange={(e) => set('dischargeTypeOther', e.target.value)} />
          )}
        </div>
      </div>
    );

    // ── B – Patient identification ───────────────────────────────
    case 'B': return (
      <div className="space-y-4">
        <SectionTitle>B — Patient Identification</SectionTitle>
        <FieldRow cols={2}>
          <AF fieldKey="fullName" label="Full Name">
            <Input label="" value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)} />
          </AF>
          <AF fieldKey="dateOfBirth" label="Date of Birth">
            <Input label="" type="date" value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)} />
          </AF>
          <AF fieldKey="age" label="Age">
            <Input label="" value={form.age}
              onChange={(e) => set('age', e.target.value)} />
          </AF>
          <AF fieldKey="sex" label="Sex">
            <Select label="" value={form.sex}
              onChange={(e) => set('sex', e.target.value)}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]} placeholder="Select…" />
          </AF>
        </FieldRow>
        <AF fieldKey="address" label="Address">
          <Input label="" value={form.address}
            onChange={(e) => set('address', e.target.value)} />
        </AF>
        <AF fieldKey="telephone" label="Telephone / Mobile">
          <Input label="" value={form.telephone}
            onChange={(e) => set('telephone', e.target.value)} />
        </AF>
        <FieldRow cols={3}>
          <AF fieldKey="primaryCaregiver" label="Primary Caregiver">
            <Input label="" value={form.primaryCaregiver}
              onChange={(e) => set('primaryCaregiver', e.target.value)} />
          </AF>
          <Input label="Relationship" value={form.caregiverRelationship}
            onChange={(e) => set('caregiverRelationship', e.target.value)} />
          <AF fieldKey="caregiverTelephone" label="Caregiver Telephone">
            <Input label="" value={form.caregiverTelephone}
              onChange={(e) => set('caregiverTelephone', e.target.value)} />
          </AF>
        </FieldRow>
      </div>
    );

    // ── C – Admission info ───────────────────────────────────────
    case 'C': return (
      <div className="space-y-4">
        <SectionTitle>C — Admission Information</SectionTitle>
        <AF fieldKey="primaryDiagnosis" label="Primary Diagnosis">
          <Input label="" value={form.primaryDiagnosis}
            onChange={(e) => set('primaryDiagnosis', e.target.value)} />
        </AF>
        <AF fieldKey="secondaryDiagnoses" label="Secondary Diagnoses / Comorbidities">
          <Textarea label="" rows={3}
            value={form.secondaryDiagnoses}
            onChange={(e) => set('secondaryDiagnoses', e.target.value)} />
        </AF>
        <Textarea label="Reason for Palliative Care Admission" rows={3}
          value={form.reasonForAdmission}
          onChange={(e) => set('reasonForAdmission', e.target.value)} />
        <Input label="Referring Physician / Facility" value={form.referringPhysicianFacility}
          onChange={(e) => set('referringPhysicianFacility', e.target.value)} />
      </div>
    );

    // ── D – Discharge diagnosis / clinical summary ───────────────
    case 'D': return (
      <div className="space-y-4">
        <SectionTitle>D — Discharge Diagnosis / Clinical Summary</SectionTitle>
        <Input label="Final / Discharge Diagnosis" value={form.finalDischargeDiagnosis}
          onChange={(e) => set('finalDischargeDiagnosis', e.target.value)} />
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
                  onClick={() => set('clinicalProblemsManaged',
                    form.clinicalProblemsManaged.filter((_, j) => j !== i))}
                  className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error-bg transition-all flex-shrink-0"
                  aria-label="Remove problem"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" leftIcon={<Plus size={13} />}
            onClick={() => set('clinicalProblemsManaged', [...form.clinicalProblemsManaged, ''])}>
            Add Problem
          </Button>
        </div>
        <Textarea label="Summary of Clinical Course" rows={4}
          value={form.summaryOfClinicalCourse}
          onChange={(e) => set('summaryOfClinicalCourse', e.target.value)} />
        <Textarea label="Important Investigations / Results" rows={3}
          value={form.importantInvestigations}
          onChange={(e) => set('importantInvestigations', e.target.value)} />
      </div>
    );

    // ── E – Condition at discharge ───────────────────────────────
    case 'E': return (
      <div className="space-y-4">
        <SectionTitle>E — Condition at Discharge</SectionTitle>
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
            { value: 'Requires Ongoing Palliative/Hospice Care', label: 'Requires Ongoing Palliative/Hospice Care' },
          ]}
        />
        <FieldRow cols={2}>
          <Select label="Level of Consciousness" value={form.levelOfConsciousness}
            onChange={(e) => set('levelOfConsciousness', e.target.value)}
            placeholder="Select…"
            options={['Alert','Drowsy','Confused','Delirious','Unresponsive'].map((v) => ({ value: v, label: v }))} />
          <Select label="Functional Status" value={form.functionalStatus}
            onChange={(e) => set('functionalStatus', e.target.value)}
            placeholder="Select…"
            options={['Independent','Requires Assistance','Bedbound','Fully Dependent'].map((v) => ({ value: v, label: v }))} />
          <Select label="Mobility" value={form.mobility}
            onChange={(e) => set('mobility', e.target.value)}
            placeholder="Select…"
            options={['Independent','Assisted','Wheelchair','Bedbound'].map((v) => ({ value: v, label: v }))} />
          <Select label="Oral Intake" value={form.oralIntake}
            onChange={(e) => set('oralIntake', e.target.value)}
            placeholder="Select…"
            options={['Adequate','Reduced','Minimal','None'].map((v) => ({ value: v, label: v }))} />
        </FieldRow>
      </div>
    );

    // ── F – Vital signs ──────────────────────────────────────────
    case 'F': return (
      <div className="space-y-4">
        <SectionTitle>F — Discharge Vital Signs</SectionTitle>
        <FieldRow cols={3}>
          <Input label="Temperature (°C)" placeholder="e.g. 37.2" value={form.temperature}
            onChange={(e) => set('temperature', e.target.value)} />
          <Input label="Pulse / Heart Rate (bpm)" placeholder="e.g. 88" value={form.pulse}
            onChange={(e) => set('pulse', e.target.value)} />
          <Input label="Respiratory Rate (/min)" placeholder="e.g. 18" value={form.respiratoryRate}
            onChange={(e) => set('respiratoryRate', e.target.value)} />
          <Input label="Blood Pressure (mmHg)" placeholder="e.g. 120/80" value={form.bloodPressure}
            onChange={(e) => set('bloodPressure', e.target.value)} />
          <Input label="O₂ Saturation (%)" placeholder="e.g. 96" value={form.oxygenSaturation}
            onChange={(e) => set('oxygenSaturation', e.target.value)} />
          <Input label="O₂ Requirement (L/min)" placeholder="e.g. 2" value={form.oxygenRequirement}
            onChange={(e) => set('oxygenRequirement', e.target.value)} />
        </FieldRow>
      </div>
    );

    // ── G – Symptom status ───────────────────────────────────────
    case 'G': return (
      <div className="space-y-4">
        <SectionTitle>G — Symptom Status at Discharge</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted">
                <th className="pb-2 pr-3 font-medium w-36">Symptom</th>
                {['None','Mild','Moderate','Severe'].map((s) => (
                  <th key={s} className="pb-2 pr-2 font-medium text-center w-16">{s}</th>
                ))}
                <th className="pb-2 font-medium">Management / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {SYMPTOM_KEYS.map((symptom) => {
                const row = form.symptoms[symptom];
                return (
                  <tr key={symptom} className="align-middle">
                    <td className="py-2 pr-3 text-on-surface font-medium text-xs">{symptom}</td>
                    {(['None','Mild','Moderate','Severe'] as const).map((sev) => (
                      <td key={sev} className="py-2 pr-2 text-center">
                        <input type="radio"
                          name={`symptom-${symptom}`}
                          checked={row.severity === sev}
                          onChange={() => set('symptoms', {
                            ...form.symptoms,
                            [symptom]: { ...row, severity: sev },
                          })}
                          className="h-3.5 w-3.5 text-primary" />
                      </td>
                    ))}
                    <td className="py-2">
                      <input
                        type="text"
                        placeholder="Notes…"
                        value={row.notes}
                        onChange={(e) => set('symptoms', {
                          ...form.symptoms,
                          [symptom]: { ...row, notes: e.target.value },
                        })}
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
          <Input label="Pain Score at Discharge (0–10)" type="number" min={0} max={10}
            placeholder="0–10" value={form.painScore}
            onChange={(e) => set('painScore', e.target.value)} />
          <Select label="Pain Control" value={form.painControl}
            onChange={(e) => set('painControl', e.target.value)}
            placeholder="Select…"
            options={[
              { value: 'Well Controlled', label: 'Well Controlled' },
              { value: 'Partially Controlled', label: 'Partially Controlled' },
              { value: 'Poorly Controlled', label: 'Poorly Controlled' },
            ]} />
        </FieldRow>
      </div>
    );

    // ── H – Discharge medications ────────────────────────────────
    case 'H': return (
      <div className="space-y-4">
        <SectionTitle>H — Discharge Medications</SectionTitle>
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-muted">
                  {['Medication','Dose','Route','Frequency','Purpose','Instructions',''].map((h, i) => (
                    <th key={i} className="pb-2 pr-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {form.dischargeMedications.map((row, i) => (
                  <tr key={i} className="align-top">
                    {(['medication','dose','route','frequency','purpose','instructions'] as (keyof DischargeMedRow)[]).map((field) => (
                      <td key={field} className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={row[field]}
                          onChange={(e) => {
                            const arr = form.dischargeMedications.map((r, j) =>
                              j === i ? { ...r, [field]: e.target.value } : r
                            );
                            set('dischargeMedications', arr);
                          }}
                          className="block w-full min-w-[80px] rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                    ))}
                    <td className="py-1.5">
                      {form.dischargeMedications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => set('dischargeMedications',
                            form.dischargeMedications.filter((_, j) => j !== i))}
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
          <Button variant="outline" size="sm" leftIcon={<Plus size={13} />}
            onClick={() => set('dischargeMedications', [...form.dischargeMedications, blankMedRow()])}>
            Add Medication
          </Button>
        </div>
        <Textarea label="PRN / Breakthrough Medications" rows={2}
          value={form.prnMedications}
          onChange={(e) => set('prnMedications', e.target.value)} />
        <Textarea label="Medication Changes During Admission" rows={2}
          value={form.medicationChanges}
          onChange={(e) => set('medicationChanges', e.target.value)} />
        <YesNo label="Medication Reconciliation Completed"
          name="medicationReconciliation" value={form.medicationReconciliation}
          onChange={(v) => set('medicationReconciliation', v)} />
      </div>
    );

    // ── I – Symptom management instructions ─────────────────────
    case 'I': return (
      <div className="space-y-4">
        <SectionTitle>I — Symptom Management Instructions</SectionTitle>
        {[
          { key: 'painManagementInstructions' as const, label: 'Pain Management' },
          { key: 'breathlessnessManagement' as const, label: 'Breathlessness Management' },
          { key: 'nauseaVomitingManagement' as const, label: 'Nausea / Vomiting Management' },
          { key: 'constipationManagement' as const, label: 'Constipation Management' },
          { key: 'anxietyDeliriumManagement' as const, label: 'Anxiety / Agitation / Delirium Management' },
          { key: 'otherSymptomManagement' as const, label: 'Other Symptom Management' },
        ].map(({ key, label }) => (
          <Textarea key={key} label={label} rows={2}
            value={form[key] as string}
            onChange={(e) => set(key, e.target.value)} />
        ))}
      </div>
    );

    // ── J – Nutrition & hydration ────────────────────────────────
    case 'J': return (
      <div className="space-y-4">
        <SectionTitle>J — Nutrition &amp; Hydration</SectionTitle>
        <RadioGroup label="Diet" name="diet" value={form.diet}
          options={['Regular','Soft','Pureed','Modified','Other'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('diet', v)} />
        <RadioGroup label="Feeding Assistance" name="feedingAssistance" value={form.feedingAssistance}
          options={[{ value: 'Not Required', label: 'Not Required' }, { value: 'Required', label: 'Required' }]}
          onChange={(v) => set('feedingAssistance', v)} />
        <FieldRow cols={2}>
          <YesNo label="Enteral Feeding" name="enteralFeeding" value={form.enteralFeeding}
            onChange={(v) => set('enteralFeeding', v)} />
          <RadioGroup label="Feeding Tube" name="feedingTube" value={form.feedingTube}
            options={['None','NG','PEG','Other'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('feedingTube', v)} />
        </FieldRow>
        {form.feedingTube === 'Other' && (
          <Input placeholder="Specify feeding tube…" value={form.feedingTubeOther}
            onChange={(e) => set('feedingTubeOther', e.target.value)} />
        )}
        <Textarea label="Hydration Instructions" rows={2}
          value={form.hydrationInstructions}
          onChange={(e) => set('hydrationInstructions', e.target.value)} />
        <YesNo label="Nutrition / Dietitian Follow-Up" name="nutritionFollowUp" value={form.nutritionFollowUp}
          onChange={(v) => set('nutritionFollowUp', v)} />
      </div>
    );

    // ── K – Wound / skin care ────────────────────────────────────
    case 'K': return (
      <div className="space-y-4">
        <SectionTitle>K — Wound / Skin Care</SectionTitle>
        <YesNo label="Wound / Pressure Injury Present" name="woundPresent" value={form.woundPresent}
          onChange={(v) => set('woundPresent', v)} />
        {form.woundPresent === 'Yes' && (
          <>
            <Input label="Location" value={form.woundLocation}
              onChange={(e) => set('woundLocation', e.target.value)} />
            <Textarea label="Care Instructions" rows={3} value={form.woundCareInstructions}
              onChange={(e) => set('woundCareInstructions', e.target.value)} />
            <Textarea label="Dressing Changes" rows={2} value={form.dressingChanges}
              onChange={(e) => set('dressingChanges', e.target.value)} />
          </>
        )}
        <Textarea label="Pressure-Injury Prevention Instructions" rows={2}
          value={form.pressureInjuryPrevention}
          onChange={(e) => set('pressureInjuryPrevention', e.target.value)} />
      </div>
    );

    // ── L – Oxygen / medical equipment ──────────────────────────
    case 'L': return (
      <div className="space-y-4">
        <SectionTitle>L — Oxygen / Medical Equipment</SectionTitle>
        <YesNo label="Oxygen Required at Discharge" name="oxygenRequired" value={form.oxygenRequired}
          onChange={(v) => set('oxygenRequired', v)} />
        {form.oxygenRequired === 'Yes' && (
          <FieldRow cols={3}>
            <RadioGroup label="Delivery Method" name="oxygenDeliveryMethod" value={form.oxygenDeliveryMethod}
              options={['Nasal Cannula','Mask','Other'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('oxygenDeliveryMethod', v)} />
            <Input label="Flow Rate (L/min)" value={form.oxygenFlowRate}
              onChange={(e) => set('oxygenFlowRate', e.target.value)} />
            {form.oxygenDeliveryMethod === 'Other' && (
              <Input placeholder="Specify method…" value={form.oxygenDeliveryOther}
                onChange={(e) => set('oxygenDeliveryOther', e.target.value)} />
            )}
          </FieldRow>
        )}
        <CheckboxGroup label="Equipment Required"
          values={form.equipmentRequired}
          options={[
            'Hospital Bed','Wheelchair','Walker','Commode',
            'Pressure-Relieving Mattress','Oxygen Equipment','Suction Equipment','Other',
          ]}
          onChange={(v) => set('equipmentRequired', v)} />
        {form.equipmentRequired.includes('Other') && (
          <Input placeholder="Specify other equipment…" value={form.equipmentOther}
            onChange={(e) => set('equipmentOther', e.target.value)} />
        )}
        <YesNo label="Equipment Arranged" name="equipmentArranged" value={form.equipmentArranged}
          onChange={(v) => set('equipmentArranged', v)} />
      </div>
    );

    // ── M – Goals of care ────────────────────────────────────────
    case 'M': return (
      <div className="space-y-4">
        <SectionTitle>M — Goals of Care</SectionTitle>
        <CheckboxGroup label="Current Goals of Care"
          values={form.goalsOfCare}
          options={[
            'Comfort and Symptom Relief','Quality of Life','Functional Support',
            'Disease-Directed Treatment','Hospice/End-of-Life Care',
            'Home-Based Palliative Care','Other',
          ]}
          onChange={(v) => set('goalsOfCare', v)} />
        {form.goalsOfCare.includes('Other') && (
          <Input placeholder="Specify other goal…" value={form.goalsOfCareOther}
            onChange={(e) => set('goalsOfCareOther', e.target.value)} />
        )}
        <YesNo label="Goals of Care Reviewed" name="goalsOfCareReviewed" value={form.goalsOfCareReviewed}
          onChange={(v) => set('goalsOfCareReviewed', v)} />
        <Textarea label="Patient / Decision-Maker Preferences" rows={3}
          value={form.patientDecisionMakerPreferences}
          onChange={(e) => set('patientDecisionMakerPreferences', e.target.value)} />
        <RadioGroup label="Code Status / Resuscitation Preference" name="codeStatus" value={form.codeStatus}
          options={[
            { value: 'Full Resuscitation', label: 'Full Resuscitation' },
            { value: 'DNAR/DNR', label: 'DNAR/DNR' },
            { value: 'Other', label: 'Other / Per Local Policy' },
          ]}
          onChange={(v) => set('codeStatus', v)} />
        {form.codeStatus === 'Other' && (
          <Input placeholder="Specify…" value={form.codeStatusOther}
            onChange={(e) => set('codeStatusOther', e.target.value)} />
        )}
        <RadioGroup label="Advance Care Plan / Advance Directive" name="advanceCarePlan" value={form.advanceCarePlan}
          options={['Not Available','Completed','Reviewed','Updated'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('advanceCarePlan', v)} />
      </div>
    );

    // ── N – Discharge destination ────────────────────────────────
    case 'N': return (
      <div className="space-y-4">
        <SectionTitle>N — Discharge Destination</SectionTitle>
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">
            Discharged To <span className="text-error">*</span>
          </p>
          {errors.dischargedTo && <p className="text-xs text-error">{errors.dischargedTo}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Home','Family/Caregiver Home','Hospice','Nursing/Long-Term Care Facility','Another Hospital','Other'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
                <input type="radio" name="dischargedTo" value={opt}
                  checked={form.dischargedTo === opt}
                  onChange={() => set('dischargedTo', opt)}
                  className="h-3.5 w-3.5 text-primary" />
                {opt}
              </label>
            ))}
          </div>
          {form.dischargedTo === 'Other' && (
            <Input placeholder="Specify destination…" value={form.dischargedToOther}
              onChange={(e) => set('dischargedToOther', e.target.value)} />
          )}
        </div>
        <Textarea label="Destination Address" rows={2} value={form.destinationAddress}
          onChange={(e) => set('destinationAddress', e.target.value)} />
        <RadioGroup label="Transport" name="transport" value={form.transport}
          options={[
            { value: 'Family/Private Transport', label: 'Family / Private Transport' },
            { value: 'Ambulance', label: 'Ambulance' },
            { value: 'Medical Transport', label: 'Medical Transport' },
            { value: 'Other', label: 'Other' },
          ]}
          onChange={(v) => set('transport', v)} />
        {form.transport === 'Other' && (
          <Input placeholder="Specify transport…" value={form.transportOther}
            onChange={(e) => set('transportOther', e.target.value)} />
        )}
        <Input label="Escort / Caregiver" value={form.escortCaregiver}
          onChange={(e) => set('escortCaregiver', e.target.value)} />
      </div>
    );

    // ── O – Home / hospice care plan ─────────────────────────────
    case 'O': return (
      <div className="space-y-4">
        <SectionTitle>O — Home / Hospice Care Plan</SectionTitle>
        <FieldRow cols={2}>
          <YesNo label="Home Palliative Care Required" name="homePalliativeCareRequired"
            value={form.homePalliativeCareRequired}
            onChange={(v) => set('homePalliativeCareRequired', v)} />
          <RadioGroup label="Hospice Referral" name="hospiceReferral" value={form.hospiceReferral}
            options={['No','Yes','Already Enrolled'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('hospiceReferral', v)} />
          <YesNo label="Community Nursing Required" name="communityNursingRequired"
            value={form.communityNursingRequired}
            onChange={(v) => set('communityNursingRequired', v)} />
          <YesNo label="Home Visits Required" name="homeVisitsRequired"
            value={form.homeVisitsRequired}
            onChange={(v) => set('homeVisitsRequired', v)} />
          <YesNo label="Caregiver Support Required" name="caregiverSupportRequired"
            value={form.caregiverSupportRequired}
            onChange={(v) => set('caregiverSupportRequired', v)} />
        </FieldRow>
        <Textarea label="Services Arranged" rows={2} value={form.servicesArranged}
          onChange={(e) => set('servicesArranged', e.target.value)} />
        <FieldRow cols={2}>
          <Input label="Responsible Home / Hospice Provider" value={form.responsibleProvider}
            onChange={(e) => set('responsibleProvider', e.target.value)} />
          <Input label="Telephone" value={form.responsibleProviderPhone}
            onChange={(e) => set('responsibleProviderPhone', e.target.value)} />
        </FieldRow>
      </div>
    );

    // ── P – Patient & caregiver education ────────────────────────
    case 'P': return (
      <div className="space-y-4">
        <SectionTitle>P — Patient &amp; Caregiver Education</SectionTitle>
        <CheckboxGroup label="Education Provided Regarding"
          values={form.educationTopics}
          options={[
            'Medication Administration','Pain/Symptom Management','Warning Signs',
            'Oxygen Safety','Nutrition/Hydration','Wound/Skin Care',
            'Positioning/Mobility','Infection Prevention','Emergency Contact Procedures',
            'End-of-Life Changes','Advance Care Planning','Hospice/Palliative Services','Other',
          ]}
          onChange={(v) => set('educationTopics', v)} />
        {form.educationTopics.includes('Other') && (
          <Input placeholder="Specify other education topic…" value={form.educationOther}
            onChange={(e) => set('educationOther', e.target.value)} />
        )}
        <RadioGroup label="Patient / Caregiver Understanding" name="patientUnderstanding"
          value={form.patientUnderstanding}
          options={[
            { value: 'Verbalized Understanding', label: 'Verbalized Understanding' },
            { value: 'Demonstrated Understanding', label: 'Demonstrated Understanding' },
            { value: 'Requires Further Education', label: 'Requires Further Education' },
          ]}
          onChange={(v) => set('patientUnderstanding', v)} />
        <Textarea label="Additional Education Required" rows={2}
          value={form.additionalEducationRequired}
          onChange={(e) => set('additionalEducationRequired', e.target.value)} />
      </div>
    );

    // ── Q – Warning signs ────────────────────────────────────────
    case 'Q': return (
      <div className="space-y-4">
        <SectionTitle>Q — Warning Signs / When to Seek Help</SectionTitle>
        <CheckboxGroup label="Patient / Caregiver Instructed to Seek Help For"
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
          onChange={(v) => set('warningSigns', v)} />
        {form.warningSigns.includes('Other') && (
          <Input placeholder="Specify other warning sign…" value={form.warningSignsOther}
            onChange={(e) => set('warningSignsOther', e.target.value)} />
        )}
        <Textarea label="Specific Instructions" rows={3}
          value={form.warningSignsSpecificInstructions}
          onChange={(e) => set('warningSignsSpecificInstructions', e.target.value)} />
      </div>
    );

    // ── R – Follow-up plan ───────────────────────────────────────
    case 'R': return (
      <div className="space-y-4">
        <SectionTitle>R — Follow-up Plan</SectionTitle>
        <YesNo label="Palliative Care Follow-Up" name="palliativeCareFollowUp"
          value={form.palliativeCareFollowUp}
          onChange={(v) => set('palliativeCareFollowUp', v)} />
        {form.palliativeCareFollowUp === 'Yes' && (
          <FieldRow cols={2}>
            <Input label="Date" type="date" value={form.palliativeCareFollowUpDate}
              onChange={(e) => set('palliativeCareFollowUpDate', e.target.value)} />
            <Input label="Time" type="time" value={form.palliativeCareFollowUpTime}
              onChange={(e) => set('palliativeCareFollowUpTime', e.target.value)} />
          </FieldRow>
        )}
        <Textarea label="Physician / Specialist Follow-Up" rows={2}
          value={form.physicianSpecialistFollowUp}
          onChange={(e) => set('physicianSpecialistFollowUp', e.target.value)} />
        <Textarea label="Primary Care Follow-Up" rows={2}
          value={form.primaryCareFollowUp}
          onChange={(e) => set('primaryCareFollowUp', e.target.value)} />
        <Textarea label="Hospice / Home Care Follow-Up" rows={2}
          value={form.hospiceHomeCareFollowUp}
          onChange={(e) => set('hospiceHomeCareFollowUp', e.target.value)} />
        <Textarea label="Other Appointments" rows={2}
          value={form.otherAppointments}
          onChange={(e) => set('otherAppointments', e.target.value)} />
      </div>
    );

    // ── S – Contact information ──────────────────────────────────
    case 'S': return (
      <div className="space-y-4">
        <SectionTitle>S — Contact Information</SectionTitle>
        <FieldRow cols={2}>
          <AF fieldKey="palliativeCareUnitContact" label="Palliative Care Unit">
            <Input label="" value={form.palliativeCareUnitContact}
              onChange={(e) => set('palliativeCareUnitContact', e.target.value)} />
          </AF>
          <Input label="Telephone" value={form.palliativeCareUnitPhone}
            onChange={(e) => set('palliativeCareUnitPhone', e.target.value)} />
          <Input label="Attending / Responsible Clinician" value={form.attendingClinician}
            onChange={(e) => set('attendingClinician', e.target.value)} />
          <Input label="Telephone / Contact" value={form.attendingClinicianPhone}
            onChange={(e) => set('attendingClinicianPhone', e.target.value)} />
          <AF fieldKey="emergencyContactInfo" label="Emergency Contact">
            <Input label="" value={form.emergencyContactInfo}
              onChange={(e) => set('emergencyContactInfo', e.target.value)} />
          </AF>
          <Input label="Home / Hospice Service" value={form.homeHospiceService}
            onChange={(e) => set('homeHospiceService', e.target.value)} />
          <Input label="Hospice Service Telephone" value={form.homeHospiceServicePhone}
            onChange={(e) => set('homeHospiceServicePhone', e.target.value)} />
        </FieldRow>
      </div>
    );

    // ── T – Discharge notes ──────────────────────────────────────
    case 'T': return (
      <div className="space-y-4">
        <SectionTitle>T — Discharge Notes</SectionTitle>
        <Textarea
          label="Additional Discharge Notes"
          rows={10}
          placeholder="Any additional clinical notes, instructions, or observations not covered above…"
          value={form.dischargeNotes}
          onChange={(e) => set('dischargeNotes', e.target.value)}
        />
      </div>
    );

    default: return null;
  }
};
