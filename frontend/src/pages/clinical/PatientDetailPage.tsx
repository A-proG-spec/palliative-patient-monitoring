import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientImaging } from '@/hooks/useImaging';
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
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import {
  AddRecordModal,
  PatientHeader,
  PatientDemographics,
  PatientTabs,
  AssessmentCards,
  VisitsTab,
  ProgressNotesTab,
  HospiceNursingTab,
  MedicationsTab,
  LabsTab,
  ImagingTab,
  ReferralsTab,
  AdmissionsTab,
  type PatientTab,
} from '@/components/patient';
import { ProgressNoteModal } from '@/components/patient/ProgressNoteModal';
import { useAuthStore } from '@/store/auth.store';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import {
  hasPermission,
  canAddAnyRecord,
  canDischarge,
  type StaffRole,
} from '@/config/permissions';
import { useToast } from '@/context/ToastContext';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<PatientTab>('Visits');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const userRole = (user?.role ?? '') as StaffRole;

  // ── Data fetching ──
  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!);
  const { data: progressNotesData } = useProgressNotes(id!);
  const { data: hospiceData } = usePatientHospiceAssessments(id!, { limit: 100 });
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: imagingData } = usePatientImaging(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);

  // ── Assessments (fetched for print) ──
  const { data: painData } = usePatientPainAssessments(id!, { limit: 100 });
  const { data: pharmacistData } = usePatientPharmacistAssessments(id!, { limit: 100 });
  const { data: physioData } = usePatientPhysiotherapyAssessments(id!, { limit: 100 });
  const { data: familyData } = usePatientFamilyAssessments(id!, { limit: 100 });
  const { data: nutritionData } = usePatientNutritionalAssessments(id!, { limit: 100 });
  const { data: socialData } = usePatientSocialAssessments(id!, { limit: 100 });
  const { data: spiritualData } = usePatientSpiritualAssessments(id!, { limit: 100 });
  const { data: psychiatryData } = usePatientPsychiatryAssessments(id!, { limit: 100 });

  // ── Derived tab visibility ──
  const canViewHospice = hasPermission(userRole, 'canViewHospiceNursing');

  const tabs = useMemo<PatientTab[]>(() => {
    const currentLocation = patient?.currentLocation ?? 'Home';
    const all: PatientTab[] = [
      'Visits', 'Progress Notes', 'Hospice Nursing',
      'Medications', 'Labs', 'Imaging', 'Referrals', 'Admissions',
    ];
    return all.filter((t) => {
      if (t === 'Progress Notes') return currentLocation === 'ReferredHospital';
      if (t === 'Visits') return currentLocation === 'Home';
      if (t === 'Hospice Nursing') return canViewHospice;
      return true;
    });
  }, [patient?.currentLocation, canViewHospice]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0]);
  }, [tabs, activeTab]);

  const locationState = location.state as {
    savedProgressNote?: boolean;
    savedHospiceAssessment?: boolean;
  } | null;

  useEffect(() => {
    if (locationState?.savedProgressNote && tabs.includes('Progress Notes')) {
      setActiveTab('Progress Notes');
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (locationState?.savedHospiceAssessment && tabs.includes('Hospice Nursing')) {
      setActiveTab('Hospice Nursing');
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState]);

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const tabCounts: Record<PatientTab, number> = {
    'Visits': visitsData?.total ?? 0,
    'Progress Notes': progressNotesData?.items?.length ?? 0,
    'Hospice Nursing': hospiceData?.items?.length ?? 0,
    'Medications': medsData?.total ?? 0,
    'Labs': labsData?.items?.length ?? 0,
    'Imaging': imagingData?.items?.length ?? 0,
    'Referrals': refsData?.total ?? 0,
    'Admissions': admsData?.total ?? 0,
  };

  // ═══════════════════════════════════════════════════════════
  // THE FIX — handlePrint that fetches FULL visit details
  // ═══════════════════════════════════════════════════════════
  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      // 1. Fetch full details for every visit in parallel.
      //    The list endpoint returns a light shape — the detail
      //    endpoint returns vitals, ADL, pain, symptoms, etc.
      const visitIds = (visitsData?.items ?? []).map((v) => String(v.id));

      const visitDetails = await Promise.all(
        visitIds.map((visitId) =>
          queryClient
            .fetchQuery({
              queryKey: ['patients', id, 'visits', visitId],
              queryFn: () => visitApi.getById(id!, visitId),
              staleTime: 0,
            })
            .catch(() => null),
        ),
      );

      // 2. Merge list items with their detail records.
      const fullVisits = (visitsData?.items ?? []).map((listItem, i) => ({
        ...listItem,
        ...(visitDetails[i] ?? {}),
      }));

      // 3. Build the complete payload with EVERYTHING.
      printPatientReport({
        patient,
        visits: fullVisits,

        medications: medsData?.items ?? [],
        labs: labsData?.items ?? [],
        referrals: refsData?.items ?? [],
        admissions: (admsData?.items ?? []) as unknown as HospitalAdmission[],

        // These were ALL missing before:
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
      });
    } catch (err) {
      toast.error('Failed to prepare the print report. Please try again.');
      console.error('[Print] Failed:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleAddRecord = (route: string) => {
    setShowAddRecord(false);
    navigate(route);
  };

  const isAddRecordDisabled = patient.status === 'Discharged';
  const showAddRecordButton =
    canAddAnyRecord(userRole) && !isAddRecordDisabled;
  const showDischargeButton =
    canDischarge(user) && patient.status === 'Active';

  return (
    <div className="space-y-6 max-w-5xl">
      <PatientHeader
        patient={patient}
        showAddRecordButton={showAddRecordButton}
        showDischargeButton={showDischargeButton}
        onAddRecord={() => setShowAddRecord(true)}
        onDischarge={() => navigate(`/patients/${id}/discharge`)}
        onPrint={handlePrint}
        isPrinting={isPrinting}
      />

      <PatientDemographics patient={patient} />

      <AssessmentCards patientId={id!} />

      <Card padding="none">
        <PatientTabs
          tabs={tabs}
          activeTab={activeTab}
          counts={tabCounts}
          onTabChange={setActiveTab}
        />

        <div className="p-5">
          {activeTab === 'Visits' && (
            <VisitsTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Progress Notes' && (
            <ProgressNotesTab
              patientId={id!}
              userRole={userRole}
              onSelectNote={setSelectedNoteId}
            />
          )}

          {activeTab === 'Hospice Nursing' && canViewHospice && (
            <HospiceNursingTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Medications' && (
            <MedicationsTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Labs' && (
            <LabsTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Imaging' && (
            <ImagingTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Referrals' && (
            <ReferralsTab patientId={id!} userRole={userRole} />
          )}

          {activeTab === 'Admissions' && (
            <AdmissionsTab patientId={id!} userRole={userRole} />
          )}
        </div>
      </Card>

      {showAddRecord && (
        <AddRecordModal
          patientId={id!}
          patientName={`${patient.firstName} ${patient.lastName}`}
          currentLocation={patient.currentLocation}
          userRole={userRole}
          onClose={() => setShowAddRecord(false)}
          onSelect={handleAddRecord}
        />
      )}

      {selectedNoteId && (
        <ProgressNoteModal
          patientId={id!}
          noteId={selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
          onEdit={(noteId) => {
            setSelectedNoteId(null);
            navigate(`/patients/${id}/progress-note/${noteId}/edit`);
          }}
        />
      )}
    </div>
  );
};

export default PatientDetailPage;