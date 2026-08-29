// src/components/ui/Card.tsx
// Cards use radius-xl = 8px per spec.

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={cn(
      'bg-surface-container-lowest',
      'rounded-xl',               // radius-xl = 8px
      'border border-border-base',
      'shadow-card',
      className
    )}
  >
    {children}
  </div>
);

// ─── CardHeader ──────────────────────────────────────────────────────────────

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>
);

// ─── CardTitle ───────────────────────────────────────────────────────────────

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={cn('text-card-title text-on-surface', className)}>{children}</h3>
);

// ─── CardDescription ─────────────────────────────────────────────────────────

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-body-sm text-on-surface-variant mt-1', className)}>{children}</p>
);

// ─── CardContent ─────────────────────────────────────────────────────────────

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('px-5 pb-5', className)}>{children}</div>
);

// ─── CardFooter ──────────────────────────────────────────────────────────────

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-5 py-4 border-t border-border-base',
      'flex items-center justify-end gap-3',
      className
    )}
  >
    {children}
  </div>
);
