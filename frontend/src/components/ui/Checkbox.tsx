import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label htmlFor={checkId} className="flex items-start gap-2.5 cursor-pointer group">
        <input
          ref={ref}
          id={checkId}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-border-base text-primary',
            'focus:ring-2 focus:ring-primary focus:ring-offset-1',
            'transition-colors cursor-pointer',
            'checked:bg-primary checked:border-primary',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <span className="flex flex-col">
            {label && <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{label}</span>}
            {description && <span className="text-xs text-text-muted">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
