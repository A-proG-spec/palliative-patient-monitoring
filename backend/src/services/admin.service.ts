import { Staff } from '@models/Staff.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { Notification } from '@models/Notification.js';
import { HomeVisit } from '@models/HomeVisit.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Medication } from '@models/Medication.js';
import { LaboratoryTest } from '@models/LaboratoryTest.js';
import { ImagingOrder } from '@models/ImagingOrder.js';
import { PatientProgressNote } from '@models/PatientProgressNote.js';
import { DischargeSummary } from '@models/DischargeSummary.js';
import { ApiError } from '@utils/ApiError.js';

// ═════════════════════════════════════════════════════════════
// STAFF MANAGEMENT
// ═════════════════════════════════════════════════════════════

export const getPendingStaff = async () => {
  const pendingStaff = await Staff.find({
    status: 'Pending',
    isEmailVerified: true,
  }).select('-password');

  return pendingStaff.map((staff) => ({
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    status: staff.status,
    createdAt: staff.createdAt,
  }));
};

export const approveStaff = async (staffId: string, role: string, adminId: string) => {
  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  if (!['TeamLeader', 'Physician', 'Nurse'].includes(role)) {
    throw new ApiError(400, 'Invalid role specified');
  }

  if (staff.status === 'Active') {
    throw new ApiError(400, 'Staff member is already approved');
  }

  if (!staff.isEmailVerified) {
    throw new ApiError(400, 'Staff email is not verified');
  }

  staff.role = role as 'TeamLeader' | 'Physician' | 'Nurse';
  staff.status = 'Active';
  staff.assignedBy = adminId as any;
  await staff.save();

  await Notification.deleteOne({
    type: 'StaffApproval',
    'data.staffId': staffId,
  });

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    status: staff.status,
    assignedBy: {
      id: adminId,
      name: 'Admin',
    },
    updatedAt: staff.updatedAt,
  };
};

export const rejectStaff = async (staffId: string) => {
  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  if (staff.status === 'Active') {
    throw new ApiError(400, 'Staff member is already approved');
  }

  staff.status = 'Rejected';
  await staff.save();

  await Notification.deleteOne({
    type: 'StaffApproval',
    'data.staffId': staffId,
  });

  return {
    id: staff._id.toString(),
    status: staff.status,
  };
};

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════

export const getDashboardStats = async () => {
  const [
    totalPatients,
    activePatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
  ] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ status: 'Active' }),
    Patient.countDocuments({ status: 'Discharged' }),
    Referral.countDocuments({ status: 'Pending' }),
    Staff.countDocuments({ status: 'Pending', isEmailVerified: true }),
  ]);

  const hospitalizedPatients = await Patient.countDocuments({
    currentLocation: 'ReferredHospital',
  });

  const patientsByStatus = await Patient.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const recentReferrals = await Referral.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName');

  const recentVisits = await HomeVisit.find()
    .sort({ visitDate: -1 })
    .limit(5)
    .populate('patientId', 'firstName lastName')
    .populate('teamLeaderId', 'name');

  const staffApprovals = await Notification.countDocuments({
    type: 'StaffApproval',
    read: false,
  });

  const pendingReferralsCount = await Referral.countDocuments({ status: 'Pending' });

  const recentCloseCases = await Notification.countDocuments({
    type: 'CloseCase',
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  return {
    totalPatients,
    activePatients,
    hospitalizedPatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
    notifications: {
      staffApprovals,
      pendingReferrals: pendingReferralsCount,
      recentCloseCases,
    },
    patientsByStatus,
    recentReferrals: recentReferrals.map((r) => ({
      id: r._id.toString(),
      patientName: `${(r.patientId as any).firstName} ${(r.patientId as any).lastName}`,
      date: r.createdAt,
      status: r.status,
    })),
    recentVisits: recentVisits.map((v) => ({
      patientName: `${(v.patientId as any).firstName} ${(v.patientId as any).lastName}`,
      date: v.visitDate,
      staff: (v.teamLeaderId as any)?.name || 'Unknown',
    })),
  };
};

// ═════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════

export const getNotifications = async (limit: number = 20, read?: string) => {
  const filter: any = {};
  if (read !== undefined) {
    filter.read = read === 'true';
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ read: false });
  const totalCount = await Notification.countDocuments();

  return {
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      message: n.message,
      data: n.data,
      read: n.read,
      createdAt: n.createdAt,
    })),
    unreadCount,
    totalCount,
  };
};

export const markNotificationRead = async (notificationId: string) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.read = true;
  await notification.save();

  return {
    id: notification._id.toString(),
    read: notification.read,
  };
};

// ═════════════════════════════════════════════════════════════
// PATIENT MANAGEMENT
// ═════════════════════════════════════════════════════════════

export const getPatients = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
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
    Patient.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('registeredBy', 'name'),
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
      registeredBy: {
        id: (patient.registeredBy as any)?._id?.toString() || '',
        name: (patient.registeredBy as any)?.name || 'Unknown',
      },
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Admin patient detail (aggregates every sub-record)
// ─────────────────────────────────────────────────────────────
export const getPatientDetail = async (patientId: string) => {
  const patient = await Patient.findById(patientId).populate('registeredBy', 'name');

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
    PatientProgressNote.find({ patientId }).sort({ createdAt: -1 }).limit(20),
    DischargeSummary.findOne({ patientId }).sort({ createdAt: -1 }),
  ]);

  return {
    // ── Identity ──
    id: patient._id.toString(),
    patientDisplayId: patient.patientDisplayId,
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

    // ── Clinical ──
    primaryDiagnosis: patient.primaryDiagnosis,
    secondaryDiagnoses: patient.secondaryDiagnoses,
    diseaseStage: patient.diseaseStage,
    comorbidities: patient.comorbidities,
    estimatedPrognosis: patient.estimatedPrognosis,
    status: patient.status,
    currentLocation: patient.currentLocation,

    // ── Registrant ──
    registeredBy: {
      id: (patient.registeredBy as any)?._id?.toString() || '',
      name: (patient.registeredBy as any)?.name || 'Unknown',
    },

    // ── Sub-records ──
    visits: visits.map((v) => ({
      id: v._id.toString(),
      visitDate: v.visitDate,
      visitType: v.visitType,
      overallStatus: v.overallStatus,
      outcome: v.outcome,
      ppsScore: v.ppsScore,
      kpsScore: v.kpsScore,
      staff: (v.teamLeaderId as any)?.name || 'Unknown',
    })),

    medications: medications.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route,
      administeredAt: m.administeredAt,
      status: m.status,
      createdAt: m.createdAt,
    })),

    labTests: labTests.map((l) => ({
      id: l._id.toString(),
      name: l.testName,
      dateOrdered: l.dateOrdered,
      datePerformed: l.datePerformed,
      result: l.result,
      status: l.status,
      location: l.location,
    })),

    imagingOrders: imagingOrders.map((o) => ({
      id: o._id.toString(),
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      laterality: o.laterality,
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
      soapSubjective: n.soapSubjective,
      createdAt: n.createdAt,
    })),

    referrals: referrals.map((r) => ({
      id: r._id.toString(),
      date: r.createdAt,
      referralType: r.referralType,
      status: r.status,
      receivingFacility: r.receivingFacility,
    })),

    admissions: admissions.map((a) => ({
      id: a._id.toString(),
      date: a.admissionDate,
      dischargeDate: a.dischargeDate,
      ward: a.ward,
      bedNumber: a.bedNumber,
      admittingPhysician: a.admittingPhysician,
      status: a.status,
      dischargeReason: a.dischargeReason,
    })),

    dischargeSummary: dischargeSummary
      ? {
          id: dischargeSummary._id.toString(),
          admissionId: dischargeSummary.admissionId?.toString(),
          dateOfDischarge: dischargeSummary.dateOfDischarge,
          timeOfDischarge: dischargeSummary.timeOfDischarge,
          dischargeType: dischargeSummary.dischargeType,
          overallCondition: dischargeSummary.overallCondition,
          dischargedTo: dischargeSummary.dischargedTo,
          status: dischargeSummary.status,
          createdAt: dischargeSummary.createdAt,
        }
      : null,

    // ── Meta ──
    createdAt: patient.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Close case (legacy path — used when admin closes without the
// full discharge form being filled out)
// ─────────────────────────────────────────────────────────────
export const closeCase = async (
  patientId: string,
  reason: string,
  _adminId: string
) => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (patient.status === 'Discharged') {
    throw new ApiError(400, 'Patient case is already closed');
  }

  patient.status = 'Discharged';
  await patient.save();

  await Notification.create({
    type: 'CloseCase',
    message: `Patient case closed: ${patient.firstName} ${patient.lastName}`,
    data: {
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      reason,
    },
    read: false,
  });

  return {
    id: patient._id.toString(),
    status: patient.status,
    closeReason: reason,
    closeDate: new Date(),
  };
};

// ═════════════════════════════════════════════════════════════
// REFERRAL MANAGEMENT
// ═════════════════════════════════════════════════════════════

export const getPendingReferrals = async () => {
  const referrals = await Referral.find({ status: 'Pending' }).populate(
    'patientId',
    'firstName lastName patientDisplayId'
  );

  return referrals.map((r) => {
    const p = r.patientId as any;
    return {
      id: r._id.toString(),
      patientId: p?._id?.toString() || '',
      patientName: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
      patientDisplayId: p?.patientDisplayId,
      referralType: r.referralType,
      referralDate: r.referralDate,
      primaryDiagnosis: r.primaryDiagnosis,
      diseaseStage: r.diseaseStage,
      ppsScore: r.ppsScore,
      kpsScore: r.kpsScore,
      currentSymptoms: r.currentSymptoms,
      reasons: r.reasons,
      referringFacility: r.referringFacility,
      receivingFacility: r.receivingFacility,
      contactPerson: r.contactPerson,
      contactNumber: r.contactNumber,
      status: r.status,
      createdAt: r.createdAt,
    };
  });
};

export const approveReferral = async (referralId: string, adminId: string) => {
  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new ApiError(404, 'Referral not found');
  }

  if (referral.status !== 'Pending') {
    throw new ApiError(400, 'Referral has already been processed');
  }

  referral.status = 'Accepted';
  referral.approvedBy = adminId as any;
  await referral.save();

  await Patient.findByIdAndUpdate(referral.patientId, {
    currentLocation: 'ReferredHospital',
  });

  const patient = await Patient.findById(referral.patientId);
  await Notification.create({
    type: 'ReferralApproval',
    message: `Referral approved for ${patient?.firstName} ${patient?.lastName}`,
    data: {
      referralId: referral._id,
      patientId: referral.patientId,
      patientName: `${patient?.firstName} ${patient?.lastName}`,
    },
    read: false,
  });

  return {
    id: referral._id.toString(),
    status: referral.status,
    approvedBy: {
      id: adminId,
      name: 'Admin',
    },
    updatedAt: referral.updatedAt,
  };
};

export const declineReferral = async (referralId: string) => {
  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new ApiError(404, 'Referral not found');
  }

  if (referral.status !== 'Pending') {
    throw new ApiError(400, 'Referral has already been processed');
  }

  referral.status = 'Declined';
  await referral.save();

  return {
    id: referral._id.toString(),
    status: referral.status,
  };
};

// ═════════════════════════════════════════════════════════════
// REPORTS
// ═════════════════════════════════════════════════════════════

export const getReports = async (startDate?: string, endDate?: string) => {
  const dateFilter: any = {};

  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: any = {};
  if (Object.keys(dateFilter).length > 0) {
    filter.createdAt = dateFilter;
  }

  const [totalPatients, activePatients, dischargedPatients, hospitalizedPatients] =
    await Promise.all([
      Patient.countDocuments(filter),
      Patient.countDocuments({ ...filter, status: 'Active' }),
      Patient.countDocuments({ ...filter, status: 'Discharged' }),
      Patient.countDocuments({ ...filter, currentLocation: 'ReferredHospital' }),
    ]);

  const referralsByStatus = await Referral.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const patientsByLocation = await Patient.aggregate([
    { $match: filter },
    { $group: { _id: '$currentLocation', count: { $sum: 1 } } },
    { $project: { location: '$_id', count: 1, _id: 0 } },
  ]);

  const patientsByStage = await Patient.aggregate([
    { $match: filter },
    { $group: { _id: '$diseaseStage', count: { $sum: 1 } } },
    { $project: { stage: '$_id', count: 1, _id: 0 } },
  ]);

  const closeCasesByReason = await Notification.aggregate([
    { $match: { ...filter, type: 'CloseCase' } },
    { $group: { _id: '$data.reason', count: { $sum: 1 } } },
    { $project: { reason: '$_id', count: 1, _id: 0 } },
  ]);

  const visitsByMonth = await HomeVisit.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$visitDate' } },
        count: { $sum: 1 },
      },
    },
    { $project: { month: '$_id', count: 1, _id: 0 } },
    { $sort: { month: 1 } },
  ]);

  // NEW — imaging and progress-note counts (useful for the Reports page)
  const imagingByModality = await ImagingOrder.aggregate([
    { $match: filter },
    { $group: { _id: '$modality', count: { $sum: 1 } } },
    { $project: { modality: '$_id', count: 1, _id: 0 } },
  ]);

  const imagingByStatus = await ImagingOrder.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const progressNotesByCondition = await PatientProgressNote.aggregate([
    { $match: filter },
    { $group: { _id: '$generalCondition', count: { $sum: 1 } } },
    { $project: { condition: '$_id', count: 1, _id: 0 } },
  ]);

  const dischargesByType = await DischargeSummary.aggregate([
    { $match: filter },
    { $group: { _id: '$dischargeType', count: { $sum: 1 } } },
    { $project: { dischargeType: '$_id', count: 1, _id: 0 } },
  ]);

  return {
    totalPatients,
    activePatients,
    dischargedPatients,
    hospitalizedPatients,
    referralsByStatus,
    patientsByLocation,
    patientsByStage,
    closeCasesByReason,
    visitsByMonth,
    imagingByModality,       // NEW
    imagingByStatus,         // NEW
    progressNotesByCondition, // NEW
    dischargesByType,        // NEW
  };
};

// ═════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════

export default {
  getPendingStaff,
  approveStaff,
  rejectStaff, 
  getDashboardStats, 
  getNotifications,
  markNotificationRead, 
  getPatients,
  getPatientDetail,
  closeCase, 
  getPendingReferrals,
  approveReferral,
  declineReferral, 
  getReports,
};