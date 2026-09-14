import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateImagingReport } from '@/hooks/useImaging';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const imagingReportSchema = z.object({
  reportNo: z.string().optional(),
  findings: z.string().min(1, 'Findings are required'),
  impression: z.string().min(1, 'Impression / Conclusion is required'),
  recommendations: z.string().optional(),
  reportingPhysician: z.string().min(1, 'Reporting physician is required'),
  signature: z.string().optional(),
  reportDate: z.string().optional(),
  hospitalDepartmentStamp: z.string().optional(),
});

type ImagingReportFormData = z.infer<typeof imagingReportSchema>;

interface ImagingResultEntryProps {
  imagingId: string;
  patientId: string;
  onResultSaved?: () => void;
}

const ImagingResultEntry: React.FC<ImagingResultEntryProps> = ({
  imagingId,
  patientId,
  onResultSaved,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const updateMutation = useUpdateImagingReport(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImagingReportFormData>({
    resolver: zodResolver(imagingReportSchema),
    defaultValues: {
      reportDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ImagingReportFormData) => {
    updateMutation.mutate(
      { imagingId, data },
      {
        onSuccess: () => {
          onResultSaved?.();
        },
      },
    );
  };

  return (
    <Card padding="lg" className="bg-surface-low">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-on-surface">
            📋 Enter Imaging Report
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Report No."
                placeholder="Optional internal report number"
                {...register('reportNo')}
              />
              <Input
                label="Report Date"
                type="date"
                error={errors.reportDate?.message}
                {...register('reportDate')}
              />
            </div>

            <Textarea
              label="Findings"
              rows={4}
              placeholder="Describe the imaging findings in detail…"
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

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Reporting Physician"
                placeholder="Radiologist / Physician name"
                error={errors.reportingPhysician?.message}
                {...register('reportingPhysician')}
              />
              <Input
                label="Signature (typed name)"
                placeholder="Typed signature"
                {...register('signature')}
              />
            </div>

            <Input
              label="Hospital / Department Stamp"
              placeholder="Optional"
              {...register('hospitalDepartmentStamp')}
            />

            <Button
              type="submit"
              loading={updateMutation.isPending}
              className="w-full"
            >
              Save Report
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};

export default ImagingResultEntry;