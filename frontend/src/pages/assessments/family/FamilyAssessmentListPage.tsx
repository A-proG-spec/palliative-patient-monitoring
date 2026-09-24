import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientFamilyAssessments } from '@/hooks/useFamilyAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const FamilyAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'SocialWorker';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientFamilyAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Family Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/family-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first family assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/family-assessment/${a.id}`)}
          icon={<Users size={18} className="text-orange-600" />}
          iconBgClass="bg-orange-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.burdenLevel ? (
              <Badge
                variant={
                  a.burdenLevel === 'Severe' || a.burdenLevel === 'High'
                    ? 'error'
                    : a.burdenLevel === 'Moderate'
                      ? 'warning'
                      : 'success'
                }
              >
                Burden: {a.burdenLevel}
              </Badge>
            ) : null
          }
          summary={a.assessorName ? `Assessor: ${a.assessorName}` : '—'}
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default FamilyAssessmentListPage;