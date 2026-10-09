import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DISCHARGE_SECTIONS,
  validateDischargeForm,
  useDischargeFormState,
  type DischargeSummary,
  type DischargeSectionKey,
  type DischargePatientInfo,
} from '@/hooks/useDischargeFormState';
import { DischargeSectionNav } from './DischargeSectionNav';
import { DischargeSectionBody } from './DischargeSectionBody';
import { DischargeReviewDialog } from './DischargeReviewDialog';

export type { DischargeSummary } from '@/hooks/useDischargeFormState';

export interface DischargePatientModalProps {
  patient: DischargePatientInfo;
  onDischarge: (summary: DischargeSummary) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const DischargePatientWizard: React.FC<DischargePatientModalProps> = ({
  patient,
  onDischarge,
  onClose,
  isSubmitting = false,
}) => {
  const {
    form,
    set,
    errors,
    isDirty,
    sectionStates,
    requiredMissing,
    progress,
    setErrors,
  } = useDischargeFormState(patient);

  const [activeKey, setActiveKey] = useState<DischargeSectionKey>('header');
  const [showReview, setShowReview] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  // Neutralize browser autofill on every field
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const neutralize = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return;
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.autofillNeutralized === '1') return;
      htmlEl.dataset.autofillNeutralized = '1';

      htmlEl.setAttribute('autocomplete', 'new-password');
      htmlEl.setAttribute('autocorrect', 'off');
      htmlEl.setAttribute('autocapitalize', 'off');
      htmlEl.setAttribute('spellcheck', 'false');
      htmlEl.setAttribute('data-form-type', 'other');
      htmlEl.setAttribute('data-lpignore', 'true');
      htmlEl.setAttribute('data-1p-ignore', 'true');
      htmlEl.setAttribute('data-bwignore', 'true');
      htmlEl.setAttribute('data-protonpass-ignore', 'true');
    };

    const scan = () => {
      root.querySelectorAll('input, textarea, select').forEach(neutralize);
    };

    scan();

    const observer = new MutationObserver(() => scan());
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['name', 'id', 'type'],
    });

    return () => observer.disconnect();
  }, []);

  const activeIdx = DISCHARGE_SECTIONS.findIndex((s) => s.key === activeKey);
  const activeDef = DISCHARGE_SECTIONS[activeIdx];
  const canGoPrev = activeIdx > 0;
  const canGoNext = activeIdx < DISCHARGE_SECTIONS.length - 1;

  const goNext = () => {
    if (canGoNext) setActiveKey(DISCHARGE_SECTIONS[activeIdx + 1].key);
  };
  const goPrev = () => {
    if (canGoPrev) setActiveKey(DISCHARGE_SECTIONS[activeIdx - 1].key);
  };

  const handleSubmitClick = () => {
    const errs = validateDischargeForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrKey = Object.keys(errs)[0] as keyof DischargeSummary;
      const sectionWithErr = DISCHARGE_SECTIONS.find((s) =>
        s.requiredFields.includes(firstErrKey),
      );
      if (sectionWithErr) setActiveKey(sectionWithErr.key);
      return;
    }
    setShowReview(true);
  };

  const handleConfirm = () => {
    onDischarge(form);
  };

  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  return (
    <div ref={rootRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-warning-bg flex items-center justify-center">
            <LogOut size={18} className="text-warning" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-on-surface leading-tight">
              Discharge Patient
            </h1>
            <p className="text-xs text-text-muted truncate">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {requiredMissing.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning-bg border border-warning/30 px-2.5 py-1 rounded-full">
              <AlertCircle size={11} />
              {requiredMissing.length} required field
              {requiredMissing.length === 1 ? '' : 's'} remaining
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
          >
            Discharge Patient
          </Button>
        </div>
      </div>

      {/* Sidebar + Body */}
      <div className="flex gap-0 border border-border-base rounded-2xl bg-surface-lowest overflow-hidden h-[600px]">
        <DischargeSectionNav
          sections={DISCHARGE_SECTIONS}
          activeKey={activeKey}
          states={sectionStates}
          onSelect={setActiveKey}
          progress={progress}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Mobile section picker */}
          <div className="lg:hidden px-4 pt-4 pb-2 border-b border-border-base bg-surface-low/30 flex-shrink-0">
            <label className="block text-xs font-medium text-text-muted mb-1">
              Section {activeIdx + 1} of {DISCHARGE_SECTIONS.length}
            </label>
            <select
              value={activeKey}
              onChange={(e) =>
                setActiveKey(e.target.value as DischargeSectionKey)
              }
              className="w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {DISCHARGE_SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.letter} — {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section header */}
          <div className="px-6 pt-5 pb-3 border-b border-border-base flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] bg-primary/10 text-primary rounded px-1.5 py-0.5 leading-none">
                {activeDef.letter}
              </span>
              <h2 className="text-base font-semibold text-on-surface">
                {activeDef.label}
              </h2>
            </div>
            <p className="text-xs text-text-muted">{activeDef.description}</p>
          </div>

          {/* Section body */}
          <div ref={bodyRef} className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
            <DischargeSectionBody
              sectionKey={activeKey}
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          {/* Prev / Next footer */}
          <div className="px-6 py-3 border-t border-border-base bg-surface-low/30 flex items-center justify-between flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={!canGoPrev || isSubmitting}
              onClick={goPrev}
            >
              Previous
            </Button>
            <span className="text-xs text-text-muted">
              {activeIdx + 1} / {DISCHARGE_SECTIONS.length}
            </span>
            {canGoNext ? (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={14} />}
                onClick={goNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
              >
                Discharge Patient
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Review dialog */}
      <DischargeReviewDialog
        open={showReview}
        form={form}
        patientName={`${patient.firstName} ${patient.lastName}`}
        isSubmitting={isSubmitting}
        onCancel={() => setShowReview(false)}
        onConfirm={handleConfirm}
        onEditSection={(key) => {
          setShowReview(false);
          setActiveKey(key);
        }}
      />

      {/* Discard dialog */}
      {showDiscard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-warning-bg flex items-center justify-center">
                <AlertTriangle size={18} className="text-warning" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-on-surface">
                  Discard changes?
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  You have unsaved changes in the discharge form. If you go back
                  now, all entered data will be lost.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDiscard(false)}
              >
                Keep Editing
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onClose}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargePatientWizard;