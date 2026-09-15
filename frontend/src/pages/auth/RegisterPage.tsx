import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const registerMutation = useRegister();

  // The email address used in registration is needed on the verify
  // page so the OTP submission carries the correct identifier.
  const [registeredEmail, setRegisteredEmail] = React.useState('');

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Registration failed. Please try again.';
          if (message.toLowerCase().includes('email')) {
            setError('email', { message: 'Email already registered' });
          } else {
            setError('root', { message });
          }
        },
      },
    );
  };

  // Auto-redirect to the OTP entry page 3 seconds after success.
  useEffect(() => {
    if (registerMutation.isSuccess && registeredEmail) {
      const timer = setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(registeredEmail)}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registerMutation.isSuccess, registeredEmail, navigate]);

  // ── Success state ────────────────────────────────────────────
  if (registerMutation.isSuccess && registeredEmail) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg text-success mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">
            Registration Successful!
          </h2>
          <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
            We've sent a <strong>6-digit verification code</strong> to{' '}
            <span className="text-on-surface font-medium">{registeredEmail}</span>.
            Enter the code to verify your email, then wait for admin approval.
          </p>
          <Link
            to={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
            className="mt-5"
          >
            <Button>Enter Verification Code →</Button>
          </Link>
          <p className="text-xs text-text-muted mt-3">
            Redirecting automatically in a few seconds…
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Form state ───────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create account</CardTitle>
        <CardDescription>Register as a palliative care staff member</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {errors.root && (
            <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error">
              {errors.root.message}
            </div>
          )}

          <Input
            label="Full name"
            type="text"
            placeholder="Dr. Jane Smith"
            autoComplete="name"
            leftIcon={<User size={15} />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone number"
            type="tel"
            placeholder="+251911234567"
            autoComplete="tel"
            leftIcon={<Phone size={15} />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            autoComplete="new-password"
            leftIcon={<Lock size={15} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={registerMutation.isPending}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;