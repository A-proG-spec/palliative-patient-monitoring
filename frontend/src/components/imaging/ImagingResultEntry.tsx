import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateLabResult } from '@/hooks/useLabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const imagingResultSchema = z.object({
  reportDate: z.string().min(1, 'Report date is required'),
  findings: z.string().min(1, 'Findings are required'),
  impression: z.string().min(1, 'Impression/Conclusion is required'),
  recommendations: z.string().optional(),
  reportingPhysician: z.string().min(1, 'Reporting physician is required'),
  imageQuality: z.enum(['Diagnostic', 'Limited', 'NonDiagnostic', 'RepeatRequired']),
  notes: z.string().optional(),
});

type ImagingResultFormData = z.infer<typeof imagingResultSchema>;

interface ImagingResultEntryProps {
  imagingId: string;
  patientId: string;
  onResultSaved?: () => void;
}

export const ImagingResultEntry: React.FC<ImagingResultEntryProps> = ({
  imagingId,
  patientId,
  onResultSaved,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const updateMutation = useUpdateLabResult(patientId);

  const { register, handleSubmit, formState: { errors } } = useForm<ImagingResultFormData>({
    resolver: zodResolver(imagingResultSchema),
    defaultValues: {
      reportDate: new Date().toISOString().split('T')[0],
      imageQuality: 'Diagnostic',
    },
  });

  const onSubmit = (data: ImagingResultFormData) => {
    // Format the result as a structured report
    const result = `
      📋 IMAGING REPORT
      ─────────────────────────────────
      Findings:
      ${data.findings}
      
      Impression / Conclusion:
      ${data.impression}
      
      Recommendations:
      ${data.recommendations || 'None'}
      
      Image Quality: ${data.imageQuality}
      Reporting Physician: ${data.reportingPhysician}
      Report Date: ${data.reportDate}
      ${data.notes ? `\nNotes: ${data.notes}` : ''}
    `;

    updateMutation.mutate(
      { 
        labId: imagingId, 
        data: { 
          datePerformed: data.reportDate, 
          result: result 
        } 
      },
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
        Enter Imaging Report
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
                label="Report Date"
                type="date"
                error={errors.reportDate?.message}
                {...register('reportDate')}
              />
              <Select
                label="Image Quality"
                options={[
                  { value: 'Diagnostic', label: 'Diagnostic/Adequate' },
                  { value: 'Limited', label: 'Limited' },
                  { value: 'NonDiagnostic', label: 'Non-diagnostic' },
                  { value: 'RepeatRequired', label: 'Repeat Required' },
                ]}
                {...register('imageQuality')}
              />
            </div>

            <Textarea
              label="Findings"
              rows={4}
              placeholder="Describe the imaging findings in detail..."
              error={errors.findings?.message}
              {...register('findings')}
            />

            <Textarea
              label="Impression / Conclusion"
              rows={3}
              placeholder="What is the clinical impression based on the findings?"
              error={errors.impression?.message}
              {...register('impression')}
            />

            <Textarea
              label="Recommendations / Follow-up"
              rows={2}
              placeholder="Any recommendations for follow-up or additional imaging?"
              {...register('recommendations')}
            />

            <Input
              label="Reporting Physician"
              placeholder="Radiologist/Physician name"
              error={errors.reportingPhysician?.message}
              {...register('reportingPhysician')}
            />

            <Textarea
              label="Additional Notes (Optional)"
              rows={2}
              placeholder="Any additional notes..."
              {...register('notes')}
            />

            <Button type="submit" loading={updateMutation.isPending} className="w-full">
              Save Report
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};