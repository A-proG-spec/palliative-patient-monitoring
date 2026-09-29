import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useLabQueue } from '@/hooks/useLabQueue';

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

const LabRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, isFetching } = useLabQueue();

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'An unexpected error occurred'
        }
        onRetry={refetch}
      />
    );
  }

  const pendingRequests = data?.items ?? [];

  // ── Empty ──
  if (pendingRequests.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical size={48} />}
        title="No pending requests"
        description="There are no lab requests waiting to be processed."
      />
    );
  }

  // ── Row click handler with guard ──
  const handleRowClick = (request: { id?: number | string | null }) => {
    // Guard: never navigate with an undefined id
    if (
      request.id === undefined ||
      request.id === null ||
      String(request.id).length === 0 ||
      String(request.id) === 'undefined'
    ) {
      console.warn('[LabQueue] row is missing a valid id →', request);
      return;
    }
    navigate(ROUTES.LAB_REQUEST_DETAIL(String(request.id)));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Lab Requests</h1>
          <p className="text-sm text-text-muted mt-1">
            {pendingRequests.length} pending{' '}
            {pendingRequests.length === 1 ? 'request' : 'requests'}
          </p>
        </div>

        {/* Manual refresh (in addition to the 30s auto-refetch) */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {/* ── Table ── */}
      <Card padding="none">
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
                  'Ordered',
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
              {pendingRequests.map((request) => {
                const hasValidId =
                  request.id !== undefined &&
                  request.id !== null &&
                  String(request.id).length > 0 &&
                  String(request.id) !== 'undefined';

                return (
                  <tr
                    key={String(request.id ?? Math.random())}
                    onClick={() => handleRowClick(request)}
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
                      {request.dateRequested
                        ? formatDate(request.dateRequested)
                        : '—'}
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
      </Card>

      {/* ── Info banner ── */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-light border border-primary/20">
        <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-on-surface">
          Click on any request to view details and enter results.
        </p>
      </div>
    </div>
  );
};

export default LabRequestsPage;