import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  NotebookPen,
  CheckCircle2,
  ArrowLeft,
  Check,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateProgressNote,
  useUpdateProgressNote,
  useProgressNote,
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
import { cn } from '@/lib/utils';
import ProgressNoteSignatureSection from '@/components/progress-notes/ProgressNoteSignatureSection';

// ═════════════════════════════════════════════════════════════
// Section definitions — one per nav item, no combining
// ═════════════════════════════════════════════════════════════

type SectionKey =
  | 'header'
  | 'status'
  | 'vitals'
  | 'symptoms'
  | 'respiratory'
  | 'nutrition'
  | 'elimination'
  | 'skin'
  | 'psych'
  | 'spiritual'
  | 'family'
  | 'goals'
  | 'meds'
  | 'nursing'
  | 'investigations'
  | 'mdt'
  | 'assessment'
  | 'plan'
  | 'soap'
  | 'additional'
  | 'auth';

interface SectionDef {
  key: SectionKey;
  /** Short number shown in the badge, e.g. "1", "SOAP", "→". */
  num: string;
  label: string;
  description: string;
  /** Fields the section owns — used for completion detection. */
  fields: (keyof ProgressNote)[];
  /** Fields required for "complete" state. */
  requiredFields: (keyof ProgressNote)[];
}

