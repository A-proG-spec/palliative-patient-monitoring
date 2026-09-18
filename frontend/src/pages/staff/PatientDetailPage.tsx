import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardList, Pill, FlaskConical, GitBranch, Building2,
  BarChart2, FileText, Home, Hospital, Phone, MapPin,
  Plus, ChevronRight as ChevronRightIcon, Printer,
  Camera, NotebookPen,
} from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientImaging } from '@/hooks/useImaging';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import type { HospitalAdmission } from '@/types/admission.types';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS, VISIT_TYPE_LABELS } from '@/constants';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import { ProgressNoteModal } from '@/components/patient/ProgressNoteModal';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, canAddAnyRecord, type StaffRole } from '@/config/permissions';

// ═════════════════════════════════════════════════════════════
// Module-level constants (do NOT reference `patient` here)
// ═════════════════════════════════════════════════════════════

const ALL_TABS = [
  'Visits',
  'Progress Notes',
  'Medications',
  'Labs',
  'Imaging',
  'Referrals',
  'Admissions',
] as const;

type Tab = typeof ALL_TABS[number];

// ── Record Type Definitions ──────────────────────────────────
interface RecordType {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: (id: string) => string;
  color?: string;
}

function getVisitRecordType(currentLocation: 'Home' | 'ReferredHospital'): RecordType {
  if (currentLocation === 'ReferredHospital') {
    return {
      key: 'progress-note',
      label: 'Patient Progress Note',
      description: 'Record a clinical progress note for a hospitalised or facility-based patient.',
      icon: <NotebookPen size={20} />,
      route: (id) => `/patients/${id}/progress-note/new`,
      color: 'text-teal-600',
    };
  }
  return {
    key: 'visit',
    label: 'Home Visit Record',
    description: 'Record a home visit, vitals, pain assessment, and care observations.',
    icon: <ClipboardList size={20} />,
    route: (id) => `/patients/${id}/visits`,
    color: 'text-blue-600',
  };
}

const STATIC_RECORD_TYPES: RecordType[] = [
  {
    key: 'medication',
    label: 'Medication Order',
    description: 'Order or document a medication for this patient.',
    icon: <Pill size={20} />,
    route: (id) => `/patients/${id}/medications`,
    color: 'text-green-600',
  },
  {
    key: 'lab',
    label: 'Lab Test Order',
    description: 'Request a laboratory test (blood, urine, microbiology, etc.).',
    icon: <FlaskConical size={20} />,
    route: (id) => `/patients/${id}/labs`,
    color: 'text-purple-600',
  },
  {
    key: 'imaging',
    label: 'Imaging Order',
    description: 'Request imaging examination (X-Ray, CT, MRI, Ultrasound, etc.).',
    icon: <Camera size={20} />,
    route: (id) => `/patients/${id}/imaging`,
    color: 'text-indigo-600',
  },
  {
    key: 'referral',
    label: 'Referral Request',
    description: 'Submit a referral to another facility or specialist.',
    icon: <GitBranch size={20} />,
    route: (id) => `/patients/${id}/referrals`,
    color: 'text-orange-600',
  },
  {
    key: 'admission',
    label: 'Hospital Admission',
    description: 'Record a hospital admission linked to an accepted referral.',
    icon: <Building2 size={20} />,
    route: (id) => `/patients/${id}/admissions`,
    color: 'text-red-600',
  },
];

// ═════════════════════════════════════════════════════════════
// Add Record Modal
// ═════════════════════════════════════════════════════════════

interface AddRecordModalProps {
  patientId: string;
  patientName: string;
  currentLocation: 'Home' | 'ReferredHospital';
  userRole: StaffRole;
  onClose: () => void;
  onSelect: (route: string) => void;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  patientId, patientName, currentLocation, userRole, onClose, onSelect,
}) => {
  const allTypes = [getVisitRecordType(currentLocation), ...STATIC_RECORD_TYPES];
  
  // Filter record types based on user permissions
  const allowedTypes = allTypes.filter((r) => {
    switch (r.key) {
      case 'visit':
      case 'progress-note':
        return hasPermission(userRole, 'canRecordVisit');
      case 'medication':
        return hasPermission(userRole, 'canOrderMedication');
      case 'lab':
        return hasPermission(userRole, 'canOrderLab');
      case 'imaging':
        return hasPermission(userRole, 'canOrderImaging');
      case 'referral':
        return hasPermission(userRole, 'canCreateReferral');
      case 'admission':
        return hasPermission(userRole, 'canRecordAdmission');
      default:
        return false;
    }
  });
  
  const clinicalRecords = allowedTypes.filter((r) =>
    ['visit', 'progress-note', 'medication', 'lab', 'imaging'].includes(r.key),
  );
  const referralRecords = allowedTypes.filter((r) =>
    ['referral', 'admission'].includes(r.key),
  );

  const hasAnyActions = allowedTypes.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-record-title"
    >
      <div className="w-full max-w-lg bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Plus size={17} className="text-primary" />
            <h2 id="add-record-title" className="text-base font-semibold text-on-surface">
              Add Record
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Select the type of record to add for{' '}
            <span className="font-medium text-on-surface">{patientName}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {!hasAnyActions ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-text-muted">
                You don't have permission to add any records for this patient.
              </p>
            </div>
          ) : (
            <>
              {clinicalRecords.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Clinical
                  </p>
                  {clinicalRecords.map((rt) => (
                    <RecordTypeItem key={rt.key} recordType={rt} patientId={patientId} onSelect={onSelect} />
                  ))}
                </div>
              )}

              {clinicalRecords.length > 0 && referralRecords.length > 0 && (
                <div className="border-t border-border-base my-2 mx-6" />
              )}

              {clinicalRecords.length > 0 && referralRecords.length > 0 && (
                <div className="border-t border-border-base my-2 mx-6" />
              )}

              {referralRecords.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Referral &amp; Admission
                  </p>
                  {referralRecords.map((rt) => (
                    <RecordTypeItem key={rt.key} recordType={rt} patientId={patientId} onSelect={onSelect} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-5 pt-2 border-t border-border-base flex-shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const RecordTypeItem: React.FC<{
  recordType: RecordType;
  patientId: string;
  onSelect: (route: string) => void;
}> = ({ recordType, patientId, onSelect }) => {
  const color = recordType.color || 'text-primary';
  return (
    <button
      onClick={() => onSelect(recordType.route(patientId))}
      className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-low transition-colors group rounded-lg"
    >
      <div className={cn(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light group-hover:bg-primary group-hover:text-white transition-colors',
        color,
      )}>
        {recordType.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
          {recordType.label}
        </p>
        <p className="text-xs text-text-muted leading-relaxed mt-0.5">
          {recordType.description}
        </p>
      </div>
      <ChevronRightIcon size={15} className="text-outline-variant flex-shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('Visits');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const userRole = (user?.role ?? '') as StaffRole;

  // ── Primary patient data ──
  const { data: patient, isLoading, error, refetch } = usePatient(id!);

  // ── Sub-record data ──
  const { data: visitsData } = usePatientVisits(id!);
  const { data: progressNotesData } = useProgressNotes(id!);
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: imagingData } = usePatientImaging(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);

  const progressNotes = progressNotesData?.items ?? [];
  const labOrders = labsData?.items ?? [];
  const imagingOrders = imagingData?.items ?? [];

  // ── Location-driven tab list ──
  // Home patients: Home Visits + everything else
  // Hospitalised patients: Progress Notes instead of Visits
  const tabs = useMemo<Tab[]>(() => {
    const currentLocation = patient?.currentLocation ?? 'Home';
    return ALL_TABS.filter((t) => {
      if (t === 'Progress Notes') return currentLocation === 'ReferredHospital';
      return true;
    });
  }, [patient?.currentLocation]);

  // If the current active tab is no longer visible (patient moved
  // home ↔ hospital), reset to the first visible tab.
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  // If returning from the progress note form with a saved note, show
  // Progress Notes tab — but only if it's actually visible.
  const locationState = location.state as { savedProgressNote?: boolean } | null;
  useEffect(() => {
    if (locationState?.savedProgressNote && tabs.includes('Progress Notes')) {
      setActiveTab('Progress Notes');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !patient) {
    if (isLoading) return <PageLoader />;
    return <ErrorState onRetry={refetch} />;
  }
  if (error) return <ErrorState onRetry={refetch} />;

  // ── Tab counts ──
  const tabCounts: Record<Tab, number> = {
    Visits: visitsData?.total ?? 0,
    'Progress Notes': progressNotes.length,
    Medications: medsData?.total ?? 0,
    Labs: labOrders.length,
    Imaging: imagingOrders.length,
    Referrals: refsData?.total ?? 0,
    Admissions: admsData?.total ?? 0,
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
  const showAddRecordButton = canAddAnyRecord(userRole) && !isAddRecordDisabled;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to="/patients" label="Patients" />
          <div>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
            <h1 className="text-xl font-bold text-on-surface">
              {patient.firstName} {patient.lastName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={patient.status} type="patient" />
          <StatusBadge status={patient.currentLocation} />
          {showAddRecordButton && (
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setShowAddRecord(true)}
            >
              Add Record
            </Button>
          )}
          <Button variant="outline" size="sm" leftIcon={<FileText size={14} />} onClick={() => navigate(`/patients/${id}/summary`)}>
            Summary
          </Button>
          <Button variant="outline" size="sm" leftIcon={<BarChart2 size={14} />} onClick={() => navigate(`/patients/${id}/progress`)}>
            Progress
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={14} />}
            loading={isPrinting}
            onClick={handlePrint}
          >
            Print History
          </Button>
        </div>
      </div>

      {/* ── Demographics ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card padding="md">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-on-surface mb-3">Patient Information</h3>
            <InfoRow label="Age / Sex" value={`${patient.age} years · ${patient.sex}`} />
            <InfoRow label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-text-muted" />
              <span className="text-text-secondary">{patient.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-text-muted" />
              <span className="text-text-secondary">{patient.phone}</span>
            </div>
            <InfoRow label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <InfoRow label="Caregiver" value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
          </div>
        </Card>
        <Card padding="md">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-on-surface mb-3">Medical Information</h3>
            <InfoRow label="Primary Diagnosis" value={patient.primaryDiagnosis} />
            {patient.secondaryDiagnoses?.length > 0 && (
              <InfoRow label="Secondary" value={patient.secondaryDiagnoses.join(', ')} />
            )}
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Stage:</span>
              <Badge variant="secondary">{DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</Badge>
            </div>
            <InfoRow label="Prognosis" value={patient.estimatedPrognosis} />
            {patient.comorbidities?.length > 0 && (
              <InfoRow label="Comorbidities" value={patient.comorbidities.join(', ')} />
            )}
          </div>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Card padding="none">
        <div className="flex border-b border-border-base overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low',
              )}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-text-secondary px-1">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Visits Tab ── */}
          {activeTab === 'Visits' && (
            visitsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Status', 'Outcome', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {visitsData.items.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/visits/${v.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(v.visitDate)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{VISIT_TYPE_LABELS[v.visitType] || v.visitType}</Badge>
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={v.overallStatus} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={v.outcome} type="visit" /></td>
                      <td className="py-3 text-text-muted text-xs">PPS {v.ppsScore}% · KPS {v.kpsScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No visits recorded"
                description="Record the first home visit for this patient."
                {...(hasPermission(userRole, 'canRecordVisit') && {
                  actionLabel: "Record Visit",
                  onAction: () => navigate(`/patients/${id}/visits`)
                })}
              />
            )
          )}

          {/* ── Progress Notes Tab ── */}
          {activeTab === 'Progress Notes' && (
            progressNotes.length ? (
              <div className="space-y-0 divide-y divide-border-base">
                {progressNotes.map((note) => (
                  <button
                    key={note.id}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    onClick={() => setSelectedNoteId(note.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedNoteId(note.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-on-surface">
                          {formatDate(note.createdAt)}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-secondary">
                          {note.attendingClinician || '—'}
                        </span>
                        {note.allSigned && (
                          <>
                            <span className="text-xs text-text-muted">·</span>
                            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                              All Signed
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary truncate">
                        {note.generalCondition || 'No condition summary recorded'}
                      </p>
                    </div>
                    <ChevronRightIcon size={16} className="text-outline-variant flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No progress notes recorded"
                description="Progress notes are recorded for hospitalised patients. Record the first one."
                {...(hasPermission(userRole, 'canCreateProgressNote') && {
                  actionLabel: "Record Progress Note",
                  onAction: () => navigate(`/patients/${id}/progress-note/new`)
                })}
              />
            )
          )}

          {/* ── Medications Tab ── */}
          {activeTab === 'Medications' && (
            medsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Medication', 'Dosage', 'Frequency', 'Route', 'Admin At', 'Status', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {medsData.items.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/medications/${m.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{m.name}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.dosage}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.frequency}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.route}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.administeredAt}</td>
                      <td className="py-3 pr-4"><StatusBadge status={m.status} type="medication" /></td>
                      <td className="py-3 text-text-muted text-xs">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No medications ordered"
                {...(hasPermission(userRole, 'canOrderMedication') && {
                  actionLabel: "Order Medication",
                  onAction: () => navigate(`/patients/${id}/medications`)
                })}
              />
            )
          )}

          {/* ── Labs Tab ── */}
          {activeTab === 'Labs' && (
            labOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Test', 'Ordered', 'Performed', 'Location', 'Status', 'Result'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {labOrders.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/labs/${l.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{l.testName}</td>
                      <td className="py-3 pr-4 text-text-secondary">{formatDate(l.dateOrdered)}</td>
                      <td className="py-3 pr-4 text-text-secondary">
                        {l.datePerformed ? formatDate(l.datePerformed) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">{l.location}</td>
                      <td className="py-3 pr-4"><StatusBadge status={l.status} type="lab" /></td>
                      <td className="py-3 text-text-muted text-xs max-w-[150px] truncate">
                        {l.result || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No lab tests ordered"
                {...(hasPermission(userRole, 'canOrderLab') && {
                  actionLabel: "Order Lab Test",
                  onAction: () => navigate(`/patients/${id}/labs`)
                })}
              />
            )
          )}

          {/* ── Imaging Tab ── */}
          {activeTab === 'Imaging' && (
            imagingOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Modality', 'Body Region', 'Ordered', 'Performed', 'Status', 'Report'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {imagingOrders.map((img) => {
                    const hasReport = !!(img.report && img.report.findings);
                    return (
                      <tr
                        key={img.id}
                        className="hover:bg-surface-low cursor-pointer"
                        onClick={() => navigate(`/patients/${id}/imaging/${img.id}`)}
                      >
                        <td className="py-3 pr-4">
                          <Badge variant="primary">{img.modality}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{img.bodyRegion || '—'}</td>
                        <td className="py-3 pr-4 text-text-secondary">
                          {img.dateOrdered ? formatDate(img.dateOrdered) : formatDate(img.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">
                          {img.performedAt ? formatDate(img.performedAt) : '—'}
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={img.status} type="lab" /></td>
                        <td className="py-3 text-text-muted text-xs">
                          {hasReport ? 'Available' : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No imaging orders"
                {...(hasPermission(userRole, 'canOrderImaging') && {
                  actionLabel: "Order Imaging",
                  onAction: () => navigate(`/patients/${id}/imaging`)
                })}
              />
            )
          )}

          {/* ── Referrals Tab ── */}
          {activeTab === 'Referrals' && (
            refsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Receiving Facility', 'Status', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {refsData.items.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/referrals/${r.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(r.referralDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.referralType}</td>
                      <td className="py-3 pr-4 text-text-secondary truncate max-w-[200px]">
                        {r.receivingFacility}
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} type="referral" /></td>
                      <td className="py-3 text-xs text-text-muted">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No referrals requested"
                {...(hasPermission(userRole, 'canCreateReferral') && {
                  actionLabel: "Request Referral",
                  onAction: () => navigate(`/patients/${id}/referrals`)
                })}
              />
            )
          )}

          {/* ── Admissions Tab ── */}
          {activeTab === 'Admissions' && (
            admsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Admission Date', 'Bed', 'Ward', 'Physician', 'Status', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {admsData.items.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/admissions/${a.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(a.admissionDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.bedNumber}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.ward}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.admittingPhysician}</td>
                      <td className="py-3 pr-4"><StatusBadge status={a.status} type="admission" /></td>
                      <td className="py-3 text-xs text-text-muted">
                        {a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No admissions recorded"
                {...(hasPermission(userRole, 'canRecordAdmission') && {
                  actionLabel: "Record Admission",
                  onAction: () => navigate(`/patients/${id}/admissions`)
                })}
              />
            )
          )}
        </div>
      </Card>

      {/* ── Add Record Modal ── */}
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

      {/* ── Progress Note Modal ── */}
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

// ── Info Row Component ───────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string; children?: React.ReactNode }> = ({
  label, value, children,
}) => (
  <div>
    <span className="text-text-muted">{label}: </span>
    {children || <span className="text-on-surface">{value || '—'}</span>}
  </div>
);

export default PatientDetailPage;

// Named export for unit testing only — not part of the public API
export { AddRecordModal };
