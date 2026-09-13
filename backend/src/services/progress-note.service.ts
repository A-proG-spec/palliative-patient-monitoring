import bcrypt from 'bcrypt';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Helper: compute "Day X" from an admission date
// ─────────────────────────────────────────────────────────────
const computeDayOfAdmission = (
  admissionDate: Date,
  noteDate: string,
): string => {
  const start = new Date(admissionDate);
  const current = new Date(noteDate);
  const diffDays =
    Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
// Helper: is the note fully signed?
// Required: Physician + Nurse.
// ─────────────────────────────────────────────────────────────
const isAllSigned = (signatures: any[]): boolean => {
  const roles = new Set((signatures || []).map((s) => s.role));
  return roles.has('Physician') && roles.has('Nurse');
};

// ═════════════════════════════════════════════════════════════
// Create — auto-signs the responsible clinician
// ═════════════════════════════════════════════════════════════
export const createProgressNote = async (
  patientId: string,
  data: any,
  staffId: string,
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  let admissionId = data.admissionId;
  if (!admissionId) {
    const activeAdmission = await HospitalAdmission.findOne({
      patientId,
      status: 'Active',
    }).sort({ admissionDate: -1 });

    if (activeAdmission) admissionId = activeAdmission._id.toString();
  }

  const note = await PatientProgressNote.create({
    patientId,
    admissionId: admissionId || undefined,
    ...data,
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
  limit: number = 20,
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
        palliativeCareUnit: n.palliativeCareUnit,
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
  noteId: string,
) => {
  const note = await PatientProgressNote
    .findOne({ _id: noteId, patientId })
    .populate('createdBy', 'name role email')
    .populate('responsibleClinicianId', 'name role email')
    .populate('admissionId', 'admissionDate ward bedNumber primaryDiagnosis');

  if (!note) throw new ApiError(404, 'Progress note not found');

  const rc = note.responsibleClinicianId as any;
  const admission = note.admissionId as any;

  const dayOfAdmission =
    admission?.admissionDate && note.createdAt
      ? computeDayOfAdmission(
          admission.admissionDate,
          note.createdAt.toISOString(),
        )
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

    attendingClinician: note.attendingClinician,
    palliativeCareUnit: note.palliativeCareUnit,

    generalCondition: note.generalCondition,
    levelOfConsciousness: note.levelOfConsciousness,
    orientation: note.orientation,
    functionalStatus: note.functionalStatus,
    changesSincePreviousReview: note.changesSincePreviousReview,

    vitals: note.vitals,

    symptoms: note.symptoms,
    painScore: note.painScore,
    painLocation: note.painLocation,
    painCharacter: note.painCharacter,
    currentPainManagement: note.currentPainManagement,
    responseToTreatment: note.responseToTreatment,
    breakthroughPainEpisodes: note.breakthroughPainEpisodes,
    breakthroughPainFrequency: note.breakthroughPainFrequency,

    breathing: note.breathing,
    oxygenTherapy: note.oxygenTherapy,
    oxygenDelivery: note.oxygenDelivery,
    oxygenDeliveryOther: note.oxygenDeliveryOther,
    respiratorySecretions: note.respiratorySecretions,
    cough: note.cough,
    otherRespiratoryFindings: note.otherRespiratoryFindings,

    oralIntake: note.oralIntake,
    diet: note.diet,
    fluidIntake: note.fluidIntake,
    feedingAssistance: note.feedingAssistance,
    enteralFeeding: note.enteralFeeding,
    ivFluids: note.ivFluids,
    nauseaVomitingAffectingIntake: note.nauseaVomitingAffectingIntake,
    nutritionHydrationConcerns: note.nutritionHydrationConcerns,

    urineOutput: note.urineOutput,
    urinaryCatheter: note.urinaryCatheter,
    bowelMovement: note.bowelMovement,
    lastBowelMovement: note.lastBowelMovement,
    otherEliminationConcerns: note.otherEliminationConcerns,

    skin: note.skin,
    skinOther: note.skinOther,
    pressureInjury: note.pressureInjury,
    pressureInjuryLocationStage: note.pressureInjuryLocationStage,
    woundCareProvided: note.woundCareProvided,
    woundPressureInjuryChanges: note.woundPressureInjuryChanges,

    moodBehavior: note.moodBehavior,
    psychologicalDistress: note.psychologicalDistress,
    patientsMainConcernsToday: note.patientsMainConcernsToday,
    counselingPsychologicalSupportProvided:
      note.counselingPsychologicalSupportProvided,

    spiritualDistressIdentified: note.spiritualDistressIdentified,
    patientsSpiritualCulturalConcerns: note.patientsSpiritualCulturalConcerns,
    spiritualCareProvided: note.spiritualCareProvided,
    spiritualReferralRequired: note.spiritualReferralRequired,
    spiritualNotes: note.spiritualNotes,

    familyCaregiverPresent: note.familyCaregiverPresent,
    familyCaregiverConcerns: note.familyCaregiverConcerns,
    familyEducationSupportProvided: note.familyEducationSupportProvided,
    familyMeetingHeld: note.familyMeetingHeld,
    familyMeetingParticipants: note.familyMeetingParticipants,

    currentGoalsOfCare: note.currentGoalsOfCare,
    currentGoalsOfCareOther: note.currentGoalsOfCareOther,
    goalsReviewedToday: note.goalsReviewedToday,
    changeInGoalsIdentified: note.changeInGoalsIdentified,
    patientDecisionMakerPreferences: note.patientDecisionMakerPreferences,
    codeStatus: note.codeStatus,
    codeStatusOther: note.codeStatusOther,
    advanceCarePlanReviewed: note.advanceCarePlanReviewed,

    currentMedicationRegimenReviewed: note.currentMedicationRegimenReviewed,
    changesMade: note.changesMade,
    medications: note.medications,
    prnBreakthroughMedicationUsed: note.prnBreakthroughMedicationUsed,
    prnEffectiveness: note.prnEffectiveness,
    medicationSideEffects: note.medicationSideEffects,
    medicationSideEffectsDetail: note.medicationSideEffectsDetail,

    nursingSupportiveCareProvided: note.nursingSupportiveCareProvided,
    nursingSupportiveCareOther: note.nursingSupportiveCareOther,
    responseToSupportiveCare: note.responseToSupportiveCare,

    investigationsPerformedReviewed: note.investigationsPerformedReviewed,
    investigationsPerformedReviewedOther:
      note.investigationsPerformedReviewedOther,
    significantResults: note.significantResults,
    clinicalSignificanceActionTaken: note.clinicalSignificanceActionTaken,

    multidisciplinaryTeamReview: note.multidisciplinaryTeamReview,

    overallAssessment: note.overallAssessment,
    problemsIdentifiedToday: note.problemsIdentifiedToday,

    symptomManagementPlan: note.symptomManagementPlan,
    medicationPlan: note.medicationPlan,
    nursingSupportiveCarePlan: note.nursingSupportiveCarePlan,
    investigationsMonitoring: note.investigationsMonitoring,
    familyCaregiverPlan: note.familyCaregiverPlan,
    referralsConsultations: note.referralsConsultations,
    dischargeTransferHospicePlanning: note.dischargeTransferHospicePlanning,

    soapSubjective: note.soapSubjective,
    soapObjective: note.soapObjective,
    soapAssessment: note.soapAssessment,
    soapPlan: note.soapPlan,

    additionalProgressNotes: note.additionalProgressNotes,

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
// Sign — bcrypt-verified email + password
// ═════════════════════════════════════════════════════════════
export const signProgressNote = async (
  patientId: string,
  noteId: string,
  data: { email: string; password: string; role: 'Physician' | 'Nurse' | 'Reviewer' },
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  const email = data.email.toLowerCase().trim();
  const staff = await Staff.findOne({ email });
  if (!staff) throw new ApiError(401, 'Invalid credentials');

  if (staff.status !== 'Active') {
    throw new ApiError(403, 'Staff account is not active');
  }
  if (!staff.isEmailVerified) {
    throw new ApiError(403, 'Staff email is not verified');
  }

  const passwordOk = await bcrypt.compare(data.password, staff.password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');

  if (data.role !== 'Reviewer' && staff.role !== data.role) {
    throw new ApiError(403, `You are not registered as a ${data.role}`);
  }

  if (staff._id.toString() === note.responsibleClinicianId.toString()) {
    throw new ApiError(400, 'You are auto-signed as the responsible clinician');
  }

  const alreadySigned = note.signatures.some(
    (s) => s.staffId.toString() === staff._id.toString(),
  );
  if (alreadySigned) {
    throw new ApiError(400, 'You have already signed this note');
  }

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
// Get signature status
// ═════════════════════════════════════════════════════════════
export const getProgressNoteSignatures = async (
  patientId: string,
  noteId: string,
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
// Update — author only, records who made the change
// ═════════════════════════════════════════════════════════════
export const updateProgressNote = async (
  patientId: string,
  noteId: string,
  data: any,
  adminId: string,
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  if (note.createdBy.toString() !== adminId) {
    throw new ApiError(403, 'You can only edit progress notes you created');
  }

  delete data.signatures;
  delete data.responsibleClinicianId;
  delete data.createdBy;
  delete data.patientId;

  Object.assign(note, data);
  note.updatedBy = adminId as any;   // ← audit
  await note.save();

  return {
    id: note._id.toString(),
    updatedAt: note.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Soft delete (admin only)
// ═════════════════════════════════════════════════════════════
export const deleteProgressNote = async (
  patientId: string,
  noteId: string,
  adminId: string,
  reason?: string,
) => {
  const note = await PatientProgressNote.findOne({ _id: noteId, patientId });
  if (!note) throw new ApiError(404, 'Progress note not found');

  if (note.deletedAt) {
    throw new ApiError(400, 'Progress note is already deleted');
  }

  note.deletedAt = new Date();
  note.deletedBy = adminId as any;
  note.deletionReason = reason;
  note.updatedBy = adminId as any;
  await note.save();

  return { id: noteId, success: true, deletedAt: note.deletedAt };
};

// ═════════════════════════════════════════════════════════════
// Restore a soft-deleted note (admin only)
// ═════════════════════════════════════════════════════════════
export const restoreProgressNote = async (
  patientId: string,
  noteId: string,
  adminId: string,
) => {
  const note = await PatientProgressNote
    .findOne({ _id: noteId, patientId })
    .setOptions({ includeDeleted: true });

  if (!note) throw new ApiError(404, 'Progress note not found');
  if (!note.deletedAt) {
    throw new ApiError(400, 'Progress note is not deleted');
  }

  note.deletedAt = null;
  note.deletedBy = null as any;
  note.deletionReason = undefined;
  note.updatedBy = adminId as any;
  await note.save();

  return { id: noteId, restored: true };
};

// ═════════════════════════════════════════════════════════════
// Helper for admission.service & dashboards
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
  restoreProgressNote,
  countProgressNotesByAdmission,
};