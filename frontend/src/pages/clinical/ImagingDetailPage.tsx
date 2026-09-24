import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  User,
  Calendar,
  FileText,
  Printer,
  AlertTriangle,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { useImagingDetail } from '@/hooks/useImaging';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTime } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, value, icon, fullWidth }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div
      className={
        'flex items-start gap-2 py-1.5 border-b border-border-base last:border-0 ' +
        (fullWidth ? 'col-span-2' : '')
      }
    >
      {icon && <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>}
      <span className="text-text-muted text-sm min-w-[160px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-on-surface text-sm font-medium">{value}</span>
    </div>
  );
};

const SectionHeader: React.FC<{
  number?: string;
  title: string;
  icon?: React.ReactNode;
}> = ({ number, title, icon }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-primary/30">
    {number && (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
        {number}
      </span>
    )}
    <div className="flex items-center gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wide">
        {title}
      </h3>
    </div>
  </div>
);

const modalityLabel: Record<string, string> = {
  XRay: 'X-Ray / Radiography',
  Ultrasound: 'Ultrasound',
  CT: 'CT Scan',
  MRI: 'MRI',
  Mammography: 'Mammography',
  Fluoroscopy: 'Fluoroscopy',
  Interventional: 'Interventional Imaging',
  NuclearMedicine: 'Nuclear Medicine',
  Other: 'Other',
};

const lateralityLabel: Record<string, string> = {
  Right: 'Right',
  Left: 'Left',
  Bilateral: 'Bilateral',
  NotApplicable: 'Not applicable',
};

