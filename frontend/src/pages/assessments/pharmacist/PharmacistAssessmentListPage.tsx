import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientPharmacistAssessments } from '@/hooks/usePharmacistAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { AssessmentListRow } from '@/components/assessments/AssessmentListRow';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const PharmacistAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'Pharmacist';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const { data, isLoading, error, refetch } = usePatientPharmacistAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Pharmacist Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/pharmacist-assessment/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first pharmacist assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <AssessmentListRow
          key={a.id}
          onClick={() => navigate(`/patients/${id}/pharmacist-assessment/${a.id}`)}
          icon={<Pill size={18} className="text-green-600" />}
          iconBgClass="bg-green-50"
          date={a.createdAt}
          assessmentType={a.assessmentType}
          badges={
            a.painControl ? (
              <Badge variant="secondary">
                Pain: {a.painControl.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ) : null
          }
          summary={a.pharmacistSummary || 'No summary recorded'}
          isDeleted={!!a.deletedAt}
        />
      ))}
    </AssessmentListShell>
  );
};

export default PharmacistAssessmentListPage;