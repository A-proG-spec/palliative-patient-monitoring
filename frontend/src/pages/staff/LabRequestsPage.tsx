import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { api } from '@/api/client';

interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  requestingClinician: string;
  dateRequested: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Pending' | 'Completed';
}

// TODO: Backend endpoint GET /api/labs/pending-requests
// Expected response: { labs: LabRequest[] }
const fetchLabRequests = async (): Promise<LabRequest[]> => {
  const response = await api.get('/labs/pending-requests');
  return response.data.labs ?? [];
};

const LabRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: requests,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.LAB_REQUESTS,
    queryFn: fetchLabRequests,
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

  const pendingRequests = requests ?? [];

  if (pendingRequests.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical size={48} />}
        title="No pending requests"
        description="There are no lab requests waiting to be processed."
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
          <h1 className="text-2xl font-bold text-on-surface">Lab Requests</h1>
          <p className="text-sm text-text-muted mt-1">
            {pendingRequests.length} pending {pendingRequests.length === 1 ? 'request' : 'requests'}
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
                  Test
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
              {pendingRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => navigate(ROUTES.LAB_REQUEST_DETAIL(request.id))}
                  className="hover:bg-surface-low cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                    {request.patientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {request.testName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {request.requestingClinician}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {formatDate(request.dateRequested)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getPriorityVariant(request.priority)}>
                      {request.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={request.status === 'Pending' ? 'warning' : 'success'}>
                      {request.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pendingRequests.length > 0 && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-light border border-primary/20">
          <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface">
            Click on any request to view details and enter results.
          </p>
        </div>
      )}
    </div>
  );
};

export default LabRequestsPage;
