import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          || 'Invalid email or password';
        setError('root', { message });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Palliative Care account</CardDescription>
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
            autoComplete="email"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" size="lg" loading={loginMutation.isPending}>
            Sign In
          </Button>

          <div className="space-y-2 text-center text-sm text-text-secondary">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register as Staff
              </Link>
            </p>
            <p>
              <Link to="/resend-verification" className="text-text-muted hover:text-primary transition-colors">
                Resend verification email
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