const SECTIONS: SectionDef[] = [
  {
    key: 'header',
    num: '→',
    label: 'Header',
    description: 'Facility, patient, attending clinician',
    fields: ['palliativeCareUnit', 'attendingClinician'],
    requiredFields: ['attendingClinician'],
  },
  {
    key: 'status',
    num: '1',
    label: 'Current Clinical Status',
    description: 'Condition, consciousness, orientation, function',
    fields: ['generalCondition', 'levelOfConsciousness', 'orientation', 'functionalStatus', 'changesSincePreviousReview'],
    requiredFields: [],
  },
  {
    key: 'vitals',
    num: '2',
    label: 'Vital Signs',
    description: 'Temperature, pulse, BP, respiratory rate, SpO₂',
    fields: ['vitals', 'otherRelevantObservations'],
    requiredFields: [],
  },
  {
    key: 'symptoms',
    num: '3',
    label: 'Symptom Assessment',
    description: '12-symptom grid + pain review',
    fields: ['symptoms', 'painScore', 'painLocation', 'painCharacter', 'currentPainManagement', 'responseToTreatment', 'breakthroughPainEpisodes', 'breakthroughPainFrequency'],
    requiredFields: [],
  },
  {
    key: 'respiratory',
    num: '4',
    label: 'Respiratory Status',
    description: 'Breathing, oxygen, secretions, cough',
    fields: ['breathing', 'oxygenTherapy', 'oxygenDelivery', 'oxygenDeliveryOther', 'respiratorySecretions', 'cough', 'otherRespiratoryFindings'],
    requiredFields: [],
  },
  {
    key: 'nutrition',
    num: '5',
    label: 'Nutrition & Hydration',
    description: 'Oral intake, diet, feeding, fluids',
    fields: ['oralIntake', 'diet', 'fluidIntake', 'feedingAssistance', 'enteralFeeding', 'ivFluids', 'nauseaVomitingAffectingIntake', 'nutritionHydrationConcerns'],
    requiredFields: [],
  },
  {
    key: 'elimination',
    num: '6',
    label: 'Elimination',
    description: 'Urine output, catheter, bowel movement',
    fields: ['urineOutput', 'urinaryCatheter', 'bowelMovement', 'lastBowelMovement', 'otherEliminationConcerns'],
    requiredFields: [],
  },
  {
    key: 'skin',
    num: '7',
    label: 'Skin & Wound',
    description: 'Skin integrity, pressure injury, wound care',
    fields: ['skin', 'skinOther', 'pressureInjury', 'pressureInjuryLocationStage', 'woundCareProvided', 'woundPressureInjuryChanges'],
    requiredFields: [],
  },
  {
    key: 'psych',
    num: '8',
    label: 'Psychological / Emotional',
    description: 'Mood, distress, counseling',
    fields: ['moodBehavior', 'psychologicalDistress', 'patientsMainConcernsToday', 'counselingPsychologicalSupportProvided'],
    requiredFields: [],
  },
  {
    key: 'spiritual',
    num: '9',
    label: 'Spiritual / Cultural',
    description: 'Spiritual distress, care, referral',
    fields: ['spiritualDistressIdentified', 'patientsSpiritualCulturalConcerns', 'spiritualCareProvided', 'spiritualReferralRequired', 'spiritualNotes'],
    requiredFields: [],
  },
  {
    key: 'family',
    num: '10',
    label: 'Family / Caregiver',
    description: 'Presence, concerns, education, meetings',
    fields: ['familyCaregiverPresent', 'familyCaregiverConcerns', 'familyEducationSupportProvided', 'familyMeetingHeld', 'familyMeetingParticipants'],
    requiredFields: [],
  },
  {
    key: 'goals',
    num: '11',
    label: 'Goals of Care',
    description: 'Current goals, code status, ACP',
    fields: ['currentGoalsOfCare', 'currentGoalsOfCareOther', 'goalsReviewedToday', 'changeInGoalsIdentified', 'patientDecisionMakerPreferences', 'codeStatus', 'codeStatusOther', 'advanceCarePlanReviewed'],
    requiredFields: [],
  },
  {
    key: 'meds',
    num: '12',
    label: 'Medication Review',
    description: 'Regimen review, PRN, side effects, medication table',
    fields: ['currentMedicationRegimenReviewed', 'changesMade', 'prnBreakthroughMedicationUsed', 'prnEffectiveness', 'medicationSideEffects', 'medicationSideEffectsDetail', 'medications'],
    requiredFields: [],
  },
  {
    key: 'nursing',
    num: '13',
    label: 'Nursing / Supportive Care',
    description: 'Care provided and response',
    fields: ['nursingSupportiveCareProvided', 'nursingSupportiveCareOther', 'responseToSupportiveCare'],
    requiredFields: [],
  },
  {
    key: 'investigations',
    num: '14',
    label: 'Investigations',
    description: 'Tests reviewed, results, action taken',
    fields: ['investigationsPerformedReviewed', 'investigationsPerformedReviewedOther', 'significantResults', 'clinicalSignificanceActionTaken'],
    requiredFields: [],
  },
  {
    key: 'mdt',
    num: '15',
    label: 'MDT Review',
    description: 'Multidisciplinary team interventions',
    fields: ['multidisciplinaryTeamReview'],
    requiredFields: [],
  },
  {
    key: 'assessment',
    num: '16',
    label: 'Clinical Assessment',
    description: 'Overall assessment and problems',
    fields: ['overallAssessment', 'problemsIdentifiedToday'],
    requiredFields: [],
  },
  {
    key: 'plan',
    num: '17',
    label: 'Plan',
    description: 'Symptom, medication, nursing, family plans',
    fields: ['symptomManagementPlan', 'medicationPlan', 'nursingSupportiveCarePlan', 'investigationsMonitoring', 'familyCaregiverPlan', 'referralsConsultations', 'dischargeTransferHospicePlanning'],
    requiredFields: [],
  },
  {
    key: 'soap',
    num: '18',
    label: 'SOAP Notes',
    description: 'Subjective, objective, assessment, plan',
    fields: ['soapSubjective', 'soapObjective', 'soapAssessment', 'soapPlan'],
    requiredFields: [],
  },
  {
    key: 'additional',
    num: '19',
    label: 'Additional Notes',
    description: 'Extra progress note entries',
    fields: ['additionalProgressNotes'],
    requiredFields: [],
  },
  {
    key: 'auth',
    num: '20',
    label: 'Authorization',
    description: 'Facility stamp',
    fields: ['facilityStamp'],
    requiredFields: [],
  },
];

// ── Filled / empty helper ──
function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) {
    return value.some((v) => {
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'object' && v !== null) {
        return Object.values(v as Record<string, unknown>).some((x) =>
          typeof x === 'string' ? x.trim().length > 0 : Boolean(x),
        );
      }
      return Boolean(v);
    });
  }
  if (typeof value === 'object') {
    // Vitals object: check any current/previous has a value
    return Object.values(value as Record<string, unknown>).some((v) => {
      if (typeof v === 'object' && v !== null) {
        return Object.values(v as Record<string, unknown>).some(
          (x) => typeof x === 'string' && x.trim().length > 0,
        );
      }
      return isFilled(v);
    });
  }
  return Boolean(value);
}

