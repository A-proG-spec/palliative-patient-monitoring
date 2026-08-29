// src/components/ui/Select.tsx
// Border-radius: radius-lg = 6px

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, errorMessage, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2',
            'bg-surface-container-lowest text-on-surface',
            'border rounded-lg',
            'text-body-md',
            'outline-none transition-colors duration-150',
            'appearance-none cursor-pointer',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:bg-surface-container-low disabled:text-text-muted disabled:cursor-not-allowed',
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border-base',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && errorMessage && (
          <p className="mt-1 text-body-sm text-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
