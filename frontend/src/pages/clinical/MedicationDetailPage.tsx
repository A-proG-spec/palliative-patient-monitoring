import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  useMedicationDetail,
  useUpdateMedicationStatus,
} from '@/hooks/useMedications';
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

  const {
    data: med,
    isLoading,
    error,
    refetch,
  } = useMedicationDetail(patientId, medicationId);

  const updateMutation = useUpdateMedicationStatus(patientId);

  if (isLoading) return <PageLoader />;
  if (error || !med) return <ErrorState onRetry={refetch} />;

  const prescribedByName =
    typeof med.prescribedBy === 'object' && med.prescribedBy !== null
      ? med.prescribedBy.name
      : '—';

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
            ['Prescribed By', prescribedByName],
            ['Ordered', formatDate(med.createdAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-text-muted">{label}: </span>
              <span className="text-on-surface font-medium">{value}</span>
            </div>
          ))}

          {med.status === 'Ordered' && (
            <div className="pt-3 flex gap-3">
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
              <Button
                variant="outline"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() => navigate(`/patients/${patientId}`)}
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationDetailPage;