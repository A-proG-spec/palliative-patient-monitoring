import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={user.type === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
