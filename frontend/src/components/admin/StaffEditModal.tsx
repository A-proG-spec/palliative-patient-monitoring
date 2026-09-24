import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useUpdateStaff } from '@/hooks/useAdmin';
import type { StaffDetail } from '@/types/admin.types';

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────
const editStaffSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone number must be at least 10 characters')
      .max(20, 'Phone number is too long')
      .optional()
      .or(z.literal('')),
    role: z
      .enum([
        'Physician',
        'Nurse',
        'Pharmacist',
        'Radiologist',
        'LaboratoryTechnician',
        'Physiologist',
        'Psychiatrist',
        'Psychologist',
        'SocialWorker',
        'SpiritualPerson',
        'Nutritionist',
      ])
      .optional(),
  })
  .refine(
    (d) =>
      (d.name && d.name.length >= 2) ||
      (d.phone && d.phone.length >= 10) ||
      d.role !== undefined,
    { message: 'Change at least one field before saving' },
  );

type EditStaffFormData = z.infer<typeof editStaffSchema>;

interface StaffEditModalProps {
  staff: StaffDetail;
  onClose: () => void;
}

const StaffEditModal: React.FC<StaffEditModalProps> = ({ staff, onClose }) => {
  const updateMutation = useUpdateStaff();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: staff.name,
      phone: staff.phone,
      role: (staff.role ?? undefined) as EditStaffFormData['role'],
    },
  });

  const currentRole = watch('role');

  const onSubmit = (data: EditStaffFormData) => {
    const payload: { name?: string; phone?: string; role?: any } = {};

    if (data.name && data.name.trim() && data.name.trim() !== staff.name) {
      payload.name = data.name.trim();
    }
    if (data.phone && data.phone.trim() && data.phone.trim() !== staff.phone) {
      payload.phone = data.phone.trim();
    }
    if (data.role && data.role !== staff.role) {
      payload.role = data.role;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateMutation.mutate(
      { staffId: staff.id, data: payload },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base">
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Edit Staff Member
            </h2>
            <p className="text-xs text-text-muted mt-0.5">{staff.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {errors.root && (
            <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error">
              {errors.root.message}
            </div>
          )}

          <Input
            label="Full name"
            type="text"
            leftIcon={<User size={15} />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Phone number"
            type="tel"
            leftIcon={<Phone size={15} />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Select
            label="Role"
            options={[
              { value: 'Physician', label: 'Physician' },
              { value: 'Nurse', label: 'Nurse' },
              { value: 'Pharmacist', label: 'Pharmacist' },
              { value: 'Radiologist', label: 'Radiologist' },
              { value: 'LaboratoryTechnician', label: 'Laboratory Technician' },
              { value: 'Physiologist', label: 'Physiologist' },
              { value: 'Psychiatrist', label: 'Psychiatrist' },
              { value: 'Psychologist', label: 'Psychologist' },
              { value: 'SocialWorker', label: 'Social Worker' },
              { value: 'SpiritualPerson', label: 'Spiritual Person' },
              { value: 'Nutritionist', label: 'Nutritionist' },
            ]}
            placeholder="Select role…"
            value={currentRole ?? ''}
            {...register('role')}
          />

          <div className="rounded-lg bg-surface-low border border-border-base px-3 py-2 text-xs text-text-muted">
            Email cannot be changed here — it is tied to the account and would
            require re-verification.
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEditModal;