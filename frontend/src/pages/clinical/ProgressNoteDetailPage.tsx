// frontend/src/pages/clinical/ProgressNoteDetailPage.tsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Printer, Edit3, Trash2, NotebookPen } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

import {
  useProgressNote,
  useDeleteProgressNote,
} from '@/hooks/useProgressNotes';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Symptom flat ↔ nested mapping (mirrors ProgressNoteModal)
// ─────────────────────────────────────────────────────────────
const SYMPTOM_KEYS: { frontend: string; backend: string; label: string }[] = [
  { frontend: 'Pain',                backend: 'pain',              label: 'Pain' },
  { frontend: 'Shortness of Breath', backend: 'shortnessOfBreath', label: 'Shortness of Breath' },
  { frontend: 'Nausea',              backend: 'nausea',            label: 'Nausea' },
  { frontend: 'Vomiting',            backend: 'vomiting',          label: 'Vomiting' },
  { frontend: 'Constipation',        backend: 'constipation',      label: 'Constipation' },
  { frontend: 'Diarrhea',            backend: 'diarrhea',          label: 'Diarrhea' },
  { frontend: 'Fatigue',             backend: 'fatigue',           label: 'Fatigue' },
  { frontend: 'Anxiety',             backend: 'anxiety',           label: 'Anxiety' },
  { frontend: 'Delirium/Confusion',  backend: 'delirium',          label: 'Delirium / Confusion' },
  { frontend: 'Insomnia',            backend: 'insomania',         label: 'Insomnia' },
  { frontend: 'Appetite Loss',       backend: 'appetiteLoss',      label: 'Appetite Loss' },
  { frontend: 'Other',               backend: 'other',             label: 'Other' },
];

const VITAL_KEYS = [
  { key: 'temperature',     label: 'Temperature',     unit: '°C' },
  { key: 'pulse',           label: 'Pulse',           unit: 'bpm' },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min' },
  { key: 'bloodPressure',   label: 'Blood Pressure',  unit: 'mmHg' },
  { key: 'spo2',            label: 'SpO₂',            unit: '%' },
  { key: 'oxygenFlow',      label: 'Oxygen Flow',     unit: 'L/min' },
] as const;

// Normalize both flat (backend) and nested (frontend form) shapes.
function normalizeNote(note: any) {
  const vitals: Record<string, { current: string; previous: string }> = {};
  for (const { key } of VITAL_KEYS) {
    const nested = note.vitals?.[key];
    if (nested && typeof nested === 'object' && 'current' in nested) {
      vitals[key] = { current: nested.current ?? '', previous: nested.previous ?? '' };
    } else {
      vitals[key] = { current: note[key] != null ? String(note[key]) : '', previous: '' };
    }
  }

  const symptoms: Record<string, { severity: string; notes: string }> = {};
  for (const { frontend, backend } of SYMPTOM_KEYS) {
    const nested = note.symptoms?.[frontend];
    if (nested && typeof nested === 'object' && 'severity' in nested) {
      symptoms[frontend] = { severity: nested.severity ?? 'None', notes: nested.notes ?? '' };
    } else {
      symptoms[frontend] = { severity: note[backend] ?? 'None', notes: note[`${backend}Note`] ?? '' };
    }
  }

  return { vitals, symptoms };
}

