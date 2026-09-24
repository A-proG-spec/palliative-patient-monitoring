import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const computeDayOfAdmission = (
  admissionDate: Date,
  noteDate: Date,
): string => {
  const diffDays =
    Math.floor(
      (noteDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return `Day ${diffDays}`;
};

const formatSignatures = (signatures: any[]) =>
  (signatures || []).map((s) => ({
    staffId: s.staffId,
    name: s.name,
    role: s.role,
    signedAt: s.signedAt,
  }));

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
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({ where: { id: pid }, select: { id: true } }),
    prisma.staff.findUnique({
      where: { id: sid },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  let admissionId: number | null = data.admissionId
    ? toId(data.admissionId, 'admission id')
    : null;

  if (!admissionId) {
    const active = await prisma.hospitalAdmission.findFirst({
      where: { patientId: pid, status: 'Active' },
      orderBy: { admissionDate: 'desc' },
      select: { id: true },
    });
    admissionId = active?.id ?? null;
  }

  const note = await prisma.patientProgressNote.create({
    data: {
      patientId: pid,
      admissionId,

      attendingClinician: data.attendingClinician,
      palliativeCareUnit: data.palliativeCareUnit ?? null,

      generalCondition: data.generalCondition ?? null,
      levelOfConsciousness: data.levelOfConsciousness ?? null,
      orientation: data.orientation ?? null,
      functionalStatus: data.functionalStatus ?? null,
      changesSincePreviousReview: data.changesSincePreviousReview ?? '',

      // Vitals (schema field names)
      temperature: data.temperature ?? null,
      pulse: data.pulse ?? null,
      respiratoryRate: data.respiratoryRate ?? null,
      bloodPressure: data.bloodPressure ?? null,
      oxygenFlow: data.oxygenFlow ?? null,
      spO2: data.spO2 ?? null,
      otherRelevantObservations: data.otherRelevantObservations ?? '',

      // Symptoms
      pain: data.pain ?? null,
      painNote: data.painNote ?? null,
      shortnessOfBreath: data.shortnessOfBreath ?? null,
      shortnessOfBreathNote: data.shortnessOfBreathNote ?? null,
      nausea: data.nausea ?? null,
      nauseaNote: data.nauseaNote ?? null,
      vomiting: data.vomiting ?? null,
      vomitingNote: data.vomitingNote ?? null,
      constipation: data.constipation ?? null,
      constipationNote: data.constipationNote ?? null,
      diarrhea: data.diarrhea ?? null,
      diarrheaNote: data.diarrheaNote ?? null,
      fatigue: data.fatigue ?? null,
      fatigueNote: data.fatigueNote ?? null,
      anxiety: data.anxiety ?? null,
      anxietyNote: data.anxietyNote ?? null,
      delirium: data.delirium ?? null,
      deliriumNote: data.deliriumNote ?? null,
      insomania: data.insomania ?? null,
      insomaniaNote: data.insomaniaNote ?? null,
      appetiteLoss: data.appetiteLoss ?? null,
      appetiteLossNote: data.appetiteLossNote ?? null,
      other: data.other ?? null,
      otherNote: data.otherNote ?? null,

      painScore: data.painScore ?? '',
      painLocation: data.painLocation ?? '',
      painCharacter: data.painCharacter ?? '',
      currentPainManagement: data.currentPainManagement ?? '',
      responseToTreatment: data.responseToTreatment ?? null,
      breakthroughPainEpisodes: data.breakthroughPainEpisodes ?? null,
      breakthroughPainFrequency: data.breakthroughPainFrequency ?? '',

      breathing: data.breathing ?? null,
      oxygenTherapy: data.oxygenTherapy ?? null,
      oxygenDelivery: data.oxygenDelivery ?? null,
      oxygenDeliveryOther: data.oxygenDeliveryOther ?? '',
      respiratorySecretions: data.respiratorySecretions ?? null,
      cough: data.cough ?? null,
      otherRespiratoryFindings: data.otherRespiratoryFindings ?? '',

      oralIntake: data.oralIntake ?? null,
      diet: data.diet ?? '',
      fluidIntake: data.fluidIntake ?? '',
      feedingAssistance: data.feedingAssistance ?? null,
      enteralFeeding: data.enteralFeeding ?? null,
      ivFluids: data.ivFluids ?? null,
      nauseaVomitingAffectingIntake: data.nauseaVomitingAffectingIntake ?? null,
      nutritionHydrationConcerns: data.nutritionHydrationConcerns ?? '',

      urineOutput: data.urineOutput ?? null,
      urinaryCatheter: data.urinaryCatheter ?? null,
      bowelMovement: data.bowelMovement ?? null,
      lastBowelMovement: data.lastBowelMovement ?? '',
      otherEliminationConcerns: data.otherEliminationConcerns ?? '',

      skin: data.skin ?? null,
      skinOther: data.skinOther ?? '',
      pressureInjury: data.pressureInjury ?? null,
      pressureInjuryLocationStage: data.pressureInjuryLocationStage ?? '',
      woundCareProvided: data.woundCareProvided ?? null,
      woundPressureInjuryChanges: data.woundPressureInjuryChanges ?? '',

      moodBehavior: data.moodBehavior ?? [],
      psychologicalDistress: data.psychologicalDistress ?? null,
      patientsMainConcernsToday: data.patientsMainConcernsToday ?? '',
      counselingPsychologicalSupportProvided:
        data.counselingPsychologicalSupportProvided ?? null,

      spiritualDistressIdentified: data.spiritualDistressIdentified ?? null,
      patientsSpiritualCulturalConcerns:
        data.patientsSpiritualCulturalConcerns ?? '',
      spiritualCareProvided: data.spiritualCareProvided ?? null,
      spiritualReferralRequired: data.spiritualReferralRequired ?? null,
      spiritualNotes: data.spiritualNotes ?? '',

      familyCaregiverPresent: data.familyCaregiverPresent ?? null,
      familyCaregiverConcerns: data.familyCaregiverConcerns ?? '',
      familyEducationSupportProvided:
        data.familyEducationSupportProvided ?? '',
      familyMeetingHeld: data.familyMeetingHeld ?? null,
      familyMeetingParticipants: data.familyMeetingParticipants ?? '',

      currentGoalsOfCare: data.currentGoalsOfCare ?? [],
      currentGoalsOfCareOther: data.currentGoalsOfCareOther ?? '',
      goalsReviewedToday: data.goalsReviewedToday ?? null,
      changeInGoalsIdentified: data.changeInGoalsIdentified ?? null,
      patientDecisionMakerPreferences:
        data.patientDecisionMakerPreferences ?? '',
      codeStatus: data.codeStatus ?? null,
      codeStatusOther: data.codeStatusOther ?? '',
      advanceCarePlanReviewed: data.advanceCarePlanReviewed ?? null,

      currentMedicationRegimenReviewed:
        data.currentMedicationRegimenReviewed ?? null,
      changesMade: data.changesMade ?? null,
      prnBreakthroughMedicationUsed: data.prnBreakthroughMedicationUsed ?? null,
      prnEffectiveness: data.prnEffectiveness ?? null,
      medicationSideEffects: data.medicationSideEffects ?? 'None',
      medicationSideEffectsDetail: data.medicationSideEffectsDetail ?? '',

      nursingSupportiveCareProvided: data.nursingSupportiveCareProvided ?? [],
      nursingSupportiveCareOther: data.nursingSupportiveCareOther ?? '',
      responseToSupportiveCare: data.responseToSupportiveCare ?? '',

      investigationsPerformedReviewed:
        data.investigationsPerformedReviewed ?? [],
      investigationsPerformedReviewedOther:
        data.investigationsPerformedReviewedOther ?? '',
      significantResults: data.significantResults ?? '',
      clinicalSignificanceActionTaken:
        data.clinicalSignificanceActionTaken ?? '',

      overallAssessment: data.overallAssessment ?? '',
      problemsIdentifiedToday: data.problemsIdentifiedToday ?? [],

      symptomManagementPlan: data.symptomManagementPlan ?? '',
      medicationPlan: data.medicationPlan ?? '',
      nursingSupportiveCarePlan: data.nursingSupportiveCarePlan ?? '',
      investigationsMonitoring: data.investigationsMonitoring ?? '',
      familyCaregiverPlan: data.familyCaregiverPlan ?? '',
      referralsConsultations: data.referralsConsultations ?? '',
      dischargeTransferHospicePlanning:
        data.dischargeTransferHospicePlanning ?? '',

      soapSubjective: data.soapSubjective ?? '',
      soapObjective: data.soapObjective ?? '',
      soapAssessment: data.soapAssessment ?? '',
      soapPlan: data.soapPlan ?? '',

      responsibleClinicianId: sid,
      facilityStamp: data.facilityStamp ?? '',

      createdBy: sid,

      // Children
      ...(Array.isArray(data.medications) && data.medications.length > 0
        ? {
          medications: {
            create: data.medications.map((m: any) => ({
              medicationTreatment: m.medicationTreatment ?? '',
              dose: m.dose ?? '',
              route: m.route ?? '',
              frequency: m.frequency ?? '',
              reasonResponse: m.reasonResponse ?? '',
            })),
          },
        }
        : {}),
      ...(Array.isArray(data.multidisciplinaryTeamReview) &&
        data.multidisciplinaryTeamReview.length > 0
        ? {
          multidisciplinaryTeamReview: {
            create: data.multidisciplinaryTeamReview.map((m: any) => ({
              discipline: m.discipline ?? '',
              reviewIntervention: m.reviewIntervention ?? '',
              followUpRequired: m.followUpRequired ?? null,
            })),
          },
        }
        : {}),
      ...(Array.isArray(data.additionalProgressNotes) &&
        data.additionalProgressNotes.length > 0
        ? {
          additionalProgressNotes: {
            create: data.additionalProgressNotes.map((n: any) => ({
              date: n.date ?? '',
              time: n.time ?? '',
              note: n.note ?? '',
              clinicianName: n.clinicianName ?? '',
            })),
          },
        }
        : {}),
    },
  });

  return {
    id: note.id,
    patientId: note.patientId,
    admissionId: note.admissionId,
    attendingClinician: note.attendingClinician,
    generalCondition: note.generalCondition,
    responsibleClinicianId: note.responsibleClinicianId,
    signatures: [],
    createdAt: note.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// GET ALL progress notes for a patient
// ─────────────────────────────────────────────────────────────
export const getAllProgressNotes = async (
  patientId: string,
  filters: { admissionId?: string; includeDeleted?: boolean } = {},
  page: number = 1,
  limit: number = 20,
) => {
  const pid = toId(patientId, 'patient id');
  const client = filters.includeDeleted ? prismaBase : prisma;

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (filters.admissionId) {
    where.admissionId = toId(filters.admissionId, 'admission id');
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    client.patientProgressNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true, role: true } },
        responsibleClinician: { select: { id: true, name: true, role: true } },
        admission: {
          select: { id: true, admissionDate: true, ward: true, bedNumber: true },
        },
        signatures: true,
      },
    }),
    client.patientProgressNote.count({ where }),
  ]);

  return {
    items: items.map((n) => ({
      id: n.id,
      admissionId: n.admissionId,
      ward: n.admission?.ward,
      bedNumber: n.admission?.bedNumber,
      attendingClinician: n.attendingClinician,
      palliativeCareUnit: n.palliativeCareUnit,
      generalCondition: n.generalCondition,
      levelOfConsciousness: n.levelOfConsciousness,
      overallAssessment: n.overallAssessment,
      soapSubjective: n.soapSubjective,
      responsibleClinician: {
        staffId: n.responsibleClinician.id,
        name: n.responsibleClinician.name,
        role: n.responsibleClinician.role,
      },
      signatures: formatSignatures(n.signatures),
      allSigned: isAllSigned(n.signatures),
      createdBy: {
        id: n.createdByStaff.id,
        name: n.createdByStaff.name,
        role: n.createdByStaff.role,
      },
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      deletedAt: n.deletedAt ?? null,
      deletionReason: n.deletionReason ?? null,
    })),
    page,
    limit,
    total,
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
  const pid = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (filters.admissionId) {
    where.admissionId = toId(filters.admissionId, 'admission id');
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.patientProgressNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true, role: true } },
        responsibleClinician: { select: { id: true, name: true, role: true } },
        admission: { select: { id: true, admissionDate: true, ward: true, bedNumber: true } },
        signatures: true,
      },
    }),
    prisma.patientProgressNote.count({ where }),
  ]);

  return {
    items: items.map((n) => ({
      id: n.id,
      admissionId: n.admissionId,
      ward: n.admission?.ward,
      bedNumber: n.admission?.bedNumber,

      attendingClinician: n.attendingClinician,
      palliativeCareUnit: n.palliativeCareUnit,
      generalCondition: n.generalCondition,
      levelOfConsciousness: n.levelOfConsciousness,
      overallAssessment: n.overallAssessment,
      soapSubjective: n.soapSubjective,

      responsibleClinician: {
        staffId: n.responsibleClinician.id,
        name: n.responsibleClinician.name,
        role: n.responsibleClinician.role,
      },

      signatures: formatSignatures(n.signatures),
      allSigned: isAllSigned(n.signatures),

      createdBy: {
        id: n.createdByStaff.id,
        name: n.createdByStaff.name,
        role: n.createdByStaff.role,
      },

      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// Get one progress note (full)
// ═════════════════════════════════════════════════════════════
export const getProgressNoteById = async (
  patientId: string,
  noteId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
    include: {
      createdByStaff: { select: { id: true, name: true, role: true, email: true } },
      responsibleClinician: { select: { id: true, name: true, role: true, email: true } },
      admission: {
        select: {
          id: true, admissionDate: true, ward: true, bedNumber: true,
          primaryDiagnosis: true,
        },
      },
      signatures: true,
      medications: true,
      multidisciplinaryTeamReview: true,
      additionalProgressNotes: true,
    },
  });

  if (!note) throw new ApiError(404, 'Progress note not found');

  const dayOfAdmission =
    note.admission?.admissionDate && note.createdAt
      ? computeDayOfAdmission(note.admission.admissionDate, note.createdAt)
      : null;

  return {
    ...note,
    dayOfAdmission,
    responsibleClinician: {
      staffId: note.responsibleClinician.id,
      name: note.responsibleClinician.name,
      role: note.responsibleClinician.role,
      email: note.responsibleClinician.email,
    },
    createdBy: {
      id: note.createdByStaff.id,
      name: note.createdByStaff.name,
      role: note.createdByStaff.role,
      email: note.createdByStaff.email,
    },
    createdByStaff: undefined,
    signatures: formatSignatures(note.signatures),
    allSigned: isAllSigned(note.signatures),
  };
};

// ═════════════════════════════════════════════════════════════
// Sign (bcrypt-verified)
// ═════════════════════════════════════════════════════════════
export const signProgressNote = async (
  patientId: string,
  noteId: string,
  data: { email: string; password: string; role: 'Physician' | 'Nurse' },
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
    include: { signatures: true },
  });
  if (!note) throw new ApiError(404, 'Progress note not found');

  const email = data.email.toLowerCase().trim();
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) throw new ApiError(401, 'Invalid credentials');

  if (staff.status !== 'Active') {
    throw new ApiError(403, 'Staff account is not active');
  }
  if (!staff.isEmailVerified) {
    throw new ApiError(403, 'Staff email is not verified');
  }

  const passwordOk = await bcrypt.compare(data.password, staff.password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');


  if (staff.id === note.responsibleClinicianId) {
    throw new ApiError(400, 'You are auto-signed as the responsible clinician');
  }

  const alreadySigned = note.signatures.some((s) => s.staffId === staff.id);
  if (alreadySigned) {
    throw new ApiError(400, 'You have already signed this note');
  }

  await prisma.progressNoteSignature.create({
    data: {
      progressNoteId: nid,
      staffId: staff.id,
      name: staff.name,
      role: data.role,
      signedAt: new Date(),
    },
  });

  const refreshed = await prisma.progressNoteSignature.findMany({
    where: { progressNoteId: nid },
    orderBy: { signedAt: 'asc' },
  });

  return {
    id: nid,
    signedBy: {
      staffId: staff.id,
      name: staff.name,
      role: data.role,
      signedAt: refreshed[refreshed.length - 1].signedAt,
    },
    signatures: formatSignatures(refreshed),
    allSigned: isAllSigned(refreshed),
  };
};

// ═════════════════════════════════════════════════════════════
// Signature status
// ═════════════════════════════════════════════════════════════
export const getProgressNoteSignatures = async (
  patientId: string,
  noteId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
    include: {
      responsibleClinician: { select: { id: true, name: true, role: true } },
      signatures: true,
    },
  });
  if (!note) throw new ApiError(404, 'Progress note not found');

  return {
    noteId: note.id,
    createdAt: note.createdAt,
    responsibleClinician: {
      staffId: note.responsibleClinician.id,
      name: note.responsibleClinician.name,
      role: note.responsibleClinician.role,
    },
    signatures: formatSignatures(note.signatures),
    allSigned: isAllSigned(note.signatures),
    totalSignatures: note.signatures.length,
  };
};

// ═════════════════════════════════════════════════════════════
// Update (author only)
// ═════════════════════════════════════════════════════════════
export const updateProgressNote = async (
  patientId: string,
  noteId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');
  const aid = toId(adminId, 'admin id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
  });
  if (!note) throw new ApiError(404, 'Progress note not found');

  if (note.createdBy !== aid) {
    throw new ApiError(403, 'You can only edit progress notes you created');
  }

  // Strip fields that cannot be updated via this endpoint
  const blocked = ['signatures', 'responsibleClinicianId', 'createdBy', 'patientId', 'id'];
  const cleanData = { ...data };
  for (const key of blocked) delete cleanData[key];

  if (cleanData.temperature !== undefined) {
    cleanData.temprature = cleanData.temperature;
    delete cleanData.temperature;
  }

  const updated = await prisma.patientProgressNote.update({
    where: { id: nid },
    data: { ...cleanData, updatedBy: aid },
  });

  return { id: updated.id, updatedAt: updated.updatedAt };
};

