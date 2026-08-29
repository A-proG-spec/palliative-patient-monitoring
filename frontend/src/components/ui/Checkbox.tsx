// src/components/ui/Checkbox.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded',
            'border-border-base',
            'text-primary',
            'focus:ring-2 focus:ring-primary/20 focus:ring-offset-0',
            'cursor-pointer disabled:cursor-not-allowed',
            'accent-primary'
          )}
          {...props}
        />
        {label && (
          <span className="text-body-md text-on-surface select-none">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
