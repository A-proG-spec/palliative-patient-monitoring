import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Explicit path to navigate to. If omitted, goes back in browser history. */
  to?: string;
  label?: string;
  className?: string;
}


export const BackButton: React.FC<BackButtonProps> = ({ to, label, className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedTo = useMemo(() => {
    if (!to) return undefined;

    const isAdminContext = location.pathname.startsWith('/admin');
    const isStaffPath = !to.startsWith('/admin');

    if (isAdminContext && isStaffPath) {
      // `/patients/10` → `/admin/patients/10`
      return `/admin${to.startsWith('/') ? to : `/${to}`}`;
    }
    return to;
  }, [to, location.pathname]);

  const handleClick = () => {
    if (resolvedTo) navigate(resolvedTo);
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

export default BackButton;