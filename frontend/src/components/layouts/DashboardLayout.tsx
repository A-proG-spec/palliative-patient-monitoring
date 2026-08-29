// src/components/layouts/DashboardLayout.tsx
// Authenticated layout: collapsible sidebar + top bar + main content area.
// Used for all admin and staff pages.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar — mobile only hamburger */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-surface-container-lowest border-b border-border-base shadow-nav shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Open navigation"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-card-title text-on-surface">Palliative Care System</span>
          {/* Role chip */}
          <span className="text-body-sm text-text-secondary capitalize">
            {user?.type === 'admin' ? 'Admin' : (user?.role ?? 'Staff')}
          </span>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-6 h-14 bg-surface-container-lowest border-b border-border-base shadow-nav shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-body-sm font-semibold px-2.5 py-1 rounded-full',
                user?.type === 'admin'
                  ? 'bg-primary-light text-primary'
                  : 'bg-success-bg text-success'
              )}
            >
              {user?.type === 'admin' ? 'Administrator' : (user?.role ?? 'Staff')}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
