import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisitDetail } from '@/hooks/useVisits';
import { usePatient } from '@/hooks/usePatients';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate, formatEnumLabel } from '@/lib/utils';
import {
  VISIT_TYPE_LABELS,
  OUTCOME_LABELS,
  PAIN_LOCATION_LABELS,
  SYMPTOM_LABELS,
  RED_FLAG_LABELS,
  EDUCATION_LABELS,
} from '@/constants';

// ─────────────────────────────────────────────────────────────
// Small helpers (defensive against missing fields)
// ─────────────────────────────────────────────────────────────
const safe = (v: unknown, fallback = '—') =>
  v === null || v === undefined || v === '' ? fallback : String(v);

const safeList = (v: unknown, map?: Record<string, string>) => {
  if (!Array.isArray(v) || v.length === 0) return '—';
  return v
    .map((item) => (map ? map[String(item)] ?? String(item) : String(item)))
    .join(', ');
};

// ─────────────────────────────────────────────────────────────
// Section header (plain divider, no card wrapper)
// ─────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="py-5 border-b border-border-base last:border-b-0">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      {children}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// One field row
// ─────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, value, fullWidth }) => (
  <div className={fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}>
    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className="text-sm text-on-surface break-words">
      {value === undefined || value === null || value === '' ? '—' : value}
    </p>
  </div>
);

