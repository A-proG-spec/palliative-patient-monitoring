import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// Register patient
// ─────────────────────────────────────────────────────────────
export const registerPatient = async (data: any, staffId: string|number) => {
  const registeredById = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({
    where: { id: registeredById },
    select: { id: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const patient = await prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      sex: data.sex,
      dateOfBirth: new Date(data.dateOfBirth),
      address: data.address,
      phone: data.phone,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      caregiverName: data.caregiverName,
      caregiverPhone: data.caregiverPhone,
      caregiverRelation: data.caregiverRelation ?? null,
      primaryDiagnosis: data.primaryDiagnosis,
      secondaryDiagnoses: data.secondaryDiagnoses ?? [],
      diseaseStage: data.diseaseStage,
      comorbidities: data.comorbidities ?? [],
      estimatedPrognosis: data.estimatedPrognosis,
      status: 'Active',
      currentLocation: 'Home',
      registeredBy: registeredById,
    },
  });

  return patient;
};

// ─────────────────────────────────────────────────────────────
// List patients
// ─────────────────────────────────────────────────────────────
export const getPatients = async (
  _staffId: string|number,
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string,
) => {
  const where: any = {};
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      sex: p.sex,
      status: p.status,
      currentLocation: p.currentLocation,
      primaryDiagnosis: p.primaryDiagnosis,
      registeredAt: p.createdAt,
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
  const id = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      registeredByStaff: { select: { id: true, name: true } },
    },
  });

  if (!patient) throw new ApiError(404, 'Patient not found');

  return {
    id: patient.id,
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
    caregiverRelation: patient.caregiverRelation,
    primaryDiagnosis: patient.primaryDiagnosis,
    secondaryDiagnoses: patient.secondaryDiagnoses,
    diseaseStage: patient.diseaseStage,
    comorbidities: patient.comorbidities,
    estimatedPrognosis: patient.estimatedPrognosis,
    status: patient.status,
    currentLocation: patient.currentLocation,
    registeredBy: {
      id: patient.registeredByStaff.id,
      name: patient.registeredByStaff.name,
    },
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update patient — whitelisted fields only, records auditor
// ─────────────────────────────────────────────────────────────
export const updatePatient = async (
  patientId: string,
  data: any,
  adminId: string|number,
) => {
  const id = toId(patientId, 'patient id');
  const admin = toId(adminId, 'admin id');

  const existing = await prisma.patient.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Patient not found');

  const allowed = [
    'firstName', 'lastName', 'age', 'sex', 'dateOfBirth',
    'address', 'phone',
    'emergencyContactName', 'emergencyContactPhone',
    'caregiverName', 'caregiverPhone', 'caregiverRelation',
    'hospitalPatientId',
  ] as const;

  const updateData: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      updateData[key] = key === 'dateOfBirth' ? new Date(data[key]) : data[key];
    }
  }
  updateData.updatedBy = admin;

  return prisma.patient.update({
    where: { id },
    data: updateData,
  });
};

