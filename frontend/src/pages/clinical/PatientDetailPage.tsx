import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientImaging } from '@/hooks/useImaging';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { usePatientHospiceAssessments } from '@/hooks/useHospiceNursing';
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
  type StaffRole,
} from '@/config/permissions';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<PatientTab>('Visits');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const userRole = (user?.role ?? '') as StaffRole;

  // ── Data fetching (same hooks as before) ──
  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!);
  const { data: progressNotesData } = useProgressNotes(id!);
  const { data: hospiceData } = usePatientHospiceAssessments(id!, { limit: 100 });
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: imagingData } = usePatientImaging(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);

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

  // ── Post-save tab restoration ──
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  // ── Tab counts ──
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

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      printPatientReport({
        patient,
        visits: visitsData?.items ?? [],
        medications: medsData?.items ?? [],
        labs: labsData?.items ?? [],
        referrals: refsData?.items ?? [],
        admissions: (admsData?.items ?? []) as unknown as HospitalAdmission[],
        appName: APP_NAME,
      });
      setIsPrinting(false);
    }, 50);
  };

  const handleAddRecord = (route: string) => {
    setShowAddRecord(false);
    navigate(route);
  };

  const isAddRecordDisabled = patient.status === 'Discharged';
  const showAddRecordButton =
    canAddAnyRecord(userRole) && !isAddRecordDisabled;

  // ── Render ──
  return (
    <div className="space-y-6 max-w-5xl">
      <PatientHeader
        patient={patient}
        showAddRecordButton={showAddRecordButton}
        onAddRecord={() => setShowAddRecord(true)}
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
