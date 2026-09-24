import React from 'react';
import { cn } from '@/lib/utils';

export type PatientTab =
  | 'Visits'
  | 'Progress Notes'
  | 'Hospice Nursing'
  | 'Medications'
  | 'Labs'
  | 'Imaging'
  | 'Referrals'
  | 'Admissions';

interface PatientTabsProps {
  tabs: PatientTab[];
  activeTab: PatientTab;
  counts: Record<PatientTab, number>;
  onTabChange: (tab: PatientTab) => void;
}

export const PatientTabs: React.FC<PatientTabsProps> = ({
  tabs,
  activeTab,
  counts,
  onTabChange,
}) => (
  <div className="flex border-b border-border-base overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        className={cn(
          'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0',
          activeTab === tab
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low',
        )}
      >
        {tab}
        {counts[tab] > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-text-secondary px-1">
            {counts[tab]}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default PatientTabs;