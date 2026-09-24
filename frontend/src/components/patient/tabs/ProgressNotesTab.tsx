import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { hasPermission, type StaffRole } from '@/config/permissions';

interface ProgressNotesTabProps {
  patientId: string;
  userRole: StaffRole;
  onSelectNote: (noteId: string) => void;
}

export const ProgressNotesTab: React.FC<ProgressNotesTabProps> = ({
  patientId,
  userRole,
  onSelectNote,
}) => {
  const navigate = useNavigate();
  const { data } = useProgressNotes(patientId);
  const progressNotes = data?.items ?? [];

  if (progressNotes.length === 0) {
    return (
      <EmptyState
        title="No progress notes recorded"
        description="Progress notes are recorded for hospitalised patients. Record the first one."
        {...(hasPermission(userRole, 'canCreateProgressNote') && {
          actionLabel: 'Record Progress Note',
          onAction: () => navigate(`/patients/${patientId}/progress-note/new`),
        })}
      />
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border-base">
      {progressNotes.map((note) => (
        <button
          key={note.id}
          type="button"
          className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
          onClick={() => onSelectNote(String(note.id))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectNote(String(note.id));
            }
          }}
          tabIndex={0}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-on-surface whitespace-nowrap">
                {formatDate(note.createdAt)}
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-secondary truncate">
                {note.attendingClinician || '—'}
              </span>
              {note.allSigned && (
                <>
                  <span className="text-xs text-text-muted">·</span>
                  <Badge
                    variant="success"
                    className="text-[10px] px-1.5 py-0.5"
                  >
                    All Signed
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-text-secondary truncate">
              {note.generalCondition || 'No condition summary recorded'}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-outline-variant flex-shrink-0"
          />
        </button>
      ))}
    </div>
  );
};

export default ProgressNotesTab;
