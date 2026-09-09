import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'secondary';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-container text-on-surface-variant border border-border-base',
  primary: 'bg-primary-light text-primary border border-primary/20',
  success: 'bg-success-bg text-success border border-success/20',
  warning: 'bg-warning-bg text-warning border border-warning/20',
  error: 'bg-error-bg text-error border border-error/20',
  secondary: 'bg-surface-container text-text-secondary border border-border-base',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', dot, children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', {
            'bg-on-surface-variant': variant === 'default',
            'bg-primary': variant === 'primary',
            'bg-success': variant === 'success',
            'bg-warning': variant === 'warning',
            'bg-error': variant === 'error',
            'bg-text-secondary': variant === 'secondary',
          })}
        />
      )}
      {children}
    </span>
  );
};
