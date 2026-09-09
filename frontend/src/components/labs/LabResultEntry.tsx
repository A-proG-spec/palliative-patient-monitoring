import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateLabResult } from '@/hooks/useLabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const resultSchema = z.object({
  datePerformed: z.string().min(1, 'Date performed is required'),
  result: z.string().min(1, 'Result is required'),
  performedBy: z.string().optional(),
  notes: z.string().optional(),
});

type ResultFormData = z.infer<typeof resultSchema>;

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
  const [isExpanded, setIsExpanded] = useState(true);
  const updateMutation = useUpdateLabResult(patientId);

  const { register, handleSubmit, formState: { errors } } = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      datePerformed: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ResultFormData) => {
    updateMutation.mutate(
      { labId, data: { datePerformed: data.datePerformed, result: data.result } },
      {
        onSuccess: () => {
          onResultSaved?.();
        },
      }
    );
  };

  return (
    <Card padding="lg" className="bg-surface-low">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-on-surface">
            📋 Enter Lab Results
          </CardTitle>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-text-muted hover:text-primary transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Date Performed"
                type="date"
                error={errors.datePerformed?.message}
                {...register('datePerformed')}
              />
              <Input
                label="Performed By (Optional)"
                placeholder="Technologist name"
                {...register('performedBy')}
              />
            </div>

            <Textarea
              label="Result / Findings"
              rows={4}
              placeholder="Enter the test results here..."
              error={errors.result?.message}
              {...register('result')}
            />

            <Textarea
              label="Additional Notes (Optional)"
              rows={2}
              placeholder="Any additional notes about the result..."
              {...register('notes')}
            />

            <Button type="submit" loading={updateMutation.isPending} className="w-full">
              Save Results
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};