import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  NotebookPen,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateProgressNote,
  buildBlankProgressNote,
  type ProgressNote,
  type ProgressNoteMedRow,
  type ProgressNoteAdditionalEntry,
} from '@/hooks/useProgressNotes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import ProgressNoteSignatureSection from '@/components/progress-notes/ProgressNoteSignatureSection';

// ─────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'header',    label: 'Header' },
  { id: 'status',    label: '1–2 Status & Vitals' },
  { id: 'symptoms',  label: '3 Symptoms' },
  { id: 'resp',      label: '4–6 Resp / Nutrition / Elimination' },
  { id: 'skin',      label: '7–8 Skin & Psych' },
  { id: 'spiritual', label: '9–11 Spiritual / Family / Goals' },
  { id: 'meds',      label: '12–13 Meds & Nursing' },
  { id: 'invest',    label: '14–15 Investigations & MDT' },
  { id: 'assess',    label: '16–18 Assessment & SOAP' },
  { id: 'auth',      label: '19–20 Notes & Auth' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─────────────────────────────────────────────────────────────
// Small UI helpers
// ─────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ num: string | number; children: React.ReactNode }> = ({
  num, children,
}) => (
  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide pb-2 border-b border-border-base mb-4 flex items-center gap-2">
    <span className="font-mono text-[11px] bg-primary/10 text-primary rounded px-1.5 py-0.5">
      {num}
    </span>
    {children}
  </h3>
);

const Grid: React.FC<{ cols?: 2 | 3 | 4; children: React.ReactNode }> = ({
  cols = 2, children,
}) => (
  <div className={cn('grid gap-4', {
    'grid-cols-1 sm:grid-cols-2': cols === 2,
    'grid-cols-1 sm:grid-cols-3': cols === 3,
    'grid-cols-2 sm:grid-cols-4': cols === 4,
  })}>
    {children}
  </div>
);

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
    options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
    onChange={onChange}
  />
);

