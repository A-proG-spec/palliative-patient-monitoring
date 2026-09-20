import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  useLabRequestDetail,
  useEnterLabResult,
} from '@/hooks/useLabQueue';

const LabRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lab, isLoading, error, refetch } = useLabRequestDetail(id);
  const enterResultMutation = useEnterLabResult();

  const [result, setResult] = useState('');
  const [performedBy, setPerformedBy] = useState('');

  if (isLoading) return <PageLoader />;
  if (error || !lab) return <ErrorState onRetry={refetch} />;

  const handleSubmit = () => {
    if (!id || !result.trim()) return;
    enterResultMutation.mutate(
      {
        id,
        data: {
          result: result.trim(),
          performedBy: performedBy.trim() || undefined,
        },
      },
      {
        onSuccess: () => navigate(ROUTES.LAB_REQUESTS),
      },
    );
  };

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
            ['Patient', lab.patientName],
            ['Patient ID', lab.patientDisplayId ?? '—'],
            ['Age / Sex', lab.age ? `${lab.age} · ${lab.sex ?? '—'}` : '—'],
            ['Test Name', lab.testName],
            ['Category', lab.category],
            ['Specimen Type', lab.specimenType ?? '—'],
            ['Specimen Site', lab.specimenSite ?? '—'],
            ['Requesting Clinician', lab.requestingClinician],
            ['Date Ordered', formatDate(lab.dateRequested)],
            ['Priority', lab.priority],
            ['Clinical History', lab.clinicalHistory ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[160px] flex-shrink-0">
                {label}:
              </span>
              <span className="text-on-surface font-medium">
                {String(value ?? '—')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {lab.status !== 'Completed' && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-3">
            Enter Result
          </p>
          <div className="space-y-4">
            <Textarea
              label="Result / Findings *"
              rows={5}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Enter lab result…"
            />
            <Input
              label="Performed By (optional)"
              placeholder="Technologist name"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                leftIcon={<CheckCircle2 size={15} />}
                disabled={!result.trim()}
                loading={enterResultMutation.isPending}
                onClick={handleSubmit}
              >
                Submit Result
              </Button>
              <Button
                variant="outline"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() => navigate(ROUTES.LAB_REQUESTS)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {lab.status === 'Completed' && lab.result && (
        <Card padding="lg" className="border-l-4 border-l-success">
          <p className="text-sm font-semibold text-on-surface mb-2">Result</p>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {lab.result}
          </p>
          {lab.datePerformed && (
            <p className="text-xs text-text-muted mt-3">
              Performed {formatDate(lab.datePerformed)}
              {lab.performedBy ? ` by ${lab.performedBy}` : ''}
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default LabRequestDetailPage;