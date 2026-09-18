import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  XCircle, Phone, MapPin, User, Calendar, FileText, Printer,
  AlertTriangle, NotebookPen,
} from 'lucide-react';
import { useAdminPatientDetail } from '@/hooks/useAdmin';
import { useDischargeSummary } from '@/hooks/useDischarge';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientImaging } from '@/hooks/useImaging';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS as DSL, VISIT_TYPE_LABELS } from '@/constants';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';
import { printDischargeSummary } from '@/lib/printDischargeSummary';

// ── Discharge summary viewer modal ────────────────────────────────
interface DischargeSummaryViewerProps {
  summary: DischargeSummary;
  patientName: string;
  onClose: () => void;
  onPrint: () => void;
}

const DischargeSummaryViewer: React.FC<DischargeSummaryViewerProps> = ({
  summary, patientName, onClose, onPrint,
}) => {
  const rows: [string, string][] = [
    ['Patient', summary.fullName || patientName],
    ['Hospital / Facility', summary.hospitalName],
    ['Palliative Care Unit', summary.palliativeCareUnit],
    ['Date of Admission', summary.dateOfAdmission ? formatDate(summary.dateOfAdmission) : '—'],
    ['Date of Discharge', summary.dateOfDischarge ? formatDate(summary.dateOfDischarge) : '—'],
    ['Time of Discharge', summary.timeOfDischarge || '—'],
    ['Discharge Type', summary.dischargeType === 'Other' ? `Other — ${summary.dischargeTypeOther}` : summary.dischargeType || '—'],
    ['Discharged To', summary.dischargedTo === 'Other' ? `Other — ${summary.dischargedToOther}` : summary.dischargedTo || '—'],
    ['Overall Condition', summary.overallCondition || '—'],
    ['Primary Diagnosis', summary.primaryDiagnosis || '—'],
    ['Final Discharge Diagnosis', summary.finalDischargeDiagnosis || '—'],
    ['Pain Score at Discharge', summary.painScore ? `${summary.painScore} / 10` : '—'],
    ['Pain Control', summary.painControl || '—'],
    ['Medication Reconciliation', summary.medicationReconciliation || '—'],
    ['Code Status', summary.codeStatus || '—'],
    ['Transport', summary.transport || '—'],
    ['Submitted By', summary.submittedBy || '—'],
    ['Submitted At', summary.submittedAt
      ? new Date(summary.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-on-surface/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-4 bg-surface-lowest rounded-2xl border border-border-base shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-primary" />
            <div>
              <h2 className="text-base font-semibold text-on-surface">Discharge Summary</h2>
              <p className="text-xs text-text-muted mt-0.5">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <XCircle size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="divide-y divide-border-base">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start gap-3 py-2.5 text-sm">
                <span className="text-text-muted min-w-[180px] flex-shrink-0 text-xs pt-0.5">{label}</span>
                <span className="text-on-surface font-medium">{value}</span>
              </div>
            ))}
          </div>

          {summary.dischargeNotes && (
            <div className="mt-4">
              <p className="text-xs font-medium text-text-muted mb-1.5">Discharge Notes</p>
              <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                {summary.dischargeNotes}
              </div>
            </div>
          )}

          <p className="text-xs text-text-muted mt-4">
            This is a summary view. Use "Print / Save as PDF" to see the full discharge form with all sections.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            leftIcon={<Printer size={14} />}
            onClick={onPrint}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────
const tabs = ['Visits', 'Progress Notes', 'Medications', 'Labs', 'Imaging', 'Referrals', 'Admissions'] as const;
type Tab = typeof tabs[number];

// ── Main page ─────────────────────────────────────────────────────
const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<Tab>('Visits');
  const [showDischargeSummaryViewer, setShowDischargeSummaryViewer] = useState(false);

  // ── Discharge summary ──
  // Try router state first (set by DischargePatientPage on success),
  // then fall back to the API for persisted summaries.
  const locationState = (location.state as { dischargeSummary?: DischargeSummary } | null) ?? null;
  const { data: fetchedDischargeSummary } = useDischargeSummary(patientId!);
  const dischargeSummary: DischargeSummary | null =
    locationState?.dischargeSummary ?? fetchedDischargeSummary ?? null;

  // ── Primary patient data ──
  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);

  // ── Sub-record data (each has its own endpoint now) ──
  const { data: visitsData } = usePatientVisits(patientId!);
  const { data: medsData } = usePatientMedications(patientId!);
  const { data: labsData } = usePatientLabs(patientId!);
  const { data: imagingData } = usePatientImaging(patientId!);
  const { data: refsData } = usePatientReferrals(patientId!);
  const { data: admsData } = usePatientAdmissions(patientId!);
  const { data: progressNotesData } = useProgressNotes(patientId!);

  const progressNotes = progressNotesData?.items ?? [];
  const labOrders = labsData?.items ?? [];
  const imagingOrders = imagingData?.items ?? [];

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

  const handlePrintDischargeSummary = () => {
    if (dischargeSummary) printDischargeSummary(dischargeSummary);
  };

  const dischargedOnLabel = dischargeSummary?.dateOfDischarge
    ? formatDate(dischargeSummary.dateOfDischarge)
    : patient.status === 'Discharged' ? 'previously' : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to="/admin/patients" label="All Patients" />
          <div>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
            <h1 className="text-xl font-bold text-on-surface">{patient.firstName} {patient.lastName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={patient.status} type="patient" />
          <StatusBadge status={patient.currentLocation} />

          {patient.status === 'Active' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<AlertTriangle size={14} className="text-warning" />}
              className="border-warning/50 text-warning hover:bg-warning/10 hover:border-warning"
              onClick={() => navigate(`/admin/patients/${patientId}/discharge`)}
            >
              Discharge Patient
            </Button>
          )}

          {patient.status === 'Discharged' && dischargeSummary && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={() => setShowDischargeSummaryViewer(true)}
            >
              View Discharge Summary
            </Button>
          )}

          {patient.status === 'Discharged' && !dischargeSummary && dischargedOnLabel && (
            <span className="text-xs text-text-muted px-2 py-1 rounded-lg border border-border-base bg-surface-low">
              Discharged {dischargedOnLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Demographics + Medical cards ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={<User size={14} />}     label="Name"              value={`${patient.firstName} ${patient.lastName}`} />
            <Row icon={<Calendar size={14} />} label="Date of Birth"     value={formatDate(patient.dateOfBirth)} />
            <Row                               label="Age / Sex"         value={`${patient.age} years · ${patient.sex}`} />
            <Row icon={<MapPin size={14} />}   label="Address"           value={patient.address} />
            <Row icon={<Phone size={14} />}    label="Phone"             value={patient.phone} />
            <Row                               label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <Row                               label="Caregiver"         value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Primary Diagnosis" value={patient.primaryDiagnosis} />
            {patient.secondaryDiagnoses?.length > 0 && (
              <Row label="Secondary" value={patient.secondaryDiagnoses.join(', ')} />
            )}
            <Row label="Disease Stage">
              <Badge variant="secondary">{DSL[patient.diseaseStage] ?? patient.diseaseStage}</Badge>
            </Row>
            <Row label="Prognosis" value={patient.estimatedPrognosis} />
            {patient.comorbidities?.length > 0 && (
              <Row label="Comorbidities" value={patient.comorbidities.join(', ')} />
            )}
            <Row label="Registered" value={formatDate(patient.createdAt)} />
            {dischargeSummary && (
              <Row label="Discharged">
                <button
                  onClick={() => setShowDischargeSummaryViewer(true)}
                  className="text-primary text-xs underline underline-offset-2 hover:text-primary-hover transition-colors"
                >
                  {dischargeSummary.dateOfDischarge
                    ? formatDate(dischargeSummary.dateOfDischarge)
                    : 'View summary'}
                </button>
              </Row>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Tabbed records ── */}
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

        <div className="p-5 overflow-x-auto">
          {/* Visits */}
          {activeTab === 'Visits' && (
            visitsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Status', 'Outcome', 'Scores'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {visitsData.items.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/visits/${v.id}`)}
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
              <EmptyState title="No visits recorded" description="No home visits have been recorded for this patient yet." />
            )
          )}

          {/* Progress Notes */}
          {activeTab === 'Progress Notes' && (
            progressNotes.length ? (
              <div className="space-y-3">
                {progressNotes.map((note) => {
                  // The backend list DTO does not include a `date`/`time`
                  // string — derive from createdAt.
                  const created = note.createdAt ? new Date(note.createdAt) : null;
                  const dateLabel = created ? formatDate(created.toISOString()) : '—';
                  const timeLabel = created
                    ? created.toTimeString().slice(0, 5)
                    : '';

                  return (
                    <div
                      key={note.id}
                      className="border border-border-base rounded-xl p-4 hover:bg-surface-low/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <Badge variant="primary">
                              <NotebookPen size={11} className="mr-0.5" />
                              Progress Note
                            </Badge>
                            <span className="text-xs text-text-muted">
                              {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
                            </span>
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
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No progress notes recorded"
                description="Progress notes are recorded for hospitalised patients."
              />
            )
          )}

          {/* Medications */}
          {activeTab === 'Medications' && (
            medsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Medication', 'Dosage', 'Frequency', 'Route', 'Admin At', 'Status'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {medsData.items.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/medications/${m.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{m.name}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.dosage}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.frequency}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.route}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.administeredAt}</td>
                      <td className="py-3 pr-4"><StatusBadge status={m.status} type="medication" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No medications ordered" description="No medications have been ordered for this patient yet." />
            )
          )}

          {/* Labs */}
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
                      onClick={() => navigate(`/admin/patients/${patientId}/labs/${l.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{l.testName}</td>
                      <td className="py-3 pr-4 text-text-secondary">{formatDate(l.dateOrdered)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.datePerformed ? formatDate(l.datePerformed) : '—'}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.location}</td>
                      <td className="py-3 pr-4"><StatusBadge status={l.status} type="lab" /></td>
                      <td className="py-3 text-text-muted text-xs max-w-[160px] truncate">{l.result || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No lab tests ordered" description="No laboratory tests have been ordered for this patient yet." />
            )
          )}

          {/* Imaging */}
          {activeTab === 'Imaging' && (
            imagingOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Modality', 'Body Region', 'Ordered', 'Performed', 'Priority', 'Status', 'Report'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {imagingOrders.map((img) => (
                    <tr
                      key={img.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/imaging/${img.id}`)}
                    >
                      <td className="py-3 pr-4"><Badge variant="primary">{img.modality}</Badge></td>
                      <td className="py-3 pr-4 text-text-secondary">{img.bodyRegion || '—'}</td>
                      <td className="py-3 pr-4 text-text-secondary">{img.dateOrdered ? formatDate(img.dateOrdered) : '—'}</td>
                      <td className="py-3 pr-4 text-text-secondary">{img.performedAt ? formatDate(img.performedAt) : '—'}</td>
                      <td className="py-3 pr-4"><StatusBadge status={img.priority} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={img.status} type="lab" /></td>
                      <td className="py-3 text-text-muted text-xs">{img.report ? 'Available' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No imaging orders" description="No imaging orders have been placed for this patient yet." />
            )
          )}

          {/* Referrals */}
          {activeTab === 'Referrals' && (
            refsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Receiving Facility', 'Status', 'Created'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {refsData.items.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/referrals/${r.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(r.referralDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.referralType}</td>
                      <td className="py-3 pr-4 text-text-secondary truncate max-w-[200px]">{r.receivingFacility}</td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} type="referral" /></td>
                      <td className="py-3 text-text-muted text-xs">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No referrals requested" description="No referrals have been submitted for this patient yet." />
            )
          )}

          {/* Admissions */}
          {activeTab === 'Admissions' && (
            admsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Admission Date', 'Bed', 'Ward', 'Physician', 'Status', 'Discharge'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {admsData.items.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/admissions/${a.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(a.admissionDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.bedNumber}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.ward}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.admittingPhysician}</td>
                      <td className="py-3 pr-4"><StatusBadge status={a.status} type="admission" /></td>
                      <td className="py-3 text-text-muted text-xs">{a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No admissions recorded" description="No hospital admissions have been recorded for this patient yet." />
            )
          )}
        </div>
      </Card>

      {/* ── Discharge summary viewer ── */}
      {showDischargeSummaryViewer && dischargeSummary && (
        <DischargeSummaryViewer
          summary={dischargeSummary}
          patientName={`${patient.firstName} ${patient.lastName}`}
          onClose={() => setShowDischargeSummaryViewer(false)}
          onPrint={handlePrintDischargeSummary}
        />
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────
const Row: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
}> = ({ icon, label, value, children }) => (
  <div className="flex items-start gap-2">
    {icon && <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>}
    <div className="flex-1 min-w-0">
      <span className="text-text-muted text-xs">{label}: </span>
      {children || <span className="text-on-surface">{value || '—'}</span>}
    </div>
  </div>
);

export default AdminPatientDetailPage;