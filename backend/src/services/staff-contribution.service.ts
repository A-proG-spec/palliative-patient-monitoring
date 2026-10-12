import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';

// ═════════════════════════════════════════════════════════════
// SUMMARY — counts only (fast)
//
// Answers "how much has this staff contributed" across every
// model that has an FK pointing at Staff.id.
// ═════════════════════════════════════════════════════════════
export const getStaffContributionSummary = async (staffId) => {
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
    medicationsGiven,
    labsOrdered,
    labsCompleted,
    imagingOrdered,
    imagingCompleted,
    referralsRequested,
    admissionsCreated,
    dischargesCreated,
    progressNotesCreated,
    progressNotesAsResponsible,
    progressNotesSigned,
    hospiceCreated,
    hospiceAssessed,
    // ── Assessment authors ──
    painAssessmentsCreated,
    pharmacistAssessmentsCreated,
    physiotherapyAssessmentsCreated,
    familyAssessmentsCreated,
    nutritionalAssessmentsCreated,
    socialAssessmentsCreated,
    spiritualAssessmentsCreated,
    psychiatryAssessmentsCreated,
  ] = await Promise.all([
    prisma.patient.count({ where: { registeredBy: id } }),
    prisma.homeVisit.count({ where: { createdBy: id } }),
    prisma.homeVisitSignature.count({ where: { staffId: id, isTeamLeader: true } }),
    prisma.homeVisitSignature.count({ where: { staffId: id, isTeamLeader: false } }),

    prisma.medication.count({ where: { prescribedBy: id } }),
    // Pharmacists mark medications as given.
    // Adjust the field name to match your model (administeredBy? givenBy?).
    prisma.medication.count({ where: { administeredBy: id } }),

    prisma.laboratoryTest.count({ where: { orderedBy: id } }),
    // Lab techs enter results.
    prisma.laboratoryTest.count({ where: { performedBy: id } }),

    prisma.imagingOrder.count({ where: { orderedBy: id } }),
    // Radiologists record exam-performed. If you track it via a
    // dedicated field, use that; if it's just `radiologistName` as a
    // string, use `{ radiologistName: staff.name }` — but the FK
    // approach is cleaner.
    prisma.imagingOrder.count({ where: { performedBy: id } }),

    prisma.referral.count({ where: { requestedBy: id } }),
    prisma.hospitalAdmission.count({ where: { createdBy: id } }),
    prisma.dischargeSummary.count({ where: { createdBy: id } }),

    prisma.patientProgressNote.count({ where: { createdBy: id } }),
    prisma.patientProgressNote.count({ where: { responsibleClinicianId: id } }),
    prisma.progressNoteSignature.count({ where: { staffId: id } }),

    prisma.hospiceNursingAssessment.count({ where: { createdBy: id } }),
    prisma.hospiceNursingAssessment.count({ where: { assessedByStaffId: id } }),

    // ── Assessments — every model uses `createdByStaffId` or `createdBy`.
    // Match whatever FK your Prisma schema defines. The examples below
    // assume `createdByStaffId`. If it's `createdBy`, swap it in.
    prisma.painAssessment.count({ where: { createdByStaffId: id } }),
    prisma.pharmacistAssessment.count({ where: { createdByStaffId: id } }),
    prisma.physiotherapyAssessment.count({ where: { createdByStaffId: id } }),
    prisma.familyAssessment.count({ where: { createdByStaffId: id } }),
    prisma.nutritionalAssessment.count({ where: { createdByStaffId: id } }),
    prisma.socialAssessment.count({ where: { createdByStaffId: id } }),
    prisma.spiritualAssessment.count({ where: { createdByStaffId: id } }),
    prisma.psychiatryAssessment.count({ where: { createdByStaffId: id } }),
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
        total: visitsCreated + visitsSigned,
      },

      medications: {
        prescribed: medicationsPrescribed,
        given: medicationsGiven,
      },

      labs: {
        ordered: labsOrdered,
        completed: labsCompleted,
      },

      imaging: {
        ordered: imagingOrdered,
        completed: imagingCompleted,
      },

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

      assessments: {
        pain: painAssessmentsCreated,
        pharmacist: pharmacistAssessmentsCreated,
        physiotherapy: physiotherapyAssessmentsCreated,
        family: familyAssessmentsCreated,
        nutritional: nutritionalAssessmentsCreated,
        social: socialAssessmentsCreated,
        spiritual: spiritualAssessmentsCreated,
        psychiatry: psychiatryAssessmentsCreated,
      },
    },
  };
};

