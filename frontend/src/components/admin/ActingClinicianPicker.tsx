import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { StaffRole } from '@/types/admin.types';
import { Select } from '@/components/ui/Select';

interface ActingClinicianPickerProps {
  value: string;
  onChange: (staffId: string) => void;
  allowedRoles?: StaffRole[];
  required?: boolean;
}

export const ActingClinicianPicker: React.FC<ActingClinicianPickerProps> = ({
  value,
  onChange,
  allowedRoles,
  required = true,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'staff', 'active-clinicians'],
    queryFn: () => adminApi.getActiveStaff({ limit: 100 }),
  });
  const staff = (data?.items ?? []).filter(
    (member) => member.role && (!allowedRoles || allowedRoles.includes(member.role)),
  );

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <Select
        label="Acting clinician *"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={isLoading || isError}
        options={[
          { value: '', label: isLoading ? 'Loading active staff…' : 'Select an active clinician' },
          ...staff.map((member) => ({
            value: String(member.id),
            label: `${member.name} — ${member.role}`,
          })),
        ]}
      />
      {isError && <p className="text-xs text-error">Could not load active staff. Please try again.</p>}
      {!isLoading && !isError && staff.length === 0 && (
        <p className="text-xs text-warning">No active staff match this record type.</p>
      )}
      <p className="text-xs text-text-muted">Choose the staff member this record should be attributed to.</p>
    </div>
  );
};

export default ActingClinicianPicker;
