import bcrypt from 'bcrypt';
import { HomeVisit } from '@models/HomeVisit.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Record visit — auto-signs the team leader
// ─────────────────────────────────────────────────────────────
export const recordVisit = async (
  patientId: string,
  data: any,
  staffId: string,
) => {
  const [patient, teamLeader] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!teamLeader) throw new ApiError(404, 'Team leader not found');

  const memberIds = (data.teamMembers || [])
    .map((m: any) => m.staffId)
    .filter(Boolean);

  if (memberIds.length > 0) {
    const foundStaff = await Staff.countDocuments({ _id: { $in: memberIds } });
    if (foundStaff !== memberIds.length) {
      throw new ApiError(400, 'One or more team members not found');
    }
  }

  const visit = await HomeVisit.create({
    patientId,
    ...data,
    teamLeaderId: teamLeader._id,
    signatures: [
      {
        staffId: teamLeader._id,
        name: teamLeader.name,
        role: 'TeamLeader',
        signedAt: new Date(),
      },
    ],
    createdBy: staffId,
  });

  return {
    id: visit._id.toString(),
    patientId: visit.patientId.toString(),
    visitDate: visit.visitDate,
    outcome: visit.outcome,
    teamLeaderId: visit.teamLeaderId.toString(),
    signatures: formatSignatures(visit.signatures),
    createdAt: visit.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List visits for a patient
// ─────────────────────────────────────────────────────────────
export const getVisits = async (
  patientId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    HomeVisit.find({ patientId })
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),
    HomeVisit.countDocuments({ patientId }),
  ]);

  return {
    items: items.map((visit) => ({
      id: visit._id.toString(),
      visitDate: visit.visitDate,
      visitType: visit.visitType,
      overallStatus: visit.overallStatus,
      outcome: visit.outcome,
      ppsScore: visit.ppsScore,
      kpsScore: visit.kpsScore,
      teamMembers: visit.teamMembers,
      teamLeaderId: visit.teamLeaderId.toString(),
      signatures: formatSignatures(visit.signatures),
      allSigned: isAllSigned(visit.signatures),
      createdAt: visit.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one visit
// ─────────────────────────────────────────────────────────────
export const getVisitById = async (patientId: string, visitId: string) => {
  const visit = await HomeVisit
    .findOne({ _id: visitId, patientId })
    .populate('createdBy', 'name role');

  if (!visit) throw new ApiError(404, 'Visit not found');

  return {
    id: visit._id.toString(),
    patientId: visit.patientId.toString(),
    ...visit.toObject(),
    teamLeaderId: visit.teamLeaderId.toString(),
    signatures: formatSignatures(visit.signatures),
    allSigned: isAllSigned(visit.signatures),
    createdBy: visit.createdBy
      ? {
          id: (visit.createdBy as any)._id.toString(),
          name: (visit.createdBy as any).name,
          role: (visit.createdBy as any).role,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────────────
// Sign visit — verifies email + password (bcrypt) and role
// ─────────────────────────────────────────────────────────────
export const signVisit = async (
  visitId: string,
  data: { email: string; password: string; role: 'TeamLeader' | 'Physician' | 'Nurse' },
  _currentUserId: string,
) => {
  const visit = await HomeVisit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');

  const email = data.email.toLowerCase().trim();
  const staff = await Staff.findOne({ email });
  if (!staff) throw new ApiError(401, 'Invalid credentials');

  if (staff.status !== 'Active') {
    throw new ApiError(403, 'Staff account is not active');
  }
  if (!staff.isEmailVerified) {
    throw new ApiError(403, 'Staff email is not verified');
  }

  const passwordOk = await bcrypt.compare(data.password, staff.password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');

  if (staff.role !== data.role) {
    throw new ApiError(403, `You are not registered as a ${data.role}`);
  }

  if (data.role === 'TeamLeader') {
    throw new ApiError(400, 'The team leader is auto-signed and does not need to sign');
  }

  const alreadySigned = visit.signatures.some(
    (s) => s.staffId.toString() === staff._id.toString(),
  );
  if (alreadySigned) {
    throw new ApiError(400, 'You have already signed this visit');
  }

  visit.signatures.push({
    staffId: staff._id,
    name: staff.name,
    role: data.role,
    signedAt: new Date(),
  });

  await visit.save();

  return {
    id: visit._id.toString(),
    signedBy: {
      staffId: staff._id.toString(),
      name: staff.name,
      role: data.role,
      signedAt: visit.signatures[visit.signatures.length - 1].signedAt,
    },
    signatures: formatSignatures(visit.signatures),
    allSigned: isAllSigned(visit.signatures),
  };
};

// ─────────────────────────────────────────────────────────────
// Get current signature status for a visit
// ─────────────────────────────────────────────────────────────
export const getVisitSignatures = async (visitId: string) => {
  const visit = await HomeVisit
    .findById(visitId)
    .populate('teamLeaderId', 'name role');

  if (!visit) throw new ApiError(404, 'Visit not found');

  const teamLeader = visit.teamLeaderId as any;

  return {
    visitId: visit._id.toString(),
    visitDate: visit.visitDate,
    teamLeader: teamLeader
      ? {
          staffId: teamLeader._id.toString(),
          name: teamLeader.name,
          role: 'TeamLeader',
        }
      : null,
    signatures: formatSignatures(visit.signatures),
    allSigned: isAllSigned(visit.signatures),
    totalSignatures: visit.signatures.length,
  };
};

// ─────────────────────────────────────────────────────────────
// Update visit — admin only, records who made the change
// ─────────────────────────────────────────────────────────────
export const updateVisit = async (
  visitId: string,
  data: any,
  adminId: string,
) => {
  const visit = await HomeVisit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');

  const allowed = [
    'visitDate',
    'timeStarted',
    'timeEnded',
    'overallStatus',
    'painScore',
    'ppsScore',
    'kpsScore',
    'outcome',
  ];

  const changes: any[] = [];
  for (const key of allowed) {
    if (data[key] !== undefined && visit.get(key) !== data[key]) {
      changes.push({ field: key, from: visit.get(key), to: data[key] });
      visit.set(key, data[key]);
    }
  }

  visit.updatedBy = adminId as any;   // ← audit
  await visit.save();

  return {
    id: visit._id.toString(),
    updatedAt: visit.updatedAt,
    changes,
  };
};

// ─────────────────────────────────────────────────────────────
// Soft delete visit (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteVisit = async (
  visitId: string,
  adminId: string,
  reason?: string,
) => {
  const visit = await HomeVisit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');

  if (visit.deletedAt) {
    throw new ApiError(400, 'Visit is already deleted');
  }

  visit.deletedAt = new Date();
  visit.deletedBy = adminId as any;
  visit.deletionReason = reason;
  visit.updatedBy = adminId as any;
  await visit.save();

  return { id: visitId, success: true, deletedAt: visit.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore a soft-deleted visit (admin only)
// ─────────────────────────────────────────────────────────────
export const restoreVisit = async (visitId: string, adminId: string) => {
  const visit = await HomeVisit
    .findById(visitId)
    .setOptions({ includeDeleted: true });

  if (!visit) throw new ApiError(404, 'Visit not found');
  if (!visit.deletedAt) {
    throw new ApiError(400, 'Visit is not deleted');
  }

  visit.deletedAt = null;
  visit.deletedBy = null as any;
  visit.deletionReason = undefined;
  visit.updatedBy = adminId as any;
  await visit.save();

  return { id: visitId, restored: true };
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const formatSignatures = (signatures: any[]) =>
  (signatures || []).map((s) => ({
    staffId: s.staffId.toString(),
    name: s.name,
    role: s.role,
    signedAt: s.signedAt,
  }));

const isAllSigned = (signatures: any[]): boolean => {
  const roles = new Set((signatures || []).map((s) => s.role));
  roles.add('TeamLeader');
  return roles.has('TeamLeader') && roles.has('Physician') && roles.has('Nurse');
};

export default {
  recordVisit,
  getVisits,
  getVisitById,
  signVisit,
  getVisitSignatures,
  updateVisit,
  deleteVisit,
  restoreVisit,
};