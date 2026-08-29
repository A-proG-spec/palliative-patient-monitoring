// src/components/ui/Textarea.tsx
// Border-radius: radius-lg = 6px

import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, errorMessage, className, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-3 py-2',
            'bg-surface-container-lowest text-on-surface',
            'border rounded-lg',
            'text-body-md',
            'placeholder:text-text-muted',
            'outline-none transition-colors duration-150 resize-y',
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

Textarea.displayName = 'Textarea';
