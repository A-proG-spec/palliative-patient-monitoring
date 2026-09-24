import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientSpiritualAssessments } from '@/hooks/useSpiritualAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const SpiritualAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'SpiritualPerson';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientSpiritualAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Spiritual Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/spiritual-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first spiritual assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/spiritual-assessment/${a.id}`)}
          icon={<Heart size={18} className="text-violet-600" />}
          iconBgClass="bg-violet-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.spiritualDistressLevel ? (
              <Badge
                variant={
                  a.spiritualDistressLevel === 'Severe' ||
                  a.spiritualDistressLevel === 'Moderate'
                    ? 'error'
                    : a.spiritualDistressLevel === 'Mild'
                      ? 'warning'
                      : 'success'
                }
              >
                Distress: {a.spiritualDistressLevel}
              </Badge>
            ) : null
          }
          summary={
            a.religiousAffiliation
              ? `${a.religiousAffiliation.replace(/([A-Z])/g, ' $1').trim()}`
              : '—'
          }
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default SpiritualAssessmentListPage;