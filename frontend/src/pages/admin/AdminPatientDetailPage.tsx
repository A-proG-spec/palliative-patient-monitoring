import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  XCircle, Phone, MapPin, User, Calendar, FileText, Printer,
  AlertTriangle, NotebookPen, Trash2, Heart,
} from 'lucide-react';

import {
  useAdminPatientDetail,
  useDeleteMedication,
  useRestoreMedication,
  useDeleteLabTest,
  useRestoreLabTest,
  useDeleteImaging,
  useRestoreImaging,
  useDeleteAdmission,
  useRestoreAdmission,
  useDeleteProgressNote,
  useRestoreProgressNote,
  useDeleteHospiceNursing,
  useRestoreHospiceNursing,
} from '@/hooks/useAdmin';

import {
  usePatientPainAssessments,
  usePatientPharmacistAssessments,
  usePatientPhysiotherapyAssessments,
  usePatientFamilyAssessments,
  usePatientNutritionalAssessments,
  usePatientSocialAssessments,
  usePatientSpiritualAssessments,
  usePatientPsychiatryAssessments,
} from '@/hooks';

import { useDeletePainAssessment, useRestorePainAssessment } from '@/hooks/usePainAssessments';
import { useDeletePharmacistAssessment, useRestorePharmacistAssessment } from '@/hooks/usePharmacistAssessments';
import { useDeletePhysiotherapyAssessment, useRestorePhysiotherapyAssessment } from '@/hooks/usePhysiotherapyAssessments';
import { useDeleteFamilyAssessment, useRestoreFamilyAssessment } from '@/hooks/useFamilyAssessments';
import { useDeleteNutritionalAssessment, useRestoreNutritionalAssessment } from '@/hooks/useNutritionalAssessments';
import { useDeleteSocialAssessment, useRestoreSocialAssessment } from '@/hooks/useSocialAssessments';
import { useDeleteSpiritualAssessment, useRestoreSpiritualAssessment } from '@/hooks/useSpiritualAssessments';
import { useDeletePsychiatryAssessment, useRestorePsychiatryAssessment } from '@/hooks/usePsychiatryAssessments';

import { useDischargeSummary } from '@/hooks/useDischarge';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientImaging } from '@/hooks/useImaging';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { useProgressNotes } from '@/hooks/useProgressNotes';
import { usePatientHospiceAssessments } from '@/hooks/useHospiceNursing';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton';
import { AdminRestoreButton } from '@/components/admin/AdminRestoreButton';
import {
  AssessmentTabPanel,
  DeletedBadge,
  dateColumn,
  typeColumn,
  adaptDeleteMutation,
  adaptRestoreMutation,
} from '@/components/admin/AssessmentTabPanel';

import { formatDate, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS as DSL, VISIT_TYPE_LABELS } from '@/constants';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';
import { printDischargeSummary } from '@/lib/printDischargeSummary';

// ═══════════════════════════════════════════════════════════
// RowActions — used by the non-assessment tabs
// ═══════════════════════════════════════════════════════════

interface RowActionsProps {
  isDeleted: boolean;
  resourceLabel: string;
  resourceIdentifier: string;
  isDeleting: boolean;
  isRestoring: boolean;
  onDelete: (reason?: string) => void;
  onRestore: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({
  isDeleted,
  resourceLabel,
  resourceIdentifier,
  isDeleting,
  isRestoring,
  onDelete,
  onRestore,
}) =>
  isDeleted ? (
    <AdminRestoreButton
      resourceLabel={resourceLabel}
      onRestore={onRestore}
      isPending={isRestoring}
    />
  ) : (
    <AdminDeleteButton
      resourceLabel={resourceLabel}
      resourceIdentifier={resourceIdentifier}
      onConfirm={onDelete}
      isPending={isDeleting}
      compact
    />
  );

// ── Discharge summary viewer modal ──
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

// ── Tabs ──
const tabs = [
  'Visits',
  'Progress Notes',
  'Hospice Nursing',
  'Medications',
  'Labs',
  'Imaging',
  'Referrals',
  'Admissions',
  'Pain Assessments',
  'Pharmacist Assessments',
  'Physiotherapy Assessments',
  'Family Assessments',
  'Nutritional Assessments',
  'Social Assessments',
  'Spiritual Assessments',
  'Psychiatry Assessments',
] as const;
type Tab = typeof tabs[number];

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<Tab>('Visits');
  const [showDischargeSummaryViewer, setShowDischargeSummaryViewer] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // ── Discharge summary ──
  const locationState =
    (location.state as { dischargeSummary?: DischargeSummary } | null) ?? null;
  const { data: fetchedDischargeSummary } = useDischargeSummary(patientId!);
  const dischargeSummary: DischargeSummary | null =
    locationState?.dischargeSummary ?? fetchedDischargeSummary ?? null;

