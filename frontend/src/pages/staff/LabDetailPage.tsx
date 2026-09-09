import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateLabResultSchema, type UpdateLabResultFormData } from '@/schemas/lab.schema';
import { useLabDetail, useUpdateLabResult } from '@/hooks/useLabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

const LabDetailPage: React.FC = () => {
  const { id, labId } = useParams<{ id: string; labId: string }>();
  const navigate = useNavigate();
  const { data: lab, isLoading, error, refetch } = useLabDetail(id!, labId!);
  const updateMutation = useUpdateLabResult(id!);
  const [showResultForm, setShowResultForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateLabResultFormData>({
    resolver: zodResolver(updateLabResultSchema),
    defaultValues: { datePerformed: new Date().toISOString().split('T')[0] },
  });

  if (isLoading) return <PageLoader />;
  if (error || !lab) return <ErrorState onRetry={refetch} />;

  const onSubmit = (data: UpdateLabResultFormData) => {
    updateMutation.mutate(
      { labId: labId!, data },
      { onSuccess: () => { setShowResultForm(false); refetch(); } }
    );
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton label="Patient" />
        <h1 className="text-xl font-bold text-on-surface">Lab Test Detail</h1>
        <StatusBadge status={lab.status} type="lab" />
      </div>

      <Card padding="lg">
        <CardContent className="space-y-3 text-sm">
          {[
            ['Test Name', lab.testName],
            ['Date Ordered', formatDate(lab.dateOrdered)],
            ['Date Performed', lab.datePerformed ? formatDate(lab.datePerformed) : '—'],
            ['Location', lab.location],
            ['Result', lab.result || '—'],
          ].map(([l, v]) => (
            <div key={l}><span className="text-text-muted">{l}: </span><span className="text-on-surface font-medium">{v}</span></div>
          ))}

          {lab.status === 'Ordered' && !showResultForm && (
            <div className="pt-3">
              <Button onClick={() => setShowResultForm(true)}>Enter Result</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showResultForm && (
        <Card padding="lg">
          <CardHeader><CardTitle>Enter Lab Result</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input label="Date Performed" type="date" error={errors.datePerformed?.message} {...register('datePerformed')} />
              <Textarea label="Result" rows={4} placeholder="Enter the test result details…" error={errors.result?.message} {...register('result')} />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowResultForm(false)}>Cancel</Button>
                <Button type="submit" loading={updateMutation.isPending}>Save Result</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabDetailPage;
