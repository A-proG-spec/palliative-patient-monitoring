import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// Create discharge summary — finalizes discharge workflow
// ─────────────────────────────────────────────────────────────
export const createDischargeSummary = async (
  patientId: string,
  data: any,
  staffId: string|number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const admissionId = data.admissionId
    ? toId(data.admissionId, 'admission id')
    : (await prisma.hospitalAdmission.findFirst({
        where: { patientId: pid, status: 'Active' },
        orderBy: { admissionDate: 'desc' },
        select: { id: true },
      }))?.id;

  if (admissionId) {
    const existing = await prisma.dischargeSummary.findFirst({
      where: { admissionId },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError(400, 'Discharge summary already exists for this admission');
    }
  }

  // Symptom fields arrive as { pain: 'Mild', painNote: '...', ... }
  const symptomFields = {
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
    fatigue: data.fatigue ?? null,
    fatigueNote: data.fatigueNote ?? null,
    anxiety: data.anxiety ?? null,
    anxietyNote: data.anxietyNote ?? null,
    delirium: data.delirium ?? null,
    deliriumNote: data.deliriumNote ?? null,
    appetiteLoss: data.appetiteLoss ?? null,
    appetiteLossNote: data.appetiteLossNote ?? null,
    other: data.other ?? null,
    otherNote: data.otherNote ?? null,
  };

  const summary = await prisma.$transaction(async (tx) => {
    const created = await tx.dischargeSummary.create({
      data: {
        patientId: pid,
        admissionId: admissionId ?? null,

        hospitalName: data.hospitalName ?? '',
        palliativeCareUnit: data.palliativeCareUnit ?? '',
        dateOfAdmission: data.dateOfAdmission ?? null,
        dateOfDischarge: data.dateOfDischarge,
        timeOfDischarge: data.timeOfDischarge ?? null,
        dischargeType: data.dischargeType ?? null,
        dischargeTypeOther: data.dischargeTypeOther ?? null,

        finalDischargeDiagnosis: data.finalDischargeDiagnosis ?? null,
        clinicalProblemsManaged: data.clinicalProblemsManaged ?? [],
        summaryOfClinicalCourse: data.summaryOfClinicalCourse ?? null,
        importantInvestigations: data.importantInvestigations ?? null,

        overallCondition: data.overallCondition ?? null,
        levelOfConsciousness: data.levelOfConsciousness ?? null,
        functionalStatus: data.functionalStatus ?? null,
        mobility: data.mobility ?? null,
        oralIntake: data.oralIntake ?? null,

        temperature: data.temperature ?? null,
        pulse: data.pulse ?? null,
        respiratoryRate: data.respiratoryRate ?? null,
        bloodPressure: data.bloodPressure ?? null,
        oxygenSaturation: data.oxygenSaturation ?? null,
        oxygenRequirement: data.oxygenRequirement ?? null,

        ...symptomFields,
        painScore: data.painScore ?? null,
        painControl: data.painControl ?? null,

        prnMedications: data.prnMedications ?? null,
        medicationChanges: data.medicationChanges ?? null,
        medicationReconciliationCompleted:
          data.medicationReconciliationCompleted ?? null,

        painManagementInstructions: data.painManagementInstructions ?? null,
        breathlessnessManagement: data.breathlessnessManagement ?? null,
        nauseaVomitingManagement: data.nauseaVomitingManagement ?? null,
        constipationManagement: data.constipationManagement ?? null,
        anxietyAgitationDeliriumManagement:
          data.anxietyAgitationDeliriumManagement ?? null,
        otherSymptomManagement: data.otherSymptomManagement ?? null,

        diet: data.diet ?? null,
        dietOther: data.dietOther ?? null,
        feedingAssistance: data.feedingAssistance ?? null,
        enteralFeeding: data.enteralFeeding ?? null,
        feedingTube: data.feedingTube ?? null,
        feedingTubeOther: data.feedingTubeOther ?? null,
        hydrationInstructions: data.hydrationInstructions ?? null,
        nutritionDietitianFollowUp: data.nutritionDietitianFollowUp ?? null,

        woundPresent: data.woundPresent ?? null,
        woundLocation: data.woundLocation ?? null,
        woundCareInstructions: data.woundCareInstructions ?? null,
        dressingChanges: data.dressingChanges ?? null,
        pressureInjuryPrevention: data.pressureInjuryPrevention ?? null,

        oxygenRequired: data.oxygenRequired ?? null,
        oxygenDeliveryMethod: data.oxygenDeliveryMethod ?? null,
        oxygenDeliveryMethodOther: data.oxygenDeliveryMethodOther ?? null,
        oxygenFlowRate: data.oxygenFlowRate ?? null,
        equipmentRequired: data.equipmentRequired ?? [],
        equipmentOther: data.equipmentOther ?? null,
        equipmentArranged: data.equipmentArranged ?? null,

        currentGoalsOfCare: data.currentGoalsOfCare ?? [],
        currentGoalsOfCareOther: data.currentGoalsOfCareOther ?? null,
        goalsOfCareReviewed: data.goalsOfCareReviewed ?? null,
        patientDecisionMakerPreferences:
          data.patientDecisionMakerPreferences ?? null,
        codeStatus: data.codeStatus ?? null,
        codeStatusOther: data.codeStatusOther ?? null,
        advanceCarePlan: data.advanceCarePlan ?? null,

        dischargedTo: data.dischargedTo ?? null,
        dischargedToOther: data.dischargedToOther ?? null,
        destinationAddress: data.destinationAddress ?? null,
        transport: data.transport ?? null,
        transportOther: data.transportOther ?? null,
        escortCaregiver: data.escortCaregiver ?? null,

        homePalliativeCareRequired: data.homePalliativeCareRequired ?? null,
        hospiceReferral: data.hospiceReferral ?? null,
        communityNursingRequired: data.communityNursingRequired ?? null,
        homeVisitsRequired: data.homeVisitsRequired ?? null,
        caregiverSupportRequired: data.caregiverSupportRequired ?? null,
        servicesArranged: data.servicesArranged ?? null,
        responsibleProvider: data.responsibleProvider ?? null,
        responsibleProviderPhone: data.responsibleProviderPhone ?? null,

        educationTopics: data.educationTopics ?? [],
        educationOther: data.educationOther ?? null,
        patientUnderstanding: data.patientUnderstanding ?? null,
        additionalEducationRequired: data.additionalEducationRequired ?? null,

        warningSigns: data.warningSigns ?? [],
        warningSignsOther: data.warningSignsOther ?? null,
        warningSignsSpecificInstructions:
          data.warningSignsSpecificInstructions ?? null,

        palliativeCareFollowUp: data.palliativeCareFollowUp ?? null,
        palliativeCareFollowUpDate: data.palliativeCareFollowUpDate ?? null,
        palliativeCareFollowUpTime: data.palliativeCareFollowUpTime ?? null,
        physicianSpecialistFollowUp: data.physicianSpecialistFollowUp ?? null,
        primaryCareFollowUp: data.primaryCareFollowUp ?? null,
        hospiceHomeCareFollowUp: data.hospiceHomeCareFollowUp ?? null,
        otherAppointments: data.otherAppointments ?? null,

        palliativeCareUnitContact: data.palliativeCareUnitContact ?? null,
        palliativeCareUnitPhone: data.palliativeCareUnitPhone ?? null,
        attendingClinician: data.attendingClinician ?? null,
        attendingClinicianPhone: data.attendingClinicianPhone ?? null,
        emergencyContactInfo: data.emergencyContactInfo ?? null,
        homeHospiceService: data.homeHospiceService ?? null,
        homeHospiceServicePhone: data.homeHospiceServicePhone ?? null,

        dischargeNotes: data.dischargeNotes ?? null,
        status: 'Final',

        createdBy: sid,

        // Discharge medications (child rows)
        ...(Array.isArray(data.dischargeMedications) &&
        data.dischargeMedications.length > 0
          ? {
              dischargeMedications: {
                create: data.dischargeMedications.map((m: any) => ({
                  medication: m.medication ?? '',
                  dose: m.dose ?? '',
                  route: m.route ?? '',
                  frequency: m.frequency ?? '',
                  purpose: m.purpose ?? '',
                  instructions: m.instructions ?? '',
                })),
              },
            }
          : {}),
      },
    });

    if (admissionId) {
      await tx.hospitalAdmission.update({
        where: { id: admissionId },
        data: {
          status: 'Discharged',
          dischargeDate: new Date(data.dateOfDischarge),
          dischargeReason: data.dischargeReason ?? 'Improved',
        },
      });
    }

    await tx.patient.update({
      where: { id: pid },
      data: { status: 'Discharged' },
    });

    await tx.notification.create({
      data: {
        type: 'CloseCase',
        message: `Patient discharged: ${patient.firstName} ${patient.lastName}`,
        data: {
          patientId: pid,
          patientName: `${patient.firstName} ${patient.lastName}`,
        },
        read: false,
      },
    });

    return created;
  });

  return {
    id: summary.id,
    patientId: summary.patientId,
    admissionId: summary.admissionId,
    dateOfDischarge: summary.dateOfDischarge,
    dischargeType: summary.dischargeType,
    status: summary.status,
    createdAt: summary.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Get discharge summary for a patient
// ─────────────────────────────────────────────────────────────
export const getDischargeSummaryByPatient = async (patientId: string) => {
  const pid = toId(patientId, 'patient id');

  const summary = await prisma.dischargeSummary.findFirst({
    where: { patientId: pid },
    orderBy: { createdAt: 'desc' },
    include: {
      createdByStaff: { select: { id: true, name: true, role: true } },
      admission: { select: { id: true, admissionDate: true, ward: true, bedNumber: true } },
      dischargeMedications: true,
    },
  });

  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  return formatSummary(summary);
};

// ─────────────────────────────────────────────────────────────
// Get by admission ID (returns null if not found)
// ─────────────────────────────────────────────────────────────
export const getDischargeSummaryByAdmission = async (admissionId: string) => {
  const aid = toId(admissionId, 'admission id');

  const summary = await prisma.dischargeSummary.findFirst({
    where: { admissionId: aid },
    include: {
      createdByStaff: { select: { id: true, name: true, role: true } },
      dischargeMedications: true,
    },
  });

  if (!summary) return null;
  return formatSummary(summary);
};

// ─────────────────────────────────────────────────────────────
// Update (only while Draft)
// ─────────────────────────────────────────────────────────────
export const updateDischargeSummary = async (
  patientId: string,
  summaryId: string,
  data: any,
  staffId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(summaryId, 'summary id');
  const uid = toId(staffId, 'staff id');

  const summary = await prisma.dischargeSummary.findFirst({
    where: { id: sid, patientId: pid },
  });
  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  if (summary.status === 'Final') {
    throw new ApiError(400, 'Cannot edit a finalized discharge summary');
  }

  const updated = await prisma.dischargeSummary.update({
    where: { id: sid },
  data: { ...data },
  });

  return formatSummary(updated);
};

// ─────────────────────────────────────────────────────────────
// Finalize (Draft → Final)
// ─────────────────────────────────────────────────────────────
export const finalizeDischargeSummary = async (
  patientId: string,
  summaryId: string,
  adminId: string|number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(summaryId, 'summary id');
  const aid = toId(adminId, 'admin id');

  const summary = await prisma.dischargeSummary.findFirst({
    where: { id: sid, patientId: pid },
  });
  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  if (summary.status === 'Final') {
    throw new ApiError(400, 'Discharge summary is already finalized');
  }

  const updated = await prisma.dischargeSummary.update({
    where: { id: sid },
    data: { status: 'Final', updatedBy: aid },
  });

  return { id: updated.id, status: updated.status };
};

// ─────────────────────────────────────────────────────────────
// Delete (admin-only, hard delete)
// ─────────────────────────────────────────────────────────────
export const deleteDischargeSummary = async (
  patientId: string,
  summaryId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(summaryId, 'summary id');

  const summary = await prisma.dischargeSummary.findFirst({
    where: { id: sid, patientId: pid },
  });
  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  await prisma.dischargeSummary.delete({ where: { id: sid } });

  return { id: summaryId, success: true };
};

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
const formatSummary = (summary: any) => ({
  ...summary,
  id: summary.id,
  patientId: summary.patientId,
  admissionId: summary.admissionId,
  createdBy: summary.createdByStaff
    ? {
        id: summary.createdByStaff.id,
        name: summary.createdByStaff.name,
        role: summary.createdByStaff.role,
      }
    : null,
  createdByStaff: undefined,
});

export default {
  createDischargeSummary,
  getDischargeSummaryByPatient,
  getDischargeSummaryByAdmission,
  updateDischargeSummary,
  finalizeDischargeSummary,
  deleteDischargeSummary,
};