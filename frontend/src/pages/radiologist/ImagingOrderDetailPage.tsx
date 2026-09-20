import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scan, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  useImagingOrderDetail,
  useSubmitImagingReport,
} from '@/hooks/useImagingQueue';

const ImagingOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: img, isLoading, error, refetch } = useImagingOrderDetail(id);
  const submitMutation = useSubmitImagingReport();

  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendation, setRecommendation] = useState('');

  if (isLoading) return <PageLoader />;
  if (error || !img) return <ErrorState onRetry={refetch} />;

  const canSubmit = findings.trim().length > 0 && impression.trim().length > 0;

  const handleSubmit = () => {
    if (!id || !canSubmit) return;
    submitMutation.mutate(
      {
        id,
        data: {
          findings: findings.trim(),
          impression: impression.trim(),
          recommendation: recommendation.trim() || undefined,
        },
      },
      {
        onSuccess: () => navigate(ROUTES.IMAGING_ORDERS),
      },
    );
  };

  const hasReport =
    img.status === 'Completed' && (img.findings || img.impression);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={ROUTES.IMAGING_ORDERS} label="Imaging Orders" />
        <h1 className="text-xl font-bold text-on-surface">Imaging Order</h1>
        {img.status && <StatusBadge status={img.status} type="lab" />}
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-bg text-warning mb-4">
            <Scan size={20} />
          </div>

          {[
            ['Patient', img.patientName],
            ['Patient ID', img.patientDisplayId ?? '—'],
            ['Age / Sex', img.age ? `${img.age} · ${img.sex ?? '—'}` : '—'],
            ['Modality', img.modality],
            ['Body Region', img.bodyRegion],
            ['Specific Site', img.specificSite ?? '—'],
            ['Laterality', img.laterality ?? '—'],
            ['Ordered By', img.requestingClinician],
            ['Date Ordered', formatDate(img.dateOrdered)],
            ['Priority', img.priority],
            ['Provisional Diagnosis', img.provisionalDiagnosis ?? '—'],
            ['Presenting Symptoms', img.presentingSymptoms ?? '—'],
            ['Clinical Question', img.specialClinicalQuestion ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[170px] flex-shrink-0">
                {label}:
              </span>
              <span className="text-on-surface font-medium">
                {String(value ?? '—')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {!hasReport ? (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-3">
            Enter Imaging Report
          </p>
          <div className="space-y-4">
            <Textarea
              label="Findings *"
              rows={5}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describe the imaging findings…"
            />
            <Textarea
              label="Impression / Conclusion *"
              rows={4}
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Clinical impression…"
            />
            <Textarea
              label="Recommendations (optional)"
              rows={3}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Follow-up recommendations…"
            />
            <div className="flex gap-3">
              <Button
                leftIcon={<CheckCircle2 size={15} />}
                disabled={!canSubmit}
                loading={submitMutation.isPending}
                onClick={handleSubmit}
              >
                Submit Report
              </Button>
              <Button
                variant="outline"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() => navigate(ROUTES.IMAGING_ORDERS)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="lg" className="border-l-4 border-l-success">
          <p className="text-sm font-semibold text-on-surface mb-3">Report</p>
          <div className="space-y-4 text-sm">
            {img.findings && (
              <div>
                <p className="text-xs text-text-muted mb-1.5 uppercase tracking-wide font-semibold">
                  Findings
                </p>
                <div className="bg-surface-low rounded-lg px-4 py-3 text-on-surface whitespace-pre-wrap">
                  {img.findings}
                </div>
              </div>
            )}
            {img.impression && (
              <div>
                <p className="text-xs text-text-muted mb-1.5 uppercase tracking-wide font-semibold">
                  Impression
                </p>
                <div className="bg-primary/[0.04] border border-primary/20 rounded-lg px-4 py-3 text-on-surface whitespace-pre-wrap">
                  {img.impression}
                </div>
              </div>
            )}
            {img.recommendation && (
              <div>
                <p className="text-xs text-text-muted mb-1.5 uppercase tracking-wide font-semibold">
                  Recommendations
                </p>
                <div className="bg-surface-low rounded-lg px-4 py-3 text-on-surface whitespace-pre-wrap">
                  {img.recommendation}
                </div>
              </div>
            )}
            {img.reportDate && (
              <p className="text-xs text-text-muted pt-2 border-t border-border-base">
                Reported {formatDateTime(img.reportDate)}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImagingOrderDetailPage;