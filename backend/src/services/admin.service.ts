import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
import { StaffRole } from '@prisma/client';

// ═════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════

/**
 * Derive a stable, human-readable patient identifier.
 * Prefers `hospitalPatientId` when set; falls back to
 * `PAT-0001` derived from the numeric primary key.
 */
const patientDisplayId = (p: {
  id: number;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

// ═════════════════════════════════════════════════════════════
// STAFF APPROVALS
// ═════════════════════════════════════════════════════════════

export const getPendingStaff = async () => {
  const pending = await prisma.staff.findMany({
    where: { status: 'Pending', isEmailVerified: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return pending;
};

export const approveStaff = async (
  staffId: string,
  role: string,
  adminId: string | number,
) => {
  const id = toId(staffId, 'staff id');
  const adm = toId(adminId, 'admin id');

  const validRoles = [
    'Physician',
    'Nurse',
    'Pharmacist',
    'Radiologist',
    'LaboratoryTechnician',
    'Physiologist',
    'Psychiatrist',
    'Psychologist',
    'SocialWorker',
    'SpiritualPerson',
    'Nutritionist',
  ];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role specified');
  }

  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (staff.status === 'Active') throw new ApiError(400, 'Staff member is already approved');
  if (!staff.isEmailVerified) throw new ApiError(400, 'Staff email is not verified');

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.staff.update({
      where: { id },
      data: { role: role as any, status: 'Active', assignedBy: adm },
    });

    await tx.notification.deleteMany({
      where: {
        type: 'StaffApproval',
        data: { path: ['staffId'], equals: id },
      },
    });

    return s;
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    status: updated.status,
    assignedBy: { id: adm, name: 'Admin' },
    updatedAt: updated.updatedAt,
  };
};

export const rejectStaff = async (staffId: string) => {
  const id = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (staff.status === 'Active') throw new ApiError(400, 'Staff member is already approved');

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.staff.update({
      where: { id },
      data: { status: 'Rejected' },
    });
    await tx.notification.deleteMany({
      where: {
        type: 'StaffApproval',
        data: { path: ['staffId'], equals: id },
      },
    });
    return s;
  });

  return { id: updated.id, status: updated.status };
};

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════

export const getDashboardStats = async () => {
  const [
    totalPatients,
    activePatients,
    dischargedPatients,
    hospitalizedPatients,
    pendingReferrals,
    pendingStaff,
    staffApprovals,
    recentCloseCases,
    patientsByStatusRaw,
    recentReferrals,
    recentVisits,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { status: 'Active' } }),
    prisma.patient.count({ where: { status: 'Discharged' } }),
    prisma.patient.count({ where: { currentLocation: 'ReferredHospital' } }),
    prisma.referral.count({ where: { status: 'Pending' } }),
    prisma.staff.count({ where: { status: 'Pending', isEmailVerified: true, deletedAt: null } }),
    prisma.notification.count({ where: { type: 'StaffApproval', read: false } }),
    prisma.notification.count({
      where: {
        type: 'CloseCase',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.patient.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        requestedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.homeVisit.findMany({
      orderBy: { visitDate: 'desc' },
      take: 5,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    totalPatients,
    activePatients,
    hospitalizedPatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
    notifications: {
      staffApprovals,
      pendingReferrals,
      recentCloseCases,
    },
    patientsByStatus: patientsByStatusRaw.map((r) => ({
      status: r.status,
      count: r._count._all,
    })),
    recentReferrals: recentReferrals.map((r) => ({
      id: r.id,
      patientName: `${r.patient.firstName} ${r.patient.lastName}`,
      date: r.createdAt,
      status: r.status,
      enteredBy: r.createdByAdmin
        ? { id: r.createdByAdmin.id, name: r.createdByAdmin.name, type: 'admin' as const }
        : r.requestedByStaff
          ? { id: r.requestedByStaff.id, name: r.requestedByStaff.name, type: 'staff' as const }
          : null,
    })),
    recentVisits: recentVisits.map((v) => ({
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      date: v.visitDate,
      enteredBy: v.createdByAdmin
        ? { id: v.createdByAdmin.id, name: v.createdByAdmin.name, type: 'admin' as const }
        : v.createdByStaff
          ? { id: v.createdByStaff.id, name: v.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
  };
};

// ═════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════

export const getNotifications = async (limit: number = 20, read?: string) => {
  const where: any = {};
  if (read !== undefined) where.read = read === 'true';

  const [notifications, unreadCount, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { read: false } }),
    prisma.notification.count(),
  ]);

  return {
    notifications,
    unreadCount,
    totalCount,
  };
};

export const markNotificationRead = async (notificationId: string) => {
  const id = toId(notificationId, 'notification id');

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Notification not found');

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return { id: updated.id, read: updated.read };
};

// ═════════════════════════════════════════════════════════════
// PATIENTS (admin view)
// ═════════════════════════════════════════════════════════════

export const getPatients = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string,
) => {
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    const query = search.trim();
    const idMatches: any[] = [
      { hospitalPatientId: { contains: query, mode: 'insensitive' } },
    ];
    const generatedId = /^PAT-(\d+)$/i.exec(query);
    const numericId = generatedId?.[1] ?? (/^\d+$/.test(query) ? query : undefined);
    if (numericId && Number.isSafeInteger(Number(numericId))) {
      idMatches.push({ id: Number(numericId) });
    }
    where.OR = idMatches;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        registeredByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      patientDisplayId: patientDisplayId(p),
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      sex: p.sex,
      status: p.status,
      currentLocation: p.currentLocation,
      primaryDiagnosis: p.primaryDiagnosis,
      diseaseStage: p.diseaseStage,
      registeredAt: p.createdAt,
      enteredBy: p.createdByAdmin
        ? { id: p.createdByAdmin.id, name: p.createdByAdmin.name, type: 'admin' as const }
        : p.registeredByStaff
          ? { id: p.registeredByStaff.id, name: p.registeredByStaff.name, type: 'staff' as const }
          : null,
    })),
    page,
    limit,
    total,
  };
};

