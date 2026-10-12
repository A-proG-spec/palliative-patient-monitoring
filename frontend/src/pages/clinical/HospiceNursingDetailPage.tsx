import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { useHospiceAssessment } from '@/hooks/useHospiceNursing';
import { formatDate } from '@/lib/utils';
import { patientPath } from '@/lib/clinicalPaths';
import { useAuthStore } from '@/store/auth.store';

// ═════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════

/**
 * Renders one field row. Returns null when the value is empty so
 * the card collapses gracefully for partially-filled assessments.
 */
const Row: React.FC<{
  label: string;
  value?: string | number | null | boolean;
  format?: (v: any) => string;
}> = ({ label, value, format }) => {
  if (value === undefined || value === null || value === '') return null;

  const displayValue = format
    ? format(value)
    : typeof value === 'boolean'
      ? value
        ? 'Yes'
        : 'No'
      : String(value);

  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
      <span className="text-text-muted text-sm min-w-[200px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-on-surface text-sm">{displayValue}</span>
    </div>
  );
};

/** Renders an array of strings as a comma-joined string, or null if empty. */
const ListRow: React.FC<{ label: string; values?: string[] | null }> = ({
  label,
  values,
}) => {
  if (!values || values.length === 0) return null;
  return <Row label={label} value={values.join(', ')} />;
};

/** Renders an array of strings as chips. */
const ChipRow: React.FC<{ label: string; values?: string[] | null }> = ({
  label,
  values,
}) => {
  if (!values || values.length === 0) return null;
  return (
    <div className="py-2 border-b border-border-base last:border-0">
      <p className="text-text-muted text-sm mb-1.5">{label}:</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Badge key={v} variant="secondary">
            {v}
          </Badge>
        ))}
      </div>
    </div>
  );
};

/** Humanizes an enum-like string: `OrientedToPerson` → `Oriented To Person` */
const humanize = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  return v.replace(/([A-Z])/g, ' $1').trim();
};

// ═════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════

const HospiceNursingDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{
    id: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();

  // Route-aware back path (admin vs staff)
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';
  const basePath = patientPath(isAdmin, id!);

  const { data: a, isLoading, error, refetch } = useHospiceAssessment(
    id!,
    assessmentId!,
  );

  if (isLoading) return <PageLoader />;
  if (error || !a) return <ErrorState onRetry={refetch} />;

  const assessedByName =
    a.assessedBy?.name ??
    a.enteredBy?.name ??
    '—';

  return (
    <div className="max-w-4xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton
            to={`${basePath}/hospice-nursing`}
            label="Hospice Nursing"
          />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Hospice Nursing Assessment
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              {formatDate(a.assessmentDate)} · Assessed by {assessedByName}
            </p>
          </div>
        </div>
        {a.deletedAt && <Badge variant="error">Deleted</Badge>}
      </div>

      {/* ═══════════════════════════════════════════════════════
          1. General Observation
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>General Observation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row
            label="Level of Consciousness"
            value={humanize(a.levelOfConsciousness)}
          />
          <ListRow label="Orientation" values={a.orientation} />
          <ListRow label="General Appearance" values={a.generalAppearance} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          2. Vital Signs
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Vital Signs</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Blood Pressure" value={a.bloodPressure} />
          <Row
            label="Pulse Rate"
            value={a.pulseRate}
            format={(v) => `${v} bpm`}
          />
          <Row
            label="Respiratory Rate"
            value={a.respiratoryRate}
            format={(v) => `${v} /min`}
          />
          <Row
            label="Temperature"
            value={a.temperature}
            format={(v) => `${v} °C`}
          />
          <Row
            label="SpO₂"
            value={a.oxygenSaturation}
            format={(v) => `${v}%`}
          />
          <Row
            label="Weight"
            value={a.weightKg}
            format={(v) => `${v} kg`}
          />
          <Row
            label="Height"
            value={a.heightCm}
            format={(v) => `${v} cm`}
          />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          3. Pain Assessment
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Pain Assessment</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Pain Present" value={a.painPresent} />
          <Row
            label="Pain Score"
            value={a.painScore}
            format={(v) => `${v}/10`}
          />
          <ListRow label="Location" values={a.painLocation} />
          <Row label="Location (other)" value={a.painLocationOther} />
          <ListRow label="Characteristics" values={a.painCharacteristics} />
          <ListRow
            label="Relief Measures"
            values={a.painReliefMeasures}
          />
          <Row label="Relief Measures (other)" value={a.painReliefOther} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          4. Respiratory
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Respiratory</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row
            label="Breathing Pattern"
            value={humanize(a.breathingPattern)}
          />
          <Row label="Dyspnea Severity" value={a.dyspneaSeverity} />
          <Row label="Oxygen Therapy" value={a.oxygenTherapy} />
          <Row label="Oxygen Flow Rate" value={a.oxygenFlowRate} />
          <Row label="Cough" value={a.cough} />
          <Row label="Sputum Color" value={a.sputumColor} />
          <Row label="Notes" value={a.respiratoryNotes} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          5. Cardiovascular
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Cardiovascular</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Pulse Rhythm" value={a.pulseRhythm} />
          <Row label="Peripheral Edema" value={a.peripheralEdema} />
          <Row label="Edema Location" value={a.edemaLocation} />
          <Row label="Skin Color" value={a.skinColor} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          6. Gastrointestinal
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Gastrointestinal</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Appetite" value={a.appetite} />
          <Row label="Nausea" value={a.nausea} />
          <Row label="Vomiting" value={a.vomiting} />
          <Row label="Vomiting Frequency" value={a.vomitingFrequency} />
          <Row label="Bowel Function" value={a.bowelFunction} />
          <Row
            label="Last Bowel Movement"
            value={a.lastBowelMovement ? formatDate(a.lastBowelMovement) : undefined}
          />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          7. Genitourinary
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Genitourinary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Urinary Function" value={a.urinaryFunction} />
          <Row label="Urine Appearance" value={a.urineAppearance} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          8. Skin & Pressure Injury
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Skin &amp; Pressure Injury</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Skin Integrity" value={a.skinIntegrity} />
          <Row label="Pressure Injury Risk" value={a.pressureInjuryRisk} />
          <Row label="Pressure Ulcer Present" value={a.pressureUlcerPresent} />
          <Row
            label="Pressure Ulcer Location"
            value={a.pressureUlcerLocation}
          />
          <Row
            label="Pressure Ulcer Stage"
            value={a.pressureUlcerStage}
          />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          9. Mobility & Activities of Daily Living
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Mobility &amp; Activities of Daily Living</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Mobility Status" value={a.mobilityStatus} />
          <Row label="Fall Risk" value={a.fallRisk} />
          <ListRow label="Assistive Devices" values={a.assistiveDevices} />
          <Row
            label="Assistive Devices (other)"
            value={a.assistiveDevicesOther}
          />

          <div className="pt-3 mt-3 border-t border-border-base">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
              Activities of Daily Living
            </p>
            <Row label="Feeding" value={a.feeding} />
            <Row label="Bathing" value={a.bathing} />
            <Row label="Dressing" value={a.dressing} />
            <Row label="Toileting" value={a.toileting} />
            <Row label="Mobility" value={a.mobility} />
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          10. Psychological
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Psychological</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Emotional Status" value={a.emotionalStatus} />
          <Row label="Communication Ability" value={a.communicationAbility} />
          <Row label="Cognitive Status" value={a.cognitiveStatus} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          11. Family & Caregiver
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Family &amp; Caregiver</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Primary Caregiver" value={a.primaryCaregiverName} />
          <Row
            label="Caregiver Relationship"
            value={a.primaryCaregiverRelationship}
          />
          <Row label="Caregiver Phone" value={a.primaryCaregiverPhone} />
          <Row label="Family Support" value={a.familySupport} />
          <Row label="Caregiver Stress Level" value={a.caregiverStressLevel} />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          12. Spiritual / Cultural
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Spiritual / Cultural</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row
            label="Spiritual Support Requested"
            value={a.spiritualSupportRequested}
          />
          <Row
            label="Religious Affiliation"
            value={a.religiousAffiliation}
          />
          <Row
            label="Religious Affiliation (other)"
            value={a.religiousAffiliationOther}
          />
          <Row
            label="Cultural Considerations"
            value={a.culturalConsiderations}
          />
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          13. Nursing Diagnoses & Summary
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Nursing Diagnoses &amp; Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ChipRow label="Nursing Diagnoses" values={a.nursingDiagnoses} />
          <Row
            label="Nursing Diagnoses (other)"
            value={a.nursingDiagnosesOther}
          />
          {a.nurseSummary && (
            <div className="pt-3 mt-3 border-t border-border-base">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                Nurse&apos;s Summary
              </p>
              <p className="text-sm text-on-surface whitespace-pre-wrap">
                {a.nurseSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          14. Audit / Metadata
      ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Assessment Date" value={formatDate(a.assessmentDate)} />
          <Row label="Assessed By" value={assessedByName} />
          {a.enteredBy && (
            <Row label="Entered By" value={a.enteredBy.name} />
          )}
          {a.updatedByAdmin && (
            <Row label="Updated By" value={a.updatedByAdmin.name} />
          )}
          <Row label="Created" value={formatDate(a.createdAt)} />
          <Row label="Last Updated" value={formatDate(a.updatedAt)} />
          {a.deletedAt && (
            <Row label="Deleted At" value={formatDate(a.deletedAt)} />
          )}
          {a.deletionReason && (
            <Row label="Deletion Reason" value={a.deletionReason} />
          )}
          {a.hospitalAdmissionId && (
            <Row
              label="Linked Admission"
              value={`#${a.hospitalAdmissionId}`}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Footer actions ── */}
      <div className="flex justify-end gap-3 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`${basePath}/hospice-nursing`)}
        >
          Back to List
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>
    </div>
  );
};

export default HospiceNursingDetailPage;