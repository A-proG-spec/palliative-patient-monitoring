import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-[#001560] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm hover:shadow-md hover:-translate-y-px',
  secondary:
    'bg-surface-container text-on-surface hover:bg-surface-high active:bg-surface-highest border border-border-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  outline:
    'border border-border-base bg-transparent text-on-surface hover:bg-surface-low active:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-on-surface-variant hover:bg-surface-low active:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  destructive:
    'bg-error text-white hover:bg-[#c94233] active:bg-[#b33828] focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 shadow-sm',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
  icon: 'h-9 w-9 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
