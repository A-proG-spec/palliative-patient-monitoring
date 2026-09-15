import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdmissionListItem } from '@/types/admission.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

interface AdmissionListProps {
  admissions: AdmissionListItem[];
  patientId: string;
  loading?: boolean;
}

export const AdmissionList: React.FC<AdmissionListProps> = ({
  admissions,
  patientId,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-5 text-sm text-text-muted">Loading admissions…</div>
    );
  }

  if (!admissions.length) {
    return (
      <EmptyState
        title="No admissions recorded"
        description="No hospital admissions have been recorded for this patient yet."
        actionLabel="Record Admission"
        onAction={() => navigate(`/patients/${patientId}/admissions`)}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-low border-b border-border-base">
          <tr>
            {[
              'Admission Date',
              'Bed',
              'Ward',
              'Physician',
              'Status',
              'Discharge',
              '',
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {admissions.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-surface-low/50 transition-colors"
            >
              <td className="px-5 py-3.5">{formatDate(a.admissionDate)}</td>
              <td className="px-5 py-3.5 text-text-secondary">
                {a.bedNumber}
              </td>
              <td className="px-5 py-3.5 text-text-secondary">{a.ward}</td>
              <td className="px-5 py-3.5 text-text-secondary">
                {a.admittingPhysician}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={a.status} type="admission" />
              </td>
              <td className="px-5 py-3.5 text-text-muted">
                {a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}
              </td>
              <td className="px-5 py-3.5 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    navigate(`/patients/${patientId}/admissions/${a.id}`)
                  }
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdmissionList;