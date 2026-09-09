import React from 'react';
import { Settings, Info, Shield, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { APP_NAME } from '@/lib/config';

const SettingsPage: React.FC = () => (
  <div className="space-y-6 max-w-3xl">
    <div>
      <BackButton to="/admin" label="Dashboard" />
      <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
      <p className="text-sm text-text-secondary">System configuration and information</p>
    </div>

    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2"><Info size={16} className="text-primary" /><CardTitle>System Information</CardTitle></div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {[
          { label: 'Application', value: APP_NAME },
          { label: 'Institution', value: 'Yekatit 12 Hospital Medical College (Y12HMC)' },
          { label: 'Version', value: '1.0.0' },
          { label: 'Environment', value: import.meta.env.VITE_APP_ENV || 'development' },
          { label: 'Mock Mode', value: import.meta.env.VITE_USE_MOCK === 'true' ? 'Enabled' : 'Disabled' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-1 border-b border-border-base last:border-0">
            <span className="text-text-muted">{label}</span>
            <span className="text-on-surface font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2"><Shield size={16} className="text-primary" /><CardTitle>Security</CardTitle></div>
      </CardHeader>
      <CardContent className="text-sm text-text-secondary space-y-2">
        <p>✓ JWT authentication with Bearer token</p>
        <p>✓ Role-based access control (Admin / Staff)</p>
        <p>✓ Email verification required before login</p>
        <p>✓ Admin approval required for staff accounts</p>
        <p>✓ Patient records are immutable (no edit UI)</p>
      </CardContent>
    </Card>

    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2"><Database size={16} className="text-primary" /><CardTitle>Data Model</CardTitle></div>
      </CardHeader>
      <CardContent className="text-sm text-text-secondary space-y-1">
        <p>Entities: Admin, Staff, Patient, HomeVisit, Medication, LaboratoryTest, Referral, HospitalAdmission, Notification</p>
        <p className="mt-2">Database: MongoDB via Mongoose ODM</p>
      </CardContent>
    </Card>
  </div>
);

export default SettingsPage;
