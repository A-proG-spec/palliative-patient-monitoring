import { useQuery } from '@tanstack/react-query';
import { patientApi } from '@/api/patients';

export function usePatientProgress(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress'],
    queryFn: () => patientApi.getProgress(patientId),
    enabled: !!patientId,
  });
}
