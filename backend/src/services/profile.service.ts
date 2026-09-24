import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { hashPassword } from '@utils/password.js';
import { toId } from '@utils/prisma.js';



const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ═════════════════════════════════════════════════════════════
// Lookup
// ═════════════════════════════════════════════════════════════
type UserLookup =
  | { type: 'staff'; doc: any }
  | { type: 'admin'; doc: any };

const findUser = async (
  userId: string | number,
  withPassword = false,
): Promise<UserLookup> => {
  const id = toId(userId, 'user id');

  const staff = await prisma.staff.findUnique({ where: { id } });
  if (staff) {
    if (!withPassword) {
      const { password, ...rest } = staff;
      return { type: 'staff', doc: rest };
    }
    return { type: 'staff', doc: staff };
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (admin) {
    if (!withPassword) {
      const { password, ...rest } = admin;
      return { type: 'admin', doc: rest };
    }
    return { type: 'admin', doc: admin };
  }

  throw new ApiError(404, 'User not found');
};

// ═════════════════════════════════════════════════════════════
// Get profile
// ═════════════════════════════════════════════════════════════
export const getProfile = async (
  userId: string | number,
  _userType: string,
) => {
  const { type, doc } = await findUser(userId);

  if (type === 'staff') {
    return {
      id: doc.id,
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

  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    type: 'admin' as const,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Update profile
// ═════════════════════════════════════════════════════════════
export const updateProfile = async (
  userId: string | number,
  _userType: string,
  data: { name?: string; phone?: string },
) => {
  const { type, doc } = await findUser(userId, true);

  const hasName = typeof data.name === 'string' && data.name.trim().length > 0;
  const hasPhone = typeof data.phone === 'string' && data.phone.trim().length > 0;

  if (!hasName && !hasPhone) {
    throw new ApiError(400, 'No updatable fields provided');
  }

  const updateData: any = {};
  if (hasName) updateData.name = data.name!.trim();
  if (hasPhone) {
    if (type !== 'staff') throw new ApiError(400, 'Admins cannot set a phone number');
    updateData.phone = data.phone!.trim();
  }

  if (type === 'staff') {
    await prisma.staff.update({ where: { id: doc.id }, data: updateData });
  } else {
    await prisma.admin.update({ where: { id: doc.id }, data: updateData });
  }

  return getProfile(userId, _userType);
};

// ═════════════════════════════════════════════════════════════
// Change password
// ═════════════════════════════════════════════════════════════
export const changePassword = async (
  userId: string | number,
  _userType: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  const { type, doc } = await findUser(userId, true);

  const ok = await bcrypt.compare(currentPassword, doc.password);
  if (!ok) throw new ApiError(401, 'Current password is incorrect');

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from the current password');
  }

  const hashed = await hashPassword(newPassword);

  if (type === 'staff') {
    await prisma.staff.update({ where: { id: doc.id }, data: { password: hashed } });
  } else {
    await prisma.admin.update({ where: { id: doc.id }, data: { password: hashed } });
  }

  return { id: doc.id, updatedAt: new Date() };
};

// ═════════════════════════════════════════════════════════════
// Activity stats
// ═════════════════════════════════════════════════════════════
export const getActivityStats = async (
  userId: string | number,
  _userType: string,
) => {
  const { type, doc } = await findUser(userId);

  if (type === 'staff') {
    const staffId = doc.id;

    const visitFilter = {
      OR: [
        { createdBy: staffId },
        { signatures: { some: { staffId } } },
      ],
    };

    const visitsByStaff = await prisma.homeVisit.findMany({
      where: visitFilter,
      select: { patientId: true },
    });
    const visitedPatientIds = [...new Set(visitsByStaff.map((v) => v.patientId))];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalVisits, activePatients, todayVisits] = await Promise.all([
      prisma.homeVisit.count({ where: visitFilter }),
      prisma.patient.count({
        where: { id: { in: visitedPatientIds }, status: 'Active' },
      }),
      prisma.homeVisit.count({
        where: { ...visitFilter, visitDate: { gte: today, lt: tomorrow } },
      }),
    ]);

    return {
      totalVisits,
      totalPatients: visitedPatientIds.length,
      activePatients,
      todayVisits,
      lastLogin: new Date().toISOString(),
      memberSince: doc.createdAt,
    };
  }

  // Admin
  const [
    totalPatients,
    activePatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { status: 'Active' } }),
    prisma.patient.count({ where: { status: 'Discharged' } }),
    prisma.referral.count({ where: { status: 'Pending' } }),
    prisma.staff.count({ where: { status: 'Pending', isEmailVerified: true } }),
  ]);

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