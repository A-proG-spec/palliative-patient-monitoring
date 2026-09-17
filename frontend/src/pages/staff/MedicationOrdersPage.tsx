import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pill, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { QUERY_KEYS, ROUTES } from '@/constants';
import api from '@/api/client';

interface MedicationOrder {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dose: string;
  frequency: string;
  prescribingClinician: string;
  dateOrdered: string;
  status: 'Pending' | 'Given';
}

// TODO: Backend endpoint GET /api/medications/pending-orders
// Expected response: { medications: MedicationOrder[] }
const fetchMedicationOrders = async (): Promise<MedicationOrder[]> => {
  const response = await api.get('/medications/pending-orders');
  return response.data.medications ?? [];
};

const MedicationOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.MEDICATION_ORDERS,
    queryFn: fetchMedicationOrders,
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
        icon={<Pill size={48} />}
        title="No pending orders"
        description="There are no medication orders waiting to be processed."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Medication Orders</h1>
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
                  Medication
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Dose
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Prescriber
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Date Ordered
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
                  onClick={() => navigate(ROUTES.MEDICATION_ORDER_DETAIL(order.id))}
                  className="hover:bg-surface-low cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                    {order.patientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.medicationName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.dose}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.frequency}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {order.prescribingClinician}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {formatDate(order.dateOrdered)}
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
            Click on any order to view details and mark it as given.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationOrdersPage;