export const getPatientDetail = async (patientId: string) => {
  const id = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      registeredByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
      visits: {
        orderBy: { visitDate: 'desc' },
        include: {
          createdByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      medications: {
        orderBy: { createdAt: 'desc' },
        include: {
          prescribedByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      labTests: {
        orderBy: { dateOrdered: 'desc' },
        include: {
          orderedByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      referrals: {
        orderBy: { createdAt: 'desc' },
        include: {
          requestedByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      admissions: {
        orderBy: { admissionDate: 'desc' },
        include: {
          createdByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      imagingOrders: {
        orderBy: { createdAt: 'desc' },
        include: {
          orderedByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      progressNotes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          createdByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
      dischargeSummaries: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          createdByStaff: { select: { id: true, name: true } },
          createdByAdmin: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!patient) throw new ApiError(404, 'Patient not found');

  const latestDischarge = patient.dischargeSummaries[0] ?? null;

  return {
    id: patient.id,
    patientDisplayId: patientDisplayId(patient),
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

    enteredBy: patient.createdByAdmin
      ? { id: patient.createdByAdmin.id, name: patient.createdByAdmin.name, type: 'admin' as const }
      : patient.registeredByStaff
        ? { id: patient.registeredByStaff.id, name: patient.registeredByStaff.name, type: 'staff' as const }
        : null,

    visits: patient.visits.map((v) => ({
      id: v.id,
      visitDate: v.visitDate,
      visitType: v.visitType,
      overallStatus: v.overallStatus,
      outcome: v.outcome,
      ppsScore: v.ppsScore,
      kpsScore: v.kpsScore,
      enteredBy: v.createdByAdmin
        ? { id: v.createdByAdmin.id, name: v.createdByAdmin.name, type: 'admin' as const }
        : v.createdByStaff
          ? { id: v.createdByStaff.id, name: v.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    medications: patient.medications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route,
      administeredAt: m.administeredAt,
      status: m.status,
      createdAt: m.createdAt,
      enteredBy: m.createdByAdmin
        ? { id: m.createdByAdmin.id, name: m.createdByAdmin.name, type: 'admin' as const }
        : m.prescribedByStaff
          ? { id: m.prescribedByStaff.id, name: m.prescribedByStaff.name, type: 'staff' as const }
          : null,
    })),

    labTests: patient.labTests.map((l) => ({
      id: l.id,
      name: l.testName,
      dateOrdered: l.dateOrdered,
      datePerformed: l.datePerformed,
      result: l.result,
      status: l.status,
      location: l.location,
      enteredBy: l.createdByAdmin
        ? { id: l.createdByAdmin.id, name: l.createdByAdmin.name, type: 'admin' as const }
        : l.orderedByStaff
          ? { id: l.orderedByStaff.id, name: l.orderedByStaff.name, type: 'staff' as const }
          : null,
    })),

    imagingOrders: patient.imagingOrders.map((o) => ({
      id: o.id,
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      laterality: o.laterality,
      priority: o.priority,
      status: o.status,
      hasReport: !!(o.findings || o.impression),
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
      enteredBy: o.createdByAdmin
        ? { id: o.createdByAdmin.id, name: o.createdByAdmin.name, type: 'admin' as const }
        : o.orderedByStaff
          ? { id: o.orderedByStaff.id, name: o.orderedByStaff.name, type: 'staff' as const }
          : null,
    })),

    progressNotes: patient.progressNotes.map((n) => ({
      id: n.id,
      admissionId: n.admissionId,
      generalCondition: n.generalCondition,
      levelOfConsciousness: n.levelOfConsciousness,
      attendingClinician: n.attendingClinician,
      overallAssessment: n.overallAssessment,
      soapSubjective: n.soapSubjective,
      createdAt: n.createdAt,
      enteredBy: n.createdByAdmin
        ? { id: n.createdByAdmin.id, name: n.createdByAdmin.name, type: 'admin' as const }
        : n.createdByStaff
          ? { id: n.createdByStaff.id, name: n.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    referrals: patient.referrals.map((r) => ({
      id: r.id,
      date: r.createdAt,
      referralType: r.referralType,
      status: r.status,
      receivingFacility: r.receivingFacility,
      enteredBy: r.createdByAdmin
        ? { id: r.createdByAdmin.id, name: r.createdByAdmin.name, type: 'admin' as const }
        : r.requestedByStaff
          ? { id: r.requestedByStaff.id, name: r.requestedByStaff.name, type: 'staff' as const }
          : null,
    })),

    admissions: patient.admissions.map((a) => ({
      id: a.id,
      date: a.admissionDate,
      dischargeDate: a.dischargeDate,
      ward: a.ward,
      bedNumber: a.bedNumber,
      admittingPhysician: a.admittingPhysician,
      status: a.status,
      dischargeReason: a.dischargeReason,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    dischargeSummary: latestDischarge
      ? {
        id: latestDischarge.id,
        admissionId: latestDischarge.admissionId,
        dateOfDischarge: latestDischarge.dateOfDischarge,
        timeOfDischarge: latestDischarge.timeOfDischarge,
        dischargeType: latestDischarge.dischargeType,
        overallCondition: latestDischarge.overallCondition,
        dischargedTo: latestDischarge.dischargedTo,
        status: latestDischarge.status,
        createdAt: latestDischarge.createdAt,
        enteredBy: latestDischarge.createdByAdmin
          ? { id: latestDischarge.createdByAdmin.id, name: latestDischarge.createdByAdmin.name, type: 'admin' as const }
          : latestDischarge.createdByStaff
            ? { id: latestDischarge.createdByStaff.id, name: latestDischarge.createdByStaff.name, type: 'staff' as const }
            : null,
      }
      : null,

    createdAt: patient.createdAt,
  };
};

// ═════════════════════════════════════════════════════════════
// CLOSE CASE (legacy fast path)
// ═════════════════════════════════════════════════════════════

export const closeCase = async (
  patientId: string,
  reason: string,
  _adminId: string | number,
) => {
  const id = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (patient.status === 'Discharged') {
    throw new ApiError(400, 'Patient case is already closed');
  }

  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id },
      data: { status: 'Discharged' },
    });

    await tx.notification.create({
      data: {
        type: 'CloseCase',
        message: `Patient case closed: ${patient.firstName} ${patient.lastName}`,
        data: {
          patientId: id,
          patientName: `${patient.firstName} ${patient.lastName}`,
        },
        read: false,
      },
    });
  });

  return {
    id,
    status: 'Discharged',
    closeReason: reason,
    closeDate: new Date(),
  };
};

// ═════════════════════════════════════════════════════════════
// REFERRALS (admin view)
// ═════════════════════════════════════════════════════════════

export const getPendingReferrals = async () => {
  const referrals = await prisma.referral.findMany({
    where: { status: 'Pending' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          hospitalPatientId: true,
        },
      },
      requestedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return referrals.map((r) => ({
    id: r.id,
    patientId: r.patient.id,
    patientName: `${r.patient.firstName} ${r.patient.lastName}`,
    patientDisplayId: patientDisplayId(r.patient),
    referralType: r.referralType,
    referralDate: r.referralDate,
    primaryDiagnosis: r.primaryDiagnosis,
    diseaseStage: r.diseaseStage,
    ppsScore: r.ppsScore,
    kpsScore: r.kpsScore,
    currentSymptoms: r.currentSymptoms,
    reasons: r.reasons,
    otherReason: r.otherReason,
    referringFacility: r.referringFacility,
    receivingFacility: r.receivingFacility,
    contactPerson: r.contactPerson,
    contactNumber: r.contactNumber,
    status: r.status,
    enteredBy: r.createdByAdmin
      ? { id: r.createdByAdmin.id, name: r.createdByAdmin.name, type: 'admin' as const }
      : r.requestedByStaff
        ? { id: r.requestedByStaff.id, name: r.requestedByStaff.name, type: 'staff' as const }
        : null,
    createdAt: r.createdAt,
  }));
};

export const approveReferral = async (
  referralId: string,
  adminId: string | number,
) => {
  const rid = toId(referralId, 'referral id');
  const adm = toId(adminId, 'admin id');

  const referral = await prisma.referral.findUnique({
    where: { id: rid },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!referral) throw new ApiError(404, 'Referral not found');
  if (referral.status !== 'Pending') {
    throw new ApiError(400, 'Referral has already been processed');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.referral.update({
      where: { id: rid },
      data: { status: 'Accepted', approvedBy: adm },
    });

    await tx.patient.update({
      where: { id: referral.patientId },
      data: { currentLocation: 'ReferredHospital' },
    });

    await tx.notification.create({
      data: {
        type: 'ReferralApproval',
        message: `Referral approved for ${referral.patient.firstName} ${referral.patient.lastName}`,
        data: {
          referralId: rid,
          patientId: referral.patientId,
          patientName: `${referral.patient.firstName} ${referral.patient.lastName}`,
        },
        read: false,
      },
    });

    return r;
  });

  return {
    id: updated.id,
    status: updated.status,
    approvedBy: { id: adm, name: 'Admin' },
    updatedAt: updated.updatedAt,
  };
};

export const declineReferral = async (referralId: string) => {
  const rid = toId(referralId, 'referral id');

  const referral = await prisma.referral.findUnique({ where: { id: rid } });
  if (!referral) throw new ApiError(404, 'Referral not found');
  if (referral.status !== 'Pending') {
    throw new ApiError(400, 'Referral has already been processed');
  }

  const updated = await prisma.referral.update({
    where: { id: rid },
    data: { status: 'Declined' },
  });

  return { id: updated.id, status: updated.status };
};

// ═════════════════════════════════════════════════════════════
// REPORTS
// ═════════════════════════════════════════════════════════════

export const getReports = async (startDate?: string, endDate?: string) => {
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);
  const createdAtFilter =
    Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalPatients,
    activePatients,
    dischargedPatients,
    hospitalizedPatients,
    referralsByStatusRaw,
    patientsByLocationRaw,
    patientsByStageRaw,
    closeCasesByReasonRaw,
    visitsByMonthRows,
    imagingByModalityRaw,
    imagingByStatusRaw,
    progressNotesByConditionRaw,
    dischargesByTypeRaw,
  ] = await Promise.all([
    prisma.patient.count({ where: createdAtFilter }),
    prisma.patient.count({ where: { ...createdAtFilter, status: 'Active' } }),
    prisma.patient.count({ where: { ...createdAtFilter, status: 'Discharged' } }),
    prisma.patient.count({
      where: { ...createdAtFilter, currentLocation: 'ReferredHospital' },
    }),
    prisma.referral.groupBy({
      by: ['status'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.patient.groupBy({
      by: ['currentLocation'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.patient.groupBy({
      by: ['diseaseStage'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.notification.findMany({
      where: { ...createdAtFilter, type: 'CloseCase' },
      select: { data: true },
    }),
    prisma.homeVisit.findMany({
      where:
        Object.keys(dateFilter).length > 0
          ? { visitDate: dateFilter }
          : undefined,
      select: { visitDate: true },
    }),
    prisma.imagingOrder.groupBy({
      by: ['modality'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.imagingOrder.groupBy({
      by: ['status'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.patientProgressNote.groupBy({
      by: ['generalCondition'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
    prisma.dischargeSummary.groupBy({
      by: ['dischargeType'],
      where: createdAtFilter,
      _count: { _all: true },
    }),
  ]);

  // ── Aggregate visits by month (client-side, JSON-safe) ──
  const visitsByMonthMap = new Map<string, number>();
  for (const v of visitsByMonthRows) {
    const month = v.visitDate.toISOString().slice(0, 7);
    visitsByMonthMap.set(month, (visitsByMonthMap.get(month) ?? 0) + 1);
  }

  const visitsByMonth = Array.from(visitsByMonthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ── Aggregate close cases by reason ──
  const closeCasesByReasonMap: Record<string, number> = {};
  for (const n of closeCasesByReasonRaw) {
    const reason = (n.data as any)?.reason ?? 'Unknown';
    closeCasesByReasonMap[reason] = (closeCasesByReasonMap[reason] ?? 0) + 1;
  }

  return {
    totalPatients,
    activePatients,
    dischargedPatients,
    hospitalizedPatients,
    referralsByStatus: referralsByStatusRaw.map((r) => ({
      status: r.status,
      count: r._count._all,
    })),
    patientsByLocation: patientsByLocationRaw.map((r) => ({
      location: r.currentLocation,
      count: r._count._all,
    })),
    patientsByStage: patientsByStageRaw.map((r) => ({
      stage: r.diseaseStage,
      count: r._count._all,
    })),
    closeCasesByReason: Object.entries(closeCasesByReasonMap).map(
      ([reason, count]) => ({ reason, count }),
    ),
    visitsByMonth,
    imagingByModality: imagingByModalityRaw.map((r) => ({
      modality: r.modality,
      count: r._count._all,
    })),
    imagingByStatus: imagingByStatusRaw.map((r) => ({
      status: r.status,
      count: r._count._all,
    })),
    progressNotesByCondition: progressNotesByConditionRaw.map((r) => ({
      condition: r.generalCondition,
      count: r._count._all,
    })),
    dischargesByType: dischargesByTypeRaw.map((r) => ({
      dischargeType: r.dischargeType,
      count: r._count._all,
    })),
  };
};

// ═════════════════════════════════════════════════════════════
// STAFF MANAGEMENT (active staff)
// ═════════════════════════════════════════════════════════════

export const getStaffList = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    status?: 'Active' | 'Pending' | 'Rejected' | 'Deleted' | 'All';
    role?: StaffRole;
    search?: string;
  } = {},
) => {
  const query: any = {};

  if (!filters.status || filters.status === 'All') {
    // no filter
  } else if (filters.status === 'Deleted') {
    query.deletedAt = { not: null };
  } else {
    query.status = filters.status;
    query.deletedAt = null;
  }

  if (filters.role) query.role = filters.role;

  if (filters.search) {
    const q = filters.search.trim();
    query.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.staff.findMany({
      where: query,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prismaBase.staff.count({ where: query }),
  ]);

  return { items, page, limit, total };
};

export const getStaffById = async (
  staffId: string,
  includeDeleted: boolean = false,
) => {
  const id = toId(staffId, 'staff id');

  const client = includeDeleted ? prismaBase : prisma;
  const staff = await client.staff.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isEmailVerified: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!staff) throw new ApiError(404, 'Staff member not found');
  return staff;
};

export const updateStaff = async (
  staffId: string,
  data: { name?: string; phone?: string; role?: any },
  adminId: string | number,
) => {
  const id = toId(staffId, 'staff id');
  const adm = toId(adminId, 'admin id');

  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (staff.deletedAt) {
    throw new ApiError(400, 'Cannot edit a deleted staff member — restore first');
  }

  if (staff.status !== 'Active' && data.role !== undefined) {
    throw new ApiError(
      400,
      'Role can only be changed for active staff. Use approve for pending users.',
    );
  }

  const updated = await prisma.staff.update({
    where: { id },
    data: { ...data, updatedBy: adm },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isEmailVerified: true,
      updatedAt: true,
    },
  });

  return updated;
};

export const deleteStaff = async (
  staffId: string,
  adminId: string | number,
  reason?: string,
) => {
  const id = toId(staffId, 'staff id');
  const adm = toId(adminId, 'admin id');

  if (id === adm) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (staff.deletedAt) throw new ApiError(400, 'Staff member is already deleted');

  const updated = await prisma.staff.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: adm,
      deletionReason: reason ?? null,
      updatedBy: adm,
    },
  });

  return { id: updated.id, success: true, deletedAt: updated.deletedAt };
};

export const restoreStaff = async (staffId: string, adminId: string | number) => {
  const id = toId(staffId, 'staff id');
  const adm = toId(adminId, 'admin id');

  const staff = await prismaBase.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (!staff.deletedAt) throw new ApiError(400, 'Staff member is not deleted');

  await prisma.staff.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: adm,
    },
  });

  return { id, restored: true };
};

// ═════════════════════════════════════════════════════════════
// STAFF PERFORMANCE
// ═════════════════════════════════════════════════════════════

export const getStaffPerformanceList = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string,
) => {
  const where: any = {
    status: 'Active',
    deletedAt: null,
  };
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, role: true },
    }),
    prisma.staff.count({ where }),
  ]);

  // Fan out the per-staff metrics.
  const items = await Promise.all(
    staff.map(async (s) => {
      const [visitCount, patientCount] = await Promise.all([
        prisma.homeVisit.count({ where: { createdBy: s.id } }),
        prisma.patient.count({ where: { registeredBy: s.id } }),
      ]);
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        totalPatientsAssigned: patientCount,
        totalVisitsRecorded: visitCount,
        // Placeholder — the schema doesn't currently track response time.
        averageResponseTimeMinutes: null,
      };
    }),
  );

  return { items, page, limit, total };
};

/**
 * getStaffPerformanceDetail
 * ─────────────────────────
 * Every counter here MUST match its corresponding `getStaffActivity`
 * source, so the totals never disagree with the paginated list.
 *
 * Attribution:
 *   • Physician / Nurse      → visits, patients, medications ordered,
 *                              labs ordered, imaging ordered,
 *                              referrals, progress notes
 *   • Pharmacist             → medications marked Given
 *                              (updatedByStaffId + status='Given')
 *   • LaboratoryTechnician   → lab tests Completed
 *                              (LaboratoryTest.performedBy = name
 *                               AND status = 'Completed')
 *   • Radiologist            → imaging reports Completed
 *                              (ImagingOrder.radiologistName = name
 *                               AND status = 'Completed')
 *   • Assessment authors     → one count per assessment model
 */
export const getStaffPerformanceDetail = async (staffId: string) => {
  const id = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const staffName = staff.name;

  const [
    // ── Physician / Nurse ──
    totalVisitsRecorded,
    totalPatientsAssigned,
    totalPatientsAdminAttributed,
    totalMedicationsOrdered,
    totalLabTestsRequested,
    totalImagingOrdersPlaced,
    totalReferralsSubmitted,
    totalProgressNotesCreated,

    // ── Pharmacist / Lab Tech / Radiologist ──
    totalMedicationsGiven,
    totalLabTestsCompleted,
    totalImagingReportsSubmitted,

    // ── Assessment authoring ──
    totalPainAssessments,
    totalPharmacistAssessments,
    totalPhysiotherapyAssessments,
    totalFamilyAssessments,
    totalNutritionalAssessments,
    totalSocialAssessments,
    totalSpiritualAssessments,
    totalPsychiatryAssessments,
  ] = await Promise.all([
    // ── Physician / Nurse ──
    prisma.homeVisit.count({ where: { createdBy: id } }),

    // Primary: staff attributed as the registrant.
    prisma.patient.count({ where: { registeredBy: id } }),

    // Fallback: admin-attributed with acting staff explicitly recorded.
    // (Only fires when an admin registered and passed actingAsStaffId.)
    prisma.patient.count({ where: { createdByAdminId: id } }),

    prisma.medication.count({ where: { prescribedBy: id } }),
    prisma.laboratoryTest.count({ where: { orderedBy: id } }),
    prisma.imagingOrder.count({ where: { orderedBy: id } }),
    prisma.referral.count({ where: { requestedBy: id } }),
    prisma.patientProgressNote.count({ where: { createdBy: id } }),

    // ── Pharmacist: medication marked Given ──
    prisma.medication.count({
      where: {
        updatedByStaffId: id,
        status: 'Given',
      },
    }),

    // ── Lab Technician ──
    // MUST match getStaffActivity's lab filter:
    //   LaboratoryTest.performedBy = staffName AND status = 'Completed'
    staffName
      ? prisma.laboratoryTest.count({
          where: {
            performedBy: staffName,
            status: 'Completed',
          },
        })
      : Promise.resolve(0),

    // ── Radiologist ──
    // MUST match getStaffActivity's imaging filter:
    //   ImagingOrder.radiologistName = staffName AND status = 'Completed'
    staffName
      ? prisma.imagingOrder.count({
          where: {
            radiologistName: staffName,
            status: 'Completed',
          },
        })
      : Promise.resolve(0),

    // ── Assessment authoring ──
    prisma.painAssessment.count({ where: { createdBy: id } }),
    prisma.clinicalPharmacistAssessment.count({ where: { createdBy: id } }),
    prisma.physiotherapyAssessment.count({ where: { createdBy: id } }),
    prisma.familyAssessment.count({ where: { createdBy: id } }),
    prisma.nutritionalAssessment.count({ where: { createdBy: id } }),
    prisma.socialAssessment.count({ where: { createdBy: id } }),
    prisma.spiritualAssessment.count({ where: { createdBy: id } }),
    prisma.psychiatryAssessment.count({ where: { createdBy: id } }),
  ]);

  const totalPatientsAttributed =
    totalPatientsAssigned + totalPatientsAdminAttributed;

  const recentActivityResult = await getStaffActivity(id, 1, 20);

  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,

    // ── Physician / Nurse ──
    totalVisitsRecorded,
    // Expose both field names so any UI label works.
    totalPatientsAssigned: totalPatientsAttributed,
    totalPatientsRegistered: totalPatientsAttributed,
    totalMedicationsOrdered,
    totalLabTestsRequested,
    totalImagingOrdersPlaced,
    totalReferralsSubmitted,
    totalProgressNotesCreated,

    // ── Pharmacist / Lab Tech / Radiologist ──
    totalMedicationsGiven,
    totalLabTestsCompleted,
    totalImagingReportsSubmitted,

    // ── Assessment authoring ──
    totalPainAssessments,
    totalPharmacistAssessments,
    totalPhysiotherapyAssessments,
    totalFamilyAssessments,
    totalNutritionalAssessments,
    totalSocialAssessments,
    totalSpiritualAssessments,
    totalPsychiatryAssessments,

    averageResponseTimeMinutes: null,
    recentActivity: recentActivityResult.items,
  };
};

/**
 * getStaffActivity
 * ────────────────
 * Chronological timeline of every action a staff member performed.
 *
 * CRITICAL INVARIANT: every source here matches a counter in
 * getStaffPerformanceDetail 1:1. In particular:
 *
 *   • Patients → registeredBy = staff.id OR createdByAdminId = staff.id
 *                (matches the "Patients Registered" card)
 *   • Labs     → performedBy = staff.name AND status = 'Completed'
 *   • Imaging  → radiologistName = staff.name AND status = 'Completed'
 *
 * Physician/Nurse "ordered" rows are included for their own feed
 * (they authored the order). Lab techs / radiologists only see rows
 * they themselves performed / reported — never rows they merely
 * "ordered" (which is a different action surface).
 */
export const getStaffActivity = async (
  staffId: number,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { id: true, name: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const staffName = staff.name;

  const [
    visits,
    patients,
    medications,
    labs,
    imaging,
    referrals,
    admissions,
    notes,

    // Assessments
    painAssessments,
    pharmacistAssessments,
    physiotherapyAssessments,
    familyAssessments,
    nutritionalAssessments,
    socialAssessments,
    spiritualAssessments,
    psychiatryAssessments,
  ] = await Promise.all([
    // ── Home visits ──
    prisma.homeVisit.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Patients registered ──
    // Matches the "Patients Registered" card count.
    prisma.patient.findMany({
      where: {
        OR: [
          { registeredBy: staffId },
          { createdByAdminId: staffId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        registeredByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Medications ──
    prisma.medication.findMany({
      where: {
        OR: [
          { prescribedBy: staffId },
          { updatedByStaffId: staffId, status: 'Given' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        prescribedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
        updatedByStaff: { select: { id: true, name: true } },
      },
    }),

    // ── Labs ──
    // Both branches taggable — the "performed" branch requires
    // status='Completed' to mirror the card count.
    prisma.laboratoryTest.findMany({
      where: {
        OR: [
          { orderedBy: staffId },
          ...(staffName
            ? [{ performedBy: staffName, status: 'Completed' as const }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Imaging ──
    // Same treatment as labs.
    prisma.imagingOrder.findMany({
      where: {
        OR: [
          { orderedBy: staffId },
          ...(staffName
            ? [{ radiologistName: staffName, status: 'Completed' as const }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Referrals ──
    prisma.referral.findMany({
      where: { requestedBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        requestedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Admissions ──
    prisma.hospitalAdmission.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Progress notes ──
    prisma.patientProgressNote.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),

    // ── Assessments ──
    prisma.painAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.clinicalPharmacistAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.physiotherapyAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.familyAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.nutritionalAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.socialAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.spiritualAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.psychiatryAssessment.findMany({
      where: { createdBy: staffId },
      orderBy: { createdAt: 'desc' },
      take: skip + limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
  ]);

  const activity = [
    // ── Visits ──
    ...visits.map((v) => ({
      id: `visit-${v.id}`,
      type: 'visit' as const,
      patientId: String(v.patient.id),
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      timestamp: v.createdAt.toISOString(),
      description: `Visit recorded · ${v.visitType}`,
      enteredBy: v.createdByAdmin
        ? { id: v.createdByAdmin.id, name: v.createdByAdmin.name, type: 'admin' as const }
        : v.createdByStaff
          ? { id: v.createdByStaff.id, name: v.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    // ── Patients registered ──
    ...patients.map((p) => ({
      id: `patient-${p.id}`,
      type: 'patient' as const,
      patientId: String(p.id),
      patientName: `${p.firstName} ${p.lastName}`,
      timestamp: p.createdAt.toISOString(),
      description: `Patient registered · ${p.primaryDiagnosis}`,
      enteredBy: p.createdByAdmin
        ? { id: p.createdByAdmin.id, name: p.createdByAdmin.name, type: 'admin' as const }
        : p.registeredByStaff
          ? { id: p.registeredByStaff.id, name: p.registeredByStaff.name, type: 'staff' as const }
          : null,
    })),

    // ── Medications ──
    ...medications.map((m) => {
      const wasOrderedByThisStaff = m.prescribedBy === staffId;
      return {
        id: `medication-${m.id}`,
        type: 'medication' as const,
        patientId: String(m.patient.id),
        patientName: `${m.patient.firstName} ${m.patient.lastName}`,
        timestamp: (wasOrderedByThisStaff ? m.createdAt : m.updatedAt).toISOString(),
        description: wasOrderedByThisStaff
          ? `${m.name} · ${m.dosage} ordered`
          : `${m.name} · ${m.dosage} administered`,
        enteredBy: m.createdByAdmin
          ? { id: m.createdByAdmin.id, name: m.createdByAdmin.name, type: 'admin' as const }
          : m.prescribedByStaff
            ? { id: m.prescribedByStaff.id, name: m.prescribedByStaff.name, type: 'staff' as const }
            : null,
      };
    }),

    // ── Labs ──
    ...labs.map((l) => {
      const wasOrderedByThisStaff = l.orderedBy === staffId;
      return {
        id: `lab-${l.id}`,
        type: 'lab' as const,
        patientId: String(l.patient.id),
        patientName: `${l.patient.firstName} ${l.patient.lastName}`,
        timestamp: (wasOrderedByThisStaff ? l.createdAt : l.updatedAt).toISOString(),
        description: wasOrderedByThisStaff
          ? `${l.testName} · ${l.category} requested`
          : `${l.testName} · result recorded`,
        enteredBy: l.createdByAdmin
          ? { id: l.createdByAdmin.id, name: l.createdByAdmin.name, type: 'admin' as const }
          : l.orderedByStaff
            ? { id: l.orderedByStaff.id, name: l.orderedByStaff.name, type: 'staff' as const }
            : null,
      };
    }),

    // ── Imaging ──
    ...imaging.map((i) => {
      const wasOrderedByThisStaff = i.orderedBy === staffId;
      return {
        id: `imaging-${i.id}`,
        type: 'imaging' as const,
        patientId: String(i.patient.id),
        patientName: `${i.patient.firstName} ${i.patient.lastName}`,
        timestamp: (wasOrderedByThisStaff ? i.createdAt : i.updatedAt).toISOString(),
        description: wasOrderedByThisStaff
          ? `${i.modality} · ${i.bodyRegion} ordered`
          : `${i.modality} · ${i.bodyRegion} report submitted`,
        enteredBy: i.createdByAdmin
          ? { id: i.createdByAdmin.id, name: i.createdByAdmin.name, type: 'admin' as const }
          : i.orderedByStaff
            ? { id: i.orderedByStaff.id, name: i.orderedByStaff.name, type: 'staff' as const }
            : null,
      };
    }),

    // ── Referrals ──
    ...referrals.map((r) => ({
      id: `referral-${r.id}`,
      type: 'referral' as const,
      patientId: String(r.patient.id),
      patientName: `${r.patient.firstName} ${r.patient.lastName}`,
      timestamp: r.createdAt.toISOString(),
      description: `${r.referralType} · ${r.receivingFacility}`,
      enteredBy: r.createdByAdmin
        ? { id: r.createdByAdmin.id, name: r.createdByAdmin.name, type: 'admin' as const }
        : r.requestedByStaff
          ? { id: r.requestedByStaff.id, name: r.requestedByStaff.name, type: 'staff' as const }
          : null,
    })),

    // ── Admissions ──
    ...admissions.map((a) => ({
      id: `admission-${a.id}`,
      type: 'admission' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `${a.ward} · Bed ${a.bedNumber}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    // ── Progress notes ──
    ...notes.map((n) => ({
      id: `progress_note-${n.id}`,
      type: 'progress_note' as const,
      patientId: String(n.patient.id),
      patientName: `${n.patient.firstName} ${n.patient.lastName}`,
      timestamp: n.createdAt.toISOString(),
      description: `Progress note · ${n.generalCondition ?? 'Condition recorded'}`,
      enteredBy: n.createdByAdmin
        ? { id: n.createdByAdmin.id, name: n.createdByAdmin.name, type: 'admin' as const }
        : n.createdByStaff
          ? { id: n.createdByStaff.id, name: n.createdByStaff.name, type: 'staff' as const }
          : null,
    })),

    // ── Assessments ──
    ...painAssessments.map((a) => ({
      id: `pain-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Pain assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...pharmacistAssessments.map((a) => ({
      id: `pharmacist-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Pharmacist assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...physiotherapyAssessments.map((a) => ({
      id: `physiotherapy-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Physiotherapy assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...familyAssessments.map((a) => ({
      id: `family-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Family assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...nutritionalAssessments.map((a) => ({
      id: `nutritional-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Nutritional assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...socialAssessments.map((a) => ({
      id: `social-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Social assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...spiritualAssessments.map((a) => ({
      id: `spiritual-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Spiritual assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
    ...psychiatryAssessments.map((a) => ({
      id: `psychiatry-assessment-${a.id}`,
      type: 'assessment' as const,
      patientId: String(a.patient.id),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      timestamp: a.createdAt.toISOString(),
      description: `Psychiatry assessment · ${a.assessmentType}`,
      enteredBy: a.createdByAdmin
        ? { id: a.createdByAdmin.id, name: a.createdByAdmin.name, type: 'admin' as const }
        : a.createdByStaff
          ? { id: a.createdByStaff.id, name: a.createdByStaff.name, type: 'staff' as const }
          : null,
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(skip, skip + limit);

  return {
    items: activity,
    total: activity.length,
    hasMore: activity.length === limit,
  };
};

// ═════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════

export default {
  // Staff approvals
  getPendingStaff,
  approveStaff,
  rejectStaff,

  // Dashboard
  getDashboardStats,
  getNotifications,
  markNotificationRead,

  // Patients
  getPatients,
  getPatientDetail,
  closeCase,

  // Referrals
  getPendingReferrals,
  approveReferral,
  declineReferral,

  // Reports
  getReports,

  // Staff management
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  restoreStaff,

  // Staff performance
  getStaffPerformanceList,
  getStaffPerformanceDetail,
  getStaffActivity,
};