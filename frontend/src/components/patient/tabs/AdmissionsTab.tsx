import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface AdmissionsTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const AdmissionsTab: React.FC<AdmissionsTabProps> = ({
  patientId,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data } = usePatientAdmissions(patientId);

  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No admissions recorded"
        {...(hasPermission(userRole, 'canRecordAdmission') && {
          actionLabel: 'Record Admission',
          onAction: () => navigate(`/patients/${patientId}/admissions`),
        })}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {[
              'Admission Date',
              'Bed',
              'Ward',
              'Physician',
              'Status',
              'Discharge',
            ].map((h) => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {data.items.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() =>
                navigate(`/patients/${patientId}/admissions/${a.id}`)
              }
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                {formatDate(a.admissionDate)}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {a.bedNumber}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {a.ward}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {a.admittingPhysician}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={a.status} type="admission" />
              </td>
              <td className="py-3 text-xs text-text-muted whitespace-nowrap">
                {a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdmissionsTab;