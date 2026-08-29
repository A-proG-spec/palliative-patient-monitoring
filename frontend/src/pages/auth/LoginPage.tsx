// src/pages/auth/LoginPage.tsx
// Route: /login  |  Layout: AuthLayout  |  Guard: PublicRoute

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
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

export const LoginPage: React.FC = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        setError('root', { message: getErrorMessage(error) });
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-heading-2">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the system.
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
              {...register('email')}
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
              placeholder="••••••••"
              autoComplete="current-password"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loginMutation.isPending}
            className="w-full mt-2"
          >
            Sign In
          </Button>

          {/* Links */}
          <div className="flex flex-col gap-2 pt-1 text-center text-body-sm">
            <p className="text-on-surface-variant">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
                Register
              </Link>
            </p>
            <p className="text-on-surface-variant">
              Email not verified?{' '}
              <Link
                to={ROUTES.RESEND_VERIFICATION}
                className="text-primary font-semibold hover:underline"
              >
                Resend verification email
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
