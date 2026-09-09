import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, FileText, Printer } from 'lucide-react';
import { useAdminPatientDetail, useCloseCase } from '@/hooks/useAdmin';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { DischargePatientModal } from '@/components/admin/DischargePatientModal';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';
import { printDischargeSummary } from '@/lib/printDischargeSummary';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { XCircle } from 'lucide-react';

/**
 * DischargePatientPage
 * ────────────────────
 * Full-page route: /admin/patients/:patientId/discharge
 *
 * Renders the discharge form inside the normal DashboardLayout (sidebar
 * visible, full page width) rather than inside a centered modal overlay.
 * The DischargePatientModal component handles all form state; this page
 * provides the page chrome: back button, patient header, and handles the
 * onDischarge / onClose callbacks.
 *
 * On successful discharge it navigates back to the patient detail page.
 * Discharge summary is passed back via location state so the detail page
 * can display it without losing it on refresh (or it's stored in memory).
 */
const DischargePatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);
  const closeCaseMutation = useCloseCase();

  // Post-discharge summary viewer state (shown on this page after success)
  const [completedSummary, setCompletedSummary] = useState<DischargeSummary | null>(null);
  const [showSummaryViewer, setShowSummaryViewer] = useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // Guard: if already discharged, redirect back
  if (patient.status === 'Discharged') {
    navigate(`/admin/patients/${patientId}`, { replace: true });
    return null;
  }

  const handleDischarge = (summary: DischargeSummary) => {
    setCompletedSummary(summary);

    // Auto-add discharge history entry by passing it through location state
    const dischargeType = summary.dischargeType === 'Other' && summary.dischargeTypeOther
      ? summary.dischargeTypeOther
      : summary.dischargeType || 'Discharge';
    const dischargedTo = summary.dischargedTo === 'Other' && summary.dischargedToOther
      ? summary.dischargedToOther
      : summary.dischargedTo;

    const historyNote = [
      `Patient discharged — ${dischargeType}`,
      dischargedTo ? `Discharged to: ${dischargedTo}` : null,
      summary.overallCondition ? `Condition at discharge: ${summary.overallCondition}` : null,
      summary.dateOfDischarge ? `Discharge date: ${formatDate(summary.dateOfDischarge)}` : null,
    ].filter(Boolean).join('\n');

    // Use the existing closeCase mutation to flip status → Discharged
    // TODO: backend integration — replace with a dedicated discharge endpoint
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason: 'Improved' } },
      {
        onSuccess: () => {
          toast.success(`${patient.firstName} ${patient.lastName} has been discharged.`);
          // Navigate back to patient detail, passing discharge summary + history entry in state
          navigate(`/admin/patients/${patientId}`, {
            replace: true,
            state: {
              dischargeSummary: summary,
              dischargeHistoryEntry: {
                id: `hist-discharge-${Date.now()}`,
                date: summary.submittedAt || new Date().toISOString(),
                category: 'Clinical Note',
                note: historyNote,
                addedBy: summary.submittedBy || 'Admin',
              },
            },
          });
        },
        onError: () => {
          toast.error('Failed to discharge patient. Please try again.');
          // Keep on this page with entered data intact
        },
      }
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

      {/* ── Form (rendered as page content, not modal overlay) ── */}
      <DischargePatientModal
        patient={patient}
        onDischarge={handleDischarge}
        onClose={handleClose}
      />

    </div>
  );
};

export default DischargePatientPage;
