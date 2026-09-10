import bcrypt from 'bcrypt';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Helper: compute "Day X" from an admission date
// ─────────────────────────────────────────────────────────────
const computeDayOfAdmission = (admissionDate: Date, noteDate: string): string => {
  const start = new Date(admissionDate);
  const current = new Date(noteDate);
  const diffDays = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  return `Day ${diffDays}`;
};

// ─────────────────────────────────────────────────────────────
// Helper: shape signatures for the response
// ─────────────────────────────────────────────────────────────
const formatSignatures = (signatures: any[]) =>
  (signatures || []).map((s) => ({
    staffId: s.staffId.toString(),
    name: s.name,
    role: s.role,
    signedAt: s.signedAt,
  }));

// ─────────────────────────────────────────────────────────────
// Helper: is the note fully signed by required roles?
// Required on a progress note: Physician + Nurse
// (Responsible clinician is auto-signed, so no need to check them.)
// ─────────────────────────────────────────────────────────────
const isAllSigned = (signatures: any[]): boolean => {
  const roles = new Set((signatures || []).map((s) => s.role));
  return roles.has('Physician') && roles.has('Nurse');
};

// ═════════════════════════════════════════════════════════════
// Create progress note — auto-signs the responsible clinician
// ═════════════════════════════════════════════════════════════
export const createProgressNote = async (
  patientId: string,
  data: any,
  staffId: string
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  // Auto-link to the patient's current active admission if not provided
  let admissionId = data.admissionId;
  if (!admissionId) {
    const activeAdmission = await HospitalAdmission
      .findOne({ patientId, status: 'Active' })
      .sort({ admissionDate: -1 });

    if (activeAdmission) admissionId = activeAdmission._id.toString();
  }

  const note = await PatientProgressNote.create({
    patientId,
    admissionId: admissionId || undefined,
    ...data,
    // The logged-in staff member is the responsible clinician —
    // auto-signed, same pattern as the team leader on a home visit.
    responsibleClinicianId: staff._id,
    signatures: [],
    createdBy: staffId,
  });

  return {
    id: note._id.toString(),
    patientId: note.patientId.toString(),
    admissionId: note.admissionId?.toString(),
    attendingClinician: note.attendingClinician,
    generalCondition: note.generalCondition,
    responsibleClinicianId: note.responsibleClinicianId.toString(),
    signatures: [],
    createdAt: note.createdAt,
  };
};

