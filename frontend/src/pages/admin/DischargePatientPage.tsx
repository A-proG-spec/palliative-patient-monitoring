import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminPatientDetail } from '@/hooks/useAdmin';
import { useDischargePatient } from '@/hooks/useDischarge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { DischargePatientModal } from '@/components/admin/DischargePatientModal';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

/**
 * DischargePatientPage
 * ────────────────────
 * Full-page route: /admin/patients/:patientId/discharge
 *
 * Renders the discharge form inside the normal DashboardLayout.
 * Submits to POST /patients/:patientId/discharge-summary — the real
 * discharge endpoint that:
 *   1. Persists the discharge summary
 *   2. Flips the linked HospitalAdmission → Discharged
 *   3. Flips the Patient → Discharged
 *   4. Creates a CloseCase notification
 *
 * On success, navigates back to the patient detail page with the
 * summary in router state so the detail page can render it without
 * waiting for a refetch.
 */
const DischargePatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);
  const dischargeMutation = useDischargePatient();

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // Guard: if already discharged, redirect back
  if (patient.status === 'Discharged') {
    navigate(`/admin/patients/${patientId}`, { replace: true });
    return null;
  }

  const handleDischarge = (summary: DischargeSummary) => {
    // Compose a short human-readable note for the router-state handoff.
    // This is what the patient detail page will show as "Discharged on..."
    // until the real discharge summary is refetched from the API.
    const dischargeType =
      summary.dischargeType === 'Other' && summary.dischargeTypeOther
        ? summary.dischargeTypeOther
        : summary.dischargeType || 'Discharge';

    void dischargeType; // used by the persisted summary, kept for clarity

    dischargeMutation.mutate(
      { patientId: patientId!, data: summary },
      {
        onSuccess: () => {
          toast.success(
            `${patient.firstName} ${patient.lastName} has been discharged.`,
          );
          navigate(`/admin/patients/${patientId}`, {
            replace: true,
            state: { dischargeSummary: summary },
          });
        },
        // On error the hook already fires a toast — keep the user
        // on this page with their entered data intact.
      },
    );
  };

  const handleClose = () => {
    navigate(`/admin/patients/${patientId}`);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton
            to={`/admin/patients/${patientId}`}
            label={`${patient.firstName} ${patient.lastName}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-warning-bg flex items-center justify-center">
            <LogOut size={15} className="text-warning" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-on-surface leading-tight">Discharge Patient</h1>
            <p className="text-xs text-text-muted">
              {patient.firstName} {patient.lastName} · {patient.patientDisplayId}
            </p>
          </div>
        </div>
      </div>

      {/* ── Autofill info banner ── */}
      <div className="flex items-start gap-2.5 bg-primary/[0.04] border border-primary/20 rounded-xl px-4 py-3">
        <span className="text-[9px] font-semibold text-primary bg-primary/[0.1] border border-primary/20 px-1.5 py-1 rounded-full leading-none mt-0.5 flex-shrink-0">
          auto-filled
        </span>
        <p className="text-xs text-text-secondary leading-relaxed">
          Fields marked <strong className="text-primary">auto-filled</strong> have been pre-populated from the patient record.
          Please review and correct them before submitting — they remain fully editable.
        </p>
      </div>

      {/* ── Form ── */}
      <DischargePatientModal
        patient={patient}
        onDischarge={handleDischarge}
        onClose={handleClose}
      />

      {/* ── Submitting indicator ── */}
      {dischargeMutation.isPending && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-surface-lowest border border-border-base shadow-xl px-6 py-5 flex items-center gap-3">
            <span className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <div>
              <p className="text-sm font-medium text-on-surface">Saving discharge summary…</p>
              <p className="text-xs text-text-muted">Please wait — do not close this page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargePatientPage;