import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  useLabQueue,
  useCompletedLabRequests,
} from '@/hooks/useLabQueue';
import type { PendingLabRequest } from '@/api/lab-queue';

// ─────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────
const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'Emergency':
      return 'error' as const;
    case 'Urgent':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Ordered':
      return 'warning' as const;
    case 'Completed':
      return 'success' as const;
    case 'Cancelled':
      return 'error' as const;
    default:
      return 'default' as const;
  }
};

// ─────────────────────────────────────────────────────────────
// Row-click guard — never navigate with a missing id
// ─────────────────────────────────────────────────────────────
const isValidId = (id: unknown): boolean =>
  id !== undefined &&
  id !== null &&
  String(id).length > 0 &&
  String(id) !== 'undefined' &&
  String(id) !== 'null';

// ─────────────────────────────────────────────────────────────
// Shared table — used by both sections
// ─────────────────────────────────────────────────────────────
interface LabTableProps {
  requests: PendingLabRequest[];
  dateColumnLabel: string;
  onRowClick: (request: PendingLabRequest) => void;
}

const LabRequestsTable: React.FC<LabTableProps> = ({
  requests,
  dateColumnLabel,
  onRowClick,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b border-border-base bg-surface-low">
        <tr>
          {[
            'ID',
            'Patient',
            'Test',
            'Category',
            'Requesting Clinician',
            dateColumnLabel,
            'Priority',
            'Status',
          ].map((h) => (
            <th
              key={h}
              className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-base">
        {requests.map((request) => {
          const hasValidId = isValidId(request.id);
          return (
            <tr
              key={String(request.id ?? Math.random())}
              onClick={() => hasValidId && onRowClick(request)}
              className={
                hasValidId
                  ? 'hover:bg-surface-low cursor-pointer transition-colors'
                  : 'opacity-60 cursor-not-allowed'
              }
              title={hasValidId ? 'Open request' : 'Missing request id'}
            >
              <td className="px-5 py-3.5 text-sm font-mono text-text-muted whitespace-nowrap">
                #{request.id ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm font-medium text-on-surface whitespace-nowrap">
                {request.patientName ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {request.testName ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {request.category ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {request.requestingClinician ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {formatDate(
                  request.dateCompleted ?? request.dateRequested,
                )}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={getPriorityVariant(request.priority)}>
                  {request.priority ?? '—'}
                </Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={getStatusVariant(request.status)}>
                  {request.status ?? '—'}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const LabRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
    error: pendingErr,
    refetch: refetchPending,
    isFetching: pendingFetching,
  } = useLabQueue();

  const {
    data: completedData,
    isLoading: completedLoading,
    isError: completedError,
    error: completedErr,
    refetch: refetchCompleted,
  } = useCompletedLabRequests();

  const openRequest = (request: PendingLabRequest) =>
    navigate(ROUTES.LAB_REQUEST_DETAIL(String(request.id)));

  // ── Primary loading / error gate (pending is the main content) ──
  if (pendingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (pendingError) {
    return (
      <ErrorState
        message={
          pendingErr instanceof Error
            ? pendingErr.message
            : 'An unexpected error occurred'
        }
        onRetry={refetchPending}
      />
    );
  }

  const pending = pendingData?.items ?? [];
  const completed = completedData?.items ?? [];

  return (
    <div className="space-y-10">
      {/* ═══════════════════════════════════════════════════
          Pending requests
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Lab Requests
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {pending.length} pending{' '}
              {pending.length === 1 ? 'request' : 'requests'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={
              <RefreshCw
                size={14}
                className={pendingFetching ? 'animate-spin' : ''}
              />
            }
            onClick={() => refetchPending()}
            disabled={pendingFetching}
          >
            Refresh
          </Button>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={<FlaskConical size={48} />}
            title="No pending requests"
            description="There are no lab requests waiting to be processed."
          />
        ) : (
          <Card padding="none">
            <LabRequestsTable
              requests={pending}
              dateColumnLabel="Ordered"
              onRowClick={openRequest}
            />
          </Card>
        )}

        {pending.length > 0 && (
          <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-light border border-primary/20">
            <AlertCircle
              size={16}
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-on-surface">
              Click on any request to view details and enter results.
            </p>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          Completed requests
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success" />
          <h2 className="text-lg font-semibold text-on-surface">
            Completed Requests
          </h2>
          {completed.length > 0 && (
            <Badge variant="success">{completed.length}</Badge>
          )}
        </div>

        {completedLoading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          </Card>
        ) : completedError ? (
          <Card padding="lg">
            <ErrorState
              message={
                completedErr instanceof Error
                  ? completedErr.message
                  : 'Failed to load completed requests'
              }
              onRetry={refetchCompleted}
            />
          </Card>
        ) : completed.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-text-muted text-center py-4">
              No completed requests yet.
            </p>
          </Card>
        ) : (
          <Card padding="none">
            <LabRequestsTable
              requests={completed}
              dateColumnLabel="Completed"
              onRowClick={openRequest}
            />
          </Card>
        )}
      </section>
    </div>
  );
};

export default LabRequestsPage;