// ═════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════
const VisitDetailPage: React.FC = () => {
  const { id, visitId } = useParams<{ id: string; visitId: string }>();
  const navigate = useNavigate();

  const { data: visit, isLoading, error, refetch } = useVisitDetail(
    id!,
    visitId!,
  );
  const { data: patient } = usePatient(id!);

  if (isLoading) return <PageLoader />;
  if (error || !visit) return <ErrorState onRetry={refetch} />;

  // ── Defensive reads — every nested field can be undefined ──
  const adl = visit.adl ?? {
    feeding: '—',
    bathing: '—',
    dressing: '—',
    toileting: '—',
    mobility: '—',
  };
  const vitals = visit.vitals ?? {};
  const symptoms = visit.symptoms ?? [];
  const painLocation = visit.painLocation ?? [];
  const painCharacteristics = visit.painCharacteristics ?? [];
  const redFlags = (visit.redFlags ?? []).filter(
    (f: string) => f !== 'None',
  );
  const teamMembers = visit.teamMembers ?? [];
  const signatures = visit.signatures ?? [];
  const medications = visit.currentMedications ?? [];

  return (
    <div className="max-w-5xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Visit Record
            </h1>
            <p className="text-sm text-text-secondary">
              {formatDate(visit.visitDate)}
              {visit.timeStarted && visit.timeEnded && (
                <>
                  {' '}
                  · {visit.timeStarted} – {visit.timeEnded}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={visit.outcome} type="visit" />
          {visit.allSigned && <Badge variant="success">All Signed</Badge>}
        </div>
      </div>

      {/* ── Single flat content container ── */}
      <div className="rounded-2xl border border-border-base bg-surface-lowest px-6">
        {/* 1. VISIT INFORMATION */}
        <Section title="Visit Information">
          <Field label="Visit Date" value={formatDate(visit.visitDate)} />
          <Field
            label="Time"
            value={
              visit.timeStarted && visit.timeEnded
                ? `${visit.timeStarted} – ${visit.timeEnded}`
                : '—'
            }
          />
          <Field
            label="Visit Type"
            value={
              VISIT_TYPE_LABELS[visit.visitType] ?? visit.visitType ?? '—'
            }
          />
          <Field
            label="Overall Status"
            value={formatEnumLabel(visit.overallStatus ?? '')}
          />
          <Field
            label="Mobility"
            value={formatEnumLabel(visit.mobility ?? '')}
          />
          <Field
            label="Outcome"
            value={OUTCOME_LABELS[visit.outcome] ?? visit.outcome ?? '—'}
          />
          {visit.nextVisitDate && (
            <Field
              label="Next Visit"
              value={formatDate(visit.nextVisitDate)}
            />
          )}
        </Section>

        {/* 2. VITAL SIGNS */}
        <Section title="Vital Signs">
          <Field label="Temperature" value={safe(vitals.temperature)} />
          <Field label="Pulse" value={safe(vitals.pulse)} />
          <Field
            label="Blood Pressure"
            value={safe((vitals as any).bloodPressure ?? (vitals as any).bp)}
          />
          <Field label="Respiration" value={safe(vitals.respiration)} />
          <Field label="SpO₂" value={safe(vitals.spO2)} />
        </Section>

        {/* 3. PAIN ASSESSMENT */}
        <Section title="Pain Assessment">
          <Field
            label="Pain Present"
            value={
              visit.painPresent === true
                ? 'Yes'
                : visit.painPresent === false
                  ? 'No'
                  : '—'
            }
          />
          <Field
            label="Pain Score"
            value={`${safe(visit.painScore)} / 10`}
          />
          <Field
            label="Pain Location"
            value={safeList(painLocation, PAIN_LOCATION_LABELS)}
          />
          {visit.painLocationOther && (
            <Field
              label="Location (other)"
              value={visit.painLocationOther}
            />
          )}
          <Field
            label="Pain Characteristics"
            value={safeList(painCharacteristics)}
          />
          <Field
            label="On Pain Medication"
            value={
              visit.currentPainMedication === true
                ? 'Yes'
                : visit.currentPainMedication === false
                  ? 'No'
                  : '—'
            }
          />
          <Field
            label="Management Effective"
            value={visit.painMedicationEffective ? 'Yes' : 'No'}
          />
          {visit.painMedicationEffective === false &&
            visit.painManagementIneffectiveReason && (
              <Field
                label="Ineffective Reason"
                value={visit.painManagementIneffectiveReason}
                fullWidth
              />
            )}
        </Section>

        {/* 4. SYMPTOMS */}
        <Section title="Symptoms">
          <Field
            label="Reported Symptoms"
            value={safeList(symptoms, SYMPTOM_LABELS)}
            fullWidth
          />
          {visit.symptomsOther && (
            <Field label="Other Symptom" value={visit.symptomsOther} />
          )}
        </Section>

        {/* 5. FUNCTIONAL STATUS */}
        <Section title="Functional Status">
          <Field label="PPS Score" value={`${safe(visit.ppsScore)}%`} />
          <Field
            label="KPS Score"
            value={`${safe(visit.kpsScore)} / 100`}
          />
          <Field
            label="Feeding"
            value={formatEnumLabel(adl.feeding ?? '')}
          />
          <Field
            label="Bathing"
            value={formatEnumLabel(adl.bathing ?? '')}
          />
          <Field
            label="Dressing"
            value={formatEnumLabel(adl.dressing ?? '')}
          />
          <Field
            label="Toileting"
            value={formatEnumLabel(adl.toileting ?? '')}
          />
          <Field
            label="Mobility"
            value={formatEnumLabel(adl.mobility ?? '')}
          />
        </Section>

        {/* 6. NUTRITION */}
        <Section title="Nutrition & Hydration">
          <Field
            label="Appetite"
            value={formatEnumLabel(visit.appetite ?? '')}
          />
          <Field
            label="Oral Intake"
            value={formatEnumLabel(visit.oralIntake ?? '')}
          />
          <Field
            label="Hydration Status"
            value={formatEnumLabel(visit.hydrationStatus ?? '')}
          />
          {visit.nutritionComments && (
            <Field
              label="Comments"
              value={visit.nutritionComments}
              fullWidth
            />
          )}
        </Section>

        {/* 7. PSYCHOSOCIAL */}
        <Section title="Psychosocial">
          <Field
            label="Emotional Status"
            value={formatEnumLabel(visit.emotionalStatus ?? '')}
          />
          <Field
            label="Family Support"
            value={formatEnumLabel(visit.familySupport ?? '')}
          />
          <Field
            label="Financial Difficulty"
            value={visit.financialDifficulty ? 'Yes' : 'No'}
          />
          {visit.emotionalComments && (
            <Field
              label="Emotional Comments"
              value={visit.emotionalComments}
              fullWidth
            />
          )}
          {visit.financialComments && (
            <Field
              label="Financial Comments"
              value={visit.financialComments}
              fullWidth
            />
          )}
        </Section>

        {/* 8. SPIRITUAL */}
        <Section title="Spiritual">
          <Field
            label="Spiritual Needs Identified"
            value={visit.spiritualNeeds ? 'Yes' : 'No'}
          />
          {visit.spiritualNeedsDescription && (
            <Field
              label="Spiritual Needs Details"
              value={visit.spiritualNeedsDescription}
              fullWidth
            />
          )}
          <Field
            label="Religious Support Requested"
            value={visit.religiousSupportRequested ? 'Yes' : 'No'}
          />
          {visit.religiousSupportSpecify && (
            <Field
              label="Religious Support Details"
              value={visit.religiousSupportSpecify}
              fullWidth
            />
          )}
        </Section>

        {/* 9. MEDICATION */}
        <Section title="Medication">
          <Field
            label="Medications Available"
            value={visit.medicationAvailable ? 'Yes' : 'No'}
          />
          <Field
            label="Taken Correctly"
            value={visit.medicationCorrectlyTaken ? 'Yes' : 'No'}
          />
          <Field
            label="Side Effects"
            value={visit.medicationSideEffects ? 'Yes' : 'No'}
          />
          <Field
            label="Refill Needed"
            value={visit.medicationRefillNeeded ? 'Yes' : 'No'}
          />
          <Field
            label="Morphine Available"
            value={
              visit.morphineAvailable === true
                ? 'Yes'
                : visit.morphineAvailable === false
                  ? 'No'
                  : 'N/A'
            }
          />
          <Field
            label="Adherence"
            value={formatEnumLabel(visit.adherenceLevel ?? '')}
          />
          {visit.medicationIssues && (
            <Field
              label="Medication Issues"
              value={visit.medicationIssues}
              fullWidth
            />
          )}
        </Section>

        {/* CURRENT MEDICATIONS TABLE */}
        {medications.length > 0 && (
          <Section title="Current Medications">
            <div className="sm:col-span-2 lg:col-span-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Dosage</th>
                    <th className="pb-2 pr-4 font-medium">Frequency</th>
                    <th className="pb-2 font-medium">Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {medications.map((m: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 pr-4">{safe(m.name)}</td>
                      <td className="py-2 pr-4 text-text-secondary">
                        {safe(m.dosage)}
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">
                        {safe(m.frequency)}
                      </td>
                      <td className="py-2 text-text-secondary">
                        {safe(m.route)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* 10. CAREGIVER */}
        <Section title="Caregiver">
          <Field
            label="Primary Caregiver"
            value={safe(visit.primaryCaregiver ?? patient?.caregiverName)}
          />
          <Field
            label="Relationship"
            value={safe(patient?.caregiverRelation)}
          />
          <Field label="Phone" value={safe(patient?.caregiverPhone)} />
          <Field
            label="Burden"
            value={formatEnumLabel(visit.caregiverBurden ?? '')}
          />
          <Field
            label="Understanding"
            value={formatEnumLabel(visit.caregiverUnderstanding ?? '')}
          />
          <Field
            label="Caregiving Capacity"
            value={formatEnumLabel(visit.caregivingCapacity ?? '')}
          />
          <Field
            label="Family Emotional Status"
            value={formatEnumLabel(visit.familyEmotionalStatus ?? '')}
          />
        </Section>

        {/* 11. EDUCATION */}
        <Section title="Education Provided">
          <Field
            label="Education Topics"
            value={safeList(visit.educationProvided, EDUCATION_LABELS)}
            fullWidth
          />
          {visit.educationProvidedOther && (
            <Field
              label="Other Topic"
              value={visit.educationProvidedOther}
              fullWidth
            />
          )}
          <Field
            label="Training Needs"
            value={safeList(visit.trainingNeeds)}
            fullWidth
          />
          <Field
            label="Additional Support Needed"
            value={visit.additionalSupportNeeded ? 'Yes' : 'No'}
          />
          {visit.additionalSupportSpecify && (
            <Field
              label="Additional Support Details"
              value={visit.additionalSupportSpecify}
              fullWidth
            />
          )}
        </Section>

        {/* 12. HOME ENVIRONMENT */}
        <Section title="Home Environment">
          <Field
            label="Condition of Home"
            value={formatEnumLabel(visit.homeCondition ?? '')}
          />
          <Field
            label="Observations"
            value={safeList(visit.homeObservations)}
            fullWidth
          />
          {visit.homeEnvironmentDetails && (
            <Field
              label="Details"
              value={visit.homeEnvironmentDetails}
              fullWidth
            />
          )}
        </Section>

        {/* 13. NURSING CARE */}
        <Section title="Nursing Care Provided">
          <Field
            label="Care Provided"
            value={safeList(visit.nursingCareGiven)}
            fullWidth
          />
          {visit.nursingCareOther && (
            <Field
              label="Other"
              value={visit.nursingCareOther}
              fullWidth
            />
          )}
        </Section>

        {/* 14. RED FLAGS */}
        {redFlags.length > 0 && (
          <Section title="Red Flags">
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-1.5">
              {redFlags.map((f: string) => (
                <Badge key={f} variant="error">
                  {RED_FLAG_LABELS[f] ?? f}
                </Badge>
              ))}
            </div>
            {visit.redFlagActions && (
              <Field
                label="Action Taken"
                value={visit.redFlagActions}
                fullWidth
              />
            )}
          </Section>
        )}

        {/* 15. REFERRALS MADE */}
        {Array.isArray(visit.referralsMade) &&
          visit.referralsMade.length > 0 && (
            <Section title="Referrals Made">
              <Field
                label="Referrals"
                value={visit.referralsMade.join(', ')}
                fullWidth
              />
            </Section>
          )}

        {/* 16. KEY ISSUES & PLAN */}
        {(visit.keyIssues ||
          visit.immediateActions ||
          visit.followUpPlan) && (
          <Section title="Key Issues & Action Plan">
            {visit.keyIssues && (
              <Field label="Key Issues" value={visit.keyIssues} fullWidth />
            )}
            {visit.immediateActions && (
              <Field
                label="Immediate Actions"
                value={visit.immediateActions}
                fullWidth
              />
            )}
            {visit.followUpPlan && (
              <Field
                label="Follow-Up Plan"
                value={visit.followUpPlan}
                fullWidth
              />
            )}
          </Section>
        )}

        {/* 17. TEAM MEMBERS */}
        {teamMembers.length > 0 && (
          <Section title="Visiting Team">
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
              {teamMembers.map((m: any, i: number) => (
                <Badge key={i} variant="secondary">
                  {m.role}: {m.name}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* 18. SIGNATURES */}
        {signatures.length > 0 && (
          <Section title="Signatures">
            <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
              {signatures.map((s: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm flex-wrap"
                >
                  <Badge variant="success">{s.role}</Badge>
                  <span className="text-on-surface">{s.name}</span>
                  {s.signedAt && (
                    <span className="text-xs text-text-muted">
                      · {formatDate(s.signedAt)}
                    </span>
                  )}
                  {s.isTeamLeader && (
                    <span className="text-xs text-primary">
                      · Team Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end pb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/patients/${id}`)}
        >
          Back to Patient
        </Button>
      </div>
    </div>
  );
};

export default VisitDetailPage;