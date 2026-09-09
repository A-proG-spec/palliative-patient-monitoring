import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitSignatures, useSignVisit } from '@/hooks/useSignatures';
import { signVisitSchema, SignVisitFormData } from '@/schemas/signature.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SignatureSectionProps {
  visitId: string;
  visitDate: string;
  teamMembers?: Array<{ role: string; name: string }>;
  onAllSigned?: () => void;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({
  visitId,
  visitDate,
  teamMembers = [],
  onAllSigned,
}) => {
  const [signingRole, setSigningRole] = useState<'Physician' | 'Nurse' | null>(null);

  const { data: signatures, isLoading, refetch } = useVisitSignatures(visitId);
  const signMutation = useSignVisit(visitId);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SignVisitFormData>({
    resolver: zodResolver(signVisitSchema),
    defaultValues: {
      role: 'Physician',
      email: '',
      password: '',
    },
  });

  const onSign = (data: SignVisitFormData, role: 'Physician' | 'Nurse') => {
    signMutation.mutate(
      { ...data, role },
      {
        onSuccess: () => {
          setSigningRole(null);
          reset({ role: 'Physician', email: '', password: '' });
          refetch();
          if (signatures?.allSigned) {
            onAllSigned?.();
          }
        },
      }
    );
  };

  if (isLoading) {
    return <div className="animate-pulse text-center py-4">Loading signatures...</div>;
  }

  const isTeamLeaderSigned = signatures?.teamLeader !== null;
  const isPhysicianSigned = signatures?.physician !== null;
  const isNurseSigned = signatures?.nurse !== null;
  const allSigned = signatures?.allSigned || false;

  const getSignatureBadge = (signed: boolean) => {
    return signed ? (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Signed
      </Badge>
    ) : (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  // Get team member names from the passed prop
  const teamLeader = teamMembers.find(m => m.role === 'TeamLeader');
  const physician = teamMembers.find(m => m.role === 'Physician');
  const nurse = teamMembers.find(m => m.role === 'Nurse');

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-surface-lowest">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-on-surface">Team Signatures</h3>
        {allSigned && (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            All Signed
          </Badge>
        )}
      </div>

      {/* Team Leader */}
      <div className="flex items-center justify-between p-3 bg-surface-low rounded-lg">
        <div>
          <p className="font-medium text-on-surface">Team Leader</p>
          <p className="text-sm text-text-secondary">
            {signatures?.teamLeader?.staffName || teamLeader?.name || 'Not assigned'}
          </p>
          {signatures?.teamLeader?.signedAt && (
            <p className="text-xs text-text-muted">
              Signed: {formatDate(signatures.teamLeader.signedAt)}
            </p>
          )}
        </div>
        <div className="text-right">
          {getSignatureBadge(isTeamLeaderSigned)}
          {signatures?.teamLeader?.autoSigned && (
            <p className="text-xs text-text-muted mt-1">Auto-signed</p>
          )}
        </div>
      </div>

      {/* Physician */}
      <div className="flex items-center justify-between p-3 bg-surface-low rounded-lg">
        <div>
          <p className="font-medium text-on-surface">Physician</p>
          <p className="text-sm text-text-secondary">
            {signatures?.physician?.staffName || physician?.name || 'Not signed'}
          </p>
          {signatures?.physician?.signedAt && (
            <p className="text-xs text-text-muted">
              Signed: {formatDate(signatures.physician.signedAt)}
            </p>
          )}
        </div>
        <div>
          {getSignatureBadge(isPhysicianSigned)}
          {!isPhysicianSigned && signingRole !== 'Physician' && (
            <Button
              size="sm"
              variant="outline"
              className="mt-1"
              onClick={() => setSigningRole('Physician')}
            >
              Sign as Physician
            </Button>
          )}
        </div>
      </div>

      {/* Physician Sign Form */}
      {signingRole === 'Physician' && !isPhysicianSigned && (
        <form
          onSubmit={handleSubmit((data) => onSign(data, 'Physician'))}
          className="p-3 border rounded-lg space-y-3"
        >
          <p className="text-sm font-medium text-on-surface">Sign as Physician</p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="physician-email">Email</Label>
              <Input
                id="physician-email"
                type="email"
                placeholder="physician@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            <div>
              <Label htmlFor="physician-password">Password</Label>
              <Input
                id="physician-password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={signMutation.isPending}>
              Confirm Signature
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSigningRole(null);
                reset({ role: 'Physician', email: '', password: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Nurse */}
      <div className="flex items-center justify-between p-3 bg-surface-low rounded-lg">
        <div>
          <p className="font-medium text-on-surface">Nurse</p>
          <p className="text-sm text-text-secondary">
            {signatures?.nurse?.staffName || nurse?.name || 'Not signed'}
          </p>
          {signatures?.nurse?.signedAt && (
            <p className="text-xs text-text-muted">
              Signed: {formatDate(signatures.nurse.signedAt)}
            </p>
          )}
        </div>
        <div>
          {getSignatureBadge(isNurseSigned)}
          {!isNurseSigned && signingRole !== 'Nurse' && (
            <Button
              size="sm"
              variant="outline"
              className="mt-1"
              onClick={() => setSigningRole('Nurse')}
            >
              Sign as Nurse
            </Button>
          )}
        </div>
      </div>

      {/* Nurse Sign Form */}
      {signingRole === 'Nurse' && !isNurseSigned && (
        <form
          onSubmit={handleSubmit((data) => onSign(data, 'Nurse'))}
          className="p-3 border rounded-lg space-y-3"
        >
          <p className="text-sm font-medium text-on-surface">Sign as Nurse</p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="nurse-email">Email</Label>
              <Input
                id="nurse-email"
                type="email"
                placeholder="nurse@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            <div>
              <Label htmlFor="nurse-password">Password</Label>
              <Input
                id="nurse-password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={signMutation.isPending}>
              Confirm Signature
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSigningRole(null);
                reset({ role: 'Physician', email: '', password: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Status Message */}
      {!allSigned && (
        <div className="flex items-start gap-2 p-3 bg-warning-bg border border-warning/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-sm text-warning">
            All team members must sign before the visit can be finalized.
            {!isPhysicianSigned && ' Physician needs to sign.'}
            {!isNurseSigned && ' Nurse needs to sign.'}
          </p>
        </div>
      )}

      {allSigned && (
        <div className="flex items-start gap-2 p-3 bg-success-bg border border-success/20 rounded-lg">
          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
          <p className="text-sm text-success">
            All team members have signed. This visit is ready to be finalized.
          </p>
        </div>
      )}
    </div>
  );
};