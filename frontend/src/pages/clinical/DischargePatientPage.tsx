// src/pages/clinical/DischargePatientPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useDischargePatient } from '@/hooks/useDischarge';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { DischargePatientWizard } from '@/components/admin/discharge/DischargePatientWizard';
import { canDischarge } from '@/config/permissions';
import { buildDischargePayload } from '@/lib/dischargePayload';
import type { DischargeSummary } from '@/hooks/useDischargeFormState';

const DischargePatientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);

  // Optional: used only to close the admission record if one exists.
  const { data: admsData } = usePatientAdmissions(id!);

  const dischargeMutation = useDischargePatient();

  // Defense-in-depth — the route guard already enforces this.
  if (!canDischarge(user)) {
    return (
      <ErrorState message="You do not have permission to discharge patients." />
    );
  }

  // Wait for the patient record before rendering the wizard.
  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // Already discharged? Nothing to do — send them back.
  if (patient.status === 'Discharged') {
    return <ErrorState message="This patient has already been discharged." />;
  }

  // ── Optional enrichment ──
  //
  // If the patient is currently admitted, pass the admission ID so the
  // backend can flip that admission to Discharged in the same transaction.
  // Home-care patients pass `null` and are handled correctly by the backend.
  const activeAdmissionId: string | null =
    admsData?.items?.find(
      (a: { status: string; id: number | string }) => a.status === 'Active',
    )?.id?.toString() ?? null;

  const handleDischarge = (summary: DischargeSummary) => {
    const payload = buildDischargePayload(summary, activeAdmissionId);
    console.log('[Discharge] Payload:', payload); // remove after confirming

    dischargeMutation.mutate(
      { patientId: id!, data: payload as any },
      {
        onSuccess: () => {
          // The hook already invalidated the caches + showed a toast.
          navigate(`/patients/${id}`, { replace: true });
        },
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <DischargePatientWizard
        patient={{
          firstName: patient.firstName,
          lastName: patient.lastName,
          patientDisplayId: patient.patientDisplayId,
          dateOfBirth: patient.dateOfBirth,
          age: patient.age,
          sex: patient.sex,
          address: patient.address,
          phone: patient.phone,
          caregiverName: patient.caregiverName,
          caregiverPhone: patient.caregiverPhone,
          primaryDiagnosis: patient.primaryDiagnosis,
          secondaryDiagnoses: patient.secondaryDiagnoses,
          comorbidities: patient.comorbidities,
          createdAt: patient.createdAt,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactPhone: patient.emergencyContactPhone,
        }}
        onDischarge={handleDischarge}
        onClose={() => navigate(-1)}
        isSubmitting={dischargeMutation.isPending}
      />
    </div>
  );
};

export default DischargePatientPage;