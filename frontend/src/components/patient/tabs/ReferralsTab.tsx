import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface ReferralsTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const ReferralsTab: React.FC<ReferralsTabProps> = ({
  patientId,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data } = usePatientReferrals(patientId);

  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No referrals requested"
        {...(hasPermission(userRole, 'canCreateReferral') && {
          actionLabel: 'Request Referral',
          onAction: () => navigate(`/patients/${patientId}/referrals`),
        })}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {['Date', 'Type', 'Receiving Facility', 'Status', 'Created'].map(
              (h) => (
                <th
                  key={h}
                  className="pb-3 pr-4 font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {data.items.map((r) => (
            <tr
              key={r.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() =>
                navigate(`/patients/${patientId}/referrals/${r.id}`)
              }
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                {formatDate(r.referralDate)}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {r.referralType}
              </td>
              <td className="py-3 pr-4 text-text-secondary truncate max-w-[240px]">
                {r.receivingFacility}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={r.status} type="referral" />
              </td>
              <td className="py-3 text-xs text-text-muted whitespace-nowrap">
                {formatDate(r.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReferralsTab;