import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  verifyEmailOtpSchema,
  type VerifyEmailOtpFormData,
} from '@/schemas/auth.schema';
import { useVerifyEmail } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

/**
 * VerifyEmailPage
 * ───────────────
 * OTP-only verification flow.
 *
 *  - Reads `email` from the query string (set by RegisterPage after a
 *    successful registration, or by ResendVerificationPage after a
 *    successful resend).
 *  - If `email` is missing, the user can type it in.
 *  - On success → "wait for admin approval" screen.
 */
const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get('email') ?? '';

  const verifyMutation = useVerifyEmail();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(emailFromQuery);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<VerifyEmailOtpFormData>({
    resolver: zodResolver(verifyEmailOtpSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: '',
    },
  });

  // Keep local state in sync if the user types into the manual email field.
  const watchedEmail = watch('email');

  const onSubmit = (data: VerifyEmailOtpFormData) => {
    verifyMutation.mutate(
      { email: data.email, otp: data.otp },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Invalid verification code.';
          setError('otp', { message });
        },
      },
    );
  };

  // ── Success state ────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-success-bg mb-5">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-semibold text-on-surface mb-2">
              Email Verified
            </h2>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Your email is verified. Your account is now{' '}
              <strong className="text-on-surface">waiting for admin approval</strong>.
              You will be able to log in as soon as an administrator approves your account.
            </p>

            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
              <p className="text-xs text-text-muted mt-2">
                Tip: you can close this window and come back once you've been approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // The email we'll use for the "Resend" link — either from the query
  // string, or from whatever the user typed into the form.
  const emailForResend = currentEmail || watchedEmail || '';

  // ── Form state ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
              <KeyRound size={26} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-xl">Verify your email</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code we sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {errors.root && (
              <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {emailFromQuery ? (
              <div className="rounded-lg bg-surface-low border border-border-base px-4 py-3 text-sm">
                <span className="text-text-muted">Verifying:</span>{' '}
                <span className="text-on-surface font-medium">{emailFromQuery}</span>
              </div>
            ) : (
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email', {
                  onChange: (e) => setCurrentEmail(e.target.value),
                })}
              />
            )}

            <Input
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              leftIcon={<KeyRound size={15} />}
              error={errors.otp?.message}
              {...register('otp')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={verifyMutation.isPending}
            >
              Verify Email
            </Button>

            <div className="pt-2 text-center text-sm text-text-secondary space-y-2">
              <p>
                Didn't get a code?{' '}
                {/*
                  Carry the email forward so the resend page pre-fills it.
                  We can't pre-fill it directly since ResendVerificationPage
                  uses its own form; passing via query means it lands
                  in the URL and the user can see it.
                */}
                <Link
                  to={
                    emailForResend
                      ? `/resend-verification?email=${encodeURIComponent(emailForResend)}`
                      : '/resend-verification'
                  }
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  Resend verification
                </Link>
              </p>
              <p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-text-muted hover:text-primary transition-colors text-xs"
                >
                  ← Back to Login
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;