type SectionState = 'empty' | 'partial' | 'complete' | 'error';

function getSectionState(
  def: SectionDef,
  form: ProgressNote,
  errors: Partial<Record<keyof ProgressNote, string>>,
): SectionState {
  const hasError = def.requiredFields.some((f) => Boolean(errors[f]));
  const requiredMissing = def.requiredFields.some((f) => !isFilled(form[f]));

  if (hasError) return 'error';
  if (def.requiredFields.length > 0 && !requiredMissing) return 'complete';

  const anyFilled = def.fields.some((f) => isFilled(form[f]));
  if (def.requiredFields.length > 0 && requiredMissing && anyFilled) {
    return 'partial';
  }
  return anyFilled ? 'complete' : 'empty';
}

// ═════════════════════════════════════════════════════════════
// Shared UI helpers (unchanged from your original)
// ═════════════════════════════════════════════════════════════

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

const SYMPTOM_KEYS = [
  'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting', 'Constipation',
  'Diarrhea', 'Fatigue', 'Anxiety', 'Delirium/Confusion',
  'Insomnia', 'Appetite Loss', 'Other',
] as const;

// ═════════════════════════════════════════════════════════════
// Sidebar
// ═════════════════════════════════════════════════════════════

const SectionNav: React.FC<{
  sections: SectionDef[];
  activeKey: SectionKey;
  states: Record<SectionKey, SectionState>;
  onSelect: (key: SectionKey) => void;
}> = ({ sections, activeKey, states, onSelect }) => {
  const total = sections.length;
  const completed = sections.filter((s) => states[s.key] === 'complete').length;
  const pct = Math.round((completed / total) * 100);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border-base bg-surface-low/40"
      aria-label="Progress note sections"
    >
      <div className="px-4 pt-5 pb-4 border-b border-border-base">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
          Progress
        </p>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold text-on-surface">
            {completed} of {total}
          </span>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const state = states[section.key];
          const isActive = activeKey === section.key;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSelect(section.key)}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors group',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface',
              )}
            >
              <span className="flex-shrink-0 mt-0.5">
                <SectionStatusIcon state={state} isActive={isActive} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-mono text-[10px] rounded px-1.5 py-0.5 leading-none',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-container text-text-muted',
                    )}
                  >
                    {section.num}
                  </span>
                  <span
                    className={cn(
                      'text-sm truncate',
                      isActive ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {section.label}
                  </span>
                </span>
                <span className="block text-[11px] text-text-muted mt-0.5 truncate">
                  {section.description}
                </span>
              </span>
              <ChevronRight
                size={14}
                className={cn(
                  'flex-shrink-0 mt-0.5 transition-opacity',
                  isActive
                    ? 'opacity-100 text-primary'
                    : 'opacity-0 group-hover:opacity-60',
                )}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

const SectionStatusIcon: React.FC<{ state: SectionState; isActive: boolean }> = ({
  state,
  isActive,
}) => {
  if (state === 'complete') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-success">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error-bg text-error">
        <AlertCircle size={12} strokeWidth={2.5} />
      </span>
    );
  }
  if (state === 'partial') {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Circle size={16} className="text-warning" strokeWidth={2} />
        <Circle size={6} className="absolute text-warning" fill="currentColor" strokeWidth={0} />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <Circle
        size={14}
        className={isActive ? 'text-primary/40' : 'text-outline-variant'}
        strokeWidth={2}
      />
    </span>
  );
};

// ═════════════════════════════════════════════════════════════
// Main page
// ═════════════════════════════════════════════════════════════

