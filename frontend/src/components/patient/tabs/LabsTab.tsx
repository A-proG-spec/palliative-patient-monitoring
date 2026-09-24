import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientLabs } from '@/hooks/useLabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface LabsTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const LabsTab: React.FC<LabsTabProps> = ({ patientId, userRole }) => {
  const navigate = useNavigate();
  const { data } = usePatientLabs(patientId);
  const orders = data?.items ?? [];

  if (!orders.length) {
    return (
      <EmptyState
        title="No lab tests ordered"
        {...(hasPermission(userRole, 'canOrderLab') && {
          actionLabel: 'Order Lab Test',
          onAction: () => navigate(`/patients/${patientId}/labs`),
        })}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {[
              'Test',
              'Ordered',
              'Performed',
              'Location',
              'Status',
              'Result',
            ].map((h) => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {orders.map((l) => (
            <tr
              key={l.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() => navigate(`/patients/${patientId}/labs/${l.id}`)}
            >
              <td className="py-3 pr-4 font-medium whitespace-nowrap">
                {l.testName}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {formatDate(l.dateOrdered)}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {l.datePerformed ? formatDate(l.datePerformed) : '—'}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {l.location}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={l.status} type="lab" />
              </td>
              <td className="py-3 text-text-muted text-xs max-w-[180px] truncate">
                {l.result || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LabsTab;