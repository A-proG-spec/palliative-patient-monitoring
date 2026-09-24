import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import {
  DISCHARGE_SECTIONS,
  type DischargeSectionKey,
  type DischargeSummary,
} from '@/hooks/useDischargeFormState';

interface DischargeReviewDialogProps {
  open: boolean;
  form: DischargeSummary;
  patientName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onEditSection: (key: DischargeSectionKey) => void;
}

// ── Simple read-only row ──
const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start gap-3 py-1.5 text-sm">
    <span className="text-text-muted text-xs min-w-[160px] flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-on-surface font-medium">{value || '—'}</span>
  </div>
);

// ── Per-section summary content ──
function renderSectionSummary(key: DischargeSectionKey, form: DischargeSummary): React.ReactNode {
  const g = (v: string) => (v && v.trim() ? v : '—');

  switch (key) {
    case 'header':
      return (
        <>
          <ReviewRow label="Hospital" value={g(form.hospitalName)} />
          <ReviewRow label="Date of Discharge" value={form.dateOfDischarge ? formatDate(form.dateOfDischarge) : '—'} />
          <ReviewRow label="Time of Discharge" value={g(form.timeOfDischarge)} />
          <ReviewRow label="Discharge Type" value={form.dischargeType === 'Other' ? `Other — ${form.dischargeTypeOther}` : g(form.dischargeType)} />
        </>
      );
    case 'patient':
      return (
        <>
          <ReviewRow label="Full Name" value={g(form.fullName)} />
          <ReviewRow label="Age / Sex" value={`${g(form.age)} · ${g(form.sex)}`} />
          <ReviewRow label="Telephone" value={g(form.telephone)} />
          <ReviewRow label="Caregiver" value={g(form.primaryCaregiver)} />
          <ReviewRow label="Caregiver Phone" value={g(form.caregiverTelephone)} />
        </>
      );
    case 'admission':
      return (
        <>
          <ReviewRow label="Primary Diagnosis" value={g(form.primaryDiagnosis)} />
          <ReviewRow label="Secondary" value={g(form.secondaryDiagnoses)} />
          <ReviewRow label="Reason for Admission" value={g(form.reasonForAdmission)} />
        </>
      );
    case 'clinical':
      return (
        <>
          <ReviewRow label="Final Diagnosis" value={g(form.finalDischargeDiagnosis)} />
          <ReviewRow label="Problems Managed" value={form.clinicalProblemsManaged.filter(Boolean).join(', ') || '—'} />
        </>
      );
    case 'condition':
      return (
        <>
          <ReviewRow label="Overall Condition" value={g(form.overallCondition)} />
          <ReviewRow label="Consciousness" value={g(form.levelOfConsciousness)} />
          <ReviewRow label="Functional Status" value={g(form.functionalStatus)} />
          <ReviewRow label="Mobility" value={g(form.mobility)} />
          <ReviewRow label="Oral Intake" value={g(form.oralIntake)} />
        </>
      );
    case 'vitals':
      return (
        <>
          <ReviewRow label="Temp / Pulse" value={`${g(form.temperature)} / ${g(form.pulse)}`} />
          <ReviewRow label="BP / RR" value={`${g(form.bloodPressure)} / ${g(form.respiratoryRate)}`} />
          <ReviewRow label="SpO₂ / O₂ req" value={`${g(form.oxygenSaturation)} / ${g(form.oxygenRequirement)}`} />
        </>
      );
    case 'symptoms': {
      const rows = Object.entries(form.symptoms)
        .filter(([, r]) => r.severity !== 'None' || r.notes.trim())
        .map(([name, r]) => `${name}: ${r.severity}${r.notes ? ` — ${r.notes}` : ''}`);
      return (
        <>
          {rows.length ? rows.map((r, i) => <ReviewRow key={i} label={i === 0 ? 'Symptoms' : ''} value={r} />) : <ReviewRow label="Symptoms" value="None reported" />}
          <ReviewRow label="Pain Score / Control" value={`${g(form.painScore)} / ${g(form.painControl)}`} />
        </>
      );
    }
    case 'medications': {
      const rows = form.dischargeMedications.filter((m) => m.medication.trim());
      return (
        <>
          {rows.length ? rows.map((m, i) => (
            <ReviewRow key={i} label={i === 0 ? 'Medications' : ''} value={`${m.medication} ${m.dose} ${m.route} ${m.frequency}`} />
          )) : <ReviewRow label="Medications" value="None listed" />}
        </>
      );
    }
    case 'symptomMgmt':
      return (
        <>
          <ReviewRow label="Pain" value={g(form.painManagementInstructions)} />
          <ReviewRow label="Breathlessness" value={g(form.breathlessnessManagement)} />
          <ReviewRow label="Nausea / Vomiting" value={g(form.nauseaVomitingManagement)} />
          <ReviewRow label="Constipation" value={g(form.constipationManagement)} />
        </>
      );
    case 'nutrition':
      return (
        <>
          <ReviewRow label="Diet" value={g(form.diet)} />
          <ReviewRow label="Feeding Assistance" value={g(form.feedingAssistance)} />
          <ReviewRow label="Hydration" value={g(form.hydrationInstructions)} />
        </>
      );
    case 'wound':
      return (
        <>
          <ReviewRow label="Wound Present" value={g(form.woundPresent)} />
          {form.woundPresent === 'Yes' && <ReviewRow label="Location" value={g(form.woundLocation)} />}
        </>
      );
    case 'equipment':
      return (
        <>
          <ReviewRow label="Oxygen Required" value={g(form.oxygenRequired)} />
          <ReviewRow label="Equipment" value={form.equipmentRequired.join(', ') || '—'} />
        </>
      );
    case 'goals':
      return (
        <>
          <ReviewRow label="Goals" value={form.goalsOfCare.join(', ') || '—'} />
          <ReviewRow label="Code Status" value={g(form.codeStatus)} />
          <ReviewRow label="ACP" value={g(form.advanceCarePlan)} />
        </>
      );
    case 'destination':
      return (
        <>
          <ReviewRow label="Discharged To" value={form.dischargedTo === 'Other' ? `Other — ${form.dischargedToOther}` : g(form.dischargedTo)} />
          <ReviewRow label="Transport" value={form.transport === 'Other' ? `Other — ${form.transportOther}` : g(form.transport)} />
        </>
      );
    case 'homeCare':
      return (
        <>
          <ReviewRow label="Home Palliative Care" value={g(form.homePalliativeCareRequired)} />
          <ReviewRow label="Hospice Referral" value={g(form.hospiceReferral)} />
          <ReviewRow label="Provider" value={g(form.responsibleProvider)} />
        </>
      );
    case 'education':
      return (
        <>
          <ReviewRow label="Topics" value={form.educationTopics.join(', ') || '—'} />
          <ReviewRow label="Understanding" value={g(form.patientUnderstanding)} />
        </>
      );
    case 'warnings':
      return (
        <>
          <ReviewRow label="Warning Signs" value={form.warningSigns.join(', ') || '—'} />
        </>
      );
    case 'followUp':
      return (
        <>
          <ReviewRow label="Palliative Follow-Up" value={g(form.palliativeCareFollowUp)} />
          {form.palliativeCareFollowUp === 'Yes' && (
            <ReviewRow label="Follow-Up Date" value={form.palliativeCareFollowUpDate ? formatDate(form.palliativeCareFollowUpDate) : '—'} />
          )}
        </>
      );
    case 'contacts':
      return (
        <>
          <ReviewRow label="Unit Contact" value={g(form.palliativeCareUnitContact)} />
          <ReviewRow label="Unit Phone" value={g(form.palliativeCareUnitPhone)} />
          <ReviewRow label="Emergency Contact" value={g(form.emergencyContactInfo)} />
        </>
      );
    case 'notes':
      return (
        <div className="text-sm text-on-surface bg-surface-low rounded-lg px-4 py-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
          {form.dischargeNotes || '—'}
        </div>
      );
  }
}

// ── Which sections count as "filled" for the review ──
function isSectionFilled(key: DischargeSectionKey, form: DischargeSummary): boolean {
  switch (key) {
    case 'header':      return Boolean(form.dateOfDischarge && form.timeOfDischarge && form.dischargeType);
    case 'condition':   return Boolean(form.overallCondition);
    case 'destination': return Boolean(form.dischargedTo);
    case 'notes':       return form.dischargeNotes.trim().length > 0;
    default: {
      // Section is "filled" if at least one of its fields has content
      const checks: Record<Exclude<DischargeSectionKey, 'header' | 'condition' | 'destination' | 'notes'>, boolean> = {
        patient: Boolean(form.fullName || form.address || form.telephone),
        admission: Boolean(form.primaryDiagnosis || form.reasonForAdmission),
        clinical: Boolean(form.finalDischargeDiagnosis || form.summaryOfClinicalCourse),
        vitals: Boolean(form.temperature || form.pulse || form.bloodPressure),
        symptoms: Object.values(form.symptoms).some((r) => r.severity !== 'None' || r.notes.trim()),
        medications: form.dischargeMedications.some((m) => m.medication.trim()),
        symptomMgmt: Boolean(form.painManagementInstructions || form.breathlessnessManagement),
        nutrition: Boolean(form.diet || form.hydrationInstructions),
        wound: Boolean(form.woundPresent),
        equipment: Boolean(form.oxygenRequired || form.equipmentRequired.length),
        goals: form.goalsOfCare.length > 0 || Boolean(form.codeStatus),
        homeCare: Boolean(form.homePalliativeCareRequired || form.hospiceReferral),
        education: form.educationTopics.length > 0 || Boolean(form.patientUnderstanding),
        warnings: form.warningSigns.length > 0,
        followUp: Boolean(form.palliativeCareFollowUp),
        contacts: Boolean(form.palliativeCareUnitContact || form.attendingClinician),
      };
      return checks[key as keyof typeof checks] ?? false;
    }
  }
}

// ═══════════════════════════════════════════════════════════

export const DischargeReviewDialog: React.FC<DischargeReviewDialogProps> = ({
  open,
  form,
  patientName,
  isSubmitting,
  onCancel,
  onConfirm,
  onEditSection,
}) => {
  const [expanded, setExpanded] = useState<Record<DischargeSectionKey, boolean>>(
    () => Object.fromEntries(DISCHARGE_SECTIONS.map((s) => [s.key, true])) as any,
  );

  const filledSections = useMemo(
    () => DISCHARGE_SECTIONS.filter((s) => isSectionFilled(s.key, form)),
    [form],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-on-surface/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-4 bg-surface-lowest rounded-2xl border border-border-base shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-error-bg flex items-center justify-center">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-on-surface">
              Review before discharge
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Confirm that the discharge summary for{' '}
              <span className="text-on-surface font-medium">{patientName}</span>{' '}
              is complete. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Scrollable review body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {filledSections.map((section) => {
              const isOpen = expanded[section.key];
              return (
                <div
                  key={section.key}
                  className="rounded-xl border border-border-base bg-surface-lowest overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-low/50">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [section.key]: !prev[section.key] }))
                      }
                      className="flex items-center gap-2 flex-1 text-left"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
                      <span className="font-mono text-[10px] bg-surface-container rounded px-1.5 py-0.5 text-text-muted">
                        {section.letter}
                      </span>
                      <span className="text-sm font-medium text-on-surface">
                        {section.label}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditSection(section.key)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                      title="Edit this section"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1">
                      {renderSectionSummary(section.key, form)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-base flex-shrink-0 bg-surface-low/30">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Keep Editing
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            loading={isSubmitting}
          >
            Yes, Discharge Patient
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DischargeReviewDialog;