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

const MedicationDetailPage: React.FC = () => {
  const { id, medicationId } = useParams<{ id: string; medicationId: string }>();
  const navigate = useNavigate();

  const {
    data: med,
    isLoading,
    error,
    refetch,
  } = useMedicationDetail(id!, medicationId!);
  const updateMutation = useUpdateMedicationStatus(id!);

  if (isLoading) return <PageLoader />;
  if (error || !med) return <ErrorState onRetry={refetch} />;

  const prescribedByName =
    typeof med.prescribedBy === 'object' && med.prescribedBy !== null
      ? med.prescribedBy.name
      : '—';

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
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
                    { medicationId: medicationId!, data: { status: 'Given' } },
                    { onSuccess: () => navigate(`/patients/${id}`) },
                  )
                }
              >
                Mark as Given
              </Button>
              <Button
                variant="outline"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() => navigate(`/patients/${id}`)}
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