import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from '@/routes/index';
import '@/styles/globals.css';

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
