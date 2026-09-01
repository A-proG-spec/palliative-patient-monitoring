import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

export const recordAdmission = async (patientId: string, data: any, staffId: string) => {
  const [patient, referral, staff] = await Promise.all([
    Patient.findById(patientId),
    Referral.findById(data.referralId),
    Staff.findById(staffId),
  ]);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (!referral) {
    throw new ApiError(404, 'Referral not found');
  }

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  if (referral.status !== 'Accepted') {
    throw new ApiError(400, 'Referral must be accepted before admission');
  }

  const admission = await HospitalAdmission.create({
    patientId,
    ...data,
    createdBy: staffId,
    status: 'Active',
  });

  // Update referral status
  referral.status = 'Admitted';
  await referral.save();

  // Update patient location
  patient.currentLocation = 'ReferredHospital';
  await patient.save();

  return {
    id: admission._id.toString(),
    patientId: admission.patientId.toString(),
    referralId: admission.referralId.toString(),
    admissionDate: admission.admissionDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    status: admission.status,
    createdBy: {
      id: staff._id.toString(),
      name: staff.name,
    },
    createdAt: admission.createdAt,
  };
};

export const getAdmissions = async (patientId: string, status?: string, page: number = 1, limit: number = 20) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const filter: any = { patientId };
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    HospitalAdmission.find(filter)
      .sort({ admissionDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name'),
    HospitalAdmission.countDocuments(filter),
  ]);

  return {
    items: items.map((a) => ({
      id: a._id.toString(),
      admissionDate: a.admissionDate,
      dischargeDate: a.dischargeDate,
      bedNumber: a.bedNumber,
      ward: a.ward,
      admittingPhysician: a.admittingPhysician,
      status: a.status,
      createdBy: {
        id: (a.createdBy as any)?._id?.toString() || '',
        name: (a.createdBy as any)?.name || 'Unknown',
      },
      createdAt: a.createdAt,
    })),
    page,
    limit,
    total,
  };
};

export const getAdmissionById = async (patientId: string, admissionId: string) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const admission = await HospitalAdmission.findOne({ _id: admissionId, patientId })
    .populate('createdBy', 'name');

  if (!admission) {
    throw new ApiError(404, 'Admission not found');
  }

  return {
    id: admission._id.toString(),
    patientId: admission.patientId.toString(),
    referralId: admission.referralId.toString(),
    admissionDate: admission.admissionDate,
    dischargeDate: admission.dischargeDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    admittingPhysician: admission.admittingPhysician,
    careTeam: admission.careTeam,
    primaryDiagnosis: admission.primaryDiagnosis,
    secondaryDiagnoses: admission.secondaryDiagnoses,
    diseaseStage: admission.diseaseStage,
    comorbidities: admission.comorbidities,
    estimatedPrognosis: admission.estimatedPrognosis,
    ppsScore: admission.ppsScore,
    functionalStatus: admission.functionalStatus,
    painScore: admission.painScore,
    painType: admission.painType,
    symptomsPresent: admission.symptomsPresent,
    emotionalStatus: admission.emotionalStatus,
    familySupport: admission.familySupport,
    socialChallenges: admission.socialChallenges,
    spiritualConcerns: admission.spiritualConcerns,
    spiritualSupportPreferred: admission.spiritualSupportPreferred,
    painManagementPlan: admission.painManagementPlan,
    medicationPlan: admission.medicationPlan,
    nursingCarePlan: admission.nursingCarePlan,
    homeBasedCareRequired: admission.homeBasedCareRequired,
    psychosocialSupportPlan: admission.psychosocialSupportPlan,
    physiotherapyRequired: admission.physiotherapyRequired,
    dischargeReason: admission.dischargeReason,
    status: admission.status,
    createdBy: {
      id: (admission.createdBy as any)?._id?.toString() || '',
      name: (admission.createdBy as any)?.name || 'Unknown',
    },
    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
  };
};

export const updateAdmission = async (patientId: string, admissionId: string, data: any, staffId: string) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const admission = await HospitalAdmission.findOne({ _id: admissionId, patientId });

  if (!admission) {
    throw new ApiError(404, 'Admission not found');
  }

  if (!['Active', 'Discharged'].includes(data.status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  if (data.status === 'Discharged') {
    if (!data.dischargeDate || !data.dischargeReason) {
      throw new ApiError(400, 'Discharge date and reason required for discharge');
    }
    admission.dischargeDate = new Date(data.dischargeDate);
    admission.dischargeReason = data.dischargeReason;
  }

  admission.status = data.status;
  await admission.save();

  return {
    id: admission._id.toString(),
    patientId: admission.patientId.toString(),
    admissionDate: admission.admissionDate,
    dischargeDate: admission.dischargeDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    dischargeReason: admission.dischargeReason,
    status: admission.status,
    updatedAt: admission.updatedAt,
  };
};

export default {
  recordAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
};