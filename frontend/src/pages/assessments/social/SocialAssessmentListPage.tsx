import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientSocialAssessments } from '@/hooks/useSocialAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const SocialAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'SocialWorker';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientSocialAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Social Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/social-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first social assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/social-assessment/${a.id}`)}
          icon={<Home size={18} className="text-cyan-600" />}
          iconBgClass="bg-cyan-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.bereavementRisk ? (
              <Badge
                variant={
                  a.bereavementRisk === 'High'
                    ? 'error'
                    : a.bereavementRisk === 'Moderate'
                      ? 'warning'
                      : 'success'
                }
              >
                Bereavement risk: {a.bereavementRisk}
              </Badge>
            ) : null
          }
          summary={
            a.livingArrangement
              ? `Living: ${a.livingArrangement.replace(/([A-Z])/g, ' $1').trim()}`
              : '—'
          }
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default SocialAssessmentListPage;