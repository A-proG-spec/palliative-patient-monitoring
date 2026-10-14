import { useState, type FormEvent } from 'react';
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useChangeAdminPassword,
  useAdminActivityStats,
} from '@/hooks/useAdminProfile';
import type { AdminActivityStats } from '@/types/admin-profile.types';

// ═════════════════════════════════════════════════════════════
// Admin Profile Page
// ═════════════════════════════════════════════════════════════

export default function AdminProfilePage() {
  const { data: profile, isLoading, isError, error } = useAdminProfile();
  const { data: activity } = useAdminActivityStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">
            {(error as Error)?.message ?? 'Failed to load profile'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="space-y-6">
        <ProfileInfoCard
          initialName={profile.name}
          email={profile.email}
        />
        {activity && <ActivityStatsCard stats={activity} />}
        <ChangePasswordCard />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Profile Info Card
// ═════════════════════════════════════════════════════════════

function ProfileInfoCard({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const updateProfile = useUpdateAdminProfile();

  const hasChanges = name.trim() !== initialName;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return;
    updateProfile.mutate({ name: name.trim() });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
      <p className="mt-1 text-sm text-gray-500">Update your admin account name.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={updateProfile.isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            readOnly
            disabled
            className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending || !hasChanges}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Password Field — reusable input with show/hide toggle
// ═════════════════════════════════════════════════════════════

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          {visible ? (
            // Eye-off icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            // Eye icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Change Password Card
// ═════════════════════════════════════════════════════════════

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const changePassword = useChangeAdminPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setClientError(null);

    if (!currentPassword) {
      setClientError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setClientError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setClientError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setClientError('New password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setClientError('New password must be different from the current password.');
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setClientError(null);
        },
      },
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Use a strong password with at least one uppercase letter and one number.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordField
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          disabled={changePassword.isPending}
          autoComplete="current-password"
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          disabled={changePassword.isPending}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={changePassword.isPending}
          autoComplete="new-password"
        />

        {clientError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {clientError}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {changePassword.isPending ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Activity Stats Card
// ═════════════════════════════════════════════════════════════

function ActivityStatsCard({ stats }: { stats: AdminActivityStats }) {
  const items = [
    { label: 'Total Patients', value: stats.totalPatients, color: 'text-blue-600' },
    { label: 'Active Patients', value: stats.activePatients, color: 'text-green-600' },
    { label: 'Discharged', value: stats.dischargedPatients, color: 'text-gray-600' },
    { label: 'Pending Referrals', value: stats.pendingReferrals, color: 'text-yellow-600' },
    { label: 'Pending Staff', value: stats.pendingStaff, color: 'text-red-600' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
      <p className="mt-1 text-sm text-gray-500">Snapshot of current system activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-gray-100 bg-gray-50 p-4">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="mt-1 text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-gray-100 pt-4 text-sm">
        <div>
          <span className="text-gray-500">Member since: </span>
          <span className="font-medium text-gray-900">
            {new Date(stats.memberSince).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Last login: </span>
          <span className="font-medium text-gray-900">
            {new Date(stats.lastLogin).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}