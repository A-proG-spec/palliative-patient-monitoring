import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AdminDeleteButtonProps {
  /** Human-readable resource name, e.g. "medication", "visit". */
  resourceLabel: string;
  /** Optional — used in the confirm dialog body. */
  resourceIdentifier?: string;
  /** Called with the optional reason when the admin confirms. */
  onConfirm: (reason?: string) => void;
  /** Disables the button and shows a spinner. */
  isPending?: boolean;
  /** Optional className passthrough. */
  className?: string;
  /** Show only icon (for compact list rows). */
  compact?: boolean;
}

export const AdminDeleteButton: React.FC<AdminDeleteButtonProps> = ({
  resourceLabel,
  resourceIdentifier,
  onConfirm,
  isPending,
  className,
  compact,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setOpen(false);
    setReason('');
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className={cn(compact && 'h-8 w-8 p-0', className)}
        leftIcon={!compact ? <Trash2 size={13} /> : undefined}
        onClick={() => setOpen(true)}
        title={`Delete ${resourceLabel}`}
      >
        {compact ? <Trash2 size={13} /> : `Delete ${resourceLabel}`}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-error mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Delete this {resourceLabel.toLowerCase()}?
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {resourceIdentifier
                ? `"${resourceIdentifier}" will be soft-deleted.`
                : `This ${resourceLabel.toLowerCase()} will be soft-deleted.`}{' '}
              Clinical records stay intact and the entry can be restored later.
            </p>

            <label className="block text-sm font-medium text-on-surface mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason recorded for audit trail…"
              rows={3}
              maxLength={500}
              className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary mb-5 resize-y"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setReason('');
                }}
                disabled={isPending}
                className="flex-1 rounded-xl border border-border-base bg-surface-lowest px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDeleteButton;