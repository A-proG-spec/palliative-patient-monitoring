import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  PenLine,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  useProgressNoteSignatures,
  useSignProgressNote,
  type ProgressNoteSignature,
} from '@/hooks/useProgressNotes';

// ─────────────────────────────────────────────────────────────
// Signing form schema
// ─────────────────────────────────────────────────────────────
const signSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['Physician', 'Nurse', 'Reviewer']),
});

type SignFormData = z.infer<typeof signSchema>;

interface ProgressNoteSignatureSectionProps {
  patientId: string;
  noteId: string;
  /** Optional callback fired after a successful signature. */
  onSigned?: () => void;
}

/**
 * ProgressNoteSignatureSection
 * ────────────────────────────
 * Shows the signature state of a progress note and allows
 * Physician / Nurse / Reviewer to sign in via email + password
 * (bcrypt-verified server-side).
 *
 * The responsible clinician is auto-signed at note creation — they
 * never need to sign here. If the logged-in user IS the responsible
 * clinician, the backend will reject their signature attempt.
 */
const ProgressNoteSignatureSection: React.FC<
  ProgressNoteSignatureSectionProps
> = ({ patientId, noteId, onSigned }) => {
  const { data, isLoading, refetch } = useProgressNoteSignatures(
    patientId,
    noteId,
  );
  const signMutation = useSignProgressNote(patientId, noteId);

  const [showSignForm, setShowSignForm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<SignFormData>({
    resolver: zodResolver(signSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'Physician',
    },
  });

  const onSubmit = (form: SignFormData) => {
    signMutation.mutate(form, {
      onSuccess: () => {
        setShowSignForm(false);
        reset({ email: '', password: '', role: 'Physician' });
        refetch();
        onSigned?.();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'Signature failed.';
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
  const responsible = data?.responsibleClinician ?? null;
  const allSigned = data?.allSigned ?? false;

  // ── Helper to find a signature for a given role ──
  const findSig = (role: ProgressNoteSignature['role']) =>
    signatures.find((s) => s.role === role) ?? null;

  const physicianSig = findSig('Physician');
  const nurseSig = findSig('Nurse');
  const reviewerSig = findSig('Reviewer');

  return (
    <div className="rounded-xl border border-border-base bg-surface-lowest overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-base bg-surface-low/40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-on-surface">
            Section 20 — Signatures
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

      {/* Signature rows */}
      <div className="divide-y divide-border-base">
        {/* Responsible clinician — auto-signed */}
        <SignatureRow
          label="Responsible Clinician"
          subtitle="Auto-signed at creation"
          signature={
            responsible
              ? {
                  name: responsible.name,
                  role: responsible.role,
                  signedAt: '',
                }
              : null
          }
          autoSigned
        />

        {/* Physician */}
        <SignatureRow
          label="Physician"
          subtitle="Sign with email + password"
          signature={physicianSig}
          onSignClick={
            !physicianSig ? () => setShowSignForm(true) : undefined
          }
        />

        {/* Nurse */}
        <SignatureRow
          label="Nurse"
          subtitle="Sign with email + password"
          signature={nurseSig}
          onSignClick={!nurseSig ? () => setShowSignForm(true) : undefined}
        />

        {/* Reviewer — optional */}
        <SignatureRow
          label="Reviewer"
          subtitle="Optional review signature"
          signature={reviewerSig}
          onSignClick={!reviewerSig ? () => setShowSignForm(true) : undefined}
        />
      </div>

      {/* Sign-in form */}
      {showSignForm && (
        <div className="border-t border-border-base bg-surface-low/30 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <PenLine size={14} className="text-primary" />
            <p className="text-sm font-medium text-on-surface">
              Add your signature
            </p>
          </div>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Signatures are verified against your registered email and password.
            Only staff registered with the role you select can sign as that role.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            {errors.root && (
              <div className="rounded-lg bg-error-bg border border-error/20 px-3 py-2 text-xs text-error">
                {errors.root.message}
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3"></div>

            {/* Role — handled by the Select below, not by the grid above */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Select
                label="Signing as"
                options={[
                  { value: 'Physician', label: 'Physician' },
                  { value: 'Nurse', label: 'Nurse' },
                  { value: 'Reviewer', label: 'Reviewer' },
                ]}
                error={errors.role?.message}
                {...register('role')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
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
                Confirm Signature
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowSignForm(false);
                  reset({ email: '', password: '', role: 'Physician' });
                }}
                disabled={signMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Status line */}
      <div className="border-t border-border-base px-5 py-3 bg-surface-low/20">
        {allSigned ? (
          <p className="text-xs text-success flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Note fully signed by Physician and Nurse.
          </p>
        ) : (
          <p className="text-xs text-text-muted">
            Both a Physician and a Nurse signature are required to finalise this
            note.
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Single signature row
// ─────────────────────────────────────────────────────────────

interface SignatureRowProps {
  label: string;
  subtitle?: string;
  signature: ProgressNoteSignature | { name: string; role: string; signedAt: string } | null;
  autoSigned?: boolean;
  onSignClick?: () => void;
}

const SignatureRow: React.FC<SignatureRowProps> = ({
  label,
  subtitle,
  signature,
  autoSigned,
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
              {autoSigned
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
            {autoSigned ? 'Auto-signed' : 'Signed'}
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

export default ProgressNoteSignatureSection;