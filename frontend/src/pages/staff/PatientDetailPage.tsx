import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardList, Pill, FlaskConical, GitBranch, Building2, 
  BarChart2, FileText, Home, Hospital, Phone, MapPin, 
  Plus, ChevronRight as ChevronRightIcon, Printer, 
  Camera, Microscope, NotebookPen
} from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useProgressNotesStore } from '@/hooks/useProgressNotes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS, VISIT_TYPE_LABELS, OUTCOME_LABELS } from '@/constants';
import { printPatientReport } from '@/lib/printPatientReport';
import { APP_NAME } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

// ── Record Type Definitions ──────────────────────────────────────
interface RecordType {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: (id: string) => string;
  color?: string;
}

/** The visit-type entry is conditional: Home patients get a Home Visit Record,
 *  hospitalised patients get a Patient Progress Note instead. */
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

// ── Add Record Modal ─────────────────────────────────────────────
interface AddRecordModalProps {
  patientId: string;
  patientName: string;
  currentLocation: 'Home' | 'ReferredHospital';
  onClose: () => void;
  onSelect: (route: string) => void;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({ patientId, patientName, currentLocation, onClose, onSelect }) => {
  // Build the full list: conditional visit/progress-note + static remainder
  const allTypes = [getVisitRecordType(currentLocation), ...STATIC_RECORD_TYPES];
  const clinicalRecords = allTypes.filter(r => ['visit', 'progress-note', 'medication', 'lab', 'imaging'].includes(r.key));
  const referralRecords = allTypes.filter(r => ['referral', 'admission'].includes(r.key));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-record-title"
    >
      <div className="w-full max-w-lg bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Plus size={17} className="text-primary" />
            <h2 id="add-record-title" className="text-base font-semibold text-on-surface">
              Add Record
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Select the type of record to add for <span className="font-medium text-on-surface">{patientName}</span>
          </p>
        </div>

        {/* ── Record Type List ── */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Clinical Records */}
          <div className="px-4 py-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Clinical</p>
            {clinicalRecords.map((rt) => (
              <RecordTypeItem key={rt.key} recordType={rt} patientId={patientId} onSelect={onSelect} />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border-base my-2 mx-6" />

          {/* Referral Records */}
          <div className="px-4 py-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Referral & Admission</p>
            {referralRecords.map((rt) => (
              <RecordTypeItem key={rt.key} recordType={rt} patientId={patientId} onSelect={onSelect} />
            ))}
          </div>
        </div>

        {/* ── Cancel Button ── */}
        <div className="px-6 pb-5 pt-2 border-t border-border-base flex-shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Record Type Item ─────────────────────────────────────────────
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
        color
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

// ── Tabs ──────────────────────────────────────────────────────────
const tabs = ['Visits', 'Progress Notes', 'Medications', 'Labs', 'Imaging', 'Referrals', 'Admissions'] as const;
type Tab = typeof tabs[number];

// ── Main Component ──────────────────────────────────────────────
const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Visits');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Progress notes — select the raw notes array (stable reference), then filter
  // with useMemo so the derived array only changes when notes or id changes.
  const allProgressNotes = useProgressNotesStore((s) => s.notes);
  const progressNotes = useMemo(
    () => allProgressNotes.filter((n) => n.patientId === (id ?? '')),
    [allProgressNotes, id],
  );

  // If returning from the progress note form with a saved note, show Progress Notes tab
  const locationState = location.state as { savedProgressNote?: boolean } | null;
  React.useEffect(() => {
    if (locationState?.savedProgressNote) {
      setActiveTab('Progress Notes');
      // Clear the flag so re-renders don't re-trigger
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const { data: visitsData } = usePatientVisits(id!);
  const { data: medsData } = usePatientMedications(id!);
  const { data: labsData } = usePatientLabs(id!);
  const { data: refsData } = usePatientReferrals(id!);
  const { data: admsData } = usePatientAdmissions(id!);

  // ── Filter lab tests to show only lab orders (not imaging) ──
  const labOrders = labsData?.items?.filter(l => 
    !l.testName?.includes('XRay') && 
    !l.testName?.includes('Ultrasound') && 
    !l.testName?.includes('CT') && 
    !l.testName?.includes('MRI') &&
    !l.testName?.includes('Mammography') &&
    !l.testName?.includes('Fluoroscopy')
  ) || [];

  // ── Filter imaging orders ──
  const imagingOrders = labsData?.items?.filter(l => 
    l.testName?.includes('XRay') || 
    l.testName?.includes('Ultrasound') || 
    l.testName?.includes('CT') || 
    l.testName?.includes('MRI') ||
    l.testName?.includes('Mammography') ||
    l.testName?.includes('Fluoroscopy')
  ) || [];

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

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
        admissions: admsData?.items ?? [],
        appName: APP_NAME,
      });
      setIsPrinting(false);
    }, 50);
  };

  const handleAddRecord = (route: string) => {
    setShowAddRecord(false);
    navigate(route);
  };

  // Disable Add Record button if patient is Discharged
  const isAddRecordDisabled = patient.status === 'Discharged';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to="/patients" label="Patients" />
          <div>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
            <h1 className="text-xl font-bold text-on-surface">{patient.firstName} {patient.lastName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={patient.status} type="patient" />
          <StatusBadge status={patient.currentLocation} />
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowAddRecord(true)}
            disabled={isAddRecordDisabled}
            title={isAddRecordDisabled ? 'Cannot add records for discharged patients' : ''}
          >
            Add Record
          </Button>
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
            <div className="flex items-center gap-2"><MapPin size={12} className="text-text-muted" /><span className="text-text-secondary">{patient.address}</span></div>
            <div className="flex items-center gap-2"><Phone size={12} className="text-text-muted" /><span className="text-text-secondary">{patient.phone}</span></div>
            <InfoRow label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <InfoRow label="Caregiver" value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
          </div>
        </Card>
        <Card padding="md">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-on-surface mb-3">Medical Information</h3>
            <InfoRow label="Primary Diagnosis" value={patient.primaryDiagnosis} />
            {patient.secondaryDiagnoses?.length > 0 && <InfoRow label="Secondary" value={patient.secondaryDiagnoses.join(', ')} />}
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Stage:</span>
              <Badge variant="secondary">{DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</Badge>
            </div>
            <InfoRow label="Prognosis" value={patient.estimatedPrognosis} />
            {patient.comorbidities?.length > 0 && <InfoRow label="Comorbidities" value={patient.comorbidities.join(', ')} />}
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
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
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
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Date', 'Type', 'Status', 'Outcome', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {visitsData.items.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/visits/${v.id}`)}>
                      <td className="py-3 pr-4">{formatDate(v.visitDate)}</td>
                      <td className="py-3 pr-4"><Badge variant="secondary">{VISIT_TYPE_LABELS[v.visitType] || v.visitType}</Badge></td>
                      <td className="py-3 pr-4"><StatusBadge status={v.overallStatus} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={v.outcome} type="visit" /></td>
                      <td className="py-3 text-text-muted text-xs">PPS {v.ppsScore}% · KPS {v.kpsScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No visits recorded" description="Record the first home visit for this patient." actionLabel="Record Visit" onAction={() => navigate(`/patients/${id}/visits`)} />
            )
          )}

          {/* ── Progress Notes Tab ── */}
          {activeTab === 'Progress Notes' && (
            progressNotes.length ? (
              <div className="space-y-3">
                {progressNotes.map((note) => (
                  <div key={note.id} className="border border-border-base rounded-xl p-4 hover:bg-surface-low/40 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge variant="primary">
                            <NotebookPen size={11} className="mr-0.5" />
                            Progress Note
                          </Badge>
                          <span className="text-xs text-text-muted">{formatDate(note.date)} {note.time && `· ${note.time}`}</span>
                          {note.attendingClinician && (
                            <span className="text-xs text-text-muted">· {note.attendingClinician}</span>
                          )}
                        </div>
                        {note.generalCondition && (
                          <p className="text-sm text-on-surface">
                            <span className="text-text-muted">Condition:</span>{' '}
                            <span className="font-medium">{note.generalCondition}</span>
                            {note.overallAssessment && (
                              <span className="text-text-secondary"> — {note.overallAssessment}</span>
                            )}
                          </p>
                        )}
                        {note.soapSubjective && (
                          <p className="text-xs text-text-muted mt-1 truncate max-w-lg">
                            S: {note.soapSubjective}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No progress notes recorded"
                description="Progress notes are recorded for hospitalised patients. Record the first one."
                actionLabel="Record Progress Note"
                onAction={() => navigate(`/patients/${id}/progress-note/new`)}
              />
            )
          )}

          {/* ── Medications Tab ── */}
          {activeTab === 'Medications' && (
            medsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Medication', 'Dosage', 'Frequency', 'Route', 'Admin At', 'Status', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {medsData.items.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/medications/${m.id}`)}>
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
              <EmptyState title="No medications ordered" actionLabel="Order Medication" onAction={() => navigate(`/patients/${id}/medications`)} />
            )
          )}

          {/* ── Labs Tab ── */}
          {activeTab === 'Labs' && (
            labOrders.length ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Test', 'Ordered', 'Performed', 'Location', 'Status', 'Result'].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {labOrders.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/labs/${l.id}`)}>
                      <td className="py-3 pr-4 font-medium">{l.testName}</td>
                      <td className="py-3 pr-4 text-text-secondary">{formatDate(l.dateOrdered)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.datePerformed ? formatDate(l.datePerformed) : '—'}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.location}</td>
                      <td className="py-3 pr-4"><StatusBadge status={l.status} type="lab" /></td>
                      <td className="py-3 text-text-muted text-xs max-w-[150px] truncate">{l.result || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No lab tests ordered" actionLabel="Order Lab Test" onAction={() => navigate(`/patients/${id}/labs`)} />
            )
          )}

          {/* ── Imaging Tab ── */}
          {activeTab === 'Imaging' && (
            imagingOrders.length ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Modality', 'Body Region', 'Ordered', 'Performed', 'Status', 'Report'].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {imagingOrders.map((img) => {
                    // Extract modality from test name
                    const modality = img.testName.split(' - ')[0] || img.testName;
                    const bodyRegion = img.testName.split(' - ')[1] || '';
                    
                    return (
                      <tr key={img.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/labs/${img.id}`)}>
                        <td className="py-3 pr-4">
                          <Badge variant="primary">{modality}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{bodyRegion || '—'}</td>
                        <td className="py-3 pr-4 text-text-secondary">{formatDate(img.dateOrdered)}</td>
                        <td className="py-3 pr-4 text-text-secondary">{img.datePerformed ? formatDate(img.datePerformed) : '—'}</td>
                        <td className="py-3 pr-4"><StatusBadge status={img.status} type="lab" /></td>
                        <td className="py-3 text-text-muted text-xs max-w-[150px] truncate">{img.result ? 'View Report' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No imaging orders" actionLabel="Order Imaging" onAction={() => navigate(`/patients/${id}/imaging`)} />
            )
          )}

          {/* ── Referrals Tab ── */}
          {activeTab === 'Referrals' && (
            refsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Date', 'Type', 'Receiving Facility', 'Status', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {refsData.items.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/referrals/${r.id}`)}>
                      <td className="py-3 pr-4">{formatDate(r.referralDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.referralType}</td>
                      <td className="py-3 pr-4 text-text-secondary truncate max-w-[200px]">{r.receivingFacility}</td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} type="referral" /></td>
                      <td className="py-3 text-xs text-text-muted">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No referrals requested" actionLabel="Request Referral" onAction={() => navigate(`/patients/${id}/referrals`)} />
            )
          )}

          {/* ── Admissions Tab ── */}
          {activeTab === 'Admissions' && (
            admsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-text-muted">
                  {['Admission Date', 'Bed', 'Ward', 'Physician', 'Status', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border-base">
                  {admsData.items.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-low cursor-pointer" onClick={() => navigate(`/patients/${id}/admissions/${a.id}`)}>
                      <td className="py-3 pr-4">{formatDate(a.admissionDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.bedNumber}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.ward}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.admittingPhysician}</td>
                      <td className="py-3 pr-4"><StatusBadge status={a.status} type="admission" /></td>
                      <td className="py-3 text-xs text-text-muted">{a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No admissions recorded" actionLabel="Record Admission" onAction={() => navigate(`/patients/${id}/admissions`)} />
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
          onClose={() => setShowAddRecord(false)}
          onSelect={handleAddRecord}
        />
      )}
    </div>
  );
};

// ── Info Row Component ───────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-text-muted">{label}: </span><span className="text-on-surface">{value || '—'}</span></div>
);

export default PatientDetailPage;