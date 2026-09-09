import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@/schemas/profile.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChangePasswordProps {
  onSubmit: (data: ChangePasswordFormData) => void;
  isSubmitting?: boolean;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleSubmitForm = (data: ChangePasswordFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        placeholder="Enter current password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <Input
        label="New Password"
        type="password"
        placeholder="Min. 8 characters"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter new password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="text-xs text-text-muted space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Minimum 8 characters</li>
          <li>At least 1 uppercase letter</li>
          <li>At least 1 number</li>
        </ul>
      </div>

      <Button type="submit" loading={isSubmitting}>Change Password</Button>
    </form>
  );
};