import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

const LabRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useLabQueue();

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

  const pendingRequests = data?.items ?? [];

  if (pendingRequests.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical size={48} />}
        title="No pending requests"
        description="There are no lab requests waiting to be processed."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Lab Requests</h1>
        <p className="text-sm text-text-muted mt-1">
          {pendingRequests.length} pending{' '}
          {pendingRequests.length === 1 ? 'request' : 'requests'}
        </p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-base bg-surface-low">
              <tr>
                {[
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
                    className="px-5 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {pendingRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() =>
                    navigate(ROUTES.LAB_REQUEST_DETAIL(String(request.id)))
                  }
                  className="hover:bg-surface-low cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                    {request.patientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {request.testName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {request.category}
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
                    <Badge
                      variant={request.status === 'Ordered' ? 'warning' : 'success'}
                    >
                      {request.status}
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
          Click on any request to view details and enter results.
        </p>
      </div>
    </div>
  );
};

export default LabRequestsPage;