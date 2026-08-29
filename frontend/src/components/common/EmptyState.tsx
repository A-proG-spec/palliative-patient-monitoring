// src/components/common/EmptyState.tsx

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-text-muted">{icon}</div>
      )}
      {!icon && (
        <div className="mb-4 h-16 w-16 rounded-full bg-surface-container flex items-center justify-center">
          <svg
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-3-3v6M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
        </div>
      )}
      <h3 className="text-heading-3 text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant mb-6 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
