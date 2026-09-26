import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { usePatientHospiceAssessments } from '@/hooks/useHospiceNursing';
import { usePatientPainAssessments } from '@/hooks/usePainAssessments';
import { usePatientPharmacistAssessments } from '@/hooks/usePharmacistAssessments';
import { usePatientPhysiotherapyAssessments } from '@/hooks/usePhysiotherapyAssessments';
import { usePatientFamilyAssessments } from '@/hooks/useFamilyAssessments';
import { usePatientNutritionalAssessments } from '@/hooks/useNutritionalAssessments';
import { usePatientSocialAssessments } from '@/hooks/useSocialAssessments';
import { usePatientSpiritualAssessments } from '@/hooks/useSpiritualAssessments';
import { usePatientPsychiatryAssessments } from '@/hooks/usePsychiatryAssessments';
import { visitApi } from '@/api/visits';
import type { HospitalAdmission } from '@/types/admission.types';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import { LoadingSpinner, PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

const PatientPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Core patient ──
  const { data: patient, isLoading: pLoading, error: pError } = usePatient(id!);

  // ── List endpoints (id + summary fields) ──
  const { data: visitsData } = usePatientVisits(id!);
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);
  const { data: progressNotesData } = useProgressNotes(id!);
  const { data: hospiceData } = usePatientHospiceAssessments(id!);

  // ── Assessments ──
  const { data: painData } = usePatientPainAssessments(id!);
  const { data: pharmacistData } = usePatientPharmacistAssessments(id!);
  const { data: physioData } = usePatientPhysiotherapyAssessments(id!);
  const { data: familyData } = usePatientFamilyAssessments(id!);
  const { data: nutritionData } = usePatientNutritionalAssessments(id!);
  const { data: socialData } = usePatientSocialAssessments(id!);
  const { data: spiritualData } = usePatientSpiritualAssessments(id!);
  const { data: psychiatryData } = usePatientPsychiatryAssessments(id!);

  // ── Per-visit detail fetch ──
  //
  // The list endpoint returns a light shape (id + a few fields).
  // The detail endpoint returns every column (vitals, ADL, pain,
  // symptoms, caregiver, education, etc.). We fetch the full record
  // for every visit in parallel — one query per visit id — then
  // wait until all of them settle before printing.
  const visitIds = useMemo(
    () => (visitsData?.items ?? []).map((v) => String(v.id)),
    [visitsData],
  );

  const visitDetailQueries = useQueries({
    queries: visitIds.map((visitId) => ({
      queryKey: ['patients', id, 'visits', visitId],
      queryFn: () => visitApi.getById(id!, visitId),
      enabled: !!id && !!visitId,
      staleTime: 0,
    })),
  });

  const visitsLoading =
    visitIds.length > 0 &&
    visitDetailQueries.some((q) => q.isLoading || q.isPending);
  const visitsError = visitDetailQueries.some((q) => q.isError);

  // ── Full visits = list items merged with detail data ──
  const fullVisits = useMemo(() => {
    if (!visitsData?.items) return [];

    return visitsData.items.map((listItem, i) => {
      const detail = visitDetailQueries[i]?.data;
      // Prefer the detailed record when available, fall back to
      // the list item so nothing is ever lost.
      return {
        ...listItem,
        ...(detail ?? {}),
      };
    });
  }, [visitsData, visitDetailQueries]);

  const isLoading = pLoading || !patient || visitsLoading;

  // ── Bundle everything into a single payload ──
  const reportPayload = useMemo(
    () =>
      patient && !visitsLoading
        ? {
            patient,
            visits: fullVisits,
            medications: medsData?.items ?? [],
            labs: labsData?.items ?? [],
            referrals: refsData?.items ?? [],
            admissions: (admsData?.items ??
              []) as unknown as HospitalAdmission[],
            progressNotes: progressNotesData?.items ?? [],
            hospiceNursing: hospiceData?.items ?? [],
            painAssessments: painData?.items ?? [],
            pharmacistAssessments: pharmacistData?.items ?? [],
            physiotherapyAssessments: physioData?.items ?? [],
            familyAssessments: familyData?.items ?? [],
            nutritionalAssessments: nutritionData?.items ?? [],
            socialAssessments: socialData?.items ?? [],
            spiritualAssessments: spiritualData?.items ?? [],
            psychiatryAssessments: psychiatryData?.items ?? [],
            appName: APP_NAME,
          }
        : null,
    [
      patient,
      visitsLoading,
      fullVisits,
      medsData,
      labsData,
      refsData,
      admsData,
      progressNotesData,
      hospiceData,
      painData,
      pharmacistData,
      physioData,
      familyData,
      nutritionData,
      socialData,
      spiritualData,
      psychiatryData,
    ],
  );

  useEffect(() => {
    if (isLoading || !reportPayload) return;

    const timer = setTimeout(() => {
      printPatientReport(reportPayload);
      setTimeout(() => navigate(`/patients/${id}`), 1200);
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, reportPayload, id, navigate]);

  if (pError || visitsError)
    return <ErrorState onRetry={() => navigate(`/patients/${id}`)} />;

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner
        size="lg"
        label={
          visitIds.length > 0 && visitsLoading
            ? `Loading visit details (${visitIds.length})…`
            : 'Preparing print view...'
        }
      />
    </div>
  );
};

export default PatientPrintPage;