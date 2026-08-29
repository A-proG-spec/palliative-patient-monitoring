// src/pages/admin/SettingsPage.tsx
// Route: /admin/settings  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)
// Per spec: placeholder for future feature.

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-5">
      <h1 className="text-heading-1 text-on-surface">Settings</h1>

      <Card>
        <CardHeader><CardTitle>System Information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm max-w-md">
            <dt className="text-on-surface-variant font-semibold">Application</dt>
            <dd className="text-on-surface">Palliative Care System</dd>
            <dt className="text-on-surface-variant font-semibold">Admin</dt>
            <dd className="text-on-surface">{user?.name}</dd>
            <dt className="text-on-surface-variant font-semibold">Email</dt>
            <dd className="text-on-surface">{user?.email}</dd>
            <dt className="text-on-surface-variant font-semibold">Role</dt>
            <dd className="text-on-surface capitalize">{user?.type}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Additional Settings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-body-md text-on-surface-variant">
            Additional system settings will be available in a future release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
