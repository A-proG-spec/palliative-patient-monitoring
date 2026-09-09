/**
 * Toast notification system
 * ─────────────────────────
 * Zero dependencies — built on React context + useReducer.
 * Uses the project's existing Tailwind design tokens so toasts
 * look native to the hospital UI.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Patient registered successfully');
 *   toast.error('Something went wrong. Please try again.');
 *   toast.warning('Unsaved changes will be lost.');
 *   toast.info('Your session will expire in 5 minutes.');
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Auto-dismiss delay in ms. Defaults to 4500. Pass 0 to disable. */
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction =
  | { type: 'ADD'; toast: ToastItem }
  | { type: 'REMOVE'; id: string };

// ── Reducer ──────────────────────────────────────────────────────

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      // Cap at 5 visible toasts — oldest drops off
      return {
        toasts: [...state.toasts.slice(-4), action.toast],
      };
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (variant: ToastVariant, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Single toast item component ──────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, {
  wrapper: string;
  icon: string;
  iconEl: React.ReactNode;
}> = {
  success: {
    wrapper: 'bg-surface-lowest border-success/30 shadow-lg',
    icon: 'text-success bg-success/10',
    iconEl: <CheckCircle2 size={17} />,
  },
  error: {
    wrapper: 'bg-surface-lowest border-error/30 shadow-lg',
    icon: 'text-error bg-error-bg',
    iconEl: <XCircle size={17} />,
  },
  warning: {
    wrapper: 'bg-surface-lowest border-warning/30 shadow-lg',
    icon: 'text-warning bg-warning-bg',
    iconEl: <AlertTriangle size={17} />,
  },
  info: {
    wrapper: 'bg-surface-lowest border-primary/20 shadow-lg',
    icon: 'text-primary bg-primary-light',
    iconEl: <Info size={17} />,
  },
};

const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const styles = VARIANT_STYLES[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? 4500;
    if (duration > 0) {
      timerRef.current = setTimeout(() => onRemove(toast.id), duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3.5',
        'animate-slide-in',
        styles.wrapper
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
        styles.icon
      )}>
        {styles.iconEl}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-on-surface leading-snug pt-1">
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-md text-text-muted hover:text-on-surface hover:bg-surface-low transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Toast container ──────────────────────────────────────────────

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={cn(
        // Position: top-right on desktop, top-center on mobile
        'fixed z-[9999] flex flex-col gap-2 p-4',
        'top-4 right-4',
        'sm:top-5 sm:right-5',
        // On small screens cap width to viewport
        'w-[calc(100vw-2rem)] sm:w-auto'
      )}
    >
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ── Provider ─────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { toasts: [] });

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      dispatch({ type: 'ADD', toast: { id, variant, message, duration } });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ── useToast hook ────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }

  const { addToast, removeToast } = ctx;

  return {
    toast: {
      success: (message: string, duration?: number) =>
        addToast('success', message, duration),
      error: (message: string, duration?: number) =>
        addToast('error', message, duration),
      warning: (message: string, duration?: number) =>
        addToast('warning', message, duration),
      info: (message: string, duration?: number) =>
        addToast('info', message, duration),
    },
    removeToast,
  };
}
