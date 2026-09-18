import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from '@/routes/index';
import { useCurrentUser } from '@/hooks/useAuth';
import '@/styles/globals.css';

/**
 * AuthInitializer — mounts useCurrentUser() exactly once at the app root.
 *
 * This is what calls setInitialized() after the /auth/me check settles
 * (or immediately when there is no token), clearing isInitializing in
 * the auth store so RoleGuard stops showing the infinite PageLoader.
 *
 * Must live inside BrowserRouter + QueryClientProvider so that
 * useQuery and useNavigate both work correctly.
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useCurrentUser();
  return <>{children}</>;
};

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthInitializer>
              <AppRoutes />
            </AuthInitializer>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
