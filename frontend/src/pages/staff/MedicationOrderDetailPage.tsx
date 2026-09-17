import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Pill } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { useToast } from '@/context/ToastContext';
import api from '@/api/client';

/**
 * MedicationOrderDetailPage
 * Accessed via /medication-orders/:id
 * Allows pharmacists to review a medication order and mark it as Given.
 */
const MedicationOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: med, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.MEDICATION_ORDERS, id],
    queryFn: async () => {
      const res = await api.get(`/medications/queue/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const markGivenMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/medications/queue/${id}/status`, { status: 'Given' });
    },
    onSuccess: () => {
      toast.success('Medication marked as given');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICATION_ORDERS });
      navigate(ROUTES.MEDICATION_ORDERS);
    },
    onError: () => {
      toast.error('Failed to update medication status');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !med) return <ErrorState onRetry={refetch} />;

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
            ['Patient', med.patientName ?? '—'],
            ['Medication', med.medicationName ?? med.name ?? '—'],
            ['Dose', med.dose ?? med.dosage ?? '—'],
            ['Frequency', med.frequency ?? '—'],
            ['Route', med.route ?? '—'],
            ['Prescribed By', med.prescribingClinician ?? (med.prescribedBy?.name) ?? '—'],
            ['Date Ordered', formatDate(med.dateOrdered ?? med.createdAt)],
            ['Notes', med.notes ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-2">
              <span className="text-text-muted min-w-[140px] flex-shrink-0">{label}:</span>
              <span className="text-on-surface font-medium">{String(value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {med.status !== 'Given' && (
        <div className="flex gap-3">
          <Button
            leftIcon={<CheckCircle2 size={15} />}
            loading={markGivenMutation.isPending}
            onClick={() => markGivenMutation.mutate()}
          >
            Mark as Given
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.MEDICATION_ORDERS)}>
            Back to Queue
          </Button>
        </div>
      )}
    </div>
  );
};

export default MedicationOrderDetailPage;
