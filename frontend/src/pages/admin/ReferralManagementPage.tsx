// src/pages/admin/ReferralManagementPage.tsx
// Route: /admin/referrals  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)

import React from 'react';
import { usePendingReferrals, useApproveReferral, useDeclineReferral } from '@/hooks/useAdmin';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { DISEASE_STAGE_LABELS } from '@/constants';

export const ReferralManagementPage: React.FC = () => {
  const { data: referrals, isLoading, error, refetch } = usePendingReferrals();
  const approveMutation = useApproveReferral();
  const declineMutation = useDeclineReferral();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-1 text-on-surface">Referral Management</h1>
        {(referrals?.length ?? 0) > 0 && (
          <Badge variant="warning">{referrals!.length} pending</Badge>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Pending Referral Requests</CardTitle></CardHeader>
        <CardContent>
          {!referrals?.length ? (
            <EmptyState
              title="No pending referrals"
              description="All referral requests have been processed."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead className="bg-surface-container-low border-b border-border-base">
                  <tr>
                    {['Date', 'Diagnosis', 'Stage', 'Type', 'Receiving Facility', 'Reasons', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-on-surface-variant font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{formatDate(r.referralDate)}</td>
                      <td className="px-4 py-3 text-on-surface max-w-[180px] truncate">{r.primaryDiagnosis}</td>
                      <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                        {DISEASE_STAGE_LABELS[r.diseaseStage] ?? r.diseaseStage}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.referralType} /></td>
                      <td className="px-4 py-3 text-on-surface">{r.receivingFacility}</td>
                      <td className="px-4 py-3 text-on-surface max-w-[160px] truncate">
                        {r.reasons.slice(0, 2).join(', ')}{r.reasons.length > 2 ? '…' : ''}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            loading={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(r.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            loading={declineMutation.isPending}
                            onClick={() => declineMutation.mutate(r.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