// ═════════════════════════════════════════════════════════════
// DETAIL — full lists (paginated, per category)
// ═════════════════════════════════════════════════════════════

export type ContributionCategory =
  | 'visits'
  | 'progress-notes'
  | 'hospice-nursing'
  | 'labs'
  | 'labs-completed'
  | 'imaging'
  | 'imaging-completed'
  | 'medications'
  | 'medications-given'
  | 'referrals'
  | 'admissions'
  | 'discharges'
  | 'patients'
  // Assessments — one category each
  | 'pain-assessments'
  | 'pharmacist-assessments'
  | 'physiotherapy-assessments'
  | 'family-assessments'
  | 'nutritional-assessments'
  | 'social-assessments'
  | 'spiritual-assessments'
  | 'psychiatry-assessments';

const getEnteredBy = (createdByAdmin, createdByStaff) => {
  if (createdByAdmin) {
    return { id: createdByAdmin.id, name: createdByAdmin.name, type: 'admin' };
  }
  if (createdByStaff) {
    return { id: createdByStaff.id, name: createdByStaff.name, type: 'staff' };
  }
  return null;
};

/**
 * Reusable helper — one assessment category.
 * All 8 assessments share the same shape: a patient, a type,
 * a created-at, and some list items.
 */
const buildAssessmentDetail = async ({
  staffId,
  category,
  model,
  orderByField,
  page,
  limit,
  itemMapper,
}) => {
  const skip = (page - 1) * limit;
  const where = { createdByStaffId: staffId };

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      orderBy: { [orderByField]: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    model.count({ where }),
  ]);

  return {
    category,
    page,
    limit,
    total,
    items: items.map((row) =>
      itemMapper(row, getEnteredBy(row.createdByAdmin, row.createdByStaff)),
    ),
  };
};

