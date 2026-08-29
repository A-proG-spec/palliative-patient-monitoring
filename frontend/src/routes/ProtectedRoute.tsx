// src/routes/ProtectedRoute.tsx
// Protects routes that require authentication.
// Admin trying to access staff routes → redirect to /admin
// Staff trying to access admin routes → redirect to /dashboard

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Admin must stay in /admin/*
  if (
    user?.type === 'staff' &&
    location.pathname.startsWith('/admin')
  ) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Staff must stay out of /admin/*
  if (
    user?.type === 'admin' &&
    (location.pathname === ROUTES.DASHBOARD ||
      location.pathname.startsWith('/patients') ||
      location.pathname === '/')
  ) {
    // Only redirect from explicit staff-only top-level paths
    if (
      location.pathname === ROUTES.DASHBOARD ||
      location.pathname.startsWith('/patients')
    ) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
  }

  return <Outlet />;
};