// ─────────────────────────────────────────────────────────────
// Patient summary — aggregate every sub-record
//
// NOTE: the "team leader" is the staff member who submitted the
// visit form (captured in `HomeVisit.createdBy`). In this schema
// that is exposed as the `createdByStaff` relation. The signature
// table also carries an `isTeamLeader` flag for the auto-signed
// leader row.
// ─────────────────────────────────────────────────────────────
export const getPatientSummary = async (patientId: string) => {
  const id = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { visitDate: 'desc' },
        include: {
          createdByStaff: { select: { id: true, name: true } },
          signatures: {
            select: {
              staffId: true,
              name: true,
              role: true,
              isTeamLeader: true,
              signedAt: true,
            },
          },
        },
      },
      medications: { orderBy: { createdAt: 'desc' } },
      labTests: { orderBy: { dateOrdered: 'desc' } },
      referrals: { orderBy: { createdAt: 'desc' } },
      admissions: { orderBy: { admissionDate: 'desc' } },
      imagingOrders: { orderBy: { createdAt: 'desc' } },
      progressNotes: { orderBy: { createdAt: 'desc' }, take: 20 },
      dischargeSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!patient) throw new ApiError(404, 'Patient not found');

  const latestDischarge = patient.dischargeSummaries[0] ?? null;

  return {
    patient: {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      sex: patient.sex,
      status: patient.status,
      currentLocation: patient.currentLocation,
    },
    diagnosis: {
      primary: patient.primaryDiagnosis,
      secondary: patient.secondaryDiagnoses,
      stage: patient.diseaseStage,
    },
    visits: patient.visits.map((v) => {
      // Team leader = the staff flagged as leader on a signature row,
      // falling back to the staff member who created the visit.
      const leaderSignature = v.signatures.find((s) => s.isTeamLeader);
      const displayStaff = leaderSignature
        ? { id: leaderSignature.staffId, name: leaderSignature.name }
        : { id: v.createdByStaff.id, name: v.createdByStaff.name };

      return {
        id: v.id,
        date: v.visitDate,
        outcome: v.outcome,
        staff: displayStaff,
        signatures: v.signatures,
      };
    }),
    medications: patient.medications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      status: m.status,
      administeredAt: m.administeredAt,
    })),
    labTests: patient.labTests.map((l) => ({
      id: l.id,
      name: l.testName,
      dateOrdered: l.dateOrdered,
      result: l.result,
      status: l.status,
    })),
    imagingOrders: patient.imagingOrders.map((o) => ({
      id: o.id,
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      priority: o.priority,
      status: o.status,
      hasReport: !!o.findings,
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
    })),
    progressNotes: patient.progressNotes.map((n) => ({
      id: n.id,
      admissionId: n.admissionId,
      generalCondition: n.generalCondition,
      levelOfConsciousness: n.levelOfConsciousness,
      attendingClinician: n.attendingClinician,
      overallAssessment: n.overallAssessment,
      createdAt: n.createdAt,
    })),
    referrals: patient.referrals.map((r) => ({
      id: r.id,
      date: r.createdAt,
      status: r.status,
    })),
    admissions: patient.admissions.map((a) => ({
      id: a.id,
      date: a.admissionDate,
      dischargeDate: a.dischargeDate,
      ward: a.ward,
      bedNumber: a.bedNumber,
      status: a.status,
      dischargeReason: a.dischargeReason,
    })),
    dischargeSummary: latestDischarge
      ? {
          id: latestDischarge.id,
          dateOfDischarge: latestDischarge.dateOfDischarge,
          timeOfDischarge: latestDischarge.timeOfDischarge,
          dischargeType: latestDischarge.dischargeType,
          overallCondition: latestDischarge.overallCondition,
          dischargedTo: latestDischarge.dischargedTo,
          status: latestDischarge.status,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────────────
// Progress — KPS/PPS over time (sourced from HomeVisit)
// ─────────────────────────────────────────────────────────────
export const getPatientProgress = async (patientId: string) => {
  const id = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const visits = await prisma.homeVisit.findMany({
    where: { patientId: id },
    orderBy: { visitDate: 'asc' },
    select: { id: true, visitDate: true, ppsScore: true, kpsScore: true },
  });

  if (visits.length === 0) {
    return {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      visits: [],
      trends: null,
    };
  }

  const first = visits[0];
  const last = visits[visits.length - 1];

  const trend = (a: number, b: number) =>
    b > a ? 'improving' : b < a ? 'declining' : 'stable';
  const pct = (a: number, b: number) => (a === 0 ? 0 : Math.round(((b - a) / a) * 100));

  return {
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    visits: visits.map((v) => ({
      visitId: v.id,
      visitDate: v.visitDate,
      kpsScore: v.kpsScore,
      ppsScore: v.ppsScore,
    })),
    trends: {
      kps: {
        trend: trend(first.kpsScore, last.kpsScore),
        percentageChange: pct(first.kpsScore, last.kpsScore),
        firstScore: first.kpsScore,
        lastScore: last.kpsScore,
      },
      pps: {
        trend: trend(first.ppsScore, last.ppsScore),
        percentageChange: pct(first.ppsScore, last.ppsScore),
        firstScore: first.ppsScore,
        lastScore: last.ppsScore,
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