import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { User, Mail, Phone, Lock, CheckCircle2, Briefcase } from 'lucide-react';
import { registerSchema } from '@/schemas/auth.schema';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

// ─────────────────────────────────────────────────────────────
// Staff roles accepted by the backend `registerSchema`.
// Keep this list in sync with `registerSchema` (auth.schema.ts).
// ─────────────────────────────────────────────────────────────
const STAFF_ROLE_OPTIONS = [
  { value: 'Physician',            label: 'Physician' },
  { value: 'Nurse',                label: 'Nurse' },
  { value: 'Pharmacist',           label: 'Pharmacist' },
  { value: 'Radiologist',          label: 'Radiologist' },
  { value: 'LaboratoryTechnician', label: 'Laboratory Technician' },
] as const;

// ─────────────────────────────────────────────────────────────
// Local form shape — first/last name are UI-only.
// The real `registerSchema` is applied after they're combined.
// ─────────────────────────────────────────────────────────────
const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName:  z.string().trim().min(1, 'Last name is required'),
    email:     z.string().email('Invalid email address'),
    phone:     z.string().min(10, 'Phone number must be at least 10 characters'),
    password:  z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(
      ['Physician', 'Nurse', 'Pharmacist', 'Radiologist', 'LaboratoryTechnician'],
      { message: 'Please select a valid role' },
    ),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormFields = z.infer<typeof registerFormSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormFields>({
    resolver: zodResolver(registerFormSchema),
    // Pre-select the most common role so the form is valid out of
    // the box. The user can still change it.
    defaultValues: {
      role: 'Nurse',
    },
  });
  const registerMutation = useRegister();

  // The email address used in registration is needed on the verify
  // page so the OTP submission carries the correct identifier.
  const [registeredEmail, setRegisteredEmail] = React.useState('');

  const onSubmit = (data: RegisterFormFields) => {
    // 1. Combine first + last name into the single `name` field the
    //    backend (and `registerSchema`) expects. Collapse whitespace.
    const combinedName = `${data.firstName} ${data.lastName}`
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Validate the combined payload against the real registerSchema.
    const parsed = registerSchema.safeParse({
      name: combinedName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    });

    if (!parsed.success) {
      // Surface any field-level errors from the shared schema onto
      // the RHF form so the user sees them inline.
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];

        // The `name` field doesn't exist on this form — map its
        // errors onto `firstName` so the user sees them somewhere
        // meaningful.
        if (path === 'name') {
          setError('firstName', { message: issue.message });
          continue;
        }

        if (
          path === 'email' ||
          path === 'phone' ||
          path === 'password' ||
          path === 'confirmPassword' ||
          path === 'role'
        ) {
          setError(path, { message: issue.message });
        }
      }
      return;
    }

    // 3. Send the validated payload to the backend.
    registerMutation.mutate(
      {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
        role: parsed.data.role,
      },
      {
        onSuccess: () => {
          setRegisteredEmail(parsed.data.email);
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

          {/* ── First + Last name on one row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              type="text"
              placeholder="Jane"
              autoComplete="given-name"
              leftIcon={<User size={15} />}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              type="text"
              placeholder="Smith"
              autoComplete="family-name"
              leftIcon={<User size={15} />}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

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

          {/* ── Role dropdown ── */}
          <div>
            <Select
              label="Requested role"
              options={STAFF_ROLE_OPTIONS as unknown as { value: string; label: string }[]}
              placeholder="Select your role…"
              error={errors.role?.message}
              {...register('role')}
            />
            <p className="mt-1 text-xs text-text-muted">
              An administrator will confirm your role during account approval.
            </p>
          </div>

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