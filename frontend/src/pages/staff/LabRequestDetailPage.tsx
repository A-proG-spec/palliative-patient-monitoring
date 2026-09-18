import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { useToast } from '@/context/ToastContext';
import api from '@/api/client';

/**
 * LabRequestDetailPage
 * Accessed via /lab-requests/:id
 * Allows lab technicians to review a lab request and enter results.
 */
const LabRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [result, setResult] = useState('');

  const { data: lab, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.LAB_REQUESTS, id],
    queryFn: async () => {
      const res = await api.get(`/labs/queue/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const enterResultMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/labs/queue/${id}/result`, { result });
    },
    onSuccess: () => {
      toast.success('Lab result entered successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_REQUESTS });
      navigate(ROUTES.LAB_REQUESTS);
    },
    onError: () => {
      toast.error('Failed to save lab result');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !lab) return <ErrorState onRetry={refetch} />;

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={ROUTES.LAB_REQUESTS} label="Lab Requests" />
        <h1 className="text-xl font-bold text-on-surface">Lab Request</h1>
        {lab.status && <StatusBadge status={lab.status} type="lab" />}
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-bg text-success mb-4">
            <FlaskConical size={20} />
          </div>
          {[
            ['Patient', lab.patientName ?? '—'],
            ['Test Name', lab.testName ?? '—'],
            ['Ordered By', lab.orderedBy?.name ?? lab.orderedByName ?? '—'],
            ['Date Ordered', formatDate(lab.dateOrdered ?? lab.createdAt)],
            ['Location', lab.location ?? '—'],
            ['Notes', lab.notes ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[140px] flex-shrink-0">{label}:</span>
              <span className="text-on-surface font-medium">{String(value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {lab.status !== 'Completed' && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-3">Enter Result</p>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Enter lab result…"
            className="w-full rounded-xl border border-border-base bg-surface-low px-4 py-3 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y"
          />
          <div className="flex gap-3 mt-4">
            <Button
              leftIcon={<CheckCircle2 size={15} />}
              disabled={!result.trim()}
              loading={enterResultMutation.isPending}
              onClick={() => enterResultMutation.mutate()}
            >
              Submit Result
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.LAB_REQUESTS)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {lab.status === 'Completed' && lab.result && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-2">Result</p>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{lab.result}</p>
        </Card>
      )}
    </div>
  );
};

export default LabRequestDetailPage;
