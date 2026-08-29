// src/components/ui/Input.tsx
// Border-radius: radius-lg = 6px; focus border: primary #002395

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, errorMessage, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2',
            'bg-surface-container-lowest text-on-surface',
            'border rounded-lg',          // radius-lg = 6px
            'text-body-md',
            'placeholder:text-text-muted',
            'outline-none transition-colors duration-150',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:bg-surface-container-low disabled:text-text-muted disabled:cursor-not-allowed',
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border-base',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-body-sm text-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
