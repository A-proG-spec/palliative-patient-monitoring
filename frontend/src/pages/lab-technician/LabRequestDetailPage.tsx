import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
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
import { useLabRequestDetail, useEnterLabResult } from '@/hooks/useLabQueue';
import { useAuthStore } from '@/store/auth.store';

// ═════════════════════════════════════════════════════════════
// OUTER — reads the URL param and hard-guards it.
// ═════════════════════════════════════════════════════════════

const LabRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id || id === 'undefined' || id === 'null' || id.trim().length === 0) {
    return (
      <div className="max-w-xl space-y-5">
        <BackButton to={ROUTES.LAB_REQUESTS} label="Lab Requests" />

        <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg/20 px-4 py-3.5">
          <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Missing lab request ID
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              The URL is missing a valid lab request identifier. This usually
              means a link was built incorrectly.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => navigate(ROUTES.LAB_REQUESTS)}
        >
          Back to Lab Requests
        </Button>
      </div>
    );
  }

  return <LabRequestDetailContent id={id} />;
};

// ═════════════════════════════════════════════════════════════
// INNER — receives a guaranteed non-empty `id`.
// ═════════════════════════════════════════════════════════════

const LabRequestDetailContent: React.FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: lab, isLoading, error, refetch } = useLabRequestDetail(id);
  const enterResultMutation = useEnterLabResult();

  const [result, setResult] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════
  // AUTO-FILL "Performed By" with the logged-in user's name
  //
  // Fires once on mount when the user is available. If the user
  // is not yet loaded (rare), it re-fires when they become
  // available. Does NOT overwrite the field after the user has
  // edited it — we only set it if it's still empty.
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!user?.name) return;
    setPerformedBy((current) => (current.trim().length === 0 ? user.name : current));
  }, [user?.name]);

  if (isLoading) return <PageLoader />;
  if (error || !lab) return <ErrorState onRetry={refetch} />;

  const isCompleted = lab.status === 'Completed';
  const isCancelled = lab.status === 'Cancelled';
  const canEnterResult = !isCompleted && !isCancelled;

  const handleSubmit = () => {
    setValidationError(null);

    if (!result.trim()) {
      setValidationError('Result text is required.');
      return;
    }

    if (!id || id === 'undefined') {
      setValidationError('Invalid lab request ID.');
      return;
    }

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
    <div className="max-w-2xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to={ROUTES.LAB_REQUESTS} label="Lab Requests" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">Lab Request</h1>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              #{lab.id}
            </p>
          </div>
        </div>
        {lab.status && <StatusBadge status={lab.status} type="lab" />}
      </div>

      {/* ── Cancelled banner ── */}
      {isCancelled && (
        <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg/20 px-4 py-3.5">
          <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              This lab request was cancelled
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              No result can be entered for a cancelled request.
            </p>
          </div>
        </div>
      )}

      {/* ── Request details ── */}
      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-bg text-success mb-4">
            <FlaskConical size={20} />
          </div>

          {[
            ['Patient', lab.patientName],
            ['Patient ID', lab.patientDisplayId ?? '—'],
            [
              'Age / Sex',
              lab.age ? `${lab.age} · ${lab.sex ?? '—'}` : '—',
            ],
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

      {/* ── Enter result form ── */}
      {canEnterResult && (
        <Card padding="lg">
          <p className="text-sm font-semibold text-on-surface mb-3">
            Enter Result
          </p>
          <div className="space-y-4">
            <Textarea
              label="Result / Findings *"
              rows={5}
              value={result}
              onChange={(e) => {
                setResult(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Enter lab result…"
              error={
                validationError && !result.trim() ? validationError : undefined
              }
            />

            <Input
              label="Performed By"
              placeholder="Technologist name"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              hint="Auto-filled from your account — edit if another technologist performed the test"
            />

            {validationError && result.trim() && (
              <div className="rounded-lg bg-error-bg border border-error/20 px-3 py-2 text-xs text-error flex items-start gap-2">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

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
                disabled={enterResultMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Existing result (read-only) ── */}
      {isCompleted && lab.result && (
        <Card padding="lg" className="border-l-4 border-l-success">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2
              size={18}
              className="text-success flex-shrink-0 mt-0.5"
            />
            <p className="text-sm font-semibold text-on-surface">
              Result Recorded
            </p>
          </div>
          <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
            {lab.result}
          </div>
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