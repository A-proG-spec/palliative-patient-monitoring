import React from 'react';
import type { ImagingOrder } from '@/api/imaging';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ImagingListProps {
  imagingOrders: ImagingOrder[];
  loading?: boolean;
  onEnterResult?: (id: string) => void;
  onViewResult?: (id: string) => void;
}

const modalityLabels: Record<string, string> = {
  XRay: 'X-Ray',
  Ultrasound: 'Ultrasound',
  CT: 'CT Scan',
  MRI: 'MRI',
  Mammography: 'Mammography',
  Fluoroscopy: 'Fluoroscopy',
  Interventional: 'Interventional',
  NuclearMedicine: 'Nuclear Medicine',
  Other: 'Other',
};

const modalityBadgeClass: Record<string, string> = {
  XRay: 'bg-blue-100 text-blue-800',
  Ultrasound: 'bg-purple-100 text-purple-800',
  CT: 'bg-red-100 text-red-800',
  MRI: 'bg-green-100 text-green-800',
  Mammography: 'bg-pink-100 text-pink-800',
  Fluoroscopy: 'bg-orange-100 text-orange-800',
  Interventional: 'bg-indigo-100 text-indigo-800',
  NuclearMedicine: 'bg-yellow-100 text-yellow-800',
  Other: 'bg-gray-100 text-gray-800',
};

export const ImagingList: React.FC<ImagingListProps> = ({
  imagingOrders,
  loading,
  onEnterResult,
  onViewResult,
}) => {
  if (loading) {
    return <div className="animate-pulse p-4">Loading imaging orders…</div>;
  }

  if (imagingOrders.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No imaging orders have been placed for this patient.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-low border-b border-border-base">
          <tr>
            {['Modality', 'Body Region', 'Date Ordered', 'Priority', 'Status', 'Report', 'Actions'].map(
              (h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {imagingOrders.map((order) => {
            const modality = order.modality ?? 'Other';
            const isCompleted = order.status === 'Completed';
            const hasReport = !!(order.report && order.report.findings);

            return (
              <tr key={order.id} className="hover:bg-surface-low/50 transition-colors">
                <td className="px-5 py-3.5">
                  <Badge className={modalityBadgeClass[modality] ?? modalityBadgeClass.Other}>
                    {modalityLabels[modality] ?? modality}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {order.bodyRegion || '—'}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {order.dateOrdered ? formatDate(order.dateOrdered) : formatDate(order.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.priority ?? 'Routine'} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.status} type="lab" />
                </td>
                <td className="px-5 py-3.5 text-text-secondary text-xs">
                  {hasReport ? 'Available' : '—'}
                </td>
                <td className="px-5 py-3.5">
                  {!isCompleted && onEnterResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEnterResult(order.id)}
                    >
                      Enter Report
                    </Button>
                  )}
                  {isCompleted && onViewResult && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewResult(order.id)}
                    >
                      View Report
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ImagingList;