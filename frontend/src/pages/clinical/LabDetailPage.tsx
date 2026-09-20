import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  User,
  Calendar,
  FileText,
  Printer,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useLabDetail } from '@/hooks/useLabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatDateTime } from '@/lib/utils';
import { LabResultEntry } from '@/components/labs/LabResultEntry';

const InfoRow: React.FC<{
  label: string;
  value?: React.ReactNode;
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
      {icon && (
        <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>
      )}
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

const abnormalFlagVariant = (
  flag?: 'Low' | 'High' | 'Critical' | 'Normal',
): 'default' | 'warning' | 'error' | 'success' => {
  switch (flag) {
    case 'Critical':
      return 'error';
    case 'High':
    case 'Low':
      return 'warning';
    case 'Normal':
      return 'success';
    default:
      return 'default';
  }
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────

const LabDetailPage: React.FC = () => {
  const { id, labId } = useParams<{ id: string; labId: string }>();
  const navigate = useNavigate();

  const { data: lab, isLoading, error, refetch } = useLabDetail(id!, labId!);

  // Whether the result-entry panel is open
  const [showResultEntry, setShowResultEntry] = useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !lab) return <ErrorState onRetry={refetch} />;

  const isCompleted = lab.status === 'Completed';
  const isCancelled = lab.status === 'Cancelled';
  const isOrdered = lab.status === 'Ordered';

  // When a result is saved, close the panel and refresh
  const handleResultSaved = () => {
    setShowResultEntry(false);
    refetch();
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Laboratory Test Detail
            </h1>
            <p className="text-sm text-text-secondary">
              {formatDate(lab.dateOrdered)}
            </p>
          </div>
          <StatusBadge status={lab.status} type="lab" />
        </div>
        <div className="flex items-center gap-2">
          {lab.requestNo && (
            <Badge variant="secondary" className="font-mono">
              {lab.requestNo}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      {/* ── Status banner ── */}
      {isCompleted && (
        <div className="rounded-2xl border border-success/30 bg-success-bg/20 px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Result recorded
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Performed on{' '}
              {lab.datePerformed ? formatDate(lab.datePerformed) : '—'}
              {lab.performedBy ? ` · ${lab.performedBy}` : ''}
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-2xl border border-error/30 bg-error-bg/20 px-5 py-4 flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="text-error flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              This lab test was cancelled
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              No result was recorded.
            </p>
          </div>
        </div>
      )}

      {isOrdered && !showResultEntry && (
        <div className="rounded-2xl border border-warning/30 bg-warning-bg/20 px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Clock size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Awaiting result
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Once the sample has been analysed, record the findings below.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            leftIcon={<Edit3 size={14} />}
            onClick={() => setShowResultEntry(true)}
          >
            Record Result
          </Button>
        </div>
      )}

      {/* ── Section 1: Patient ── */}
      <Card padding="lg">
        <SectionHeader
          number="1"
          title="Patient Information"
          icon={<User size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow
            label="Patient Name"
            value={
              lab.patient
                ? `${lab.patient.firstName} ${lab.patient.lastName}`
                : '—'
            }
            fullWidth
          />
          <InfoRow
            label="Medical Record No."
            value={lab.patient?.patientDisplayId}
          />
          <InfoRow label="Age" value={lab.patient?.age ?? undefined} />
          <InfoRow label="Sex" value={lab.patient?.sex} />
          <InfoRow
            label="Date of Birth"
            value={
              lab.patient?.dateOfBirth
                ? formatDate(lab.patient.dateOfBirth)
                : undefined
            }
            icon={<Calendar size={14} />}
          />
          <InfoRow label="Ward / Clinic" value={lab.wardClinic} />
          <InfoRow
            label="Physician / Requester"
            value={lab.physicianRequester}
          />
          <InfoRow label="Contact / Extension" value={lab.contactExtension} />
        </div>
      </Card>

      {/* ── Section 2: Test identification ── */}
      <Card padding="lg">
        <SectionHeader
          number="2"
          title="Laboratory Investigation Requested"
          icon={<FlaskConical size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow label="Category" value={lab.category} />
          <InfoRow label="Test Name" value={lab.testName} />
          {lab.otherText && (
            <InfoRow label="Other (specified)" value={lab.otherText} />
          )}
          <InfoRow label="Specimen Type" value={lab.specimenType} />
          <InfoRow label="Specimen Site" value={lab.specimenSite} />
          <InfoRow
            label="Priority"
            value={
              lab.priority === 'Emergency'
                ? 'Emergency'
                : lab.priority === 'Urgent'
                  ? 'Urgent'
                  : 'Routine'
            }
          />
          <InfoRow label="Location" value={lab.location} />
        </div>
      </Card>

      {/* ── Section 3: Clinical context ── */}
      {lab.clinicalHistory && (
        <Card padding="lg">
          <SectionHeader
            number="3"
            title="Clinical History / Reason"
            icon={<FileText size={16} />}
          />
          <p className="text-sm text-on-surface whitespace-pre-wrap">
            {lab.clinicalHistory}
          </p>
        </Card>
      )}

      {/* ── Section 4: Collection ── */}
      <Card padding="lg">
        <SectionHeader
          number="4"
          title="Collection & Submission"
          icon={<Calendar size={16} />}
        />
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoRow
            label="Date Ordered"
            value={formatDate(lab.dateOrdered)}
          />
          <InfoRow
            label="Date of Request"
            value={
              lab.dateOfRequest ? formatDate(lab.dateOfRequest) : undefined
            }
          />
          <InfoRow
            label="Collection Date"
            value={
              lab.collectionDate ? formatDate(lab.collectionDate) : undefined
            }
          />
          <InfoRow label="Collection Time" value={lab.collectionTime} />
          <InfoRow
            label="Received Date"
            value={
              lab.receivedDate ? formatDate(lab.receivedDate) : undefined
            }
          />
          <InfoRow label="Received Time" value={lab.receivedTime} />
        </div>
      </Card>

      {/* ── Section 5: Result (when completed) ── */}
      {isCompleted && (
        <Card padding="lg" className="border-l-4 border-l-success">
          <SectionHeader
            number="5"
            title="Result"
            icon={<CheckCircle2 size={16} />}
          />

          <div className="grid md:grid-cols-2 gap-x-6 mb-4">
            <InfoRow
              label="Date Performed"
              value={
                lab.datePerformed
                  ? formatDate(lab.datePerformed)
                  : undefined
              }
            />
            <InfoRow label="Performed By" value={lab.performedBy} />
            <InfoRow label="Reference Range" value={lab.referenceRange} />
            <InfoRow
              label="Abnormal Flag"
              value={
                lab.abnormalFlag ? (
                  <Badge variant={abnormalFlagVariant(lab.abnormalFlag)}>
                    {lab.abnormalFlag}
                  </Badge>
                ) : undefined
              }
            />
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Result / Findings
            </p>
            <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
              {lab.result || '—'}
            </div>
          </div>

          {lab.resultNotes && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Additional Notes
              </p>
              <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                {lab.resultNotes}
              </div>
            </div>
          )}

          {lab.updatedBy && (
            <p className="text-xs text-text-muted mt-3">
              Last updated by {lab.updatedBy.name}
              {lab.updatedAt
                ? ` · ${formatDateTime(lab.updatedAt)}`
                : ''}
            </p>
          )}
        </Card>
      )}

      {/* ── Section 5 (alt): Result entry form ── */}
      {isOrdered && showResultEntry && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              5. Enter Result
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResultEntry(false)}
            >
              Cancel
            </Button>
          </div>
          <LabResultEntry
            labId={labId!}
            patientId={id!}
            category={lab.category}
            onResultSaved={handleResultSaved}
          />
        </div>
      )}

      {/* ── Footer action ── */}
      <div className="flex justify-end pb-6">
        <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
          Back to Patient
        </Button>
      </div>
    </div>
  );
};

export default LabDetailPage;