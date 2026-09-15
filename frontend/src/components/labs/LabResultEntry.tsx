import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateLabResult } from '@/hooks/useLabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import {
  updateLabResultSchema,
  type UpdateLabResultFormData,
} from '@/schemas/lab.schema';

interface LabResultEntryProps {
  labId: string;
  patientId: string;
  onResultSaved?: () => void;
}

export const LabResultEntry: React.FC<LabResultEntryProps> = ({
  labId,
  patientId,
  onResultSaved,
}) => {
  const updateMutation = useUpdateLabResult(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateLabResultFormData>({
    resolver: zodResolver(updateLabResultSchema),
    defaultValues: {
      datePerformed: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: UpdateLabResultFormData) => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === '' || v === undefined || v === null) continue;
      cleaned[k] = v;
    }

    updateMutation.mutate(
      { labId, data: cleaned as UpdateLabResultFormData },
      {
        onSuccess: () => {
          onResultSaved?.();
        },
      },
    );
  };

  return (
    <Card padding="lg" className="bg-surface-low">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Date Performed *"
              type="date"
              error={errors.datePerformed?.message}
              {...register('datePerformed')}
            />
            <Input
              label="Performed By (Optional)"
              placeholder="Technologist name"
              error={errors.performedBy?.message}
              {...register('performedBy')}
            />
          </div>

          <Textarea
            label="Result / Findings *"
            rows={4}
            placeholder="Enter the test results here..."
            error={errors.result?.message}
            {...register('result')}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Reference Range (Optional)"
              placeholder="e.g., 4.0–11.0 ×10³/μL"
              error={errors.referenceRange?.message}
              {...register('referenceRange')}
            />
            <Select
              label="Abnormal Flag (Optional)"
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Low', label: 'Low' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
              placeholder="Select flag…"
              error={errors.abnormalFlag?.message}
              {...register('abnormalFlag')}
            />
          </div>

          <Textarea
            label="Additional Notes (Optional)"
            rows={2}
            placeholder="Any additional notes about the result..."
            error={errors.resultNotes?.message}
            {...register('resultNotes')}
          />

          <Button
            type="submit"
            loading={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Results'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};