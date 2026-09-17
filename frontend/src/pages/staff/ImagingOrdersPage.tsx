import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Scan, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { api } from '@/api/client';

interface ImagingOrder {
  id: string;
  patientId: string;
  patientName: string;
  modalityRequested: string;
  requestingClinician: string;
  dateRequested: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Pending' | 'Completed';
}

// TODO: Backend endpoint GET /api/imaging/pending-orders
// Expected response: { imagingOrders: ImagingOrder[] }
const fetchImagingOrders = async (): Promise<ImagingOrder[]> => {
  const response = await api.get('/imaging/pending-orders');
  return response.data.imagingOrders ?? [];
};

const ImagingOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.IMAGING_ORDERS,
    queryFn: fetchImagingOrders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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
        message={error instanceof Error ? error.message : 'An unexpected error occurred'}
        onRetry={refetch}
      />
    );
  }

  const pendingOrders = orders ?? [];

  if (pendingOrders.length === 0) {
    return (
      <EmptyState
        icon={<Scan size={48} />}
        title="No pending orders"
        description="There are no imaging orders waiting to be processed."
      />
    );
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'STAT':
        return 'error';
      case 'Urgent':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Imaging Orders</h1>
          <p className="text-sm text-text-muted mt-1">
            {pendingOrders.length} pending {pendingOrders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-base bg-surface-low">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Modality
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Requesting Clinician
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Date Requested
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {pendingOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(ROUTES.IMAGING_ORDER_DETAIL(order.id))}
                  className="hover:bg-surface-low cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                    {order.patientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.modalityRequested}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.requestingClinician}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {formatDate(order.dateRequested)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getPriorityVariant(order.priority)}>
                      {order.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={order.status === 'Pending' ? 'warning' : 'success'}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pendingOrders.length > 0 && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-light border border-primary/20">
          <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface">
            Click on any order to view details and enter imaging report.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagingOrdersPage;