const CheckboxGroup: React.FC<{
  label?: string;
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
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

// Symptom keys MUST match backend `buildBlankProgressNote`.
const SYMPTOM_KEYS = [
  'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting', 'Constipation',
  'Diarrhea', 'Fatigue', 'Anxiety', 'Delirium/Confusion',
  'Insomnia', 'Appetite Loss', 'Other',
] as const;

// ─────────────────────────────────────────────────────────────
// Validation (client-side, shallow — required fields only)
// ─────────────────────────────────────────────────────────────
function validate(form: ProgressNote): Partial<Record<keyof ProgressNote, string>> {
  const e: Partial<Record<keyof ProgressNote, string>> = {};
  if (!form.attendingClinician.trim()) e.attendingClinician = 'Attending clinician is required.';
  return e;
}

const TAB_ERROR_MAP: Partial<Record<keyof ProgressNote, TabId>> = {
  attendingClinician: 'header',
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
const RecordProgressNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createNote = useCreateProgressNote(id!);

  const [form, setForm] = useState<ProgressNote | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('header');
  const [errors, setErrors] = useState<Partial<Record<keyof ProgressNote, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  // Initialise form once we have the logged-in user's name for the header
  React.useEffect(() => {
    if (!form) {
      setForm(
        buildBlankProgressNote(user?.name ?? '') as ProgressNote,
      );
    }
  }, [form, user?.name]);

  const set = useCallback(<K extends keyof ProgressNote>(key: K, value: ProgressNote[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setIsDirty(true);
    if (errors[key]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[key];
        return e;
      });
    }
  }, [errors]);

  // ── Vitals helper ──
  const setVital = useCallback(
    (
      key: keyof ProgressNote['vitals'],
      field: 'current' | 'previous',
      value: string,
    ) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              vitals: {
                ...prev.vitals,
                [key]: { ...prev.vitals[key], [field]: value },
              },
            }
          : prev,
      );
      setIsDirty(true);
    },
    [],
  );

  const blankMed = (): ProgressNoteMedRow => ({
    medicationTreatment: '', dose: '', route: '', frequency: '', reasonResponse: '',
  });

  const blankAddl = (): ProgressNoteAdditionalEntry => ({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    note: '',
    clinicianName: user?.name ?? '',
  });

  const tabIdx = TABS.findIndex((t) => t.id === activeTab);
  const canGoPrev = tabIdx > 0;
  const canGoNext = tabIdx < TABS.length - 1;

  const tabHasError = (id: TabId) => {
    const keys = Object.keys(TAB_ERROR_MAP).filter(
      (k) => TAB_ERROR_MAP[k as keyof ProgressNote] === id,
    ) as (keyof ProgressNote)[];
    return keys.some((k) => !!errors[k]);
  };

  if (isLoading || !form) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const handleSubmitClick = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrKey = Object.keys(errs)[0] as keyof ProgressNote;
      const tab = TAB_ERROR_MAP[firstErrKey] ?? 'header';
      setActiveTab(tab);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    // Strip server-managed fields before submitting.
    const {
      id: _id,
      patientId: _pid,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      responsibleClinician: _rc,
      signatures: _sig,
      allSigned: _allSigned,
      dayOfAdmission: _doa,
      ...payload
    } = form;

    try {
      const response = await createNote.mutateAsync(payload as any);
      const newId = (response as any)?.id as string | undefined;
      if (newId) setSavedNoteId(newId);
      setShowConfirm(false);
      setIsDirty(false);
    } catch {
      setShowConfirm(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !savedNoteId) {
      setShowDiscard(true);
    } else {
      navigate(`/patients/${id}`);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Saved state — after successful save, show signature section
  // ─────────────────────────────────────────────────────────
  if (savedNoteId) {
    return (
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label={`${patient.firstName} ${patient.lastName}`} />
        </div>

        <div className="rounded-2xl border border-success/30 bg-success-bg/20 px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Progress note saved successfully.
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              The note is now in the patient's record. Additional signatures can be
              added below — Physician and Nurse signatures are required to finalise.
            </p>
          </div>
        </div>

        <ProgressNoteSignatureSection
          patientId={id!}
          noteId={savedNoteId}
          onSigned={() => {
            // Signature section refreshes itself; nothing else to do here
          }}
        />

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(`/patients/${id}`)}
          >
            Back to Patient
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Form state
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-5xl">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton
            to={`/patients/${id}`}
            label={`${patient.firstName} ${patient.lastName}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <NotebookPen size={15} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-on-surface leading-tight">
              Patient Progress Note
            </h1>
            <p className="text-xs text-text-muted">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
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
                  hasErr && 'text-error border-error',
                )}
              >
                {tab.label}
                {hasErr && <span className="h-1.5 w-1.5 rounded-full bg-error flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Tab body */}
        <div className="bg-surface-lowest border-x border-border-base px-6 py-6 min-h-[500px]">
          <TabContent
            tabId={activeTab}
            form={form}
            set={set}
            errors={errors}
            setVital={setVital}
            blankMed={blankMed}
            blankAddl={blankAddl}
            patientFirstName={patient.firstName}
            patientLastName={patient.lastName}
            patientMRN={patient.patientDisplayId ?? patient.id}
          />
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
            <Button variant="outline" size="sm" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitClick}
              loading={createNote.isPending}
            >
              Save Progress Note
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <NotebookPen size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-on-surface">
                  Save Progress Note?
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
            </div>
            <div className="bg-surface-low rounded-lg px-4 py-3 mb-4 space-y-1 text-sm">
              {form.generalCondition && (
                <p>
                  <span className="text-text-muted">General condition:</span>{' '}
                  <strong>{form.generalCondition}</strong>
                </p>
              )}
              {form.attendingClinician && (
                <p>
                  <span className="text-text-muted">Attending clinician:</span>{' '}
                  <strong>{form.attendingClinician}</strong>
                </p>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-5">
              The note will be saved and you can add signatures on the next screen.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={createNote.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmSave}
                loading={createNote.isPending}
              >
                Yes, Save Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Discard dialog */}
      {showDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h3 className="text-base font-semibold text-on-surface mb-2">
              Discard changes?
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              You have unsaved changes. If you go back now, all entered data will be lost.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDiscard(false)}>
                Keep Editing
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => navigate(`/patients/${id}`)}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Tab content
// ─────────────────────────────────────────────────────────────
interface TabContentProps {
  tabId: TabId;
  form: ProgressNote;
  set: <K extends keyof ProgressNote>(key: K, value: ProgressNote[K]) => void;
  errors: Partial<Record<keyof ProgressNote, string>>;
  setVital: (key: keyof ProgressNote['vitals'], field: 'current' | 'previous', value: string) => void;
  blankMed: () => ProgressNoteMedRow;
  blankAddl: () => ProgressNoteAdditionalEntry;
  patientFirstName: string;
  patientLastName: string;
  patientMRN: string;
}

const TabContent: React.FC<TabContentProps> = ({
  tabId, form, set, errors, setVital, blankMed, blankAddl,
  patientFirstName, patientLastName, patientMRN,
}) => {
  switch (tabId) {

    // ── Header ────────────────────────────────────────────────
    case 'header': return (
      <div className="space-y-4">
        <SectionTitle num="→">Header Information</SectionTitle>
        <Grid cols={2}>
          <Input
            label="Hospital / Facility Name"
            value="Yekatit 12 Hospital Medical College"
            disabled
          />
          <Input
            label="Palliative Care Unit"
            value={form.palliativeCareUnit || 'Palliative Care Unit'}
            onChange={(e) => set('palliativeCareUnit', e.target.value)}
          />
          <Input
            label="Patient Name"
            value={`${patientFirstName} ${patientLastName}`}
            disabled
          />
          <Input label="Patient / MRN No." value={patientMRN} disabled />
          <Input
            label="Attending / Responsible Clinician *"
            value={form.attendingClinician}
            error={errors.attendingClinician}
            onChange={(e) => set('attendingClinician', e.target.value)}
          />
        </Grid>
        <p className="text-xs text-text-muted">
          Date and Time are recorded automatically from the save timestamp.
          Day of Admission is computed from the linked hospital admission.
        </p>
      </div>
    );

    // ── 1–2: Status + Vitals ──────────────────────────────────
    case 'status': return (
      <div className="space-y-6">
        <SectionTitle num={1}>Current Clinical Status</SectionTitle>
        <Grid cols={2}>
          <Select
            label="General Condition"
            value={form.generalCondition}
            onChange={(e) => set('generalCondition', e.target.value)}
            placeholder="Select…"
            options={['Stable', 'Improving', 'Deteriorating', 'Critical', 'Actively Dying'].map(
              (v) => ({ value: v, label: v }),
            )}
          />
          <Select
            label="Level of Consciousness"
            value={form.levelOfConsciousness}
            onChange={(e) => set('levelOfConsciousness', e.target.value)}
            placeholder="Select…"
            options={['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive'].map(
              (v) => ({ value: v, label: v }),
            )}
          />
          <Select
            label="Orientation"
            value={form.orientation}
            onChange={(e) => set('orientation', e.target.value)}
            placeholder="Select…"
            options={['Oriented', 'Partially Oriented', 'Disoriented', 'Unable to Assess'].map(
              (v) => ({ value: v, label: v }),
            )}
          />
          <Select
            label="Functional Status"
            value={form.functionalStatus}
            onChange={(e) => set('functionalStatus', e.target.value)}
            placeholder="Select…"
            options={['Independent', 'Requires Assistance', 'Bedbound', 'Fully Dependent'].map(
              (v) => ({ value: v, label: v }),
            )}
          />
        </Grid>
        <Textarea
          label="Changes Since Previous Review"
          rows={3}
          value={form.changesSincePreviousReview}
          onChange={(e) => set('changesSincePreviousReview', e.target.value)}
        />

        <SectionTitle num={2}>Vital Signs</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted">
                <th className="pb-2 pr-4 font-medium w-44">Vital Sign</th>
                <th className="pb-2 pr-4 font-medium">Current</th>
                <th className="pb-2 font-medium">Previous / Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {(
                [
                  ['temperature', 'Temperature (°C)'],
                  ['pulse', 'Pulse / Heart Rate (bpm)'],
                  ['respiratoryRate', 'Respiratory Rate (/min)'],
                  ['bloodPressure', 'Blood Pressure (mmHg)'],
                  ['spo2', 'SpO₂ (%)'],
                  ['oxygenFlow', 'Oxygen Flow (L/min)'],
                ] as [keyof ProgressNote['vitals'], string][]
              ).map(([key, label]) => (
                <tr key={key}>
                  <td className="py-2 pr-4 text-on-surface text-xs font-medium">{label}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="text"
                      placeholder="—"
                      value={form.vitals[key].current}
                      onChange={(e) => setVital(key, 'current', e.target.value)}
                      className="block w-full rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      placeholder="—"
                      value={form.vitals[key].previous}
                      onChange={(e) => setVital(key, 'previous', e.target.value)}
                      className="block w-full rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Textarea
          label="Other Relevant Observations"
          rows={3}
          value={form.otherRelevantObservations}
          onChange={(e) => set('otherRelevantObservations', e.target.value)}
        />
      </div>
    );

    // ── 3: Symptoms ───────────────────────────────────────────
    case 'symptoms': return (
      <div className="space-y-5">
        <SectionTitle num={3}>Symptom Assessment</SectionTitle>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted">
                <th className="pb-2 pr-3 font-medium w-36">Symptom</th>
                {['None', 'Mild', 'Moderate', 'Severe'].map((s) => (
                  <th key={s} className="pb-2 pr-2 font-medium text-center w-16">{s}</th>
                ))}
                <th className="pb-2 font-medium">Notes</th>
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
                          onChange={() =>
                            set('symptoms', {
                              ...form.symptoms,
                              [symptom]: { ...row, severity: sev },
                            })
                          }
                          className="h-3.5 w-3.5 text-primary"
                        />
                      </td>
                    ))}
                    <td className="py-2">
                      <input
                        type="text"
                        placeholder="Notes…"
                        value={row.notes}
                        onChange={(e) =>
                          set('symptoms', {
                            ...form.symptoms,
                            [symptom]: { ...row, notes: e.target.value },
                          })
                        }
                        className="block w-full rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-surface-low/40 rounded-xl p-4 space-y-4">
          <p className="text-sm font-semibold text-on-surface">Pain Review</p>
          <Grid cols={2}>
            <Input
              label="Pain Score (0–10)"
              type="number"
              min={0}
              max={10}
              value={form.painScore}
              onChange={(e) => set('painScore', e.target.value)}
            />
            <Input
              label="Location"
              value={form.painLocation}
              onChange={(e) => set('painLocation', e.target.value)}
            />
            <Input
              label="Character"
              value={form.painCharacter}
              onChange={(e) => set('painCharacter', e.target.value)}
            />
            <Input
              label="Current Pain Management"
              value={form.currentPainManagement}
              onChange={(e) => set('currentPainManagement', e.target.value)}
            />
          </Grid>
          <Grid cols={2}>
            <RadioGroup
              label="Response to Treatment"
              name="responseToTreatment"
              value={form.responseToTreatment}
              options={['Good', 'Partial', 'Poor', 'Not Applicable'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('responseToTreatment', v)}
            />
            <YesNo
              label="Breakthrough Pain Episodes"
              name="breakthroughPainEpisodes"
              value={form.breakthroughPainEpisodes}
              onChange={(v) => set('breakthroughPainEpisodes', v)}
            />
          </Grid>
          {form.breakthroughPainEpisodes === 'Yes' && (
            <Input
              label="Frequency"
              value={form.breakthroughPainFrequency}
              onChange={(e) => set('breakthroughPainFrequency', e.target.value)}
            />
          )}
        </div>
      </div>
    );

    // ── 4–6: Respiratory / Nutrition / Elimination ─────────────
    case 'resp': return (
      <div className="space-y-6">
        <SectionTitle num={4}>Respiratory Status</SectionTitle>
        <RadioGroup
          label="Breathing"
          name="breathing"
          value={form.breathing}
          options={['Comfortable', 'Mild Distress', 'Moderate Distress', 'Severe Distress'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('breathing', v)}
        />
        <Grid cols={2}>
          <YesNo
            label="Oxygen Therapy"
            name="oxygenTherapy"
            value={form.oxygenTherapy}
            onChange={(v) => set('oxygenTherapy', v)}
          />
          <RadioGroup
            label="Delivery"
            name="oxygenDelivery"
            value={form.oxygenDelivery}
            options={['Nasal Cannula', 'Mask', 'Other'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('oxygenDelivery', v)}
          />
        </Grid>
        {form.oxygenDelivery === 'Other' && (
          <Input
            label="Specify delivery method"
            value={form.oxygenDeliveryOther}
            onChange={(e) => set('oxygenDeliveryOther', e.target.value)}
          />
        )}
        <Grid cols={2}>
          <RadioGroup
            label="Respiratory Secretions"
            name="respiratorySecretions"
            value={form.respiratorySecretions}
            options={['None', 'Mild', 'Moderate', 'Excessive'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('respiratorySecretions', v)}
          />
          <YesNo
            label="Cough"
            name="cough"
            value={form.cough}
            onChange={(v) => set('cough', v)}
          />
        </Grid>
        <Textarea
          label="Other Respiratory Findings"
          rows={2}
          value={form.otherRespiratoryFindings}
          onChange={(e) => set('otherRespiratoryFindings', e.target.value)}
        />

        <SectionTitle num={5}>Nutrition and Hydration</SectionTitle>
        <RadioGroup
          label="Oral Intake"
          name="oralIntake"
          value={form.oralIntake}
          options={['Good', 'Reduced', 'Minimal', 'None'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('oralIntake', v)}
        />
        <Grid cols={2}>
          <Input label="Diet" value={form.diet} onChange={(e) => set('diet', e.target.value)} />
          <Input label="Fluid Intake" value={form.fluidIntake} onChange={(e) => set('fluidIntake', e.target.value)} />
          <YesNo label="Feeding Assistance" name="feedingAssistance" value={form.feedingAssistance} onChange={(v) => set('feedingAssistance', v)} />
          <YesNo label="Enteral Feeding" name="enteralFeeding" value={form.enteralFeeding} onChange={(v) => set('enteralFeeding', v)} />
          <YesNo label="IV Fluids" name="ivFluids" value={form.ivFluids} onChange={(v) => set('ivFluids', v)} />
          <YesNo label="Nausea/Vomiting Affecting Intake" name="nauseaVomitingAffectingIntake" value={form.nauseaVomitingAffectingIntake} onChange={(v) => set('nauseaVomitingAffectingIntake', v)} />
        </Grid>
        <Textarea
          label="Nutrition / Hydration Concerns"
          rows={2}
          value={form.nutritionHydrationConcerns}
          onChange={(e) => set('nutritionHydrationConcerns', e.target.value)}
        />

        <SectionTitle num={6}>Elimination</SectionTitle>
        <Grid cols={2}>
          <RadioGroup
            label="Urine Output"
            name="urineOutput"
            value={form.urineOutput}
            options={['Normal', 'Reduced', 'Minimal', 'Unable to Assess'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('urineOutput', v)}
          />
          <YesNo label="Urinary Catheter" name="urinaryCatheter" value={form.urinaryCatheter} onChange={(v) => set('urinaryCatheter', v)} />
          <RadioGroup
            label="Bowel Movement"
            name="bowelMovement"
            value={form.bowelMovement}
            options={['Normal', 'Constipated', 'Diarrhea', 'No Recent BM'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('bowelMovement', v)}
          />
          <Input label="Last Bowel Movement" type="date" value={form.lastBowelMovement} onChange={(e) => set('lastBowelMovement', e.target.value)} />
        </Grid>
        <Textarea
          label="Other Elimination Concerns"
          rows={2}
          value={form.otherEliminationConcerns}
          onChange={(e) => set('otherEliminationConcerns', e.target.value)}
        />
      </div>
    );

    // ── 7–8: Skin + Psych ──────────────────────────────────────
    case 'skin': return (
      <div className="space-y-6">
        <SectionTitle num={7}>Skin and Wound Status</SectionTitle>
        <RadioGroup
          label="Skin"
          name="skin"
          value={form.skin}
          options={['Intact', 'Dry', 'Fragile', 'Edematous', 'Other'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('skin', v)}
        />
        {form.skin === 'Other' && (
          <Input label="Specify skin condition" value={form.skinOther} onChange={(e) => set('skinOther', e.target.value)} />
        )}
        <Grid cols={2}>
          <YesNo label="Pressure Injury" name="pressureInjury" value={form.pressureInjury} onChange={(v) => set('pressureInjury', v)} />
          {form.pressureInjury === 'Yes' && (
            <Input label="Location / Stage" value={form.pressureInjuryLocationStage} onChange={(e) => set('pressureInjuryLocationStage', e.target.value)} />
          )}
          <YesNo label="Wound Care Provided" name="woundCareProvided" value={form.woundCareProvided} onChange={(v) => set('woundCareProvided', v)} />
        </Grid>
        <Textarea label="Wound / Pressure Injury Changes" rows={2} value={form.woundPressureInjuryChanges} onChange={(e) => set('woundPressureInjuryChanges', e.target.value)} />

        <SectionTitle num={8}>Psychological / Emotional Status</SectionTitle>
        <CheckboxGroup
          label="Mood / Behavior (select all that apply)"
          values={form.moodBehavior}
          options={['Calm', 'Anxious', 'Fearful', 'Sad', 'Depressed', 'Agitated', 'Withdrawn']}
          onChange={(v) => set('moodBehavior', v)}
        />
        <RadioGroup
          label="Psychological Distress"
          name="psychologicalDistress"
          value={form.psychologicalDistress}
          options={['None', 'Mild', 'Moderate', 'Severe'].map((v) => ({ value: v, label: v }))}
          onChange={(v) => set('psychologicalDistress', v)}
        />
        <Textarea
          label="Patient's Main Concerns Today"
          rows={3}
          value={form.patientsMainConcernsToday}
          onChange={(e) => set('patientsMainConcernsToday', e.target.value)}
        />
        <YesNo
          label="Counseling / Psychological Support Provided"
          name="counselingPsychologicalSupportProvided"
          value={form.counselingPsychologicalSupportProvided}
          onChange={(v) => set('counselingPsychologicalSupportProvided', v)}
        />
      </div>
    );

    // ── 9–11: Spiritual / Family / Goals ───────────────────────
    case 'spiritual': return (
      <div className="space-y-6">
        <SectionTitle num={9}>Spiritual / Cultural Needs</SectionTitle>
        <YesNo
          label="Spiritual Distress Identified"
          name="spiritualDistressIdentified"
          value={form.spiritualDistressIdentified}
          onChange={(v) => set('spiritualDistressIdentified', v)}
        />
        <Textarea
          label="Patient's Spiritual / Cultural Concerns"
          rows={2}
          value={form.patientsSpiritualCulturalConcerns}
          onChange={(e) => set('patientsSpiritualCulturalConcerns', e.target.value)}
        />
        <Grid cols={2}>
          <YesNo label="Spiritual Care Provided" name="spiritualCareProvided" value={form.spiritualCareProvided} onChange={(v) => set('spiritualCareProvided', v)} />
          <YesNo label="Referral Required" name="spiritualReferralRequired" value={form.spiritualReferralRequired} onChange={(v) => set('spiritualReferralRequired', v)} />
        </Grid>
        <Textarea label="Notes" rows={2} value={form.spiritualNotes} onChange={(e) => set('spiritualNotes', e.target.value)} />

        <SectionTitle num={10}>Family / Caregiver Update</SectionTitle>
        <YesNo
          label="Family / Caregiver Present"
          name="familyCaregiverPresent"
          value={form.familyCaregiverPresent}
          onChange={(v) => set('familyCaregiverPresent', v)}
        />
        <Textarea label="Family / Caregiver Concerns" rows={2} value={form.familyCaregiverConcerns} onChange={(e) => set('familyCaregiverConcerns', e.target.value)} />
        <Textarea label="Education / Support Provided" rows={2} value={form.familyEducationSupportProvided} onChange={(e) => set('familyEducationSupportProvided', e.target.value)} />
        <Grid cols={2}>
          <YesNo label="Family Meeting Held" name="familyMeetingHeld" value={form.familyMeetingHeld} onChange={(v) => set('familyMeetingHeld', v)} />
          {form.familyMeetingHeld === 'Yes' && (
            <Input label="Participants" value={form.familyMeetingParticipants} onChange={(e) => set('familyMeetingParticipants', e.target.value)} />
          )}
        </Grid>

        <SectionTitle num={11}>Goals of Care Review</SectionTitle>
        <CheckboxGroup
          label="Current Goals of Care (select all that apply)"
          values={form.currentGoalsOfCare}
          options={[
            'Comfort/Symptom Control',
            'Quality of Life',
            'Functional Support',
            'Disease-Directed Treatment',
            'End-of-Life Care',
            'Home/Hospice Care',
            'Other',
          ]}
          onChange={(v) => set('currentGoalsOfCare', v)}
        />
        {form.currentGoalsOfCare.includes('Other') && (
          <Input label="Specify other goal" value={form.currentGoalsOfCareOther} onChange={(e) => set('currentGoalsOfCareOther', e.target.value)} />
        )}
        <Grid cols={2}>
          <YesNo label="Goals Reviewed Today" name="goalsReviewedToday" value={form.goalsReviewedToday} onChange={(v) => set('goalsReviewedToday', v)} />
          <YesNo label="Change in Goals Identified" name="changeInGoalsIdentified" value={form.changeInGoalsIdentified} onChange={(v) => set('changeInGoalsIdentified', v)} />
        </Grid>
        <Textarea label="Patient / Decision-Maker Preferences" rows={2} value={form.patientDecisionMakerPreferences} onChange={(e) => set('patientDecisionMakerPreferences', e.target.value)} />
        <RadioGroup
          label="Code Status / Resuscitation Preference"
          name="codeStatus"
          value={form.codeStatus}
          options={[
            { value: 'Full Resuscitation', label: 'Full Resuscitation' },
            { value: 'DNAR/DNR', label: 'DNAR/DNR' },
            { value: 'Other', label: 'Other / Per Local Policy' },
          ]}
          onChange={(v) => set('codeStatus', v)}
        />
        {form.codeStatus === 'Other' && (
          <Input label="Specify" value={form.codeStatusOther} onChange={(e) => set('codeStatusOther', e.target.value)} />
        )}
        <YesNo label="Advance Care Plan Reviewed" name="advanceCarePlanReviewed" value={form.advanceCarePlanReviewed} onChange={(v) => set('advanceCarePlanReviewed', v)} />
      </div>
    );

    // ── 12–13: Meds + Nursing ──────────────────────────────────
    case 'meds': return (
      <div className="space-y-6">
        <SectionTitle num={12}>Medication Review</SectionTitle>
        <Grid cols={2}>
          <YesNo label="Current Medication Regimen Reviewed" name="currentMedicationRegimenReviewed" value={form.currentMedicationRegimenReviewed} onChange={(v) => set('currentMedicationRegimenReviewed', v)} />
          <YesNo label="Changes Made" name="changesMade" value={form.changesMade} onChange={(v) => set('changesMade', v)} />
          <YesNo label="PRN / Breakthrough Medication Used" name="prnBreakthroughMedicationUsed" value={form.prnBreakthroughMedicationUsed} onChange={(v) => set('prnBreakthroughMedicationUsed', v)} />
          {form.prnBreakthroughMedicationUsed === 'Yes' && (
            <RadioGroup
              label="Effectiveness"
              name="prnEffectiveness"
              value={form.prnEffectiveness}
              options={['Effective', 'Partially Effective', 'Ineffective'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('prnEffectiveness', v)}
            />
          )}
          <RadioGroup
            label="Medication Side Effects"
            name="medicationSideEffects"
            value={form.medicationSideEffects}
            options={[{ value: 'None', label: 'None' }, { value: 'Yes', label: 'Yes' }]}
            onChange={(v) => set('medicationSideEffects', v)}
          />
          {form.medicationSideEffects === 'Yes' && (
            <Input label="Side effect details" value={form.medicationSideEffectsDetail} onChange={(e) => set('medicationSideEffectsDetail', e.target.value)} />
          )}
        </Grid>

        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Medication / Treatment Table</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-muted">
                  {['Medication / Treatment', 'Dose', 'Route', 'Frequency', 'Reason / Response', ''].map((h, i) => (
                    <th key={i} className="pb-2 pr-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {form.medications.map((row, i) => (
                  <tr key={i} className="align-top">
                    {(['medicationTreatment', 'dose', 'route', 'frequency', 'reasonResponse'] as (keyof ProgressNoteMedRow)[]).map((field) => (
                      <td key={field} className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={row[field]}
                          onChange={(e) => {
                            const arr = form.medications.map((r, j) =>
                              j === i ? { ...r, [field]: e.target.value } : r,
                            );
                            set('medications', arr);
                          }}
                          className="block w-full min-w-[80px] rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                    ))}
                    <td className="py-1.5">
                      {form.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => set('medications', form.medications.filter((_, j) => j !== i))}
                          className="p-1 rounded text-text-muted hover:text-error hover:bg-error-bg transition-all"
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
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={() => set('medications', [...form.medications, blankMed()])}
          >
            Add Row
          </Button>
        </div>

        <SectionTitle num={13}>Nursing / Supportive Care Provided</SectionTitle>
        <CheckboxGroup
          label="Care provided (select all that apply)"
          values={form.nursingSupportiveCareProvided}
          options={[
            'Positioning/Comfort Measures',
            'Personal Hygiene',
            'Oral Care',
            'Pressure-Injury Prevention',
            'Wound Care',
            'Oxygen Therapy',
            'Symptom Monitoring',
            'Medication Administration',
            'Nutrition/Hydration Support',
            'Emotional Support',
            'Family/Caregiver Education',
            'Other',
          ]}
          onChange={(v) => set('nursingSupportiveCareProvided', v)}
        />
        {form.nursingSupportiveCareProvided.includes('Other') && (
          <Input label="Specify other care" value={form.nursingSupportiveCareOther} onChange={(e) => set('nursingSupportiveCareOther', e.target.value)} />
        )}
        <Textarea label="Response to Supportive Care" rows={2} value={form.responseToSupportiveCare} onChange={(e) => set('responseToSupportiveCare', e.target.value)} />
      </div>
    );

    // ── 14–15: Investigations + MDT ────────────────────────────
    case 'invest': return (
      <div className="space-y-6">
        <SectionTitle num={14}>Investigations / Results</SectionTitle>
        <CheckboxGroup
          label="Investigations Performed / Reviewed Today"
          values={form.investigationsPerformedReviewed}
          options={['Laboratory Tests', 'Imaging', 'ECG/Other Diagnostic Test', 'None', 'Other']}
          onChange={(v) => set('investigationsPerformedReviewed', v)}
        />
        {form.investigationsPerformedReviewed.includes('Other') && (
          <Input label="Specify other investigation" value={form.investigationsPerformedReviewedOther} onChange={(e) => set('investigationsPerformedReviewedOther', e.target.value)} />
        )}
        <Textarea label="Significant Results" rows={3} value={form.significantResults} onChange={(e) => set('significantResults', e.target.value)} />
        <Textarea label="Clinical Significance / Action Taken" rows={2} value={form.clinicalSignificanceActionTaken} onChange={(e) => set('clinicalSignificanceActionTaken', e.target.value)} />

        <SectionTitle num={15}>Multidisciplinary Team Review</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted">
                <th className="pb-2 pr-4 font-medium w-52">Discipline</th>
                <th className="pb-2 pr-4 font-medium">Review / Intervention</th>
                <th className="pb-2 font-medium w-36">Follow-Up Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {form.multidisciplinaryTeamReview.map((row, i) => (
                <tr key={row.discipline}>
                  <td className="py-2 pr-4 text-on-surface text-xs font-medium">{row.discipline}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="text"
                      placeholder="Notes…"
                      value={row.reviewIntervention}
                      onChange={(e) => {
                        const arr = form.multidisciplinaryTeamReview.map((r, j) =>
                          j === i ? { ...r, reviewIntervention: e.target.value } : r,
                        );
                        set('multidisciplinaryTeamReview', arr);
                      }}
                      className="block w-full rounded-md border border-border-base bg-surface-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex gap-3">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs text-on-surface">
                          <input
                            type="radio"
                            name={`mdt-followup-${i}`}
                            checked={row.followUpRequired === opt}
                            onChange={() => {
                              const arr = form.multidisciplinaryTeamReview.map((r, j) =>
                                j === i ? { ...r, followUpRequired: opt as 'Yes' | 'No' } : r,
                              );
                              set('multidisciplinaryTeamReview', arr);
                            }}
                            className="h-3 w-3 text-primary"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    // ── 16–18: Assessment + Plan + SOAP ────────────────────────
    case 'assess': return (
      <div className="space-y-6">
        <SectionTitle num={16}>Clinical Assessment</SectionTitle>
        <Textarea label="Overall Assessment" rows={4} value={form.overallAssessment} onChange={(e) => set('overallAssessment', e.target.value)} />
        <Textarea
          label="Problems Identified Today (one per line)"
          rows={4}
          placeholder={'1. …\n2. …\n3. …'}
          value={form.problemsIdentifiedToday.join('\n')}
          onChange={(e) =>
            set(
              'problemsIdentifiedToday',
              e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
            )
          }
        />

        <SectionTitle num={17}>Plan for Next Period</SectionTitle>
        {[
          { key: 'symptomManagementPlan' as const, label: 'Symptom Management Plan' },
          { key: 'medicationPlan' as const, label: 'Medication Plan' },
          { key: 'nursingSupportiveCarePlan' as const, label: 'Nursing / Supportive Care Plan' },
          { key: 'investigationsMonitoring' as const, label: 'Investigations / Monitoring' },
          { key: 'familyCaregiverPlan' as const, label: 'Family / Caregiver Plan' },
          { key: 'referralsConsultations' as const, label: 'Referrals / Consultations' },
          { key: 'dischargeTransferHospicePlanning' as const, label: 'Discharge / Transfer / Hospice Planning' },
        ].map(({ key, label }) => (
          <Textarea key={key} label={label} rows={2} value={form[key]} onChange={(e) => set(key, e.target.value)} />
        ))}

        <SectionTitle num={18}>Progress Note — SOAP Format</SectionTitle>
        {[
          { key: 'soapSubjective' as const, label: 'S — Subjective: Patient / Family Report' },
          { key: 'soapObjective' as const, label: 'O — Objective: Clinical Findings / Vital Signs' },
          { key: 'soapAssessment' as const, label: 'A — Assessment: Clinical Assessment' },
          { key: 'soapPlan' as const, label: 'P — Plan: Treatment and Follow-Up Plan' },
        ].map(({ key, label }) => (
          <Textarea key={key} label={label} rows={3} value={form[key]} onChange={(e) => set(key, e.target.value)} />
        ))}
      </div>
    );

    // ── 19–20: Additional Notes + Authorization ────────────────
    case 'auth': return (
      <div className="space-y-6">
        <SectionTitle num={19}>Additional Progress Notes</SectionTitle>
        <div className="space-y-4">
          {form.additionalProgressNotes.map((entry, i) => (
            <div key={i} className="border border-border-base rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Entry {i + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'additionalProgressNotes',
                      form.additionalProgressNotes.filter((_, j) => j !== i),
                    )
                  }
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-bg transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <Grid cols={2}>
                <Input
                  label="Date"
                  type="date"
                  value={entry.date}
                  onChange={(e) => {
                    const arr = form.additionalProgressNotes.map((r, j) =>
                      j === i ? { ...r, date: e.target.value } : r,
                    );
                    set('additionalProgressNotes', arr);
                  }}
                />
                <Input
                  label="Time"
                  type="time"
                  value={entry.time}
                  onChange={(e) => {
                    const arr = form.additionalProgressNotes.map((r, j) =>
                      j === i ? { ...r, time: e.target.value } : r,
                    );
                    set('additionalProgressNotes', arr);
                  }}
                />
                <Input
                  label="Clinician Name"
                  value={entry.clinicianName}
                  onChange={(e) => {
                    const arr = form.additionalProgressNotes.map((r, j) =>
                      j === i ? { ...r, clinicianName: e.target.value } : r,
                    );
                    set('additionalProgressNotes', arr);
                  }}
                />
              </Grid>
              <Textarea
                label="Note"
                rows={4}
                value={entry.note}
                onChange={(e) => {
                  const arr = form.additionalProgressNotes.map((r, j) =>
                    j === i ? { ...r, note: e.target.value } : r,
                  );
                  set('additionalProgressNotes', arr);
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={() =>
              set('additionalProgressNotes', [...form.additionalProgressNotes, blankAddl()])
            }
          >
            Add Another Entry
          </Button>
        </div>

        <SectionTitle num={20}>Authorization</SectionTitle>
        <div className="rounded-lg bg-surface-low border border-border-base px-4 py-3 text-xs text-text-secondary leading-relaxed">
          Signatures (Responsible Clinician, Physician, Nurse, Reviewer) are added
          through the <strong className="text-on-surface">Signatures</strong> section
          that appears after saving. The Responsible Clinician is auto-signed as the
          note's creator.
        </div>
        <Input
          label="Facility Stamp (optional)"
          value={form.facilityStamp}
          onChange={(e) => set('facilityStamp', e.target.value)}
        />
      </div>
    );

    default: return null;
  }
};

export default RecordProgressNotePage;