import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Activity } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientPainAssessments } from '@/hooks/usePainAssessments';
import { AssessmentListShell } from '@/components/assessments/AssessmentListShell';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const PainAssessmentListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'Nurse';

  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePatientPainAssessments(id!);

  const assessments = data?.items ?? [];
  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentListShell
      title="Pain Assessments"
      subtitle={`${data?.total ?? 0} recorded`}
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      onAddClick={() => navigate(`/patients/${id}/pain/new`)}
      isLoading={isLoading || pLoading}
      isError={!!error}
      onRetry={refetch}
      isEmpty={assessments.length === 0}
      emptyMessage="Record the first pain assessment for this patient."
      canCreate={isOwner}
    >
      {assessments.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => navigate(`/patients/${id}/pain/${a.id}`)}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-low transition-colors"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Activity size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-on-surface">
                {formatDate(a.createdAt)}
              </p>
              <Badge variant="secondary">{a.assessmentType}</Badge>
              {a.currentPainScore !== undefined && a.currentPainScore !== null && (
                <Badge
                  variant={
                    a.currentPainScore >= 7
                      ? 'error'
                      : a.currentPainScore >= 4
                        ? 'warning'
                        : 'success'
                  }
                >
                  Pain {a.currentPainScore}/10
                </Badge>
              )}
              {a.deletedAt && <Badge variant="error">Deleted</Badge>}
            </div>
            <p className="text-xs text-text-muted mt-1 truncate">
              {a.diagnosis && a.diagnosis.length > 0
                ? a.diagnosis.join(', ')
                : 'No diagnosis recorded'}
            </p>
          </div>
          <ChevronRight size={16} className="text-outline-variant flex-shrink-0" />
        </button>
      ))}
    </AssessmentListShell>
  );
};

export default PainAssessmentListPage;