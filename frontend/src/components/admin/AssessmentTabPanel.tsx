import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton';
import { AdminRestoreButton } from '@/components/admin/AdminRestoreButton';
import { cn, formatDate } from '@/lib/utils';

// ═════════════════════════════════════════════════════════════
// RowActions — flips between Delete and Restore buttons based
// on whether the row is soft-deleted.
// ═════════════════════════════════════════════════════════════

interface RowActionsProps {
  isDeleted: boolean;
  resourceLabel: string;
  resourceIdentifier: string;
  isDeleting: boolean;
  isRestoring: boolean;
  onDelete: (reason?: string) => void;
  onRestore: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({
  isDeleted,
  resourceLabel,
  resourceIdentifier,
  isDeleting,
  isRestoring,
  onDelete,
  onRestore,
}) =>
  isDeleted ? (
    <AdminRestoreButton
      resourceLabel={resourceLabel}
      onRestore={onRestore}
      isPending={isRestoring}
    />
  ) : (
    <AdminDeleteButton
      resourceLabel={resourceLabel}
      resourceIdentifier={resourceIdentifier}
      onConfirm={onDelete}
      isPending={isDeleting}
      compact
    />
  );

// ═════════════════════════════════════════════════════════════
// DeletedBadge — inline badge shown next to a date when the row
// has been soft-deleted.
// ═════════════════════════════════════════════════════════════

export const DeletedBadge: React.FC<{ isDeleted: boolean }> = ({
  isDeleted,
}) =>
  isDeleted ? (
    <Badge variant="error" className="ml-2 text-[10px]">
      Deleted
    </Badge>
  ) : null;

// ═════════════════════════════════════════════════════════════
// Column / row config
// ═════════════════════════════════════════════════════════════

export interface AssessmentColumn<T> {
  /** Column header. Pass `''` for the trailing actions column. */
  header: string;
  /** Render the cell content for a given row. */
  render: (row: T) => React.ReactNode;
  /** Optional width constraint / extra class. */
  className?: string;
}

// ═════════════════════════════════════════════════════════════
// Panel props
// ═════════════════════════════════════════════════════════════

export interface AssessmentTabPanelProps<T> {
  /** Full list of rows (already fetched by the parent). */
  items: T[];
  /** Column definitions. */
  columns: AssessmentColumn<T>[];
  /** Row → unique id (used for keys and mutation lookups). */
  getRowId: (row: T) => string | number;
  /** Row → display date (used in the delete dialog). */
  getRowDate: (row: T) => string;
  /** Row → `deletedAt` flag. Defaults to `(row as any).deletedAt`. */
  isRowDeleted?: (row: T) => boolean;
  /** Human-readable resource name, e.g. "Pain assessment". */
  resourceLabel: string;
  /** Base route for row click: `/admin/patients/:pid/<detailRoute>/:id`. */
  detailRoute: string;
  /** Patient id (for building detail links). */
  patientId: string;
  /** Whether the parent's "Show deleted" toggle is on. */
  showDeleted: boolean;
  /** Delete mutation — must accept `{ patientId, resourceId, reason }`. */
  deleteMutation: {
    isPending: boolean;
    variables?: { resourceId: string | number; reason?: string };
    mutate: (args: {
      patientId: string;
      resourceId: string | number;
      reason?: string;
    }) => void;
  };
  /** Restore mutation — must accept `{ patientId, resourceId }`. */
  restoreMutation: {
    isPending: boolean;
    variables?: { resourceId: string | number };
    mutate: (args: {
      patientId: string;
      resourceId: string | number;
    }) => void;
  };
}

// ═════════════════════════════════════════════════════════════
// The reusable panel
// ═════════════════════════════════════════════════════════════

export function AssessmentTabPanel<T>({
  items,
  columns,
  getRowId,
  getRowDate,
  isRowDeleted = (row) => !!(row as { deletedAt?: string | null }).deletedAt,
  resourceLabel,
  detailRoute,
  patientId,
  showDeleted,
  deleteMutation,
  restoreMutation,
}: AssessmentTabPanelProps<T>) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EmptyState
        title={
          showDeleted
            ? `No deleted ${resourceLabel.toLowerCase()}s`
            : `No ${resourceLabel.toLowerCase()}s recorded`
        }
        description={
          showDeleted
            ? `Deleted ${resourceLabel.toLowerCase()}s will appear here when present.`
            : `No ${resourceLabel.toLowerCase()}s have been recorded for this patient yet.`
        }
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-text-muted">
          {columns.map((col, i) => (
            <th
              key={`${col.header}-${i}`}
              className={cn('pb-3 pr-4 font-medium', col.className)}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-base">
        {items.map((row) => {
          const rowId = getRowId(row);
          const rowDate = getRowDate(row);
          const isDeleted = isRowDeleted(row);

          return (
            <tr
              key={rowId}
              className={cn(
                'hover:bg-surface-low',
                isDeleted && 'bg-error-bg/20 opacity-70',
              )}
            >
              {columns.map((col, i) => {
                const isActions = i === columns.length - 1;

                if (isActions) {
                  return (
                    <td key={`actions-${i}`} className="py-3 text-right">
                      <RowActions
                        isDeleted={isDeleted}
                        resourceLabel={resourceLabel}
                        resourceIdentifier={`${resourceLabel} from ${formatDate(rowDate)}`}
                        isDeleting={deleteMutation.isPending}
                        isRestoring={
                          restoreMutation.isPending &&
                          (restoreMutation.variables as { resourceId?: unknown })
                            ?.resourceId === rowId
                        }
                        onDelete={(reason) =>
                          deleteMutation.mutate({
                            patientId,
                            resourceId: rowId,
                            reason,
                          })
                        }
                        onRestore={() =>
                          restoreMutation.mutate({ patientId, resourceId: rowId })
                        }
                      />
                    </td>
                  );
                }

                return (
                  <td
                    key={`cell-${i}`}
                    className={cn('py-3 pr-4 cursor-pointer', col.className)}
                    onClick={() =>
                      navigate(
                        `/admin/patients/${patientId}/${detailRoute}/${rowId}`,
                      )
                    }
                  >
                    {col.render(row)}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ═════════════════════════════════════════════════════════════
// Column presets — reusable configs for common columns
// ═════════════════════════════════════════════════════════════

/**
 * Standard "Date" column — shows the row's `createdAt` with an
 * inline "Deleted" badge when the row has been soft-deleted.
 */
export const dateColumn = <T,>(): AssessmentColumn<T> => ({
  header: 'Date',
  render: (row: any) => (
    <>
      {formatDate(row.createdAt)}
      <DeletedBadge isDeleted={!!row.deletedAt} />
    </>
  ),
});

/**
 * Standard "Type" column — shows `row.assessmentType` or an em-dash.
 */
export const typeColumn = <T,>(): AssessmentColumn<T> => ({
  header: 'Type',
  className: 'text-text-secondary',
  render: (row: any) => row.assessmentType ?? '—',
});

// ═════════════════════════════════════════════════════════════
// Adapters — bridge existing per-assessment hooks
// (`useDeletePainAssessment`, etc.) to the
// `{ patientId, resourceId, reason }` shape that the panel expects.
//
// The existing hooks accept:
//   delete:  mutate({ assessmentId, reason })   or   mutate(id)
//   restore: mutate(assessmentId)               (bare string)
//
// The panel expects:
//   delete:  mutate({ patientId, resourceId, reason })
//   restore: mutate({ patientId, resourceId })
//
// These adapters translate between the two so the panel stays
// generic and the hooks stay untouched.
// ═════════════════════════════════════════════════════════════

/**
 * Shape that all `useDeleteXxxAssessment` hooks return.
 * Kept structurally loose on purpose so it accepts the
 * `UseMutationResult` from TanStack Query without forcing a
 * generic parameter on the caller.
 */
export interface RawDeleteMutation {
  isPending: boolean;
  variables?: { assessmentId: string | number; reason?: string } | string | number;
  mutate: (
    args: { assessmentId: string | number; reason?: string } | string | number,
    options?: any,
  ) => void;
}

/**
 * Shape that all `useRestoreXxxAssessment` hooks return.
 */
export interface RawRestoreMutation {
  isPending: boolean;
  variables?: string | number;
  mutate: (id: string | number, options?: any) => void;
}

/**
 * Adapts a raw delete mutation (from `useDeleteXxxAssessment`)
 * to the `{ patientId, resourceId, reason }` shape the panel uses.
 */
export const adaptDeleteMutation = (
  raw: RawDeleteMutation,
): AssessmentTabPanelProps<any>['deleteMutation'] => {
  // The raw mutation may have been called with either an object
  // (`{ assessmentId, reason }`) or a bare id. Normalize both.
  const rawVars = raw.variables;
  let normalizedVars:
    | { resourceId: string | number; reason?: string }
    | undefined;

  if (typeof rawVars === 'object' && rawVars !== null) {
    normalizedVars = {
      resourceId: rawVars.assessmentId,
      reason: rawVars.reason,
    };
  } else if (typeof rawVars === 'string' || typeof rawVars === 'number') {
    normalizedVars = { resourceId: rawVars };
  }

  return {
    isPending: raw.isPending,
    variables: normalizedVars,
    mutate: ({ resourceId, reason }) => {
      raw.mutate({ assessmentId: String(resourceId), reason });
    },
  };
};

/**
 * Adapts a raw restore mutation (from `useRestoreXxxAssessment`)
 * to the `{ patientId, resourceId }` shape the panel uses.
 */
export const adaptRestoreMutation = (
  raw: RawRestoreMutation,
): AssessmentTabPanelProps<any>['restoreMutation'] => ({
  isPending: raw.isPending,
  variables:
    raw.variables !== undefined && raw.variables !== null
      ? { resourceId: raw.variables }
      : undefined,
  mutate: ({ resourceId }) => {
    raw.mutate(String(resourceId));
  },
});

export default AssessmentTabPanel;