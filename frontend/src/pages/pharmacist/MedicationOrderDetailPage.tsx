import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Pill, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  useMedicationOrderDetail,
  useMarkMedicationGiven,
} from '@/hooks/useMedicationQueue';

const MedicationOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: med, isLoading, error, refetch } = useMedicationOrderDetail(id);
  const markGivenMutation = useMarkMedicationGiven();

  if (isLoading) return <PageLoader />;
  if (error || !med) return <ErrorState onRetry={refetch} />;

  const handleMarkGiven = () => {
    if (!id) return;
    markGivenMutation.mutate(id, {
      onSuccess: () => navigate(ROUTES.MEDICATION_ORDERS),
    });
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={ROUTES.MEDICATION_ORDERS} label="Medication Orders" />
        <h1 className="text-xl font-bold text-on-surface">Medication Order</h1>
        {med.status && <StatusBadge status={med.status} type="medication" />}
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
            <Pill size={20} />
          </div>

          {[
            ['Patient', med.patientName],
            ['Patient ID', med.patientDisplayId ?? '—'],
            ['Medication', med.medicationName],
            ['Dose', med.dose],
            ['Frequency', med.frequency],
            ['Route', med.route],
            ['Administered At', med.administeredAt],
            ['Prescribed By', med.prescribingClinician],
            ['Date Ordered', formatDate(med.dateOrdered)],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[140px] flex-shrink-0">
                {label}:
              </span>
              <span className="text-on-surface font-medium">
                {String(value ?? '—')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {med.status === 'Ordered' && (
        <div className="flex gap-3">
          <Button
            leftIcon={<CheckCircle2 size={15} />}
            loading={markGivenMutation.isPending}
            onClick={handleMarkGiven}
          >
            Mark as Given
          </Button>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.MEDICATION_ORDERS)}
          >
            Back to Queue
          </Button>
        </div>
      )}

      {med.status === 'Given' && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-success-bg/20 border border-success/30">
          <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface">
            This medication has already been marked as given.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationOrderDetailPage;