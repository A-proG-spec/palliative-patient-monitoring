// src/components/layouts/PublicLayout.tsx
// Layout for /verify-email and /resend-verification (no auth required, no sidebar).

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/common/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