  // ── Primary patient data ──
  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);

  // ── Sub-record data ──
  const { data: visitsData } = usePatientVisits(patientId!, { includeDeleted: showDeleted });
  const { data: medsData } = usePatientMedications(patientId!, { includeDeleted: showDeleted });
  const { data: labsData } = usePatientLabs(patientId!, { includeDeleted: showDeleted });
  const { data: imagingData } = usePatientImaging(patientId!, { includeDeleted: showDeleted });
  const { data: refsData } = usePatientReferrals(patientId!);
  const { data: admsData } = usePatientAdmissions(patientId!, { includeDeleted: showDeleted });
  const { data: progressNotesData } = useProgressNotes(patientId!, { includeDeleted: showDeleted });
  const { data: hospiceData } = usePatientHospiceAssessments(patientId!, { includeDeleted: showDeleted });

  // ── Assessment data ──
  const { data: painData } = usePatientPainAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: pharmacistData } = usePatientPharmacistAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: physioData } = usePatientPhysiotherapyAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: familyData } = usePatientFamilyAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: nutritionData } = usePatientNutritionalAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: socialData } = usePatientSocialAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: spiritualData } = usePatientSpiritualAssessments(patientId!, { includeDeleted: showDeleted });
  const { data: psychiatryData } = usePatientPsychiatryAssessments(patientId!, { includeDeleted: showDeleted });

  const painAssessments = painData?.items ?? [];
  const pharmacistAssessments = pharmacistData?.items ?? [];
  const physioAssessments = physioData?.items ?? [];
  const familyAssessments = familyData?.items ?? [];
  const nutritionAssessments = nutritionData?.items ?? [];
  const socialAssessments = socialData?.items ?? [];
  const spiritualAssessments = spiritualData?.items ?? [];
  const psychiatryAssessments = psychiatryData?.items ?? [];
  const progressNotes = progressNotesData?.items ?? [];
  const hospiceAssessments = hospiceData?.items ?? [];
  const labOrders = labsData?.items ?? [];
  const imagingOrders = imagingData?.items ?? [];

  // ── Delete / restore mutations ──
  const deleteMedication = useDeleteMedication();
  const restoreMedication = useRestoreMedication();
  const deleteLab = useDeleteLabTest();
  const restoreLab = useRestoreLabTest();
  const deleteImaging = useDeleteImaging();
  const restoreImaging = useRestoreImaging();
  const deleteAdmission = useDeleteAdmission();
  const restoreAdmission = useRestoreAdmission();
  const deleteProgressNote = useDeleteProgressNote();
  const restoreProgressNote = useRestoreProgressNote();
  const deleteHospice = useDeleteHospiceNursing();
  const restoreHospice = useRestoreHospiceNursing();

  // ── Assessment delete/restore mutations ──
  const deletePain = useDeletePainAssessment(patientId!);
  const restorePain = useRestorePainAssessment(patientId!);

  const deletePharmacist = useDeletePharmacistAssessment(patientId!);
  const restorePharmacist = useRestorePharmacistAssessment(patientId!);

  const deletePhysio = useDeletePhysiotherapyAssessment(patientId!);
  const restorePhysio = useRestorePhysiotherapyAssessment(patientId!);

  const deleteFamily = useDeleteFamilyAssessment(patientId!);
  const restoreFamily = useRestoreFamilyAssessment(patientId!);

  const deleteNutrition = useDeleteNutritionalAssessment(patientId!);
  const restoreNutrition = useRestoreNutritionalAssessment(patientId!);

  const deleteSocial = useDeleteSocialAssessment(patientId!);
  const restoreSocial = useRestoreSocialAssessment(patientId!);

  const deleteSpiritual = useDeleteSpiritualAssessment(patientId!);
  const restoreSpiritual = useRestoreSpiritualAssessment(patientId!);

  const deletePsychiatry = useDeletePsychiatryAssessment(patientId!);
  const restorePsychiatry = useRestorePsychiatryAssessment(patientId!);

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const tabCounts: Record<Tab, number> = {
    'Visits': visitsData?.total ?? 0,
    'Progress Notes': progressNotes.length,
    'Hospice Nursing': hospiceAssessments.length,
    'Medications': medsData?.total ?? 0,
    'Labs': labOrders.length,
    'Imaging': imagingOrders.length,
    'Referrals': refsData?.total ?? 0,
    'Admissions': admsData?.total ?? 0,

    'Pain Assessments': painAssessments.length,
    'Pharmacist Assessments': pharmacistAssessments.length,
    'Physiotherapy Assessments': physioAssessments.length,
    'Family Assessments': familyAssessments.length,
    'Nutritional Assessments': nutritionAssessments.length,
    'Social Assessments': socialAssessments.length,
    'Spiritual Assessments': spiritualAssessments.length,
    'Psychiatry Assessments': psychiatryAssessments.length,
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

      {/* ── Demographics ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={<User size={14} />} label="Name" value={`${patient.firstName} ${patient.lastName}`} />
            <Row icon={<Calendar size={14} />} label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
            <Row label="Age / Sex" value={`${patient.age} years · ${patient.sex}`} />
            <Row icon={<MapPin size={14} />} label="Address" value={patient.address} />
            <Row icon={<Phone size={14} />} label="Phone" value={patient.phone} />
            <Row label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <Row label="Caregiver" value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
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
          </CardContent>
        </Card>
      </div>

      {/* ── Tabbed records ── */}
      <Card padding="none">
        {/* Tab bar + Show Deleted toggle */}
        <div className="flex items-center justify-between border-b border-border-base">
          <div className="flex overflow-x-auto flex-1">
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

          {/* Show deleted toggle */}
          <label className="flex items-center gap-2 px-4 py-3 text-xs text-text-secondary cursor-pointer hover:text-on-surface transition-colors flex-shrink-0">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border-base text-error focus:ring-error"
            />
            <Trash2 size={12} className={showDeleted ? 'text-error' : ''} />
            Show deleted
          </label>
        </div>

        <div className="p-5 overflow-x-auto">
          {/* ═══════════════════════════════════════════════════════
              Visits
          ═══════════════════════════════════════════════════════ */}
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
                  {visitsData.items.map((v) => {
                    const isDeleted = !!(v as any).deletedAt;
                    return (
                      <tr
                        key={v.id}
                        className={cn(
                          'hover:bg-surface-low cursor-pointer',
                          isDeleted && 'bg-error-bg/20 opacity-70',
                        )}
                        onClick={() => navigate(`/admin/patients/${patientId}/visits/${v.id}`)}
                      >
                        <td className="py-3 pr-4">
                          {formatDate(v.visitDate)}
                          {isDeleted && (
                            <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary">{VISIT_TYPE_LABELS[v.visitType] || v.visitType}</Badge>
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={v.overallStatus} /></td>
                        <td className="py-3 pr-4"><StatusBadge status={v.outcome} type="visit" /></td>
                        <td className="py-3 text-text-muted text-xs">PPS {v.ppsScore}% · KPS {v.kpsScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted visits' : 'No visits recorded'}
                description={
                  showDeleted
                    ? 'Deleted visits will appear here when present.'
                    : 'No home visits have been recorded for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Progress Notes
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Progress Notes' && (
            progressNotes.length ? (
              <div className="space-y-3">
                {progressNotes.map((note) => {
                  const created = note.createdAt ? new Date(note.createdAt) : null;
                  const dateLabel = created ? formatDate(created.toISOString()) : '—';
                  const timeLabel = created ? created.toTimeString().slice(0, 5) : '';
                  const isDeleted = !!note.deletedAt;
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        'border border-border-base rounded-xl p-4 transition-colors',
                        isDeleted ? 'bg-error-bg/20 opacity-70' : 'hover:bg-surface-low/40',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <Badge variant="primary">
                              <NotebookPen size={11} className="mr-0.5" />
                              Progress Note
                            </Badge>
                            {isDeleted && <Badge variant="error">Deleted</Badge>}
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
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <RowActions
                            isDeleted={isDeleted}
                            resourceLabel="Progress Note"
                            resourceIdentifier={`Note from ${dateLabel}`}
                            isDeleting={deleteProgressNote.isPending}
                            isRestoring={
                              restoreProgressNote.isPending &&
                              (restoreProgressNote.variables as any)?.resourceId === note.id
                            }
                            onDelete={(reason) =>
                              deleteProgressNote.mutate({
                                patientId: patientId!,
                                resourceId: note.id,
                                reason,
                              })
                            }
                            onRestore={() =>
                              restoreProgressNote.mutate({
                                patientId: patientId!,
                                resourceId: note.id,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted progress notes' : 'No progress notes recorded'}
                description={
                  showDeleted
                    ? 'Deleted progress notes will appear here when present.'
                    : 'Progress notes are recorded for hospitalised patients.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Hospice Nursing
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Hospice Nursing' && (
            hospiceAssessments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[820px]">
                  <thead>
                    <tr className="text-left text-xs text-text-muted">
                      {[
                        'Assessment Date',
                        'Assessed By',
                        'Consciousness',
                        'Pain',
                        'Mobility',
                        'Emotional',
                        '',
                      ].map((h) => (
                        <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {hospiceAssessments.map((a) => {
                      const isDeleted = !!(a as any).deletedAt;
                      return (
                        <tr
                          key={a.id}
                          className={cn(
                            'hover:bg-surface-low',
                            isDeleted && 'bg-error-bg/20 opacity-70',
                          )}
                        >
                          <td
                            className="py-3 pr-4 whitespace-nowrap cursor-pointer"
                            onClick={() => navigate(`/admin/patients/${patientId}/hospice-nursing/${a.id}`)}
                          >
                            {formatDate(a.assessmentDate)}
                            {isDeleted && (
                              <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                            {a.assessedBy?.name ?? '—'}
                          </td>
                          <td className="py-3 pr-4">
                            {a.levelOfConsciousness ? (
                              <Badge variant="secondary">{a.levelOfConsciousness}</Badge>
                            ) : (
                              <span className="text-text-muted text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {a.painScore !== null && a.painScore !== undefined ? (
                              <Badge
                                variant={
                                  a.painScore >= 7
                                    ? 'error'
                                    : a.painScore >= 4
                                      ? 'warning'
                                      : 'success'
                                }
                              >
                                {a.painScore}/10
                              </Badge>
                            ) : (
                              <span className="text-text-muted text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                            {a.mobilityStatus ?? '—'}
                          </td>
                          <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                            {a.emotionalStatus ?? '—'}
                          </td>
                          <td className="py-3 text-right">
                            <RowActions
                              isDeleted={isDeleted}
                              resourceLabel="Hospice assessment"
                              resourceIdentifier={`Assessment from ${formatDate(a.assessmentDate)}`}
                              isDeleting={deleteHospice.isPending}
                              isRestoring={
                                restoreHospice.isPending &&
                                (restoreHospice.variables as any)?.resourceId === a.id
                              }
                              onDelete={(reason) =>
                                deleteHospice.mutate({
                                  patientId: patientId!,
                                  resourceId: a.id,
                                  reason,
                                })
                              }
                              onRestore={() =>
                                restoreHospice.mutate({
                                  patientId: patientId!,
                                  resourceId: a.id,
                                })
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<Heart size={28} />}
                title={showDeleted ? 'No deleted hospice assessments' : 'No hospice nursing assessments'}
                description={
                  showDeleted
                    ? 'Deleted hospice nursing assessments will appear here when present.'
                    : 'No hospice nursing assessments have been recorded for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Medications
          ═══════════════════════════════════════════════════════ */}
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
                  {medsData.items.map((m) => {
                    const isDeleted = !!(m as any).deletedAt;
                    return (
                      <tr
                        key={m.id}
                        className={cn(
                          'hover:bg-surface-low',
                          isDeleted && 'bg-error-bg/20 opacity-70',
                        )}
                      >
                        <td
                          className="py-3 pr-4 font-medium cursor-pointer"
                          onClick={() => navigate(`/admin/patients/${patientId}/medications/${m.id}`)}
                        >
                          {m.name}
                          {isDeleted && (
                            <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{m.dosage}</td>
                        <td className="py-3 pr-4 text-text-secondary">{m.frequency}</td>
                        <td className="py-3 pr-4 text-text-secondary">{m.route}</td>
                        <td className="py-3 pr-4 text-text-secondary">{m.administeredAt}</td>
                        <td className="py-3 pr-4"><StatusBadge status={m.status} type="medication" /></td>
                        <td className="py-3 text-right">
                          <RowActions
                            isDeleted={isDeleted}
                            resourceLabel="Medication"
                            resourceIdentifier={`${m.name} ${m.dosage}`}
                            isDeleting={deleteMedication.isPending}
                            isRestoring={
                              restoreMedication.isPending &&
                              (restoreMedication.variables as any)?.resourceId === m.id
                            }
                            onDelete={(reason) =>
                              deleteMedication.mutate({
                                patientId: patientId!,
                                resourceId: m.id,
                                reason,
                              })
                            }
                            onRestore={() =>
                              restoreMedication.mutate({
                                patientId: patientId!,
                                resourceId: m.id,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted medications' : 'No medications ordered'}
                description={
                  showDeleted
                    ? 'Deleted medications will appear here when present.'
                    : 'No medications have been ordered for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Labs
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Labs' && (
            labOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Test', 'Ordered', 'Performed', 'Location', 'Status', 'Result', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {labOrders.map((l) => {
                    const isDeleted = !!(l as any).deletedAt;
                    return (
                      <tr
                        key={l.id}
                        className={cn(
                          'hover:bg-surface-low',
                          isDeleted && 'bg-error-bg/20 opacity-70',
                        )}
                      >
                        <td
                          className="py-3 pr-4 font-medium cursor-pointer"
                          onClick={() => navigate(`/admin/patients/${patientId}/labs/${l.id}`)}
                        >
                          {l.testName}
                          {isDeleted && (
                            <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{formatDate(l.dateOrdered)}</td>
                        <td className="py-3 pr-4 text-text-secondary">{l.datePerformed ? formatDate(l.datePerformed) : '—'}</td>
                        <td className="py-3 pr-4 text-text-secondary">{l.location}</td>
                        <td className="py-3 pr-4"><StatusBadge status={l.status} type="lab" /></td>
                        <td className="py-3 text-text-muted text-xs max-w-[160px] truncate">{l.result || '—'}</td>
                        <td className="py-3 text-right">
                          <RowActions
                            isDeleted={isDeleted}
                            resourceLabel="Lab test"
                            resourceIdentifier={l.testName}
                            isDeleting={deleteLab.isPending}
                            isRestoring={
                              restoreLab.isPending &&
                              (restoreLab.variables as any)?.resourceId === l.id
                            }
                            onDelete={(reason) =>
                              deleteLab.mutate({
                                patientId: patientId!,
                                resourceId: l.id,
                                reason,
                              })
                            }
                            onRestore={() =>
                              restoreLab.mutate({
                                patientId: patientId!,
                                resourceId: l.id,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted lab tests' : 'No lab tests ordered'}
                description={
                  showDeleted
                    ? 'Deleted lab tests will appear here when present.'
                    : 'No laboratory tests have been ordered for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Imaging
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Imaging' && (
            imagingOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Modality', 'Body Region', 'Ordered', 'Performed', 'Priority', 'Status', 'Report', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {imagingOrders.map((img) => {
                    const isDeleted = !!(img as any).deletedAt;
                    return (
                      <tr
                        key={img.id}
                        className={cn(
                          'hover:bg-surface-low',
                          isDeleted && 'bg-error-bg/20 opacity-70',
                        )}
                      >
                        <td
                          className="py-3 pr-4 cursor-pointer"
                          onClick={() => navigate(`/admin/patients/${patientId}/imaging/${img.id}`)}
                        >
                          <Badge variant="primary">{img.modality}</Badge>
                          {isDeleted && (
                            <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{img.bodyRegion || '—'}</td>
                        <td className="py-3 pr-4 text-text-secondary">{img.dateOrdered ? formatDate(img.dateOrdered) : '—'}</td>
                        <td className="py-3 pr-4 text-text-secondary">{img.performedAt ? formatDate(img.performedAt) : '—'}</td>
                        <td className="py-3 pr-4"><StatusBadge status={img.priority} /></td>
                        <td className="py-3 pr-4"><StatusBadge status={img.status} type="lab" /></td>
                        <td className="py-3 text-text-muted text-xs">{img.report ? 'Available' : '—'}</td>
                        <td className="py-3 text-right">
                          <RowActions
                            isDeleted={isDeleted}
                            resourceLabel="Imaging order"
                            resourceIdentifier={`${img.modality} ${img.bodyRegion}`}
                            isDeleting={deleteImaging.isPending}
                            isRestoring={
                              restoreImaging.isPending &&
                              (restoreImaging.variables as any)?.resourceId === img.id
                            }
                            onDelete={(reason) =>
                              deleteImaging.mutate({
                                patientId: patientId!,
                                resourceId: img.id,
                                reason,
                              })
                            }
                            onRestore={() =>
                              restoreImaging.mutate({
                                patientId: patientId!,
                                resourceId: img.id,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted imaging orders' : 'No imaging orders'}
                description={
                  showDeleted
                    ? 'Deleted imaging orders will appear here when present.'
                    : 'No imaging orders have been placed for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Referrals (no soft delete on backend)
          ═══════════════════════════════════════════════════════ */}
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
              <EmptyState
                title="No referrals requested"
                description="No referrals have been submitted for this patient yet."
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Admissions
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Admissions' && (
            admsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Admission Date', 'Bed', 'Ward', 'Physician', 'Status', 'Discharge', ''].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {admsData.items.map((a) => {
                    const isDeleted = !!(a as any).deletedAt;
                    return (
                      <tr
                        key={a.id}
                        className={cn(
                          'hover:bg-surface-low',
                          isDeleted && 'bg-error-bg/20 opacity-70',
                        )}
                      >
                        <td
                          className="py-3 pr-4 cursor-pointer"
                          onClick={() => navigate(`/admin/patients/${patientId}/admissions/${a.id}`)}
                        >
                          {formatDate(a.admissionDate)}
                          {isDeleted && (
                            <Badge variant="error" className="ml-2 text-[10px]">Deleted</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{a.bedNumber}</td>
                        <td className="py-3 pr-4 text-text-secondary">{a.ward}</td>
                        <td className="py-3 pr-4 text-text-secondary">{a.admittingPhysician}</td>
                        <td className="py-3 pr-4"><StatusBadge status={a.status} type="admission" /></td>
                        <td className="py-3 text-text-muted text-xs">{a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}</td>
                        <td className="py-3 text-right">
                          <RowActions
                            isDeleted={isDeleted}
                            resourceLabel="Admission"
                            resourceIdentifier={`${a.ward} · Bed ${a.bedNumber}`}
                            isDeleting={deleteAdmission.isPending}
                            isRestoring={
                              restoreAdmission.isPending &&
                              (restoreAdmission.variables as any)?.resourceId === a.id
                            }
                            onDelete={(reason) =>
                              deleteAdmission.mutate({
                                patientId: patientId!,
                                resourceId: a.id,
                                reason,
                              })
                            }
                            onRestore={() =>
                              restoreAdmission.mutate({
                                patientId: patientId!,
                                resourceId: a.id,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={showDeleted ? 'No deleted admissions' : 'No admissions recorded'}
                description={
                  showDeleted
                    ? 'Deleted admissions will appear here when present.'
                    : 'No hospital admissions have been recorded for this patient yet.'
                }
              />
            )
          )}

          {/* ═══════════════════════════════════════════════════════
              Pain Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Pain Assessments' && (
            <AssessmentTabPanel
              items={painAssessments}
              patientId={patientId!}
              resourceLabel="Pain assessment"
              detailRoute="pain"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deletePain as any)}
              restoreMutation={adaptRestoreMutation(restorePain as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Pain Score',
                  render: (a: any) =>
                    a.currentPainScore !== null && a.currentPainScore !== undefined ? (
                      <Badge
                        variant={
                          a.currentPainScore >= 7
                            ? 'error'
                            : a.currentPainScore >= 4
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.currentPainScore}/10
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                {
                  header: 'Diagnosis',
                  className: 'text-text-secondary text-xs max-w-[200px] truncate',
                  render: (a: any) => a.diagnosis?.join(', ') || '—',
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Pharmacist Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Pharmacist Assessments' && (
            <AssessmentTabPanel
              items={pharmacistAssessments}
              patientId={patientId!}
              resourceLabel="Pharmacist assessment"
              detailRoute="pharmacist-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deletePharmacist as any)}
              restoreMutation={adaptRestoreMutation(restorePharmacist as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Pain Control',
                  render: (a: any) =>
                    a.painControl ? (
                      <Badge
                        variant={
                          a.painControl === 'WellControlled'
                            ? 'success'
                            : a.painControl === 'PartiallyControlled'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {a.painControl.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                {
                  header: 'Summary',
                  className: 'text-text-secondary text-xs max-w-[240px] truncate',
                  render: (a: any) => a.pharmacistSummary ?? '—',
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Physiotherapy Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Physiotherapy Assessments' && (
            <AssessmentTabPanel
              items={physioAssessments}
              patientId={patientId!}
              resourceLabel="Physiotherapy assessment"
              detailRoute="physiotherapy-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deletePhysio as any)}
              restoreMutation={adaptRestoreMutation(restorePhysio as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Mobility',
                  className: 'text-text-secondary text-xs',
                  render: (a: any) => a.mobilityStatus ?? '—',
                },
                {
                  header: 'Fall Risk',
                  render: (a: any) =>
                    a.fallRiskLevel ? (
                      <Badge
                        variant={
                          a.fallRiskLevel === 'High'
                            ? 'error'
                            : a.fallRiskLevel === 'Moderate'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.fallRiskLevel}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Family Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Family Assessments' && (
            <AssessmentTabPanel
              items={familyAssessments}
              patientId={patientId!}
              resourceLabel="Family assessment"
              detailRoute="family-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deleteFamily as any)}
              restoreMutation={adaptRestoreMutation(restoreFamily as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Burden',
                  render: (a: any) =>
                    a.burdenLevel ? (
                      <Badge variant="secondary">{a.burdenLevel}</Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                {
                  header: 'Assessor',
                  className: 'text-text-secondary text-xs',
                  render: (a: any) => a.assessorName ?? '—',
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Nutritional Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Nutritional Assessments' && (
            <AssessmentTabPanel
              items={nutritionAssessments}
              patientId={patientId!}
              resourceLabel="Nutritional assessment"
              detailRoute="nutritional-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deleteNutrition as any)}
              restoreMutation={adaptRestoreMutation(restoreNutrition as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'BMI',
                  className: 'text-text-secondary',
                  render: (a: any) => a.bmi ?? '—',
                },
                {
                  header: 'Risk',
                  render: (a: any) =>
                    a.overallNutritionalRisk ? (
                      <Badge
                        variant={
                          a.overallNutritionalRisk === 'Critical' ||
                          a.overallNutritionalRisk === 'High'
                            ? 'error'
                            : a.overallNutritionalRisk === 'Moderate'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.overallNutritionalRisk}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Social Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Social Assessments' && (
            <AssessmentTabPanel
              items={socialAssessments}
              patientId={patientId!}
              resourceLabel="Social assessment"
              detailRoute="social-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deleteSocial as any)}
              restoreMutation={adaptRestoreMutation(restoreSocial as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Living Arrangement',
                  className: 'text-text-secondary text-xs',
                  render: (a: any) => a.livingArrangement ?? '—',
                },
                {
                  header: 'Bereavement Risk',
                  render: (a: any) =>
                    a.bereavementRisk ? (
                      <Badge
                        variant={
                          a.bereavementRisk === 'High'
                            ? 'error'
                            : a.bereavementRisk === 'Moderate'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.bereavementRisk}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Spiritual Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Spiritual Assessments' && (
            <AssessmentTabPanel
              items={spiritualAssessments}
              patientId={patientId!}
              resourceLabel="Spiritual assessment"
              detailRoute="spiritual-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deleteSpiritual as any)}
              restoreMutation={adaptRestoreMutation(restoreSpiritual as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Affiliation',
                  className: 'text-text-secondary text-xs',
                  render: (a: any) => a.religiousAffiliation ?? '—',
                },
                {
                  header: 'Distress Level',
                  render: (a: any) =>
                    a.spiritualDistressLevel ? (
                      <Badge
                        variant={
                          a.spiritualDistressLevel === 'Severe' ||
                          a.spiritualDistressLevel === 'Moderate'
                            ? 'error'
                            : a.spiritualDistressLevel === 'Mild'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.spiritualDistressLevel}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                { header: '', render: () => null },
              ]}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              Psychiatry Assessments
          ═══════════════════════════════════════════════════════ */}
          {activeTab === 'Psychiatry Assessments' && (
            <AssessmentTabPanel
              items={psychiatryAssessments}
              patientId={patientId!}
              resourceLabel="Psychiatry assessment"
              detailRoute="psychiatry-assessment"
              showDeleted={showDeleted}
              deleteMutation={adaptDeleteMutation(deletePsychiatry as any)}
              restoreMutation={adaptRestoreMutation(restorePsychiatry as any)}
              getRowId={(r: any) => r.id}
              getRowDate={(r: any) => r.createdAt}
              columns={[
                dateColumn(),
                typeColumn(),
                {
                  header: 'Suicide Risk',
                  render: (a: any) =>
                    a.suicideRiskLevel ? (
                      <Badge
                        variant={
                          a.suicideRiskLevel === 'High'
                            ? 'error'
                            : a.suicideRiskLevel === 'Moderate'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {a.suicideRiskLevel}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    ),
                },
                {
                  header: 'Diagnoses',
                  className: 'text-text-secondary text-xs max-w-[200px] truncate',
                  render: (a: any) => a.diagnoses?.join(', ') || '—',
                },
                { header: '', render: () => null },
              ]}
            />
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

// ── Helpers ──
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