// src/components/ui/Label.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ required, className, children, ...props }) => {
  return (
    <label
      className={cn(
        'block text-body-sm font-semibold text-on-surface mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-error" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
};
