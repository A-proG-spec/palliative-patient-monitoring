import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitSignatures, useSignVisit } from '@/hooks/useSignatures';
import {
  signVisitSchema,
  STAFF_ROLE_VALUES,
  type SignVisitFormData,
} from '@/schemas/signature.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  PenLine,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

// Roles that gate "finalised". Other roles can cosign freely.
const REQUIRED_ROLES = ['Physician', 'Nurse'] as const;

const ROLE_LABELS: Record<string, string> = {
  Physician: 'Physician',
  Nurse: 'Nurse',
  Pharmacist: 'Pharmacist',
  Radiologist: 'Radiologist',
  LaboratoryTechnician: 'Laboratory Technician',
  Physiologist: 'Physiologist',
  Psychiatrist: 'Psychiatrist',
  Psychologist: 'Psychologist',
  SocialWorker: 'Social Worker',
  SpiritualPerson: 'Spiritual Person',
  Nutritionist: 'Nutritionist',
};

const ROLE_OPTIONS = STAFF_ROLE_VALUES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r] ?? r,
}));

interface SignatureSectionProps {
  patientId: string;
  visitId: string;
  teamMembers?: Array<{ role: string; name: string }>;
  onAllSigned?: () => void;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({
  patientId,
  visitId,
  teamMembers = [],
  onAllSigned,
}) => {
  const { data, isLoading, refetch } = useVisitSignatures(patientId, visitId);
  const signMutation = useSignVisit(patientId, visitId);
  const currentUser = useAuthStore((s) => s.user);

  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    watch,
  } = useForm<SignVisitFormData>({
    resolver: zodResolver(signVisitSchema),
    defaultValues: {
      role: (currentUser?.role as SignVisitFormData['role']) ?? 'Nurse',
      email: currentUser?.email ?? '',
      password: '',
    },
  });

  const selectedRole = watch('role');

  // ── Quick-sign shortcut: pre-fill the form with the logged-in user
  //     so they don't have to retype their own email. ──
  const openQuickSign = (role: 'Physician' | 'Nurse') => {
    setValue('role', role, { shouldValidate: false });
    setValue('email', currentUser?.email ?? '', { shouldValidate: false });
    setValue('password', '', { shouldValidate: false });
    setShowAddForm(true);
  };

  // ── Add Staff Signature: blank slate. Any role, any email. ──
  const openAddStaffForm = () => {
    setValue(
      'role',
      (currentUser?.role as SignVisitFormData['role']) ?? 'Nurse',
      { shouldValidate: false },
    );
    setValue('email', '', { shouldValidate: false });
    setValue('password', '', { shouldValidate: false });
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    reset({
      role: (currentUser?.role as SignVisitFormData['role']) ?? 'Nurse',
      email: currentUser?.email ?? '',
      password: '',
    });
  };

