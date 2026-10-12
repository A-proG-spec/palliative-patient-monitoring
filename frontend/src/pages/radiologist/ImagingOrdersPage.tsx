import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  useImagingQueue,
  useCompletedImagingOrders,
} from '@/hooks/useImagingQueue';
import type { PendingImagingOrder } from '@/api/imaging-queue';

// ─────────────────────────────────────────────────────────────
// Badge helper
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

// ─────────────────────────────────────────────────────────────
// Row-click guard
// ─────────────────────────────────────────────────────────────
const isValidId = (id: unknown): boolean =>
  id !== undefined &&
  id !== null &&
  String(id).length > 0 &&
  String(id) !== 'undefined' &&
  String(id) !== 'null';

// ─────────────────────────────────────────────────────────────
// Shared table
// ─────────────────────────────────────────────────────────────
interface ImagingTableProps {
  orders: PendingImagingOrder[];
  dateColumnLabel: string;
  onRowClick: (order: PendingImagingOrder) => void;
}

const ImagingOrdersTable: React.FC<ImagingTableProps> = ({
  orders,
  dateColumnLabel,
  onRowClick,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b border-border-base bg-surface-low">
        <tr>
          {[
            'Patient',
            'Modality',
            'Body Region',
            'Ordered By',
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
        {orders.map((order) => {
          const hasValidId = isValidId(order.id);
          return (
            <tr
              key={String(order.id ?? Math.random())}
              onClick={() => hasValidId && onRowClick(order)}
              className={
                hasValidId
                  ? 'hover:bg-surface-low cursor-pointer transition-colors'
                  : 'opacity-60 cursor-not-allowed'
              }
              title={hasValidId ? 'Open order' : 'Missing order id'}
            >
              <td className="px-5 py-3.5 text-sm font-medium text-on-surface whitespace-nowrap">
                {order.patientName ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {order.modality ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {order.bodyRegion ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {order.requestingClinician ?? '—'}
              </td>
              <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                {formatDate(order.dateCompleted ?? order.dateOrdered)}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={getPriorityVariant(order.priority)}>
                  {order.priority ?? '—'}
                </Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge
                  variant={order.status === 'Ordered' ? 'warning' : 'success'}
                >
                  {order.status ?? '—'}
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
const ImagingOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
    error: pendingErr,
    refetch: refetchPending,
    isFetching: pendingFetching,
  } = useImagingQueue();

  const {
    data: completedData,
    isLoading: completedLoading,
    isError: completedError,
    error: completedErr,
    refetch: refetchCompleted,
  } = useCompletedImagingOrders();

  const openOrder = (order: PendingImagingOrder) =>
    navigate(ROUTES.IMAGING_ORDER_DETAIL(String(order.id)));

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
          Pending orders
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Imaging Orders
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {pending.length} pending{' '}
              {pending.length === 1 ? 'order' : 'orders'}
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
            icon={<Scan size={48} />}
            title="No pending orders"
            description="There are no imaging orders waiting to be processed."
          />
        ) : (
          <Card padding="none">
            <ImagingOrdersTable
              orders={pending}
              dateColumnLabel="Ordered"
              onRowClick={openOrder}
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
              Click on any order to view details and enter the imaging report.
            </p>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          Completed orders
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success" />
          <h2 className="text-lg font-semibold text-on-surface">
            Completed Orders
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
                  : 'Failed to load completed orders'
              }
              onRetry={refetchCompleted}
            />
          </Card>
        ) : completed.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-text-muted text-center py-4">
              No completed orders yet.
            </p>
          </Card>
        ) : (
          <Card padding="none">
            <ImagingOrdersTable
              orders={completed}
              dateColumnLabel="Completed"
              onRowClick={openOrder}
            />
          </Card>
        )}
      </section>
    </div>
  );
};

export default ImagingOrdersPage;