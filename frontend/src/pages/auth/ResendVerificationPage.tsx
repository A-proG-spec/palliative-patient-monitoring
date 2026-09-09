import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { resendVerificationSchema, type ResendVerificationFormData } from '@/schemas/auth.schema';
import { useResendVerification } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const ResendVerificationPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
  });
  const resendMutation = useResendVerification();

  const onSubmit = (data: ResendVerificationFormData) => {
    resendMutation.mutate(data, {
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          || 'Failed to send verification email.';
        setError('root', { message });
      },
    });
  };

  if (resendMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-success-bg mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Email Sent!</h2>
            <p className="text-sm text-text-secondary mb-5">
              A new verification link has been sent. Check your inbox and spam folder.
            </p>
            <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resend Verification Email</CardTitle>
          <CardDescription>Enter your email to receive a new verification link</CardDescription>
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
            <Button type="submit" className="w-full" size="lg" loading={resendMutation.isPending}>
              Send Verification Email
            </Button>
            <p className="text-center text-sm text-text-secondary">
              <Link to="/login" className="text-primary font-medium hover:underline">← Back to Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendVerificationPage;
