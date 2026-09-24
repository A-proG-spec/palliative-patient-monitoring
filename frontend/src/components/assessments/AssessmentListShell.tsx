import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';

interface AssessmentListShellProps {
  /** Page title — e.g. "Pain Assessments". */
  title: string;
  /** Subtitle line — e.g. "3 recorded". */
  subtitle: string;
  /** Patient display name + MRN shown in the header. */
  patientLabel: string;
  /** Route to return to — typically `/patients/:id`. */
  backTo: string;
  /** Callback fired when the "Add New" button is clicked. */
  onAddClick: () => void;
  /** Optional override for the Add button label. */
  addLabel?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** If true, renders the empty state instead of `children`. */
  isEmpty: boolean;
  /** Optional message shown inside the empty state. */
  emptyMessage?: string;
  /** The list content — rendered when not loading, not error, not empty. */
  children: React.ReactNode;
  /** When false, hides Add New in the header and empty state. Defaults to true. */
  canCreate?: boolean;
}

/**
 * AssessmentListShell
 * ───────────────────
 * Uniform wrapper for every "/patients/:id/<assessment>" list page.
 *
 * Handles:
 *   • Header with patient context + "Add New" button
 *   • Loading / error / empty states
 *   • Wraps the actual list in a bordered, divided card
 *
 * The Add button uses the `onAddClick` callback so pages stay
 * React-Router-clean (no window.location hacks).
 */
export const AssessmentListShell: React.FC<AssessmentListShellProps> = ({
  title,
  subtitle,
  patientLabel,
  backTo,
  onAddClick,
  addLabel = 'Add New',
  isLoading,
  isError,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
  canCreate = true,
}) => {
  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton to={backTo} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface leading-tight">
              {title}
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              {patientLabel} · {subtitle}
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onAddClick}
          >
            {addLabel}
          </Button>
        )}
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState onRetry={onRetry} />
      ) : isEmpty ? (
        <EmptyState
          icon={<FileText size={28} />}
          title={`No ${title.toLowerCase()} recorded`}
          description={
            emptyMessage ?? 'Record the first one for this patient.'
          }
          {...(canCreate
            ? { actionLabel: 'Add New', onAction: onAddClick }
            : {})}
        />
      ) : (
        <div className="bg-surface-lowest border border-border-base rounded-2xl divide-y divide-border-base overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

export default AssessmentListShell;