// ═════════════════════════════════════════════════════════════
// List progress notes for a patient
// ═════════════════════════════════════════════════════════════
export const getProgressNotes = async (
  patientId: string,
  filters: { admissionId?: string } = {},
  page: number = 1,
  limit: number = 20
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const query: any = { patientId };
  if (filters.admissionId) query.admissionId = filters.admissionId;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    PatientProgressNote.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name role')
      .populate('responsibleClinicianId', 'name role')
      .populate('admissionId', 'admissionDate ward bedNumber'),
    PatientProgressNote.countDocuments(query),
  ]);

  return {
    items: items.map((n) => {
      const rc = n.responsibleClinicianId as any;
      const admission = n.admissionId as any;

      return {
        id: n._id.toString(),
        admissionId: admission?._id?.toString() || n.admissionId?.toString(),
        ward: admission?.ward,
        bedNumber: admission?.bedNumber,

        attendingClinician: n.attendingClinician,
        generalCondition: n.generalCondition,
        levelOfConsciousness: n.levelOfConsciousness,
        overallAssessment: n.overallAssessment,
        soapSubjective: n.soapSubjective,

        responsibleClinician: rc
          ? {
              staffId: rc._id.toString(),
              name: rc.name,
              role: rc.role,
            }
          : null,

        signatures: formatSignatures(n.signatures),
        allSigned: isAllSigned(n.signatures),

        createdBy: n.createdBy
          ? {
              id: (n.createdBy as any)._id.toString(),
              name: (n.createdBy as any).name,
              role: (n.createdBy as any).role,
            }
          : null,

        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      };
    }),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// Get one progress note (full detail)
// ═════════════════════════════════════════════════════════════
export const getProgressNoteById = async (
  patientId: string,
  noteId: string
) => {
  const note = await PatientProgressNote
    .findOne({ _id: noteId, patientId })
    .populate('createdBy', 'name role email')
    .populate('responsibleClinicianId', 'name role email')
    .populate('admissionId', 'admissionDate ward bedNumber primaryDiagnosis');

  if (!note) throw new ApiError(404, 'Progress note not found');

  const rc = note.responsibleClinicianId as any;
  const admission = note.admissionId as any;

  // Compute "Day X" from the admission date
  const dayOfAdmission =
    admission?.admissionDate && note.createdAt
      ? computeDayOfAdmission(admission.admissionDate, note.createdAt.toISOString())
      : null;

  return {
    id: note._id.toString(),
    patientId: note.patientId.toString(),
    admissionId: admission?._id?.toString() || note.admissionId?.toString(),
    admission: admission
      ? {
          admissionDate: admission.admissionDate,
          ward: admission.ward,
          bedNumber: admission.bedNumber,
          primaryDiagnosis: admission.primaryDiagnosis,
        }
      : null,
    dayOfAdmission,

    // ── Header ──
    attendingClinician: note.attendingClinician,

    // ── 1. Current Clinical Status ──
    generalCondition: note.generalCondition,
    levelOfConsciousness: note.levelOfConsciousness,
    orientation: note.orientation,
    functionalStatus: note.functionalStatus,
    changesSincePreviousReview: note.changesSincePreviousReview,

    // ── 2. Vital Signs ──
    vitals: note.vitals,

    // ── 3. Symptom Assessment ──
    symptoms: note.symptoms,
    painScore: note.painScore,
    painLocation: note.painLocation,
    painCharacter: note.painCharacter,
    currentPainManagement: note.currentPainManagement,
    responseToTreatment: note.responseToTreatment,
    breakthroughPainEpisodes: note.breakthroughPainEpisodes,
    breakthroughPainFrequency: note.breakthroughPainFrequency,

    // ── 4. Respiratory ──
    breathing: note.breathing,
    oxygenTherapy: note.oxygenTherapy,
    oxygenDelivery: note.oxygenDelivery,
    oxygenDeliveryOther: note.oxygenDeliveryOther,
    respiratorySecretions: note.respiratorySecretions,
    cough: note.cough,
    otherRespiratoryFindings: note.otherRespiratoryFindings,

    // ── 5. Nutrition ──
    oralIntake: note.oralIntake,
    diet: note.diet,
    fluidIntake: note.fluidIntake,
    feedingAssistance: note.feedingAssistance,
    enteralFeeding: note.enteralFeeding,
    ivFluids: note.ivFluids,
    nauseaVomitingAffectingIntake: note.nauseaVomitingAffectingIntake,
    nutritionHydrationConcerns: note.nutritionHydrationConcerns,

    // ── 6. Elimination ──
    urineOutput: note.urineOutput,
    urinaryCatheter: note.urinaryCatheter,
    bowelMovement: note.bowelMovement,
    lastBowelMovement: note.lastBowelMovement,
    otherEliminationConcerns: note.otherEliminationConcerns,

    // ── 7. Skin ──
    skin: note.skin,
    skinOther: note.skinOther,
    pressureInjury: note.pressureInjury,
    pressureInjuryLocationStage: note.pressureInjuryLocationStage,
    woundCareProvided: note.woundCareProvided,
    woundPressureInjuryChanges: note.woundPressureInjuryChanges,

    // ── 8. Psychological ──
    moodBehavior: note.moodBehavior,
    psychologicalDistress: note.psychologicalDistress,
    patientsMainConcernsToday: note.patientsMainConcernsToday,
    counselingPsychologicalSupportProvided: note.counselingPsychologicalSupportProvided,

    // ── 9. Spiritual ──
    spiritualDistressIdentified: note.spiritualDistressIdentified,
    patientsSpiritualCulturalConcerns: note.patientsSpiritualCulturalConcerns,
    spiritualCareProvided: note.spiritualCareProvided,
    spiritualReferralRequired: note.spiritualReferralRequired,
    spiritualNotes: note.spiritualNotes,

    // ── 10. Family ──
    familyCaregiverPresent: note.familyCaregiverPresent,
    familyCaregiverConcerns: note.familyCaregiverConcerns,
    familyEducationSupportProvided: note.familyEducationSupportProvided,
    familyMeetingHeld: note.familyMeetingHeld,
    familyMeetingParticipants: note.familyMeetingParticipants,

    // ── 11. Goals of Care ──
    currentGoalsOfCare: note.currentGoalsOfCare,
    currentGoalsOfCareOther: note.currentGoalsOfCareOther,
    goalsReviewedToday: note.goalsReviewedToday,
    changeInGoalsIdentified: note.changeInGoalsIdentified,
    patientDecisionMakerPreferences: note.patientDecisionMakerPreferences,
    codeStatus: note.codeStatus,
    codeStatusOther: note.codeStatusOther,
    advanceCarePlanReviewed: note.advanceCarePlanReviewed,

    // ── 12. Medication Review ──
    currentMedicationRegimenReviewed: note.currentMedicationRegimenReviewed,
    changesMade: note.changesMade,
    medications: note.medications,
    prnBreakthroughMedicationUsed: note.prnBreakthroughMedicationUsed,
    prnEffectiveness: note.prnEffectiveness,
    medicationSideEffects: note.medicationSideEffects,
    medicationSideEffectsDetail: note.medicationSideEffectsDetail,

    // ── 13. Nursing ──
    nursingSupportiveCareProvided: note.nursingSupportiveCareProvided,
    nursingSupportiveCareOther: note.nursingSupportiveCareOther,
    responseToSupportiveCare: note.responseToSupportiveCare,

    // ── 14. Investigations ──
    investigationsPerformedReviewed: note.investigationsPerformedReviewed,
    investigationsPerformedReviewedOther: note.investigationsPerformedReviewedOther,
    significantResults: note.significantResults,
    clinicalSignificanceActionTaken: note.clinicalSignificanceActionTaken,

    // ── 15. MDT Review ──
    multidisciplinaryTeamReview: note.multidisciplinaryTeamReview,

    // ── 16. Assessment ──
    overallAssessment: note.overallAssessment,
    problemsIdentifiedToday: note.problemsIdentifiedToday,

    // ── 17. Plan ──
    symptomManagementPlan: note.symptomManagementPlan,
    medicationPlan: note.medicationPlan,
    nursingSupportiveCarePlan: note.nursingSupportiveCarePlan,
    investigationsMonitoring: note.investigationsMonitoring,
    familyCaregiverPlan: note.familyCaregiverPlan,
    referralsConsultations: note.referralsConsultations,
    dischargeTransferHospicePlanning: note.dischargeTransferHospicePlanning,

    // ── 18. SOAP ──
    soapSubjective: note.soapSubjective,
    soapObjective: note.soapObjective,
    soapAssessment: note.soapAssessment,
    soapPlan: note.soapPlan,

    // ── 19. Additional Notes ──
    additionalProgressNotes: note.additionalProgressNotes,

    // ── 20. Authorization + Signatures ──
    responsibleClinician: rc
      ? {
          staffId: rc._id.toString(),
          name: rc.name,
          role: rc.role,
          email: rc.email,
        }
      : null,
    signatures: formatSignatures(note.signatures),
    allSigned: isAllSigned(note.signatures),
    facilityStamp: note.facilityStamp,

    // ── Meta ──
    createdBy: note.createdBy
      ? {
          id: (note.createdBy as any)._id.toString(),
          name: (note.createdBy as any).name,
          role: (note.createdBy as any).role,
          email: (note.createdBy as any).email,
        }
      : null,

    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Sign progress note — bcrypt-verified email + password
// ═════════════════════════════════════════════════════════════
export const signProgressNote = async (
  patientId: string,
  noteId: string,
  data: { email: string; password: string; role: 'Physician' | 'Nurse' | 'Reviewer' }
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  // 1. Look up the staff by email
  const email = data.email.toLowerCase().trim();
  const staff = await Staff.findOne({ email });
  if (!staff) throw new ApiError(401, 'Invalid credentials');

  // 2. Account must be active and verified
  if (staff.status !== 'Active') {
    throw new ApiError(403, 'Staff account is not active');
  }
  if (!staff.isEmailVerified) {
    throw new ApiError(403, 'Staff email is not verified');
  }

  // 3. Verify password (bcrypt)
  const passwordOk = await bcrypt.compare(data.password, staff.password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');

  // 4. Role must match — except Reviewer, which any staff can claim
  if (data.role !== 'Reviewer' && staff.role !== data.role) {
    throw new ApiError(403, `You are not registered as a ${data.role}`);
  }

  // 5. Responsible clinician is auto-signed — no need to sign again
  if (staff._id.toString() === note.responsibleClinicianId.toString()) {
    throw new ApiError(400, 'You are auto-signed as the responsible clinician');
  }

  // 6. Prevent duplicate signatures
  const alreadySigned = note.signatures.some(
    (s) => s.staffId.toString() === staff._id.toString()
  );
  if (alreadySigned) {
    throw new ApiError(400, 'You have already signed this note');
  }

  // 7. Append the signature
  note.signatures.push({
    staffId: staff._id,
    name: staff.name,
    role: data.role,
    signedAt: new Date(),
  });
  await note.save();

  return {
    id: note._id.toString(),
    signedBy: {
      staffId: staff._id.toString(),
      name: staff.name,
      role: data.role,
      signedAt: note.signatures[note.signatures.length - 1].signedAt,
    },
    signatures: formatSignatures(note.signatures),
    allSigned: isAllSigned(note.signatures),
  };
};

// ═════════════════════════════════════════════════════════════
// Get current signature status for a progress note
// ═════════════════════════════════════════════════════════════
export const getProgressNoteSignatures = async (
  patientId: string,
  noteId: string
) => {
  const note = await PatientProgressNote
    .findOne({ _id: noteId, patientId })
    .populate('responsibleClinicianId', 'name role');

  if (!note) throw new ApiError(404, 'Progress note not found');

  const rc = note.responsibleClinicianId as any;

  return {
    noteId: note._id.toString(),
    createdAt: note.createdAt,
    responsibleClinician: rc
      ? {
          staffId: rc._id.toString(),
          name: rc.name,
          role: rc.role,
        }
      : null,
    signatures: formatSignatures(note.signatures),
    allSigned: isAllSigned(note.signatures),
    totalSignatures: note.signatures.length,
  };
};

// ═════════════════════════════════════════════════════════════
// Update progress note (author-only)
// ═════════════════════════════════════════════════════════════
export const updateProgressNote = async (
  patientId: string,
  noteId: string,
  data: any,
  staffId: string
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  if (note.createdBy.toString() !== staffId) {
    throw new ApiError(403, 'You can only edit progress notes you created');
  }

  // Don't allow overwriting the signatures or the responsible clinician
  delete data.signatures;
  delete data.responsibleClinicianId;
  delete data.createdBy;
  delete data.patientId;

  Object.assign(note, data);
  await note.save();

  return {
    id: note._id.toString(),
    updatedAt: note.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Delete progress note (admin-only — enforce at route level)
// ═════════════════════════════════════════════════════════════
export const deleteProgressNote = async (
  patientId: string,
  noteId: string
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  await note.deleteOne();
  return { id: noteId, success: true };
};

// ═════════════════════════════════════════════════════════════
// Helper for admission.service / dashboards
// ═════════════════════════════════════════════════════════════
export const countProgressNotesByAdmission = async (admissionId: string) => {
  return PatientProgressNote.countDocuments({ admissionId });
};

// ═════════════════════════════════════════════════════════════
// Exports
// ═════════════════════════════════════════════════════════════
export default {
  createProgressNote,
  getProgressNotes,
  getProgressNoteById,
  signProgressNote,
  getProgressNoteSignatures,
  updateProgressNote,
  deleteProgressNote,
  countProgressNotesByAdmission,
};