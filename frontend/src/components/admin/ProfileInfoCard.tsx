import { useState, type FormEvent } from 'react';
import type { AdminProfile, UpdateAdminProfileBody } from '../../types/admin-profile.types';

interface ProfileInfoCardProps {
  profile: AdminProfile;
  onSave: (body: UpdateAdminProfileBody) => Promise<AdminProfile>;
}

export function ProfileInfoCard({ profile, onSave }: ProfileInfoCardProps) {
  const [name, setName] = useState(profile.name);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasChanges = name.trim() !== profile.name;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty');
      return;
    }

    if (name.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim() });
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
      <p className="mt-1 text-sm text-gray-500">
        Update your admin account name.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="admin-name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label
            htmlFor="admin-email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={profile.email}
            readOnly
            disabled
            className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200
                       bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Email cannot be changed from this page.
          </p>
        </div>

        {/* Feedback */}
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}