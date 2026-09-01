import { HomeVisit } from '@models/HomeVisit.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

export const recordVisit = async (patientId: string, data: any) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Validate team members exist
  const { teamLeaderId, physicianId, nurseId } = data;

  const [teamLeader, physician, nurse] = await Promise.all([
    Staff.findById(teamLeaderId),
    Staff.findById(physicianId),
    Staff.findById(nurseId),
  ]);

  if (!teamLeader) {
    throw new ApiError(400, 'Team leader not found');
  }
  if (!physician) {
    throw new ApiError(400, 'Physician not found');
  }
  if (!nurse) {
    throw new ApiError(400, 'Nurse not found');
  }

  // Format team members with IDs
  const teamMembers = data.teamMembers.map((member: any) => ({
    staffId: member.staffId,
    role: member.role,
    name: member.name,
  }));

  const visit = await HomeVisit.create({
    patientId,
    ...data,
    teamMembers,
  });

  return {
    id: visit._id.toString(),
    patientId: visit.patientId.toString(),
    visitDate: visit.visitDate,
    outcome: visit.outcome,
    createdAt: visit.createdAt,
  };
};

export const getVisits = async (patientId: string, page: number = 1, limit: number = 20) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    HomeVisit.find({ patientId })
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),
    HomeVisit.countDocuments({ patientId }),
  ]);

  return {
    items: items.map((visit) => ({
      id: visit._id.toString(),
      visitDate: visit.visitDate,
      visitType: visit.visitType,
      overallStatus: visit.overallStatus,
      outcome: visit.outcome,
      teamMembers: visit.teamMembers,
      createdAt: visit.createdAt,
    })),
    page,
    limit,
    total,
  };
};

export const getVisitById = async (patientId: string, visitId: string) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const visit = await HomeVisit.findOne({ _id: visitId, patientId });

  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  return {
    id: visit._id.toString(),
    patientId: visit.patientId.toString(),
    visitDate: visit.visitDate,
    timeStarted: visit.timeStarted,
    timeEnded: visit.timeEnded,
    visitType: visit.visitType,
    teamMembers: visit.teamMembers,
    overallStatus: visit.overallStatus,
    mobility: visit.mobility,
    vitals: visit.vitals,
    painScore: visit.painScore,
    painLocation: visit.painLocation,
    painCharacteristics: visit.painCharacteristics,
    painMedicationEffective: visit.painMedicationEffective,
    symptoms: visit.symptoms,
    adl: visit.adl,
    ppsScore: visit.ppsScore,
    kpsScore: visit.kpsScore,
    appetite: visit.appetite,
    oralIntake: visit.oralIntake,
    hydrationStatus: visit.hydrationStatus,
    emotionalStatus: visit.emotionalStatus,
    familySupport: visit.familySupport,
    financialDifficulty: visit.financialDifficulty,
    spiritualNeeds: visit.spiritualNeeds,
    religiousSupportRequested: visit.religiousSupportRequested,
    medicationAvailable: visit.medicationAvailable,
    medicationCorrectlyTaken: visit.medicationCorrectlyTaken,
    medicationSideEffects: visit.medicationSideEffects,
    medicationRefillNeeded: visit.medicationRefillNeeded,
    morphineAvailable: visit.morphineAvailable,
    adherenceLevel: visit.adherenceLevel,
    currentMedications: visit.currentMedications,
    caregiverBurden: visit.caregiverBurden,
    caregiverUnderstanding: visit.caregiverUnderstanding,
    caregivingCapacity: visit.caregivingCapacity,
    familyEmotionalStatus: visit.familyEmotionalStatus,
    educationProvided: visit.educationProvided,
    homeCondition: visit.homeCondition,
    homeObservations: visit.homeObservations,
    nursingCareGiven: visit.nursingCareGiven,
    redFlags: visit.redFlags,
    redFlagActions: visit.redFlagActions,
    referralsMade: visit.referralsMade,
    outcome: visit.outcome,
    nextVisitDate: visit.nextVisitDate,
    teamLeaderId: visit.teamLeaderId.toString(),
    physicianId: visit.physicianId.toString(),
    nurseId: visit.nurseId.toString(),
    createdAt: visit.createdAt,
  };
};

export default {
  recordVisit,
  getVisits,
  getVisitById,
};