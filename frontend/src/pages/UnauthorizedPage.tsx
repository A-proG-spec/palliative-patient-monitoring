import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth.store';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getDefaultRedirect = () => {
    if (user?.type === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-error-bg">
              <Shield className="h-10 w-10 text-error" />
            </div>
          </div>
          <CardTitle className="text-2xl text-error">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-surface-low rounded-lg p-4 text-sm text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-on-surface">Logged in as:</span>
              <span>{user?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-on-surface">Role:</span>
              <span className="capitalize">{user?.type || 'Unknown'}</span>
            </div>
            {user?.type === 'staff' && (
              <p className="mt-2 text-text-muted text-xs">
                Staff members can access patient management features from the dashboard.
              </p>
            )}
            {user?.type === 'admin' && (
              <p className="mt-2 text-text-muted text-xs">
                Administrators have full system access.
              </p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => navigate(getDefaultRedirect())}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Return to {user?.type === 'admin' ? 'Admin' : 'Staff'} Dashboard
          </Button>

          <p className="text-xs text-text-muted">
            If you believe this is an error, please contact your system administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;