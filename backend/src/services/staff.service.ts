import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// Unified "staff is involved in this visit" filter.
//
// In the old Mongoose model, HomeVisit had teamLeaderId,
// physicianId, and nurseId as separate columns, plus a
// teamMembers sub-document. Your Prisma schema replaced all
// of that with:
//
//   - createdBy  → the staff who submitted the form
//                  (this is the "team leader" of the visit)
//   - signatures → HomeVisitSignature rows for others
//
// So a staff member is tied to a visit if they EITHER created
// it OR signed it.
// ─────────────────────────────────────────────────────────────
const visitFilterFor = (staffId: number) => ({
  OR: [
    { createdBy: staffId },
    { signatures: { some: { staffId } } },
  ],
});

// ═════════════════════════════════════════════════════════════
// Dashboard
// ═════════════════════════════════════════════════════════════
export const getDashboardStats = async (staffId: string | number) => {
  const id = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const visitFilter = visitFilterFor(id);

  const [todayVisits, visitsForPatientIds, recentVisits] = await Promise.all([
    prisma.homeVisit.count({
      where: { ...visitFilter, visitDate: { gte: today, lt: tomorrow } },
    }),
    prisma.homeVisit.findMany({
      where: visitFilter,
      select: { patientId: true },
      distinct: ['patientId'],
    }),
    prisma.homeVisit.findMany({
      where: visitFilter,
      orderBy: { visitDate: 'desc' },
      take: 5,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  const patientIds = visitsForPatientIds.map((v) => v.patientId);

  const [totalPatients, activePatients, assignedPatients] = await Promise.all([
    Promise.resolve(patientIds.length),
    prisma.patient.count({ where: { id: { in: patientIds }, status: 'Active' } }),
    prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: {
        id: true, firstName: true, lastName: true, age: true, sex: true,
        status: true, currentLocation: true, primaryDiagnosis: true,
      },
    }),
  ]);

  // Last visit + active admission per patient
  const patientsWithLastVisit = await Promise.all(
    assignedPatients.map(async (p) => {
      const [lastVisit, activeAdmission] = await Promise.all([
        prisma.homeVisit.findFirst({
          where: { patientId: p.id, ...visitFilter },
          orderBy: { visitDate: 'desc' },
          select: { visitDate: true },
        }),
        prisma.hospitalAdmission.findFirst({
          where: { patientId: p.id, status: 'Active' },
          select: { id: true },
        }),
      ]);
      return {
        ...p,
        lastVisitDate: lastVisit?.visitDate ?? null,
        activeAdmissionId: activeAdmission?.id ?? null,
      };
    }),
  );

  // Upcoming visits
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingVisits = await prisma.homeVisit.findMany({
    where: {
      ...visitFilter,
      nextVisitDate: { gte: today, lte: sevenDaysFromNow },
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  const alerts = await getAlertsForStaff(id);

  return {
    todayVisits,
    totalPatients,
    activePatients,
    pendingTasks: alerts.filter((a) => !a.read).length,
    recentVisits: recentVisits.map((v) => ({
      id: v.id,
      patientId: v.patient.id,
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      visitDate: v.visitDate,
      outcome: v.outcome,
    })),
    assignedPatients: patientsWithLastVisit,
    upcomingVisits: upcomingVisits.map((v) => ({
      id: v.id,
      patientId: v.patient.id,
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      scheduledDate: v.nextVisitDate,
      visitType: v.visitType,
    })),
    alerts,
  };
};

// ═════════════════════════════════════════════════════════════
// Alerts
// ═════════════════════════════════════════════════════════════
const getAlertsForStaff = async (staffId: number) => {
  const alerts: any[] = [];

  const visitFilter = visitFilterFor(staffId);

  const visits = await prisma.homeVisit.findMany({
    where: visitFilter,
    select: { patientId: true },
    distinct: ['patientId'],
  });
  const patientIds = visits.map((v) => v.patientId);

  // 1. Red-flag visits
  const redFlagVisits = await prisma.homeVisit.findMany({
    where: {
      patientId: { in: patientIds },
      redFlags: {
        hasSome: [
          'SevereUncontrolledPain',
          'SevereShortnessOfBreath',
          'MassiveBleeding',
          'UncontrolledSeizures',
          'AlteredMentalStatus',
          'SevereDehydration',
        ],
      },
    },
    orderBy: { visitDate: 'desc' },
    take: 5,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  for (const v of redFlagVisits) {
    alerts.push({
      id: `rf_${v.id}`,
      type: 'RedFlag',
      message: `Red flags reported for ${v.patient.firstName} ${v.patient.lastName}`,
      patientId: v.patient.id,
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      read: false,
      createdAt: v.createdAt,
    });
  }

  // 2. Pending referrals
  const referrals = await prisma.referral.findMany({
    where: { patientId: { in: patientIds }, status: 'Pending' },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  for (const r of referrals) {
    alerts.push({
      id: `ref_${r.id}`,
      type: 'ReferralPending',
      message: `Referral pending for ${r.patient.firstName} ${r.patient.lastName}`,
      patientId: r.patient.id,
      patientName: `${r.patient.firstName} ${r.patient.lastName}`,
      read: false,
      createdAt: r.createdAt,
    });
  }

  // 3. Overdue visits (7+ days since last visit)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const overdueCandidates = await prisma.patient.findMany({
    where: { id: { in: patientIds }, status: 'Active' },
    select: { id: true, firstName: true, lastName: true },
  });

  for (const p of overdueCandidates) {
    const last = await prisma.homeVisit.findFirst({
      where: { patientId: p.id, ...visitFilter },
      orderBy: { visitDate: 'desc' },
      select: { visitDate: true },
    });
    if (last && last.visitDate < sevenDaysAgo) {
      alerts.push({
        id: `ov_${p.id}`,
        type: 'VisitOverdue',
        message: `Visit overdue for ${p.firstName} ${p.lastName}`,
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        read: false,
        createdAt: new Date(),
      });
    }
  }

  // 4. Critical progress notes for active admissions
  const activeAdmissions = await prisma.hospitalAdmission.findMany({
    where: { patientId: { in: patientIds }, status: 'Active' },
    select: { id: true, patientId: true },
  });
  const admissionIds = activeAdmissions.map((a) => a.id);

  if (admissionIds.length > 0) {
    const criticalNotes = await prisma.patientProgressNote.findMany({
      where: {
        admissionId: { in: admissionIds },
        generalCondition: { in: ['Critical', 'ActivelyDying'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const n of criticalNotes) {
      const admission = activeAdmissions.find((a) => a.id === n.admissionId);
      if (!admission) continue;
      const p = await prisma.patient.findUnique({
        where: { id: admission.patientId },
        select: { id: true, firstName: true, lastName: true },
      });
      if (!p) continue;

      alerts.push({
        id: `crit_${n.id}`,
        type: 'RedFlag',
        message: `Critical condition reported for ${p.firstName} ${p.lastName}`,
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        read: false,
        createdAt: n.createdAt,
      });
    }
  }

  // 5. Imaging orders pending > 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const pendingImaging = await prisma.imagingOrder.findMany({
    where: {
      patientId: { in: patientIds },
      status: 'Ordered',
      createdAt: { lt: threeDaysAgo },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  for (const o of pendingImaging) {
    alerts.push({
      id: `img_${o.id}`,
      type: 'ReferralPending',
      message: `Imaging report pending for ${o.patient.firstName} ${o.patient.lastName} (${o.modality})`,
      patientId: o.patient.id,
      patientName: `${o.patient.firstName} ${o.patient.lastName}`,
      read: false,
      createdAt: o.createdAt,
    });
  }

  return alerts;
};

// ═════════════════════════════════════════════════════════════
// Assigned patients / upcoming visits / recent visits / alerts
// ═════════════════════════════════════════════════════════════
export const getVisitedPatients = async (
  staffId: string | number,
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string,
) => {
  const id = toId(staffId, 'staff id');
  const visitFilter = visitFilterFor(id);

  const visits = await prisma.homeVisit.findMany({
    where: visitFilter,
    select: { patientId: true },
    distinct: ['patientId'],
  });
  const patientIds = visits.map((v) => v.patientId);

  const where: any = { id: { in: patientIds } };
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

  return { items, page, limit, total };
};

export const getUpcomingVisits = async (
  staffId: string | number,
  days: number = 7,
  limit: number = 20,
) => {
  const id = toId(staffId, 'staff id');
  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  return prisma.homeVisit.findMany({
    where: {
      ...visitFilterFor(id),
      nextVisitDate: { gte: today, lte: end },
    },
    orderBy: { nextVisitDate: 'asc' },
    take: limit,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const getRecentVisits = async (
  staffId: string | number,
  days: number = 7,
  limit: number = 20,
) => {
  const id = toId(staffId, 'staff id');
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.homeVisit.findMany({
    where: {
      ...visitFilterFor(id),
      visitDate: { gte: since },
    },
    orderBy: { visitDate: 'desc' },
    take: limit,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const getAlerts = async (
  staffId: string | number,
  read?: string,
  type?: string,
  limit: number = 20,
) => {
  const id = toId(staffId, 'staff id');
  let alerts = await getAlertsForStaff(id);
  if (read !== undefined) alerts = alerts.filter((a) => a.read === (read === 'true'));
  if (type) alerts = alerts.filter((a) => a.type === type);
  const total = alerts.length;
  const unreadCount = alerts.filter((a) => !a.read).length;
  return { items: alerts.slice(0, limit), unreadCount, total };
};

export const markAlertRead = async (alertId: string, _staffId: string | number) => {
  return { id: alertId, read: true };
};

export default {
  getDashboardStats,
  getVisitedPatients,
  getUpcomingVisits,
  getRecentVisits,
  getAlerts,
  markAlertRead,
};