// ═════════════════════════════════════════════════════════════
// Soft delete
// ═════════════════════════════════════════════════════════════
export const deleteProgressNote = async (
  patientId: string,
  noteId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');
  const aid = toId(adminId, 'admin id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
  });
  if (!note) throw new ApiError(404, 'Progress note not found');
  if (note.deletedAt) throw new ApiError(400, 'Progress note is already deleted');

  const updated = await prisma.patientProgressNote.update({
    where: { id: nid },
    data: {
      deletedAt: new Date(),
      deletedBy: aid,
      deletionReason: reason ?? null,
      updatedBy: aid,
    },
  });

  return { id: noteId, success: true, deletedAt: updated.deletedAt };
};

// ═════════════════════════════════════════════════════════════
// Restore
// ═════════════════════════════════════════════════════════════
export const restoreProgressNote = async (
  patientId: string,
  noteId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const nid = toId(noteId, 'note id');
  const aid = toId(adminId, 'admin id');

  const note = await prisma.patientProgressNote.findFirst({
    where: { id: nid, patientId: pid },
  });
  if (!note) throw new ApiError(404, 'Progress note not found');
  if (!note.deletedAt) throw new ApiError(400, 'Progress note is not deleted');

  await prisma.patientProgressNote.update({
    where: { id: nid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: aid,
    },
  });

  return { id: noteId, restored: true };
};

// ═════════════════════════════════════════════════════════════
// Counter helper
// ═════════════════════════════════════════════════════════════
export const countProgressNotesByAdmission = async (admissionId: string) => {
  const aid = toId(admissionId, 'admission id');
  return prisma.patientProgressNote.count({ where: { admissionId: aid } });
};

export default {
  getAllProgressNotes,
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