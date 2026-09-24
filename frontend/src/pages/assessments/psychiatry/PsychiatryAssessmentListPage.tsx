import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientPsychiatryAssessments } from '@/hooks/usePsychiatryAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const PsychiatryAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner =
    user?.role === 'Psychiatrist' || user?.role === 'Psychologist';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientPsychiatryAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Psychiatry Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/psychiatry-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first psychiatry assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/psychiatry-assessment/${a.id}`)}
          icon={<Brain size={18} className="text-fuchsia-600" />}
          iconBgClass="bg-fuchsia-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            <>
              {a.suicideRiskLevel && (
                <Badge
                  variant={
                    a.suicideRiskLevel === 'High'
                      ? 'error'
                      : a.suicideRiskLevel === 'Moderate'
                        ? 'warning'
                        : 'success'
                  }
                >
                  Suicide risk: {a.suicideRiskLevel}
                </Badge>
              )}
              {a.severity && <Badge variant="secondary">{a.severity}</Badge>}
            </>
          }
          summary={
            a.diagnoses && a.diagnoses.length > 0
              ? a.diagnoses.map((d) => d.replace(/([A-Z])/g, ' $1').trim()).join(', ')
              : 'No diagnosis recorded'
          }
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default PsychiatryAssessmentListPage;