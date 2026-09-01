import { Staff } from '@models/Staff.js';
import { HomeVisit } from '@models/HomeVisit.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { ApiError } from '@utils/ApiError.js';

export const getDashboardStats = async (staffId: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's visits
  const todayVisits = await HomeVisit.countDocuments({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
    visitDate: { $gte: today, $lt: tomorrow },
  });

  // Get assigned patients (patients visited by this staff)
  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
  });

  const totalPatients = patientIds.length;

  const activePatients = await Patient.countDocuments({
    _id: { $in: patientIds },
    status: 'Active',
  });

  // Get recent visits
  const recentVisits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
  })
    .sort({ visitDate: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName');

  // Get assigned patients with last visit date
  const assignedPatients = await Patient.find({
    _id: { $in: patientIds },
  }).select('patientDisplayId firstName lastName age sex status currentLocation primaryDiagnosis');

  const patientsWithLastVisit = await Promise.all(
    assignedPatients.map(async (patient) => {
      const lastVisit = await HomeVisit.findOne({
        patientId: patient._id,
        $or: [
          { teamLeaderId: staffId },
          { physicianId: staffId },
          { nurseId: staffId },
        ],
      })
        .sort({ visitDate: -1 })
        .select('visitDate');

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
      };
    })
  );

  // Get upcoming visits (next 7 days)
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingVisits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
    nextVisitDate: { $gte: today, $lte: sevenDaysFromNow },
  }).populate('patientId', 'firstName lastName');

  // Get alerts
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

const getAlertsForStaff = async (staffId: string) => {
  const alerts: any[] = [];

  // Get patient IDs assigned to this staff
  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
  });

  // Check for red flags in recent visits
  const recentVisitsWithRedFlags = await HomeVisit.find({
    patientId: { $in: patientIds },
    redFlags: { $ne: [] },
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

  // Check for pending referrals
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

  // Check for overdue visits (7+ days since last visit)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const overduePatients = await Patient.find({
    _id: { $in: patientIds },
    status: 'Active',
  });

  for (const patient of overduePatients) {
    const lastVisit = await HomeVisit.findOne({
      patientId: patient._id,
      $or: [
        { teamLeaderId: staffId },
        { physicianId: staffId },
        { nurseId: staffId },
      ],
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

  return alerts;
};

export const getVisitedPatients = async (staffId: string, page: number = 1, limit: number = 20, status?: string, search?: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const patientIds = await HomeVisit.distinct('patientId', {
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
  });

  const filter: any = {
    _id: { $in: patientIds },
  };

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

  const itemsWithLastVisit = await Promise.all(
    items.map(async (patient) => {
      const lastVisit = await HomeVisit.findOne({
        patientId: patient._id,
        $or: [
          { teamLeaderId: staffId },
          { physicianId: staffId },
          { nurseId: staffId },
        ],
      })
        .sort({ visitDate: -1 })
        .select('visitDate');

      const nextVisit = await HomeVisit.findOne({
        patientId: patient._id,
        $or: [
          { teamLeaderId: staffId },
          { physicianId: staffId },
          { nurseId: staffId },
        ],
        nextVisitDate: { $gte: new Date() },
      })
        .sort({ nextVisitDate: 1 })
        .select('nextVisitDate');

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
        nextVisitDate: nextVisit?.nextVisitDate,
      };
    })
  );

  return {
    items: itemsWithLastVisit,
    page,
    limit,
    total,
  };
};

export const getUpcomingVisits = async (staffId: string, days: number = 7, limit: number = 20) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  const visits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
    nextVisitDate: { $gte: today, $lte: endDate },
  })
    .sort({ nextVisitDate: 1 })
    .limit(limit)
    .populate('patientId', 'firstName lastName');

  return {
    items: visits.map((v) => ({
      id: v._id.toString(),
      patientId: (v.patientId as any)._id.toString(),
      patientName: `${(v.patientId as any).firstName} ${(v.patientId as any).lastName}`,
      scheduledDate: v.nextVisitDate,
      visitType: v.visitType,
      priority: v.redFlags && v.redFlags.length > 0 ? 'High' : 'Normal',
    })),
    total: visits.length,
  };
};

export const getRecentVisits = async (staffId: string, days: number = 7, limit: number = 20) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const visits = await HomeVisit.find({
    $or: [
      { teamLeaderId: staffId },
      { physicianId: staffId },
      { nurseId: staffId },
    ],
    visitDate: { $gte: startDate },
  })
    .sort({ visitDate: -1 })
    .limit(limit)
    .populate('patientId', 'firstName lastName');

  return {
    items: visits.map((v) => ({
      id: v._id.toString(),
      patientId: (v.patientId as any)._id.toString(),
      patientName: `${(v.patientId as any).firstName} ${(v.patientId as any).lastName}`,
      visitDate: v.visitDate,
      visitType: v.visitType,
      outcome: v.outcome,
      notes: v.redFlagActions || '',
    })),
    total: visits.length,
  };
};

export const getAlerts = async (staffId: string, read?: string, type?: string, limit: number = 20) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  let alerts = await getAlertsForStaff(staffId);

  if (read !== undefined) {
    alerts = alerts.filter((a) => a.read === (read === 'true'));
  }

  if (type) {
    alerts = alerts.filter((a) => a.type === type);
  }

  const total = alerts.length;
  const unreadCount = alerts.filter((a) => !a.read).length;
  const items = alerts.slice(0, limit);

  return {
    items,
    unreadCount,
    total,
  };
};

export const markAlertRead = async (alertId: string, staffId: string) => {
  // This is a simplified version - in production, you would have an Alert model
  // For now, we'll just return a success response
  // The alert IDs are generated dynamically, so we can't persist read status without a model
  return {
    id: alertId,
    read: true,
  };
};

export default {
  getDashboardStats,
  getVisitedPatients,
  getUpcomingVisits,
  getRecentVisits,
  getAlerts,
  markAlertRead,
};