  const onSubmit = (form: SignVisitFormData) => {
    signMutation.mutate(form, {
      onSuccess: () => {
        closeForm();
        refetch();
        setTimeout(() => {
          if (data?.allSigned) onAllSigned?.();
        }, 0);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Signature failed.';
        setError('root', { message: msg });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-base bg-surface-lowest px-5 py-4 text-sm text-text-muted">
        Loading signature status…
      </div>
    );
  }

  const signatures = data?.signatures ?? [];
  const teamLeader = data?.teamLeader ?? null;
  const allSigned = data?.allSigned ?? false;

  const findSig = (role: string) =>
    signatures.find((s) => s.role === role) ?? null;

  const physicianSig = findSig('Physician');
  const nurseSig = findSig('Nurse');

  // All signatures whose role is NOT in REQUIRED_ROLES
  const cosignerSigs = signatures.filter(
    (s) => !(REQUIRED_ROLES as readonly string[]).includes(s.role),
  );

  const teamLeaderFallback = teamMembers.find((m) => m.role === 'TeamLeader');
  const teamLeaderDisplay = teamLeader
    ? { staffId: teamLeader.staffId, name: teamLeader.name }
    : teamLeaderFallback
      ? { staffId: '', name: teamLeaderFallback.name }
      : null;

  return (
    <div className="rounded-xl border border-border-base bg-surface-lowest overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-base bg-surface-low/40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-on-surface">
            Team Signatures
          </h3>
        </div>
        {allSigned ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 size={11} />
            All Signed
          </Badge>
        ) : (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock size={11} />
            Pending
          </Badge>
        )}
      </div>

      {/* ── Signature rows ── */}
      <div className="divide-y divide-border-base">
        {/* Team Leader — auto-signed */}
        <SignatureRow
          label="Team Leader"
          subtitle="Auto-signed at creation"
          signature={
            teamLeaderDisplay
              ? {
                  name: teamLeaderDisplay.name,
                  signedAt: '',
                  autoSigned: true,
                }
              : null
          }
        />

        {/* Physician — required */}
        <SignatureRow
          label="Physician"
          subtitle="Required — sign with email + password"
          signature={
            physicianSig
              ? {
                  name: physicianSig.name,
                  signedAt: physicianSig.signedAt,
                  autoSigned: false,
                }
              : null
          }
          onSignClick={!physicianSig ? () => openQuickSign('Physician') : undefined}
        />

        {/* Nurse — required */}
        <SignatureRow
          label="Nurse"
          subtitle="Required — sign with email + password"
          signature={
            nurseSig
              ? {
                  name: nurseSig.name,
                  signedAt: nurseSig.signedAt,
                  autoSigned: false,
                }
              : null
          }
          onSignClick={!nurseSig ? () => openQuickSign('Nurse') : undefined}
        />

        {/* Cosigners — every other role that has signed */}
        {cosignerSigs.map((sig) => (
          <SignatureRow
            key={`${sig.role}-${sig.staffId}`}
            label={ROLE_LABELS[sig.role] ?? sig.role}
            subtitle="Cosignature"
            signature={{
              name: sig.name,
              signedAt: sig.signedAt,
              autoSigned: false,
            }}
          />
        ))}
      </div>

      {/* ── Add Staff Signature button ── */}
      <div className="px-5 py-3 border-t border-border-base bg-surface-low/20 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-text-muted">
          Add signatures from additional staff members (Pharmacist, Nutritionist,
          Social Worker, Spiritual Person, etc.).
        </p>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<UserPlus size={13} />}
          onClick={openAddStaffForm}
        >
          Add Staff Signature
        </Button>
      </div>

      {/* ── Sign form ── */}
      {showAddForm && (
        <div className="border-t border-border-base bg-surface-low/30 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <PenLine size={14} className="text-primary" />
            <p className="text-sm font-medium text-on-surface">
              Add a signature
            </p>
          </div>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Enter the staff member's email and password. The role must match
            their registered account on the server — the signature will be
            rejected if it doesn't.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
            noValidate
          >
            {errors.root && (
              <div className="rounded-lg bg-error-bg border border-error/20 px-3 py-2 text-xs text-error flex items-start gap-2">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Role dropdown — full list */}
            <Select
              label="Signing as"
              options={ROLE_OPTIONS as unknown as {
                value: string;
                label: string;
              }[]}
              placeholder="Select role…"
              error={errors.role?.message}
              {...register('role')}
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="staff@example.com"
                leftIcon={<Mail size={14} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={14} />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                loading={signMutation.isPending}
              >
                Add Signature
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={closeForm}
                disabled={signMutation.isPending}
              >
                Cancel
              </Button>
            </div>

            {selectedRole && (
              <p className="text-[11px] text-text-muted pt-1">
                Signing as <strong>{ROLE_LABELS[selectedRole] ?? selectedRole}</strong>.
                The server will verify that this email is registered with that role.
              </p>
            )}
          </form>
        </div>
      )}

      {/* ── Status line ── */}
      <div className="border-t border-border-base px-5 py-3 bg-surface-low/20">
        {allSigned ? (
          <p className="text-xs text-success flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            All required signatures collected. This visit is ready to be
            finalised.
          </p>
        ) : (
          <div className="flex items-start gap-1.5 text-xs text-warning">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              A Physician and a Nurse must both sign to finalise this visit.
              {!physicianSig && ' Physician signature pending.'}
              {!nurseSig && ' Nurse signature pending.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Signature row
// ─────────────────────────────────────────────────────────────

interface SignatureRowProps {
  label: string;
  subtitle?: string;
  signature: {
    name: string;
    signedAt: string;
    autoSigned: boolean;
  } | null;
  onSignClick?: () => void;
}

const SignatureRow: React.FC<SignatureRowProps> = ({
  label,
  subtitle,
  signature,
  onSignClick,
}) => {
  const signed = !!signature;
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 py-3.5 gap-4',
        signed ? 'bg-success-bg/20' : 'bg-surface-lowest',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface">{label}</p>
        {signed ? (
          <>
            <p className="text-xs text-text-secondary truncate">
              {signature.name}
            </p>
            <p className="text-[11px] text-text-muted">
              {signature.autoSigned
                ? subtitle
                : signature.signedAt
                  ? `Signed ${formatDate(signature.signedAt)}`
                  : subtitle}
            </p>
          </>
        ) : (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {signed ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 size={11} />
            {signature.autoSigned ? 'Auto-signed' : 'Signed'}
          </Badge>
        ) : onSignClick ? (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PenLine size={12} />}
            onClick={onSignClick}
          >
            Sign
          </Button>
        ) : (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock size={11} />
            Pending
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SignatureSection;