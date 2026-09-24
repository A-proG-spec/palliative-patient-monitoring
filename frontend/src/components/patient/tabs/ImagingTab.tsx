import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientImaging } from '@/hooks/useImaging';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface ImagingTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const ImagingTab: React.FC<ImagingTabProps> = ({
  patientId,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data } = usePatientImaging(patientId);
  const orders = data?.items ?? [];

  if (!orders.length) {
    return (
      <EmptyState
        title="No imaging orders"
        {...(hasPermission(userRole, 'canOrderImaging') && {
          actionLabel: 'Order Imaging',
          onAction: () => navigate(`/patients/${patientId}/imaging`),
        })}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[780px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {[
              'Modality',
              'Body Region',
              'Ordered',
              'Performed',
              'Status',
              'Report',
            ].map((h) => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {orders.map((img) => {
            const hasReport = !!(img.report && img.report.findings);
            return (
              <tr
                key={img.id}
                className="hover:bg-surface-low cursor-pointer"
                onClick={() =>
                  navigate(`/patients/${patientId}/imaging/${img.id}`)
                }
              >
                <td className="py-3 pr-4 whitespace-nowrap">
                  <Badge variant="primary">{img.modality}</Badge>
                </td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {img.bodyRegion || '—'}
                </td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {img.dateOrdered
                    ? formatDate(img.dateOrdered)
                    : formatDate(img.createdAt)}
                </td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {img.performedAt ? formatDate(img.performedAt) : '—'}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={img.status} type="lab" />
                </td>
                <td className="py-3 text-text-muted text-xs whitespace-nowrap">
                  {hasReport ? 'Available' : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ImagingTab;