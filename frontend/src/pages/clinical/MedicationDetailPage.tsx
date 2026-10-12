import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  useMedicationDetail,
  useUpdateMedicationStatus,
} from '@/hooks/useMedications';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════
// OUTER — reads params, hard-guards before ANY hook runs.
// ═══════════════════════════════════════════════════════════
const MedicationDetailPage: React.FC = () => {
  const { id, medicationId } = useParams<{
    id: string;
    medicationId: string;
  }>();

  if (!id || !medicationId) {
    return (
      <div className="max-w-2xl">
        <ErrorState message="Missing patient or medication id in the URL." />
      </div>
    );
  }

  return <MedicationDetailContent patientId={id} medicationId={medicationId} />;
};

// ═══════════════════════════════════════════════════════════
// INNER — receives guaranteed non-empty params.
// ═══════════════════════════════════════════════════════════
const MedicationDetailContent: React.FC<{
  patientId: string;
  medicationId: string;
}> = ({ patientId, medicationId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ── Role gate ──
  // Only Pharmacists and Admins may administer a medication.
  // Physicians, Nurses, Radiologists, and other roles can VIEW
  // the record but never mark it as given.
  const canMarkGiven =
    user?.type === 'admin' || user?.role === 'Pharmacist';

  const {
    data: med,
    isLoading,
    error,
    refetch,
  } = useMedicationDetail(patientId, medicationId);

  const updateMutation = useUpdateMedicationStatus(patientId);

  if (isLoading) return <PageLoader />;
  if (error || !med) return <ErrorState onRetry={refetch} />;

  // ═══════════════════════════════════════════════════════════
  // Resolve the "Prescribed By" label from three possible sources
  //
  //   1. `prescribedBy` as an object { id, name, type } — the
  //      preferred shape emitted by the backend's toPrescribedBy().
  //   2. `prescribedBy` as a bare string — the legacy shape from
  //      older API responses.
  //   3. `enteredBy` — final fallback, always present.
  //
  // This covers both admin-authored orders (prescribedBy is null
  // on the raw column, but the DTO surfaces the admin) and
  // staff-authored orders (prescribedByStaff populated directly).
  // ═══════════════════════════════════════════════════════════
  const prescribedByName = (() => {
    if (typeof med.prescribedBy === 'object' && med.prescribedBy !== null) {
      return med.prescribedBy.name;
    }
    if (typeof med.prescribedBy === 'string' && med.prescribedBy.length > 0) {
      return med.prescribedBy;
    }
    if (med.enteredBy && typeof med.enteredBy === 'object') {
      return med.enteredBy.name;
    }
    return '—';
  })();

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${patientId}`} label="Patient" />
        <h1 className="text-xl font-bold text-on-surface">
          Medication Detail
        </h1>
        <StatusBadge status={med.status} type="medication" />
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          {[
            ['Medication', med.name],
            ['Dosage', med.dosage],
            ['Frequency', med.frequency],
            ['Route', med.route],
            ['Administered At', med.administeredAt],
            ['Prescribed / Entered By', prescribedByName],
            ['Ordered', formatDate(med.createdAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-text-muted">{label}: </span>
              <span className="text-on-surface font-medium">{value}</span>
            </div>
          ))}

          {med.status === 'Ordered' && (
            <div className="pt-3 flex gap-3">
              {canMarkGiven && (
                <Button
                  leftIcon={<CheckCircle2 size={14} />}
                  loading={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate(
                      { medicationId, data: { status: 'Given' } },
                      { onSuccess: () => navigate(`/patients/${patientId}`) },
                    )
                  }
                >
                  Mark as Given
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationDetailPage;