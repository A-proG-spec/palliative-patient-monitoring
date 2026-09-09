import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary-light mb-6">
          <Heart size={36} className="text-primary" />
        </div>
        <h1 className="text-6xl font-extrabold text-primary mb-3">404</h1>
        <h2 className="text-xl font-semibold text-on-surface mb-3">Page not found</h2>
        <p className="text-text-secondary text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
          <Button onClick={() => {
            if (isAuthenticated && user) {
              navigate(user.type === 'admin' ? '/admin' : '/dashboard');
            } else {
              navigate('/');
            }
          }}>
            {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
