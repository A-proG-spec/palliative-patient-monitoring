import React from 'react';
import { Check, AlertCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  DischargeSectionKey,
  DischargeSectionDef,
  SectionState,
} from '@/hooks/useDischargeFormState';

interface DischargeSectionNavProps {
  sections: DischargeSectionDef[];
  activeKey: DischargeSectionKey;
  states: Record<DischargeSectionKey, SectionState>;
  onSelect: (key: DischargeSectionKey) => void;
  progress: { completed: number; total: number };
}

export const DischargeSectionNav: React.FC<DischargeSectionNavProps> = ({
  sections,
  activeKey,
  states,
  onSelect,
  progress,
}) => {
  const pct = Math.round((progress.completed / progress.total) * 100);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border-base bg-surface-low min-h-0"
      aria-label="Discharge form sections"
    >
      {/* Progress summary — fixed at the top of the sidebar */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-border-base">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
          Progress
        </p>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold text-on-surface">
            {progress.completed} of {progress.total}
          </span>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Nav list — scrolls internally when the sidebar has a bounded height */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-2">
        {sections.map((section) => {
          const state = states[section.key];
          const isActive = activeKey === section.key;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSelect(section.key)}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors group',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface',
              )}
            >
              <span className="flex-shrink-0 mt-0.5">
                <StatusIcon state={state} isActive={isActive} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-mono text-[10px] rounded px-1 py-0.5 leading-none',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-container text-text-muted',
                    )}
                  >
                    {section.letter}
                  </span>
                  <span
                    className={cn(
                      'text-sm truncate',
                      isActive ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {section.label}
                  </span>
                </span>
                <span className="block text-[11px] text-text-muted mt-0.5 truncate">
                  {section.description}
                </span>
              </span>

              <ChevronRight
                size={14}
                className={cn(
                  'flex-shrink-0 mt-0.5 transition-opacity',
                  isActive
                    ? 'opacity-100 text-primary'
                    : 'opacity-0 group-hover:opacity-60',
                )}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

// ── Status icon component ──
const StatusIcon: React.FC<{ state: SectionState; isActive: boolean }> = ({
  state,
  isActive,
}) => {
  if (state === 'complete') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-success">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error-bg text-error">
        <AlertCircle size={12} strokeWidth={2.5} />
      </span>
    );
  }
  if (state === 'partial') {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Circle
          size={16}
          className={cn('text-warning', isActive ? 'opacity-100' : 'opacity-80')}
          strokeWidth={2}
        />
        <Circle
          size={6}
          className="absolute text-warning"
          fill="currentColor"
          strokeWidth={0}
        />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <Circle
        size={14}
        className={isActive ? 'text-primary/40' : 'text-outline-variant'}
        strokeWidth={2}
      />
    </span>
  );
};

export default DischargeSectionNav;