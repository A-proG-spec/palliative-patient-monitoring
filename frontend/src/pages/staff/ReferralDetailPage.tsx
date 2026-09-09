import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReferralDetail } from '@/hooks/useReferrals';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { REFERRAL_REASON_LABELS } from '@/constants';

const ReferralDetailPage: React.FC = () => {
  const { id, referralId } = useParams<{ id: string; referralId: string }>();
  const navigate = useNavigate();
  const { data: ref, isLoading, error, refetch } = useReferralDetail(id!, referralId!);

  if (isLoading) return <PageLoader />;
  if (error || !ref) return <ErrorState onRetry={refetch} />;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Referral Detail</h1>
          <p className="text-sm text-text-secondary">{formatDate(ref.referralDate)}</p>
        </div>
        <StatusBadge status={ref.status} type="referral" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Referral Information</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Type" value={ref.referralType} />
            <Row label="Date" value={formatDate(ref.referralDate)} />
            <Row label="From" value={ref.referringFacility} />
            <Row label="To" value={ref.receivingFacility} />
            <Row label="Contact" value={`${ref.contactPerson} · ${ref.contactNumber}`} />
            {ref.actionTaken && <Row label="Action Taken" value={ref.actionTaken} />}
            {ref.outcome && <Row label="Outcome" value={ref.outcome} />}
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Clinical Information</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Diagnosis" value={ref.primaryDiagnosis} />
            <Row label="Stage" value={ref.diseaseStage} />
            <Row label="PPS" value={`${ref.ppsScore}%`} />
            <Row label="KPS" value={`${ref.kpsScore}`} />
            <Row label="Pain" value={`${ref.currentSymptoms.pain}/10`} />
            <Row label="Dyspnea" value={`${ref.currentSymptoms.dyspnea}/10`} />
            <Row label="Fatigue" value={`${ref.currentSymptoms.fatigue}/10`} />
          </CardContent>
        </Card>
      </div>

      <Card padding="md">
        <CardHeader><CardTitle className="text-sm">Reasons for Referral</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {ref.reasons.map((r) => <Badge key={r} variant="secondary">{REFERRAL_REASON_LABELS[r] || r}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {ref.followUpDate && (
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Follow-Up</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Follow-up Date" value={formatDate(ref.followUpDate)} />
            {ref.followUpStatus && <Row label="Status" value={ref.followUpStatus} />}
          </CardContent>
        </Card>
      )}

      <Card padding="md">
        <CardHeader><CardTitle className="text-sm">Staff Documentation</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <Row label="Prepared By" value={ref.preparedBy} />
          <Row label="Designation" value={ref.preparedByDesignation} />
          <Row label="Signature" value={ref.signature} />
        </CardContent>
      </Card>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-text-muted">{label}: </span><span className="text-on-surface">{value || '—'}</span></div>
);

export default ReferralDetailPage;
