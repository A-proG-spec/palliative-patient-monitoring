// src/components/patient/PatientTabs.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

interface TabActionConfig {
  label: string;
  path: (patientId: string) => string;
  permission: string;
}

const TAB_ACTIONS: Partial<Record<PatientTab, TabActionConfig>> = {
  Visits: {
    label: 'Add Visit',
    path: (id) => `/patients/${id}/visits`,
    permission: 'canRecordVisit',
  },
  'Progress Notes': {
    label: 'Add Progress Note',
    path: (id) => `/patients/${id}/progress-note/new`,
    permission: 'canCreateProgressNote',
  },
  'Hospice Nursing': {
    label: 'Add Assessment',
    path: (id) => `/patients/${id}/hospice-nursing`,
    permission: 'canRecordHospiceNursing',
  },
  Medications: {
    label: 'Order Medication',
    path: (id) => `/patients/${id}/medications`,
    permission: 'canOrderMedication',
  },
  Labs: {
    label: 'Order Lab Test',
    path: (id) => `/patients/${id}/labs`,
    permission: 'canOrderLab',
  },
  Imaging: {
    label: 'Order Imaging',
    path: (id) => `/patients/${id}/imaging`,
    permission: 'canOrderImaging',
  },
  Referrals: {
    label: 'Request Referral',
    path: (id) => `/patients/${id}/referrals`,
    permission: 'canCreateReferral',
  },
  Admissions: {
    label: 'Record Admission',
    path: (id) => `/patients/${id}/admissions`,
    permission: 'canRecordAdmission',
  },
};

interface PatientTabsProps {
  tabs: PatientTab[];
  activeTab: PatientTab;
  counts: Record<PatientTab, number>;
  onTabChange: (tab: PatientTab) => void;
  isAdmin?: boolean;
  /** Patient id — needed to build the Add New destination path. */
  patientId?: string;
  /** Whether the patient is Active (Add New is hidden for discharged). */
  patientActive?: boolean;
  /** Called when the inline "Add New" button is clicked. */
  onAddNew?: (path: string) => void;
  /** Permission callback supplied by the parent. */
  canDo?: (permission: string) => boolean;
}

export const PatientTabs: React.FC<PatientTabsProps> = ({
  tabs,
  activeTab,
  counts,
  onTabChange,
  isAdmin = false,
  patientId,
  patientActive = false,
  onAddNew,
  canDo,
}) => {
  const currentAction = patientId ? TAB_ACTIONS[activeTab] : undefined;

  const allowed = currentAction
    ? isAdmin || (canDo ? canDo(currentAction.permission) : false)
    : false;

  const showAddNew =
    !!currentAction && patientActive && allowed && !!onAddNew;

  return (
    <div
      className="flex items-center justify-between border-b border-border-base"
      data-admin-view={isAdmin || undefined}
    >
      {/* Tab strip */}
      <div className="flex overflow-x-auto flex-1">
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

      {/* Inline Add New for the currently active tab */}
      {showAddNew && (
        <div className="flex-shrink-0 px-4 py-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus size={13} />}
            onClick={() => onAddNew!(currentAction!.path(patientId!))}
          >
            {currentAction!.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientTabs;