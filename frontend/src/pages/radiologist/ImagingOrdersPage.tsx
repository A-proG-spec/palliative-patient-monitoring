import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useImagingQueue } from '@/hooks/useImagingQueue';

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

const ImagingOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useImagingQueue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  const pendingOrders = data?.items ?? [];

  if (pendingOrders.length === 0) {
    return (
      <EmptyState
        icon={<Scan size={48} />}
        title="No pending orders"
        description="There are no imaging orders waiting to be processed."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Imaging Orders</h1>
        <p className="text-sm text-text-muted mt-1">
          {pendingOrders.length} pending{' '}
          {pendingOrders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-base bg-surface-low">
              <tr>
                {[
                  'Patient',
                  'Modality',
                  'Body Region',
                  'Ordered By',
                  'Date',
                  'Priority',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {pendingOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() =>
                    navigate(ROUTES.IMAGING_ORDER_DETAIL(String(order.id)))
                  }
                  className="hover:bg-surface-low cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                    {order.patientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.modality}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.bodyRegion}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.requestingClinician}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {formatDate(order.dateOrdered)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getPriorityVariant(order.priority)}>
                      {order.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={order.status === 'Ordered' ? 'warning' : 'success'}
                    >
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-light border border-primary/20">
        <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-on-surface">
          Click on any order to view details and enter the imaging report.
        </p>
      </div>
    </div>
  );
};

export default ImagingOrdersPage;