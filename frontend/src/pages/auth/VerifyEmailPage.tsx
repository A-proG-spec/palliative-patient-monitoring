import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useVerifyEmail } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token) verifyMutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <XCircle size={40} className="text-error mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Verification Token</h2>
            <p className="text-sm text-text-secondary mb-5">No token was found in the link.</p>
            <Link to="/resend-verification">
              <Button variant="outline" leftIcon={<RefreshCw size={15} />}>Request New Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <LoadingSpinner size="lg" label="Verifying your email…" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-success-bg mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface mb-2">Email Verified!</h2>
            <p className="text-sm text-text-secondary mb-5">
              Your email has been verified. Please wait for admin approval before you can log in.
            </p>
            <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const errMsg = (verifyMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
  const isExpired = errMsg.toLowerCase().includes('expired');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-8">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-error-bg mb-4">
            {isExpired ? <Clock size={32} className="text-error" /> : <XCircle size={32} className="text-error" />}
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">
            {isExpired ? 'Link Expired' : 'Invalid Link'}
          </h2>
          <p className="text-sm text-text-secondary mb-5">
            {errMsg || 'This verification link is invalid.'}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/resend-verification">
              <Button className="w-full" leftIcon={<RefreshCw size={15} />}>Request New Verification Email</Button>
            </Link>
            <Link to="/login"><Button variant="ghost" className="w-full">Back to Login</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
