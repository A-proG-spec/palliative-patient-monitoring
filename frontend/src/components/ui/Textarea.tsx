import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const textareaId = id || (label && typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full rounded-lg border bg-surface-lowest px-3 py-2 text-sm text-on-surface',
            'placeholder:text-text-muted resize-y min-h-[80px]',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary',
            error
              ? 'border-error focus:ring-error'
              : 'border-border-base hover:border-outline-variant',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-low',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
