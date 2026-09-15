import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, KeyRound } from 'lucide-react';
import {
  resendVerificationSchema,
  type ResendVerificationFormData,
} from '@/schemas/auth.schema';
import { useResendVerification } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

const ResendVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
  });
  const resendMutation = useResendVerification();

  // Keep the submitted email so we can pass it to the OTP page.
  const [submittedEmail, setSubmittedEmail] = useState('');

  const onSubmit = (data: ResendVerificationFormData) => {
    resendMutation.mutate(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to send verification email.';
        setError('root', { message });
      },
    });
  };

  // ── Success state: guide the user to the OTP page ────────────
  if (resendMutation.isSuccess && submittedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-success-bg mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Code Sent
            </h2>
            <p className="text-sm text-text-secondary mb-1 leading-relaxed">
              We sent a new <strong>6-digit verification code</strong> to
            </p>
            <p className="text-sm font-medium text-on-surface mb-5 break-all">
              {submittedEmail}
            </p>
            <p className="text-xs text-text-muted mb-5">
              Check your inbox and spam folder. Enter the code on the next page to
              complete verification.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                leftIcon={<KeyRound size={15} />}
                onClick={() =>
                  navigate(
                    `/verify-email?email=${encodeURIComponent(submittedEmail)}`,
                  )
                }
              >
                Enter Verification Code
              </Button>
              <Link
                to="/login"
                className="text-xs text-text-muted hover:text-primary transition-colors mt-2"
              >
                Skip — take me to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resend Verification Code</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a fresh 6-digit code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {errors.root && (
              <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error">
                {errors.root.message}
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={resendMutation.isPending}
            >
              Send Verification Code
            </Button>
            <p className="text-center text-sm text-text-secondary">
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                ← Back to Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendVerificationPage;