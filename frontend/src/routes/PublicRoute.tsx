// src/routes/PublicRoute.tsx
// Redirects already-authenticated users away from auth pages (/login, /register).

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.type === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
        replace
      />
    );
  }

  return <Outlet />;
};
