// src/components/common/Sidebar.tsx
// Admin sidebar: Dashboard, Patients, Staff Management, Referrals, Reports, Settings
// Staff sidebar:  Dashboard, Patients, Visits
// Per frontend-specification/02-admin.md and frontend-specification/09-staff-dashboard.md

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { getInitials, cn } from '@/lib/utils';

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const Icon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
  <svg
    className={cn('h-5 w-5 shrink-0', className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// ─── Nav item type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  iconPath: string;
  badge?: number;
}

// ─── Admin nav ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  pendingStaff?: number;
  pendingReferrals?: number;
  totalPatients?: number;
}

const ADMIN_NAV = (badges: AdminSidebarProps): NavItem[] => [
  {
    label: 'Dashboard',
    to: ROUTES.ADMIN_DASHBOARD,
    iconPath:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
    badge:
      (badges.pendingStaff ?? 0) + (badges.pendingReferrals ?? 0) || undefined,
  },
  {
    label: 'Patients',
    to: ROUTES.ADMIN_PATIENTS,
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
    badge: badges.totalPatients,
  },
  {
    label: 'Staff Management',
    to: ROUTES.ADMIN_STAFF,
    iconPath:
      'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    badge: badges.pendingStaff,
  },
  {
    label: 'Referrals',
    to: ROUTES.ADMIN_REFERRALS,
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    badge: badges.pendingReferrals,
  },
  {
    label: 'Reports',
    to: ROUTES.ADMIN_REPORTS,
    iconPath:
      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    label: 'Settings',
    to: ROUTES.ADMIN_SETTINGS,
    iconPath:
      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

// ─── Staff nav ────────────────────────────────────────────────────────────────

interface StaffSidebarProps {
  todayVisits?: number;
  totalPatients?: number;
}

const STAFF_NAV = (badges: StaffSidebarProps): NavItem[] => [
  {
    label: 'Dashboard',
    to: ROUTES.DASHBOARD,
    iconPath:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
    badge: badges.todayVisits,
  },
  {
    label: 'Patients',
    to: ROUTES.PATIENTS,
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
    badge: badges.totalPatients,
  },
  {
    label: 'Visits',
    to: ROUTES.PATIENTS,          // Links to patients list — user picks patient first
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
];

// ─── Shared NavItem component ─────────────────────────────────────────────────

const SidebarNavItem: React.FC<{ item: NavItem; onClick?: () => void }> = ({ item, onClick }) => (
  <NavLink
    to={item.to}
    end={item.to === ROUTES.ADMIN_DASHBOARD || item.to === ROUTES.DASHBOARD}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-md font-medium',
        'transition-colors duration-150',
        isActive
          ? 'bg-primary-light text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          path={item.iconPath}
          className={isActive ? 'text-primary' : 'text-on-surface-variant'}
        />
        <span className="flex-1">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-label-caps font-semibold">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

interface SidebarProps {
  adminBadges?: AdminSidebarProps;
  staffBadges?: StaffSidebarProps;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  adminBadges = {},
  staffBadges = {},
  mobileOpen = false,
  onMobileClose,
}) => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const isAdmin = user?.type === 'admin';
  const navItems = isAdmin ? ADMIN_NAV(adminBadges) : STAFF_NAV(staffBadges);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate(ROUTES.LOGIN),
    });
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-surface-container-lowest border-r border-border-base">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-base">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v8m-4-4h8M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          <span className="text-card-title text-on-surface leading-tight">
            Palliative Care System
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <SidebarNavItem key={item.to + item.label} item={item} onClick={onMobileClose} />
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-border-base">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-body-sm font-semibold shrink-0">
            {getInitials(user?.name ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-on-surface truncate">
              {user?.name}
            </p>
            <p className="text-body-sm text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-error hover:bg-error-bg transition-colors duration-150"
        >
          <Icon
            path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            className="text-error"
          />
          {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-full">{sidebarContent}</div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
