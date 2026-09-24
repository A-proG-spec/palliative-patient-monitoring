import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientVisits } from '@/hooks/useVisits';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { VISIT_TYPE_LABELS } from '@/constants';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface VisitsTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const VisitsTab: React.FC<VisitsTabProps> = ({ patientId, userRole }) => {
  const navigate = useNavigate();
  const { data } = usePatientVisits(patientId);

  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No visits recorded"
        description="Record the first home visit for this patient."
        {...(hasPermission(userRole, 'canRecordVisit') && {
          actionLabel: 'Record Visit',
          onAction: () => navigate(`/patients/${patientId}/visits`),
        })}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {['Date', 'Type', 'Status', 'Outcome', 'Scores'].map((h) => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {data.items.map((v) => (
            <tr
              key={v.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() => navigate(`/patients/${patientId}/visits/${v.id}`)}
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                {formatDate(v.visitDate)}
              </td>
              <td className="py-3 pr-4">
                <Badge variant="secondary">
                  {VISIT_TYPE_LABELS[v.visitType] || v.visitType}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={v.overallStatus} />
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={v.outcome} type="visit" />
              </td>
              <td className="py-3 text-text-muted text-xs whitespace-nowrap">
                PPS {v.ppsScore}% · KPS {v.kpsScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitsTab;