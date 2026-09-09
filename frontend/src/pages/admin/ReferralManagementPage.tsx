import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { usePendingReferrals, useApproveReferral, useDeclineReferral } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { REFERRAL_REASON_LABELS } from '@/constants';

const ReferralManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: referrals, isLoading, error, refetch } = usePendingReferrals();
  const approveMutation = useApproveReferral();
  const declineMutation = useDeclineReferral();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/admin" label="Dashboard" />
          <h1 className="text-2xl font-bold text-on-surface">Referral Management</h1>
          <p className="text-sm text-text-secondary">Review and act on pending referral requests</p>
        </div>
        {(referrals?.length ?? 0) > 0 && (
          <Badge variant="warning">{referrals?.length} pending</Badge>
        )}
      </div>

      {!referrals?.length ? (
        <Card>
          <EmptyState
            icon={<GitBranch size={28} />}
            title="No pending referrals"
            description="All referral requests have been reviewed."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((ref) => (
            <Card key={ref.id} padding="lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Clickable patient ID — navigates to patient detail */}
                    <button
                      onClick={() => navigate(`/admin/patients/${ref.patientId}`)}
                      className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 group"
                      title="View patient details"
                    >
                      Patient ID: {ref.patientId}
                      <ExternalLink size={12} className="text-text-muted group-hover:text-primary transition-colors" />
                    </button>
                    <Badge variant="warning">Pending</Badge>
                    <span className="text-xs text-text-muted">{ref.referralType} referral</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                    <DetailRow label="Diagnosis" value={ref.primaryDiagnosis} />
                    <DetailRow label="Disease Stage" value={ref.diseaseStage} />
                    <DetailRow label="PPS / KPS" value={`${ref.ppsScore}% / ${ref.kpsScore}`} />
                    <DetailRow label="Date" value={formatDate(ref.referralDate)} />
                    <DetailRow label="From" value={ref.referringFacility} />
                    <DetailRow label="To" value={ref.receivingFacility} />
                    <DetailRow label="Contact" value={`${ref.contactPerson} · ${ref.contactNumber}`} />
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-1.5">Reasons:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ref.reasons.map((r) => (
                        <Badge key={r} variant="secondary">{REFERRAL_REASON_LABELS[r] || r}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-text-muted border-t border-border-base pt-3">
                    Prepared by: {ref.preparedBy} · {ref.preparedByDesignation}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 md:w-32 flex-shrink-0">
                  {/* View patient before deciding */}
                  <Button
                    className="flex-1 md:flex-none"
                    variant="outline"
                    size="sm"
                    leftIcon={<ExternalLink size={13} />}
                    onClick={() => navigate(`/admin/patients/${ref.patientId}`)}
                  >
                    View Patient
                  </Button>

                  <Button
                    className="flex-1 md:flex-none"
                    leftIcon={<CheckCircle2 size={14} />}
                    loading={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(ref.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    className="flex-1 md:flex-none"
                    variant="destructive"
                    leftIcon={<XCircle size={14} />}
                    loading={declineMutation.isPending}
                    onClick={() => declineMutation.mutate(ref.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-text-muted text-xs">{label}: </span>
    <span className="text-on-surface">{value}</span>
  </div>
);

export default ReferralManagementPage;
