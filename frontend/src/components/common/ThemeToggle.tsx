import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, type LucideProps } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

interface Option {
  mode: ThemeMode;
  Icon: LucideIcon;
  label: string;
}

const OPTIONS: Option[] = [
  { mode: 'light',  Icon: Sun,     label: 'Light'  },
  { mode: 'dark',   Icon: Moon,    label: 'Dark'   },
  { mode: 'system', Icon: Monitor, label: 'System' },
];

/**
 * ThemeToggle — shows the current mode icon.
 * Click cycles through light → dark → system, or opens a mini dropdown.
 */
export const ThemeToggle: React.FC<{ variant?: 'cycle' | 'dropdown' }> = ({
  variant = 'dropdown',
}) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.mode === theme) ?? OPTIONS[0];
  const CurrentIcon = current.Icon;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (variant === 'cycle') {
    const next = OPTIONS[(OPTIONS.findIndex((o) => o.mode === theme) + 1) % OPTIONS.length];
    return (
      <button
        onClick={() => setTheme(next.mode)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
        aria-label={`Switch to ${next.label} theme`}
        title={`Current: ${current.label}. Click for ${next.label}`}
      >
        <CurrentIcon size={16} />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
          open
            ? 'bg-primary-light text-primary'
            : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
        )}
        aria-label="Theme selector"
        aria-expanded={open}
        title={`Theme: ${current.label}`}
      >
        <CurrentIcon size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-border-base bg-surface-lowest shadow-lg overflow-hidden">
          {OPTIONS.map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => { setTheme(mode); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                theme === mode
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              )}
            >
              <Icon size={14} />
              {label}
              {theme === mode && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Inline theme selector row — for use in Profile Appearance section.
 */
export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map(({ mode, Icon, label }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
            theme === mode
              ? 'border-primary bg-primary-light text-primary shadow-sm'
              : 'border-border-base bg-surface-lowest text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
          )}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
};
