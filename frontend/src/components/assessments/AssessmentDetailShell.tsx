import React from 'react';
import { Edit3, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

interface AssessmentDetailShellProps {
  title: string;
  patientLabel: string;
  assessmentDate?: string | null;
  createdAt: string;
  createdByName?: string | null;
  isDeleted?: boolean;
  isAdmin?: boolean;
  backTo: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  children: React.ReactNode;
}

/**
 * AssessmentDetailShell
 * ─────────────────────
 * Uniform wrapper for every "/patients/:id/<assessment>/:id" detail page.
 */
export const AssessmentDetailShell: React.FC<AssessmentDetailShellProps> = ({
  title,
  patientLabel,
  assessmentDate,
  createdAt,
  createdByName,
  isDeleted,
  isAdmin: _isAdmin,
  backTo,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onPrint,
  children,
}) => {
  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={onRetry} />;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton to={backTo} label="Back" />
          <div>
            <h1 className="text-xl font-bold text-on-surface leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-sm text-text-muted">{patientLabel}</p>
              <span className="text-text-muted">·</span>
              <p className="text-xs text-text-muted">
                {assessmentDate ? formatDate(assessmentDate) : formatDate(createdAt)}
              </p>
              {createdByName && (
                <>
                  <span className="text-text-muted">·</span>
                  <p className="text-xs text-text-muted">
                    by {createdByName}
                  </p>
                </>
              )}
              {isDeleted && (
                <Badge variant="error" className="ml-1">
                  Deleted
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onPrint && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={onPrint}
            >
              Print
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Detail body */}
      <div className="space-y-5">{children}</div>
    </div>
  );
};

export default AssessmentDetailShell;