// src/pages/auth/ResendVerificationPage.tsx
// Route: /resend-verification  |  Layout: PublicLayout  |  Guard: None

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useResendVerification } from '@/hooks/useAuth';
import {
  resendVerificationSchema,
  type ResendVerificationFormData,
} from '@/schemas/auth.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/utils';
import { ROUTES } from '@/constants';

export const ResendVerificationPage: React.FC = () => {
  const resendMutation = useResendVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = (data: ResendVerificationFormData) => {
    resendMutation.mutate(data, {
      onError: (error) => {
        setError('root', { message: getErrorMessage(error) });
      },
    });
  };

  // Success state
  if (resendMutation.isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-success">✅ Email Sent</CardTitle>
          <CardDescription>
            Verification email sent. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-body-md text-on-surface-variant">
            A new verification link has been sent to your email address. Please
            check your inbox (and spam folder) and click the link to verify your
            account.
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-heading-2">Resend Verification Email</CardTitle>
        <CardDescription>
          Enter your email address to receive a new verification link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Root error */}
          {errors.root && (
            <div
              className="p-3 rounded-lg bg-error-bg text-error text-body-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          {/* Email */}
          <div>
            <Label htmlFor="email" required>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={!!errors.email}
              errorMessage={errors.email?.message}
              disabled={resendMutation.isPending}
              {...register('email')}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={resendMutation.isPending}
            className="w-full"
          >
            Send Verification Email
          </Button>

          {/* Back link */}
          <p className="text-center text-body-sm text-on-surface-variant">
            <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
