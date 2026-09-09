import React from 'react';
import { useProfile, useUpdateProfile, useChangePassword, useActivityStats } from '@/hooks/useProfile';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ChangePassword } from '@/components/profile/ChangePassword';
import { ActivityStats } from '@/components/profile/ActivityStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { BackButton } from '@/components/common/BackButton';
import { Mail, Phone, BadgeCheck, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Profile, StaffProfile } from '@/types/profile.types';

// ── Helper to get user initials safely ──────────────────────────
const getUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return 'U';
  return name
    .trim()
    .split(' ')
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ── Helper to check if profile is staff ──────────────────────────
const isStaffProfile = (profile: Profile): profile is StaffProfile => {
  return profile.type === 'staff';
};

const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Loading state
  if (isLoading || statsLoading) return <PageLoader />;
  
  // Error state
  if (error || !profile) return <ErrorState onRetry={refetch} />;

  const isStaff = isStaffProfile(profile);
  const initials = getUserInitials(profile.name);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <BackButton to={profile.type === 'admin' ? '/admin' : '/dashboard'} label="Dashboard" />
        <h1 className="text-2xl font-bold text-on-surface">My Profile</h1>
      </div>

      {/* Identity Card - like patient identity section */}
      <Card padding="lg" className="border-l-4 border-l-primary">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-3xl font-bold">
            {initials}
          </div>

          {/* Identity details */}
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-on-surface">{profile.name}</h2>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Mail size={14} className="text-text-muted" />
                {profile.email}
              </span>
              {isStaff && (
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Phone size={14} className="text-text-muted" />
                  {profile.phone || '—'}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-text-secondary">
                <BadgeCheck size={14} className="text-text-muted" />
                {isStaff ? profile.role || 'Staff' : 'Administrator'}
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Calendar size={14} className="text-text-muted" />
                Member since {formatDate(profile.createdAt)}
              </span>
            </div>

            {isStaff && (
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.status === 'Active'
                    ? 'bg-success-bg text-success'
                    : profile.status === 'Pending'
                    ? 'bg-warning-bg text-warning'
                    : 'bg-error-bg text-error'
                }`}>
                  {profile.status || 'Active'}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.isEmailVerified
                    ? 'bg-success-bg text-success'
                    : 'bg-warning-bg text-warning'
                }`}>
                  {profile.isEmailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileInfo
            profile={profile}
            onSave={updateProfileMutation.mutate}
            isSaving={updateProfileMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePassword
            onSubmit={changePasswordMutation.mutate}
            isSubmitting={changePasswordMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>My Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityStats stats={stats} userType={profile.type} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;