export const getStaffContributionDetail = async (
  staffId,
  category,
  page = 1,
  limit = 20,
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
    // Home visits
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
            createdByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
            enteredBy: getEnteredBy(v.createdByAdmin, v.createdByStaff),
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
    // Progress notes
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
            createdByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
            enteredBy: getEnteredBy(n.createdByAdmin, n.createdByStaff),
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
    // Hospice nursing
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
            createdByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(a.createdByAdmin, a.createdByStaff),
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
    // Lab tests — ORDERED (Physicians / Nurses)
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
            orderedByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(l.createdByAdmin, l.orderedByStaff),
          patientId: l.patient.id,
          patientName: `${l.patient.firstName} ${l.patient.lastName}`,
          testName: l.testName,
          category: l.category,
          priority: l.priority,
          status: l.status,
          dateOrdered: l.dateOrdered,
          datePerformed: l.datePerformed,
          result: l.result,
          relationship: 'OrderedBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Lab tests — COMPLETED (Lab Technicians)
    // ─────────────────────────────────────────────────────
    case 'labs-completed': {
      const where = { performedBy: id };
      const [items, total] = await Promise.all([
        prisma.laboratoryTest.findMany({
          where,
          orderBy: { datePerformed: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            orderedByStaff: { select: { id: true, name: true } },
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
          orderedBy: l.orderedByStaff
            ? { id: l.orderedByStaff.id, name: l.orderedByStaff.name }
            : null,
          relationship: 'PerformedBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Imaging — ORDERED (Physicians / Nurses)
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
            orderedByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(o.createdByAdmin, o.orderedByStaff),
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
          relationship: 'OrderedBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Imaging — COMPLETED (Radiologists)
    // ─────────────────────────────────────────────────────
    case 'imaging-completed': {
      const where = { performedBy: id };
      const [items, total] = await Promise.all([
        prisma.imagingOrder.findMany({
          where,
          orderBy: { performedAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            orderedByStaff: { select: { id: true, name: true } },
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
          orderedBy: o.orderedByStaff
            ? { id: o.orderedByStaff.id, name: o.orderedByStaff.name }
            : null,
          relationship: 'PerformedBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Medications — PRESCRIBED (Physicians / Nurses)
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
            prescribedByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(m.createdByAdmin, m.prescribedByStaff),
          patientId: m.patient.id,
          patientName: `${m.patient.firstName} ${m.patient.lastName}`,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route,
          administeredAt: m.administeredAt,
          status: m.status,
          createdAt: m.createdAt,
          relationship: 'PrescribedBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Medications — GIVEN (Pharmacists)
    // ─────────────────────────────────────────────────────
    case 'medications-given': {
      const where = { administeredBy: id };
      const [items, total] = await Promise.all([
        prisma.medication.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            prescribedByStaff: { select: { id: true, name: true } },
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
          prescribedBy: m.prescribedByStaff
            ? { id: m.prescribedByStaff.id, name: m.prescribedByStaff.name }
            : null,
          relationship: 'AdministeredBy',
        })),
      };
    }

    // ─────────────────────────────────────────────────────
    // Referrals
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
            requestedByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(r.createdByAdmin, r.requestedByStaff),
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
    // Admissions
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
            createdByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(a.createdByAdmin, a.createdByStaff),
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
    // Discharge summaries
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
            createdByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
          enteredBy: getEnteredBy(d.createdByAdmin, d.createdByStaff),
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
            registeredByStaff: { select: { id: true, name: true } },
            createdByAdmin: { select: { id: true, name: true } },
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
        items: items.map((patient) => ({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: patient.age,
          sex: patient.sex,
          status: patient.status,
          currentLocation: patient.currentLocation,
          primaryDiagnosis: patient.primaryDiagnosis,
          createdAt: patient.createdAt,
          enteredBy: getEnteredBy(patient.createdByAdmin, patient.registeredByStaff),
        })),
      };
    }

    // ═════════════════════════════════════════════════════
    // ASSESSMENTS — one case each
    // ═════════════════════════════════════════════════════

    case 'pain-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.painAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          currentPainScore: a.currentPainScore,
          painType: a.painType,
          diagnosis: a.diagnosis,
          assessmentOutcome: a.assessmentOutcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'pharmacist-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.pharmacistAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          painControl: a.painControl,
          pharmacistSummary: a.pharmacistSummary,
          summaryFlags: a.summaryFlags,
          finalRecommendations: a.finalRecommendations,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'physiotherapy-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.physiotherapyAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          generalCondition: a.generalCondition,
          mobilityStatus: a.mobilityStatus,
          fallRiskLevel: a.fallRiskLevel,
          diagnosis: a.diagnosis,
          outcome: a.outcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'family-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.familyAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          burdenLevel: a.burdenLevel,
          palliativeCareAcceptance: a.palliativeCareAcceptance,
          assessorName: a.assessorName,
          assessmentOutcome: a.assessmentOutcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'nutritional-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.nutritionalAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          bmi: a.bmi,
          nutritionalStatusClassification: a.nutritionalStatusClassification,
          overallNutritionalRisk: a.overallNutritionalRisk,
          currentAppetite: a.currentAppetite,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'social-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.socialAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          livingArrangement: a.livingArrangement,
          isolationRisk: a.isolationRisk,
          financialRiskLevel: a.financialRiskLevel,
          bereavementRisk: a.bereavementRisk,
          assessmentOutcome: a.assessmentOutcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'spiritual-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.spiritualAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          religiousAffiliation: a.religiousAffiliation,
          spiritualDistressLevel: a.spiritualDistressLevel,
          feelsAtPeace: a.feelsAtPeace,
          assessmentOutcome: a.assessmentOutcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    case 'psychiatry-assessments': {
      const result = await buildAssessmentDetail({
        staffId: id,
        category,
        model: prisma.psychiatryAssessment,
        orderByField: 'createdAt',
        page,
        limit,
        itemMapper: (a, enteredBy) => ({
          id: a.id,
          enteredBy,
          patientId: a.patient.id,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          assessmentType: a.assessmentType,
          severity: a.severity,
          suicidalIdeation: a.suicidalIdeation,
          suicideRiskLevel: a.suicideRiskLevel,
          diagnoses: a.diagnoses,
          assessmentOutcome: a.assessmentOutcome,
          createdAt: a.createdAt,
        }),
      });
      return { ...result, staff };
    }

    default:
      throw new ApiError(400, `Unknown category: ${category}`);
  }
};

export default {
  getStaffContributionSummary,
  getStaffContributionDetail,
};