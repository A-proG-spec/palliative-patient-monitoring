import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { Staff } from '@models/Staff.js';
import { DischargeSummary } from '@models/DischargeSummary.js';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Record admission
// ─────────────────────────────────────────────────────────────
export const recordAdmission = async (patientId: string, data: any, staffId: string) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  // Optional referral linkage
  let referral = null;
  if (data.referralId) {
    referral = await Referral.findById(data.referralId);
    if (!referral) throw new ApiError(404, 'Referral not found');
    if (referral.status !== 'Accepted') {
      throw new ApiError(400, 'Referral must be accepted before admission');
    }
  }

  const admission = await HospitalAdmission.create({
    patientId,
    ...data,
    // Snapshot only the fields the hospital manages
    patientName: `${patient.firstName} ${patient.lastName}`,
    hospitalPatientId: data.hospitalPatientId || patient.patientDisplayId,
    createdBy: staffId,
    status: 'Active',
  });

  if (referral) {
    referral.status = 'Admitted';
    await referral.save();
  }

  patient.currentLocation = 'ReferredHospital';
  await patient.save();

  return {
    id: admission._id.toString(),
    patientId: admission.patientId.toString(),
    admissionDate: admission.admissionDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    status: admission.status,
    createdAt: admission.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Get admissions for a patient
// ─────────────────────────────────────────────────────────────
export const getAdmissions = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const query: any = { patientId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    HospitalAdmission.find(query)
      .sort({ admissionDate: -1 })
      .skip(skip)
      .limit(limit),
    HospitalAdmission.countDocuments(query),
  ]);

  return {
    items: items.map((a) => ({
      id: a._id.toString(),
      admissionDate: a.admissionDate,
      dischargeDate: a.dischargeDate,
      bedNumber: a.bedNumber,
      ward: a.ward,
      admittingPhysician: a.admittingPhysician,
      careTeam: a.careTeam,
      status: a.status,
      dischargeReason: a.dischargeReason,
      createdAt: a.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one admission (populated patient + progress note count + discharge)
// ─────────────────────────────────────────────────────────────
export const getAdmissionById = async (patientId: string, admissionId: string) => {
  const admission = await HospitalAdmission
    .findOne({ _id: admissionId, patientId })
    .populate('patientId', 'patientDisplayId firstName lastName age sex dateOfBirth address phone emergencyContactName emergencyContactPhone')
    .populate('createdBy', 'name role')
    .populate('referralId', 'referralType referralDate receivingFacility');

  if (!admission) throw new ApiError(404, 'Admission not found');

  const p = admission.patientId as any;

  // Aggregate related records
  const [progressNoteCount, dischargeSummary] = await Promise.all([
    PatientProgressNote.countDocuments({ admissionId: admission._id }),
    DischargeSummary.findOne({ admissionId: admission._id }).select('_id status dateOfDischarge'),
  ]);

  return {
    id: admission._id.toString(),

    // ── Patient (populated) ──
    patientId: p?._id?.toString(),
    patientName: admission.patientName || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim(),
    hospitalPatientId: admission.hospitalPatientId || p?.patientDisplayId,
    age: p?.age,
    sex: p?.sex,
    dateOfBirth: p?.dateOfBirth,
    address: p?.address,
    phone: p?.phone,

    // ── Emergency contact (admission-time override) ──
    emergencyContactName: admission.emergencyContactName || p?.emergencyContactName,
    emergencyContactRelationship: admission.emergencyContactRelationship,
    emergencyContactPhone: admission.emergencyContactPhone || p?.emergencyContactPhone,

    // ── Referral ──
    referralId: admission.referralId,
    referredFrom: admission.referredFrom,
    referredFromOther: admission.referredFromOther,
    referringClinician: admission.referringClinician,
    diagnosisAtReferral: admission.diagnosisAtReferral,
    referralReason: admission.referralReason,
    referralReasonOther: admission.referralReasonOther,

    // ── Admission ──
    admissionDate: admission.admissionDate,
    dischargeDate: admission.dischargeDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    admittingPhysician: admission.admittingPhysician,
    careTeam: admission.careTeam,

    // ── Clinical ──
    primaryDiagnosis: admission.primaryDiagnosis,
    secondaryDiagnoses: admission.secondaryDiagnoses,
    diseaseStage: admission.diseaseStage,
    comorbidities: admission.comorbidities,
    estimatedPrognosis: admission.estimatedPrognosis,
    ppsScore: admission.ppsScore,
    kpsScore: admission.kpsScore,
    functionalStatus: admission.functionalStatus,
    painScore: admission.painScore,
    painType: admission.painType,
    symptomsPresent: admission.symptomsPresent,
    symptomsPresentOther: admission.symptomsPresentOther,

    emotionalStatus: admission.emotionalStatus,
    familySupport: admission.familySupport,
    socialChallenges: admission.socialChallenges,

    spiritualConcerns: admission.spiritualConcerns,
    spiritualNeedsDescription: admission.spiritualNeedsDescription,
    spiritualSupportPreferred: admission.spiritualSupportPreferred,
    spiritualSupportPreferredOther: admission.spiritualSupportPreferredOther,

    painManagementPlan: admission.painManagementPlan,
    medicationPlan: admission.medicationPlan,
    nursingCarePlan: admission.nursingCarePlan,
    homeBasedCareRequired: admission.homeBasedCareRequired,
    psychosocialSupportPlan: admission.psychosocialSupportPlan,
    physiotherapyRequired: admission.physiotherapyRequired,

    admittedToHospiceUnit: admission.admittedToHospiceUnit,
    dischargeReason: admission.dischargeReason,
    status: admission.status,

    // ── Related records summary ──
    progressNoteCount,
    dischargeSummaryId: dischargeSummary?._id?.toString(),
    dischargeSummaryStatus: dischargeSummary?.status,

    createdBy: admission.createdBy
      ? {
          id: (admission.createdBy as any)._id?.toString(),
          name: (admission.createdBy as any).name,
          role: (admission.createdBy as any).role,
        }
      : null,

    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update admission (status change / discharge)
// ─────────────────────────────────────────────────────────────
export const updateAdmission = async (
  patientId: string,
  admissionId: string,
  data: any,
  staffId: string
) => {
  const admission = await HospitalAdmission.findOne({ _id: admissionId, patientId });
  if (!admission) throw new ApiError(404, 'Admission not found');

  if (!['Active', 'Discharged'].includes(data.status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  if (data.status === 'Discharged') {
    if (!data.dischargeDate || !data.dischargeReason) {
      throw new ApiError(400, 'Discharge date and reason required');
    }
    admission.dischargeDate = new Date(data.dischargeDate);
    admission.dischargeReason = data.dischargeReason;
  }

  admission.status = data.status;
  await admission.save();

  return {
    id: admission._id.toString(),
    status: admission.status,
    dischargeDate: admission.dischargeDate,
    dischargeReason: admission.dischargeReason,
    updatedAt: admission.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Helper: get current active admission for a patient
// ─────────────────────────────────────────────────────────────
export const getActiveAdmissionForPatient = async (patientId: string) => {
  return HospitalAdmission.findOne({ patientId, status: 'Active' }).sort({
    admissionDate: -1,
  });
};

export default {
  recordAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  getActiveAdmissionForPatient,
};