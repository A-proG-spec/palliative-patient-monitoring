// src/components/common/LoadingSpinner.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading…',
}) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={label}
    >
      <svg
        className={cn('animate-spin text-primary', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
        />
      </svg>
      {size === 'lg' && (
        <span className="text-body-sm text-text-muted">{label}</span>
      )}
    </div>
  );
};

/** Full-page loading overlay */
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" label="Loading…" />
  </div>
);
