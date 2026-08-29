// src/components/ui/Badge.tsx
// Badges use radius-full (9999px) per spec exception rule.

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:    'bg-surface-container text-on-surface-variant',
  primary:    'bg-primary-light text-primary',
  success:    'bg-success-bg text-success',
  warning:    'bg-warning-bg text-warning',
  error:      'bg-error-bg text-error',
  secondary:  'bg-secondary text-on-secondary-fixed-variant',
  outline:    'border border-border-base bg-transparent text-on-surface-variant',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'rounded-full',           // radius-full = 9999px (badge exception per spec)
        'text-body-sm font-semibold',
        'whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
