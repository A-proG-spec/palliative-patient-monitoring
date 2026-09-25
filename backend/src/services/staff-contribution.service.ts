import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ═════════════════════════════════════════════════════════════
// SUMMARY — counts only (fast)
//
// Answers "how much has this staff contributed" across every
// model that has an FK pointing at Staff.id.
// ═════════════════════════════════════════════════════════════
export const getStaffContributionSummary = async (staffId: string) => {
  const id = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, status: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const [
    patientsRegistered,
    visitsCreated,
    visitsAsTeamLeader,
    visitsSigned,
    medicationsPrescribed,
    labsOrdered,
    imagingOrdered,
    referralsRequested,
    admissionsCreated,
    dischargesCreated,
    progressNotesCreated,
    progressNotesAsResponsible,
    progressNotesSigned,
    hospiceCreated,
    hospiceAssessed,
  ] = await Promise.all([
    prisma.patient.count({ where: { registeredBy: id } }),
    prisma.homeVisit.count({ where: { createdBy: id } }),
    prisma.homeVisitSignature.count({ where: { staffId: id, isTeamLeader: true } }),
    prisma.homeVisitSignature.count({ where: { staffId: id, isTeamLeader: false } }),
    prisma.medication.count({ where: { prescribedBy: id } }),
    prisma.laboratoryTest.count({ where: { orderedBy: id } }),
    prisma.imagingOrder.count({ where: { orderedBy: id } }),
    prisma.referral.count({ where: { requestedBy: id } }),
    prisma.hospitalAdmission.count({ where: { createdBy: id } }),
    prisma.dischargeSummary.count({ where: { createdBy: id } }),
    prisma.patientProgressNote.count({ where: { createdBy: id } }),
    prisma.patientProgressNote.count({ where: { responsibleClinicianId: id } }),
    prisma.progressNoteSignature.count({ where: { staffId: id } }),
    prisma.hospiceNursingAssessment.count({ where: { createdBy: id } }),
    prisma.hospiceNursingAssessment.count({ where: { assessedByStaffId: id } }),
  ]);

  return {
    staff: {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      status: staff.status,
    },
    totals: {
      patientsRegistered,
      visits: {
        created: visitsCreated,
        asTeamLeader: visitsAsTeamLeader,
        signedAsMember: visitsSigned,
        total: visitsCreated + visitsSigned, // created is auto-signed, so signature count + created ≈ involvement
      },
      medications: { prescribed: medicationsPrescribed },
      labs: { ordered: labsOrdered },
      imaging: { ordered: imagingOrdered },
      referrals: { requested: referralsRequested },
      admissions: { created: admissionsCreated },
      discharges: { created: dischargesCreated },
      progressNotes: {
        created: progressNotesCreated,
        asResponsibleClinician: progressNotesAsResponsible,
        signedAsMember: progressNotesSigned,
      },
      hospiceNursing: {
        created: hospiceCreated,
        asAssessor: hospiceAssessed,
      },
    },
  };
};

// ═════════════════════════════════════════════════════════════
// DETAIL — full lists (paginated, per category)
//
// The caller decides which categories to fetch by passing the
// `category` string. Each returns a paginated list.
// ═════════════════════════════════════════════════════════════

export type ContributionCategory =
  | 'visits'
  | 'progress-notes'
  | 'hospice-nursing'
  | 'labs'
  | 'imaging'
  | 'medications'
  | 'referrals'
  | 'admissions'
  | 'discharges'
  | 'patients';