const RecordProgressNotePage: React.FC = () => {
  const { id, noteId } = useParams<{ id: string; noteId?: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isEditMode = Boolean(noteId);

  const { data: patient, isLoading: patientLoading, error: patientError, refetch: refetchPatient } = usePatient(id!);
  const { data: existingNote, isLoading: noteLoading } = useProgressNote(id!, noteId ?? '');
  const createNote = useCreateProgressNote(id!);
  const updateNote = useUpdateProgressNote(id!);

  const [form, setForm] = useState<ProgressNote | null>(null);
  const [activeKey, setActiveKey] = useState<SectionKey>('header');
  const [errors, setErrors] = useState<Partial<Record<keyof ProgressNote, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);

  // Scroll to top of body when section changes
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  // Init form
  useEffect(() => {
    if (isEditMode) {
      if (existingNote && !form) {
        setForm(existingNote as unknown as ProgressNote);
      }
    } else {
      if (!form) {
        setForm(buildBlankProgressNote(user?.name ?? '') as ProgressNote);
      }
    }
  }, [isEditMode, existingNote, form, user?.name]);

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

  // Compute completion states
  const sectionStates = useMemo<Record<SectionKey, SectionState>>(() => {
    if (!form) {
      return Object.fromEntries(SECTIONS.map((s) => [s.key, 'empty' as const])) as Record<SectionKey, SectionState>;
    }
    return Object.fromEntries(
      SECTIONS.map((s) => [s.key, getSectionState(s, form, errors)]),
    ) as Record<SectionKey, SectionState>;
  }, [form, errors]);

  const requiredMissing = useMemo(() => {
    if (!form) return [];
    return SECTIONS.flatMap((s) => s.requiredFields).filter((f) => !isFilled(form[f]));
  }, [form]);

  const activeIdx = SECTIONS.findIndex((s) => s.key === activeKey);
  const activeDef = SECTIONS[activeIdx];
  const canGoPrev = activeIdx > 0;
  const canGoNext = activeIdx < SECTIONS.length - 1;

  if (patientLoading || !form || (isEditMode && noteLoading)) return <PageLoader />;
  if (patientError || !patient) return <ErrorState onRetry={refetchPatient} />;

  const handleSubmitClick = () => {
    const errs: Partial<Record<keyof ProgressNote, string>> = {};
    if (!form.attendingClinician.trim()) {
      errs.attendingClinician = 'Attending clinician is required.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setActiveKey('header');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
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
      if (isEditMode && noteId) {
        await updateNote.mutateAsync({ noteId, data: payload as any });
        setShowConfirm(false);
        setIsDirty(false);
        navigate(`/patients/${id}`, { state: { savedProgressNote: true } });
      } else {
        const response = await createNote.mutateAsync(payload as any);
        const newId = (response as any)?.id as string | undefined;
        if (newId) setSavedNoteId(newId);
        setShowConfirm(false);
        setIsDirty(false);
      }
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

  // ═════════════════════════════════════════════════════════
  // Saved state
  // ═════════════════════════════════════════════════════════
  if (savedNoteId) {
    return (
      <div className="space-y-5 max-w-4xl">
        <BackButton to={`/patients/${id}`} label={`${patient.firstName} ${patient.lastName}`} />

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
          onSigned={() => {}}
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

  // ═════════════════════════════════════════════════════════
  // Form state — wizard with sidebar
  // ═════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 max-w-6xl">
      {/* Page header — normal flow, scrolls with page */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton
            to={`/patients/${id}`}
            label={`${patient.firstName} ${patient.lastName}`}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {requiredMissing.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-warning bg-warning-bg/50 border border-warning/20 px-2.5 py-1 rounded-full">
              <AlertCircle size={11} />
              {requiredMissing.length} required field
              {requiredMissing.length === 1 ? '' : 's'} remaining
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <NotebookPen size={15} className="text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-on-surface leading-tight">
                {isEditMode ? 'Edit Progress Note' : 'Patient Progress Note'}
              </h1>
              <p className="text-xs text-text-muted">
                {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + body card */}
      <div className="flex border border-border-base rounded-2xl bg-surface-lowest overflow-hidden">
        <SectionNav
          sections={SECTIONS}
          activeKey={activeKey}
          states={sectionStates}
          onSelect={setActiveKey}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile section picker */}
          <div className="lg:hidden px-4 pt-4 pb-2 border-b border-border-base bg-surface-low/30">
            <label className="block text-xs font-medium text-text-muted mb-1">
              Section {activeIdx + 1} of {SECTIONS.length}
            </label>
            <select
              value={activeKey}
              onChange={(e) => setActiveKey(e.target.value as SectionKey)}
              className="w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.num} — {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section header */}
          <div className="px-6 pt-6 pb-4 border-b border-border-base">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] bg-primary/10 text-primary rounded px-1.5 py-0.5 leading-none">
                {activeDef.num}
              </span>
              <h2 className="text-base font-semibold text-on-surface">
                {activeDef.label}
              </h2>
            </div>
            <p className="text-xs text-text-muted">{activeDef.description}</p>
          </div>

          {/* Section body */}
          <div ref={bodyRef} className="px-6 py-6 min-h-[420px]">
            <SectionBody
              sectionKey={activeKey}
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

          {/* Prev / Next nav */}
          <div className="px-6 py-4 border-t border-border-base bg-surface-low/30 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={!canGoPrev}
              onClick={() => setActiveKey(SECTIONS[activeIdx - 1].key)}
            >
              Previous
            </Button>
            <span className="text-xs text-text-muted">
              {activeIdx + 1} / {SECTIONS.length}
            </span>
            {canGoNext ? (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => setActiveKey(SECTIONS[activeIdx + 1].key)}
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitClick}
                loading={createNote.isPending || updateNote.isPending}
              >
                Save Note
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Actions below the card */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={handleBack}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmitClick}
          loading={createNote.isPending || updateNote.isPending}
        >
          {isEditMode ? 'Save Changes' : 'Save Progress Note'}
        </Button>
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
                  {isEditMode ? 'Save Changes?' : 'Save Progress Note?'}
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
                disabled={createNote.isPending || updateNote.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmSave}
                loading={createNote.isPending || updateNote.isPending}
              >
                {isEditMode ? 'Yes, Save Changes' : 'Yes, Save Note'}
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

// ═════════════════════════════════════════════════════════════
// Section body — one section per case, no combining
// ═════════════════════════════════════════════════════════════

interface SectionBodyProps {
  sectionKey: SectionKey;
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

const SectionBody: React.FC<SectionBodyProps> = ({
  sectionKey, form, set, errors, setVital, blankMed, blankAddl,
  patientFirstName, patientLastName, patientMRN,
}) => {
  switch (sectionKey) {

    // ── Header ────────────────────────────────────────────────
    case 'header':
      return (
        <div className="space-y-4">
          <SectionTitle num="→">Header Information</SectionTitle>
          <Grid cols={2}>
            <Input label="Hospital / Facility Name" value="Yekatit 12 Hospital Medical College" disabled />
            <Input
              label="Palliative Care Unit"
              value={form.palliativeCareUnit || 'Palliative Care Unit'}
              onChange={(e) => set('palliativeCareUnit', e.target.value)}
            />
            <Input label="Patient Name" value={`${patientFirstName} ${patientLastName}`} disabled />
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

    // ── 1: Current Clinical Status ────────────────────────────
    case 'status':
      return (
        <div className="space-y-4">
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
            rows={4}
            value={form.changesSincePreviousReview}
            onChange={(e) => set('changesSincePreviousReview', e.target.value)}
          />
        </div>
      );

    // ── 2: Vital Signs ────────────────────────────────────────
    case 'vitals':
      return (
        <div className="space-y-4">
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

    // ── 3: Symptom Assessment ─────────────────────────────────
    case 'symptoms':
      return (
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
              <Input label="Pain Score (0–10)" type="number" min={0} max={10} value={form.painScore} onChange={(e) => set('painScore', e.target.value)} />
              <Input label="Location" value={form.painLocation} onChange={(e) => set('painLocation', e.target.value)} />
              <Input label="Character" value={form.painCharacter} onChange={(e) => set('painCharacter', e.target.value)} />
              <Input label="Current Pain Management" value={form.currentPainManagement} onChange={(e) => set('currentPainManagement', e.target.value)} />
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

    // ── 4: Respiratory Status ─────────────────────────────────
    case 'respiratory':
      return (
        <div className="space-y-4">
          <SectionTitle num={4}>Respiratory Status</SectionTitle>
          <RadioGroup
            label="Breathing"
            name="breathing"
            value={form.breathing}
            options={['Comfortable', 'Mild Distress', 'Moderate Distress', 'Severe Distress'].map((v) => ({ value: v, label: v }))}
            onChange={(v) => set('breathing', v)}
          />
          <Grid cols={2}>
            <YesNo label="Oxygen Therapy" name="oxygenTherapy" value={form.oxygenTherapy} onChange={(v) => set('oxygenTherapy', v)} />
            <RadioGroup
              label="Delivery"
              name="oxygenDelivery"
              value={form.oxygenDelivery}
              options={['Nasal Cannula', 'Mask', 'Other'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('oxygenDelivery', v)}
            />
          </Grid>
          {form.oxygenDelivery === 'Other' && (
            <Input label="Specify delivery method" value={form.oxygenDeliveryOther} onChange={(e) => set('oxygenDeliveryOther', e.target.value)} />
          )}
          <Grid cols={2}>
            <RadioGroup
              label="Respiratory Secretions"
              name="respiratorySecretions"
              value={form.respiratorySecretions}
              options={['None', 'Mild', 'Moderate', 'Excessive'].map((v) => ({ value: v, label: v }))}
              onChange={(v) => set('respiratorySecretions', v)}
            />
            <YesNo label="Cough" name="cough" value={form.cough} onChange={(v) => set('cough', v)} />
          </Grid>
          <Textarea label="Other Respiratory Findings" rows={3} value={form.otherRespiratoryFindings} onChange={(e) => set('otherRespiratoryFindings', e.target.value)} />
        </div>
      );

    // ── 5: Nutrition & Hydration ──────────────────────────────
    case 'nutrition':
      return (
        <div className="space-y-4">
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
          <Textarea label="Nutrition / Hydration Concerns" rows={3} value={form.nutritionHydrationConcerns} onChange={(e) => set('nutritionHydrationConcerns', e.target.value)} />
        </div>
      );

    // ── 6: Elimination ────────────────────────────────────────
    case 'elimination':
      return (
        <div className="space-y-4">
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
          <Textarea label="Other Elimination Concerns" rows={3} value={form.otherEliminationConcerns} onChange={(e) => set('otherEliminationConcerns', e.target.value)} />
        </div>
      );

    // ── 7: Skin & Wound ───────────────────────────────────────
    case 'skin':
      return (
        <div className="space-y-4">
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
          <Textarea label="Wound / Pressure Injury Changes" rows={3} value={form.woundPressureInjuryChanges} onChange={(e) => set('woundPressureInjuryChanges', e.target.value)} />
        </div>
      );

    // ── 8: Psychological / Emotional ──────────────────────────
    case 'psych':
      return (
        <div className="space-y-4">
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
          <Textarea label="Patient's Main Concerns Today" rows={3} value={form.patientsMainConcernsToday} onChange={(e) => set('patientsMainConcernsToday', e.target.value)} />
          <YesNo
            label="Counseling / Psychological Support Provided"
            name="counselingPsychologicalSupportProvided"
            value={form.counselingPsychologicalSupportProvided}
            onChange={(v) => set('counselingPsychologicalSupportProvided', v)}
          />
        </div>
      );

    // ── 9: Spiritual / Cultural ───────────────────────────────
    case 'spiritual':
      return (
        <div className="space-y-4">
          <SectionTitle num={9}>Spiritual / Cultural Needs</SectionTitle>
          <YesNo
            label="Spiritual Distress Identified"
            name="spiritualDistressIdentified"
            value={form.spiritualDistressIdentified}
            onChange={(v) => set('spiritualDistressIdentified', v)}
          />
          <Textarea label="Patient's Spiritual / Cultural Concerns" rows={3} value={form.patientsSpiritualCulturalConcerns} onChange={(e) => set('patientsSpiritualCulturalConcerns', e.target.value)} />
          <Grid cols={2}>
            <YesNo label="Spiritual Care Provided" name="spiritualCareProvided" value={form.spiritualCareProvided} onChange={(v) => set('spiritualCareProvided', v)} />
            <YesNo label="Referral Required" name="spiritualReferralRequired" value={form.spiritualReferralRequired} onChange={(v) => set('spiritualReferralRequired', v)} />
          </Grid>
          <Textarea label="Notes" rows={3} value={form.spiritualNotes} onChange={(e) => set('spiritualNotes', e.target.value)} />
        </div>
      );

    // ── 10: Family / Caregiver ────────────────────────────────
    case 'family':
      return (
        <div className="space-y-4">
          <SectionTitle num={10}>Family / Caregiver Update</SectionTitle>
          <YesNo
            label="Family / Caregiver Present"
            name="familyCaregiverPresent"
            value={form.familyCaregiverPresent}
            onChange={(v) => set('familyCaregiverPresent', v)}
          />
          <Textarea label="Family / Caregiver Concerns" rows={3} value={form.familyCaregiverConcerns} onChange={(e) => set('familyCaregiverConcerns', e.target.value)} />
          <Textarea label="Education / Support Provided" rows={3} value={form.familyEducationSupportProvided} onChange={(e) => set('familyEducationSupportProvided', e.target.value)} />
          <Grid cols={2}>
            <YesNo label="Family Meeting Held" name="familyMeetingHeld" value={form.familyMeetingHeld} onChange={(v) => set('familyMeetingHeld', v)} />
            {form.familyMeetingHeld === 'Yes' && (
              <Input label="Participants" value={form.familyMeetingParticipants} onChange={(e) => set('familyMeetingParticipants', e.target.value)} />
            )}
          </Grid>
        </div>
      );

    // ── 11: Goals of Care ─────────────────────────────────────
    case 'goals':
      return (
        <div className="space-y-4">
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
          <Textarea label="Patient / Decision-Maker Preferences" rows={3} value={form.patientDecisionMakerPreferences} onChange={(e) => set('patientDecisionMakerPreferences', e.target.value)} />
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

    // ── 12: Medication Review ─────────────────────────────────
    case 'meds':
      return (
        <div className="space-y-4">
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
        </div>
      );

    // ── 13: Nursing / Supportive Care ─────────────────────────
    case 'nursing':
      return (
        <div className="space-y-4">
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
          <Textarea label="Response to Supportive Care" rows={3} value={form.responseToSupportiveCare} onChange={(e) => set('responseToSupportiveCare', e.target.value)} />
        </div>
      );

    // ── 14: Investigations ────────────────────────────────────
    case 'investigations':
      return (
        <div className="space-y-4">
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
          <Textarea label="Significant Results" rows={4} value={form.significantResults} onChange={(e) => set('significantResults', e.target.value)} />
          <Textarea label="Clinical Significance / Action Taken" rows={3} value={form.clinicalSignificanceActionTaken} onChange={(e) => set('clinicalSignificanceActionTaken', e.target.value)} />
        </div>
      );

    // ── 15: MDT Review ────────────────────────────────────────
    case 'mdt':
      return (
        <div className="space-y-4">
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

    // ── 16: Clinical Assessment ───────────────────────────────
    case 'assessment':
      return (
        <div className="space-y-4">
          <SectionTitle num={16}>Clinical Assessment</SectionTitle>
          <Textarea label="Overall Assessment" rows={5} value={form.overallAssessment} onChange={(e) => set('overallAssessment', e.target.value)} />
          <Textarea
            label="Problems Identified Today (one per line)"
            rows={5}
            placeholder={'1. …\n2. …\n3. …'}
            value={form.problemsIdentifiedToday.join('\n')}
            onChange={(e) =>
              set(
                'problemsIdentifiedToday',
                e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
              )
            }
          />
        </div>
      );

    // ── 17: Plan ──────────────────────────────────────────────
    case 'plan':
      return (
        <div className="space-y-4">
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
            <Textarea key={key} label={label} rows={3} value={form[key]} onChange={(e) => set(key, e.target.value)} />
          ))}
        </div>
      );

    // ── 18: SOAP Notes ────────────────────────────────────────
    case 'soap':
      return (
        <div className="space-y-4">
          <SectionTitle num={18}>Progress Note — SOAP Format</SectionTitle>
          {[
            { key: 'soapSubjective' as const, label: 'S — Subjective: Patient / Family Report' },
            { key: 'soapObjective' as const, label: 'O — Objective: Clinical Findings / Vital Signs' },
            { key: 'soapAssessment' as const, label: 'A — Assessment: Clinical Assessment' },
            { key: 'soapPlan' as const, label: 'P — Plan: Treatment and Follow-Up Plan' },
          ].map(({ key, label }) => (
            <Textarea key={key} label={label} rows={4} value={form[key]} onChange={(e) => set(key, e.target.value)} />
          ))}
        </div>
      );

    // ── 19: Additional Notes ──────────────────────────────────
    case 'additional':
      return (
        <div className="space-y-4">
          <SectionTitle num={19}>Additional Progress Notes</SectionTitle>
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
      );

    // ── 20: Authorization ─────────────────────────────────────
    case 'auth':
      return (
        <div className="space-y-4">
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

    default:
      return null;
  }
};

export default RecordProgressNotePage;