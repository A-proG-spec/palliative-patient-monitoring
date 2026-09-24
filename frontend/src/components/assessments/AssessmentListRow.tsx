import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface AssessmentListRowProps {
  onClick: () => void;
  icon: React.ReactNode;
  iconBgClass: string;
  date: string;
  assessmentType: string;
  /** Rendered next to the badge — optional summary badges. */
  badges?: React.ReactNode;
  /** One-line summary under the header row. */
  summary: string;
  isDeleted?: boolean;
}

export const AssessmentListRow: React.FC<AssessmentListRowProps> = ({
  onClick,
  icon,
  iconBgClass,
  date,
  assessmentType,
  badges,
  summary,
  isDeleted,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-low transition-colors"
  >
    <div
      className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconBgClass}`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-medium text-on-surface">
          {formatDate(date)}
        </p>
        <Badge variant="secondary">{assessmentType}</Badge>
        {badges}
        {isDeleted && <Badge variant="error">Deleted</Badge>}
      </div>
      <p className="text-xs text-text-muted mt-1 truncate">{summary}</p>
    </div>
    <ChevronRight size={16} className="text-outline-variant flex-shrink-0" />
  </button>
);

export default AssessmentListRow;