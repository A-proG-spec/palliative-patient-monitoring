// src/components/layouts/AuthLayout.tsx
// Layout for /login and /register — centred card on branded background.

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar with logo */}
      <header className="px-6 py-4 border-b border-border-base bg-surface-container-lowest">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 no-underline"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
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
          <span className="text-card-title text-on-surface">Palliative Care System</span>
        </Link>
      </header>

      {/* Centred form area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="text-center py-4 text-body-sm text-text-muted">
        © {new Date().getFullYear()} Palliative Care System
      </footer>
    </div>
  );
};
