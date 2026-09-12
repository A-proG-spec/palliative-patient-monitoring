import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { Counter } from '@models/Counter.js';
import { HomeVisit } from '@models/HomeVisit.js';
import { Medication } from '@models/Medication.js';
import { LaboratoryTest } from '@models/LaboratoryTest.js';
import { Referral } from '@models/Referral.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { ImagingOrder } from '@models/ImagingOrder.js';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { DischargeSummary } from '@models/DischargeSummary.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const generatePatientDisplayId = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'patientId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );

  const number = counter.value;
  return `PAT-${String(number).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────────────────────
// Register patient
// ─────────────────────────────────────────────────────────────
export const registerPatient = async (data: any, staffId: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const patientDisplayId = await generatePatientDisplayId();

  const patient = await Patient.create({
    ...data,
    patientDisplayId,
    registeredBy: staffId,
    status: 'Active',
    currentLocation: 'Home',
  });

  const { __v, ...patientObject } = patient.toObject();
  return {
    ...patientObject,
    id: patientObject._id.toString(),
  };
};

// ─────────────────────────────────────────────────────────────
// List patients
// ─────────────────────────────────────────────────────────────
export const getPatients = async (
  _staffId: string,
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string,
) => {
  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { patientDisplayId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Patient.find(filter).skip(skip).limit(limit),
    Patient.countDocuments(filter),
  ]);

  return {
    items: items.map((patient) => ({
      id: patient._id.toString(),
      patientDisplayId: patient.patientDisplayId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      sex: patient.sex,
      status: patient.status,
      currentLocation: patient.currentLocation,
      primaryDiagnosis: patient.primaryDiagnosis,
      registeredAt: patient.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one patient
// ─────────────────────────────────────────────────────────────
export const getPatientById = async (patientId: string) => {
  const patient = await Patient
    .findById(patientId)
    .populate('registeredBy', 'name');

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return {
    id: patient._id.toString(),
    patientDisplayId: patient.patientDisplayId,
    hospitalPatientId: patient.hospitalPatientId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    age: patient.age,
    sex: patient.sex,
    dateOfBirth: patient.dateOfBirth,
    address: patient.address,
    phone: patient.phone,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    caregiverName: patient.caregiverName,
    caregiverPhone: patient.caregiverPhone,
    primaryDiagnosis: patient.primaryDiagnosis,
    secondaryDiagnoses: patient.secondaryDiagnoses,
    diseaseStage: patient.diseaseStage,
    comorbidities: patient.comorbidities,
    estimatedPrognosis: patient.estimatedPrognosis,
    status: patient.status,
    currentLocation: patient.currentLocation,
    registeredBy: {
      id: (patient.registeredBy as any)?._id?.toString() || '',
      name: (patient.registeredBy as any)?.name || 'Unknown',
    },
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update patient — records who made the change
// ─────────────────────────────────────────────────────────────
// Only whitelisted demographic/contact fields can be updated.
// Clinical fields (diagnosis, stage, prognosis) intentionally
// excluded — those should flow through a proper clinical workflow.
// ─────────────────────────────────────────────────────────────
export const updatePatient = async (
  patientId: string,
  data: any,
  adminId: string,
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const allowed = [
    'firstName',
    'lastName',
    'age',
    'sex',
    'dateOfBirth',
    'address',
    'phone',
    'emergencyContactName',
    'emergencyContactPhone',
    'caregiverName',
    'caregiverPhone',
    'hospitalPatientId',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      patient.set(key, data[key]);
    }
  }

  patient.updatedBy = adminId as any;   // ← audit
  await patient.save();

  return {
    id: patient._id.toString(),
    patientDisplayId: patient.patientDisplayId,
    hospitalPatientId: patient.hospitalPatientId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    age: patient.age,
    sex: patient.sex,
    dateOfBirth: patient.dateOfBirth,
    address: patient.address,
    phone: patient.phone,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    caregiverName: patient.caregiverName,
    caregiverPhone: patient.caregiverPhone,
    status: patient.status,
    currentLocation: patient.currentLocation,
    updatedAt: patient.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Patient summary (aggregates every sub-record)
// ─────────────────────────────────────────────────────────────
export const getPatientSummary = async (patientId: string) => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const [
    visits,
    medications,
    labTests,
    referrals,
    admissions,
    imagingOrders,
    progressNotes,
    dischargeSummary,
  ] = await Promise.all([
    HomeVisit.find({ patientId })
      .sort({ visitDate: -1 })
      .populate('teamLeaderId', 'name'),
    Medication.find({ patientId }).sort({ createdAt: -1 }),
    LaboratoryTest.find({ patientId }).sort({ dateOrdered: -1 }),
    Referral.find({ patientId }).sort({ createdAt: -1 }),
    HospitalAdmission.find({ patientId }).sort({ admissionDate: -1 }),
    ImagingOrder.find({ patientId }).sort({ createdAt: -1 }),
    PatientProgressNote.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(20),
    DischargeSummary.findOne({ patientId }).sort({ createdAt: -1 }),
  ]);

  return {
    patient: {
      id: patient._id.toString(),
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      sex: patient.sex,
      status: patient.status,
      currentLocation: patient.currentLocation,
      patientDisplayId: patient.patientDisplayId,
    },
    diagnosis: {
      primary: patient.primaryDiagnosis,
      secondary: patient.secondaryDiagnoses,
      stage: patient.diseaseStage,
    },
    visits: visits.map((v) => ({
      id: v._id.toString(),
      date: v.visitDate,
      outcome: v.outcome,
      staff: {
        id: (v.teamLeaderId as any)?._id?.toString() || '',
        name: (v.teamLeaderId as any)?.name || 'Unknown',
      },
    })),
    medications: medications.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      dosage: m.dosage,
      status: m.status,
      administeredAt: m.administeredAt,
    })),
    labTests: labTests.map((l) => ({
      id: l._id.toString(),
      name: l.testName,
      dateOrdered: l.dateOrdered,
      result: l.result,
    })),
    imagingOrders: imagingOrders.map((o) => ({
      id: o._id.toString(),
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      priority: o.priority,
      status: o.status,
      hasReport: !!(o.report && o.report.findings),
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
    })),
    progressNotes: progressNotes.map((n) => ({
      id: n._id.toString(),
      admissionId: n.admissionId?.toString(),
      generalCondition: n.generalCondition,
      levelOfConsciousness: n.levelOfConsciousness,
      attendingClinician: n.attendingClinician,
      overallAssessment: n.overallAssessment,
      createdAt: n.createdAt,
    })),
    referrals: referrals.map((r) => ({
      id: r._id.toString(),
      date: r.createdAt,
      status: r.status,
    })),
    admissions: admissions.map((a) => ({
      id: a._id.toString(),
      date: a.admissionDate,
      dischargeDate: a.dischargeDate,
      ward: a.ward,
      bedNumber: a.bedNumber,
      status: a.status,
      dischargeReason: a.dischargeReason,
    })),
    dischargeSummary: dischargeSummary
      ? {
          id: dischargeSummary._id.toString(),
          dateOfDischarge: dischargeSummary.dateOfDischarge,
          timeOfDischarge: dischargeSummary.timeOfDischarge,
          dischargeType: dischargeSummary.dischargeType,
          overallCondition: dischargeSummary.overallCondition,
          dischargedTo: dischargeSummary.dischargedTo,
          status: dischargeSummary.status,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────────────
// Patient progress (KPS/PPS over time)
// ─────────────────────────────────────────────────────────────
export const getPatientProgress = async (patientId: string) => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Primary source: home visits carry ppsScore / kpsScore
  const visits = await HomeVisit.find({ patientId })
    .sort({ visitDate: 1 })
    .select('visitDate ppsScore kpsScore _id');

  const progressData = visits.map((v) => ({
    visitId: v._id.toString(),
    visitDate: v.visitDate,
    kpsScore: v.kpsScore,
    ppsScore: v.ppsScore,
  }));

  if (progressData.length === 0) {
    return {
      patientId: patient._id.toString(),
      patientName: `${patient.firstName} ${patient.lastName}`,
      visits: [],
      trends: null,
    };
  }

  const firstKps = progressData[0].kpsScore;
  const lastKps = progressData[progressData.length - 1].kpsScore;
  const firstPps = progressData[0].ppsScore;
  const lastPps = progressData[progressData.length - 1].ppsScore;

  const calculateTrend = (first: number, last: number) => {
    if (last > first) return 'improving';
    if (last < first) return 'declining';
    return 'stable';
  };

  const calculatePercentageChange = (first: number, last: number) => {
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  };

  return {
    patientId: patient._id.toString(),
    patientName: `${patient.firstName} ${patient.lastName}`,
    visits: progressData,
    trends: {
      kps: {
        trend: calculateTrend(firstKps, lastKps),
        percentageChange: calculatePercentageChange(firstKps, lastKps),
        firstScore: firstKps,
        lastScore: lastKps,
      },
      pps: {
        trend: calculateTrend(firstPps, lastPps),
        percentageChange: calculatePercentageChange(firstPps, lastPps),
        firstScore: firstPps,
        lastScore: lastPps,
      },
    },
  };
};

export default {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient,
  getPatientSummary,
  getPatientProgress,
};