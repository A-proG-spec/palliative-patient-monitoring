import React, { useEffect, useRef } from 'react';
import { X, Printer, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, hasRole } from '@/lib/utils';
import { useProgressNote, useDeleteProgressNote } from '@/hooks/useProgressNotes';
import { useAuthStore } from '@/store/auth.store';
import type { ProgressNote } from '@/hooks/useProgressNotes';

// ══════════════════════════════════════════════════════════════════════════════
// Props
// ══════════════════════════════════════════════════════════════════════════════

interface ProgressNoteModalProps {
  patientId: string;
  noteId: string;
  onClose: () => void;
  onEdit?: (noteId: string) => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// Section Component
// ══════════════════════════════════════════════════════════════════════════════

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, isEmpty }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-on-surface mb-3 border-b border-border-base pb-2">
      {title}
    </h3>
    {isEmpty ? (
      <p className="text-sm text-text-muted italic">Not recorded</p>
    ) : (
      <div className="space-y-2 text-sm">{children}</div>
    )}
  </div>
);

const Field: React.FC<{ label: string; value?: string | null | number }> = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-text-muted min-w-[140px] flex-shrink-0">{label}:</span>
    <span className="text-on-surface">{value || '—'}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// Modal Component
// ══════════════════════════════════════════════════════════════════════════════

export const ProgressNoteModal: React.FC<ProgressNoteModalProps> = ({
  patientId,
  noteId,
  onClose,
  onEdit,
}) => {
  const { user } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: note, isLoading, error, refetch } = useProgressNote(patientId, noteId);
  const deleteMutation = useDeleteProgressNote(patientId);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // ── Access control ──
  const isAdmin = user?.type === 'admin';
  const isAuthor = note?.responsibleClinician?.staffId === user?.id;
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAdmin;

  // ── Lock body scroll on mount ──
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ── Focus trap ──
  useEffect(() => {
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [isLoading]);

  // ── Escape key handler ──
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showDeleteConfirm]);

  // ── Handlers ──
  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    deleteMutation.mutate(noteId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ── Render helpers ──
  const renderVitals = (note: ProgressNote) => {
    const isEmpty = !note.vitals?.temperature?.current &&
      !note.vitals?.pulse?.current &&
      !note.vitals?.respiratoryRate?.current &&
      !note.vitals?.bloodPressure?.current &&
      !note.vitals?.spo2?.current &&
      !note.vitals?.oxygenFlow?.current &&
      !note.otherRelevantObservations;

    return (
      <Section title="2. Vital Signs" isEmpty={isEmpty}>
        {!isEmpty && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Field label="Temperature" value={note.vitals?.temperature?.current} />
              <Field label="(Previous)" value={note.vitals?.temperature?.previous} />
              <Field label="Pulse" value={note.vitals?.pulse?.current} />
              <Field label="(Previous)" value={note.vitals?.pulse?.previous} />
              <Field label="Respiratory Rate" value={note.vitals?.respiratoryRate?.current} />
              <Field label="(Previous)" value={note.vitals?.respiratoryRate?.previous} />
              <Field label="Blood Pressure" value={note.vitals?.bloodPressure?.current} />
              <Field label="(Previous)" value={note.vitals?.bloodPressure?.previous} />
              <Field label="SpO2" value={note.vitals?.spo2?.current} />
              <Field label="(Previous)" value={note.vitals?.spo2?.previous} />
              <Field label="Oxygen Flow" value={note.vitals?.oxygenFlow?.current} />
              <Field label="(Previous)" value={note.vitals?.oxygenFlow?.previous} />
            </div>
            {note.otherRelevantObservations && (
              <Field label="Other Observations" value={note.otherRelevantObservations} />
            )}
          </>
        )}
      </Section>
    );
  };

  const renderSymptoms = (note: ProgressNote) => {
    const symptoms = note.symptoms ?? {};
    const hasSymptoms = Object.entries(symptoms).some(([_, s]) => s?.severity !== 'None' || s?.notes);
    const hasPainDetails = note.painScore || note.painLocation || note.painCharacter ||
      note.currentPainManagement || note.responseToTreatment;

    const isEmpty = !hasSymptoms && !hasPainDetails;

    return (
      <Section title="3. Symptom Assessment" isEmpty={isEmpty}>
        {!isEmpty && (
          <>
            {hasSymptoms && (
              <div className="space-y-1">
                {Object.entries(symptoms).map(([symptom, data]) => (
                  data?.severity !== 'None' || data?.notes ? (
                    <div key={symptom} className="flex gap-2">
                      <span className="text-text-muted min-w-[140px]">{symptom}:</span>
                      <span className="text-on-surface">
                        {data?.severity ?? '—'}
                        {data?.notes ? ` — ${data.notes}` : ''}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            )}
            {hasPainDetails && (
              <div className="mt-3 pt-3 border-t border-border-base">
                <Field label="Pain Score" value={note.painScore} />
                <Field label="Location" value={note.painLocation} />
                <Field label="Character" value={note.painCharacter} />
                <Field label="Current Management" value={note.currentPainManagement} />
                <Field label="Response to Treatment" value={note.responseToTreatment} />
                <Field label="Breakthrough Episodes" value={note.breakthroughPainEpisodes} />
                <Field label="Frequency" value={note.breakthroughPainFrequency} />
              </div>
            )}
          </>
        )}
      </Section>
    );
  };

  const renderMedications = (note: ProgressNote) => {
    const meds = note.medications ?? [];
    const hasMeds = meds.some(m => m?.medicationTreatment || m?.dose || m?.route);
    const hasReview = note.currentMedicationRegimenReviewed || note.changesMade ||
      note.prnBreakthroughMedicationUsed || note.medicationSideEffects;

    const isEmpty = !hasMeds && !hasReview;

    return (
      <Section title="12. Medication Review" isEmpty={isEmpty}>
        {!isEmpty && (
          <>
            {hasReview && (
              <>
                <Field label="Regimen Reviewed" value={note.currentMedicationRegimenReviewed} />
                <Field label="Changes Made" value={note.changesMade} />
              </>
            )}
            {hasMeds && (
              <div className="mt-3">
                <p className="text-text-muted text-xs mb-2">Current Medications:</p>
                <div className="space-y-2">
                  {meds.map((med, i) => (
                    med?.medicationTreatment || med?.dose ? (
                      <div key={i} className="bg-surface-low p-2 rounded text-xs">
                        <div><strong>{med.medicationTreatment || '—'}</strong></div>
                        <div>Dose: {med.dose || '—'} | Route: {med.route || '—'} | Frequency: {med.frequency || '—'}</div>
                        {med.reasonResponse && <div>Reason/Response: {med.reasonResponse}</div>}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
            {(note.prnBreakthroughMedicationUsed || note.prnEffectiveness) && (
              <div className="mt-3 pt-3 border-t border-border-base">
                <Field label="PRN Used" value={note.prnBreakthroughMedicationUsed} />
                <Field label="PRN Effectiveness" value={note.prnEffectiveness} />
              </div>
            )}
            {note.medicationSideEffects && (
              <div className="mt-2">
                <Field label="Side Effects" value={note.medicationSideEffects} />
                {note.medicationSideEffectsDetail && (
                  <Field label="Details" value={note.medicationSideEffectsDetail} />
                )}
              </div>
            )}
          </>
        )}
      </Section>
    );
  };

  const renderMDT = (note: ProgressNote) => {
    const mdt = note.multidisciplinaryTeamReview ?? [];
    const hasEntries = mdt.some(m => m?.reviewIntervention);
    const isEmpty = !hasEntries;

    return (
      <Section title="15. Multidisciplinary Team Review" isEmpty={isEmpty}>
        {!isEmpty && (
          <div className="space-y-2">
            {mdt.map((entry, i) => (
              entry?.reviewIntervention ? (
                <div key={i} className="bg-surface-low p-3 rounded">
                  <div className="font-medium text-xs text-primary mb-1">{entry.discipline}</div>
                  <div className="text-sm">{entry.reviewIntervention}</div>
                  {entry.followUpRequired && (
                    <div className="text-xs text-text-muted mt-1">
                      Follow-up required: {entry.followUpRequired}
                    </div>
                  )}
                </div>
              ) : null
            ))}
          </div>
        )}
      </Section>
    );
  };

  const renderAdditionalNotes = (note: ProgressNote) => {
    const notes = note.additionalProgressNotes ?? [];
    const isEmpty = notes.length === 0;

    return (
      <Section title="19. Additional Progress Notes" isEmpty={isEmpty}>
        {!isEmpty && (
          <div className="space-y-3">
            {notes.map((entry, i) => (
              <div key={i} className="border-l-2 border-primary pl-3">
                <div className="text-xs text-text-muted mb-1">
                  {entry.date} {entry.time} — {entry.clinicianName}
                </div>
                <div className="text-sm">{entry.note}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  };

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
        <div className="bg-surface-lowest rounded-2xl p-8">
          <PageLoader />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-surface-lowest rounded-2xl p-6 max-w-md">
          <ErrorState onRetry={refetch} />
          <Button onClick={onClose} variant="outline" className="w-full mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // ── Delete Confirmation Modal ──
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-error mb-4">
            <Trash2 size={24} />
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Delete Progress Note</h2>
          <p className="text-sm text-text-secondary mb-6">
            Are you sure you want to delete this progress note? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Modal ──
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-surface-lowest rounded-2xl border border-border-base shadow-xl max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base flex-shrink-0 print:hidden">
          <div>
            <h2 className="text-base font-semibold text-on-surface">Patient Progress Note</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-secondary">
                {formatDate(note.createdAt)}
              </span>
              {note.allSigned && <Badge variant="success">All Signed</Badge>}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Print-only header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-xl font-bold">Patient Progress Note</h1>
            <p className="text-sm text-gray-600">Date: {formatDate(note.createdAt)}</p>
          </div>

          {/* Section 0: Header Info */}
          <Section
            title="Note Information"
            isEmpty={!note.attendingClinician && !note.palliativeCareUnit && !note.dayOfAdmission}
          >
            <Field label="Attending Clinician" value={note.attendingClinician} />
            <Field label="Palliative Care Unit" value={note.palliativeCareUnit} />
            <Field label="Day of Admission" value={note.dayOfAdmission} />
          </Section>

          {/* Section 1: Current Clinical Status */}
          <Section
            title="1. Current Clinical Status"
            isEmpty={
              !note.generalCondition &&
              !note.levelOfConsciousness &&
              !note.orientation &&
              !note.functionalStatus &&
              !note.changesSincePreviousReview
            }
          >
            <Field label="General Condition" value={note.generalCondition} />
            <Field label="Level of Consciousness" value={note.levelOfConsciousness} />
            <Field label="Orientation" value={note.orientation} />
            <Field label="Functional Status" value={note.functionalStatus} />
            <Field label="Changes Since Previous Review" value={note.changesSincePreviousReview} />
          </Section>

          {/* Section 2: Vital Signs */}
          {renderVitals(note)}

          {/* Section 3: Symptom Assessment */}
          {renderSymptoms(note)}

          {/* Section 4: Respiratory */}
          <Section
            title="4. Respiratory Status"
            isEmpty={
              !note.breathing &&
              !note.oxygenTherapy &&
              !note.respiratorySecretions &&
              !note.cough &&
              !note.otherRespiratoryFindings
            }
          >
            <Field label="Breathing" value={note.breathing} />
            <Field label="Oxygen Therapy" value={note.oxygenTherapy} />
            <Field label="Oxygen Delivery" value={note.oxygenDelivery} />
            {note.oxygenDeliveryOther && <Field label="Other Delivery Method" value={note.oxygenDeliveryOther} />}
            <Field label="Respiratory Secretions" value={note.respiratorySecretions} />
            <Field label="Cough" value={note.cough} />
            <Field label="Other Findings" value={note.otherRespiratoryFindings} />
          </Section>

          {/* Section 5: Nutrition & Hydration */}
          <Section
            title="5. Nutrition & Hydration"
            isEmpty={
              !note.oralIntake &&
              !note.diet &&
              !note.fluidIntake &&
              !note.feedingAssistance &&
              !note.enteralFeeding &&
              !note.ivFluids &&
              !note.nauseaVomitingAffectingIntake &&
              !note.nutritionHydrationConcerns
            }
          >
            <Field label="Oral Intake" value={note.oralIntake} />
            <Field label="Diet" value={note.diet} />
            <Field label="Fluid Intake" value={note.fluidIntake} />
            <Field label="Feeding Assistance" value={note.feedingAssistance} />
            <Field label="Enteral Feeding" value={note.enteralFeeding} />
            <Field label="IV Fluids" value={note.ivFluids} />
            <Field label="Nausea/Vomiting Affecting Intake" value={note.nauseaVomitingAffectingIntake} />
            <Field label="Concerns" value={note.nutritionHydrationConcerns} />
          </Section>

          {/* Section 6: Elimination */}
          <Section
            title="6. Elimination"
            isEmpty={
              !note.urineOutput &&
              !note.urinaryCatheter &&
              !note.bowelMovement &&
              !note.lastBowelMovement &&
              !note.otherEliminationConcerns
            }
          >
            <Field label="Urine Output" value={note.urineOutput} />
            <Field label="Urinary Catheter" value={note.urinaryCatheter} />
            <Field label="Bowel Movement" value={note.bowelMovement} />
            <Field label="Last Bowel Movement" value={note.lastBowelMovement} />
            <Field label="Other Concerns" value={note.otherEliminationConcerns} />
          </Section>

          {/* Section 7: Skin & Wound */}
          <Section
            title="7. Skin & Wound Status"
            isEmpty={
              !note.skin &&
              !note.skinOther &&
              !note.pressureInjury &&
              !note.pressureInjuryLocationStage &&
              !note.woundCareProvided &&
              !note.woundPressureInjuryChanges
            }
          >
            <Field label="Skin" value={note.skin} />
            {note.skinOther && <Field label="Other" value={note.skinOther} />}
            <Field label="Pressure Injury" value={note.pressureInjury} />
            {note.pressureInjuryLocationStage && (
              <Field label="Location/Stage" value={note.pressureInjuryLocationStage} />
            )}
            <Field label="Wound Care Provided" value={note.woundCareProvided} />
            <Field label="Changes" value={note.woundPressureInjuryChanges} />
          </Section>

          {/* Section 8: Psychological/Emotional */}
          <Section
            title="8. Psychological / Emotional Status"
            isEmpty={
              (!note.moodBehavior || note.moodBehavior.length === 0) &&
              !note.psychologicalDistress &&
              !note.patientsMainConcernsToday &&
              !note.counselingPsychologicalSupportProvided
            }
          >
            {note.moodBehavior && note.moodBehavior.length > 0 && (
              <Field label="Mood/Behavior" value={note.moodBehavior.join(', ')} />
            )}
            <Field label="Psychological Distress" value={note.psychologicalDistress} />
            <Field label="Patient's Main Concerns" value={note.patientsMainConcernsToday} />
            <Field label="Support Provided" value={note.counselingPsychologicalSupportProvided} />
          </Section>

          {/* Section 9: Spiritual/Cultural */}
          <Section
            title="9. Spiritual / Cultural Needs"
            isEmpty={
              !note.spiritualDistressIdentified &&
              !note.patientsSpiritualCulturalConcerns &&
              !note.spiritualCareProvided &&
              !note.spiritualReferralRequired &&
              !note.spiritualNotes
            }
          >
            <Field label="Spiritual Distress Identified" value={note.spiritualDistressIdentified} />
            <Field label="Patient's Concerns" value={note.patientsSpiritualCulturalConcerns} />
            <Field label="Care Provided" value={note.spiritualCareProvided} />
            <Field label="Referral Required" value={note.spiritualReferralRequired} />
            {note.spiritualNotes && <Field label="Notes" value={note.spiritualNotes} />}
          </Section>

          {/* Section 10: Family/Caregiver */}
          <Section
            title="10. Family / Caregiver Update"
            isEmpty={
              !note.familyCaregiverPresent &&
              !note.familyCaregiverConcerns &&
              !note.familyEducationSupportProvided &&
              !note.familyMeetingHeld &&
              !note.familyMeetingParticipants
            }
          >
            <Field label="Family/Caregiver Present" value={note.familyCaregiverPresent} />
            <Field label="Concerns" value={note.familyCaregiverConcerns} />
            <Field label="Education/Support Provided" value={note.familyEducationSupportProvided} />
            <Field label="Meeting Held" value={note.familyMeetingHeld} />
            {note.familyMeetingParticipants && (
              <Field label="Participants" value={note.familyMeetingParticipants} />
            )}
          </Section>

          {/* Section 11: Goals of Care */}
          <Section
            title="11. Goals of Care"
            isEmpty={
              (!note.currentGoalsOfCare || note.currentGoalsOfCare.length === 0) &&
              !note.currentGoalsOfCareOther &&
              !note.goalsReviewedToday &&
              !note.changeInGoalsIdentified &&
              !note.patientDecisionMakerPreferences &&
              !note.codeStatus &&
              !note.advanceCarePlanReviewed
            }
          >
            {note.currentGoalsOfCare && note.currentGoalsOfCare.length > 0 && (
              <Field label="Current Goals" value={note.currentGoalsOfCare.join(', ')} />
            )}
            {note.currentGoalsOfCareOther && <Field label="Other Goals" value={note.currentGoalsOfCareOther} />}
            <Field label="Goals Reviewed Today" value={note.goalsReviewedToday} />
            <Field label="Changes Identified" value={note.changeInGoalsIdentified} />
            <Field label="Patient/Decision Maker Preferences" value={note.patientDecisionMakerPreferences} />
            <Field label="Code Status" value={note.codeStatus} />
            {note.codeStatusOther && <Field label="Other" value={note.codeStatusOther} />}
            <Field label="Advance Care Plan Reviewed" value={note.advanceCarePlanReviewed} />
          </Section>

          {/* Section 12: Medication Review */}
          {renderMedications(note)}

          {/* Section 13: Nursing/Supportive Care */}
          <Section
            title="13. Nursing / Supportive Care"
            isEmpty={
              (!note.nursingSupportiveCareProvided || note.nursingSupportiveCareProvided.length === 0) &&
              !note.nursingSupportiveCareOther &&
              !note.responseToSupportiveCare
            }
          >
            {note.nursingSupportiveCareProvided && note.nursingSupportiveCareProvided.length > 0 && (
              <Field label="Care Provided" value={note.nursingSupportiveCareProvided.join(', ')} />
            )}
            {note.nursingSupportiveCareOther && <Field label="Other" value={note.nursingSupportiveCareOther} />}
            <Field label="Response to Care" value={note.responseToSupportiveCare} />
          </Section>

          {/* Section 14: Investigations */}
          <Section
            title="14. Investigations"
            isEmpty={
              (!note.investigationsPerformedReviewed || note.investigationsPerformedReviewed.length === 0) &&
              !note.investigationsPerformedReviewedOther &&
              !note.significantResults &&
              !note.clinicalSignificanceActionTaken
            }
          >
            {note.investigationsPerformedReviewed && note.investigationsPerformedReviewed.length > 0 && (
              <Field label="Performed/Reviewed" value={note.investigationsPerformedReviewed.join(', ')} />
            )}
            {note.investigationsPerformedReviewedOther && (
              <Field label="Other" value={note.investigationsPerformedReviewedOther} />
            )}
            <Field label="Significant Results" value={note.significantResults} />
            <Field label="Clinical Significance / Action Taken" value={note.clinicalSignificanceActionTaken} />
          </Section>

          {/* Section 15: MDT Review */}
          {renderMDT(note)}

          {/* Section 16: Assessment */}
          <Section
            title="16. Clinical Assessment"
            isEmpty={
              !note.overallAssessment &&
              (!note.problemsIdentifiedToday || note.problemsIdentifiedToday.length === 0)
            }
          >
            <Field label="Overall Assessment" value={note.overallAssessment} />
            {note.problemsIdentifiedToday && note.problemsIdentifiedToday.length > 0 && (
              <Field label="Problems Identified" value={note.problemsIdentifiedToday.join(', ')} />
            )}
          </Section>

          {/* Section 17: Plan */}
          <Section
            title="17. Plan"
            isEmpty={
              !note.symptomManagementPlan &&
              !note.medicationPlan &&
              !note.nursingSupportiveCarePlan &&
              !note.investigationsMonitoring &&
              !note.familyCaregiverPlan &&
              !note.referralsConsultations &&
              !note.dischargeTransferHospicePlanning
            }
          >
            <Field label="Symptom Management" value={note.symptomManagementPlan} />
            <Field label="Medication Plan" value={note.medicationPlan} />
            <Field label="Nursing/Supportive Care" value={note.nursingSupportiveCarePlan} />
            <Field label="Investigations/Monitoring" value={note.investigationsMonitoring} />
            <Field label="Family/Caregiver" value={note.familyCaregiverPlan} />
            <Field label="Referrals/Consultations" value={note.referralsConsultations} />
            <Field label="Discharge/Transfer/Hospice Planning" value={note.dischargeTransferHospicePlanning} />
          </Section>

          {/* Section 18: SOAP Notes */}
          <Section
            title="18. SOAP Notes"
            isEmpty={
              !note.soapSubjective &&
              !note.soapObjective &&
              !note.soapAssessment &&
              !note.soapPlan
            }
          >
            <Field label="Subjective" value={note.soapSubjective} />
            <Field label="Objective" value={note.soapObjective} />
            <Field label="Assessment" value={note.soapAssessment} />
            <Field label="Plan" value={note.soapPlan} />
          </Section>

          {/* Section 19: Additional Progress Notes */}
          {renderAdditionalNotes(note)}

          {/* Section 20: Authorization/Signatures */}
          <Section
            title="20. Authorization / Signatures"
            isEmpty={!note.responsibleClinician && (!note.signatures || note.signatures.length === 0) && !note.facilityStamp}
          >
            {note.responsibleClinician && (
              <div className="mb-3">
                <Field label="Responsible Clinician" value={note.responsibleClinician.name} />
                <Field label="Role" value={note.responsibleClinician.role} />
              </div>
            )}
            {note.signatures && note.signatures.length > 0 && (
              <div className="mt-3">
                <p className="text-text-muted text-xs mb-2">Signatures:</p>
                {note.signatures.map((sig, i) => (
                  <div key={i} className="bg-surface-low p-2 rounded mb-2 text-xs">
                    <div><strong>{sig.name}</strong> ({sig.role})</div>
                    <div className="text-text-muted">{formatDate(sig.signedAt)}</div>
                  </div>
                ))}
              </div>
            )}
            {note.facilityStamp && <Field label="Facility Stamp" value={note.facilityStamp} />}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-border-base flex-shrink-0 print:hidden">
          <Button variant="outline" leftIcon={<Printer size={14} />} onClick={handlePrint}>
            Print
          </Button>
          {canEdit && onEdit && (
            <Button variant="outline" leftIcon={<Pencil size={14} />} onClick={() => onEdit(noteId)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            overflow: visible !important;
          }
          .fixed {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
};
