import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminPatientDetail } from '@/hooks/useAdmin';
import { useDischargePatient } from '@/hooks/useDischarge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { DischargePatientWizard } from '@/components/admin/discharge/DischargePatientWizard';
import type { DischargeSummary } from '@/hooks/useDischargeFormState';
import { useToast } from '@/context/ToastContext';

const DischargePatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);
  const dischargeMutation = useDischargePatient();

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  if (patient.status === 'Discharged') {
    navigate(`/admin/patients/${patientId}`, { replace: true });
    return null;
  }

  const handleDischarge = (summary: DischargeSummary) => {
    dischargeMutation.mutate(
      { patientId: patientId!, data: summary },
      {
        onSuccess: () => {
          toast.success(`${patient.firstName} ${patient.lastName} has been discharged.`);
          navigate(`/admin/patients/${patientId}`, {
            replace: true,
            state: { dischargeSummary: summary },
          });
        },
      },
    );
  };

  const handleClose = () => {
    navigate(`/admin/patients/${patientId}`);
  };

  return (
    <div className="max-w-6xl">
      {/* Back link above the sticky header */}
      <div className="mb-3">
        <BackButton to={`/admin/patients/${patientId}`} label={`${patient.firstName} ${patient.lastName}`} />
      </div>

      <DischargePatientWizard
        patient={patient}
        onDischarge={handleDischarge}
        onClose={handleClose}
        isSubmitting={dischargeMutation.isPending}
      />
    </div>
  );
};

export default DischargePatientPage;