const contrastLabel: Record<string, string> = {
  No: 'No',
  Yes: 'Yes',
  ToBeDetermined: 'To be determined',
  NotApplicable: 'Not applicable',
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────

const ImagingDetailPage: React.FC = () => {
  const { id, imagingId } = useParams<{ id: string; imagingId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error, refetch } = useImagingDetail(id!, imagingId!);

  if (isLoading) return <PageLoader />;
  if (error || !order) return <ErrorState onRetry={refetch} />;

  const hasReport = !!(order.report && order.report.findings && order.report.impression);

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Imaging Examination Order
            </h1>
            <p className="text-sm text-text-secondary">
              {formatDate(order.dateOrdered ?? order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} type="lab" />
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Printer size={14} />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>

      {/* §1 — Patient Information */}
      <Card padding="lg">
        <SectionHeader number="1" title="Patient Information" icon={<User size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow label="Patient Name" value={order.patientName} fullWidth />
          <InfoRow label="Medical Record No." value={order.medicalRecordNo} />
          <InfoRow label="Ward / Clinic" value={order.wardClinic} />
          <InfoRow label="Contact No." value={order.contactNo} />
        </div>
      </Card>

      {/* §2 — Clinical Information */}
      <Card padding="lg">
        <SectionHeader
          number="2"
          title="Clinical Information"
          icon={<ClipboardList size={16} />}
        />
        <InfoRow label="Provisional Diagnosis" value={order.provisionalDiagnosis} fullWidth />
        <InfoRow label="Presenting Symptoms" value={order.presentingSymptoms} fullWidth />
        <InfoRow label="Medical History" value={order.medicalHistory} fullWidth />
        <InfoRow
          label="Previous Imaging"
          value={order.previousImaging ? 'Yes' : 'No'}
        />
        {order.previousImaging && (
          <InfoRow
            label="Previous Details"
            value={order.previousImagingDetails}
            fullWidth
          />
        )}
        <InfoRow
          label="Clinical Question"
          value={order.specialClinicalQuestion}
          fullWidth
        />
      </Card>

      {/* §3 — Imaging Examination Requested */}
      <Card padding="lg">
        <SectionHeader
          number="3"
          title="Imaging Examination Requested"
          icon={<Camera size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow
            label="Modality"
            value={modalityLabel[order.modality] ?? order.modality}
          />
          {order.modality === 'Other' && (
            <InfoRow label="Modality (other)" value={order.modalityOtherText} />
          )}
          <InfoRow label="Body Region" value={order.bodyRegion} />
          {order.bodyRegion === 'Other' && (
            <InfoRow label="Body Region (other)" value={order.bodyRegionOtherText} />
          )}
          <InfoRow
            label="Laterality"
            value={lateralityLabel[order.laterality] ?? order.laterality}
          />
          <InfoRow
            label="Contrast"
            value={contrastLabel[order.contrastRequested] ?? order.contrastRequested}
          />
        </div>
      </Card>

      {/* §4 — Examination Details */}
      <Card padding="lg">
        <SectionHeader
          number="4"
          title="Examination Details"
          icon={<FileText size={16} />}
        />
        <InfoRow label="Specific Site" value={order.specificSite} />
        <InfoRow label="Protocol / Views" value={order.protocolViews} />
        <InfoRow
          label="Special Clinical Question"
          value={order.specialClinicalQuestion}
          fullWidth
        />
      </Card>

      {/* §5 — Contrast / Medication */}
      <Card padding="lg">
        <SectionHeader
          number="5"
          title="Contrast / Medication Information"
          icon={<AlertTriangle size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow
            label="Previous Contrast Reaction"
            value={order.previousContrastReaction ? 'Yes' : 'No'}
          />
          {order.previousContrastReaction && (
            <InfoRow
              label="Reaction Details"
              value={order.previousContrastReactionDetails}
            />
          )}
          <InfoRow label="Known Allergies" value={order.knownAllergies} />
          <InfoRow label="Creatinine" value={order.creatinine} />
          <InfoRow label="eGFR" value={order.egfr} />
          <InfoRow
            label="Other Relevant Medication / Condition"
            value={order.otherRelevantMedicationOrCondition}
            fullWidth
          />
        </div>
      </Card>

      {/* §6 — Safety Screening */}
      <Card padding="lg">
        <SectionHeader number="6" title="Safety Screening" icon={<AlertTriangle size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow label="Pregnancy Status" value={order.pregnancyStatus} />
          <InfoRow
            label="Implanted Medical Device"
            value={order.implantedMedicalDevice ? 'Yes' : 'No'}
          />
          {order.implantedMedicalDevice && (
            <InfoRow label="Device / Implant Details" value={order.deviceImplantDetails} />
          )}
          <InfoRow label="Metallic Foreign Body" value={order.metallicForeignBody} />
          <InfoRow
            label="Other Safety Considerations"
            value={order.otherSafetyConsiderations}
            fullWidth
          />
        </div>
      </Card>

      {/* §7 — Preparation */}
      <Card padding="lg">
        <SectionHeader
          number="7"
          title="Patient Preparation"
          icon={<Activity size={16} />}
        />
        {order.preparation && order.preparation.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {order.preparation.map((p) => (
              <Badge key={p} variant="secondary">
                {p}
              </Badge>
            ))}
          </div>
        )}
        <InfoRow
          label="Preparation Instructions"
          value={order.preparationInstructions}
          fullWidth
        />
      </Card>

      {/* §8 — Priority */}
      <Card padding="lg">
        <SectionHeader number="8" title="Priority" icon={<AlertTriangle size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow label="Priority" value={order.priority} />
          {order.priority !== 'Routine' && (
            <InfoRow label="Reason for Urgency" value={order.reasonForUrgency} />
          )}
        </div>
      </Card>

      {/* §9 — Referring Clinician */}
      <Card padding="lg">
        <SectionHeader
          number="9"
          title="Referring Clinician"
          icon={<User size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow label="Clinician Name" value={order.clinicianName} />
          <InfoRow label="Department" value={order.clinicianDepartment} />
          <InfoRow label="License / Reg. No." value={order.clinicianLicenseNo} />
          <InfoRow label="Contact / Extension" value={order.clinicianContact} />
        </div>
      </Card>

      {/* §10 — Imaging Department Use (only when performed) */}
      {order.examinationPerformed && (
        <Card padding="lg">
          <SectionHeader
            number="10"
            title="Imaging Department Use"
            icon={<Activity size={16} />}
          />
          <div className="grid md:grid-cols-2 gap-x-6">
            <InfoRow label="Performed Modality" value={order.performedModality} />
            <InfoRow label="Performed Protocol" value={order.performedProtocol} />
            <InfoRow label="Contrast Administered" value={order.performedContrast} />
            <InfoRow label="Technologist" value={order.technologistName} />
            <InfoRow label="Radiologist" value={order.radiologistName} />
            <InfoRow
              label="Performed At"
              value={order.performedAt ? formatDateTime(order.performedAt) : undefined}
            />
            <InfoRow label="Image Quality" value={order.imageQuality} />
          </div>
        </Card>
      )}

      {/* §11 — Imaging Report (only when a report exists) */}
      {hasReport && order.report && (
        <Card padding="lg" className="border-l-4 border-l-success">
          <SectionHeader number="11" title="Imaging Report" icon={<FileText size={16} />} />
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-x-6">
              <InfoRow label="Report No." value={order.report.reportNo} />
              <InfoRow
                label="Report Date"
                value={
                  order.report.reportDate
                    ? formatDate(order.report.reportDate)
                    : undefined
                }
              />
              <InfoRow
                label="Reporting Physician"
                value={order.report.reportingPhysician}
              />
              <InfoRow label="Signature" value={order.report.signature} />
              <InfoRow
                label="Hospital / Department Stamp"
                value={order.report.hospitalDepartmentStamp}
                fullWidth
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Findings
              </p>
              <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                {order.report.findings}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Impression / Conclusion
              </p>
              <div className="bg-primary/[0.04] border border-primary/20 rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                {order.report.impression}
              </div>
            </div>

            {order.report.recommendations && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Recommendations / Follow-up
                </p>
                <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                  {order.report.recommendations}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Pending-report banner (replaces the inline result entry form) */}
      {!hasReport && order.status !== 'Cancelled' && (
        <div className="rounded-xl border border-warning/30 bg-warning-bg px-4 py-3.5 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-on-surface">
              Report pending
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              No imaging report has been recorded yet for this order. Once the
              examination is performed, the radiologist can submit the report
              from the imaging queue.
            </p>
          </div>
        </div>
      )}

      {/* Footer action */}
      <div className="flex justify-end pb-6">
        <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
          Back to Patient
        </Button>
      </div>
    </div>
  );
};

export default ImagingDetailPage;