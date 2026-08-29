// src/pages/auth/VerifyEmailPage.tsx
// Route: /verify-email  |  Layout: PublicLayout  |  Guard: None

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmail } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { ROUTES } from '@/constants';
import { getErrorMessage } from '@/lib/utils';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No token in URL
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-error">Invalid Request</CardTitle>
          <CardDescription>No verification token was provided.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={ROUTES.RESEND_VERIFICATION}>
            <Button variant="outline" className="w-full">
              Request New Verification Email
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (verifyMutation.isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying Your Email</CardTitle>
          <CardDescription>
            Please wait while we verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" label="Verifying…" />
        </CardContent>
      </Card>
    );
  }

  // Success
  if (verifyMutation.isSuccess) {
    const { isEmailVerified } = verifyMutation.data;

    if (isEmailVerified) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-success">✅ Email Verified</CardTitle>
            <CardDescription>
              Email verified successfully! Please wait for admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-body-md text-on-surface-variant">
              Your email has been verified. You will be able to log in once an
              administrator approves your account.
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    // isEmailVerified === false (already verified case)
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">ℹ️ Already Verified</CardTitle>
          <CardDescription>Your email is already verified.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" className="w-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (verifyMutation.isError) {
    const msg = getErrorMessage(verifyMutation.error);
    const isExpired = msg.toLowerCase().includes('expired');
    const isInvalid = msg.toLowerCase().includes('invalid');

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-error">
            {isExpired ? '⏰ Link Expired' : isInvalid ? '❌ Invalid Link' : '❌ Verification Failed'}
          </CardTitle>
          <CardDescription>{msg}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(isExpired || isInvalid) && (
            <Link to={ROUTES.RESEND_VERIFICATION}>
              <Button variant="outline" className="w-full">
                Request New Verification Email
              </Button>
            </Link>
          )}
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
};
