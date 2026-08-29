// src/hooks/usePatientProgress.ts
// Derives KPS/PPS progress data from the visit history already available via
// usePatientVisits. No separate /progress endpoint is defined in the API spec.
// This hook is a pure client-side transform — no additional network request.

import { useMemo } from 'react';
import { usePatientVisits } from './useVisits';
import type { PatientProgressData, ProgressDataPoint } from '@/types/patient.types';
import { formatDate } from '@/lib/utils';

export function usePatientProgress(
  patientId: string,
  patientName: string
): {
  data: PatientProgressData | null;
  isLoading: boolean;
  error: unknown;
} {
  const { data: visitsData, isLoading, error } = usePatientVisits(patientId, {
    limit: 100,
  });

  const progressData = useMemo<PatientProgressData | null>(() => {
    if (!visitsData || visitsData.items.length === 0) return null;

    // Sort ascending by visitDate
    const sorted = [...visitsData.items].sort(
      (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
    );

    const points: ProgressDataPoint[] = sorted.map((v) => ({
      visitId: v.id,
      visitDate: formatDate(v.visitDate),
      kpsScore: v.kpsScore,
      ppsScore: v.ppsScore,
    }));

    const firstKps = points[0].kpsScore;
    const lastKps = points[points.length - 1].kpsScore;
    const firstPps = points[0].ppsScore;
    const lastPps = points[points.length - 1].ppsScore;

    const kpsDiff = lastKps - firstKps;
    const ppsDiff = lastPps - firstPps;

    const kpsTrend =
      kpsDiff > 0 ? 'improving' : kpsDiff < 0 ? 'declining' : 'stable';
    const ppsTrend =
      ppsDiff > 0 ? 'improving' : ppsDiff < 0 ? 'declining' : 'stable';

    const kpsChange =
      firstKps !== 0
        ? Math.round((kpsDiff / firstKps) * 100)
        : 0;
    const ppsChange =
      firstPps !== 0
        ? Math.round((ppsDiff / firstPps) * 100)
        : 0;

    return {
      patientId,
      patientName,
      visits: points,
      trends: {
        kps: {
          trend: kpsTrend,
          percentageChange: kpsChange,
          firstScore: firstKps,
          lastScore: lastKps,
        },
        pps: {
          trend: ppsTrend,
          percentageChange: ppsChange,
          firstScore: firstPps,
          lastScore: lastPps,
        },
      },
    };
  }, [visitsData, patientId, patientName]);

  return { data: progressData, isLoading, error };
}
