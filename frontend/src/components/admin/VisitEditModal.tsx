import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { formatDate } from '@/lib/utils';

const updateVisitSchema = z.object({
  painScore: z.number().min(0).max(10).optional(),
  outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']).optional(),
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']).optional(),
  ppsScore: z.number().min(0).max(100).optional(),
  kpsScore: z.number().min(0).max(100).optional(),
  visitDate: z.string().optional(),
  timeStarted: z.string().optional(),
  timeEnded: z.string().optional(),
});

type UpdateVisitFormData = z.infer<typeof updateVisitSchema>;

interface VisitEditModalProps {
  open: boolean;
  visitId: string;
  patientName: string;
  visitData: any;
  onClose: () => void;
  onSave: (data: UpdateVisitFormData) => void;
  isSubmitting?: boolean;
  editHistory?: any[];
}

export const VisitEditModal: React.FC<VisitEditModalProps> = ({
  open,
  visitId,
  patientName,
  visitData,
  onClose,
  onSave,
  isSubmitting,
  editHistory,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateVisitFormData>({
    resolver: zodResolver(updateVisitSchema),
    defaultValues: {
      visitDate: visitData?.visitDate?.split('T')[0] || '',
      timeStarted: visitData?.timeStarted || '',
      timeEnded: visitData?.timeEnded || '',
      overallStatus: visitData?.overallStatus || '',
      painScore: visitData?.painScore || 0,
      ppsScore: visitData?.ppsScore || 0,
      kpsScore: visitData?.kpsScore || 0,
      outcome: visitData?.outcome || '',
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Edit Visit Record - {patientName}
            </h2>
            <p className="text-sm text-text-secondary">{formatDate(visitData?.visitDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Visit Date" type="date" {...register('visitDate')} />
            <Input label="Visit Type" value={visitData?.visitType || ''} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Time Started" type="time" {...register('timeStarted')} />
            <Input label="Time Ended" type="time" {...register('timeEnded')} />
          </div>

          <Select
            label="Overall Status"
            options={[
              { value: 'Stable', label: 'Stable' },
              { value: 'Deteriorating', label: 'Deteriorating' },
              { value: 'Critical', label: 'Critical' },
              { value: 'BedBound', label: 'Bed Bound' },
            ]}
            {...register('overallStatus')}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Pain Score (0-10)"
              type="number"
              min={0}
              max={10}
              {...register('painScore', { valueAsNumber: true })}
              error={errors.painScore?.message}
            />
            <Input
              label="PPS Score (0-100)"
              type="number"
              min={0}
              max={100}
              {...register('ppsScore', { valueAsNumber: true })}
              error={errors.ppsScore?.message}
            />
            <Input
              label="KPS Score (0-100)"
              type="number"
              min={0}
              max={100}
              {...register('kpsScore', { valueAsNumber: true })}
              error={errors.kpsScore?.message}
            />
          </div>

          <Select
            label="Outcome"
            options={[
              { value: 'Stable', label: 'Stable' },
              { value: 'SymptomsImproved', label: 'Symptoms Improved' },
              { value: 'SymptomsUnchanged', label: 'Symptoms Unchanged' },
              { value: 'SymptomsWorsened', label: 'Symptoms Worsened' },
              { value: 'ReferredToFacility', label: 'Referred to Facility' },
              { value: 'Deceased', label: 'Deceased' },
            ]}
            {...register('outcome')}
          />

          {/* Audit Trail */}
          {editHistory && editHistory.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-on-surface mb-2">Edit History</p>
              <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-low p-3 rounded-lg">
                {editHistory.map((entry, i) => (
                  <div key={i} className="text-sm border-b border-border-base pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface">{entry.editedBy?.name || 'Admin'}</span>
                      <span className="text-text-muted">{formatDate(entry.editedAt)}</span>
                    </div>
                    {entry.changes?.map((change: any, j: number) => (
                      <div key={j} className="text-xs text-text-muted">
                        {change.field}: {String(change.from)} → {String(change.to)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-base flex-shrink-0">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            loading={isSubmitting}
            onClick={handleSubmit(onSave)}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};