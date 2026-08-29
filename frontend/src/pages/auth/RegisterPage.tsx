// src/pages/auth/RegisterPage.tsx
// Route: /register  |  Layout: AuthLayout  |  Guard: PublicRoute

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect to login 3 seconds after successful registration
  useEffect(() => {
    if (registerMutation.isSuccess) {
      const timer = setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      return () => clearTimeout(timer);
    }
  }, [registerMutation.isSuccess, navigate]);

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _cp, ...payload } = data;
    registerMutation.mutate(payload, {
      onError: (error) => {
        setError('root', { message: getErrorMessage(error) });
      },
    });
  };

  // Success state
  if (registerMutation.isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-heading-2 text-success">
            ✅ Registration Successful
          </CardTitle>
          <CardDescription>
            Please check your email to verify your account. Redirecting to
            login…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-on-surface-variant">
            A verification link has been sent to{' '}
            <strong>{registerMutation.data?.email}</strong>. You must verify
            your email before an admin can approve your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-heading-2">Create Account</CardTitle>
        <CardDescription>
          Register to access the Palliative Care System.
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

          {/* Name */}
          <div>
            <Label htmlFor="name" required>
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              error={!!errors.name}
              errorMessage={errors.name?.message}
              {...register('name')}
            />
          </div>

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
              {...register('email')}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" required>
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251911111111"
              autoComplete="tel"
              error={!!errors.phone}
              errorMessage={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" required>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={registerMutation.isPending}
            className="w-full mt-2"
          >
            Create Account
          </Button>

          {/* Links */}
          <p className="text-center text-body-sm text-on-surface-variant pt-1">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
