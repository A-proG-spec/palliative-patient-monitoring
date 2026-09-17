import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scan, CheckCircle2 } from 'lucide-react';
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
 * ImagingOrderDetailPage
 * Accessed via /imaging-orders/:id
 * Allows radiologists to review imaging orders and submit reports.
 */
const ImagingOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [report, setReport] = useState('');

  const { data: img, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.IMAGING_ORDERS, id],
    queryFn: async () => {
      const res = await api.get(`/imaging/queue/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const submitReportMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/imaging/queue/${id}/report`, { reportText: report });
    },
    onSuccess: () => {
      toast.success('Imaging report submitted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.IMAGING_ORDERS });
      navigate(ROUTES.IMAGING_ORDERS);
    },
    onError: () => {
      toast.error('Failed to submit imaging report');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !img) return <ErrorState onRetry={refetch} />;

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={ROUTES.IMAGING_ORDERS} label="Imaging Orders" />
        <h1 className="text-xl font-bold text-on-surface">Imaging Order</h1>
        {img.status && <StatusBadge status={img.status} />}
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-bg text-warning mb-4">
            <Scan size={20} />
          </div>
          {[
            ['Patient', img.patientName ?? '—'],
            ['Imaging Type', img.imagingType ?? img.type ?? '—'],
            ['Body Part', img.bodyPart ?? '—'],
            ['Ordered By', img.orderedBy?.name ?? img.orderedByName ?? '—'],
            ['Date Ordered', formatDate(img.dateOrdered ?? img.createdAt)],
            ['Indication', img.indication ?? img.clinicalIndication ?? '—'],
            ['Notes', img.notes ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[140px] flex-shrink-0">{label}:</span>
              <span className="text-on-surface font-medium">{String(value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {img.status !== 'Completed' && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-3">Enter Imaging Report</p>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Enter imaging report / findings…"
            className="w-full rounded-xl border border-border-base bg-surface-low px-4 py-3 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-y"
          />
          <div className="flex gap-3 mt-4">
            <Button
              leftIcon={<CheckCircle2 size={15} />}
              disabled={!report.trim()}
              loading={submitReportMutation.isPending}
              onClick={() => submitReportMutation.mutate()}
            >
              Submit Report
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.IMAGING_ORDERS)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {img.status === 'Completed' && (img.report || img.reportText) && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-2">Report</p>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {img.report?.reportText ?? img.reportText ?? '—'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default ImagingOrderDetailPage;
