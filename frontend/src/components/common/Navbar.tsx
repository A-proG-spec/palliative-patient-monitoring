// src/components/common/Navbar.tsx
// Public navigation bar used on the landing page.

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest shadow-nav border-b border-border-base">
      <div className="max-w-container-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
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
          <span className="text-card-title text-on-surface">Palliative Care System</span>
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="sm">
              Register
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
