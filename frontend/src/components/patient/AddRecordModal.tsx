import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  filterRecordTypesForRole,
  type RecordType,
} from '@/config/recordTypes';
import type { StaffRole } from '@/config/permissions';

// ═════════════════════════════════════════════════════════════
// Single record-type item
// ═════════════════════════════════════════════════════════════

interface RecordTypeItemProps {
  recordType: RecordType;
  patientId: string;
  onSelect: (route: string) => void;
}

const RecordTypeItem: React.FC<RecordTypeItemProps> = ({
  recordType,
  patientId,
  onSelect,
}) => {
  const color = recordType.color || 'text-primary';
  return (
    <button
      type="button"
      onClick={() => onSelect(recordType.route(patientId))}
      className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-low transition-colors group rounded-lg"
    >
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light group-hover:bg-primary group-hover:text-white transition-colors',
          color,
        )}
      >
        {recordType.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
          {recordType.label}
        </p>
        <p className="text-xs text-text-muted leading-relaxed mt-0.5">
          {recordType.description}
        </p>
      </div>
      <ChevronRight
        size={15}
        className="text-outline-variant flex-shrink-0 group-hover:text-primary transition-colors"
      />
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// Add Record Modal
// ═════════════════════════════════════════════════════════════

export interface AddRecordModalProps {
  patientId: string;
  patientName: string;
  currentLocation: 'Home' | 'ReferredHospital';
  userRole: StaffRole;
  onClose: () => void;
  onSelect: (route: string) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  patientId,
  patientName,
  currentLocation,
  userRole,
  onClose,
  onSelect,
}) => {
  const allowedTypes = filterRecordTypesForRole(userRole, currentLocation);

  const clinicalRecords = allowedTypes.filter((r) =>
    ['visit', 'progress-note', 'medication', 'lab', 'imaging'].includes(r.key),
  );
  const nursingRecords = allowedTypes.filter((r) =>
    ['hospice-nursing'].includes(r.key),
  );
  const referralRecords = allowedTypes.filter((r) =>
    ['referral', 'admission'].includes(r.key),
  );

  const hasAnyActions = allowedTypes.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-record-title"
    >
      <div className="w-full max-w-lg bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Plus size={17} className="text-primary" />
            <h2
              id="add-record-title"
              className="text-base font-semibold text-on-surface"
            >
              Add Record
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Select the type of record to add for{' '}
            <span className="font-medium text-on-surface">{patientName}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {!hasAnyActions ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-text-muted">
                You don't have permission to add any records for this patient.
              </p>
            </div>
          ) : (
            <>
              {clinicalRecords.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Clinical
                  </p>
                  {clinicalRecords.map((rt) => (
                    <RecordTypeItem
                      key={rt.key}
                      recordType={rt}
                      patientId={patientId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}

              {clinicalRecords.length > 0 &&
                (nursingRecords.length > 0 ||
                  referralRecords.length > 0) && (
                  <div className="border-t border-border-base my-2 mx-6" />
                )}

              {nursingRecords.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Nursing
                  </p>
                  {nursingRecords.map((rt) => (
                    <RecordTypeItem
                      key={rt.key}
                      recordType={rt}
                      patientId={patientId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}

              {nursingRecords.length > 0 && referralRecords.length > 0 && (
                <div className="border-t border-border-base my-2 mx-6" />
              )}

              {referralRecords.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Referral &amp; Admission
                  </p>
                  {referralRecords.map((rt) => (
                    <RecordTypeItem
                      key={rt.key}
                      recordType={rt}
                      patientId={patientId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-5 pt-2 border-t border-border-base flex-shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRecordModal;