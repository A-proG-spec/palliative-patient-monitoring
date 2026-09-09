import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/LoadingSpinner';

const PatientPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!);
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);

  const isLoading = pLoading || !patient;

  useEffect(() => {
    if (!isLoading && patient) {
      printPatientReport({
        patient,
        visits: visitsData?.items || [],
        medications: medsData?.items || [],
        labs: labsData?.items || [],
        referrals: refsData?.items || [],
        admissions: admsData?.items || [],
        appName: APP_NAME,
      });
      // Navigate back after print dialog
      setTimeout(() => {
        navigate(`/patients/${id}`);
      }, 1000);
    }
  }, [isLoading, patient]);

  if (isLoading) return <PageLoader />;
  if (pError) return <ErrorState onRetry={() => navigate(`/patients/${id}`)} />;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" label="Preparing print view..." />
    </div>
  );
};

export default PatientPrintPage;