export const getStaffContributionDetail = async (
  staffId: string,
  category: ContributionCategory,
  page: number = 1,
  limit: number = 20,
) => {
  const id = toId(staffId, 'staff id');

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const skip = (page - 1) * limit;

  switch (category) {
    // ─────────────────────────────────────────────────────
    // Home visits — created OR signed, with signature roles
    // ─────────────────────────────────────────────────────
    case 'visits': {
      const where = {
        OR: [
          { createdBy: id },
          { signatures: { some: { staffId: id } } },
        ],
      };
      const [items, total] = await Promise.all([
        prisma.homeVisit.findMany({
          where,
          orderBy: { visitDate: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            signatures: true,
          },
        }),
        prisma.homeVisit.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((v) => {
          const signature = v.signatures.find((s) => s.staffId === id);
          const isTeamLeader =
            signature?.isTeamLeader ?? v.createdBy === id;
          return {
            id: v.id,
            patientId: v.patient.id,
            patientName: `${v.patient.firstName} ${v.patient.lastName}`,
            visitDate: v.visitDate,
            visitType: v.visitType,
            overallStatus: v.overallStatus,
            outcome: v.outcome,
            relationship: isTeamLeader ? 'TeamLeader' : signature?.role ?? 'Creator',
            signedAt: signature?.signedAt ?? null,
          };
        }),
      };
    }

    // ─────────────────────────────────────────────────────
    // Progress notes — created OR responsible OR signed
    // ─────────────────────────────────────────────────────
    case 'progress-notes': {
      const where = {
        OR: [
          { createdBy: id },
          { responsibleClinicianId: id },
          { signatures: { some: { staffId: id } } },
        ],
      };
      const [items, total] = await Promise.all([
        prisma.patientProgressNote.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            admission: { select: { id: true, ward: true, bedNumber: true } },
            signatures: true,
          },
        }),
        prisma.patientProgressNote.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((n) => {
          const signature = n.signatures.find((s) => s.staffId === id);
          const relationship = n.createdBy === id
            ? 'Creator'
            : n.responsibleClinicianId === id
              ? 'ResponsibleClinician'
              : (signature?.role ?? 'Signer');
          return {
            id: n.id,
            patientId: n.patient.id,
            patientName: `${n.patient.firstName} ${n.patient.lastName}`,
            ward: n.admission?.ward ?? null,
            bedNumber: n.admission?.bedNumber ?? null,
            attendingClinician: n.attendingClinician,
            generalCondition: n.generalCondition,
            overallAssessment: n.overallAssessment,
            relationship,
            signedAt: signature?.signedAt ?? null,
            createdAt: n.createdAt,
          };
        }),
      };
    }

    // ─────────────────────────────────────────────────────
    // Hospice nursing assessments — created OR assessed
    // ─────────────────────────────────────────────────────
    case 'hospice-nursing': {
      const where = {
        OR: [
          { createdBy: id },
          { assessedByStaffId: id },
        ],
      };
      const [items, total] = await Promise.all([
        prisma.hospiceNursingAssessment.findMany({
          where,
          orderBy: { assessmentDate: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.hospiceNursingAssessment.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((a) => ({
          id: a.id,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentDate: a.assessmentDate,
          levelOfConsciousness: a.levelOfConsciousness,
          painScore: a.painScore,
          mobilityStatus: a.mobilityStatus,
          emotionalStatus: a.emotionalStatus,
          nurseSummary: a.nurseSummary,
          relationship:
            a.createdBy === id
              ? 'Creator'
              : a.assessedByStaffId === id
                ? 'Assessor'
                : 'Unknown',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Laboratory tests ordered
    // ─────────────────────────────────────────────────────
    case 'labs': {
      const where = { orderedBy: id };
      const [items, total] = await Promise.all([
        prisma.laboratoryTest.findMany({
          where,
          orderBy: { dateOrdered: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.laboratoryTest.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((l) => ({
          id: l.id,
          patientId: l.patient.id,
          patientName: `${l.patient.firstName} ${l.patient.lastName}`,
          testName: l.testName,
          category: l.category,
          priority: l.priority,
          status: l.status,
          dateOrdered: l.dateOrdered,
          datePerformed: l.datePerformed,
          result: l.result,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Imaging orders
    // ─────────────────────────────────────────────────────
    case 'imaging': {
      const where = { orderedBy: id };
      const [items, total] = await Promise.all([
        prisma.imagingOrder.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.imagingOrder.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((o) => ({
          id: o.id,
          patientId: o.patient.id,
          patientName: `${o.patient.firstName} ${o.patient.lastName}`,
          modality: o.modality,
          bodyRegion: o.bodyRegion,
          laterality: o.laterality,
          priority: o.priority,
          status: o.status,
          hasReport: !!(o.findings || o.impression),
          findings: o.findings,
          impression: o.impression,
          recommendation: o.recommendation,
          reportDate: o.reportDate,
          radiologistName: o.radiologistName,
          technologistName: o.technologistName,
          dateOrdered: o.createdAt,
          performedAt: o.performedAt,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Medications prescribed
    // ─────────────────────────────────────────────────────
    case 'medications': {
      const where = { prescribedBy: id };
      const [items, total] = await Promise.all([
        prisma.medication.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.medication.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((m) => ({
          id: m.id,
          patientId: m.patient.id,
          patientName: `${m.patient.firstName} ${m.patient.lastName}`,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route,
          administeredAt: m.administeredAt,
          status: m.status,
          createdAt: m.createdAt,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Referrals requested
    // ─────────────────────────────────────────────────────
    case 'referrals': {
      const where = { requestedBy: id };
      const [items, total] = await Promise.all([
        prisma.referral.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.referral.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((r) => ({
          id: r.id,
          patientId: r.patient.id,
          patientName: `${r.patient.firstName} ${r.patient.lastName}`,
          referralType: r.referralType,
          referralDate: r.referralDate,
          primaryDiagnosis: r.primaryDiagnosis,
          receivingFacility: r.receivingFacility,
          status: r.status,
          actionTaken: r.actionTaken,
          createdAt: r.createdAt,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Admissions created
    // ─────────────────────────────────────────────────────
    case 'admissions': {
      const where = { createdBy: id };
      const [items, total] = await Promise.all([
        prisma.hospitalAdmission.findMany({
          where,
          orderBy: { admissionDate: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.hospitalAdmission.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((a) => ({
          id: a.id,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          admissionDate: a.admissionDate,
          dischargeDate: a.dischargeDate,
          ward: a.ward,
          bedNumber: a.bedNumber,
          admittingPhysician: a.admittingPhysician,
          status: a.status,
          dischargeReason: a.dischargeReason,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Discharge summaries created
    // ─────────────────────────────────────────────────────
    case 'discharges': {
      const where = { createdBy: id };
      const [items, total] = await Promise.all([
        prisma.dischargeSummary.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.dischargeSummary.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items: items.map((d) => ({
          id: d.id,
          patientId: d.patient.id,
          patientName: `${d.patient.firstName} ${d.patient.lastName}`,
          dateOfDischarge: d.dateOfDischarge,
          timeOfDischarge: d.timeOfDischarge,
          dischargeType: d.dischargeType,
          overallCondition: d.overallCondition,
          dischargedTo: d.dischargedTo,
          status: d.status,
          createdAt: d.createdAt,
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Patients registered
    // ─────────────────────────────────────────────────────
    case 'patients': {
      const where = { registeredBy: id };
      const [items, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            age: true,
            sex: true,
            status: true,
            currentLocation: true,
            primaryDiagnosis: true,
            createdAt: true,
          },
        }),
        prisma.patient.count({ where }),
      ]);
      return {
        category,
        staff,
        page,
        limit,
        total,
        items,
      };
    }

    default:
      throw new ApiError(400, `Unknown category: ${category}`);
  }
};

export default {
  getStaffContributionSummary,
  getStaffContributionDetail,
};