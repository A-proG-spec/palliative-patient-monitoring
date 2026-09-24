import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Apple } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientNutritionalAssessments } from '@/hooks/useNutritionalAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const NutritionalAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'Nutritionist';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientNutritionalAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Nutritional Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/nutritional-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first nutritional assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/nutritional-assessment/${a.id}`)}
          icon={<Apple size={18} className="text-emerald-600" />}
          iconBgClass="bg-emerald-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.overallNutritionalRisk ? (
              <Badge
                variant={
                  a.overallNutritionalRisk === 'Critical' ||
                  a.overallNutritionalRisk === 'High'
                    ? 'error'
                    : a.overallNutritionalRisk === 'Moderate'
                      ? 'warning'
                      : 'success'
                }
              >
                Risk: {a.overallNutritionalRisk}
              </Badge>
            ) : null
          }
          summary={
            a.bmi
              ? `BMI: ${a.bmi} · Appetite: ${a.currentAppetite ?? '—'}`
              : 'No BMI recorded'
          }
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default NutritionalAssessmentListPage;