import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Accessibility } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientPhysiotherapyAssessments } from '@/hooks/usePhysiotherapyAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const PhysiotherapyAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'Physiologist';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientPhysiotherapyAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Physiotherapy Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/physiotherapy-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first physiotherapy assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/physiotherapy-assessment/${a.id}`)}
          icon={<Accessibility size={18} className="text-indigo-600" />}
          iconBgClass="bg-indigo-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.fallRiskLevel ? (
              <Badge
                variant={
                  a.fallRiskLevel === 'High'
                    ? 'error'
                    : a.fallRiskLevel === 'Moderate'
                      ? 'warning'
                      : 'success'
                }
              >
                Fall risk: {a.fallRiskLevel}
              </Badge>
            ) : null
          }
          summary={
            a.mobilityStatus
              ? `Mobility: ${a.mobilityStatus.replace(/([A-Z])/g, ' $1').trim()}`
              : 'No mobility status recorded'
          }
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default PhysiotherapyAssessmentListPage;