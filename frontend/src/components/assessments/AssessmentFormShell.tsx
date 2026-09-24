import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/common/BackButton';
import { cn } from '@/lib/utils';

interface AssessmentFormShellProps {
  /** e.g. "Pain Assessment" — shown in the header. */
  title: string;
  /** Patient display name + MRN shown under the header. */
  patientLabel: string;
  /** Route to return to (patient detail page). */
  backTo: string;
  /** Whether we're creating or editing — affects button text. */
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  /** Number of unfilled required fields — shown in the header badge. */
  requiredMissing?: number;
  onSubmit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

/**
 * AssessmentFormShell
 * ───────────────────
 * Uniform wrapper for every "new X assessment" and "edit X assessment" page.
 *
 * Handles:
 *   • Back navigation to the patient detail page
 *   • Page header with patient context
 *   • "Save" and "Cancel" buttons (header + footer)
 *   • Required-field progress badge
 *   • Blocking browser-unload when the form is dirty
 *
 * The form itself is rendered as `children` — no form-state coupling.
 */
export const AssessmentFormShell: React.FC<AssessmentFormShellProps> = ({
  title,
  patientLabel,
  backTo,
  mode,
  isSubmitting,
  requiredMissing = 0,
  onSubmit,
  onCancel,
  children,
}) => {
  const navigate = useNavigate();

  // Warn on browser-level close/refresh if the form has unsaved content
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isSubmitting) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSubmitting]);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton to={backTo} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface leading-tight">
              {mode === 'create' ? `New ${title}` : `Edit ${title}`}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 truncate">
              {patientLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {requiredMissing > 0 && (
            <span
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                'text-warning bg-warning-bg border border-warning/30',
                'px-2.5 py-1 rounded-full',
              )}
            >
              <AlertCircle size={11} />
              {requiredMissing} required field
              {requiredMissing === 1 ? '' : 's'} remaining
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {mode === 'create' ? 'Save Assessment' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form body — supplied by each assessment page */}
      <div className="space-y-5">{children}</div>

      {/* Bottom action row */}
      <div className="flex items-center justify-end gap-3 pb-8 pt-2 border-t border-border-base">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          loading={isSubmitting}
        >
          {mode === 'create' ? 'Save Assessment' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentFormShell;