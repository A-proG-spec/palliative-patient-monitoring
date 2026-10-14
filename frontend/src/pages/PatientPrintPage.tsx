import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePatient } from '@/hooks/usePatients';
import { fetchAllPatientData } from '@/lib/fetchAllPatientData';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import { LoadingSpinner, PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

const PatientPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patient, isLoading, error } = usePatient(id!);

  useEffect(() => {
    if (isLoading || !patient) return;

    let cancelled = false;

    (async () => {
      try {
        const bundle = await fetchAllPatientData(queryClient, id!);
        if (cancelled) return;

        printPatientReport({
          patient,
          ...bundle,
          appName: APP_NAME,
        });

        setTimeout(() => navigate(`/patients/${id}`), 1200);
      } catch (err) {
        console.error('[Print] Failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [patient, isLoading, id, queryClient, navigate]);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (isLoading) return <PageLoader />;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" label="Loading full patient record…" />
    </div>
  );
};

export default PatientPrintPage;