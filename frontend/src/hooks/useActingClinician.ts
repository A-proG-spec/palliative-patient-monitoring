import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { patientPath } from '@/lib/clinicalPaths';

export function useActingClinician(patientId: string) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.type === 'admin';
  const [actingAsStaffId, setActingAsStaffId] = useState('');

  return {
    isAdmin,
    actingAsStaffId,
    setActingAsStaffId,
    patientPath: patientPath(isAdmin, patientId),
    canSubmit: !isAdmin || actingAsStaffId.length > 0,
  };
}
