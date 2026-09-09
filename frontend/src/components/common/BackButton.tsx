import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Explicit path to navigate to. If omitted, goes back in browser history. */
  to?: string;
  label?: string;
  className?: string;
}

/**
 * Consistent back-navigation button used across every page.
 * Shows an arrow with an optional label.  When `to` is provided it
 * navigates to that route; otherwise it calls navigate(-1) so the
 * user returns to wherever they came from.
 */
export const BackButton: React.FC<BackButtonProps> = ({ to, label, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium',
        'text-on-surface-variant hover:text-primary hover:bg-primary-light',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        className
      )}
      aria-label={label ? `Back to ${label}` : 'Go back'}
    >
      <ArrowLeft size={16} />
      {label && <span>{label}</span>}
    </button>
  );
};
