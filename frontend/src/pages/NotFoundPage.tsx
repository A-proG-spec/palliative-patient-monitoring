// src/pages/NotFoundPage.tsx
// Route: *  |  No layout

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const homePath = isAuthenticated
    ? user?.type === 'admin'
      ? ROUTES.ADMIN_DASHBOARD
      : ROUTES.DASHBOARD
    : ROUTES.HOME;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-[96px] font-extrabold text-primary leading-none mb-2">
          404
        </p>
        <h1 className="text-heading-1 text-on-surface mb-3">Page Not Found</h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to={homePath}>
            <Button variant="primary">Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
