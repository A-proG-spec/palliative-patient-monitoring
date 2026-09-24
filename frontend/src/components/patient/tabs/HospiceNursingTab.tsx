import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';
import { usePatientHospiceAssessments } from '@/hooks/useHospiceNursing';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface HospiceNursingTabProps {
  patientId: string;
  userRole: StaffRole;
}

export const HospiceNursingTab: React.FC<HospiceNursingTabProps> = ({
  patientId,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data } = usePatientHospiceAssessments(patientId, { limit: 100 });
  const assessments = data?.items ?? [];

  const canWrite = hasPermission(userRole, 'canRecordHospiceNursing');

  if (assessments.length === 0) {
    return canWrite ? (
      <EmptyState
        icon={<Heart size={28} />}
        title="No hospice nursing assessments"
        description="Record the first hospice nursing assessment for this patient."
        actionLabel="Add Assessment"
        onAction={() => navigate(`/patients/${patientId}/hospice-nursing`)}
      />
    ) : (
      <EmptyState
        icon={<Heart size={28} />}
        title="No hospice nursing assessments"
        description="No hospice nursing assessments have been recorded for this patient yet."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-xs text-text-muted">
            {[
              'Assessment Date',
              'Assessed By',
              'Consciousness',
              'Pain',
              'Mobility',
              'Emotional',
              '',
            ].map((h) => (
              <th
                key={h}
                className="pb-3 pr-4 font-medium whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {assessments.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-surface-low cursor-pointer"
              onClick={() =>
                navigate(`/patients/${patientId}/hospice-nursing/${a.id}`)
              }
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                {formatDate(a.assessmentDate)}
              </td>
              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                {a.assessedBy?.name ?? '—'}
              </td>
              <td className="py-3 pr-4">
                {a.levelOfConsciousness ? (
                  <Badge variant="secondary">{a.levelOfConsciousness}</Badge>
                ) : (
                  <span className="text-text-muted text-xs">—</span>
                )}
              </td>
              <td className="py-3 pr-4">
                {a.painScore !== null && a.painScore !== undefined ? (
                  <Badge
                    variant={
                      a.painScore >= 7
                        ? 'error'
                        : a.painScore >= 4
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {a.painScore}/10
                  </Badge>
                ) : (
                  <span className="text-text-muted text-xs">—</span>
                )}
              </td>
              <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                {a.mobilityStatus ?? '—'}
              </td>
              <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                {a.emotionalStatus ?? '—'}
              </td>
              <td className="py-3 text-right">
                <ChevronRight
                  size={16}
                  className="text-outline-variant inline-block"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HospiceNursingTab;