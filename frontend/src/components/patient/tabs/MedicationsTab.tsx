import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientMedications } from '@/hooks/useMedications';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface MedicationsTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const MedicationsTab: React.FC<MedicationsTabProps> = ({
  patientId,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data } = usePatientMedications(patientId);

  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No medications ordered"
        {...(hasPermission(userRole, 'canOrderMedication') && {
          actionLabel: 'Order Medication',
          onAction: () => navigate(`/patients/${patientId}/medications`),
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
              'Medication',
              'Dosage',
              'Frequency',
              'Route',
              'Admin At',
              'Status',
              'Ordered',
            ].map((h) => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {data.items.map((m) => (
            <tr
              key={m.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() =>
                navigate(`/patients/${patientId}/medications/${m.id}`)
              }
            >
              <td className="py-3 pr-4 font-medium whitespace-nowrap">
                {m.name}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {m.dosage}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {m.frequency}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {m.route}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {m.administeredAt}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={m.status} type="medication" />
              </td>
              <td className="py-3 text-text-muted text-xs whitespace-nowrap">
                {formatDate(m.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicationsTab;