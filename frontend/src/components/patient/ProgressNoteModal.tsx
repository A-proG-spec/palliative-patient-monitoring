import React, { useEffect, useRef, useMemo } from 'react';
import { X, Printer, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { useProgressNote, useDeleteProgressNote } from '@/hooks/useProgressNotes';
import { useAuthStore } from '@/store/auth.store';
import type { ProgressNote } from '@/hooks/useProgressNotes';

// ══════════════════════════════════════════════════════════════════════════════
// Symptom flat ↔ nested mapping
// ══════════════════════════════════════════════════════════════════════════════

const SYMPTOM_KEYS: { frontend: string; backend: string; label: string }[] = [
  { frontend: 'Pain',                 backend: 'pain',           label: 'Pain' },
  { frontend: 'Shortness of Breath',  backend: 'shortnessOfBreath', label: 'Shortness of Breath' },
  { frontend: 'Nausea',               backend: 'nausea',         label: 'Nausea' },
  { frontend: 'Vomiting',             backend: 'vomiting',       label: 'Vomiting' },
  { frontend: 'Constipation',         backend: 'constipation',   label: 'Constipation' },
  { frontend: 'Diarrhea',             backend: 'diarrhea',       label: 'Diarrhea' },
  { frontend: 'Fatigue',              backend: 'fatigue',        label: 'Fatigue' },
  { frontend: 'Anxiety',              backend: 'anxiety',        label: 'Anxiety' },
  { frontend: 'Delirium/Confusion',   backend: 'delirium',       label: 'Delirium / Confusion' },
  { frontend: 'Insomnia',             backend: 'insomania',      label: 'Insomnia' },
  { frontend: 'Appetite Loss',        backend: 'appetiteLoss',   label: 'Appetite Loss' },
  { frontend: 'Other',                backend: 'other',          label: 'Other' },
];

const VITAL_KEYS = [
  { key: 'temperature',     label: 'Temperature',     unit: '°C' },
  { key: 'pulse',           label: 'Pulse',           unit: 'bpm' },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min' },
  { key: 'bloodPressure',   label: 'Blood Pressure',  unit: 'mmHg' },
  { key: 'spo2',            label: 'SpO₂',            unit: '%' },
  { key: 'oxygenFlow',      label: 'Oxygen Flow',     unit: 'L/min' },
] as const;

// ══════════════════════════════════════════════════════════════════════════════
// Normalize — accepts BOTH the flat backend shape and any nested shape,
// returns the canonical nested form the display logic uses.
// ══════════════════════════════════════════════════════════════════════════════

interface NormalizedNote {
  vitals: Record<string, { current: string; previous: string }>;
  symptoms: Record<string, { severity: string; notes: string }>;
}

function normalizeNote(note: any): NormalizedNote {
  // ── Vitals ──
  // The backend returns flat columns: `temperature`, `pulse`, etc.
  // The frontend form uses nested: `vitals.temperature.current`.
  // Handle both.
  const nestedVitals = note.vitals;
  const vitals: NormalizedNote['vitals'] = {};

  for (const { key } of VITAL_KEYS) {
    const nested = nestedVitals?.[key];
    if (nested && typeof nested === 'object' && 'current' in nested) {
      vitals[key] = {
        current: nested.current ?? '',
        previous: nested.previous ?? '',
      };
    } else {
      // Flat backend shape
      vitals[key] = {
        current: note[key] != null ? String(note[key]) : '',
        previous: '',
      };
    }
  }

  // ── Symptoms ──
  // The backend returns flat columns: `pain`, `painNote`, `nausea`, etc.
  // The frontend form uses nested: `symptoms['Pain'].severity`.
  // Handle both.
  const nestedSymptoms = note.symptoms;
  const symptoms: NormalizedNote['symptoms'] = {};

  for (const { frontend, backend } of SYMPTOM_KEYS) {
    const nested = nestedSymptoms?.[frontend];
    if (nested && typeof nested === 'object' && 'severity' in nested) {
      symptoms[frontend] = {
        severity: nested.severity ?? 'None',
        notes: nested.notes ?? '',
      };
    } else {
      // Flat backend shape
      symptoms[frontend] = {
        severity: note[backend] ?? 'None',
        notes: note[`${backend}Note`] ?? '',
      };
    }
  }

  return { vitals, symptoms };
}

// ══════════════════════════════════════════════════════════════════════════════
// Props
// ══════════════════════════════════════════════════════════════════════════════

interface ProgressNoteModalProps {
  patientId: string;
  noteId: string;
  onClose: () => void;
  onEdit?: (noteId: string) => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// Section + Field
// ══════════════════════════════════════════════════════════════════════════════

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}> = ({ title, children, isEmpty }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-on-surface mb-3 border-b border-border-base pb-2">
      {title}
    </h3>
    {isEmpty ? (
      <p className="text-sm text-text-muted italic">Not recorded</p>
    ) : (
      <div className="space-y-2 text-sm">{children}</div>
    )}
  </div>
);

const Field: React.FC<{ label: string; value?: string | null | number }> = ({
  label,
  value,
}) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-2">
      <span className="text-text-muted min-w-[160px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-on-surface">{String(value)}</span>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Modal Component
// ══════════════════════════════════════════════════════════════════════════════

export const ProgressNoteModal: React.FC<ProgressNoteModalProps> = ({
  patientId,
  noteId,
  onClose,
  onEdit,
}) => {
  const { user } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: note, isLoading, error, refetch } = useProgressNote(
    patientId,
    noteId,
  );
  const deleteMutation = useDeleteProgressNote(patientId);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // ── Normalized data (handles both flat and nested shapes) ──
  const normalized = useMemo(
    () => (note ? normalizeNote(note as any) : null),
    [note],
  );

  // ── Access control ──
  const isAdmin = user?.type === 'admin';
  const isAuthor =
    (note as any)?.responsibleClinician?.staffId === user?.id ||
    (note as any)?.createdBy === user?.id;
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAdmin;

  // ── Lock body scroll ──
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ── Focus trap ──
  useEffect(() => {
    if (!modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();
    return () => document.removeEventListener('keydown', handleTab);
  }, [isLoading]);

  // ── Escape key ──
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showDeleteConfirm]);

  // ── Handlers ──
  const handlePrint = () => window.print();

  const handleDelete = () => {
    deleteMutation.mutate(noteId, { onSuccess: () => onClose() });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
        <div className="bg-surface-lowest rounded-2xl p-8">
          <PageLoader />
        </div>
      </div>
    );
  }

  if (error || !note || !normalized) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-surface-lowest rounded-2xl p-6 max-w-md">
          <ErrorState onRetry={refetch} />
          <Button onClick={onClose} variant="outline" className="w-full mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // Delete confirmation
  // ══════════════════════════════════════════════════════════════════════
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-error mb-4">
            <Trash2 size={24} />
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">
            Delete Progress Note
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Are you sure you want to delete this progress note? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // Main read-only modal
  // ══════════════════════════════════════════════════════════════════════
  const n = note as any;
  const vitals = normalized.vitals;
  const symptoms = normalized.symptoms;

  // Helper: does any vital have a value?
  const hasVitals = VITAL_KEYS.some(
    (v) => vitals[v.key]?.current || vitals[v.key]?.previous,
  );

  // Helper: does any symptom have a non-None severity or notes?
  const hasSymptoms = SYMPTOM_KEYS.some((s) => {
    const row = symptoms[s.frontend];
    return (row?.severity && row.severity !== 'None') || row?.notes;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0 print:hidden">
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Patient Progress Note
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-secondary">
                {formatDate(n.createdAt)}
              </span>
              {n.allSigned && <Badge variant="success">All Signed</Badge>}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — read-only */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Print-only header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-xl font-bold">Patient Progress Note</h1>
            <p className="text-sm text-gray-600">
              Date: {formatDate(n.createdAt)}
            </p>
          </div>

          {/* ── Note Information ── */}
          <Section
            title="Note Information"
            isEmpty={!n.attendingClinician && !n.palliativeCareUnit}
          >
            <Field label="Attending Clinician" value={n.attendingClinician} />
            <Field label="Palliative Care Unit" value={n.palliativeCareUnit} />
          </Section>

          {/* ── 1. Current Clinical Status ── */}
          <Section
            title="1. Current Clinical Status"
            isEmpty={
              !n.generalCondition &&
              !n.levelOfConsciousness &&
              !n.orientation &&
              !n.functionalStatus &&
              !n.changesSincePreviousReview
            }
          >
            <Field label="General Condition" value={n.generalCondition} />
            <Field
              label="Level of Consciousness"
              value={n.levelOfConsciousness}
            />
            <Field label="Orientation" value={n.orientation} />
            <Field label="Functional Status" value={n.functionalStatus} />
            <Field
              label="Changes Since Previous Review"
              value={n.changesSincePreviousReview}
            />
          </Section>

          {/* ── 2. Vital Signs ── */}
          <Section title="2. Vital Signs" isEmpty={!hasVitals}>
            {!hasVitals ? null : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {VITAL_KEYS.map(({ key, label, unit }) => {
                  const v = vitals[key];
                  if (!v?.current && !v?.previous) return null;
                  return (
                    <div key={key} className="flex gap-2">
                      <span className="text-text-muted min-w-[160px] flex-shrink-0">
                        {label}:
                      </span>
                      <span className="text-on-surface">
                        {v.current || '—'}
                        {v.current && unit ? ` ${unit}` : ''}
                        {v.previous ? (
                          <span className="text-text-muted text-xs ml-2">
                            (prev: {v.previous})
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <Field
              label="Other Observations"
              value={n.otherRelevantObservations}
            />
          </Section>

          {/* ── 3. Symptom Assessment ── */}
          <Section title="3. Symptom Assessment" isEmpty={!hasSymptoms}>
            {!hasSymptoms ? null : (
              <div className="space-y-1.5">
                {SYMPTOM_KEYS.map(({ frontend, label }) => {
                  const row = symptoms[frontend];
                  if (!row) return null;
                  if (row.severity === 'None' && !row.notes) return null;
                  return (
                    <div key={frontend} className="flex gap-2">
                      <span className="text-text-muted min-w-[160px] flex-shrink-0">
                        {label}:
                      </span>
                      <span className="text-on-surface">
                        {row.severity}
                        {row.notes ? ` — ${row.notes}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* ── 3b. Pain Review ── */}
          <Section
            title="Pain Review"
            isEmpty={
              !n.painScore &&
              !n.painLocation &&
              !n.painCharacter &&
              !n.currentPainManagement &&
              !n.responseToTreatment &&
              !n.breakthroughPainEpisodes
            }
          >
            <Field label="Pain Score" value={n.painScore} />
            <Field label="Location" value={n.painLocation} />
            <Field label="Character" value={n.painCharacter} />
            <Field
              label="Current Management"
              value={n.currentPainManagement}
            />
            <Field
              label="Response to Treatment"
              value={n.responseToTreatment}
            />
            <Field
              label="Breakthrough Episodes"
              value={n.breakthroughPainEpisodes}
            />
            <Field
              label="Frequency"
              value={n.breakthroughPainFrequency}
            />
          </Section>

          {/* ── 4. Respiratory ── */}
          <Section
            title="4. Respiratory Status"
            isEmpty={
              !n.breathing &&
              !n.oxygenTherapy &&
              !n.respiratorySecretions &&
              !n.cough &&
              !n.otherRespiratoryFindings
            }
          >
            <Field label="Breathing" value={n.breathing} />
            <Field label="Oxygen Therapy" value={n.oxygenTherapy} />
            <Field label="Oxygen Delivery" value={n.oxygenDelivery} />
            <Field
              label="Other Delivery Method"
              value={n.oxygenDeliveryOther}
            />
            <Field
              label="Respiratory Secretions"
              value={n.respiratorySecretions}
            />
            <Field label="Cough" value={n.cough} />
            <Field
              label="Other Findings"
              value={n.otherRespiratoryFindings}
            />
          </Section>

          {/* ── 5. Nutrition & Hydration ── */}
          <Section
            title="5. Nutrition & Hydration"
            isEmpty={
              !n.oralIntake &&
              !n.diet &&
              !n.fluidIntake &&
              !n.feedingAssistance &&
              !n.enteralFeeding &&
              !n.ivFluids &&
              !n.nauseaVomitingAffectingIntake &&
              !n.nutritionHydrationConcerns
            }
          >
            <Field label="Oral Intake" value={n.oralIntake} />
            <Field label="Diet" value={n.diet} />
            <Field label="Fluid Intake" value={n.fluidIntake} />
            <Field
              label="Feeding Assistance"
              value={n.feedingAssistance}
            />
            <Field label="Enteral Feeding" value={n.enteralFeeding} />
            <Field label="IV Fluids" value={n.ivFluids} />
            <Field
              label="Nausea/Vomiting Affecting Intake"
              value={n.nauseaVomitingAffectingIntake}
            />
            <Field
              label="Concerns"
              value={n.nutritionHydrationConcerns}
            />
          </Section>

          {/* ── 6. Elimination ── */}
          <Section
            title="6. Elimination"
            isEmpty={
              !n.urineOutput &&
              !n.urinaryCatheter &&
              !n.bowelMovement &&
              !n.lastBowelMovement &&
              !n.otherEliminationConcerns
            }
          >
            <Field label="Urine Output" value={n.urineOutput} />
            <Field label="Urinary Catheter" value={n.urinaryCatheter} />
            <Field label="Bowel Movement" value={n.bowelMovement} />
            <Field
              label="Last Bowel Movement"
              value={n.lastBowelMovement}
            />
            <Field
              label="Other Concerns"
              value={n.otherEliminationConcerns}
            />
          </Section>

          {/* ── 7. Skin & Wound ── */}
          <Section
            title="7. Skin & Wound Status"
            isEmpty={
              !n.skin &&
              !n.skinOther &&
              !n.pressureInjury &&
              !n.pressureInjuryLocationStage &&
              !n.woundCareProvided &&
              !n.woundPressureInjuryChanges
            }
          >
            <Field label="Skin" value={n.skin} />
            {n.skinOther && (
              <Field label="Other" value={n.skinOther} />
            )}
            <Field label="Pressure Injury" value={n.pressureInjury} />
            {n.pressureInjuryLocationStage && (
              <Field
                label="Location/Stage"
                value={n.pressureInjuryLocationStage}
              />
            )}
            <Field
              label="Wound Care Provided"
              value={n.woundCareProvided}
            />
            <Field
              label="Changes"
              value={n.woundPressureInjuryChanges}
            />
          </Section>

          {/* ── 8. Psychological ── */}
          <Section
            title="8. Psychological / Emotional Status"
            isEmpty={
              (!n.moodBehavior || n.moodBehavior.length === 0) &&
              !n.psychologicalDistress &&
              !n.patientsMainConcernsToday &&
              !n.counselingPsychologicalSupportProvided
            }
          >
            {n.moodBehavior?.length > 0 && (
              <Field
                label="Mood/Behavior"
                value={n.moodBehavior.join(', ')}
              />
            )}
            <Field
              label="Psychological Distress"
              value={n.psychologicalDistress}
            />
            <Field
              label="Patient's Main Concerns"
              value={n.patientsMainConcernsToday}
            />
            <Field
              label="Support Provided"
              value={n.counselingPsychologicalSupportProvided}
            />
          </Section>

          {/* ── 9. Spiritual ── */}
          <Section
            title="9. Spiritual / Cultural Needs"
            isEmpty={
              !n.spiritualDistressIdentified &&
              !n.patientsSpiritualCulturalConcerns &&
              !n.spiritualCareProvided &&
              !n.spiritualReferralRequired &&
              !n.spiritualNotes
            }
          >
            <Field
              label="Spiritual Distress Identified"
              value={n.spiritualDistressIdentified}
            />
            <Field
              label="Patient's Concerns"
              value={n.patientsSpiritualCulturalConcerns}
            />
            <Field
              label="Care Provided"
              value={n.spiritualCareProvided}
            />
            <Field
              label="Referral Required"
              value={n.spiritualReferralRequired}
            />
            <Field label="Notes" value={n.spiritualNotes} />
          </Section>

          {/* ── 10. Family ── */}
          <Section
            title="10. Family / Caregiver Update"
            isEmpty={
              !n.familyCaregiverPresent &&
              !n.familyCaregiverConcerns &&
              !n.familyEducationSupportProvided &&
              !n.familyMeetingHeld &&
              !n.familyMeetingParticipants
            }
          >
            <Field
              label="Family/Caregiver Present"
              value={n.familyCaregiverPresent}
            />
            <Field label="Concerns" value={n.familyCaregiverConcerns} />
            <Field
              label="Education/Support Provided"
              value={n.familyEducationSupportProvided}
            />
            <Field label="Meeting Held" value={n.familyMeetingHeld} />
            <Field
              label="Participants"
              value={n.familyMeetingParticipants}
            />
          </Section>

          {/* ── 11. Goals of Care ── */}
          <Section
            title="11. Goals of Care"
            isEmpty={
              (!n.currentGoalsOfCare ||
                n.currentGoalsOfCare.length === 0) &&
              !n.currentGoalsOfCareOther &&
              !n.goalsReviewedToday &&
              !n.changeInGoalsIdentified &&
              !n.patientDecisionMakerPreferences &&
              !n.codeStatus &&
              !n.advanceCarePlanReviewed
            }
          >
            {n.currentGoalsOfCare?.length > 0 && (
              <Field
                label="Current Goals"
                value={n.currentGoalsOfCare.join(', ')}
              />
            )}
            {n.currentGoalsOfCareOther && (
              <Field
                label="Other Goals"
                value={n.currentGoalsOfCareOther}
              />
            )}
            <Field
              label="Goals Reviewed Today"
              value={n.goalsReviewedToday}
            />
            <Field
              label="Changes Identified"
              value={n.changeInGoalsIdentified}
            />
            <Field
              label="Patient/Decision Maker Preferences"
              value={n.patientDecisionMakerPreferences}
            />
            <Field label="Code Status" value={n.codeStatus} />
            {n.codeStatusOther && (
              <Field label="Other" value={n.codeStatusOther} />
            )}
            <Field
              label="Advance Care Plan Reviewed"
              value={n.advanceCarePlanReviewed}
            />
          </Section>

          {/* ── 12. Medication Review ── */}
          <Section
            title="12. Medication Review"
            isEmpty={
              !n.currentMedicationRegimenReviewed &&
              !n.changesMade &&
              (!n.medications || n.medications.length === 0) &&
              !n.prnBreakthroughMedicationUsed &&
              !n.medicationSideEffects
            }
          >
            <Field
              label="Regimen Reviewed"
              value={n.currentMedicationRegimenReviewed}
            />
            <Field label="Changes Made" value={n.changesMade} />

            {n.medications?.length > 0 && (
              <div className="mt-3">
                <p className="text-text-muted text-xs mb-2">
                  Current Medications:
                </p>
                <div className="space-y-2">
                  {n.medications.map(
                    (med: any, i: number) =>
                      (med?.medicationTreatment ||
                        med?.dose ||
                        med?.route) && (
                        <div
                          key={i}
                          className="bg-surface-low p-2 rounded text-xs"
                        >
                          <div>
                            <strong>
                              {med.medicationTreatment || '—'}
                            </strong>
                          </div>
                          <div>
                            Dose: {med.dose || '—'} | Route:{' '}
                            {med.route || '—'} | Frequency:{' '}
                            {med.frequency || '—'}
                          </div>
                          {med.reasonResponse && (
                            <div>
                              Reason/Response: {med.reasonResponse}
                            </div>
                          )}
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {(n.prnBreakthroughMedicationUsed ||
              n.prnEffectiveness) && (
              <div className="mt-3 pt-3 border-t border-border-base">
                <Field
                  label="PRN Used"
                  value={n.prnBreakthroughMedicationUsed}
                />
                <Field
                  label="PRN Effectiveness"
                  value={n.prnEffectiveness}
                />
              </div>
            )}
            {n.medicationSideEffects && (
              <div className="mt-2">
                <Field
                  label="Side Effects"
                  value={n.medicationSideEffects}
                />
                {n.medicationSideEffectsDetail && (
                  <Field
                    label="Details"
                    value={n.medicationSideEffectsDetail}
                  />
                )}
              </div>
            )}
          </Section>

          {/* ── 13. Nursing ── */}
          <Section
            title="13. Nursing / Supportive Care"
            isEmpty={
              (!n.nursingSupportiveCareProvided ||
                n.nursingSupportiveCareProvided.length === 0) &&
              !n.nursingSupportiveCareOther &&
              !n.responseToSupportiveCare
            }
          >
            {n.nursingSupportiveCareProvided?.length > 0 && (
              <Field
                label="Care Provided"
                value={n.nursingSupportiveCareProvided.join(', ')}
              />
            )}
            {n.nursingSupportiveCareOther && (
              <Field label="Other" value={n.nursingSupportiveCareOther} />
            )}
            <Field
              label="Response to Care"
              value={n.responseToSupportiveCare}
            />
          </Section>

          {/* ── 14. Investigations ── */}
          <Section
            title="14. Investigations"
            isEmpty={
              (!n.investigationsPerformedReviewed ||
                n.investigationsPerformedReviewed.length === 0) &&
              !n.investigationsPerformedReviewedOther &&
              !n.significantResults &&
              !n.clinicalSignificanceActionTaken
            }
          >
            {n.investigationsPerformedReviewed?.length > 0 && (
              <Field
                label="Performed/Reviewed"
                value={n.investigationsPerformedReviewed.join(', ')}
              />
            )}
            {n.investigationsPerformedReviewedOther && (
              <Field
                label="Other"
                value={n.investigationsPerformedReviewedOther}
              />
            )}
            <Field
              label="Significant Results"
              value={n.significantResults}
            />
            <Field
              label="Clinical Significance / Action Taken"
              value={n.clinicalSignificanceActionTaken}
            />
          </Section>

          {/* ── 15. MDT Review ── */}
          <Section
            title="15. Multidisciplinary Team Review"
            isEmpty={
              !n.multidisciplinaryTeamReview ||
              n.multidisciplinaryTeamReview.length === 0 ||
              !n.multidisciplinaryTeamReview.some(
                (m: any) => m?.reviewIntervention,
              )
            }
          >
            <div className="space-y-2">
              {n.multidisciplinaryTeamReview?.map(
                (entry: any, i: number) =>
                  entry?.reviewIntervention ? (
                    <div
                      key={i}
                      className="bg-surface-low p-3 rounded"
                    >
                      <div className="font-medium text-xs text-primary mb-1">
                        {entry.discipline}
                      </div>
                      <div className="text-sm">
                        {entry.reviewIntervention}
                      </div>
                      {entry.followUpRequired && (
                        <div className="text-xs text-text-muted mt-1">
                          Follow-up required: {entry.followUpRequired}
                        </div>
                      )}
                    </div>
                  ) : null,
              )}
            </div>
          </Section>

          {/* ── 16. Assessment ── */}
          <Section
            title="16. Clinical Assessment"
            isEmpty={
              !n.overallAssessment &&
              (!n.problemsIdentifiedToday ||
                n.problemsIdentifiedToday.length === 0)
            }
          >
            <Field
              label="Overall Assessment"
              value={n.overallAssessment}
            />
            {n.problemsIdentifiedToday?.length > 0 && (
              <Field
                label="Problems Identified"
                value={n.problemsIdentifiedToday.join(', ')}
              />
            )}
          </Section>

          {/* ── 17. Plan ── */}
          <Section
            title="17. Plan"
            isEmpty={
              !n.symptomManagementPlan &&
              !n.medicationPlan &&
              !n.nursingSupportiveCarePlan &&
              !n.investigationsMonitoring &&
              !n.familyCaregiverPlan &&
              !n.referralsConsultations &&
              !n.dischargeTransferHospicePlanning
            }
          >
            <Field
              label="Symptom Management"
              value={n.symptomManagementPlan}
            />
            <Field label="Medication Plan" value={n.medicationPlan} />
            <Field
              label="Nursing/Supportive Care"
              value={n.nursingSupportiveCarePlan}
            />
            <Field
              label="Investigations/Monitoring"
              value={n.investigationsMonitoring}
            />
            <Field
              label="Family/Caregiver"
              value={n.familyCaregiverPlan}
            />
            <Field
              label="Referrals/Consultations"
              value={n.referralsConsultations}
            />
            <Field
              label="Discharge/Transfer/Hospice Planning"
              value={n.dischargeTransferHospicePlanning}
            />
          </Section>

          {/* ── 18. SOAP ── */}
          <Section
            title="18. SOAP Notes"
            isEmpty={
              !n.soapSubjective &&
              !n.soapObjective &&
              !n.soapAssessment &&
              !n.soapPlan
            }
          >
            <Field label="Subjective" value={n.soapSubjective} />
            <Field label="Objective" value={n.soapObjective} />
            <Field label="Assessment" value={n.soapAssessment} />
            <Field label="Plan" value={n.soapPlan} />
          </Section>

          {/* ── 19. Additional Notes ── */}
          <Section
            title="19. Additional Progress Notes"
            isEmpty={
              !n.additionalProgressNotes ||
              n.additionalProgressNotes.length === 0
            }
          >
            <div className="space-y-3">
              {n.additionalProgressNotes?.map(
                (entry: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-2 border-primary pl-3"
                  >
                    <div className="text-xs text-text-muted mb-1">
                      {entry.date} {entry.time} —{' '}
                      {entry.clinicianName}
                    </div>
                    <div className="text-sm">{entry.note}</div>
                  </div>
                ),
              )}
            </div>
          </Section>

          {/* ── 20. Authorization ── */}
          <Section
            title="20. Authorization / Signatures"
            isEmpty={
              !n.responsibleClinician &&
              (!n.signatures || n.signatures.length === 0) &&
              !n.facilityStamp
            }
          >
            {n.responsibleClinician && (
              <div className="mb-3">
                <Field
                  label="Responsible Clinician"
                  value={n.responsibleClinician.name}
                />
                <Field
                  label="Role"
                  value={n.responsibleClinician.role}
                />
              </div>
            )}
            {n.signatures?.length > 0 && (
              <div className="mt-3">
                <p className="text-text-muted text-xs mb-2">
                  Signatures:
                </p>
                {n.signatures.map((sig: any, i: number) => (
                  <div
                    key={i}
                    className="bg-surface-low p-2 rounded mb-2 text-xs"
                  >
                    <div>
                      <strong>{sig.name}</strong> ({sig.role})
                    </div>
                    <div className="text-text-muted">
                      {formatDate(sig.signedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {n.facilityStamp && (
              <Field label="Facility Stamp" value={n.facilityStamp} />
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-border-base flex-shrink-0 print:hidden">
          <Button
            variant="outline"
            leftIcon={<Printer size={14} />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {canEdit && onEdit && (
            <Button
              variant="outline"
              leftIcon={<Pencil size={14} />}
              onClick={() => onEdit(noteId)}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            className="ml-auto"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            overflow: visible !important;
          }
          .fixed {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
};