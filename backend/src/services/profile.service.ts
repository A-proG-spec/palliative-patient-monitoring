import bcrypt from 'bcrypt';
import { Staff } from '@models/Staff.js';
import { Admin } from '@models/Admin.js';
import { HomeVisit } from '@models/HomeVisit.js';
import { Patient } from '@models/Patient.js';
import { Referral } from '@models/Referral.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { ApiError } from '@utils/ApiError.js';
import { hashPassword } from '@utils/password.js';

// ═════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════

/**
 * Look up the current user as either a Staff member or an Admin.
 * Returns a discriminated union so callers can branch cleanly.
 * Never returns the password field.
 */
type UserLookup =
  | { type: 'staff'; doc: any }
  | { type: 'admin'; doc: any };

const findCurrentUser = async (userId: string): Promise<UserLookup> => {
  const staff = await Staff.findById(userId).select('-password');
  if (staff) return { type: 'staff', doc: staff };

  const admin = await Admin.findById(userId).select('-password');
  if (admin) return { type: 'admin', doc: admin };

  throw new ApiError(404, 'User not found');
};

/**
 * Same lookup but keeps the password field — needed for changePassword.
 */
const findCurrentUserWithPassword = async (
  userId: string,
): Promise<UserLookup> => {
  const staff = await Staff.findById(userId);
  if (staff) return { type: 'staff', doc: staff };

  const admin = await Admin.findById(userId);
  if (admin) return { type: 'admin', doc: admin };

  throw new ApiError(404, 'User not found');
};

// ═════════════════════════════════════════════════════════════
// 1. Get profile
// ═════════════════════════════════════════════════════════════

export const getProfile = async (userId: string, _userType: string) => {
  const { type, doc } = await findCurrentUser(userId);

  if (type === 'staff') {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      type: 'staff' as const,
      status: doc.status,
      isEmailVerified: doc.isEmailVerified,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // admin
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    type: 'admin' as const,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// 2. Update profile
// ═════════════════════════════════════════════════════════════
// Only `name` (both) and `phone` (staff only) are editable.
// Email, role, status, isEmailVerified are never client-editable.
// ═════════════════════════════════════════════════════════════

export const updateProfile = async (
  userId: string,
  _userType: string,
  data: { name?: string; phone?: string },
) => {
  const { type, doc } = await findCurrentUserWithPassword(userId);

  // ── Validate at least one editable field was sent ──
  const hasName = typeof data.name === 'string' && data.name.trim().length > 0;
  const hasPhone = typeof data.phone === 'string' && data.phone.trim().length > 0;

  if (!hasName && !hasPhone) {
    throw new ApiError(400, 'No updatable fields provided');
  }

  // ── Apply edits ──
  if (hasName) doc.name = data.name!.trim();

  if (hasPhone) {
    if (type !== 'staff') {
      throw new ApiError(400, 'Admins cannot set a phone number');
    }
    doc.phone = data.phone!.trim();
  }

  await doc.save();

  // Return the same shape as getProfile
  return getProfile(userId, _userType);
};

// ═════════════════════════════════════════════════════════════
// 3. Change password
// ═════════════════════════════════════════════════════════════
// Verify currentPassword with bcrypt, hash newPassword, persist.
// JWTs are stateless and remain valid until expiry (no forced logout).
// ═════════════════════════════════════════════════════════════

export const changePassword = async (
  userId: string,
  _userType: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  const { doc } = await findCurrentUserWithPassword(userId);

  const passwordOk = await bcrypt.compare(currentPassword, doc.password);
  if (!passwordOk) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      'New password must be different from the current password',
    );
  }

  doc.password = await hashPassword(newPassword);
  await doc.save();

  return {
    id: doc._id.toString(),
    updatedAt: doc.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// 4. Activity stats
// ═════════════════════════════════════════════════════════════
// Staff → their own activity (scoped by teamLeaderId on HomeVisit,
//         and by "patients they have visited" for patient counts).
// Admin → system-wide counts (same shape the admin dashboard uses).
// ═════════════════════════════════════════════════════════════

export const getActivityStats = async (
  userId: string,
  _userType: string,
) => {
  const { type, doc } = await findCurrentUser(userId);

  if (type === 'staff') {
    const staffId = doc._id.toString();

    // All patients this staff member has visited at least once
    const visitedPatientIds = await HomeVisit.distinct('patientId', {
      teamLeaderId: staffId,
    });

    const [
      totalVisits,
      totalPatients,
      activePatients,
      todayVisits,
    ] = await Promise.all([
      HomeVisit.countDocuments({ teamLeaderId: staffId }),
      visitedPatientIds.length,
      Patient.countDocuments({
        _id: { $in: visitedPatientIds },
        status: 'Active',
      }),
      HomeVisit.countDocuments({
        teamLeaderId: staffId,
        visitDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      }),
    ]);

    return {
      totalVisits,
      totalPatients,
      activePatients,
      todayVisits,
      lastLogin: new Date().toISOString(),
      memberSince: doc.createdAt,
    };
  }

  // admin
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

  // Referenced but not returned — kept here for symmetry if you ever
  // want to add "recent admissions" to the admin activity panel.
  void HospitalAdmission;

  return {
    totalPatients,
    activePatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
    lastLogin: new Date().toISOString(),
    memberSince: doc.createdAt,
  };
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  getActivityStats,
};