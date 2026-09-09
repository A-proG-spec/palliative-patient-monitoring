import React from 'react';
import { LaboratoryTest } from '@/types/lab.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ImagingListProps {
  imagingOrders: LaboratoryTest[];
  loading?: boolean;
  onEnterResult?: (id: string) => void;
  onViewResult?: (id: string) => void;
}

export const ImagingList: React.FC<ImagingListProps> = ({
  imagingOrders,
  loading,
  onEnterResult,
  onViewResult,
}) => {
  if (loading) {
    return <div className="animate-pulse p-4">Loading imaging orders...</div>;
  }

  if (imagingOrders.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No imaging orders have been placed for this patient.
      </div>
    );
  }

  // Extract modality from test name
  const getModality = (testName: string) => {
    const modalities = ['XRay', 'Ultrasound', 'CT', 'MRI', 'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine'];
    for (const mod of modalities) {
      if (testName.includes(mod)) return mod;
    }
    return 'Other';
  };

  const getModalityBadge = (modality: string) => {
    const colors: Record<string, string> = {
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
    return colors[modality] || colors.Other;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-low border-b border-border-base">
          <tr>
            {['Modality', 'Body Region', 'Date Ordered', 'Status', 'Report Date', 'Actions'].map((h) => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {imagingOrders.map((order) => {
            const modality = getModality(order.testName);
            const isCompleted = order.status === 'Completed';
            
            return (
              <tr key={order.id} className="hover:bg-surface-low/50 transition-colors">
                <td className="px-5 py-3.5">
                  <Badge className={getModalityBadge(modality)}>
                    {modality}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {order.testName.replace(`${modality} - `, '')}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {formatDate(order.dateOrdered)}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.status} type="lab" />
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {order.datePerformed ? formatDate(order.datePerformed) : '—'}
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