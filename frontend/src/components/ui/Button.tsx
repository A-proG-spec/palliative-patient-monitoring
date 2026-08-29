// src/components/ui/Button.tsx
// Border-radius: radius-lg = 6px (per UI foundation spec)

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50',
  secondary:
    'bg-secondary text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim focus:ring-2 focus:ring-secondary focus:ring-offset-1 disabled:opacity-50',
  outline:
    'border border-border-base bg-surface-container-lowest text-on-surface hover:bg-surface-container-low focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50',
  ghost:
    'bg-transparent text-primary hover:bg-primary-light focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50',
  destructive:
    'bg-error text-white hover:bg-red-700 focus:ring-2 focus:ring-error focus:ring-offset-1 disabled:opacity-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-body-sm',
  md: 'px-4 py-2 text-body-md',
  lg: 'px-6 py-2.5 text-body-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-semibold',
          'rounded-lg',          // radius-lg = 6px
          'transition-colors duration-150',
          'outline-none',
          'cursor-pointer disabled:cursor-not-allowed',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
