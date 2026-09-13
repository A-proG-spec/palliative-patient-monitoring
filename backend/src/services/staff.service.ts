import { Staff } from '@models/Staff.js';
import { HomeVisit } from '@models/HomeVisit.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { ImagingOrder } from '@models/ImagingOrder.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
export const getDashboardStats = async (staffId: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayVisits = await HomeVisit.countDocuments({
    $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
    visitDate: { $gte: today, $lt: tomorrow },
  });

  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
  });

  const totalPatients = patientIds.length;
  const activePatients = await Patient.countDocuments({
    _id: { $in: patientIds },
    status: 'Active',
  });

  const recentVisits = await HomeVisit.find({
    $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
  })
    .sort({ visitDate: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName');

  const assignedPatients = await Patient.find({ _id: { $in: patientIds } })
    .select('patientDisplayId firstName lastName age sex status currentLocation primaryDiagnosis');

  const patientsWithLastVisit = await Promise.all(
    assignedPatients.map(async (patient) => {
      const lastVisit = await HomeVisit.findOne({
        patientId: patient._id,
        $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
      })
        .sort({ visitDate: -1 })
        .select('visitDate');

      const activeAdmission = await HospitalAdmission.findOne({
        patientId: patient._id,
        status: 'Active',
      }).select('_id');

      return {
        id: patient._id.toString(),
        patientDisplayId: patient.patientDisplayId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: patient.age,
        sex: patient.sex,
        status: patient.status,
        currentLocation: patient.currentLocation,
        primaryDiagnosis: patient.primaryDiagnosis,
        lastVisitDate: lastVisit?.visitDate,
        activeAdmissionId: activeAdmission?._id?.toString(),
      };
    })
  );

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingVisits = await HomeVisit.find({
    $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
    nextVisitDate: { $gte: today, $lte: sevenDaysFromNow },
  }).populate('patientId', 'firstName lastName');

  const alerts = await getAlertsForStaff(staffId);

  return {
    todayVisits,
    totalPatients,
    activePatients,
    pendingTasks: alerts.filter((a) => !a.read).length,
    recentVisits: recentVisits.map((v) => ({
      id: v._id.toString(),
      patientId: (v.patientId as any)._id.toString(),
      patientName: `${(v.patientId as any).firstName} ${(v.patientId as any).lastName}`,
      visitDate: v.visitDate,
      outcome: v.outcome,
    })),
    assignedPatients: patientsWithLastVisit,
    upcomingVisits: upcomingVisits.map((v) => ({
      id: v._id.toString(),
      patientId: (v.patientId as any)._id.toString(),
      patientName: `${(v.patientId as any).firstName} ${(v.patientId as any).lastName}`,
      scheduledDate: v.nextVisitDate,
      visitType: v.visitType,
    })),
    alerts,
  };
};

// ─────────────────────────────────────────────────────────────
// Alerts — extended with new sources
// ─────────────────────────────────────────────────────────────
const getAlertsForStaff = async (staffId: string) => {
  const alerts: any[] = [];

  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
  });

  // 1. Red-flag visits
  const recentVisitsWithRedFlags = await HomeVisit.find({
    patientId: { $in: patientIds },
    redFlags: { $ne: [], $nin: [['None']] },
  })
    .sort({ visitDate: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName');

  for (const visit of recentVisitsWithRedFlags) {
    alerts.push({
      id: `rf_${visit._id}`,
      type: 'RedFlag',
      message: `Red flags reported for ${(visit.patientId as any).firstName} ${(visit.patientId as any).lastName}`,
      patientId: (visit.patientId as any)._id.toString(),
      patientName: `${(visit.patientId as any).firstName} ${(visit.patientId as any).lastName}`,
      read: false,
      createdAt: visit.createdAt,
    });
  }

  // 2. Pending referrals
  const pendingReferrals = await Referral.find({
    patientId: { $in: patientIds },
    status: 'Pending',
  }).populate('patientId', 'firstName lastName');

  for (const referral of pendingReferrals) {
    alerts.push({
      id: `ref_${referral._id}`,
      type: 'ReferralPending',
      message: `Referral pending for ${(referral.patientId as any).firstName} ${(referral.patientId as any).lastName}`,
      patientId: (referral.patientId as any)._id.toString(),
      patientName: `${(referral.patientId as any).firstName} ${(referral.patientId as any).lastName}`,
      read: false,
      createdAt: referral.createdAt,
    });
  }

  // 3. Overdue visits (7+ days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const overduePatients = await Patient.find({
    _id: { $in: patientIds },
    status: 'Active',
  });

  for (const patient of overduePatients) {
    const lastVisit = await HomeVisit.findOne({
      patientId: patient._id,
      $or: [{ teamLeaderId: staffId }, { physicianId: staffId }, { nurseId: staffId }],
    }).sort({ visitDate: -1 });

    if (lastVisit && lastVisit.visitDate < sevenDaysAgo) {
      alerts.push({
        id: `ov_${patient._id}`,
        type: 'VisitOverdue',
        message: `Visit overdue for ${patient.firstName} ${patient.lastName}`,
        patientId: patient._id.toString(),
        patientName: `${patient.firstName} ${patient.lastName}`,
        read: false,
        createdAt: new Date(),
      });
    }
  }

  // 4. NEW — Critical progress notes for hospitalised patients
  const activeAdmissions = await HospitalAdmission.find({
    patientId: { $in: patientIds },
    status: 'Active',
  }).select('_id patientId');

  const admissionIds = activeAdmissions.map((a) => a._id);

  const criticalNotes = await PatientProgressNote.find({
    admissionId: { $in: admissionIds },
    generalCondition: { $in: ['Critical', 'ActivelyDying'] },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  for (const note of criticalNotes) {
    const admission = activeAdmissions.find(
      (a) => a._id.toString() === note.admissionId?.toString()
    );
    if (!admission) continue;

    const patient = await Patient.findById(admission.patientId).select('firstName lastName');
    if (!patient) continue;

    alerts.push({
      id: `crit_${note._id}`,
      type: 'RedFlag',
      message: `Critical condition reported for ${patient.firstName} ${patient.lastName}`,
      patientId: patient._id.toString(),
      patientName: `${patient.firstName} ${patient.lastName}`,
      read: false,
      createdAt: note.createdAt,
    });
  }

  // 5. NEW — Imaging orders pending report for > 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const pendingImaging = await ImagingOrder.find({
    patientId: { $in: patientIds },
    status: 'Ordered',
    createdAt: { $lt: threeDaysAgo },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName');

  for (const order of pendingImaging) {
    const p = order.patientId as any;
    alerts.push({
      id: `img_${order._id}`,
      type: 'ReferralPending',
      message: `Imaging report pending for ${p.firstName} ${p.lastName} (${order.modality})`,
      patientId: p._id.toString(),
      patientName: `${p.firstName} ${p.lastName}`,
      read: false,
      createdAt: order.createdAt,
    });
  }

  return alerts;
};

// ─────────────────────────────────────────────────────────────
// getVisitedPatients / getUpcomingVisits / getRecentVisits — unchanged
// (copied from your existing file, no changes required)
// ─────────────────────────────────────────────────────────────
export const getVisitedPatients = async (
  staffId: string,
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
) => {
  // ... keep your existing implementation ...
};

export const getUpcomingVisits = async (
  staffId: string,
  days: number = 7,
  limit: number = 20
) => {
  // ... keep your existing implementation ...
};

export const getRecentVisits = async (
  staffId: string,
  days: number = 7,
  limit: number = 20
) => {
  // ... keep your existing implementation ...
};

export const getAlerts = async (
  staffId: string,
  read?: string,
  type?: string,
  limit: number = 20
) => {
  let alerts = await getAlertsForStaff(staffId);
  if (read !== undefined) alerts = alerts.filter((a) => a.read === (read === 'true'));
  if (type) alerts = alerts.filter((a) => a.type === type);
  const total = alerts.length;
  const unreadCount = alerts.filter((a) => !a.read).length;
  return { items: alerts.slice(0, limit), unreadCount, total };
};

export const markAlertRead = async (alertId: string, staffId: string) => {
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