// ── Small render helpers ──
const Section: React.FC<{ title: string; isEmpty?: boolean; children: React.ReactNode }> = ({
  title, isEmpty, children,
}) => (
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

const Field: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-2">
      <span className="text-text-muted min-w-[160px] flex-shrink-0">{label}:</span>
      <span className="text-on-surface">{String(value)}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const ProgressNoteDetailPage: React.FC = () => {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const isAdmin = user?.type === 'admin';
  const isAdminRoute = pathname.startsWith('/admin/');

  // Route-aware base path — admin clicks stay in the admin tree.
  const basePath = isAdminRoute ? `/admin/patients/${id}` : `/patients/${id}`;

  const { data: note, isLoading, error, refetch } = useProgressNote(id!, noteId!);
  const deleteMutation = useDeleteProgressNote(id!);
  const [showDelete, setShowDelete] = React.useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !note) return <ErrorState onRetry={refetch} />;

  const normalized = normalizeNote(note as any);
  const n = note as any;

  const hasVitals = VITAL_KEYS.some((v) => normalized.vitals[v.key]?.current || normalized.vitals[v.key]?.previous);
  const hasSymptoms = SYMPTOM_KEYS.some((s) => {
    const row = normalized.symptoms[s.frontend];
    return (row?.severity && row.severity !== 'None') || row?.notes;
  });

  const canDelete = isAdmin;
  const canEdit = isAdmin;

  const handleDelete = () => {
    deleteMutation.mutate(noteId!, {
      onSuccess: () => navigate(basePath, { state: { savedProgressNote: true } }),
    });
    setShowDelete(false);
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton to={basePath} label="Patient" />
          <div>
            <div className="flex items-center gap-2">
              <NotebookPen size={16} className="text-primary" />
              <h1 className="text-xl font-bold text-on-surface">Progress Note</h1>
              {n.allSigned && <Badge variant="success">All Signed</Badge>}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDate(n.createdAt)}
              {n.attendingClinician ? ` · ${n.attendingClinician}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={() => navigate(`${basePath}/progress-note/${noteId}/edit`)}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setShowDelete(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-surface-lowest border border-border-base rounded-2xl px-6 py-5">
        <Section title="Note Information" isEmpty={!n.attendingClinician && !n.palliativeCareUnit}>
          <Field label="Attending Clinician" value={n.attendingClinician} />
          <Field label="Palliative Care Unit" value={n.palliativeCareUnit} />
        </Section>

        <Section
          title="1. Current Clinical Status"
          isEmpty={!n.generalCondition && !n.levelOfConsciousness && !n.functionalStatus && !n.changesSincePreviousReview}
        >
          <Field label="General Condition" value={n.generalCondition} />
          <Field label="Level of Consciousness" value={n.levelOfConsciousness} />
          <Field label="Orientation" value={n.orientation} />
          <Field label="Functional Status" value={n.functionalStatus} />
          <Field label="Changes Since Previous Review" value={n.changesSincePreviousReview} />
        </Section>

        <Section title="2. Vital Signs" isEmpty={!hasVitals}>
          {hasVitals && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {VITAL_KEYS.map(({ key, label, unit }) => {
                const v = normalized.vitals[key];
                if (!v?.current && !v?.previous) return null;
                return (
                  <div key={key} className="flex gap-2">
                    <span className="text-text-muted min-w-[160px] flex-shrink-0">{label}:</span>
                    <span className="text-on-surface">
                      {v.current || '—'}{v.current && unit ? ` ${unit}` : ''}
                      {v.previous ? <span className="text-text-muted text-xs ml-2">(prev: {v.previous})</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Field label="Other Observations" value={n.otherRelevantObservations} />
        </Section>

        <Section title="3. Symptom Assessment" isEmpty={!hasSymptoms}>
          {hasSymptoms && (
            <div className="space-y-1.5">
              {SYMPTOM_KEYS.map(({ frontend, label }) => {
                const row = normalized.symptoms[frontend];
                if (!row) return null;
                if (row.severity === 'None' && !row.notes) return null;
                return (
                  <div key={frontend} className="flex gap-2">
                    <span className="text-text-muted min-w-[160px] flex-shrink-0">{label}:</span>
                    <span className="text-on-surface">
                      {row.severity}{row.notes ? ` — ${row.notes}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Field label="Pain Score" value={n.painScore} />
          <Field label="Pain Location" value={n.painLocation} />
          <Field label="Pain Character" value={n.painCharacter} />
          <Field label="Current Management" value={n.currentPainManagement} />
          <Field label="Response to Treatment" value={n.responseToTreatment} />
        </Section>

        <Section title="16. Clinical Assessment" isEmpty={!n.overallAssessment && !(n.problemsIdentifiedToday?.length)}>
          <Field label="Overall Assessment" value={n.overallAssessment} />
          {n.problemsIdentifiedToday?.length > 0 && (
            <Field label="Problems Identified" value={n.problemsIdentifiedToday.join(', ')} />
          )}
        </Section>

        <Section title="20. Authorization / Signatures" isEmpty={!n.responsibleClinician && !(n.signatures?.length)}>
          {n.responsibleClinician && (
            <>
              <Field label="Responsible Clinician" value={n.responsibleClinician.name} />
              <Field label="Role" value={n.responsibleClinician.role} />
            </>
          )}
          {n.signatures?.length > 0 && (
            <div className="mt-3">
              <p className="text-text-muted text-xs mb-2">Signatures:</p>
              {n.signatures.map((sig: any, i: number) => (
                <div key={i} className="bg-surface-low p-2 rounded mb-2 text-xs">
                  <div><strong>{sig.name}</strong> ({sig.role})</div>
                  <div className="text-text-muted">{formatDate(sig.signedAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Delete this progress note?
            </h2>
            <p className="text-sm text-text-secondary mb-5">
              The note will be soft-deleted and can be restored later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-border-base bg-surface-lowest px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressNoteDetailPage;