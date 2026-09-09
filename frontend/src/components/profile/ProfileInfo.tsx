import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormData } from '@/schemas/profile.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Profile, StaffProfile } from '@/types/profile.types';
import { Mail, Phone, BadgeCheck, Calendar, User, Briefcase } from 'lucide-react';

interface ProfileInfoProps {
  profile: Profile;
  onSave: (data: UpdateProfileFormData) => void;
  isSaving?: boolean;
}

// ── Type guard ────────────────────────────────────────────────────
const isStaffProfile = (profile: Profile): profile is StaffProfile => {
  return profile.type === 'staff';
};

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isStaff = isStaffProfile(profile);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: isStaff ? profile.phone || '' : '',
    },
  });

  const handleCancel = () => {
    reset({
      name: profile.name,
      phone: isStaff ? profile.phone || '' : '',
    });
    setIsEditing(false);
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    onSave(data);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Display Mode ── */}
      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex items-start gap-2 py-2 border-b border-border-base">
              <User size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Full Name</p>
                <p className="text-sm font-medium text-on-surface">{profile.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2 py-2 border-b border-border-base">
              <Mail size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Email</p>
                <p className="text-sm font-medium text-on-surface">{profile.email}</p>
              </div>
            </div>

            {/* Phone (Staff only) */}
            {isStaff && (
              <div className="flex items-start gap-2 py-2 border-b border-border-base">
                <Phone size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium text-on-surface">{profile.phone || '—'}</p>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="flex items-start gap-2 py-2 border-b border-border-base">
              <Briefcase size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Role</p>
                <p className="text-sm font-medium text-on-surface">
                  {isStaff ? profile.role || 'Staff' : 'Administrator'}
                </p>
              </div>
            </div>

            {/* Status (Staff only) */}
            {isStaff && (
              <div className="flex items-start gap-2 py-2 border-b border-border-base">
                <BadgeCheck size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={profile.status} type="staff" />
                  </div>
                </div>
              </div>
            )}

            {/* Email Verified (Staff only) */}
            {isStaff && (
              <div className="flex items-start gap-2 py-2 border-b border-border-base">
                <BadgeCheck size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Email Verified</p>
                  <div className="mt-0.5">
                    <Badge variant={profile.isEmailVerified ? 'success' : 'warning'}>
                      {profile.isEmailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="flex items-start gap-2 py-2 border-b border-border-base">
              <Calendar size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Member Since</p>
                <p className="text-sm font-medium text-on-surface">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      ) : (
        /* ── Edit Mode ── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
            />
            {isStaff && (
              <Input
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
              />
            )}
            <div>
              <p className="text-sm font-medium text-on-surface mb-1">Email</p>
              <p className="text-sm text-text-secondary">{profile.email} (read-only)</p>
            </div>
            {isStaff && (
              <div>
                <p className="text-sm font-medium text-on-surface mb-1">Role</p>
                <p className="text-sm text-text-secondary">{profile.role || 'Staff'} (read-only)</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={isSaving}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
};